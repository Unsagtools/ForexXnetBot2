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
