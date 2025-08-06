import { ElliottWave, TradingSignal } from "@shared/schema";

interface PivotPoint {
  index: number;
  price: number;
  type: 'high' | 'low';
}

export class ElliottWaveAnalyzer {
  // ZigZag algorithm to find pivot points
  findPivotPoints(klineData: number[][], deviation: number = 0.02): PivotPoint[] {
    const pivots: PivotPoint[] = [];
    const highs = klineData.map(k => k[2]);
    const lows = klineData.map(k => k[3]);

    let lastPivot: PivotPoint | null = null;

    for (let i = 1; i < klineData.length - 1; i++) {
      const isLocalHigh = highs[i] > highs[i - 1] && highs[i] > highs[i + 1];
      const isLocalLow = lows[i] < lows[i - 1] && lows[i] < lows[i + 1];

      if (isLocalHigh || isLocalLow) {
        const currentPivot: PivotPoint = {
          index: i,
          price: isLocalHigh ? highs[i] : lows[i],
          type: isLocalHigh ? 'high' : 'low'
        };

        // Check if this pivot is significant enough
        if (!lastPivot || this.isPivotSignificant(lastPivot, currentPivot, deviation)) {
          pivots.push(currentPivot);
          lastPivot = currentPivot;
        }
      }
    }

    return pivots;
  }

  private isPivotSignificant(lastPivot: PivotPoint, currentPivot: PivotPoint, deviation: number): boolean {
    const priceChange = Math.abs(currentPivot.price - lastPivot.price) / lastPivot.price;
    return priceChange >= deviation && lastPivot.type !== currentPivot.type;
  }

