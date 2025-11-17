CREATE TABLE "activity_feed" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"action" varchar(100) NOT NULL,
	"entityType" varchar(50),
	"entityId" serial NOT NULL,
	"details" text,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_budget_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspaceId" serial NOT NULL,
	"budgetType" varchar(2) NOT NULL,
	"budgetAmount" real NOT NULL,
	"alertThreshold" real DEFAULT 0.8 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"lastAlertSentAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_model_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspaceId" serial NOT NULL,
	"model" varchar(100) NOT NULL,
	"dailyLimit" real,
	"monthlyLimit" real,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiSuggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"presentationId" serial NOT NULL,
	"type" varchar(6) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"targetSlide" serial NOT NULL,
	"priority" varchar(3) DEFAULT 'medium' NOT NULL,
	"confidence" real,
	"status" varchar(3) DEFAULT 'pending' NOT NULL,
	"appliedAt" timestamp,
	"appliedBy" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"workspaceId" serial NOT NULL,
	"model" varchar(100) NOT NULL,
	"promptTokens" serial NOT NULL,
	"completionTokens" serial NOT NULL,
	"totalTokens" serial NOT NULL,
	"costUsd" real NOT NULL,
	"responseTimeMs" serial NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"errorMessage" text,
	"endpoint" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspaceId" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"logoUrl" text,
	"primaryColor" varchar(7),
	"secondaryColor" varchar(7),
	"accentColor" varchar(7),
	"fontPrimary" varchar(100),
	"fontSecondary" varchar(100),
	"guidelinesText" text,
	"templateFileUrl" text,
	"originalName" text,
	"originalGuidelinesText" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" serial NOT NULL,
	"role" varchar(3) NOT NULL,
	"content" text NOT NULL,
	"originalContent" text,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creditTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"presentationId" serial NOT NULL,
	"amount" serial NOT NULL,
	"type" varchar(5) NOT NULL,
	"description" text,
	"balanceBefore" serial NOT NULL,
	"balanceAfter" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspaceId" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"color" varchar(7) DEFAULT '#6366f1',
	"icon" varchar(50),
	"parentFolderId" serial NOT NULL,
	"position" serial DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manusTasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"presentationId" serial NOT NULL,
	"taskId" varchar(255) NOT NULL,
	"taskType" varchar(3) NOT NULL,
	"status" varchar(4) DEFAULT 'pending' NOT NULL,
	"requestPayload" json,
	"responsePayload" json,
	"creditsUsed" serial DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "notification_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"type" varchar(7) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"actionUrl" varchar(500),
	"isRead" serial DEFAULT 0 NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"readAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "piiTokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"presentationId" serial NOT NULL,
	"token" varchar(50) NOT NULL,
	"tokenType" varchar(7) NOT NULL,
	"originalValue" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" serial NOT NULL,
	"planContent" text NOT NULL,
	"status" varchar(3) DEFAULT 'pending' NOT NULL,
	"feedback" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presentation_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"presentationId" serial NOT NULL,
	"versionNumber" serial NOT NULL,
	"content" text NOT NULL,
	"authorId" serial NOT NULL,
	"changeDescription" varchar(500),
	"isAutoSave" serial DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presentations" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspaceId" serial NOT NULL,
	"brandId" serial NOT NULL,
	"folderId" serial NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"isFavorite" boolean DEFAULT false NOT NULL,
	"status" varchar(6) DEFAULT 'draft' NOT NULL,
	"manusTaskId" varchar(255),
	"manusVersionId" varchar(255),
	"outlineJson" json,
	"slidesData" json,
	"exportUrl" text,
	"originalTitle" text,
	"originalDescription" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastViewedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"presentationId" serial NOT NULL,
	"slideNumber" serial NOT NULL,
	"slideId" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"contentHtml" text,
	"thumbnailUrl" text,
	"status" varchar(4) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"price" serial NOT NULL,
	"billingPeriod" varchar(2) NOT NULL,
	"credits" serial NOT NULL,
	"features" text NOT NULL,
	"limits" text NOT NULL,
	"maxBrands" serial DEFAULT 1 NOT NULL,
	"collaboratorSeats" serial DEFAULT 1 NOT NULL,
	"maxStorageGB" serial DEFAULT 5 NOT NULL,
	"isPublic" serial DEFAULT 1 NOT NULL,
	"isActive" serial DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_tiers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"assignedToId" serial NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(4) DEFAULT 'open' NOT NULL,
	"priority" varchar(4) DEFAULT 'medium' NOT NULL,
	"category" varchar(100),
	"internalNotes" text,
	"resolvedAt" timestamp,
	"closedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "systemSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text,
	"category" varchar(100) NOT NULL,
	"description" text,
	"isSecret" serial DEFAULT 0 NOT NULL,
	"updatedBy" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "systemSettings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ticket_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticketId" serial NOT NULL,
	"userId" serial NOT NULL,
	"message" text NOT NULL,
	"isInternal" serial DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"avatarUrl" text,
	"role" varchar(2) DEFAULT 'user' NOT NULL,
	"adminRole" varchar(4),
	"mfaEnabled" serial DEFAULT 0 NOT NULL,
	"mfaSecret" varchar(255),
	"mfaBackupCodes" text,
	"subscriptionTier" varchar(6) DEFAULT 'starter' NOT NULL,
	"subscriptionStatus" varchar(4) DEFAULT 'trialing' NOT NULL,
	"stripeCustomerId" varchar(255),
	"stripeSubscriptionId" varchar(255),
	"trialEndsAt" timestamp,
	"creditsRemaining" serial DEFAULT 75 NOT NULL,
	"creditsUsedThisMonth" serial DEFAULT 0 NOT NULL,
	"billingCycleStart" timestamp DEFAULT now() NOT NULL,
	"autoTopupEnabled" serial DEFAULT 0 NOT NULL,
	"autoTopupAmount" serial DEFAULT 1000 NOT NULL,
	"autoTopupThreshold" serial DEFAULT 100 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "workspaceMembers" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspaceId" serial NOT NULL,
	"userId" serial NOT NULL,
	"role" varchar(3) DEFAULT 'member' NOT NULL,
	"creditsAllocated" serial DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerId" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_budget_settings" ADD CONSTRAINT "ai_budget_settings_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_limits" ADD CONSTRAINT "ai_model_limits_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_metrics" ADD CONSTRAINT "ai_usage_metrics_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_metrics" ADD CONSTRAINT "ai_usage_metrics_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;