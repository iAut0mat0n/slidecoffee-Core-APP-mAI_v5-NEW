import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { 
  InsertUser, 
  users, 
  workspaces, 
  InsertWorkspace,
  brands,
  InsertBrand,
  presentations,
  InsertPresentation,
  chatMessages,
  InsertChatMessage,
  plans,
  InsertPlan,
  folders,
  InsertFolder
} from "../drizzle/schema";
import { ENV } from './_core/env';
import pkg from 'pg';
const { Pool } = pkg;

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance with connection string
// Drizzle will handle connection pooling internally
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log("[Database] Initializing connection...");
      const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        // Force IPv4 to avoid Railway IPv6 routing issues
        connectionTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false }
      });
      _db = drizzle(pool);
      console.log("[Database] Connection initialized successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function ensureDefaultWorkspace(userId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Database] Cannot ensure default workspace: database not available");
      throw new Error("Database not available");
    }

    // Check if user has any workspaces
    const existing = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
    
    if (existing.length === 0) {
      console.log(`[Database] Creating default workspace for user ${userId}`);
      // Create default workspace
      await db.insert(workspaces).values({
        ownerId: userId,
        name: "My Workspace",
        description: "Your default workspace",
        isDefault: true,
      });
      console.log(`[Database] Default workspace created successfully for user ${userId}`);
    } else {
      console.log(`[Database] User ${userId} already has ${existing.length} workspace(s)`);
    }
  } catch (error) {
    console.error(`[Database] Failed to ensure default workspace for user ${userId}:`, error);
    throw error;
  }
}

export async function upsertUser(user: InsertUser, retries = 3): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.email === 'walt@forthlogic.com') {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    const result = await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });

    // Get the user ID to create default workspace
    const userRecord = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    if (userRecord.length > 0) {
      // Create workspace but don't fail user creation if it fails
      try {
        await ensureDefaultWorkspace(userRecord[0].id);
      } catch (workspaceError) {
        console.error("[Database] Failed to create default workspace, but user was created successfully:", workspaceError);
        // Don't throw - user creation succeeded, workspace can be created later
      }
    }
  } catch (error: any) {
    // Retry on connection reset errors
    if (retries > 0 && (error.message?.includes('ECONNRESET') || error.message?.includes('Connection lost') || error.code === 'ETIMEDOUT')) {
      console.warn(`[Database] Connection error, retrying... (${retries} attempts left)`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return upsertUser(user, retries - 1);
    }
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createUserFromSupabase(data: { email: string; name: string; supabaseId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Use supabaseId as openId for compatibility
  const result = await db.insert(users).values({
    openId: data.supabaseId,
    email: data.email,
    name: data.name,
    role: 'user',
    subscriptionTier: 'starter',
    lastSignedIn: new Date(),
  }).returning({ id: users.id });

  const userId = result[0].id;
  
  // Create default workspace
  await ensureDefaultWorkspace(userId);
  
  // Return the created user
  const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return userRecord[0];
}

export async function updateUserProfile(userId: number, data: { name?: string; avatarUrl?: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update profile: database not available");
    return;
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function updateUserSubscription(userId: number, tier: "starter" | "pro" | "pro_plus" | "team" | "business" | "enterprise") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update subscription: database not available");
    return;
  }

  await db.update(users).set({ subscriptionTier: tier }).where(eq(users.id, userId));
}

// Workspace queries
export async function getUserWorkspaces(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workspaces).where(eq(workspaces.ownerId, userId));
}

export async function getWorkspace(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  return result[0];
}

export async function createWorkspace(data: InsertWorkspace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(workspaces).values(data);
  return result[0].id;
}

export async function updateWorkspace(id: number, data: { name?: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  
  await db.update(workspaces).set(updateData).where(eq(workspaces.id, id));
}

export async function setDefaultWorkspace(userId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First, unset all workspaces as default for this user
  await db.update(workspaces)
    .set({ isDefault: false })
    .where(eq(workspaces.ownerId, userId));
  
  // Then set the specified workspace as default
  await db.update(workspaces)
    .set({ isDefault: true })
    .where(eq(workspaces.id, workspaceId));
}

// Brand queries
export async function getWorkspaceBrands(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brands).where(eq(brands.workspaceId, workspaceId));
}

export async function getBrand(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return result[0];
}

export async function createBrand(data: InsertBrand) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(brands).values(data);
  return result[0].id;
}

export async function updateBrand(id: number, data: Partial<InsertBrand>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(brands).set(data).where(eq(brands.id, id));
}

export async function deleteBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(brands).where(eq(brands.id, id));
}

