import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { tradingEngine } from "./tradingEngine";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Trading signals endpoints
  app.get('/api/signals', isAuthenticated, async (req: any, res) => {
    try {
      const signals = await storage.getActiveTradingSignals();
      res.json(signals);
    } catch (error) {
      console.error("Error fetching signals:", error);
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  app.get('/api/signals/accuracy', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getSignalAccuracyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching signal accuracy:", error);
      res.status(500).json({ message: "Failed to fetch signal accuracy" });
    }
  });

  // Market data endpoints
  app.get('/api/market/:pair', isAuthenticated, async (req: any, res) => {
    try {
      const { pair } = req.params;
      const { from, to } = req.query;
      
      const fromDate = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();
      
      const marketData = await storage.getMarketData(pair, fromDate, toDate);
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/overview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has admin access (you can modify this logic)
      if (user?.email?.includes('admin') || user?.subscriptionTier === 'enterprise') {
        const [totalUsers, activeUsers, totalSignals, revenue] = await Promise.all([
          storage.getTotalUsers(),
          storage.getActiveUsers(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          storage.getTotalSignalsGenerated(),
          storage.getRevenue()
        ]);
        
        res.json({
          totalUsers,
          activeUsers,
          totalSignals,
          revenue
        });
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Learning content endpoints
  app.get('/api/learning', async (req, res) => {
    try {
      const content = await storage.getLearningContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching learning content:", error);
      res.status(500).json({ message: "Failed to fetch learning content" });
    }
  });

  // Subscription management
  app.post('/api/subscription/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tier } = req.body;
      
      if (!['pro', 'enterprise'].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }
      
      // In a real application, you would integrate with a payment processor here
      const updatedUser = await storage.upsertUser({
        id: userId,
        subscriptionTier: tier,
        updatedAt: new Date()
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Initialize data and start signal generation
  app.post('/api/admin/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check admin access
      if (!user?.email?.includes('admin') && user?.subscriptionTier !== 'enterprise') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Generate mock market data and initial learning content
      await tradingEngine.generateMockMarketData();
      
      // Create initial learning content
      const learningItems = [
        {
          title: "Forex Fundamentals",
          description: "Learn the basics of forex trading, currency pairs, and market analysis.",
          category: "beginner",
          lessons: 12,
          estimatedMinutes: 180,
          icon: "graduation-cap"
        },
        {
          title: "Technical Analysis",
          description: "Master technical indicators, chart patterns, and trading strategies.",
          category: "intermediate",
          lessons: 18,
          estimatedMinutes: 270,
          icon: "chart-bar"
        },
        {
          title: "AI Trading Strategies",
          description: "Understand how AI analyzes markets and generates trading signals.",
          category: "advanced",
          lessons: 8,
          estimatedMinutes: 120,
          icon: "robot"
        }
      ];
      
      for (const item of learningItems) {
        await storage.createLearningContent(item);
      }
      
      res.json({ message: "Data initialized successfully" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  // Generate new signals manually
  app.post('/api/admin/generate-signals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check admin access
      if (!user?.email?.includes('admin') && user?.subscriptionTier !== 'enterprise') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await tradingEngine.generateSignals();
      res.json({ message: "Signals generated successfully" });
    } catch (error) {
      console.error("Error generating signals:", error);
      res.status(500).json({ message: "Failed to generate signals" });
    }
  });

  // Admin user management
  app.post('/api/admin/user/command', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check admin access
      if (!user?.email?.includes('admin') && user?.subscriptionTier !== 'enterprise') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { targetUserId, command } = req.body;
      
      if (!targetUserId || !command) {
        return res.status(400).json({ message: "Target user ID and command required" });
      }
      
      // Execute user command based on type
      if (command.startsWith('upgrade ')) {
        const tier = command.split(' ')[1];
        if (['free', 'pro', 'enterprise'].includes(tier)) {
          await storage.upsertUser({
            id: targetUserId,
            subscriptionTier: tier,
            updatedAt: new Date()
          });
          res.json({ message: `User upgraded to ${tier} successfully` });
        } else {
          res.status(400).json({ message: "Invalid subscription tier" });
        }
      } else if (command === 'ban user') {
        // In a real app, you'd have a user status field
        res.json({ message: "User banned successfully" });
      } else if (command === 'unban user') {
        res.json({ message: "User unbanned successfully" });
      } else if (command === 'reset password') {
        res.json({ message: "Password reset email sent" });
      } else if (command === 'grant admin') {
        await storage.upsertUser({
          id: targetUserId,
          email: 'admin@forexXnet.com',
          subscriptionTier: 'enterprise',
          updatedAt: new Date()
        });
        res.json({ message: "Admin privileges granted" });
      } else {
        res.status(400).json({ message: "Unknown command" });
      }
      
    } catch (error) {
      console.error("Error executing user command:", error);
      res.status(500).json({ message: "Failed to execute command" });
    }
  });

  // Broadcast message to users
  app.post('/api/admin/broadcast', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check admin access
      if (!user?.email?.includes('admin') && user?.subscriptionTier !== 'enterprise') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { message, targetGroup } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message content required" });
      }
      
      // In a real app, you'd send actual notifications
      // For now, we'll just log and return success
      console.log(`Broadcasting to ${targetGroup || 'all'}: ${message}`);
      
      const totalUsers = await storage.getTotalUsers();
      res.json({ 
        message: "Broadcast sent successfully",
        recipientCount: totalUsers 
      });
      
    } catch (error) {
      console.error("Error sending broadcast:", error);
      res.status(500).json({ message: "Failed to send broadcast" });
    }
  });

  // Get all users for admin management
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check admin access
      if (!user?.email?.includes('admin') && user?.subscriptionTier !== 'enterprise') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // In a real app, you'd fetch actual user list
      // For demo, return mock data
      const mockUsers = [
        { id: "43674979", email: "admin@forexXnet.com", subscriptionTier: "enterprise", status: "active" },
        { id: "user1", email: "trader1@example.com", subscriptionTier: "pro", status: "active" },
        { id: "user2", email: "trader2@example.com", subscriptionTier: "free", status: "active" },
        { id: "user3", email: "trader3@example.com", subscriptionTier: "pro", status: "banned" },
      ];
      
      res.json(mockUsers);
      
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);

  // Start signal generation on server startup
  setTimeout(async () => {
    try {
      await tradingEngine.generateSignals();
      console.log("Initial signals generated");
    } catch (error) {
      console.error("Error generating initial signals:", error);
    }
  }, 5000);

  // Generate new signals every 4 hours
  setInterval(async () => {
    try {
      await tradingEngine.generateSignals();
      console.log("Periodic signals generated");
    } catch (error) {
      console.error("Error generating periodic signals:", error);
    }
  }, 4 * 60 * 60 * 1000);

  return httpServer;
}
