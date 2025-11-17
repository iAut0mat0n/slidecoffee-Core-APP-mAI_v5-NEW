import { pgTable, serial, varchar, text, timestamp, boolean, json, integer, real } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extended with subscription and credit management fields.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatarUrl: text("avatarUrl"), // Profile picture URL
  role: varchar("role", ["user", "admin"]).default("user").notNull(),
  
  // Admin Management (RBAC)
  adminRole: varchar("adminRole", ["super_admin", "admin", "support", "viewer"]),
  mfaEnabled: serial("mfaEnabled").default(0).notNull(), // 1 = enabled, 0 = disabled
  mfaSecret: varchar("mfaSecret", { length: 255 }),
  mfaBackupCodes: text("mfaBackupCodes"), // JSON array of backup codes
  
  // Subscription Management
  subscriptionTier: varchar("subscriptionTier", [
    "starter", 
    "pro", 
    "pro_plus", 
    "team", 
    "business", 
    "enterprise"
  ]).default("starter").notNull(),
  subscriptionStatus: varchar("subscriptionStatus", [
    "active", 
    "canceled", 
    "past_due", 
    "trialing"
  ]).default("trialing").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  trialEndsAt: timestamp("trialEndsAt"),
  
  // Credit Management
  creditsRemaining: serial("creditsRemaining").notNull().default(75), // Starter gets 75
  creditsUsedThisMonth: serial("creditsUsedThisMonth").default(0).notNull(),
  billingCycleStart: timestamp("billingCycleStart").defaultNow().notNull(),
  autoTopupEnabled: serial("autoTopupEnabled").default(0).notNull(), // 1 = enabled, 0 = disabled
  autoTopupAmount: serial("autoTopupAmount").default(1000).notNull(), // Credits to add when auto top-up triggers
  autoTopupThreshold: serial("autoTopupThreshold").default(100).notNull(), // Trigger when credits fall below this
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Workspaces - Organizational containers for projects
 * Extended with owner tracking for team features
 */
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  ownerId: serial("ownerId").notNull(), // User who owns this workspace
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

/**
 * Workspace Members - Team collaboration
 */