// Project queries
export async function getWorkspaceProjects(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(presentations).where(eq(presentations.workspaceId, workspaceId));
}

export async function getProject(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(presentations).where(eq(presentations.id, id)).limit(1);
  return result[0];
}

export async function createProject(data: InsertPresentation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(presentations).values(data);
  return result[0].id;
}

export async function updateProject(id: number, data: Partial<InsertPresentation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(presentations).set(data).where(eq(presentations.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete associated chat messages
  await db.delete(chatMessages).where(eq(chatMessages.projectId, id));
  
  // Delete associated plans
  await db.delete(plans).where(eq(plans.projectId, id));
  
  // Delete the project
  await db.delete(presentations).where(eq(presentations.id, id));
}

export async function duplicateProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the original project
  const original = await getProject(projectId);
  if (!original) throw new Error("Project not found");
  
  // Create a copy with "(Copy)" suffix
  const copyData: InsertPresentation = {
    workspaceId: original.workspaceId,
    title: `${original.title} (Copy)`,
    description: original.description,
    status: 'draft', // Reset to draft
    brandId: original.brandId,
    folderId: original.folderId,
    isFavorite: false, // Reset favorite status
  };
  
  const newId = await createProject(copyData);
  
  // Copy chat messages
  const messages = await getProjectChatMessages(projectId);
  for (const msg of messages) {
    await db.insert(chatMessages).values({
      projectId: newId,
      role: msg.role,
      content: msg.content,
    });
  }
  
  // Copy plan if exists
  const plan = await getProjectPlan(projectId);
  if (plan) {
    await db.insert(plans).values({
      projectId: newId,
      planContent: plan.planContent,
      status: plan.status,
    });
  }
  
  return newId;
}

export async function getRecentProjects(userId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  // Get user's workspaces
  const userWorkspaces = await getUserWorkspaces(userId);
  if (userWorkspaces.length === 0) return [];
  
  const workspaceIds = userWorkspaces.map(w => w.id);
  
  // Get recent projects from all user workspaces
  const projects = await db
    .select()
    .from(presentations)
    .where(eq(presentations.workspaceId, workspaceIds[0])) // Simplified for now
    .orderBy(desc(presentations.lastViewedAt))
    .limit(limit);
  
  return projects;
}

// Chat message queries
export async function getProjectChatMessages(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.projectId, projectId));
}

export async function createChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatMessages).values(data);
  return result[0].id;
}

// Plan queries
export async function getProjectPlan(projectId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(plans).where(eq(plans.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPlan(data: InsertPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(plans).values(data);
  return result[0].id;
}

export async function updatePlan(id: number, data: Partial<InsertPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(plans).set(data).where(eq(plans.id, id));
}

// Folder queries
export async function getWorkspaceFolders(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(folders).where(eq(folders.workspaceId, workspaceId));
}

export async function createFolder(data: InsertFolder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(folders).values(data);
  return result[0].id;
}

export async function updateFolder(id: number, data: { name?: string; color?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.color !== undefined) updateData.color = data.color;
  
  await db.update(folders).set(updateData).where(eq(folders.id, id));
}

export async function deleteFolder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(folders).where(eq(folders.id, id));
}

// Credit management
export async function getUserCredits(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0].creditsRemaining : 0;
}

export async function deductCredits(userId: number, amount: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return false;
  
  const currentCredits = user[0].creditsRemaining;
  if (currentCredits < amount) return false;
  
  await db.update(users).set({ creditsRemaining: currentCredits - amount }).where(eq(users.id, userId));
  return true;
}

export async function addCredits(userId: number, amount: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) throw new Error("User not found");
  
  const currentCredits = user[0].creditsRemaining;
  await db.update(users).set({ creditsRemaining: currentCredits + amount }).where(eq(users.id, userId));
}

// Additional helper functions
export async function updateProjectLastViewed(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(presentations).set({ lastViewedAt: new Date() }).where(eq(presentations.id, projectId));
}

export async function toggleProjectFavorite(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");
  
  await db.update(presentations).set({ isFavorite: !project.isFavorite }).where(eq(presentations.id, projectId));
}

export async function moveProjectToFolder(projectId: number, folderId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(presentations).set({ folderId: folderId ?? undefined }).where(eq(presentations.id, projectId));
}

export async function getFolder(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(folders).where(eq(folders.id, id)).limit(1);
  return result[0];
}

export async function updatePlanStatus(planId: number, status: "pending" | "approved" | "rejected", feedback?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (feedback !== undefined) updateData.feedback = feedback;
  
  await db.update(plans).set(updateData).where(eq(plans.id, planId));
}

