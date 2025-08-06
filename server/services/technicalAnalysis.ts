import { TechnicalIndicator } from "@shared/schema";

export class TechnicalAnalysisService {
  // Calculate RSI (Relative Strength Index)
  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
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

    // Calculate RSI for remaining periods
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Calculate MACD (Moving Average Convergence Divergence)
  calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const emaFast = this.calculateEMA(prices, fastPeriod);
    const emaSlow = this.calculateEMA(prices, slowPeriod);
    
    const macdLine = emaFast.map((fast, i) => fast - emaSlow[i]);
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

    const latest = macdLine.length - 1;
    return {
      macd: macdLine[latest] || 0,
      signal: signalLine[latest] || 0,
      histogram: histogram[latest] || 0,
    };
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    if (prices.length < period) {
      const price = prices[prices.length - 1] || 0;
      return {
        upper: price * 1.02,
        middle: price,
        lower: price * 0.98,
      };
    }

    const sma = this.calculateSMA(prices, period);
    const latest = sma.length - 1;
    const middle = sma[latest];

    // Calculate standard deviation
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: middle + (standardDeviation * stdDev),
      middle,
      lower: middle - (standardDeviation * stdDev),
    };
  }

  // Calculate ADX (Average Directional Index)
  calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (highs.length < period + 1) return 25;

    const trueRanges: number[] = [];
    const plusDMs: number[] = [];
    const minusDMs: number[] = [];

    for (let i = 1; i < highs.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);

      const plusDM = highs[i] - highs[i - 1] > lows[i - 1] - lows[i] && highs[i] - highs[i - 1] > 0 
        ? highs[i] - highs[i - 1] : 0;
      const minusDM = lows[i - 1] - lows[i] > highs[i] - highs[i - 1] && lows[i - 1] - lows[i] > 0 
        ? lows[i - 1] - lows[i] : 0;

      plusDMs.push(plusDM);
      minusDMs.push(minusDM);
    }

    // Simplified ADX calculation
    const avgTR = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
    const avgPlusDM = plusDMs.slice(-period).reduce((sum, dm) => sum + dm, 0) / period;
    const avgMinusDM = minusDMs.slice(-period).reduce((sum, dm) => sum + dm, 0) / period;

    const plusDI = (avgPlusDM / avgTR) * 100;
    const minusDI = (avgMinusDM / avgTR) * 100;

    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
    return dx || 25;
  }

  // Calculate Simple Moving Average
  calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  // Calculate Exponential Moving Average
  calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    // First EMA is SMA
    ema[0] = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calculate EMA for remaining periods
    for (let i = 1; i < prices.length - period + 1; i++) {
      ema[i] = (prices[i + period - 1] - ema[i - 1]) * multiplier + ema[i - 1];
    }

    return ema;
  }

  // Calculate moving averages
  calculateMovingAverages(prices: number[]) {
    const ma20 = this.calculateSMA(prices, 20);
    const ma50 = this.calculateSMA(prices, 50);
    const ma200 = this.calculateSMA(prices, 200);

    return {
      ma20: ma20[ma20.length - 1] || prices[prices.length - 1] || 0,
      ma50: ma50[ma50.length - 1] || prices[prices.length - 1] || 0,
      ma200: ma200[ma200.length - 1] || prices[prices.length - 1] || 0,
    };
  }

  // Main analysis function
  analyzeKlineData(klineData: number[][]): TechnicalIndicator {
    const closes = klineData.map(k => k[4]); // closing prices
    const highs = klineData.map(k => k[2]); // high prices
    const lows = klineData.map(k => k[3]); // low prices

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
      movingAverages,
    };
  }
}

export const technicalAnalysisService = new TechnicalAnalysisService();
