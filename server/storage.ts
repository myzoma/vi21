import { type User, type InsertUser, type WatchlistItem, type InsertWatchlistItem, type PriceAlert, type InsertPriceAlert, type AnalysisResult, type InsertAnalysisResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Watchlist management
  getWatchlistByUserId(userId: string): Promise<WatchlistItem[]>;
  addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(id: string): Promise<boolean>;

  // Price alerts management
  getAlertsByUserId(userId: string): Promise<PriceAlert[]>;
  createAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updateAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert | undefined>;
  deleteAlert(id: string): Promise<boolean>;

  // Analysis results
  getAnalysisResult(symbol: string, interval: string): Promise<AnalysisResult | undefined>;
  saveAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getRecentAnalyses(limit?: number): Promise<AnalysisResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private watchlistItems: Map<string, WatchlistItem>;
  private priceAlerts: Map<string, PriceAlert>;
  private analysisResults: Map<string, AnalysisResult>;

  constructor() {
    this.users = new Map();
    this.watchlistItems = new Map();
    this.priceAlerts = new Map();
    this.analysisResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWatchlistByUserId(userId: string): Promise<WatchlistItem[]> {
    return Array.from(this.watchlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToWatchlist(insertItem: InsertWatchlistItem): Promise<WatchlistItem> {
    const id = randomUUID();
    const item: WatchlistItem = { 
      ...insertItem, 
      id, 
      createdAt: new Date(),
      userId: insertItem.userId || null
    };
    this.watchlistItems.set(id, item);
    return item;
  }

  async removeFromWatchlist(id: string): Promise<boolean> {
    return this.watchlistItems.delete(id);
  }

  async getAlertsByUserId(userId: string): Promise<PriceAlert[]> {
    return Array.from(this.priceAlerts.values()).filter(
      (alert) => alert.userId === userId
    );
  }

  async createAlert(insertAlert: InsertPriceAlert): Promise<PriceAlert> {
    const id = randomUUID();
    const alert: PriceAlert = { 
      ...insertAlert, 
      id, 
      isActive: true,
      createdAt: new Date() 
    };
    this.priceAlerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert | undefined> {
    const alert = this.priceAlerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...updates };
    this.priceAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteAlert(id: string): Promise<boolean> {
    return this.priceAlerts.delete(id);
  }

  async getAnalysisResult(symbol: string, interval: string): Promise<AnalysisResult | undefined> {
    const key = `${symbol}_${interval}`;
    return Array.from(this.analysisResults.values()).find(
      (result) => result.symbol === symbol && result.interval === interval
    );
  }

  async saveAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = randomUUID();
    const result: AnalysisResult = { 
      ...insertResult, 
      id, 
      createdAt: new Date() 
    };
    this.analysisResults.set(id, result);
    return result;
  }

  async getRecentAnalyses(limit: number = 10): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
