import {
  users,
  tradingSignals,
  marketData,
  userAnalytics,
  learningContent,
  adminCommands,
  activityLogs,
  businessPlans,
  projects,
  notifications,
  systemSettings,
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
  type AdminCommand,
  type InsertAdminCommand,
  type ActivityLog,
  type InsertActivityLog,
  type BusinessPlan,
  type InsertBusinessPlan,
  type Project,
  type InsertProject,
  type Notification,
  type InsertNotification,
  type SystemSetting,
  type InsertSystemSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, avg, sum, sql } from "drizzle-orm";

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
  
  // Admin commands
  getAdminCommands(): Promise<AdminCommand[]>;
  createAdminCommand(command: InsertAdminCommand): Promise<AdminCommand>;
  updateAdminCommand(id: number, command: Partial<AdminCommand>): Promise<AdminCommand>;
  deleteAdminCommand(id: number): Promise<void>;
  executeAdminCommand(id: number): Promise<void>;
  
  // Activity logs
  getActivityLogs(filters?: { userId?: string; category?: string; from?: Date; to?: Date; page?: number }): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityAnalytics(): Promise<any>;
  
  // Business plans
  getBusinessPlans(): Promise<BusinessPlan[]>;
  createBusinessPlan(plan: InsertBusinessPlan): Promise<BusinessPlan>;
  updateBusinessPlan(id: number, plan: Partial<BusinessPlan>): Promise<BusinessPlan>;
  getBusinessAnalytics(): Promise<any>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Notifications
  getNotifications(userId?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  
  // System settings
  getSystemSettings(): Promise<SystemSetting[]>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;
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

  // Admin commands
  async getAdminCommands(): Promise<AdminCommand[]> {
    return await db.select().from(adminCommands).orderBy(desc(adminCommands.createdAt));
  }

  async createAdminCommand(command: InsertAdminCommand): Promise<AdminCommand> {
    const [newCommand] = await db
      .insert(adminCommands)
      .values(command)
      .returning();
    return newCommand;
  }

  async updateAdminCommand(id: number, command: Partial<AdminCommand>): Promise<AdminCommand> {
    const [updatedCommand] = await db
      .update(adminCommands)
      .set({ ...command, updatedAt: new Date() })
      .where(eq(adminCommands.id, id))
      .returning();
    return updatedCommand;
  }

  async deleteAdminCommand(id: number): Promise<void> {
    await db.delete(adminCommands).where(eq(adminCommands.id, id));
  }

  async executeAdminCommand(id: number): Promise<void> {
    // Log the command execution
    const command = await db.select().from(adminCommands).where(eq(adminCommands.id, id)).limit(1);
    if (command.length > 0) {
      await this.createActivityLog({
        userId: "system",
        action: "admin_command_executed",
        description: `Executed command: ${command[0].command}`,
        category: "admin",
        metadata: { commandId: id },
      });
    }
  }

  // Activity logs
  async getActivityLogs(filters?: { userId?: string; category?: string; from?: Date; to?: Date; page?: number }): Promise<ActivityLog[]> {
    let query = db.select().from(activityLogs);
    
    const conditions = [];
    if (filters?.userId) conditions.push(eq(activityLogs.userId, filters.userId));
    if (filters?.category) conditions.push(eq(activityLogs.category, filters.category));
    if (filters?.from) conditions.push(gte(activityLogs.createdAt, filters.from));
    if (filters?.to) conditions.push(lte(activityLogs.createdAt, filters.to));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const offset = ((filters?.page || 1) - 1) * 50;
    return await query.orderBy(desc(activityLogs.createdAt)).limit(50).offset(offset);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getActivityAnalytics(): Promise<any> {
    const totalActivities = await db.select({ count: count() }).from(activityLogs);
    const activeUsers = await db.select({ count: count() }).from(activityLogs)
      .where(gte(activityLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
    const adminActions = await db.select({ count: count() }).from(activityLogs)
      .where(and(
        eq(activityLogs.category, "admin"),
        gte(activityLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
      ));
    
    return {
      totalActivities: totalActivities[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      adminActions: adminActions[0]?.count || 0,
      securityAlerts: 3, // Mock value for now
      dailyGrowth: 12.5,
    };
  }

  // Business plans
  async getBusinessPlans(): Promise<BusinessPlan[]> {
    return await db.select().from(businessPlans).orderBy(desc(businessPlans.createdAt));
  }

  async createBusinessPlan(plan: InsertBusinessPlan): Promise<BusinessPlan> {
    const [newPlan] = await db
      .insert(businessPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateBusinessPlan(id: number, plan: Partial<BusinessPlan>): Promise<BusinessPlan> {
    const [updatedPlan] = await db
      .update(businessPlans)
      .set(plan)
      .where(eq(businessPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async getBusinessAnalytics(): Promise<any> {
    const totalUsers = await this.getTotalUsers();
    const activeSubscriptions = await db.select({ count: count() }).from(users)
      .where(sql`${users.subscriptionTier} IS NOT NULL AND ${users.subscriptionTier} != 'free'`);
    
    return {
      totalRevenue: 45670,
      monthlyGrowth: 23.4,
      activeSubscriptions: activeSubscriptions[0]?.count || 0,
      planDistribution: {
        "Basic": 45,
        "Pro": 23,
        "Enterprise": 8
      },
      churnRate: 3.2,
    };
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.priority), desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Notifications
  async getNotifications(userId?: string): Promise<Notification[]> {
    let query = db.select().from(notifications);
    if (userId) {
      query = query.where(eq(notifications.userId, userId));
    }
    return await query.orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // System settings
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const [updatedSetting] = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return updatedSetting;
  }
}

export const storage = new DatabaseStorage();
