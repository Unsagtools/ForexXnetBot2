import { storage } from "./storage";
import type { InsertTradingSignal, MarketData } from "@shared/schema";

// Technical Analysis Indicators
export class TechnicalAnalysis {
  // Simple Moving Average
  static calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  // Exponential Moving Average
  static calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(firstSMA);
    
    for (let i = period; i < prices.length; i++) {
      const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
      ema.push(currentEMA);
    }
    
    return ema;
  }

  // Relative Strength Index
  static calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    
    return rsi;
  }

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    const macdLine: number[] = [];
    const startIndex = slowPeriod - fastPeriod;
    
    for (let i = 0; i < fastEMA.length - startIndex; i++) {
      macdLine.push(fastEMA[i + startIndex] - slowEMA[i]);
    }
    
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histogram: number[] = [];
    
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[i + signalPeriod - 1] - signalLine[i]);
    }
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }
}

export class TradingEngine {
  private readonly PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "GBP/JPY", "EUR/GBP", "USD/CHF", "NZD/USD"];
  
  // Generate trading signals based on technical analysis
  async generateSignals(): Promise<void> {
    for (const pair of this.PAIRS) {
      try {
        const signal = await this.analyzeMarketData(pair);
        if (signal) {
          await storage.createTradingSignal(signal);
          console.log(`Generated signal for ${pair}: ${signal.action} at ${signal.entryPrice}`);
        }
      } catch (error) {
        console.error(`Error generating signal for ${pair}:`, error);
      }
    }
  }

  private async analyzeMarketData(pair: string): Promise<InsertTradingSignal | null> {
    // Get recent market data (last 100 candles)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (100 * 60 * 60 * 1000)); // 100 hours ago
    
    const marketData = await storage.getMarketData(pair, startDate, endDate);
    
    if (marketData.length < 50) {
      // Not enough data for analysis
      return null;
    }

    const closePrices = marketData.map(d => parseFloat(d.close.toString()));
    const currentPrice = closePrices[closePrices.length - 1];
    
    // Calculate technical indicators
    const sma20 = TechnicalAnalysis.calculateSMA(closePrices, 20);
    const sma50 = TechnicalAnalysis.calculateSMA(closePrices, 50);
    const rsi = TechnicalAnalysis.calculateRSI(closePrices);
    const macd = TechnicalAnalysis.calculateMACD(closePrices);
    
    if (sma20.length === 0 || sma50.length === 0 || rsi.length === 0) {
      return null;
    }

    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    const currentRSI = rsi[rsi.length - 1];
    const currentMACD = macd.histogram[macd.histogram.length - 1];
    
    // Signal generation logic
    let action: "BUY" | "SELL" | null = null;
    let confidence = 50;
    
    // Bullish conditions
    const bullishConditions = [
      currentSMA20 > currentSMA50, // Short MA above Long MA
      currentRSI < 70 && currentRSI > 30, // RSI not overbought/oversold
      currentMACD > 0, // MACD histogram positive
      currentPrice > currentSMA20 // Price above short MA
    ];
    
    // Bearish conditions
    const bearishConditions = [
      currentSMA20 < currentSMA50, // Short MA below Long MA
      currentRSI > 30 && currentRSI < 70, // RSI not overbought/oversold
      currentMACD < 0, // MACD histogram negative
      currentPrice < currentSMA20 // Price below short MA
    ];
    
    const bullishScore = bullishConditions.filter(Boolean).length;
    const bearishScore = bearishConditions.filter(Boolean).length;
    
    if (bullishScore >= 3) {
      action = "BUY";
      confidence = Math.min(95, 75 + (bullishScore * 5));
    } else if (bearishScore >= 3) {
      action = "SELL";
      confidence = Math.min(95, 75 + (bearishScore * 5));
    }
    
    if (!action) {
      return null;
    }
    
    // Calculate entry, take profit, and stop loss
    const atr = this.calculateATR(marketData.slice(-14)); // Average True Range for volatility
    const riskReward = 1.5;
    
    let entryPrice: number;
    let takeProfitPrice: number;
    let stopLossPrice: number;
    
    if (action === "BUY") {
      entryPrice = currentPrice;
      stopLossPrice = entryPrice - (atr * 1.5);
      takeProfitPrice = entryPrice + ((entryPrice - stopLossPrice) * riskReward);
    } else {
      entryPrice = currentPrice;
      stopLossPrice = entryPrice + (atr * 1.5);
      takeProfitPrice = entryPrice - ((stopLossPrice - entryPrice) * riskReward);
    }
    
    return {
      pair,
      action,
      entryPrice: entryPrice.toString(),
      takeProfitPrice: takeProfitPrice.toString(),
      stopLossPrice: stopLossPrice.toString(),
      confidence,
      status: "active"
    };
  }
  
  private calculateATR(marketData: MarketData[]): number {
    if (marketData.length < 2) return 0.001;
    
    const trueRanges: number[] = [];
    
    for (let i = 1; i < marketData.length; i++) {
      const current = marketData[i];
      const previous = marketData[i - 1];
      
      const high = parseFloat(current.high.toString());
      const low = parseFloat(current.low.toString());
      const prevClose = parseFloat(previous.close.toString());
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return trueRanges.reduce((sum, tr) => sum + tr, 0) / trueRanges.length;
  }

  // Simulate market data for demonstration
  async generateMockMarketData(): Promise<void> {
    const now = new Date();
    
    for (const pair of this.PAIRS) {
      const basePrice = this.getBasePriceForPair(pair);
      const marketDataPoints: any[] = [];
      
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(now.getTime() - ((100 - i) * 60 * 60 * 1000));
        const volatility = 0.002; // 0.2% volatility
        
        const change = (Math.random() - 0.5) * volatility * basePrice;
        const open = basePrice + change;
        const close = open + (Math.random() - 0.5) * volatility * basePrice;
        const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5;
        
        marketDataPoints.push({
          pair,
          timestamp,
          open: open.toFixed(5),
          high: high.toFixed(5),
          low: low.toFixed(5),
          close: close.toFixed(5),
          volume: Math.floor(Math.random() * 1000000)
        });
      }
      
      await storage.insertMarketData(marketDataPoints);
    }
  }
  
  private getBasePriceForPair(pair: string): number {
    const basePrices: { [key: string]: number } = {
      "EUR/USD": 1.0850,
      "GBP/USD": 1.2650,
      "USD/JPY": 149.80,
      "AUD/USD": 0.6720,
      "GBP/JPY": 183.20,
      "EUR/GBP": 0.8620,
      "USD/CHF": 0.9180,
      "NZD/USD": 0.6180
    };
    
    return basePrices[pair] || 1.0000;
  }
}

export const tradingEngine = new TradingEngine();
