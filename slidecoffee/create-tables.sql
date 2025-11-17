-- SlideCoffee PostgreSQL Schema Migration
-- Generated for Supabase

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  "avatarUrl" TEXT,
  role VARCHAR(50) DEFAULT 'user' NOT NULL,
  "adminRole" VARCHAR(50),
  "mfaEnabled" INTEGER DEFAULT 0 NOT NULL,
  "mfaSecret" VARCHAR(255),
  "mfaBackupCodes" TEXT,
  "subscriptionTier" VARCHAR(50) DEFAULT 'starter' NOT NULL,
  "subscriptionStatus" VARCHAR(50) DEFAULT 'trialing' NOT NULL,
  "stripeCustomerId" VARCHAR(255),
  "stripeSubscriptionId" VARCHAR(255),
  "trialEndsAt" TIMESTAMP,
  "creditsRemaining" INTEGER DEFAULT 75 NOT NULL,
  "creditsUsedThisMonth" INTEGER DEFAULT 0 NOT NULL,
  "billingCycleStart" TIMESTAMP DEFAULT NOW() NOT NULL,
  "autoTopupEnabled" INTEGER DEFAULT 0 NOT NULL,
  "autoTopupAmount" INTEGER DEFAULT 1000 NOT NULL,
  "autoTopupThreshold" INTEGER DEFAULT 100 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  "ownerId" INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "isDefault" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Workspace Members table
CREATE TABLE IF NOT EXISTS "workspaceMembers" (
  id SERIAL PRIMARY KEY,
  "workspaceId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  role VARCHAR(50) DEFAULT 'member' NOT NULL,
  "creditsAllocated" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  "workspaceId" INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  "logoUrl" TEXT,
  "primaryColor" VARCHAR(7),
  "secondaryColor" VARCHAR(7),
  "accentColor" VARCHAR(7),
  "fontPrimary" VARCHAR(100),
  "fontSecondary" VARCHAR(100),
  "guidelinesText" TEXT,
  "templateFileUrl" TEXT,
  "originalName" TEXT,
  "originalGuidelinesText" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id SERIAL PRIMARY KEY,
  "workspaceId" INTEGER NOT NULL,
  "brandId" INTEGER,
  "folderId" INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "isFavorite" BOOLEAN DEFAULT false NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' NOT NULL,
  "manusTaskId" VARCHAR(255),
  "manusVersionId" VARCHAR(255),
  "outlineJson" JSONB,
  "slidesData" JSONB,
  "exportUrl" TEXT,
  "originalTitle" TEXT,
  "originalDescription" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastViewedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Slides table
CREATE TABLE IF NOT EXISTS slides (
  id SERIAL PRIMARY KEY,
  "presentationId" INTEGER NOT NULL,
  "slideNumber" INTEGER NOT NULL,
  "slideId" VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  "contentHtml" TEXT,
  "thumbnailUrl" TEXT,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Manus Tasks table
CREATE TABLE IF NOT EXISTS "manusTasks" (
  id SERIAL PRIMARY KEY,
  "presentationId" INTEGER NOT NULL,
  "taskId" VARCHAR(255) NOT NULL,
  "taskType" VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  "requestPayload" JSONB,
  "responsePayload" JSONB,
  "creditsUsed" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completedAt" TIMESTAMP
);

-- PII Tokens table
CREATE TABLE IF NOT EXISTS "piiTokens" (
  id SERIAL PRIMARY KEY,
  "presentationId" INTEGER,
  token VARCHAR(50) NOT NULL,
  "tokenType" VARCHAR(50) NOT NULL,
  "originalValue" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Credit Transactions table
CREATE TABLE IF NOT EXISTS "creditTransactions" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "presentationId" INTEGER,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  "balanceBefore" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS "chatMessages" (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  "originalContent" TEXT,
  metadata JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  "planContent" TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  feedback TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- AI Suggestions table
CREATE TABLE IF NOT EXISTS "aiSuggestions" (
  id SERIAL PRIMARY KEY,
  "presentationId" INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "targetSlide" INTEGER,
  priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
  confidence NUMERIC,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  "appliedAt" TIMESTAMP,
  "appliedBy" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id SERIAL PRIMARY KEY,
  "workspaceId" INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  icon VARCHAR(50),
  "parentFolderId" INTEGER,
  position INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Activity Feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  action VARCHAR(100) NOT NULL,
  "entityType" VARCHAR(50),
  "entityId" INTEGER,
  details TEXT,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "assignedToId" INTEGER,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
  category VARCHAR(100),
  "internalNotes" TEXT,
  "resolvedAt" TIMESTAMP,
  "closedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Ticket Responses table
CREATE TABLE IF NOT EXISTS ticket_responses (
  id SERIAL PRIMARY KEY,
  "ticketId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  message TEXT NOT NULL,
  "isInternal" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Subscription Tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  "billingPeriod" VARCHAR(50) NOT NULL,
  credits INTEGER NOT NULL,
  features TEXT NOT NULL,
  limits TEXT NOT NULL,
  "maxBrands" INTEGER DEFAULT 1 NOT NULL,
  "collaboratorSeats" INTEGER DEFAULT 1 NOT NULL,
  "maxStorageGB" INTEGER DEFAULT 5 NOT NULL,
  "isPublic" INTEGER DEFAULT 1 NOT NULL,
  "isActive" INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Notification Queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  "actionUrl" TEXT,
  metadata JSONB,
  "isRead" BOOLEAN DEFAULT false NOT NULL,
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

SELECT 'All tables created successfully!' AS status;
