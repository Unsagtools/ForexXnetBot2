export interface TradingSignal {
  id: number;
  pair: string;
  action: "BUY" | "SELL";
  entryPrice: string;
  takeProfitPrice: string;
  stopLossPrice: string;
  confidence: number;
  status: string;
  result?: string;
  createdAt: string;
  closedAt?: string;
}

export interface MarketData {
  id: number;
  pair: string;
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: number;
}

export interface SignalAccuracy {
  pair: string;
  accuracy: number;
  totalSignals: number;
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalSignals: number;
  revenue: number;
}

export interface LearningContent {
  id: number;
  title: string;
  description: string;
  category: string;
  lessons: number;
  estimatedMinutes: number;
  icon: string;
  createdAt: string;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscriptionTier: string;
  createdAt: string;
  updatedAt: string;
}
