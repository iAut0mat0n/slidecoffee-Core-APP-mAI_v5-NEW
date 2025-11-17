import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, datetime, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with subscription and credit management fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatarUrl: text("avatarUrl"), // Profile picture URL
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Admin Management (RBAC)
  adminRole: mysqlEnum("adminRole", ["super_admin", "admin", "support", "viewer"]),
  mfaEnabled: int("mfaEnabled").default(0).notNull(), // 1 = enabled, 0 = disabled
  mfaSecret: varchar("mfaSecret", { length: 255 }),
  mfaBackupCodes: text("mfaBackupCodes"), // JSON array of backup codes
  
  // Subscription Management
  subscriptionTier: mysqlEnum("subscriptionTier", [
    "starter", 
    "pro", 
    "pro_plus", 
    "team", 
    "business", 
    "enterprise"
  ]).default("starter").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", [
    "active", 
    "canceled", 
    "past_due", 
    "trialing"
  ]).default("trialing").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  trialEndsAt: timestamp("trialEndsAt"),
  
  // Credit Management
  creditsRemaining: int("creditsRemaining").notNull().default(75), // Starter gets 75
  creditsUsedThisMonth: int("creditsUsedThisMonth").default(0).notNull(),
  billingCycleStart: timestamp("billingCycleStart").defaultNow().notNull(),
  autoTopupEnabled: int("autoTopupEnabled").default(0).notNull(), // 1 = enabled, 0 = disabled
  autoTopupAmount: int("autoTopupAmount").default(1000).notNull(), // Credits to add when auto top-up triggers
  autoTopupThreshold: int("autoTopupThreshold").default(100).notNull(), // Trigger when credits fall below this
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Workspaces - Organizational containers for projects
 * Extended with owner tracking for team features
 */
export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(), // User who owns this workspace
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

/**
 * Workspace Members - Team collaboration
 */
