import {
  users,
  tradingSignals,
  marketData,
  userAnalytics,
  learningContent,
  type User,
  type UpsertUser,
  type TradingSignal,
  type InsertTradingSignal,
  type MarketData,
  type InsertMarketData,
  type UserAnalytics,
  type InsertUserAnalytics,
  type LearningContent,
  type InsertLearningContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, avg, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Trading signals
  createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  getActiveTradingSignals(): Promise<TradingSignal[]>;
  getTradingSignalsByPair(pair: string): Promise<TradingSignal[]>;
  updateTradingSignalResult(id: number, result: string, closedAt: Date): Promise<void>;
  
  // Market data
  insertMarketData(data: InsertMarketData[]): Promise<void>;
  getMarketData(pair: string, fromDate: Date, toDate: Date): Promise<MarketData[]>;
  getLatestMarketData(pair: string): Promise<MarketData | undefined>;
  
  // Analytics
  getUserAnalytics(userId: string, fromDate: Date, toDate: Date): Promise<UserAnalytics[]>;
  createUserAnalytics(analytics: InsertUserAnalytics): Promise<UserAnalytics>;
  getSignalAccuracyStats(): Promise<{ pair: string; accuracy: number; totalSignals: number }[]>;
  getTotalUsers(): Promise<number>;
  getActiveUsers(fromDate: Date): Promise<number>;
  getTotalSignalsGenerated(): Promise<number>;
  getRevenue(): Promise<number>;
  
  // Learning content
  getLearningContent(): Promise<LearningContent[]>;
  createLearningContent(content: InsertLearningContent): Promise<LearningContent>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Trading signals
  async createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal> {
    const [newSignal] = await db
      .insert(tradingSignals)
      .values(signal)
      .returning();
    return newSignal;
  }

  async getActiveTradingSignals(): Promise<TradingSignal[]> {
    return await db
      .select()
      .from(tradingSignals)
      .where(eq(tradingSignals.status, "active"))
      .orderBy(desc(tradingSignals.createdAt));
  }

  async getTradingSignalsByPair(pair: string): Promise<TradingSignal[]> {
    return await db
      .select()
      .from(tradingSignals)
      .where(eq(tradingSignals.pair, pair))
      .orderBy(desc(tradingSignals.createdAt));
  }

  async updateTradingSignalResult(id: number, result: string, closedAt: Date): Promise<void> {
    await db
      .update(tradingSignals)
      .set({ result, closedAt, status: "closed" })
      .where(eq(tradingSignals.id, id));
  }

  // Market data
  async insertMarketData(data: InsertMarketData[]): Promise<void> {
    await db.insert(marketData).values(data);
  }

  async getMarketData(pair: string, fromDate: Date, toDate: Date): Promise<MarketData[]> {
    return await db
      .select()
      .from(marketData)
      .where(
        and(
          eq(marketData.pair, pair),
          gte(marketData.timestamp, fromDate),
          lte(marketData.timestamp, toDate)
        )
      )
      .orderBy(marketData.timestamp);
  }

  async getLatestMarketData(pair: string): Promise<MarketData | undefined> {
    const [latest] = await db
      .select()
      .from(marketData)
      .where(eq(marketData.pair, pair))
      .orderBy(desc(marketData.timestamp))
      .limit(1);
    return latest;
  }

  // Analytics
  async getUserAnalytics(userId: string, fromDate: Date, toDate: Date): Promise<UserAnalytics[]> {
    return await db
      .select()
      .from(userAnalytics)
      .where(
        and(
          eq(userAnalytics.userId, userId),
          gte(userAnalytics.date, fromDate),
          lte(userAnalytics.date, toDate)
        )
      )
      .orderBy(userAnalytics.date);
  }

  async createUserAnalytics(analytics: InsertUserAnalytics): Promise<UserAnalytics> {
    const [newAnalytics] = await db
      .insert(userAnalytics)
      .values(analytics)
      .returning();
    return newAnalytics;
  }

  async getSignalAccuracyStats(): Promise<{ pair: string; accuracy: number; totalSignals: number }[]> {
    const results = await db
      .select({
        pair: tradingSignals.pair,
        totalSignals: count(tradingSignals.id),
        winCount: sum(
          sql<number>`CASE WHEN ${tradingSignals.result} = 'win' THEN 1 ELSE 0 END`
        ),
      })
      .from(tradingSignals)
      .where(eq(tradingSignals.status, "closed"))
      .groupBy(tradingSignals.pair);

    return results.map(r => ({
      pair: r.pair,
      totalSignals: Number(r.totalSignals),
      accuracy: r.totalSignals > 0 ? (Number(r.winCount) / Number(r.totalSignals)) * 100 : 0,
    }));
  }

  async getTotalUsers(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result.count;
  }

  async getActiveUsers(fromDate: Date): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(userAnalytics)
      .where(gte(userAnalytics.date, fromDate));
    return result.count;
  }

  async getTotalSignalsGenerated(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(tradingSignals);
    return result.count;
  }

  async getRevenue(): Promise<number> {
    // Simple calculation based on subscription tiers
    const [proUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, "pro"));
    
    const [enterpriseUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, "enterprise"));

    return (proUsers.count * 49) + (enterpriseUsers.count * 199);
  }

  // Learning content
  async getLearningContent(): Promise<LearningContent[]> {
    return await db.select().from(learningContent).orderBy(learningContent.createdAt);
  }

  async createLearningContent(content: InsertLearningContent): Promise<LearningContent> {
    const [newContent] = await db
      .insert(learningContent)
      .values(content)
      .returning();
    return newContent;
  }
}

export const storage = new DatabaseStorage();