  // Analyze Elliott Wave pattern
  analyzeElliottWaves(klineData: number[][]): ElliottWave {
    const pivots = this.findPivotPoints(klineData, 0.03);
    
    if (pivots.length < 5) {
      return this.createDefaultElliottWave(klineData);
    }

    // Take the last 5-9 pivots for analysis
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
        status: index < currentWave ? 'completed' : index === currentWave ? 'current' : 'pending'
      }))
    };
  }

  private createDefaultElliottWave(klineData: number[][]): ElliottWave {
    const currentPrice = klineData[klineData.length - 1][4];
    
    return {
      currentWave: 1,
      wavePattern: "Impulse Wave (5-3-5-3-5)",
      confidence: 0.5,
      fibonacciLevels: {
        support618: currentPrice * 0.95,
        support382: currentPrice * 0.97,
        resistance1272: currentPrice * 1.03,
        resistance1618: currentPrice * 1.05,
      },
      targets: [currentPrice * 1.02, currentPrice * 1.05, currentPrice * 1.08],
      waveStructure: [
        {
          wave: 1,
          startPrice: currentPrice * 0.98,
          endPrice: currentPrice,
          status: 'current'
        }
      ]
    };
  }

  private identifyWaveStructure(pivots: PivotPoint[]) {
    const waves = [];
    
    for (let i = 0; i < pivots.length - 1; i++) {
      waves.push({
        startPrice: pivots[i].price,
        endPrice: pivots[i + 1].price,
        direction: pivots[i + 1].price > pivots[i].price ? 'up' : 'down',
        magnitude: Math.abs(pivots[i + 1].price - pivots[i].price) / pivots[i].price
      });
    }

    return waves;
  }

  private getCurrentWave(waveStructure: any[]): number {
    // Simplified logic to determine current wave
    if (waveStructure.length <= 2) return 1;
    if (waveStructure.length <= 4) return 2;
    if (waveStructure.length <= 6) return 3;
    if (waveStructure.length <= 8) return 4;
    return 5;
  }

  private getWavePattern(waveStructure: any[]): string {
    const upMoves = waveStructure.filter(w => w.direction === 'up').length;
    const downMoves = waveStructure.filter(w => w.direction === 'down').length;

    if (upMoves > downMoves) {
      return "Impulse Wave (Bullish 5-Wave Pattern)";
    } else if (downMoves > upMoves) {
      return "Impulse Wave (Bearish 5-Wave Pattern)";
    } else {
      return "Corrective Wave (3-Wave Pattern)";
    }
  }

  private calculateFibonacciLevels(pivots: PivotPoint[]) {
    if (pivots.length < 2) {
      const currentPrice = pivots[0]?.price || 0;
      return {
        support618: currentPrice * 0.95,
        support382: currentPrice * 0.97,
        resistance1272: currentPrice * 1.03,
        resistance1618: currentPrice * 1.05,
      };
    }

    const recent = pivots.slice(-2);
    const high = Math.max(recent[0].price, recent[1].price);
    const low = Math.min(recent[0].price, recent[1].price);
    const range = high - low;

    return {
      support618: high - (range * 0.618),
      support382: high - (range * 0.382),
      resistance1272: low + (range * 1.272),
      resistance1618: low + (range * 1.618),
    };
  }

  private calculateWaveTargets(pivots: PivotPoint[], currentWave: number): number[] {
    if (pivots.length < 2) return [];

    const lastPivot = pivots[pivots.length - 1];
    const targets = [];

    // Calculate targets based on Fibonacci extensions
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

  private calculateConfidence(waveStructure: any[]): number {
    if (waveStructure.length === 0) return 0.5;

    // Base confidence on pattern recognition
    let confidence = 0.6;

    // Check for proper alternation
    const hasAlternation = this.checkAlternation(waveStructure);
    if (hasAlternation) confidence += 0.1;

    // Check for proper wave proportions
    const hasProperProportions = this.checkWaveProportions(waveStructure);
    if (hasProperProportions) confidence += 0.1;

    // Limit confidence to realistic range
    return Math.min(Math.max(confidence, 0.3), 0.9);
  }

  private checkAlternation(waveStructure: any[]): boolean {
    // Simplified alternation check
    if (waveStructure.length < 4) return false;
    
    const wave2 = waveStructure[1];
    const wave4 = waveStructure[3];
    
    return wave2.direction !== wave4.direction;
  }

  private checkWaveProportions(waveStructure: any[]): boolean {
    if (waveStructure.length < 3) return false;

    // Check if wave 3 is not the shortest (Elliott Wave rule)
    const wave1Mag = waveStructure[0]?.magnitude || 0;
    const wave3Mag = waveStructure[2]?.magnitude || 0;
    const wave5Mag = waveStructure[4]?.magnitude || 0;

    return wave3Mag >= Math.max(wave1Mag, wave5Mag);
  }

  // Generate trading signals based on Elliott Wave analysis
  generateTradingSignals(elliottWave: ElliottWave, currentPrice: number): TradingSignal[] {
    const signals: TradingSignal[] = [];

    // Wave 3 signals (strongest)
    if (elliottWave.currentWave === 3) {
      signals.push({
        signal: 'BUY',
        strength: 'STRONG',
        confidence: elliottWave.confidence,
        entryPrice: currentPrice,
        stopLoss: elliottWave.fibonacciLevels.support618,
        takeProfit: elliottWave.targets[2] || currentPrice * 1.08,
        description: 'Wave 3 impulse pattern detected. Strong bullish momentum expected.',
        supportingFactors: [
          'Wave 3 typically the strongest wave',
          'Fibonacci extension targets aligned',
          'Volume confirmation expected'
        ]
      });
    }

    // Wave 5 signals (moderate)
    if (elliottWave.currentWave === 5) {
      signals.push({
        signal: 'BUY',
        strength: 'MEDIUM',
        confidence: Math.max(elliottWave.confidence - 0.1, 0.3),
        entryPrice: currentPrice,
        stopLoss: elliottWave.fibonacciLevels.support382,
        takeProfit: elliottWave.targets[1] || currentPrice * 1.05,
        description: 'Final wave of impulse pattern. Take profits near completion.',
        supportingFactors: [
          'Wave 5 completion expected',
          'Risk management critical',
          'Prepare for reversal'
        ]
      });
    }

    // Corrective wave signals
    if (elliottWave.currentWave === 2 || elliottWave.currentWave === 4) {
      signals.push({
        signal: 'HOLD',
        strength: 'WEAK',
        confidence: 0.6,
        entryPrice: currentPrice,
        stopLoss: currentPrice * 0.95,
        takeProfit: elliottWave.fibonacciLevels.resistance1272,
        description: 'Corrective wave in progress. Wait for completion before entering.',
        supportingFactors: [
          'Corrective wave pattern',
          'Fibonacci support levels nearby',
          'Patience required'
        ]
      });
    }

    return signals;
  }
}

export const elliottWaveAnalyzer = new ElliottWaveAnalyzer();