export const workspaceMembers = pgTable("workspaceMembers", {
  id: serial("id").primaryKey(),
  workspaceId: serial("workspaceId").notNull(),
  userId: serial("userId").notNull(),
  role: varchar("role", ["owner", "admin", "member"]).default("member").notNull(),
  creditsAllocated: serial("creditsAllocated").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;

/**
 * Brands - Brand guidelines and styling for presentations
 */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  workspaceId: serial("workspaceId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 7 }), // hex color
  secondaryColor: varchar("secondaryColor", { length: 7 }),
  accentColor: varchar("accentColor", { length: 7 }),
  fontPrimary: varchar("fontPrimary", { length: 100 }),
  fontSecondary: varchar("fontSecondary", { length: 100 }),
  guidelinesText: text("guidelinesText"),
  templateFileUrl: text("templateFileUrl"),
  
  // PII Protection - Store original content before sanitization
  originalName: text("originalName"), // Original name if PII was detected
  originalGuidelinesText: text("originalGuidelinesText"), // Original guidelines if PII was detected
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

/**
 * Presentations - Individual presentation projects (renamed from projects)
 * Extended with Manus API tracking and generation status
 */
export const presentations = pgTable("presentations", {
  id: serial("id").primaryKey(),
  workspaceId: serial("workspaceId").notNull(),
  brandId: serial("brandId"),
  folderId: serial("folderId"), // Optional: folder organization
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // User Preferences
  isFavorite: boolean("isFavorite").default(false).notNull(),
  
  // Generation Status
  status: varchar("status", [
    "draft", 
    "planning", 
    "outline_ready", 
    "generating", 
    "completed", 
    "failed"
  ]).default("draft").notNull(),
  
  // Manus API Integration
  manusTaskId: varchar("manusTaskId", { length: 255 }),
  manusVersionId: varchar("manusVersionId", { length: 255 }),
  outlineJson: json("outlineJson"), // Approved outline
  
  // Legacy (keeping for backward compatibility)
  slidesData: json("slidesData"),
  exportUrl: text("exportUrl"),
  
  // PII Protection - Store original content before sanitization
  originalTitle: text("originalTitle"), // Original title if PII was detected
  originalDescription: text("originalDescription"), // Original description if PII was detected
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastViewedAt: timestamp("lastViewedAt").defaultNow().notNull(),
});

export type Presentation = typeof presentations.$inferSelect;
export type InsertPresentation = typeof presentations.$inferInsert;

/**
 * Slides - Individual slides within presentations
 * Stores HTML content from Manus API
 */
export const slides = pgTable("slides", {
  id: serial("id").primaryKey(),
  presentationId: serial("presentationId").notNull(),
  slideNumber: serial("slideNumber").notNull(),
  slideId: varchar("slideId", { length: 255 }).notNull(), // e.g., "intro", "problem_statement"
  title: varchar("title", { length: 500 }).notNull(),
  contentHtml: text("contentHtml"), // Full HTML content from Manus
  thumbnailUrl: text("thumbnailUrl"), // Screenshot for preview
  status: varchar("status", ["pending", "generating", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Slide = typeof slides.$inferSelect;
export type InsertSlide = typeof slides.$inferInsert;

/**
 * Manus Tasks - Track all Manus API calls
 * For debugging, cost tracking, and recovery
 */
export const manusTasks = pgTable("manusTasks", {
  id: serial("id").primaryKey(),
  presentationId: serial("presentationId").notNull(),
  taskId: varchar("taskId", { length: 255 }).notNull(), // Manus task ID
  taskType: varchar("taskType", ["outline", "slide_generation", "edit"]).notNull(),
  status: varchar("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  requestPayload: json("requestPayload"), // What we sent
  responsePayload: json("responsePayload"), // What we got back
  creditsUsed: serial("creditsUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ManusTask = typeof manusTasks.$inferSelect;
export type InsertManusTask = typeof manusTasks.$inferInsert;

/**
 * PII Tokens - Anonymization mappings
 * Stores encrypted PII with tokens for privacy
 */
export const piiTokens = pgTable("piiTokens", {
  id: serial("id").primaryKey(),
  presentationId: serial("presentationId"), // Optional - can be null for brands/workspaces
  token: varchar("token", { length: 50 }).notNull(), // e.g., "COMPANY_1", "PERSON_1"
  tokenType: varchar("tokenType", [
    "company", 
    "person", 
    "email", 
    "phone", 
    "address", 
    "ssn", 
    "credit_card"
  ]).notNull(),
  originalValue: text("originalValue").notNull(), // Encrypted!
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PiiToken = typeof piiTokens.$inferSelect;
export type InsertPiiToken = typeof piiTokens.$inferInsert;

/**
 * Credit Transactions - Audit log for credit usage
 */
export const creditTransactions = pgTable("creditTransactions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  presentationId: serial("presentationId"), // Optional: link to presentation
  amount: serial("amount").notNull(), // Negative for usage, positive for top-up
  type: varchar("type", [
    "usage", 
    "top_up", 
    "refund", 
    "subscription_renewal", 
    "admin_adjustment"
  ]).notNull(),
  description: text("description"),
  balanceBefore: serial("balanceBefore").notNull(),
  balanceAfter: serial("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Chat Messages - Conversation history for projects
 * Extended with encrypted original content for PII
 */
export const chatMessages = pgTable("chatMessages", {
  id: serial("id").primaryKey(),
  projectId: serial("projectId").notNull(), // Note: Still references projectId for backward compatibility
  role: varchar("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(), // Anonymized content
  originalContent: text("originalContent"), // Encrypted original (with PII)
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Plans - AI-generated plans for human-in-the-loop approval
 */
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  projectId: serial("projectId").notNull(),
  planContent: text("planContent").notNull(),
  status: varchar("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

/**
 * AI Suggestions - AI-generated suggestions for presentations
 */
export const aiSuggestions = pgTable("aiSuggestions", {
  id: serial("id").primaryKey(),
  presentationId: serial("presentationId").notNull(),
  type: varchar("type", ["content", "design", "layout", "typography", "imagery", "structure"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  targetSlide: serial("targetSlide"),
  priority: varchar("priority", ["low", "medium", "high"]).default("medium").notNull(),
  confidence: real("confidence"), // 0.00 to 1.00
  status: varchar("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  appliedAt: timestamp("appliedAt"),
  appliedBy: serial("appliedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AISuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAISuggestion = typeof aiSuggestions.$inferInsert;

/**
 * Folders - Organizational containers for presentations
 * Allows users to organize their presentations into folders
 */
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  workspaceId: serial("workspaceId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6366f1"), // Hex color code
  icon: varchar("icon", { length: 50 }), // Optional icon name
  parentFolderId: serial("parentFolderId"), // For nested folders (future)
  position: serial("position").default(0).notNull(), // For custom ordering
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;




/**
 * Activity feed for tracking user actions across the platform
 */
export const activityFeed = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(), // User who performed the action
  action: varchar("action", { length: 100 }).notNull(), // e.g., "presentation.created", "user.login"
  entityType: varchar("entityType", { length: 50 }), // e.g., "presentation", "user", "subscription"
  entityId: serial("entityId"), // ID of the affected entity
  details: text("details"), // JSON with additional context
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"), // Browser/device info
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityFeedEntry = typeof activityFeed.$inferSelect;
export type InsertActivityFeedEntry = typeof activityFeed.$inferInsert;




/**
 * Support tickets for customer issue tracking
 */
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(), // User who created the ticket
  assignedToId: serial("assignedToId"), // Admin assigned to handle the ticket
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: varchar("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  category: varchar("category", { length: 100 }), // e.g., "billing", "technical", "feature_request"
  internalNotes: text("internalNotes"), // Admin-only notes
  resolvedAt: timestamp("resolvedAt"),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Ticket responses/messages
 */
export const ticketResponses = pgTable("ticket_responses", {
  id: serial("id").primaryKey(),
  ticketId: serial("ticketId").notNull(),
  userId: serial("userId").notNull(), // User who sent the message
  message: text("message").notNull(),
  isInternal: serial("isInternal").default(0).notNull(), // 1 = admin-only note, 0 = visible to user
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketResponse = typeof ticketResponses.$inferSelect;
export type InsertTicketResponse = typeof ticketResponses.$inferInsert;



/**
 * Subscription Tiers - Pricing and feature configuration
 */
export const subscriptionTiers = pgTable("subscription_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Professional", "Enterprise"
  slug: varchar("slug", { length: 50 }).notNull().unique(), // e.g., "professional", "enterprise"
  price: serial("price").notNull(), // Price in cents (e.g., 2900 = $29.00)
  billingPeriod: varchar("billingPeriod", ["monthly", "yearly"]).notNull(),
  credits: serial("credits").notNull(), // Monthly credit allocation
  features: text("features").notNull(), // JSON string of features
  limits: text("limits").notNull(), // JSON string of limits (brands, projects, etc.)
  maxBrands: serial("maxBrands").default(1).notNull(), // Maximum number of brands
  collaboratorSeats: serial("collaboratorSeats").default(1).notNull(), // Number of team members
  maxStorageGB: serial("maxStorageGB").default(5).notNull(), // Storage limit in GB
  isPublic: serial("isPublic").default(1).notNull(), // 1 = visible to users, 0 = hidden
  isActive: serial("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = typeof subscriptionTiers.$inferInsert;



/**
 * Notification Queue - Real-time notifications for users
 */
export const notificationQueue = pgTable("notification_queue", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(), // Recipient user ID
  type: varchar("type", [
    "ticket_created",
    "ticket_updated",
    "ticket_assigned",
    "ticket_response",
    "system_announcement",
    "credit_low",
    "subscription_expiring",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("actionUrl", { length: 500 }), // Optional link to relevant page
  isRead: serial("isRead").default(0).notNull(), // 1 = read, 0 = unread
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notificationQueue.$inferSelect;
export type InsertNotification = typeof notificationQueue.$inferInsert;



/**
 * Presentation Versions - Version history for collaborative editing
 */
export const presentationVersions = pgTable("presentation_versions", {
  id: serial("id").primaryKey(),
  presentationId: serial("presentationId").notNull(),
  versionNumber: serial("versionNumber").notNull(), // Incremental version number
  content: text("content").notNull(), // JSON snapshot of all slides
  authorId: serial("authorId").notNull(), // User who created this version
  changeDescription: varchar("changeDescription", { length: 500 }), // Optional description
  isAutoSave: serial("isAutoSave").default(1).notNull(), // 1 = auto-save, 0 = manual save
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PresentationVersion = typeof presentationVersions.$inferSelect;
export type InsertPresentationVersion = typeof presentationVersions.$inferInsert;




/**
 * System Settings Table
 * Stores configurable system-wide settings that can be changed from admin panel
 */
export const systemSettings = pgTable("systemSettings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  category: varchar("category", { length: 100 }).notNull(), // 'ai', 'email', 'storage', 'general'
  description: text("description"),
  isSecret: serial("isSecret").default(0).notNull(), // 1 if value should be masked in UI
  updatedBy: serial("updatedBy"), // user ID who last updated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;




/**
 * AI Usage Metrics - Track AI model usage, costs, and performance
 * For cost monitoring, performance analysis, and optimization
 */
export const aiUsageMetrics = pgTable("ai_usage_metrics", {
  id: serial("id").primaryKey(),
  userId: serial("userId").references(() => users.id),
  workspaceId: serial("workspaceId").references(() => workspaces.id),
  model: varchar("model", { length: 100 }).notNull(), // e.g., "gemini-2.5-flash", "claude-3-5-sonnet-20241022"
  promptTokens: serial("promptTokens").notNull(),
  completionTokens: serial("completionTokens").notNull(),
  totalTokens: serial("totalTokens").notNull(),
  costUsd: real("costUsd").notNull(), // Cost in USD
  responseTimeMs: serial("responseTimeMs").notNull(), // Response time in milliseconds
  success: boolean("success").notNull().default(true),
  errorMessage: text("errorMessage"),
  endpoint: varchar("endpoint", { length: 255 }), // e.g., "/api/trpc/streamingChat.send"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIUsageMetric = typeof aiUsageMetrics.$inferSelect;
export type InsertAIUsageMetric = typeof aiUsageMetrics.$inferInsert;



/**
 * AI Budget Settings
 * Stores budget configurations for cost control
 */
export const aiBudgetSettings = pgTable("ai_budget_settings", {
  id: serial("id").primaryKey(),
  workspaceId: serial("workspaceId").notNull().references(() => workspaces.id),
  budgetType: varchar("budgetType", ["daily", "monthly"]).notNull(),
  budgetAmount: real("budgetAmount").notNull(), // USD
  alertThreshold: real("alertThreshold").default(0.8).notNull(), // 80% by default
  enabled: boolean("enabled").default(true).notNull(),
  lastAlertSentAt: timestamp("lastAlertSentAt"), // Track when we last sent an alert
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

/**
 * AI Model Spending Limits
 * Per-model spending caps
 */
export const aiModelLimits = pgTable("ai_model_limits", {
  id: serial("id").primaryKey(),
  workspaceId: serial("workspaceId").notNull().references(() => workspaces.id),
  model: varchar("model", { length: 100 }).notNull(),
  dailyLimit: real("dailyLimit"), // USD, null = no limit
  monthlyLimit: real("monthlyLimit"), // USD, null = no limit
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type AIBudgetSetting = typeof aiBudgetSettings.$inferSelect;
export type InsertAIBudgetSetting = typeof aiBudgetSettings.$inferInsert;
export type AIModelLimit = typeof aiModelLimits.$inferSelect;
export type InsertAIModelLimit = typeof aiModelLimits.$inferInsert;
