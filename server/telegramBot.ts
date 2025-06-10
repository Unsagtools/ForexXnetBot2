import axios from 'axios';
import { storage } from './storage';
import type { InsertTelegramPost, InsertActivityLog } from '../shared/schema';

export class TelegramBot {
  private static instance: TelegramBot;
  private botToken: string;
  private channelId: string;
  private channelUrl: string;
  private apiUrl: string;
  private autoPostEnabled: boolean;
  private postInterval: number;
  private isRunning: boolean = false;

  private constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || '@ForexXnet';
    this.channelUrl = process.env.TELEGRAM_CHANNEL_URL || 'https://t.me/ForexXnet';
    this.apiUrl = process.env.TELEGRAM_API_URL || 'https://api.telegram.org';
    this.autoPostEnabled = process.env.TELEGRAM_AUTO_POST === 'true';
    this.postInterval = parseInt(process.env.TELEGRAM_POST_INTERVAL || '3600000'); // 1 hour default
  }

  public static getInstance(): TelegramBot {
    if (!TelegramBot.instance) {
      TelegramBot.instance = new TelegramBot();
    }
    return TelegramBot.instance;
  }

  public async initialize(): Promise<void> {
    if (!this.botToken) {
      console.warn('Telegram bot token not configured');
      return;
    }

    try {
      // Test bot connection
      const botInfo = await this.getBotInfo();
      console.log(`Telegram bot initialized: ${botInfo.username}`);

      if (this.autoPostEnabled) {
        this.startAutoPosting();
      }

      await this.logActivity('telegram_bot_initialized', 'Telegram bot successfully initialized');
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
      await this.logActivity('telegram_bot_error', `Initialization failed: ${(error as Error).message}`);
    }
  }

  public async sendMessage(text: string, options: {
    parseMode?: 'HTML' | 'Markdown';
    disableWebPagePreview?: boolean;
    disableNotification?: boolean;
  } = {}): Promise<{ messageId: string; success: boolean }> {
    try {
      const response = await axios.post(`${this.apiUrl}/bot${this.botToken}/sendMessage`, {
        chat_id: this.channelId,
        text,
        parse_mode: options.parseMode || 'HTML',
        disable_web_page_preview: options.disableWebPagePreview || false,
        disable_notification: options.disableNotification || false
      });

      const messageId = response.data.result.message_id.toString();
      
      await this.logTelegramPost({
        messageId,
        channelId: this.channelId,
        content: text,
        postType: 'message',
        postedAt: new Date(),
        status: 'posted',
        source: 'manual'
      });

      return { messageId, success: true };
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      await this.logActivity('telegram_send_error', `Failed to send message: ${(error as Error).message}`);
      return { messageId: '', success: false };
    }
  }

  public async sendPhoto(photoUrl: string, caption?: string): Promise<{ messageId: string; success: boolean }> {
    try {
      const response = await axios.post(`${this.apiUrl}/bot${this.botToken}/sendPhoto`, {
        chat_id: this.channelId,
        photo: photoUrl,
        caption: caption || '',
        parse_mode: 'HTML'
      });

      const messageId = response.data.result.message_id.toString();
      
      await this.logTelegramPost({
        messageId,
        channelId: this.channelId,
        content: caption || 'Photo',
        postType: 'media',
        mediaUrl: photoUrl,
        postedAt: new Date(),
        status: 'posted',
        source: 'manual'
      });

      return { messageId, success: true };
    } catch (error) {
      console.error('Failed to send Telegram photo:', error);
      return { messageId: '', success: false };
    }
  }

  public async postTradingSignal(signal: {
    pair: string;
    action: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    confidence: number;
  }): Promise<void> {
    const message = `
🚀 <b>TRADING SIGNAL</b> 🚀

💱 <b>Pair:</b> ${signal.pair}
📈 <b>Action:</b> ${signal.action.toUpperCase()}
💰 <b>Entry:</b> ${signal.entryPrice}
🛑 <b>Stop Loss:</b> ${signal.stopLoss}
🎯 <b>Take Profit:</b> ${signal.takeProfit}
⚡ <b>Confidence:</b> ${signal.confidence}%

📊 Join our channel: ${this.channelUrl}
⚠️ Trade at your own risk
    `;

    await this.sendMessage(message.trim());
    await this.logActivity('signal_posted', `Trading signal posted for ${signal.pair}`);
  }

  public async postMarketNews(news: {
    title: string;
    summary: string;
    source: string;
    url?: string;
    impact?: 'low' | 'medium' | 'high';
  }): Promise<void> {
    const impactEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴'
    };

    const message = `
📰 <b>MARKET NEWS</b> ${news.impact ? impactEmoji[news.impact] : ''}

<b>${news.title}</b>

${news.summary}

📊 Source: ${news.source}
${news.url ? `🔗 Read more: ${news.url}` : ''}

📈 Stay updated: ${this.channelUrl}
    `;

    await this.sendMessage(message.trim());
    await this.logActivity('news_posted', `Market news posted: ${news.title}`);
  }

  public async postMarketAnalysis(analysis: {
    title: string;
    content: string;
    pairs: string[];
    timeframe: string;
  }): Promise<void> {
    const message = `
📊 <b>MARKET ANALYSIS</b> 📊

<b>${analysis.title}</b>

${analysis.content}

📈 <b>Pairs:</b> ${analysis.pairs.join(', ')}
⏰ <b>Timeframe:</b> ${analysis.timeframe}

📱 Follow us: ${this.channelUrl}
💡 Educational content only
    `;

    await this.sendMessage(message.trim());
    await this.logActivity('analysis_posted', `Market analysis posted: ${analysis.title}`);
  }

  public async fetchAndPostNews(): Promise<void> {
    try {
      // Simulate fetching news from multiple sources
      const newsItems = await this.fetchLatestNews();
      
      for (const news of newsItems) {
        await this.postMarketNews(news);
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay between posts
      }
    } catch (error) {
      console.error('Failed to fetch and post news:', error);
      await this.logActivity('news_fetch_error', `Failed to fetch news: ${(error as Error).message}`);
    }
  }

  private async fetchLatestNews(): Promise<Array<{
    title: string;
    summary: string;
    source: string;
    url?: string;
    impact?: 'low' | 'medium' | 'high';
  }>> {
    // This would integrate with real news APIs like NewsAPI, Finnhub, etc.
    // For now, returning sample structure for the automated system
    return [
      {
        title: 'EUR/USD Shows Strong Bullish Momentum',
        summary: 'The European Central Bank decisions continue to support EUR strength against USD. Technical indicators suggest continuation of upward trend.',
        source: 'Market Analysis',
        impact: 'medium'
      },
      {
        title: 'Gold Reaches Key Resistance Level',
        summary: 'Gold futures are testing critical resistance at $2000 level. Watch for potential breakout or reversal signals.',
        source: 'Commodity Report',
        impact: 'high'
      }
    ];
  }

  private startAutoPosting(): Promise<void> {
    if (this.isRunning) return Promise.resolve();
    
    this.isRunning = true;
    
    const autoPost = async () => {
      try {
        // Fetch and post latest news
        await this.fetchAndPostNews();
        
        // Check for pending trading signals
        const signals = await storage.getActiveTradingSignals();
        const recentSignals = signals.filter(s => 
          new Date().getTime() - new Date(s.createdAt).getTime() < this.postInterval
        );

        for (const signal of recentSignals) {
          await this.postTradingSignal({
            pair: signal.pair,
            action: signal.action,
            entryPrice: signal.entryPrice,
            stopLoss: signal.stopLoss || 0,
            takeProfit: signal.takeProfit || 0,
            confidence: signal.confidence
          });
        }

        await this.logActivity('auto_post_completed', 'Automated posting cycle completed');
      } catch (error) {
        console.error('Auto posting error:', error);
        await this.logActivity('auto_post_error', `Auto posting failed: ${(error as Error).message}`);
      }
    };

    // Run immediately and then on interval
    autoPost();
    setInterval(autoPost, this.postInterval);

    return Promise.resolve();
  }

  private async getBotInfo(): Promise<{ id: number; username: string; first_name: string }> {
    const response = await axios.get(`${this.apiUrl}/bot${this.botToken}/getMe`);
    return response.data.result;
  }

  private async logTelegramPost(postData: InsertTelegramPost): Promise<void> {
    try {
      await storage.createTelegramPost(postData);
    } catch (error) {
      console.error('Failed to log Telegram post:', error);
    }
  }

  private async logActivity(action: string, description: string): Promise<void> {
    try {
      const logData: InsertActivityLog = {
        userId: 'telegram_bot',
        action,
        description,
        category: 'telegram',
        metadata: {
          channelId: this.channelId,
          timestamp: new Date().toISOString()
        }
      };
      
      await storage.createActivityLog(logData);
    } catch (error) {
      console.error('Failed to log Telegram activity:', error);
    }
  }

  public async schedulePost(content: string, scheduledAt: Date, postType: string): Promise<void> {
    const postData: InsertTelegramPost = {
      channelId: this.channelId,
      content,
      postType,
      scheduledAt,
      status: 'pending',
      source: 'scheduled'
    };

    await storage.createTelegramPost(postData);
    await this.logActivity('post_scheduled', `Post scheduled for ${scheduledAt.toISOString()}`);
  }

  public getChannelUrl(): string {
    return this.channelUrl;
  }

  public isConfigured(): boolean {
    return !!this.botToken && !!this.channelId;
  }
}

export const telegramBot = TelegramBot.getInstance();