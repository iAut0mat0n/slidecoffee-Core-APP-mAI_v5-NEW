import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, varchar, index } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)],
);

export const v2Users = pgTable('v2_users', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  replitAuthId: varchar('replit_auth_id').unique(),
  email: text('email').unique(),
  name: text('name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  profileImageUrl: text('profile_image_url'),
  role: text('role').default('user'),
  credits: integer('credits').default(75),
  plan: text('plan').default('espresso'),
  defaultWorkspaceId: uuid('default_workspace_id'),
  subscriptionStatus: text('subscription_status').default('inactive'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const v2Workspaces = pgTable('v2_workspaces', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => v2Users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const v2WorkspaceMembers = pgTable('v2_workspace_members', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  workspaceId: uuid('workspace_id').references(() => v2Workspaces.id),
  userId: uuid('user_id').references(() => v2Users.id),
  role: text('role').default('member'),
  creditsAllocated: integer('credits_allocated').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const v2Brands = pgTable('v2_brands', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  workspaceId: uuid('workspace_id').references(() => v2Workspaces.id),
  name: text('name').notNull(),
  primaryColor: text('primary_color').default('#7C3AED'),
  secondaryColor: text('secondary_color').default('#6EE7B7'),
  accentColor: text('accent_color').default('#FFE5E5'),
  fontHeading: text('font_heading').default('Inter'),
  fontBody: text('font_body').default('Inter'),
  logoUrl: text('logo_url'),
  guidelines: text('guidelines'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const v2Projects = pgTable('v2_projects', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: uuid('workspace_id').notNull().references(() => v2Workspaces.id),
  name: text('name').notNull(),
  description: text('description'),
  brandId: uuid('brand_id').references(() => v2Brands.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const v2ThemeProfiles = pgTable('v2_theme_profiles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: uuid('workspace_id').references(() => v2Workspaces.id),
  createdBy: uuid('created_by').references(() => v2Users.id),
  name: text('name').notNull(),
  description: text('description'),
  sourceType: text('source_type').notNull().default('standard'),
  category: text('category'),
  paletteJson: jsonb('palette_json').notNull(),
  typographyJson: jsonb('typography_json').notNull(),
  layoutTokens: jsonb('layout_tokens'),
  previewImageUrl: text('preview_image_url'),
  thumbnailUrl: text('thumbnail_url'),
  sourceFileId: uuid('source_file_id'),
  extractedStyles: jsonb('extracted_styles'),
  isPublic: boolean('is_public').default(false),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const v2OutlineDrafts = pgTable('v2_outline_drafts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: uuid('workspace_id').notNull().references(() => v2Workspaces.id),
  projectId: uuid('project_id').references(() => v2Projects.id),
  createdBy: uuid('created_by').notNull().references(() => v2Users.id),
  topic: text('topic').notNull(),
  outlineJson: jsonb('outline_json'),
  themeId: uuid('theme_id').references(() => v2ThemeProfiles.id),
  brandId: uuid('brand_id').references(() => v2Brands.id),
  imageProfileId: uuid('image_profile_id'),
  imageSource: text('image_source').default('pexels'),
  sourceContent: text('source_content'),
  optionsJson: jsonb('options_json'),
  currentStep: integer('current_step').default(1),
  status: text('status').default('draft'),
  presentationId: uuid('presentation_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const v2Presentations = pgTable('v2_presentations', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  workspaceId: uuid('workspace_id').references(() => v2Workspaces.id),
  brandId: uuid('brand_id').references(() => v2Brands.id),
  title: text('title').notNull(),
  description: text('description'),
  slides: jsonb('slides').default([]),
  status: text('status').default('draft'),
  isFavorite: boolean('is_favorite').default(false),
  folderId: uuid('folder_id'),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => v2Users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  shareToken: varchar('share_token'),
  shareSettings: jsonb('share_settings').default({ access: 'unlimited', enabled: false, password: null, expiresAt: null }),
  isPublic: boolean('is_public').default(false),
  outlineDraftId: uuid('outline_draft_id').references(() => v2OutlineDrafts.id),
});

export const v2SystemSettings = pgTable('v2_system_settings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  key: text('key').notNull().unique(),
  value: text('value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const v2AiSettings = pgTable('v2_ai_settings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  provider: text('provider').notNull(),
  apiKey: text('api_key'),
  model: text('model'),
  config: jsonb('config'),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(v2Users, ({ many }) => ({
  workspaces: many(v2Workspaces),
  workspaceMembers: many(v2WorkspaceMembers),
  presentations: many(v2Presentations),
  outlineDrafts: many(v2OutlineDrafts),
}));

export const workspacesRelations = relations(v2Workspaces, ({ one, many }) => ({
  owner: one(v2Users, {
    fields: [v2Workspaces.ownerId],
    references: [v2Users.id],
  }),
  members: many(v2WorkspaceMembers),
  brands: many(v2Brands),
  projects: many(v2Projects),
  presentations: many(v2Presentations),
}));

export const workspaceMembersRelations = relations(v2WorkspaceMembers, ({ one }) => ({
  workspace: one(v2Workspaces, {
    fields: [v2WorkspaceMembers.workspaceId],
    references: [v2Workspaces.id],
  }),
  user: one(v2Users, {
    fields: [v2WorkspaceMembers.userId],
    references: [v2Users.id],
  }),
}));

export const brandsRelations = relations(v2Brands, ({ one, many }) => ({
  workspace: one(v2Workspaces, {
    fields: [v2Brands.workspaceId],
    references: [v2Workspaces.id],
  }),
  projects: many(v2Projects),
  presentations: many(v2Presentations),
}));

export const projectsRelations = relations(v2Projects, ({ one, many }) => ({
  workspace: one(v2Workspaces, {
    fields: [v2Projects.workspaceId],
    references: [v2Workspaces.id],
  }),
  brand: one(v2Brands, {
    fields: [v2Projects.brandId],
    references: [v2Brands.id],
  }),
  outlineDrafts: many(v2OutlineDrafts),
}));

export const presentationsRelations = relations(v2Presentations, ({ one }) => ({
  workspace: one(v2Workspaces, {
    fields: [v2Presentations.workspaceId],
    references: [v2Workspaces.id],
  }),
  brand: one(v2Brands, {
    fields: [v2Presentations.brandId],
    references: [v2Brands.id],
  }),
  createdByUser: one(v2Users, {
    fields: [v2Presentations.createdBy],
    references: [v2Users.id],
  }),
  outlineDraft: one(v2OutlineDrafts, {
    fields: [v2Presentations.outlineDraftId],
    references: [v2OutlineDrafts.id],
  }),
}));

export const outlineDraftsRelations = relations(v2OutlineDrafts, ({ one }) => ({
  workspace: one(v2Workspaces, {
    fields: [v2OutlineDrafts.workspaceId],
    references: [v2Workspaces.id],
  }),
  project: one(v2Projects, {
    fields: [v2OutlineDrafts.projectId],
    references: [v2Projects.id],
  }),
  createdByUser: one(v2Users, {
    fields: [v2OutlineDrafts.createdBy],
    references: [v2Users.id],
  }),
  theme: one(v2ThemeProfiles, {
    fields: [v2OutlineDrafts.themeId],
    references: [v2ThemeProfiles.id],
  }),
}));

export type User = typeof v2Users.$inferSelect;
export type InsertUser = typeof v2Users.$inferInsert;

export type Workspace = typeof v2Workspaces.$inferSelect;
export type InsertWorkspace = typeof v2Workspaces.$inferInsert;

export type Brand = typeof v2Brands.$inferSelect;
export type InsertBrand = typeof v2Brands.$inferInsert;

export type Project = typeof v2Projects.$inferSelect;
export type InsertProject = typeof v2Projects.$inferInsert;

export type Presentation = typeof v2Presentations.$inferSelect;
export type InsertPresentation = typeof v2Presentations.$inferInsert;

export type OutlineDraft = typeof v2OutlineDrafts.$inferSelect;
export type InsertOutlineDraft = typeof v2OutlineDrafts.$inferInsert;

export type ThemeProfile = typeof v2ThemeProfiles.$inferSelect;
export type InsertThemeProfile = typeof v2ThemeProfiles.$inferInsert;
