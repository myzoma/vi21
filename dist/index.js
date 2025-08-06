// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  watchlistItems;
  priceAlerts;
  analysisResults;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.watchlistItems = /* @__PURE__ */ new Map();
    this.priceAlerts = /* @__PURE__ */ new Map();
    this.analysisResults = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getWatchlistByUserId(userId) {
    return Array.from(this.watchlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  async addToWatchlist(insertItem) {
    const id = randomUUID();
    const item = {
      ...insertItem,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      userId: insertItem.userId || null
    };
    this.watchlistItems.set(id, item);
    return item;
  }
  async removeFromWatchlist(id) {
    return this.watchlistItems.delete(id);
  }
  async getAlertsByUserId(userId) {
    return Array.from(this.priceAlerts.values()).filter(
      (alert) => alert.userId === userId
    );
  }
  async createAlert(insertAlert) {
    const id = randomUUID();
    const alert = {
      ...insertAlert,
      id,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.priceAlerts.set(id, alert);
    return alert;
  }
  async updateAlert(id, updates) {
    const alert = this.priceAlerts.get(id);
    if (!alert) return void 0;
    const updatedAlert = { ...alert, ...updates };
    this.priceAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
  async deleteAlert(id) {
    return this.priceAlerts.delete(id);
  }
  async getAnalysisResult(symbol, interval) {
    const key = `${symbol}_${interval}`;
    return Array.from(this.analysisResults.values()).find(
      (result) => result.symbol === symbol && result.interval === interval
    );
  }
  async saveAnalysisResult(insertResult) {
    const id = randomUUID();
    const result = {
      ...insertResult,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.analysisResults.set(id, result);
    return result;
  }
  async getRecentAnalyses(limit = 10) {
    return Array.from(this.analysisResults.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, limit);
  }
};
var storage = new MemStorage();

// server/services/binanceService.ts
var BinanceService = class {
  baseUrl = "https://www.okx.com/api/v5";
  async getSymbolPrice(symbol) {
    try {
      const okxSymbol = symbol.replace("USDT", "-USDT");
      const response = await fetch(`${this.baseUrl}/market/ticker?instId=${okxSymbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${symbol}`);
      }
      const data = await response.json();
      if (data.code !== "0" || !data.data || data.data.length === 0) {
        throw new Error(`No data available for ${symbol}`);
      }
      const tickerData = data.data[0];
      return {
        symbol,
        price: parseFloat(tickerData.last),
        change24h: parseFloat(tickerData.chgUtc8) * 100,
        // Convert to percentage
        volume24h: parseFloat(tickerData.vol24h),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  }
  async getKlineData(symbol, interval, limit = 100) {
    try {
      const okxSymbol = symbol.replace("USDT", "-USDT");
      const okxInterval = this.convertIntervalToOKX(interval);
      const response = await fetch(
        `${this.baseUrl}/market/candles?instId=${okxSymbol}&bar=${okxInterval}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch kline data for ${symbol}`);
      }
      const data = await response.json();
      if (data.code !== "0" || !data.data) {
        throw new Error(`No kline data available for ${symbol}`);
      }
      return data.data.map((kline) => [
        parseInt(kline[0]),
        // timestamp
        parseFloat(kline[1]),
        // open
        parseFloat(kline[2]),
        // high
        parseFloat(kline[3]),
        // low
        parseFloat(kline[4]),
        // close
        parseFloat(kline[5])
        // volume
      ]);
    } catch (error) {
      console.error(`Error fetching kline data for ${symbol}:`, error);
      return null;
    }
  }
  convertIntervalToOKX(interval) {
    const intervalMap = {
      "1m": "1m",
      "5m": "5m",
      "15m": "15m",
      "1h": "1H",
      "4h": "4H",
      "1d": "1D",
      "1w": "1W"
    };
    return intervalMap[interval] || "1H";
  }
  async getTopSymbols() {
    try {
      const response = await fetch(`${this.baseUrl}/market/tickers?instType=SPOT`);
      if (!response.ok) {
        throw new Error("Failed to fetch top symbols");
      }
      const data = await response.json();
      if (data.code !== "0" || !data.data) {
        throw new Error("No symbols data available");
      }
      const usdtPairs = data.data.filter((ticker) => ticker.instId.endsWith("-USDT")).sort((a, b) => parseFloat(b.vol24h) - parseFloat(a.vol24h)).slice(0, 20).map((ticker) => ticker.instId.replace("-USDT", "USDT"));
      return usdtPairs;
    } catch (error) {
      console.error("Error fetching top symbols:", error);
      return ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT"];
    }
  }
  async getExchangeInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/exchangeInfo`);
      if (!response.ok) {
        throw new Error("Failed to fetch exchange info");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching exchange info:", error);
      return null;
    }
  }
};
var binanceService = new BinanceService();

// server/services/technicalAnalysis.ts
var TechnicalAnalysisService = class {
  // Calculate RSI (Relative Strength Index)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }
  // Calculate MACD (Moving Average Convergence Divergence)
  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = this.calculateEMA(prices, fastPeriod);
    const emaSlow = this.calculateEMA(prices, slowPeriod);
    const macdLine = emaFast.map((fast, i) => fast - emaSlow[i]);
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
    const latest = macdLine.length - 1;
    return {
      macd: macdLine[latest] || 0,
      signal: signalLine[latest] || 0,
      histogram: histogram[latest] || 0
    };
  }
  // Calculate Bollinger Bands
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) {
      const price = prices[prices.length - 1] || 0;
      return {
        upper: price * 1.02,
        middle: price,
        lower: price * 0.98
      };
    }
    const sma = this.calculateSMA(prices, period);
    const latest = sma.length - 1;
    const middle = sma[latest];
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    return {
      upper: middle + standardDeviation * stdDev,
      middle,
      lower: middle - standardDeviation * stdDev
    };
  }
  // Calculate ADX (Average Directional Index)
  calculateADX(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return 25;
    const trueRanges = [];
    const plusDMs = [];
    const minusDMs = [];
    for (let i = 1; i < highs.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
      const plusDM = highs[i] - highs[i - 1] > lows[i - 1] - lows[i] && highs[i] - highs[i - 1] > 0 ? highs[i] - highs[i - 1] : 0;
      const minusDM = lows[i - 1] - lows[i] > highs[i] - highs[i - 1] && lows[i - 1] - lows[i] > 0 ? lows[i - 1] - lows[i] : 0;
      plusDMs.push(plusDM);
      minusDMs.push(minusDM);
    }
    const avgTR = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
    const avgPlusDM = plusDMs.slice(-period).reduce((sum, dm) => sum + dm, 0) / period;
    const avgMinusDM = minusDMs.slice(-period).reduce((sum, dm) => sum + dm, 0) / period;
    const plusDI = avgPlusDM / avgTR * 100;
    const minusDI = avgMinusDM / avgTR * 100;
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
    return dx || 25;
  }
  // Calculate Simple Moving Average
  calculateSMA(prices, period) {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }
  // Calculate Exponential Moving Average
  calculateEMA(prices, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    ema[0] = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = 1; i < prices.length - period + 1; i++) {
      ema[i] = (prices[i + period - 1] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    return ema;
  }
  // Calculate moving averages
  calculateMovingAverages(prices) {
    const ma20 = this.calculateSMA(prices, 20);
    const ma50 = this.calculateSMA(prices, 50);
    const ma200 = this.calculateSMA(prices, 200);
    return {
      ma20: ma20[ma20.length - 1] || prices[prices.length - 1] || 0,
      ma50: ma50[ma50.length - 1] || prices[prices.length - 1] || 0,
      ma200: ma200[ma200.length - 1] || prices[prices.length - 1] || 0
    };
  }
  // Main analysis function
  analyzeKlineData(klineData) {
    const closes = klineData.map((k) => k[4]);
    const highs = klineData.map((k) => k[2]);
    const lows = klineData.map((k) => k[3]);
    const rsi = this.calculateRSI(closes);
    const macd = this.calculateMACD(closes);
    const bollingerBands = this.calculateBollingerBands(closes);
    const adx = this.calculateADX(highs, lows, closes);
    const movingAverages = this.calculateMovingAverages(closes);
    return {
      rsi,
      macd,
      bollingerBands,
      adx,
      movingAverages
    };
  }
};
var technicalAnalysisService = new TechnicalAnalysisService();

// server/services/elliottWaveAnalyzer.ts
var ElliottWaveAnalyzer = class {
  // ZigZag algorithm to find pivot points
  findPivotPoints(klineData, deviation = 0.02) {
    const pivots = [];
    const highs = klineData.map((k) => k[2]);
    const lows = klineData.map((k) => k[3]);
    let lastPivot = null;
    for (let i = 1; i < klineData.length - 1; i++) {
      const isLocalHigh = highs[i] > highs[i - 1] && highs[i] > highs[i + 1];
      const isLocalLow = lows[i] < lows[i - 1] && lows[i] < lows[i + 1];
      if (isLocalHigh || isLocalLow) {
        const currentPivot = {
          index: i,
          price: isLocalHigh ? highs[i] : lows[i],
          type: isLocalHigh ? "high" : "low"
        };
        if (!lastPivot || this.isPivotSignificant(lastPivot, currentPivot, deviation)) {
          pivots.push(currentPivot);
          lastPivot = currentPivot;
        }
      }
    }
    return pivots;
  }
  isPivotSignificant(lastPivot, currentPivot, deviation) {
    const priceChange = Math.abs(currentPivot.price - lastPivot.price) / lastPivot.price;
    return priceChange >= deviation && lastPivot.type !== currentPivot.type;
  }
  // Analyze Elliott Wave pattern
  analyzeElliottWaves(klineData) {
    const pivots = this.findPivotPoints(klineData, 0.03);
    if (pivots.length < 5) {
      return this.createDefaultElliottWave(klineData);
    }
    const recentPivots = pivots.slice(-9);
    const waveStructure = this.identifyWaveStructure(recentPivots);
    const currentWave = this.getCurrentWave(waveStructure);
    const fibonacciLevels = this.calculateFibonacciLevels(recentPivots);
    const targets = this.calculateWaveTargets(recentPivots, currentWave);
    const confidence = this.calculateConfidence(waveStructure);
    return {
      currentWave,
      wavePattern: this.getWavePattern(waveStructure),
      confidence,
      fibonacciLevels,
      targets,
      waveStructure: waveStructure.map((wave, index) => ({
        wave: index + 1,
        startPrice: wave.startPrice,
        endPrice: wave.endPrice,
        status: index < currentWave ? "completed" : index === currentWave ? "current" : "pending"
      }))
    };
  }
  createDefaultElliottWave(klineData) {
    const currentPrice = klineData[klineData.length - 1][4];
    return {
      currentWave: 1,
      wavePattern: "Impulse Wave (5-3-5-3-5)",
      confidence: 0.5,
      fibonacciLevels: {
        support618: currentPrice * 0.95,
        support382: currentPrice * 0.97,
        resistance1272: currentPrice * 1.03,
        resistance1618: currentPrice * 1.05
      },
      targets: [currentPrice * 1.02, currentPrice * 1.05, currentPrice * 1.08],
      waveStructure: [
        {
          wave: 1,
          startPrice: currentPrice * 0.98,
          endPrice: currentPrice,
          status: "current"
        }
      ]
    };
  }
  identifyWaveStructure(pivots) {
    const waves = [];
    for (let i = 0; i < pivots.length - 1; i++) {
      waves.push({
        startPrice: pivots[i].price,
        endPrice: pivots[i + 1].price,
        direction: pivots[i + 1].price > pivots[i].price ? "up" : "down",
        magnitude: Math.abs(pivots[i + 1].price - pivots[i].price) / pivots[i].price
      });
    }
    return waves;
  }
  getCurrentWave(waveStructure) {
    if (waveStructure.length <= 2) return 1;
    if (waveStructure.length <= 4) return 2;
    if (waveStructure.length <= 6) return 3;
    if (waveStructure.length <= 8) return 4;
    return 5;
  }
  getWavePattern(waveStructure) {
    const upMoves = waveStructure.filter((w) => w.direction === "up").length;
    const downMoves = waveStructure.filter((w) => w.direction === "down").length;
    if (upMoves > downMoves) {
      return "Impulse Wave (Bullish 5-Wave Pattern)";
    } else if (downMoves > upMoves) {
      return "Impulse Wave (Bearish 5-Wave Pattern)";
    } else {
      return "Corrective Wave (3-Wave Pattern)";
    }
  }
  calculateFibonacciLevels(pivots) {
    if (pivots.length < 2) {
      const currentPrice = pivots[0]?.price || 0;
      return {
        support618: currentPrice * 0.95,
        support382: currentPrice * 0.97,
        resistance1272: currentPrice * 1.03,
        resistance1618: currentPrice * 1.05
      };
    }
    const recent = pivots.slice(-2);
    const high = Math.max(recent[0].price, recent[1].price);
    const low = Math.min(recent[0].price, recent[1].price);
    const range = high - low;
    return {
      support618: high - range * 0.618,
      support382: high - range * 0.382,
      resistance1272: low + range * 1.272,
      resistance1618: low + range * 1.618
    };
  }
  calculateWaveTargets(pivots, currentWave) {
    if (pivots.length < 2) return [];
    const lastPivot = pivots[pivots.length - 1];
    const targets = [];
    if (currentWave <= 3) {
      targets.push(lastPivot.price * 1.02);
      targets.push(lastPivot.price * 1.05);
      targets.push(lastPivot.price * 1.08);
    } else {
      targets.push(lastPivot.price * 0.98);
      targets.push(lastPivot.price * 0.95);
      targets.push(lastPivot.price * 0.92);
    }
    return targets;
  }
  calculateConfidence(waveStructure) {
    if (waveStructure.length === 0) return 0.5;
    let confidence = 0.6;
    const hasAlternation = this.checkAlternation(waveStructure);
    if (hasAlternation) confidence += 0.1;
    const hasProperProportions = this.checkWaveProportions(waveStructure);
    if (hasProperProportions) confidence += 0.1;
    return Math.min(Math.max(confidence, 0.3), 0.9);
  }
  checkAlternation(waveStructure) {
    if (waveStructure.length < 4) return false;
    const wave2 = waveStructure[1];
    const wave4 = waveStructure[3];
    return wave2.direction !== wave4.direction;
  }
  checkWaveProportions(waveStructure) {
    if (waveStructure.length < 3) return false;
    const wave1Mag = waveStructure[0]?.magnitude || 0;
    const wave3Mag = waveStructure[2]?.magnitude || 0;
    const wave5Mag = waveStructure[4]?.magnitude || 0;
    return wave3Mag >= Math.max(wave1Mag, wave5Mag);
  }
  // Generate trading signals based on Elliott Wave analysis
  generateTradingSignals(elliottWave, currentPrice) {
    const signals = [];
    if (elliottWave.currentWave === 3) {
      signals.push({
        signal: "BUY",
        strength: "STRONG",
        confidence: elliottWave.confidence,
        entryPrice: currentPrice,
        stopLoss: elliottWave.fibonacciLevels.support618,
        takeProfit: elliottWave.targets[2] || currentPrice * 1.08,
        description: "Wave 3 impulse pattern detected. Strong bullish momentum expected.",
        supportingFactors: [
          "Wave 3 typically the strongest wave",
          "Fibonacci extension targets aligned",
          "Volume confirmation expected"
        ]
      });
    }
    if (elliottWave.currentWave === 5) {
      signals.push({
        signal: "BUY",
        strength: "MEDIUM",
        confidence: Math.max(elliottWave.confidence - 0.1, 0.3),
        entryPrice: currentPrice,
        stopLoss: elliottWave.fibonacciLevels.support382,
        takeProfit: elliottWave.targets[1] || currentPrice * 1.05,
        description: "Final wave of impulse pattern. Take profits near completion.",
        supportingFactors: [
          "Wave 5 completion expected",
          "Risk management critical",
          "Prepare for reversal"
        ]
      });
    }
    if (elliottWave.currentWave === 2 || elliottWave.currentWave === 4) {
      signals.push({
        signal: "HOLD",
        strength: "WEAK",
        confidence: 0.6,
        entryPrice: currentPrice,
        stopLoss: currentPrice * 0.95,
        takeProfit: elliottWave.fibonacciLevels.resistance1272,
        description: "Corrective wave in progress. Wait for completion before entering.",
        supportingFactors: [
          "Corrective wave pattern",
          "Fibonacci support levels nearby",
          "Patience required"
        ]
      });
    }
    return signals;
  }
};
var elliottWaveAnalyzer = new ElliottWaveAnalyzer();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var watchlistItems = pgTable("watchlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  symbol: text("symbol").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  symbol: text("symbol").notNull(),
  condition: text("condition").notNull(),
  // 'above' or 'below'
  targetPrice: real("target_price").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  interval: text("interval").notNull(),
  elliottWaveData: jsonb("elliott_wave_data"),
  technicalIndicators: jsonb("technical_indicators"),
  tradingSignals: jsonb("trading_signals"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertWatchlistItemSchema = createInsertSchema(watchlistItems).pick({
  symbol: true,
  userId: true
});
var insertPriceAlertSchema = createInsertSchema(priceAlerts).pick({
  symbol: true,
  condition: true,
  targetPrice: true,
  userId: true
});
var insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  symbol: true,
  interval: true,
  elliottWaveData: true,
  technicalIndicators: true,
  tradingSignals: true,
  confidence: true
});
var MarketDataSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change24h: z.number(),
  volume24h: z.number(),
  marketCap: z.number().optional(),
  timestamp: z.number()
});
var TechnicalIndicatorSchema = z.object({
  rsi: z.number(),
  macd: z.object({
    macd: z.number(),
    signal: z.number(),
    histogram: z.number()
  }),
  bollingerBands: z.object({
    upper: z.number(),
    middle: z.number(),
    lower: z.number()
  }),
  adx: z.number(),
  movingAverages: z.object({
    ma20: z.number(),
    ma50: z.number(),
    ma200: z.number()
  })
});
var ElliottWaveSchema = z.object({
  currentWave: z.number(),
  wavePattern: z.string(),
  confidence: z.number(),
  fibonacciLevels: z.object({
    support618: z.number(),
    support382: z.number(),
    resistance1272: z.number(),
    resistance1618: z.number()
  }),
  targets: z.array(z.number()),
  waveStructure: z.array(z.object({
    wave: z.number(),
    startPrice: z.number(),
    endPrice: z.number(),
    status: z.string()
  }))
});
var TradingSignalSchema = z.object({
  signal: z.enum(["BUY", "SELL", "HOLD"]),
  strength: z.enum(["WEAK", "MEDIUM", "STRONG"]),
  confidence: z.number(),
  entryPrice: z.number(),
  stopLoss: z.number(),
  takeProfit: z.number(),
  description: z.string(),
  supportingFactors: z.array(z.string())
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/market/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const marketData = await binanceService.getSymbolPrice(symbol.toUpperCase());
      if (!marketData) {
        return res.status(404).json({ error: `Symbol ${symbol} not found or unavailable` });
      }
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });
  app2.get("/api/klines/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      const limit = parseInt(req.query.limit) || 100;
      const klineData = await binanceService.getKlineData(symbol.toUpperCase(), interval, limit);
      if (!klineData) {
        return res.status(404).json({ error: `Unable to fetch kline data for ${symbol}` });
      }
      res.json(klineData);
    } catch (error) {
      console.error("Error fetching kline data:", error);
      res.status(500).json({ error: "Failed to fetch kline data" });
    }
  });
  app2.get("/api/symbols/top", async (req, res) => {
    try {
      const symbols = await binanceService.getTopSymbols();
      res.json(symbols);
    } catch (error) {
      console.error("Error fetching top symbols:", error);
      res.status(500).json({ error: "Failed to fetch top symbols" });
    }
  });
  app2.post("/api/analyze/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      const klineData = await binanceService.getKlineData(symbol.toUpperCase(), interval, 200);
      if (!klineData) {
        return res.status(400).json({ error: "Unable to fetch market data for analysis" });
      }
      const technicalIndicators = technicalAnalysisService.analyzeKlineData(klineData);
      const elliottWaveData = elliottWaveAnalyzer.analyzeElliottWaves(klineData);
      const currentPrice = klineData[klineData.length - 1][4];
      const tradingSignals = elliottWaveAnalyzer.generateTradingSignals(elliottWaveData, currentPrice);
      const analysisResult = await storage.saveAnalysisResult({
        symbol: symbol.toUpperCase(),
        interval,
        elliottWaveData,
        technicalIndicators,
        tradingSignals,
        confidence: elliottWaveData.confidence
      });
      res.json({
        symbol: symbol.toUpperCase(),
        interval,
        marketData: {
          currentPrice,
          timestamp: Date.now()
        },
        technicalIndicators,
        elliottWaveData,
        tradingSignals,
        confidence: elliottWaveData.confidence,
        analysisId: analysisResult.id
      });
    } catch (error) {
      console.error("Error performing analysis:", error);
      res.status(500).json({ error: "Analysis failed. Please try again." });
    }
  });
  app2.get("/api/analysis/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      const result = await storage.getAnalysisResult(symbol.toUpperCase(), interval);
      if (!result) {
        return res.status(404).json({ error: "No analysis found for this symbol and interval" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });
  app2.get("/api/watchlist", async (req, res) => {
    try {
      const userId = "demo-user";
      const watchlist = await storage.getWatchlistByUserId(userId);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });
  app2.post("/api/watchlist", async (req, res) => {
    try {
      const data = insertWatchlistItemSchema.parse({
        ...req.body,
        userId: "demo-user"
      });
      const item = await storage.addToWatchlist(data);
      res.json(item);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(400).json({ error: "Failed to add to watchlist" });
    }
  });
  app2.delete("/api/watchlist/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removeFromWatchlist(id);
      if (!success) {
        return res.status(404).json({ error: "Watchlist item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });
  app2.get("/api/alerts", async (req, res) => {
    try {
      const userId = "demo-user";
      const alerts = await storage.getAlertsByUserId(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });
  app2.post("/api/alerts", async (req, res) => {
    try {
      const data = insertPriceAlertSchema.parse({
        ...req.body,
        userId: "demo-user"
      });
      const alert = await storage.createAlert(data);
      res.json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ error: "Failed to create alert" });
    }
  });
  app2.delete("/api/alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAlert(id);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });
  app2.get("/api/analyses/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching recent analyses:", error);
      res.status(500).json({ error: "Failed to fetch recent analyses" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  base: "/vi2/",
  // Add base path for GitHub Pages
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
