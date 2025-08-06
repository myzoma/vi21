// Re-export types from shared schema for frontend use
export type {
  MarketData,
  WatchlistItem,
  PriceAlert,
  AnalysisResult
} from "@shared/schema";

// Technical Analysis Types
export interface TechnicalIndicator {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  ema20: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  adx: number;
}

export interface ElliottWave {
  pattern: string;
  currentWave: number;
  waveLabels: string[];
  fibonacciLevels: {
    support382: number;
    support618: number;
    resistance1272: number;
    resistance1618: number;
  };
  pivotPoints: Array<{
    x: number;
    y: number;
    type: 'high' | 'low';
  }>;
  confidence: number;
}

export interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  description: string;
  timestamp: number;
}

// Frontend-specific types
export interface AnalysisResponse {
  symbol: string;
  interval: string;
  marketData: {
    currentPrice: number;
    timestamp: number;
  };
  technicalIndicators: TechnicalIndicator;
  elliottWaveData: ElliottWave;
  tradingSignals: TradingSignal[];
  confidence: number;
  analysisId: string;
}

export interface SymbolSuggestion {
  symbol: string;
  price?: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
