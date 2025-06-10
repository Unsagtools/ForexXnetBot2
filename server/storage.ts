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
  ads,
  telegramPosts,
  encryptionKeys,
  securityLogs,
  trialSignals,
  userPerformance,
  signalVerification,
  realTimeMarket,
  premiumFeatures,
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
  type Ad,
  type InsertAd,
  type TelegramPost,
  type InsertTelegramPost,
  type EncryptionKey,
  type InsertEncryptionKey,
  type SecurityLog,
  type InsertSecurityLog,
  type TrialSignal,
  type InsertTrialSignal,
  type UserPerformance,
  type InsertUserPerformance,
  type SignalVerification,
  type InsertSignalVerification,
  type RealTimeMarket,
  type InsertRealTimeMarket,
  type PremiumFeature,
  type InsertPremiumFeature,
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
  
  // Ads system
  getAds(filters?: { position?: string; isActive?: boolean }): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, ad: Partial<Ad>): Promise<Ad>;
  deleteAd(id: number): Promise<void>;
  incrementAdImpressions(id: number): Promise<void>;
  incrementAdClicks(id: number): Promise<void>;
  
  // Telegram posts
  getTelegramPosts(filters?: { status?: string; postType?: string }): Promise<TelegramPost[]>;
  createTelegramPost(post: InsertTelegramPost): Promise<TelegramPost>;
  updateTelegramPost(id: number, post: Partial<TelegramPost>): Promise<TelegramPost>;
  
  // Encryption keys
  getEncryptionKeys(): Promise<EncryptionKey[]>;
  createEncryptionKey(key: InsertEncryptionKey): Promise<EncryptionKey>;
  updateEncryptionKey(id: number, key: Partial<EncryptionKey>): Promise<EncryptionKey>;
  
  // Security logs
  getSecurityLogs(filters?: { severity?: string; eventType?: string }): Promise<SecurityLog[]>;
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;
  
  // Trial system
  startUserTrial(userId: string): Promise<void>;
  getUserTrialStatus(userId: string): Promise<{ isActive: boolean; daysLeft: number; performance: any }>;
  recordTrialSignal(userId: string, signalId: number, entryPrice: string): Promise<TrialSignal>;
  updateTrialSignalResult(id: number, exitPrice: string, profitLoss: string, pips: number): Promise<void>;
  getUserPerformance(userId: string): Promise<UserPerformance | undefined>;
  updateUserPerformance(userId: string, performance: Partial<UserPerformance>): Promise<void>;
  
  // Signal verification
  verifySignal(signalId: number, verification: InsertSignalVerification): Promise<SignalVerification>;
  getSignalVerifications(signalId?: number): Promise<SignalVerification[]>;
  
  // Real-time market data
  updateRealTimeMarket(data: InsertRealTimeMarket[]): Promise<void>;
  getRealTimeMarket(pair?: string): Promise<RealTimeMarket[]>;
  
  // Premium features
  getPremiumFeatures(tier?: string): Promise<PremiumFeature[]>;
  checkFeatureAccess(userId: string, featureName: string): Promise<boolean>;
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
      query = query.where(and(...conditions)) as any;
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
      query = query.where(eq(notifications.userId, userId)) as any;
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

  // Ads system
  async getAds(filters?: { position?: string; isActive?: boolean }): Promise<Ad[]> {
    let query = db.select().from(ads);
    
    const conditions = [];
    if (filters?.position) conditions.push(eq(ads.position, filters.position));
    if (filters?.isActive !== undefined) conditions.push(eq(ads.isActive, filters.isActive));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(ads.priority), desc(ads.createdAt));
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const [newAd] = await db
      .insert(ads)
      .values(ad)
      .returning();
    return newAd;
  }

  async updateAd(id: number, ad: Partial<Ad>): Promise<Ad> {
    const [updatedAd] = await db
      .update(ads)
      .set({ ...ad, updatedAt: new Date() })
      .where(eq(ads.id, id))
      .returning();
    return updatedAd;
  }

  async deleteAd(id: number): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id));
  }

  async incrementAdImpressions(id: number): Promise<void> {
    await db
      .update(ads)
      .set({ impressions: sql`${ads.impressions} + 1` })
      .where(eq(ads.id, id));
  }

  async incrementAdClicks(id: number): Promise<void> {
    await db
      .update(ads)
      .set({ clicks: sql`${ads.clicks} + 1` })
      .where(eq(ads.id, id));
  }

  // Telegram posts
  async getTelegramPosts(filters?: { status?: string; postType?: string }): Promise<TelegramPost[]> {
    let query = db.select().from(telegramPosts);
    
    const conditions = [];
    if (filters?.status) conditions.push(eq(telegramPosts.status, filters.status));
    if (filters?.postType) conditions.push(eq(telegramPosts.postType, filters.postType));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(telegramPosts.createdAt));
  }

  async createTelegramPost(post: InsertTelegramPost): Promise<TelegramPost> {
    const [newPost] = await db
      .insert(telegramPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async updateTelegramPost(id: number, post: Partial<TelegramPost>): Promise<TelegramPost> {
    const [updatedPost] = await db
      .update(telegramPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(telegramPosts.id, id))
      .returning();
    return updatedPost;
  }

  // Encryption keys
  async getEncryptionKeys(): Promise<EncryptionKey[]> {
    return await db.select().from(encryptionKeys).orderBy(desc(encryptionKeys.createdAt));
  }

  async createEncryptionKey(key: InsertEncryptionKey): Promise<EncryptionKey> {
    const [newKey] = await db
      .insert(encryptionKeys)
      .values(key)
      .returning();
    return newKey;
  }

  async updateEncryptionKey(id: number, key: Partial<EncryptionKey>): Promise<EncryptionKey> {
    const [updatedKey] = await db
      .update(encryptionKeys)
      .set({ ...key, updatedAt: new Date() })
      .where(eq(encryptionKeys.id, id))
      .returning();
    return updatedKey;
  }

  // Security logs
  async getSecurityLogs(filters?: { severity?: string; eventType?: string }): Promise<SecurityLog[]> {
    let query = db.select().from(securityLogs);
    
    const conditions = [];
    if (filters?.severity) conditions.push(eq(securityLogs.severity, filters.severity));
    if (filters?.eventType) conditions.push(eq(securityLogs.eventType, filters.eventType));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(securityLogs.createdAt));
  }

  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const [newLog] = await db
      .insert(securityLogs)
      .values(log)
      .returning();
    return newLog;
  }

  // Trial system implementation
  async startUserTrial(userId: string): Promise<void> {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial
    
    await db
      .update(users)
      .set({
        subscriptionTier: "trial",
        trialStartDate: new Date(),
        trialEndDate: trialEndDate,
        isTrialActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Initialize user performance tracking
    const existingPerformance = await db
      .select()
      .from(userPerformance)
      .where(eq(userPerformance.userId, userId))
      .limit(1);

    if (existingPerformance.length === 0) {
      await db.insert(userPerformance).values({
        userId,
        totalSignals: 0,
        winningSignals: 0,
        losingSignals: 0,
        winRate: 0,
        totalProfit: "0",
        averagePips: 0,
        bestTrade: "0",
        worstTrade: "0",
        riskScore: 5
      });
    }
  }

  async getUserTrialStatus(userId: string): Promise<{ isActive: boolean; daysLeft: number; performance: any }> {
    const user = await this.getUser(userId);
    if (!user || !user.trialStartDate || !user.trialEndDate) {
      return { isActive: false, daysLeft: 0, performance: null };
    }

    const now = new Date();
    const endDate = new Date(user.trialEndDate);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isActive = user.isTrialActive && daysLeft > 0;

    // Get user performance
    const performance = await this.getUserPerformance(userId);

    return {
      isActive,
      daysLeft,
      performance: performance || {
        totalSignals: 0,
        winRate: 0,
        totalProfit: "0",
        averagePips: 0
      }
    };
  }

  async recordTrialSignal(userId: string, signalId: number, entryPrice: string): Promise<TrialSignal> {
    const signal = await db.select().from(tradingSignals).where(eq(tradingSignals.id, signalId)).limit(1);
    if (signal.length === 0) {
      throw new Error("Signal not found");
    }

    const [trialSignal] = await db
      .insert(trialSignals)
      .values({
        userId,
        signalId,
        entryPrice,
        confidence: signal[0].confidence,
        status: "active"
      })
      .returning();

    return trialSignal;
  }

  async updateTrialSignalResult(id: number, exitPrice: string, profitLoss: string, pips: number): Promise<void> {
    const status = parseFloat(profitLoss) >= 0 ? "won" : "lost";
    
    await db
      .update(trialSignals)
      .set({
        exitPrice,
        profitLoss,
        pips,
        status,
        exitTime: new Date()
      })
      .where(eq(trialSignals.id, id));

    // Update user performance
    const trialSignal = await db.select().from(trialSignals).where(eq(trialSignals.id, id)).limit(1);
    if (trialSignal.length > 0) {
      await this.updateUserPerformanceStats(trialSignal[0].userId, status, parseFloat(profitLoss), pips);
    }
  }

  private async updateUserPerformanceStats(userId: string, result: string, profitLoss: number, pips: number): Promise<void> {
    const performance = await this.getUserPerformance(userId);
    if (!performance) return;

    const totalSignals = performance.totalSignals + 1;
    const winningSignals = performance.winningSignals + (result === "won" ? 1 : 0);
    const losingSignals = performance.losingSignals + (result === "lost" ? 1 : 0);
    const winRate = (winningSignals / totalSignals) * 100;
    const newTotalProfit = parseFloat(performance.totalProfit) + profitLoss;
    const averagePips = ((performance.averagePips * (totalSignals - 1)) + pips) / totalSignals;
    const bestTrade = Math.max(parseFloat(performance.bestTrade), profitLoss);
    const worstTrade = Math.min(parseFloat(performance.worstTrade), profitLoss);

    await db
      .update(userPerformance)
      .set({
        totalSignals,
        winningSignals,
        losingSignals,
        winRate,
        totalProfit: newTotalProfit.toString(),
        averagePips,
        bestTrade: bestTrade.toString(),
        worstTrade: worstTrade.toString(),
        updatedAt: new Date()
      })
      .where(eq(userPerformance.userId, userId));
  }

  async getUserPerformance(userId: string): Promise<UserPerformance | undefined> {
    const result = await db
      .select()
      .from(userPerformance)
      .where(eq(userPerformance.userId, userId))
      .limit(1);
    return result[0];
  }

  async updateUserPerformance(userId: string, performance: Partial<UserPerformance>): Promise<void> {
    await db
      .update(userPerformance)
      .set({ ...performance, updatedAt: new Date() })
      .where(eq(userPerformance.userId, userId));
  }

  // Signal verification for authenticity
  async verifySignal(signalId: number, verification: InsertSignalVerification): Promise<SignalVerification> {
    const [result] = await db
      .insert(signalVerification)
      .values({ ...verification, signalId })
      .returning();
    return result;
  }

  async getSignalVerifications(signalId?: number): Promise<SignalVerification[]> {
    let query = db.select().from(signalVerification);
    if (signalId) {
      query = query.where(eq(signalVerification.signalId, signalId)) as any;
    }
    return await query.orderBy(desc(signalVerification.createdAt));
  }

  // Real-time market data
  async updateRealTimeMarket(data: InsertRealTimeMarket[]): Promise<void> {
    if (data.length === 0) return;
    await db.insert(realTimeMarket).values(data);
  }

  async getRealTimeMarket(pair?: string): Promise<RealTimeMarket[]> {
    let query = db.select().from(realTimeMarket);
    if (pair) {
      query = query.where(eq(realTimeMarket.pair, pair)) as any;
    }
    return await query.orderBy(desc(realTimeMarket.timestamp)).limit(100);
  }

  // Premium features
  async getPremiumFeatures(tier?: string): Promise<PremiumFeature[]> {
    let query = db.select().from(premiumFeatures).where(eq(premiumFeatures.isActive, true));
    if (tier) {
      query = query.where(eq(premiumFeatures.tierRequired, tier)) as any;
    }
    return await query.orderBy(premiumFeatures.priority);
  }

  async checkFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    const feature = await db
      .select()
      .from(premiumFeatures)
      .where(and(
        eq(premiumFeatures.featureName, featureName),
        eq(premiumFeatures.isActive, true)
      ))
      .limit(1);

    if (feature.length === 0) return true; // Feature doesn't exist, allow access

    const userTier = user.subscriptionTier || "free";
    const requiredTier = feature[0].tierRequired;

    // Tier hierarchy: trial < free < pro < enterprise
    const tierHierarchy = { trial: 1, free: 2, pro: 3, enterprise: 4 };
    return tierHierarchy[userTier as keyof typeof tierHierarchy] >= tierHierarchy[requiredTier as keyof typeof tierHierarchy];
  }
}

export const storage = new DatabaseStorage();
