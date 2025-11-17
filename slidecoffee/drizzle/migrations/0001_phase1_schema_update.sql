-- Phase 1: Database Schema Update
-- Created: October 30, 2025 4:05 AM EDT
-- Purpose: Add credit system, team features, Manus API tracking, PII anonymization

-- Step 1: Rename projects table to presentations
RENAME TABLE `projects` TO `presentations`;

-- Step 2: Update workspaces table (rename userId to ownerId)
ALTER TABLE `workspaces` 
  CHANGE COLUMN `userId` `ownerId` INT NOT NULL;

-- Step 3: Add new fields to users table
ALTER TABLE `users`
  MODIFY COLUMN `subscriptionTier` ENUM('starter', 'pro', 'pro_plus', 'team', 'business', 'enterprise') NOT NULL DEFAULT 'starter',
  ADD COLUMN `creditsRemaining` INT NOT NULL DEFAULT 200 AFTER `trialEndsAt`,
  ADD COLUMN `creditsUsedThisMonth` INT NOT NULL DEFAULT 0 AFTER `creditsRemaining`,
  ADD COLUMN `billingCycleStart` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `creditsUsedThisMonth`;

-- Step 4: Add new fields to presentations table
ALTER TABLE `presentations`
  MODIFY COLUMN `status` ENUM('draft', 'planning', 'outline_ready', 'generating', 'completed', 'failed') NOT NULL DEFAULT 'draft',
  ADD COLUMN `manusVersionId` VARCHAR(255) AFTER `manusTaskId`,
  ADD COLUMN `outlineJson` JSON AFTER `manusVersionId`;

-- Step 5: Create workspaceMembers table
CREATE TABLE IF NOT EXISTS `workspaceMembers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `workspaceId` INT NOT NULL,
  `userId` INT NOT NULL,
  `role` ENUM('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
  `creditsAllocated` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_workspace` (`workspaceId`),
  INDEX `idx_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 6: Create slides table
CREATE TABLE IF NOT EXISTS `slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `presentationId` INT NOT NULL,
  `slideNumber` INT NOT NULL,
  `slideId` VARCHAR(255) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `contentHtml` TEXT,
  `thumbnailUrl` TEXT,
  `status` ENUM('pending', 'generating', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_presentation` (`presentationId`),
  INDEX `idx_slide_number` (`presentationId`, `slideNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 7: Create manusTasks table
CREATE TABLE IF NOT EXISTS `manusTasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `presentationId` INT NOT NULL,
  `taskId` VARCHAR(255) NOT NULL,
  `taskType` ENUM('outline', 'slide_generation', 'edit') NOT NULL,
  `status` ENUM('pending', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `requestPayload` JSON,
  `responsePayload` JSON,
  `creditsUsed` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` TIMESTAMP NULL,
  INDEX `idx_presentation` (`presentationId`),
  INDEX `idx_task` (`taskId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 8: Create piiTokens table
CREATE TABLE IF NOT EXISTS `piiTokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `presentationId` INT NOT NULL,
  `token` VARCHAR(50) NOT NULL,
  `tokenType` ENUM('company', 'person', 'email', 'phone', 'address', 'ssn', 'credit_card') NOT NULL,
  `originalValue` TEXT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_presentation` (`presentationId`),
  INDEX `idx_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 9: Create creditTransactions table
CREATE TABLE IF NOT EXISTS `creditTransactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `presentationId` INT,
  `amount` INT NOT NULL,
  `type` ENUM('usage', 'top_up', 'refund', 'subscription_renewal', 'admin_adjustment') NOT NULL,
  `description` TEXT,
  `balanceBefore` INT NOT NULL,
  `balanceAfter` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`userId`),
  INDEX `idx_presentation` (`presentationId`),
  INDEX `idx_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 10: Add originalContent field to chatMessages for PII tracking
ALTER TABLE `chatMessages`
  ADD COLUMN `originalContent` TEXT AFTER `content`;

-- Migration complete!

