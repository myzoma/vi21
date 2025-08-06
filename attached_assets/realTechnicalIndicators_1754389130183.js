/**
 * مؤشرات تقنية حقيقية ودقيقة
 * Real Technical Indicators - No fake data
 */
class RealTechnicalIndicators {
    constructor() {
        this.name = "Real Technical Indicators";
        this.version = "1.0.0";
    }

    /**
     * حساب المتوسط المتحرك البسيط (SMA)
     * Simple Moving Average
     */
    calculateSMA(data, period) {
        if (!data || data.length < period) return null;
        
        const sma = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += parseFloat(data[i - j].close);
            }
            sma.push({
                index: i,
                value: sum / period,
                timestamp: data[i].timestamp
            });
        }
        return sma;
    }

    /**
     * حساب المتوسط المتحرك الأسي (EMA)
     * Exponential Moving Average
     */
    calculateEMA(data, period) {
        if (!data || data.length < period) return null;
        
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        // حساب SMA للفترة الأولى
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += parseFloat(data[i].close);
        }
        let emaValue = sum / period;
        
        ema.push({
            index: period - 1,
            value: emaValue,
            timestamp: data[period - 1].timestamp
        });
        
        // حساب باقي قيم EMA
        for (let i = period; i < data.length; i++) {
            emaValue = (parseFloat(data[i].close) * multiplier) + (emaValue * (1 - multiplier));
            ema.push({
                index: i,
                value: emaValue,
                timestamp: data[i].timestamp
            });
        }
        
        return ema;
    }

    /**
     * حساب مؤشر القوة النسبية (RSI)
     * Relative Strength Index
     */
    calculateRSI(data, period = 14) {
        if (!data || data.length < period + 1) return null;
        
        const rsi = [];
        let gains = [];
        let losses = [];
        
        // حساب التغييرات الأولية
        for (let i = 1; i <= period; i++) {
            const change = parseFloat(data[i].close) - parseFloat(data[i - 1].close);
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        // حساب متوسط الأرباح والخسائر الأولي
        let avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
        let avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;
        
        // حساب RSI الأول
        let rs = avgGain / avgLoss;
        let rsiValue = 100 - (100 / (1 + rs));
        
        rsi.push({
            index: period,
            value: rsiValue,
            timestamp: data[period].timestamp
        });
        
        // حساب باقي قيم RSI باستخدام Smoothed Moving Average
        for (let i = period + 1; i < data.length; i++) {
            const change = parseFloat(data[i].close) - parseFloat(data[i - 1].close);
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? Math.abs(change) : 0;
            
            avgGain = ((avgGain * (period - 1)) + gain) / period;
            avgLoss = ((avgLoss * (period - 1)) + loss) / period;
            
            rs = avgGain / avgLoss;
            rsiValue = 100 - (100 / (1 + rs));
            
            rsi.push({
                index: i,
                value: rsiValue,
                timestamp: data[i].timestamp
            });
        }
        
        return rsi;
    }

    /**
     * حساب مؤشر MACD
     * Moving Average Convergence Divergence
     */
    calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        if (!data || data.length < slowPeriod) return null;
        
        const fastEMA = this.calculateEMA(data, fastPeriod);
        const slowEMA = this.calculateEMA(data, slowPeriod);
        
        if (!fastEMA || !slowEMA) return null;
        
        const macdLine = [];
        const startIndex = slowPeriod - 1;
        
        // حساب خط MACD
        for (let i = startIndex; i < data.length; i++) {
            const fastValue = fastEMA.find(item => item.index === i)?.value;
            const slowValue = slowEMA.find(item => item.index === i)?.value;
            
            if (fastValue && slowValue) {
                macdLine.push({
                    index: i,
                    value: fastValue - slowValue,
                    timestamp: data[i].timestamp
                });
            }
        }
        
        // حساب خط الإشارة (EMA للـ MACD)
        const signalLine = this.calculateEMA(
            macdLine.map(item => ({ close: item.value, timestamp: item.timestamp })), 
            signalPeriod
        );
        
        // حساب الهستوغرام
        const histogram = [];
        if (signalLine) {
            for (let i = 0; i < signalLine.length; i++) {
                const macdValue = macdLine[i + signalPeriod - 1]?.value;
                const signalValue = signalLine[i].value;
                
                if (macdValue !== undefined && signalValue !== undefined) {
                    histogram.push({
                        index: signalLine[i].index,
                        value: macdValue - signalValue,
                        timestamp: signalLine[i].timestamp
                    });
                }
            }
        }
        
        return {
            macdLine: macdLine,
            signalLine: signalLine,
            histogram: histogram
        };
    }

    /**
     * حساب البولنجر باندز
     * Bollinger Bands
     */
    calculateBollingerBands(data, period = 20, multiplier = 2) {
        if (!data || data.length < period) return null;
        
        const sma = this.calculateSMA(data, period);
        if (!sma) return null;
        
        const bands = [];
        
        for (let i = 0; i < sma.length; i++) {
            const dataIndex = sma[i].index;
            const middleBand = sma[i].value;
            
            // حساب الانحراف المعياري
            let sumSquaredDiff = 0;
            for (let j = 0; j < period; j++) {
                const price = parseFloat(data[dataIndex - j].close);
                const diff = price - middleBand;
                sumSquaredDiff += diff * diff;
            }
            
            const standardDeviation = Math.sqrt(sumSquaredDiff / period);
            const upperBand = middleBand + (multiplier * standardDeviation);
            const lowerBand = middleBand - (multiplier * standardDeviation);
            
            bands.push({
                index: dataIndex,
                upper: upperBand,
                middle: middleBand,
                lower: lowerBand,
                timestamp: data[dataIndex].timestamp
            });
        }
        
        return bands;
    }

    /**
     * حساب مؤشر ستوكاستيك
     * Stochastic Oscillator
     */
    calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
        if (!data || data.length < kPeriod) return null;
        
        const stochastic = [];
        
        for (let i = kPeriod - 1; i < data.length; i++) {
            // العثور على أعلى وأقل سعر في الفترة
            let highest = -Infinity;
            let lowest = Infinity;
            
            for (let j = 0; j < kPeriod; j++) {
                const candle = data[i - j];
                highest = Math.max(highest, parseFloat(candle.high));
                lowest = Math.min(lowest, parseFloat(candle.low));
            }
            
            // حساب %K
            const currentClose = parseFloat(data[i].close);
            const kValue = ((currentClose - lowest) / (highest - lowest)) * 100;
            
            stochastic.push({
                index: i,
                k: kValue,
                timestamp: data[i].timestamp
            });
        }
        
        // حساب %D (المتوسط المتحرك لـ %K)
        for (let i = dPeriod - 1; i < stochastic.length; i++) {
            let sum = 0;
            for (let j = 0; j < dPeriod; j++) {
                sum += stochastic[i - j].k;
            }
            stochastic[i].d = sum / dPeriod;
        }
        
        return stochastic;
    }

    /**
     * حساب مؤشر ADX (Average Directional Index)
     * قوة الاتجاه
     */
    calculateADX(data, period = 14) {
        if (!data || data.length < period + 1) return null;
        
        const results = [];
        const trueRanges = [];
        const plusDMs = [];
        const minusDMs = [];
        
        // حساب True Range و Directional Movements
        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            const previous = data[i - 1];
            
            const high = parseFloat(current.high);
            const low = parseFloat(current.low);
            const close = parseFloat(current.close);
            const prevHigh = parseFloat(previous.high);
            const prevLow = parseFloat(previous.low);
            const prevClose = parseFloat(previous.close);
            
            // True Range
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trueRanges.push(tr);
            
            // Directional Movements
            const plusDM = (high - prevHigh > prevLow - low) ? Math.max(high - prevHigh, 0) : 0;
            const minusDM = (prevLow - low > high - prevHigh) ? Math.max(prevLow - low, 0) : 0;
            
            plusDMs.push(plusDM);
            minusDMs.push(minusDM);
        }
        
        // حساب Smoothed averages
        if (trueRanges.length >= period) {
            for (let i = period - 1; i < trueRanges.length; i++) {
                let atr, plusDI, minusDI;
                
                if (i === period - 1) {
                    // الحساب الأولي
                    atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
                    const plusDMSum = plusDMs.slice(0, period).reduce((sum, dm) => sum + dm, 0) / period;
                    const minusDMSum = minusDMs.slice(0, period).reduce((sum, dm) => sum + dm, 0) / period;
                    
                    plusDI = (plusDMSum / atr) * 100;
                    minusDI = (minusDMSum / atr) * 100;
                } else {
                    // Smoothed calculation
                    const prevResult = results[results.length - 1];
                    atr = ((prevResult.atr * (period - 1)) + trueRanges[i]) / period;
                    
                    const prevPlusDM = (prevResult.plusDI * prevResult.atr) / 100;
                    const prevMinusDM = (prevResult.minusDI * prevResult.atr) / 100;
                    
                    const smoothedPlusDM = ((prevPlusDM * (period - 1)) + plusDMs[i]) / period;
                    const smoothedMinusDM = ((prevMinusDM * (period - 1)) + minusDMs[i]) / period;
                    
                    plusDI = (smoothedPlusDM / atr) * 100;
                    minusDI = (smoothedMinusDM / atr) * 100;
                }
                
                // حساب DX و ADX
                const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
                const adx = i === period - 1 ? dx : ((results[results.length - 1].adx * (period - 1)) + dx) / period;
                
                results.push({
                    index: i + 1,
                    atr: atr,
                    plusDI: plusDI,
                    minusDI: minusDI,
                    dx: dx,
                    adx: adx,
                    timestamp: data[i + 1].timestamp
                });
            }
        }
        
        return results;
    }

    /**
     * تحليل شامل للمؤشرات التقنية
     */
    analyzeAllIndicators(data) {
        const analysis = {
            timestamp: Date.now(),
            symbol: data.symbol || 'UNKNOWN',
            dataPoints: data.length,
            indicators: {}
        };

        try {
            // المتوسطات المتحركة
            analysis.indicators.sma20 = this.calculateSMA(data, 20);
            analysis.indicators.sma50 = this.calculateSMA(data, 50);
            analysis.indicators.ema12 = this.calculateEMA(data, 12);
            analysis.indicators.ema26 = this.calculateEMA(data, 26);
            
            // مؤشرات الزخم
            analysis.indicators.rsi = this.calculateRSI(data, 14);
            analysis.indicators.macd = this.calculateMACD(data);
            analysis.indicators.stochastic = this.calculateStochastic(data);
            
            // مؤشرات التقلب
            analysis.indicators.bollingerBands = this.calculateBollingerBands(data);
            
            // مؤشرات الاتجاه
            analysis.indicators.adx = this.calculateADX(data);
            
            // تحليل الإشارات
            analysis.signals = this.generateTradingSignals(analysis.indicators, data);
            
            console.log('✅ تم حساب جميع المؤشرات التقنية بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في حساب المؤشرات التقنية:', error);
            analysis.error = error.message;
        }
        
        return analysis;
    }

    /**
     * توليد إشارات التداول الحقيقية
     */
    generateTradingSignals(indicators, data) {
        const signals = {
            overall: 'neutral',
            strength: 0,
            signals: [],
            confidence: 0
        };

        let bullishSignals = 0;
        let bearishSignals = 0;
        let totalSignals = 0;

        try {
            const currentPrice = parseFloat(data[data.length - 1].close);
            
            // إشارات RSI
            if (indicators.rsi && indicators.rsi.length > 0) {
                const currentRSI = indicators.rsi[indicators.rsi.length - 1].value;
                if (currentRSI < 30) {
                    signals.signals.push({ type: 'RSI Oversold', direction: 'bullish', strength: 'strong' });
                    bullishSignals += 2;
                } else if (currentRSI > 70) {
                    signals.signals.push({ type: 'RSI Overbought', direction: 'bearish', strength: 'strong' });
                    bearishSignals += 2;
                }
                totalSignals += 2;
            }

            // إشارات MACD
            if (indicators.macd && indicators.macd.histogram && indicators.macd.histogram.length > 1) {
                const currentHist = indicators.macd.histogram[indicators.macd.histogram.length - 1].value;
                const prevHist = indicators.macd.histogram[indicators.macd.histogram.length - 2].value;
                
                if (currentHist > 0 && prevHist <= 0) {
                    signals.signals.push({ type: 'MACD Bullish Crossover', direction: 'bullish', strength: 'medium' });
                    bullishSignals += 1;
                } else if (currentHist < 0 && prevHist >= 0) {
                    signals.signals.push({ type: 'MACD Bearish Crossover', direction: 'bearish', strength: 'medium' });
                    bearishSignals += 1;
                }
                totalSignals += 1;
            }

            // إشارات المتوسطات المتحركة
            if (indicators.ema12 && indicators.ema26 && indicators.ema12.length > 0 && indicators.ema26.length > 0) {
                const ema12Current = indicators.ema12[indicators.ema12.length - 1].value;
                const ema26Current = indicators.ema26[indicators.ema26.length - 1].value;
                
                if (currentPrice > ema12Current && ema12Current > ema26Current) {
                    signals.signals.push({ type: 'EMA Bullish Alignment', direction: 'bullish', strength: 'medium' });
                    bullishSignals += 1;
                } else if (currentPrice < ema12Current && ema12Current < ema26Current) {
                    signals.signals.push({ type: 'EMA Bearish Alignment', direction: 'bearish', strength: 'medium' });
                    bearishSignals += 1;
                }
                totalSignals += 1;
            }

            // إشارات البولنجر باندز
            if (indicators.bollingerBands && indicators.bollingerBands.length > 0) {
                const currentBB = indicators.bollingerBands[indicators.bollingerBands.length - 1];
                
                if (currentPrice <= currentBB.lower) {
                    signals.signals.push({ type: 'Bollinger Bands Oversold', direction: 'bullish', strength: 'medium' });
                    bullishSignals += 1;
                } else if (currentPrice >= currentBB.upper) {
                    signals.signals.push({ type: 'Bollinger Bands Overbought', direction: 'bearish', strength: 'medium' });
                    bearishSignals += 1;
                }
                totalSignals += 1;
            }

            // حساب الإشارة العامة
            if (totalSignals > 0) {
                const netSignal = bullishSignals - bearishSignals;
                const signalStrength = Math.abs(netSignal) / totalSignals;
                
                signals.strength = Math.round(signalStrength * 100);
                signals.confidence = Math.min(95, Math.round((totalSignals / 5) * 100));
                
                if (netSignal > 0) {
                    signals.overall = 'bullish';
                } else if (netSignal < 0) {
                    signals.overall = 'bearish';
                } else {
                    signals.overall = 'neutral';
                }
            }

        } catch (error) {
            console.error('❌ خطأ في توليد الإشارات:', error);
            signals.error = error.message;
        }

        return signals;
    }
}

// تصدير الكلاس للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTechnicalIndicators;
} else if (typeof window !== 'undefined') {
    window.RealTechnicalIndicators = RealTechnicalIndicators;
}