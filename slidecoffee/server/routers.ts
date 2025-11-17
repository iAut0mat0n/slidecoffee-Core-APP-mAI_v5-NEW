import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as aiService from "./services/aiService";
import * as exportService from "./services/exportService";
import * as aiSuggestions from "./services/aiSuggestions";
import * as brandAnalysis from "./services/brandAnalysis";
import * as templateExtraction from "./services/templateExtraction";
import { sanitizeInput, sanitizeBrandData, sanitizeProjectData, sanitizeChatMessage } from "./security/sanitize";
import { checkRateLimit } from "./security/rateLimit";
import { hasEnoughCredits, deductCredits, estimateCredits } from "./lib/credits";
import { sanitizeForAI } from "./lib/pii";
import { encrypt } from "./lib/encryption";
import { piiTokens } from "../drizzle/schema";
import { activityRouter } from "./routers/activityRouter";
import { tierRouter } from "./routers/tierRouter";
import { supportRouter } from "./routers/supportRouter";
import { brandFileRouter } from "./routers/brandFileRouter";
import { adminRouter } from "./routers/adminRouter";
import { notificationRouter } from "./routers/notificationRouter";
import { presentationStyleRouter } from "./routers/presentationStyleRouter";
import { versionHistoryRouter } from "./routers/versionHistoryRouter";
import { streamingChatRouter } from "./routers/streamingChatRouter";
import { aiAgentRouter } from "./routers/aiAgentRouter";
import { templatesRouter } from "./routers/templatesRouter";
import { autoTopupRouter } from "./routers/autoTopupRouter";
import { workspaceMembersRouter } from "./routers/workspaceMembersRouter";
import { mfaRouter } from "./routers/mfaRouter";
import { aiSuggestionsRouter } from "./routers/aiSuggestionsRouter";
import { imageGenerationRouter } from "./routers/imageGenerationRouter";
import { voiceTranscriptionRouter } from "./routers/voiceTranscriptionRouter";
import { systemSettingsRouter } from "./routers/systemSettingsRouter";
import { aiMetricsRouter } from "./routers/aiMetricsRouter";
import { chatRouter } from "./routers/chatRouter";

