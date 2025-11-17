import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