export const workspaceMembers = mysqlTable("workspaceMembers", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(),
  creditsAllocated: int("creditsAllocated").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;

/**
 * Brands - Brand guidelines and styling for presentations
 */
export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

/**
 * Presentations - Individual presentation projects (renamed from projects)
 * Extended with Manus API tracking and generation status
 */
export const presentations = mysqlTable("presentations", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  brandId: int("brandId"),
  folderId: int("folderId"), // Optional: folder organization
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // User Preferences
  isFavorite: boolean("isFavorite").default(false).notNull(),
  
  // Generation Status
  status: mysqlEnum("status", [
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastViewedAt: timestamp("lastViewedAt").defaultNow().notNull(),
});

export type Presentation = typeof presentations.$inferSelect;
export type InsertPresentation = typeof presentations.$inferInsert;

/**
 * Slides - Individual slides within presentations
 * Stores HTML content from Manus API
 */
export const slides = mysqlTable("slides", {
  id: int("id").autoincrement().primaryKey(),
  presentationId: int("presentationId").notNull(),
  slideNumber: int("slideNumber").notNull(),
  slideId: varchar("slideId", { length: 255 }).notNull(), // e.g., "intro", "problem_statement"
  title: varchar("title", { length: 500 }).notNull(),
  contentHtml: text("contentHtml"), // Full HTML content from Manus
  thumbnailUrl: text("thumbnailUrl"), // Screenshot for preview
  status: mysqlEnum("status", ["pending", "generating", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Slide = typeof slides.$inferSelect;
export type InsertSlide = typeof slides.$inferInsert;

/**
 * Manus Tasks - Track all Manus API calls
 * For debugging, cost tracking, and recovery
 */
export const manusTasks = mysqlTable("manusTasks", {
  id: int("id").autoincrement().primaryKey(),
  presentationId: int("presentationId").notNull(),
  taskId: varchar("taskId", { length: 255 }).notNull(), // Manus task ID
  taskType: mysqlEnum("taskType", ["outline", "slide_generation", "edit"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  requestPayload: json("requestPayload"), // What we sent
  responsePayload: json("responsePayload"), // What we got back
  creditsUsed: int("creditsUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ManusTask = typeof manusTasks.$inferSelect;
export type InsertManusTask = typeof manusTasks.$inferInsert;

/**
 * PII Tokens - Anonymization mappings
 * Stores encrypted PII with tokens for privacy
 */
export const piiTokens = mysqlTable("piiTokens", {
  id: int("id").autoincrement().primaryKey(),
  presentationId: int("presentationId"), // Optional - can be null for brands/workspaces
  token: varchar("token", { length: 50 }).notNull(), // e.g., "COMPANY_1", "PERSON_1"
  tokenType: mysqlEnum("tokenType", [
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
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  presentationId: int("presentationId"), // Optional: link to presentation
  amount: int("amount").notNull(), // Negative for usage, positive for top-up
  type: mysqlEnum("type", [
    "usage", 
    "top_up", 
    "refund", 
    "subscription_renewal", 
    "admin_adjustment"
  ]).notNull(),
  description: text("description"),
  balanceBefore: int("balanceBefore").notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Chat Messages - Conversation history for projects
 * Extended with encrypted original content for PII
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Note: Still references projectId for backward compatibility
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
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
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  planContent: text("planContent").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

/**
 * AI Suggestions - AI-generated suggestions for presentations
 */
export const aiSuggestions = mysqlTable("aiSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  presentationId: int("presentationId").notNull(),
  type: mysqlEnum("type", ["content", "design", "layout", "typography", "imagery", "structure"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  targetSlide: int("targetSlide"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  confidence: float("confidence"), // 0.00 to 1.00
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  appliedAt: timestamp("appliedAt"),
  appliedBy: int("appliedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AISuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAISuggestion = typeof aiSuggestions.$inferInsert;

/**
 * Folders - Organizational containers for presentations
 * Allows users to organize their presentations into folders
 */
export const folders = mysqlTable("folders", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6366f1"), // Hex color code
  icon: varchar("icon", { length: 50 }), // Optional icon name
  parentFolderId: int("parentFolderId"), // For nested folders (future)
  position: int("position").default(0).notNull(), // For custom ordering
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;




/**
 * Activity feed for tracking user actions across the platform
 */
export const activityFeed = mysqlTable("activity_feed", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who performed the action
  action: varchar("action", { length: 100 }).notNull(), // e.g., "presentation.created", "user.login"
  entityType: varchar("entityType", { length: 50 }), // e.g., "presentation", "user", "subscription"
  entityId: int("entityId"), // ID of the affected entity
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
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who created the ticket
  assignedToId: int("assignedToId"), // Admin assigned to handle the ticket
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  category: varchar("category", { length: 100 }), // e.g., "billing", "technical", "feature_request"
  internalNotes: text("internalNotes"), // Admin-only notes
  resolvedAt: timestamp("resolvedAt"),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Ticket responses/messages
 */
export const ticketResponses = mysqlTable("ticket_responses", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  userId: int("userId").notNull(), // User who sent the message
  message: text("message").notNull(),
  isInternal: int("isInternal").default(0).notNull(), // 1 = admin-only note, 0 = visible to user
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketResponse = typeof ticketResponses.$inferSelect;
export type InsertTicketResponse = typeof ticketResponses.$inferInsert;



/**
 * Subscription Tiers - Pricing and feature configuration
 */
export const subscriptionTiers = mysqlTable("subscription_tiers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Professional", "Enterprise"
  slug: varchar("slug", { length: 50 }).notNull().unique(), // e.g., "professional", "enterprise"
  price: int("price").notNull(), // Price in cents (e.g., 2900 = $29.00)
  billingPeriod: mysqlEnum("billingPeriod", ["monthly", "yearly"]).notNull(),
  credits: int("credits").notNull(), // Monthly credit allocation
  features: text("features").notNull(), // JSON string of features
  limits: text("limits").notNull(), // JSON string of limits (brands, projects, etc.)
  maxBrands: int("maxBrands").default(1).notNull(), // Maximum number of brands
  collaboratorSeats: int("collaboratorSeats").default(1).notNull(), // Number of team members
  maxStorageGB: int("maxStorageGB").default(5).notNull(), // Storage limit in GB
  isPublic: int("isPublic").default(1).notNull(), // 1 = visible to users, 0 = hidden
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = typeof subscriptionTiers.$inferInsert;



/**
 * Notification Queue - Real-time notifications for users
 */
export const notificationQueue = mysqlTable("notification_queue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Recipient user ID
  type: mysqlEnum("type", [
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
  isRead: int("isRead").default(0).notNull(), // 1 = read, 0 = unread
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notificationQueue.$inferSelect;
export type InsertNotification = typeof notificationQueue.$inferInsert;



/**
 * Presentation Versions - Version history for collaborative editing
 */
export const presentationVersions = mysqlTable("presentation_versions", {
  id: int("id").autoincrement().primaryKey(),
  presentationId: int("presentationId").notNull(),
  versionNumber: int("versionNumber").notNull(), // Incremental version number
  content: text("content").notNull(), // JSON snapshot of all slides
  authorId: int("authorId").notNull(), // User who created this version
  changeDescription: varchar("changeDescription", { length: 500 }), // Optional description
  isAutoSave: int("isAutoSave").default(1).notNull(), // 1 = auto-save, 0 = manual save
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PresentationVersion = typeof presentationVersions.$inferSelect;
export type InsertPresentationVersion = typeof presentationVersions.$inferInsert;




/**
 * System Settings Table
 * Stores configurable system-wide settings that can be changed from admin panel
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  category: varchar("category", { length: 100 }).notNull(), // 'ai', 'email', 'storage', 'general'
  description: text("description"),
  isSecret: int("isSecret").default(0).notNull(), // 1 if value should be masked in UI
  updatedBy: int("updatedBy"), // user ID who last updated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;




/**
 * AI Usage Metrics - Track AI model usage, costs, and performance
 * For cost monitoring, performance analysis, and optimization
 */
export const aiUsageMetrics = mysqlTable("ai_usage_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  workspaceId: int("workspaceId").references(() => workspaces.id),
  model: varchar("model", { length: 100 }).notNull(), // e.g., "gemini-2.5-flash", "claude-3-5-sonnet-20241022"
  promptTokens: int("promptTokens").notNull(),
  completionTokens: int("completionTokens").notNull(),
  totalTokens: int("totalTokens").notNull(),
  costUsd: float("costUsd").notNull(), // Cost in USD
  responseTimeMs: int("responseTimeMs").notNull(), // Response time in milliseconds
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
export const aiBudgetSettings = mysqlTable("ai_budget_settings", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id),
  budgetType: mysqlEnum("budgetType", ["daily", "monthly"]).notNull(),
  budgetAmount: float("budgetAmount").notNull(), // USD
  alertThreshold: float("alertThreshold").default(0.8).notNull(), // 80% by default
  enabled: boolean("enabled").default(true).notNull(),
  lastAlertSentAt: timestamp("lastAlertSentAt"), // Track when we last sent an alert
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * AI Model Spending Limits
 * Per-model spending caps
 */
export const aiModelLimits = mysqlTable("ai_model_limits", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id),
  model: varchar("model", { length: 100 }).notNull(),
  dailyLimit: float("dailyLimit"), // USD, null = no limit
  monthlyLimit: float("monthlyLimit"), // USD, null = no limit
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIBudgetSetting = typeof aiBudgetSettings.$inferSelect;
export type InsertAIBudgetSetting = typeof aiBudgetSettings.$inferInsert;
export type AIModelLimit = typeof aiModelLimits.$inferSelect;
export type InsertAIModelLimit = typeof aiModelLimits.$inferInsert;