export const appRouter = router({
  system: systemRouter,
  mfa: mfaRouter,
  chat: chatRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    // Logout is handled by Supabase client-side
    logout: publicProcedure.mutation(() => {
      return {
        success: true,
      } as const;
    }),
  }),
  
  profile: router({
    updateName: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(255) }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserProfile(ctx.user.id, { name: input.name });
        return { success: true };
      }),
  }),

  dashboard: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        workspaceId: z.number(),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify workspace ownership
        const workspace = await db.getWorkspace(input.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }

        // Fetch user context for AI
        const recentProjects = await db.getRecentProjects(workspace.id, 5);
        const userBrands = await db.getWorkspaceBrands(workspace.id);
        
        const result = await aiService.handleDashboardCommand({
          message: input.message,
          conversationHistory: input.conversationHistory || [],
          userContext: {
            userName: ctx.user.name || undefined,
            recentProjects: recentProjects.map((p: any) => ({
              id: p.id,
              title: p.title,
              updatedAt: p.updatedAt
            })),
            brands: userBrands.map((b: any) => ({
              id: b.id,
              name: b.name
            }))
          }
        });
        
        return result;
      }),
  }),

  workspaces: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserWorkspaces(ctx.user.id);
    }),
    
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
      let workspaces = await db.getUserWorkspaces(ctx.user.id);
      
      // If user has no workspaces, create a default one
      if (workspaces.length === 0) {
        console.log(`[Workspace] User ${ctx.user.id} has no workspace, creating default...`);
        try {
          await db.ensureDefaultWorkspace(ctx.user.id);
          workspaces = await db.getUserWorkspaces(ctx.user.id);
        } catch (error) {
          console.error("[Workspace] Failed to create default workspace:", error);
          return null;
        }
      }
      
      // Return the default workspace or the first one
      const defaultWorkspace = workspaces.find(w => w.isDefault) || workspaces[0];
      if (!defaultWorkspace) {
        return null;
      }
      // Add member count (for now just 1, will be updated when team features are fully implemented)
      return {
        ...defaultWorkspace,
        memberCount: 1,
      };
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const workspace = await db.getWorkspace(input.id);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }
        return workspace;
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Sanitize input
          const sanitized = {
            name: sanitizeInput(input.name),
            description: input.description ? sanitizeInput(input.description) : undefined,
          };
          
          console.log('[Workspace] Creating workspace:', { userId: ctx.user.id, name: sanitized.name });
          
          const id = await db.createWorkspace({
            ownerId: ctx.user.id,
            name: sanitized.name,
            description: sanitized.description,
            isDefault: false,
          });
          
          console.log('[Workspace] Created successfully:', id);
          return { id };
        } catch (error) {
          console.error('[Workspace] Failed to create:', error);
          throw new Error(`Failed to create workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership
        const workspace = await db.getWorkspace(input.id);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }
        
        const sanitized = {
          name: sanitizeInput(input.name),
          description: input.description ? sanitizeInput(input.description) : undefined,
        };
        
        await db.updateWorkspace(input.id, sanitized);
        return { success: true };
      }),
    
    setDefault: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership
        const workspace = await db.getWorkspace(input.id);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }
        
        await db.setDefaultWorkspace(ctx.user.id, input.id);
        return { success: true };
      }),
  }),

  brands: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verify workspace ownership
        const workspace = await db.getWorkspace(input.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }
        return db.getWorkspaceBrands(input.workspaceId);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const brand = await db.getBrand(input.id);
        if (!brand) {
          throw new Error("Brand not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(brand.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        return brand;
      }),
    
    create: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        name: z.string().min(1).max(255),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        fontPrimary: z.string().optional(),
        fontSecondary: z.string().optional(),
        guidelinesText: z.string().optional(),
        templateFileUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Rate limiting
        const rateCheck = checkRateLimit(ctx.user.openId, 'brandCreation');
        if (!rateCheck.allowed) {
          throw new Error(`Rate limit exceeded. Please try again in ${rateCheck.resetIn} seconds.`);
        }
        
        // Verify workspace ownership
        const workspace = await db.getWorkspace(input.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }
        
        // Check brand limit based on subscription tier
        const existingBrands = await db.getWorkspaceBrands(input.workspaceId);
        const user = await db.getUser(ctx.user.openId);
        const tier = user?.subscriptionTier || 'starter';
        
        const limits = {
          starter: 1,
          pro: 3,
          pro_plus: 10,
          team: 10,
          business: 25,
          enterprise: -1, // unlimited
        };
        
        if (limits[tier] !== -1 && existingBrands.length >= limits[tier]) {
          throw new Error(`Brand limit reached for ${tier} tier. Please upgrade your subscription.`);
        }
        
        // Check credits (5 credits for brand creation)
        const hasCredits = await hasEnoughCredits(ctx.user.id, 5);
        if (!hasCredits) {
          throw new Error("Insufficient credits. Please upgrade your plan to create brands.");
        }

        // Sanitize brand data (XSS protection)
        const sanitized = sanitizeBrandData({
          name: input.name,
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
          accentColor: input.accentColor,
          primaryFont: input.fontPrimary,
          secondaryFont: input.fontSecondary,
          brandGuidelines: input.guidelinesText,
          logoUrl: input.logoUrl,
        });
        
        // PII sanitization (privacy protection)
        const namePII = sanitizeForAI(sanitized.name || input.name);
        const guidelinesPII = input.guidelinesText ? sanitizeForAI(input.guidelinesText) : { safe: undefined, tokens: [] };
        
        // Store PII tokens if any were found
        if (namePII.tokens.length > 0 || guidelinesPII.tokens.length > 0) {
          const allTokens = [...namePII.tokens, ...guidelinesPII.tokens];
          for (const piiToken of allTokens) {
            await db.getDb().then(db => db?.insert(piiTokens).values({
              token: piiToken.token,
              tokenType: piiToken.type,
              originalValue: piiToken.encryptedValue, // Already encrypted by anonymizeText
              presentationId: undefined,
            }));
          }
        }
        
        const id = await db.createBrand({
          ...input,
          name: namePII.safe,
          primaryColor: sanitized.primaryColor,
          secondaryColor: sanitized.secondaryColor,
          accentColor: sanitized.accentColor,
          fontPrimary: sanitized.primaryFont,
          fontSecondary: sanitized.secondaryFont,
          guidelinesText: guidelinesPII.safe,
          logoUrl: sanitized.logoUrl,
          originalName: namePII.tokens.length > 0 ? input.name : undefined,
          originalGuidelinesText: guidelinesPII.tokens.length > 0 ? input.guidelinesText : undefined,
        });
        
        // Deduct credits after successful creation
        await deductCredits(ctx.user.id, 5, null, "Create brand");
        
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        fontPrimary: z.string().optional(),
        fontSecondary: z.string().optional(),
        guidelinesText: z.string().optional(),
        templateFileUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const brand = await db.getBrand(input.id);
        if (!brand) {
          throw new Error("Brand not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(brand.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        const { id, ...updateData } = input;
        await db.updateBrand(id, updateData);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const brand = await db.getBrand(input.id);
        if (!brand) {
          throw new Error("Brand not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(brand.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        await db.deleteBrand(input.id);
        return { success: true };
      }),
    
    // AI Brand Analysis
    analyzeDescription: protectedProcedure
      .input(z.object({
        brandName: z.string(),
        description: z.string(),
        industry: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await brandAnalysis.analyzeBrandDescription(
          input.brandName,
          input.description,
          input.industry
        );
        return result;
      }),
    
    chatBrand: protectedProcedure
      .input(z.object({
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
        userMessage: z.string(),
      }))
      .mutation(async ({ input }) => {
        const result = await brandAnalysis.conversationalBrandBuilding(
          input.conversationHistory,
          input.userMessage
        );
        return result;
      }),
  }),

  projects: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verify workspace ownership
        const workspace = await db.getWorkspace(input.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }
        return db.getWorkspaceProjects(input.workspaceId);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProject(input.id);
        if (!project) {
          throw new Error("Project not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        // Update lastViewedAt
        await db.updateProjectLastViewed(input.id);
        return project;
      }),
    
    recent: protectedProcedure
      .input(z.object({ workspaceId: z.number(), limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        // Verify workspace ownership
        const workspace = await db.getWorkspace(input.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }
        return db.getRecentProjects(input.workspaceId, input.limit || 5);
      }),
    
    create: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        brandId: z.number().optional(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify workspace ownership
        const workspace = await db.getWorkspace(input.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Workspace not found or access denied");
        }
        
        // Check credits (2 credits for project creation)
        const hasCredits = await hasEnoughCredits(ctx.user.id, 2);
        if (!hasCredits) {
          throw new Error("Insufficient credits. Please upgrade your plan to create projects.");
        }
        
        // PII sanitization (privacy protection)
        const titlePII = sanitizeForAI(input.title);
        const descriptionPII = input.description ? sanitizeForAI(input.description) : { safe: undefined, tokens: [] };
        
        // Store PII tokens if any were found
        if (titlePII.tokens.length > 0 || descriptionPII.tokens.length > 0) {
          const allTokens = [...titlePII.tokens, ...descriptionPII.tokens];
          for (const piiToken of allTokens) {
            await db.getDb().then(db => db?.insert(piiTokens).values({
              token: piiToken.token,
              tokenType: piiToken.type,
              originalValue: piiToken.encryptedValue,
              presentationId: undefined, // Will be updated after project creation
            }));
          }
        }
        
        const id = await db.createProject({
          ...input,
          title: titlePII.safe,
          description: descriptionPII.safe,
          originalTitle: titlePII.tokens.length > 0 ? input.title : undefined,
          originalDescription: descriptionPII.tokens.length > 0 ? input.description : undefined,
          status: 'draft',
        });
        
        // Deduct credits after successful creation
        await deductCredits(ctx.user.id, 2, id, "Create project");
        
        return { id };
      }),
    
    toggleFavorite: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProject(input.id);
        if (!project) {
          throw new Error("Project not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        // Toggle favorite status
        await db.toggleProjectFavorite(input.id);
        
        return { isFavorite: !project.isFavorite };
      }),
    
    duplicate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProject(input.id);
        if (!project) {
          throw new Error("Project not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        // Duplicate the project
        const newId = await db.duplicateProject(input.id, ctx.user.id);
        
        return { id: newId };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProject(input.id);
        if (!project) {
          throw new Error("Project not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        // Delete the project and all related data
        await db.deleteProject(input.id);
        
        return { success: true };
      }),
  }),

  folders: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verify workspace ownership
        const workspace = await db.getWorkspace(input.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        return db.getWorkspaceFolders(input.workspaceId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        name: z.string().min(1).max(255),
        color: z.string().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify workspace ownership
        const workspace = await db.getWorkspace(input.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        const id = await db.createFolder({
          workspaceId: input.workspaceId,
          name: sanitizeInput(input.name),
          color: input.color,
          icon: input.icon,
        });
        
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const folder = await db.getFolder(input.id);
        if (!folder) {
          throw new Error("Folder not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(folder.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        const { id, ...updateData } = input;
        if (updateData.name) {
          updateData.name = sanitizeInput(updateData.name);
        }
        
        await db.updateFolder(id, updateData);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const folder = await db.getFolder(input.id);
        if (!folder) {
          throw new Error("Folder not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(folder.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        await db.deleteFolder(input.id);
        return { success: true };
      }),
    
    moveProject: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        folderId: z.number().nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        // If moving to a folder, verify folder ownership
        if (input.folderId) {
          const folder = await db.getFolder(input.folderId);
          if (!folder || folder.workspaceId !== project.workspaceId) {
            throw new Error("Folder not found or access denied");
          }
        }
        
        await db.moveProjectToFolder(input.projectId, input.folderId);
        return { success: true };
      }),
  }),

  subscription: router({
    getCredits: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUser(ctx.user.openId);
      if (!user) {
        throw new Error("User not found");
      }
      return {
        balance: user.creditsRemaining,
        usedThisMonth: user.creditsUsedThisMonth,
        tier: user.subscriptionTier,
        billingCycleStart: user.billingCycleStart,
      };
    }),
    
    upgrade: protectedProcedure
      .input(z.object({
        tier: z.enum(["starter", "pro", "pro_plus", "team", "business", "enterprise"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // In production, integrate with Stripe here
        await db.updateUserSubscription(ctx.user.id, input.tier);
        return { success: true };
      }),
  }),

  // Note: chat router is imported from ./routers/chatRouter.ts (line 42)
  // The following endpoints are for project-specific chat functionality
  projectChat: router({
    getSlides: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        
        if (!project.slidesData) {
          return { slides: [] };
        }
        
        const slides = JSON.parse(project.slidesData as string) as aiService.Slide[];
        return { slides };
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        return db.getProjectChatMessages(input.projectId);
      }),

    getPlan: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        return db.getProjectPlan(input.projectId);
      }),

    approvePlan: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        await db.updatePlanStatus(input.projectId, "approved");
        return { success: true };
      }),

    rejectPlan: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }
        await db.updatePlanStatus(input.projectId, "rejected");
        return { success: true };
      }),

    send: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        content: z.string().min(1),
        role: z.enum(["user", "assistant", "system"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        // Verify workspace ownership
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }

        // Check credits before processing (estimate: 50 credits for plan generation)
        if (input.role === "user") {
          const hasCredits = await hasEnoughCredits(ctx.user.id, 50);
          if (!hasCredits) {
            throw new Error("Insufficient credits. Please upgrade your plan to continue.");
          }
        }

        // Sanitize PII from user message
        const { safe: sanitizedContent, tokens: piiTokens } = sanitizeForAI(input.content);
        const containedPII = piiTokens.length > 0;

        // Save user message (with sanitized content)
        await db.createChatMessage({
          projectId: input.projectId,
          role: input.role,
          content: sanitizedContent,
          originalContent: containedPII ? input.content : undefined,
        });
        
        // Only process AI if user message
        if (input.role !== "user") {
          return { success: true };
        }

        // Get brand guidelines if associated
        let brandGuidelines: aiService.BrandGuidelines | undefined;
        if (project.brandId) {
          const brandInfo = await db.getBrand(project.brandId);
          if (brandInfo) {
            brandGuidelines = {
              name: brandInfo.name,
              primaryColor: brandInfo.primaryColor || undefined,
              secondaryColor: brandInfo.secondaryColor || undefined,
              accentColor: brandInfo.accentColor || undefined,
              fontPrimary: brandInfo.fontPrimary || undefined,
              fontSecondary: brandInfo.fontSecondary || undefined,
              guidelinesText: brandInfo.guidelinesText || undefined,
            };
          }
        }

        try {
          // Check if plan exists
          const existingPlan = await db.getProjectPlan(input.projectId);
          
          if (!existingPlan) {
            // First message - generate presentation plan
            const plan = await aiService.generatePresentationPlan({
              userPrompt: sanitizedContent,
              projectTitle: project.title,
              projectDescription: project.description || undefined,
              brandGuidelines,
            });

            // Deduct credits for plan generation
            await deductCredits(ctx.user.id, 50, input.projectId, "Generate presentation plan");

            // Save plan to database
            await db.createPlan({
              projectId: input.projectId,
              planContent: JSON.stringify(plan),
              status: "pending",
            });

            // Format plan message
            const planMessage = `I've created a strategic plan for your presentation:\n\n**${plan.title}**\n\n**Objective:** ${plan.objective}\n**Target Audience:** ${plan.targetAudience}\n\n**Key Messages:**\n${plan.keyMessages.map((m, i) => `${i + 1}. ${m}`).join("\n")}\n\n**Slide Outline (${plan.estimatedSlideCount} slides):**${plan.slideOutline.map(s => `\n\n**Slide ${s.slideNumber}: ${s.title}**\n- Purpose: ${s.purpose}\n- Layout: ${s.layout}\n- Key Points: ${s.keyPoints.join(", ")}`).join("")}\n\nDoes this structure work for you? Click "Approve Plan" to generate the slides, or let me know what changes you'd like!`;
            
            await db.createChatMessage({
              projectId: input.projectId,
              role: "assistant",
              content: planMessage,
            });

            return { success: true, requiresApproval: true };
          } else if (existingPlan.status === "approved") {
            // Plan approved - check if slides exist
            if (!project.slidesData) {
              // Generate slides
              const plan = JSON.parse(existingPlan.planContent) as aiService.PresentationPlan;
              const slides = await aiService.generateSlides({ plan, brandGuidelines });
              
              // Deduct credits for slide generation (estimate: 30 credits per slide)
              const slideCredits = plan.estimatedSlideCount * 30;
              await deductCredits(ctx.user.id, slideCredits, input.projectId, `Generate ${plan.estimatedSlideCount} slides`);
              
              await db.updateProject(input.projectId, {
                slidesData: JSON.stringify(slides),
                status: "completed",
              });

              await db.createChatMessage({
                projectId: input.projectId,
                role: "assistant",
                content: `Great! I've generated ${slides.length} professional slides for your presentation. You can see them in the preview pane on the right. Feel free to ask me to make any changes!`,
              });

              return { success: true, slidesGenerated: true };
            } else {
              // Slides exist - user wants to edit
              const currentSlides = JSON.parse(project.slidesData as string) as aiService.Slide[];
              const updatedSlides = await aiService.editSlides({
                slides: currentSlides,
                userFeedback: sanitizedContent,
                brandGuidelines,
              });

              // Deduct credits for slide editing
              await deductCredits(ctx.user.id, 30, input.projectId, "Edit slides");

              await db.updateProject(input.projectId, {
                slidesData: JSON.stringify(updatedSlides),
              });

              await db.createChatMessage({
                projectId: input.projectId,
                role: "assistant",
                content: `I've updated the slides based on your feedback. Check out the changes in the preview!`,
              });

              return { success: true, slidesUpdated: true };
            }
          } else {
            // Plan pending or rejected
            await db.createChatMessage({
              projectId: input.projectId,
              role: "assistant",
              content: "Please review the plan above and either approve it or let me know what changes you'd like!",
            });

            return { success: true };
          }
        } catch (error) {
          await db.createChatMessage({
            projectId: input.projectId,
            role: "system",
            content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          });
          throw error;
        }
      }),
  }),

  export: router({
    toPowerPoint: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }

        if (!project.slidesData) {
          throw new Error("No slides to export");
        }

        const slides = JSON.parse(project.slidesData as string) as aiService.Slide[];
        
        // Get brand colors if available
        let brandColors;
        if (project.brandId) {
          const brand = await db.getBrand(project.brandId);
          if (brand) {
            brandColors = {
              primary: brand.primaryColor || undefined,
              secondary: brand.secondaryColor || undefined,
              accent: brand.accentColor || undefined,
            };
          }
        }

        const pptxBuffer = await exportService.exportToPowerPoint({
          slides,
          title: project.title,
          brandColors,
        });

        // Return base64 encoded file
        return {
          filename: `${project.title.replace(/[^a-z0-9]/gi, '_')}.pptx`,
          data: pptxBuffer.toString('base64'),
        };
      }),
    
    toPDF: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Rate limiting
        const rateCheck = checkRateLimit(ctx.user.openId, 'export');
        if (!rateCheck.allowed) {
          throw new Error(`Rate limit exceeded. Please try again in ${rateCheck.resetIn} seconds.`);
        }
        
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }

        if (!project.slidesData) {
          throw new Error("No slides to export");
        }

        const slides = JSON.parse(project.slidesData as string) as aiService.Slide[];
        
        // Get brand colors if available
        let brandColors;
        if (project.brandId) {
          const brand = await db.getBrand(project.brandId);
          if (brand) {
            brandColors = {
              primary: brand.primaryColor || undefined,
              secondary: brand.secondaryColor || undefined,
              accent: brand.accentColor || undefined,
            };
          }
        }

        const pdfBuffer = await exportService.exportToPDF({
          slides,
          title: project.title,
          brandColors,
        });

        // Return base64 encoded file
        return {
          filename: `${project.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          data: pdfBuffer.toString('base64'),
        };
      }),
    
    getSuggestions: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProject(input.projectId);
        if (!project) {
          throw new Error("Project not found");
        }
        const workspace = await db.getWorkspace(project.workspaceId);
        if (!workspace || workspace.ownerId !== ctx.user.id) {
          throw new Error("Access denied");
        }

        if (!project.slidesData) {
          return { suggestions: [] };
        }

        const slides = JSON.parse(project.slidesData as string) as aiService.Slide[];
        const suggestions = aiSuggestions.generateSuggestions({
          slides,
          projectTitle: project.title,
          projectDescription: project.description || undefined,
        });

        return { suggestions };
      }),
  }),

  activity: activityRouter,
  tier: tierRouter,
  support: supportRouter,
  brandFile: brandFileRouter,
  admin: adminRouter,
  notifications: notificationRouter,
  presentationStyle: presentationStyleRouter,
  versionHistory: versionHistoryRouter,
  streamingChat: streamingChatRouter,
  aiAgent: aiAgentRouter,
  templates: templatesRouter,
  autoTopup: autoTopupRouter,
  workspaceMembers: workspaceMembersRouter,
  aiSuggestions: aiSuggestionsRouter,
  imageGeneration: imageGenerationRouter,
  voiceTranscription: voiceTranscriptionRouter,
  systemSettings: systemSettingsRouter,
  aiMetrics: aiMetricsRouter,
});

export type AppRouter = typeof appRouter;
