import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  real
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, enterprise
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading signals table
export const tradingSignals = pgTable("trading_signals", {
  id: serial("id").primaryKey(),
  pair: varchar("pair").notNull(), // EUR/USD, GBP/JPY, etc.
  action: varchar("action").notNull(), // BUY, SELL
  entryPrice: decimal("entry_price", { precision: 10, scale: 5 }).notNull(),
  takeProfitPrice: decimal("take_profit_price", { precision: 10, scale: 5 }).notNull(),
  stopLossPrice: decimal("stop_loss_price", { precision: 10, scale: 5 }).notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  status: varchar("status").default("active"), // active, closed, expired
  result: varchar("result"), // win, loss, pending
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Market data for technical analysis
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  pair: varchar("pair").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  open: decimal("open", { precision: 10, scale: 5 }).notNull(),
  high: decimal("high", { precision: 10, scale: 5 }).notNull(),
  low: decimal("low", { precision: 10, scale: 5 }).notNull(),
  close: decimal("close", { precision: 10, scale: 5 }).notNull(),
  volume: integer("volume").default(0),
});

// User analytics
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  date: timestamp("date").notNull(),
  signalsViewed: integer("signals_viewed").default(0),
  learningMinutes: integer("learning_minutes").default(0),
  loginCount: integer("login_count").default(0),
});

// Learning content
export const learningContent = pgTable("learning_content", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // beginner, intermediate, advanced
  lessons: integer("lessons").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  icon: varchar("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Commands System
export const adminCommands = pgTable("admin_commands", {
  id: serial("id").primaryKey(),
  command: varchar("command").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'user', 'admin', 'broadcast', 'system'
  permissions: text("permissions").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  action: varchar("action").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'auth', 'trading', 'admin', 'system'
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Business Plans
export const businessPlans = pgTable("business_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  billingCycle: varchar("billing_cycle").notNull(), // 'monthly', 'yearly'
  features: text("features").array().notNull().default([]),
  maxSignals: integer("max_signals"),
  maxUsers: integer("max_users"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects Portfolio
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'ai', 'trading', 'bot', 'analytics'
  status: varchar("status").notNull().default("pending"), // 'pending', 'in-progress', 'completed', 'on-hold'
  technologies: text("technologies").array().notNull().default([]),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  githubUrl: varchar("github_url"),
  liveUrl: varchar("live_url"),
  imageUrl: varchar("image_url"),
  priority: integer("priority").notNull().default(1), // 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // 'info', 'success', 'warning', 'error'
  channel: varchar("channel").notNull(), // 'web', 'email', 'telegram', 'discord'
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System Settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: varchar("category").notNull().default("general"),
  isPublic: boolean("is_public").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = typeof tradingSignals.$inferInsert;
export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = typeof marketData.$inferInsert;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = typeof userAnalytics.$inferInsert;
export type LearningContent = typeof learningContent.$inferSelect;
export type InsertLearningContent = typeof learningContent.$inferInsert;
export type AdminCommand = typeof adminCommands.$inferSelect;
export type InsertAdminCommand = typeof adminCommands.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type BusinessPlan = typeof businessPlans.$inferSelect;
export type InsertBusinessPlan = typeof businessPlans.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  createdAt: true,
  closedAt: true,
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
});

export const insertLearningContentSchema = createInsertSchema(learningContent).omit({
  id: true,
  createdAt: true,
});

export const insertAdminCommandSchema = createInsertSchema(adminCommands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessPlanSchema = createInsertSchema(businessPlans).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});
