import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { binanceService } from "./services/binanceService";
import { technicalAnalysisService } from "./services/technicalAnalysis";
import { elliottWaveAnalyzer } from "./services/elliottWaveAnalyzer";
import { insertWatchlistItemSchema, insertPriceAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Market data endpoints
  app.get("/api/market/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const marketData = await binanceService.getSymbolPrice(symbol.toUpperCase());
      
      if (!marketData) {
        return res.status(404).json({ error: `Symbol ${symbol} not found or unavailable` });
      }
      
      res.json(marketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  app.get("/api/klines/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const klineData = await binanceService.getKlineData(symbol.toUpperCase(), interval, limit);
      
      if (!klineData) {
        return res.status(404).json({ error: `Unable to fetch kline data for ${symbol}` });
      }
      
      res.json(klineData);
    } catch (error) {
      console.error('Error fetching kline data:', error);
      res.status(500).json({ error: 'Failed to fetch kline data' });
    }
  });

  app.get("/api/symbols/top", async (req, res) => {
    try {
      const symbols = await binanceService.getTopSymbols();
      res.json(symbols);
    } catch (error) {
      console.error('Error fetching top symbols:', error);
      res.status(500).json({ error: 'Failed to fetch top symbols' });
    }
  });

  // Analysis endpoints
  app.post("/api/analyze/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      
      // Get kline data
      const klineData = await binanceService.getKlineData(symbol.toUpperCase(), interval, 200);
      if (!klineData) {
        return res.status(400).json({ error: 'Unable to fetch market data for analysis' });
      }

      // Perform technical analysis
      const technicalIndicators = technicalAnalysisService.analyzeKlineData(klineData);
      
      // Perform Elliott Wave analysis
      const elliottWaveData = elliottWaveAnalyzer.analyzeElliottWaves(klineData);
      
      // Generate trading signals
      const currentPrice = klineData[klineData.length - 1][4];
      const tradingSignals = elliottWaveAnalyzer.generateTradingSignals(elliottWaveData, currentPrice);

      // Save analysis results
      const analysisResult = await storage.saveAnalysisResult({
        symbol: symbol.toUpperCase(),
        interval,
        elliottWaveData,
        technicalIndicators,
        tradingSignals,
        confidence: elliottWaveData.confidence,
      });

      res.json({
        symbol: symbol.toUpperCase(),
        interval,
        marketData: {
          currentPrice,
          timestamp: Date.now(),
        },
        technicalIndicators,
        elliottWaveData,
        tradingSignals,
        confidence: elliottWaveData.confidence,
        analysisId: analysisResult.id,
      });
    } catch (error) {
      console.error('Error performing analysis:', error);
      res.status(500).json({ error: 'Analysis failed. Please try again.' });
    }
  });

  app.get("/api/analysis/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      
      const result = await storage.getAnalysisResult(symbol.toUpperCase(), interval);
      if (!result) {
        return res.status(404).json({ error: 'No analysis found for this symbol and interval' });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  });

  // Watchlist endpoints
  app.get("/api/watchlist", async (req, res) => {
    try {
      // For demo purposes, use a default user ID
      const userId = "demo-user";
      const watchlist = await storage.getWatchlistByUserId(userId);
      res.json(watchlist);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const data = insertWatchlistItemSchema.parse({
        ...req.body,
        userId: "demo-user"
      });
      
      const item = await storage.addToWatchlist(data);
      res.json(item);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      res.status(400).json({ error: 'Failed to add to watchlist' });
    }
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removeFromWatchlist(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Watchlist item not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
  });

  // Price alerts endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const userId = "demo-user";
      const alerts = await storage.getAlertsByUserId(userId);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const data = insertPriceAlertSchema.parse({
        ...req.body,
        userId: "demo-user"
      });
      
      const alert = await storage.createAlert(data);
      res.json(alert);
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(400).json({ error: 'Failed to create alert' });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAlert(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  });

  // Recent analyses endpoint
  app.get("/api/analyses/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching recent analyses:', error);
      res.status(500).json({ error: 'Failed to fetch recent analyses' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
