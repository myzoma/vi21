class ElliottWaveAnalyzer {
    constructor(config = {}) {
        this.config = {
            len1: config.len1 || 4,
            len2: config.len2 || 8,
            len3: config.len3 || 16,
            minWaveLength: config.minWaveLength || 0.5, // الحد الأدنى لطول الموجة
            maxWaveLength: config.maxWaveLength || 5.0,  // الحد الأقصى لطول الموجة
            // نسب فيبوناتشي الدقيقة
            fib236: 0.236,
            fib382: 0.382,
            fib500: 0.500,
            fib618: 0.618,
            fib764: 0.764,
            fib854: 0.854,
            fib1000: 1.000,
            fib1272: 1.272,
            fib1618: 1.618,
            fib2618: 2.618
        };
        
        // قواعد Elliott Wave الصارمة
        this.elliottRules = {
            // قواعد الموجات الدافعة (1-2-3-4-5)
            motive: {
                // القاعدة 1: الموجة 2 لا تتجاوز بداية الموجة 1
                wave2CannotExceedWave1Start: true,
                // القاعدة 2: الموجة 3 ليست أقصر الموجات الدافعة
                wave3NotShortest: true,
                // القاعدة 3: الموجة 4 لا تدخل منطقة سعر الموجة 1
                wave4CannotOverlapWave1: true,
                // القاعدة 4: الموجات الدافعة تتحرك في نفس الاتجاه العام
                impulsiveWavesSameDirection: true
            },
            // قواعد الموجات التصحيحية (A-B-C)
            corrective: {
                // الموجة C عادة ما تكون مساوية أو أطول من الموجة A
                waveCRelationToA: true,
                // الموجة B لا تتجاوز بداية الموجة A بأكثر من 100%
                waveBMaxRetracement: true
            }
        };
    }

    // حساب Pivot High و Pivot Low بدقة أكبر
    findPivots(data, leftBars = 4, rightBars = 4) {
        const pivots = [];
        
        for (let i = leftBars; i < data.length - rightBars; i++) {
            const current = data[i];
            let isHigh = true;
            let isLow = true;
            
            // فحص Pivot High - يجب أن يكون أعلى من جميع النقاط المحيطة
            for (let j = i - leftBars; j <= i + rightBars; j++) {
                if (j !== i && data[j].high >= current.high) {
                    isHigh = false;
                    break;
                }
            }
            
            // فحص Pivot Low - يجب أن يكون أقل من جميع النقاط المحيطة
            for (let j = i - leftBars; j <= i + rightBars; j++) {
                if (j !== i && data[j].low <= current.low) {
                    isLow = false;
                    break;
                }
            }
            
            if (isHigh) {
                pivots.push({
                    index: i,
                    type: 'high',
                    price: current.high,
                    time: current.time,
                    candle: current
                });
            }
            
            if (isLow) {
                pivots.push({
                    index: i,
                    type: 'low',
                    price: current.low,
                    time: current.time,
                    candle: current
                });
            }
        }
        
        return pivots.sort((a, b) => a.index - b.index);
    }

    // إنشاء ZigZag محسن مع فلترة الضوضاء
    createZigZag(pivots, minChangePercent = 1.0) {
        if (pivots.length < 2) return [];
        
        const zigzag = [pivots[0]];
        
        for (let i = 1; i < pivots.length; i++) {
            const current = pivots[i];
            const last = zigzag[zigzag.length - 1];
            
            // حساب نسبة التغيير
            const changePercent = Math.abs((current.price - last.price) / last.price) * 100;
            
            // تجاهل التغييرات الصغيرة
            if (changePercent < minChangePercent) continue;
            
            if (current.type !== last.type) {
                zigzag.push(current);
            } else if (current.type === 'high' && current.price > last.price) {
                zigzag[zigzag.length - 1] = current;
            } else if (current.type === 'low' && current.price < last.price) {
                zigzag[zigzag.length - 1] = current;
            }
        }
        
        return zigzag;
    }

    // تحليل نماذج الموجات
    analyzeWavePatterns(zigzag) {
        const patterns = [];
        
        // البحث عن نماذج الموجات الدافعة (1-2-3-4-5)
        for (let i = 0; i < zigzag.length - 4; i++) {
            const points = zigzag.slice(i, i + 5);
            
            // التحقق من أن النقاط تشكل نموذج موجة دافعة
            if (points.length === 5 && 
                points[0].type === 'low' &&
                points[1].type === 'high' &&
                points[2].type === 'low' &&
                points[3].type === 'high' &&
                points[4].type === 'low') {
                
                // حساب النسب
                const wave1 = points[1].price - points[0].price;
                const wave2 = points[2].price - points[1].price;
                const wave3 = points[3].price - points[2].price;
                const wave4 = points[4].price - points[3].price;
                
                // التحقق من صحة النموذج
                const isValid = this.validateMotiveWaveRules(points);
                
                if (isValid) {
                    patterns.push({
                        type: 'motive',
                        points: points,
                        waves: [
                            { start: points[0], end: points[1], length: wave1 },
                            { start: points[1], end: points[2], length: wave2 },
                            { start: points[2], end: points[3], length: wave3 },
                            { start: points[3], end: points[4], length: wave4 }
                        ],
                        changePercentage: (points[4].price - points[0].price) / points[0].price * 100,
                        fibonacciRelation: wave3 / wave1,
                        bullish: true
                    });
                }
            }
        }
        
        // البحث عن نماذج الموجات التصحيحية (A-B-C)
        for (let i = 0; i < zigzag.length - 2; i++) {
            const points = zigzag.slice(i, i + 3);
            
            // التحقق من أن النقاط تشكل نموذج موجة تصحيحية
            if (points.length === 3 && 
                points[0].type === 'high' &&
                points[1].type === 'low' &&
                points[2].type === 'high') {
                
                // حساب النسب
                const waveA = points[0].price - points[1].price;
                const waveB = points[2].price - points[1].price;
                
                // التحقق من صحة النموذج
                const isValid = this.validateCorrectiveWaveRules(points);
                
                if (isValid) {
                    patterns.push({
                        type: 'corrective',
                        points: points,
                        waves: [
                            { start: points[0], end: points[1], length: waveA },
                            { start: points[1], end: points[2], length: waveB }
                        ],
                        changePercentage: (points[2].price - points[0].price) / points[0].price * 100,
                        fibonacciRelation: waveB / waveA,
                        bullish: false
                    });
                }
            }
        }
        
        return patterns;
    }

    // التحقق من قواعد الموجات الدافعة
    validateMotiveWaveRules(points) {
        // التحقق من القواعد الأساسية
        const wave1 = points[1].price - points[0].price;
        const wave2 = points[2].price - points[1].price;
        const wave3 = points[3].price - points[2].price;
        const wave4 = points[4].price - points[3].price;

        // القاعدة 1: الموجة 2 لا تتجاوز بداية الموجة 1
        const rule1 = points[2].price > points[0].price;
        
        // القاعدة 2: الموجة 3 ليست أقصر الموجات
        const rule2 = wave3 >= Math.min(wave1, wave4);
        
        // القاعدة 3: الموجة 4 لا تدخل منطقة سعر الموجة 1
        const rule3 = points[4].price > points[1].price;
        
        // التحقق من النسب فيبوناتشي
        const fibRatios = [
            wave2 / wave1,
            wave3 / wave1,
            wave4 / wave3
        ];
        
        // التأكد من أن النسب قريبة من نسب فيبوناتشي المعروفة
        const validFibRatios = fibRatios.some(ratio => {
            return Math.abs(ratio - this.config.fib382) < 0.1 ||
                   Math.abs(ratio - this.config.fib618) < 0.1;
        });
        
        return rule1 && rule2 && rule3 && validFibRatios;
    }

    // التحقق من قواعد الموجات التصحيحية
    validateCorrectiveWaveRules(points) {
        // التحقق من القواعد الأساسية
        const waveA = points[0].price - points[1].price;
        const waveB = points[2].price - points[1].price;

        // القاعدة 1: الموجة B لا تتجاوز بداية الموجة A
        const rule1 = points[2].price < points[0].price;
        
        // القاعدة 2: النسبة بين الموجات قريبة من نسب فيبوناتشي
        const fibRatio = waveB / waveA;
        const validFibRatio = Math.abs(fibRatio - this.config.fib618) < 0.1;
        
        return rule1 && validFibRatio;
    }

    // حساب نسبة التغيير بدقة
    calculatePercentageChange(startPrice, endPrice) {
        return ((endPrice - startPrice) / startPrice) * 100;
    }

    // حساب طول الموجة
    calculateWaveLength(startPoint, endPoint) {
        return Math.abs(endPoint.price - startPoint.price);
    }

    // التحقق من قواعد Elliott Wave للموجات الدافعة
    validateMotiveWaveRules(points) {
        const [p0, p1, p2, p3, p4, p5] = points;
        const isBullish = p5.price > p0.price;
        
        // القاعدة 1: الموجة 2 لا تتجاوز بداية الموجة 1
        const rule1 = isBullish ? p2.price > p0.price : p2.price < p0.price;
        
        // القاعدة 2: الموجة 3 ليست أقصر الموجات الدافعة
        const w1 = this.calculateWaveLength(p0, p1);
        const w3 = this.calculateWaveLength(p2, p3);
        const w5 = this.calculateWaveLength(p4, p5);
        const rule2 = w3 >= Math.max(w1, w5) || (w3 >= w1 && w3 >= w5);
        
        // القاعدة 3: الموجة 4 لا تدخل منطقة سعر الموجة 1
        const rule3 = isBullish ? p4.price > p1.price : p4.price < p1.price;
        
        // التحقق من التناوب الصحيح للاتجاهات
        const alternation = this.checkAlternation(points);
        
        return {
            rule1: rule1,
            rule2: rule2,
            rule3: rule3,
            alternation: alternation,
            isValid: rule1 && rule2 && rule3 && alternation
        };
    }

    // التحقق من تناوب الاتجاهات
    checkAlternation(points) {
        for (let i = 1; i < points.length; i++) {
            if (points[i].type === points[i-1].type) {
                return false;
            }
        }
        return true;
    }

    // تحديد النمط الدافع (12345) مع قواعد صارمة
    identifyMotivePattern(points) {
        if (points.length !== 6) return null;
        
        const [p0, p1, p2, p3, p4, p5] = points;
        
        // التحقق من القواعد الأساسية
        const validation = this.validateMotiveWaveRules(points);
        if (!validation.isValid) return null;
        
        const isBullish = p5.price > p0.price;
        
        // حساب أطوال الموجات ونسب فيبوناتشي
        const waves = {
            w1: { 
                start: p0, 
                end: p1, 
                length: this.calculateWaveLength(p0, p1),
                percentage: this.calculatePercentageChange(p0.price, p1.price)
            },
            w2: { 
                start: p1, 
                end: p2, 
                length: this.calculateWaveLength(p1, p2),
                percentage: this.calculatePercentageChange(p1.price, p2.price),
                retracement: this.calculateRetracement(p0, p1, p2)
            },
            w3: { 
                start: p2, 
                end: p3, 
                length: this.calculateWaveLength(p2, p3),
                percentage: this.calculatePercentageChange(p2.price, p3.price)
            },
            w4: { 
                start: p3, 
                end: p4, 
                length: this.calculateWaveLength(p3, p4),
                percentage: this.calculatePercentageChange(p3.price, p4.price),
                retracement: this.calculateRetracement(p2, p3, p4)
            },
            w5: { 
                start: p4, 
                end: p5, 
                length: this.calculateWaveLength(p4, p5),
                percentage: this.calculatePercentageChange(p4.price, p5.price)
            }
        };
        
        // التحقق من نسب فيبوناتشي
        const fibonacciAnalysis = this.analyzeFibonacciRelationships(waves);
        
        return {
            type: 'motive',
            direction: isBullish ? 'bullish' : 'bearish',
            points: points,
            waves: waves,
            validation: validation,
            fibonacciAnalysis: fibonacciAnalysis,
            confidence: this.calculatePatternConfidence(waves, validation, fibonacciAnalysis),
            targets: this.calculateMotiveTargets(waves, isBullish)
        };
    }

    // حساب نسبة التصحيح
    calculateRetracement(start, peak, end) {
        const totalMove = peak.price - start.price;
        const retracement = peak.price - end.price;
        return Math.abs(retracement / totalMove);
    }

    // تحليل علاقات فيبوناتشي
    analyzeFibonacciRelationships(waves) {
        const analysis = {};
        
        // تحليل الموجة 2
        const w2Retracement = waves.w2.retracement;
        analysis.wave2 = {
            retracement: w2Retracement,
            fibLevel: this.findClosestFibLevel(w2Retracement),
            isValid: w2Retracement >= 0.236 && w2Retracement <= 0.786
        };
        
        // تحليل الموجة 3
        const w3ToW1Ratio = waves.w3.length / waves.w1.length;
        analysis.wave3 = {
            ratio: w3ToW1Ratio,
            fibLevel: this.findClosestFibLevel(w3ToW1Ratio),
            isValid: w3ToW1Ratio >= 1.0 && w3ToW1Ratio <= 2.618
        };
        
        // تحليل الموجة 4
        const w4Retracement = waves.w4.retracement;
        analysis.wave4 = {
            retracement: w4Retracement,
            fibLevel: this.findClosestFibLevel(w4Retracement),
            isValid: w4Retracement >= 0.236 && w4Retracement <= 0.618
        };
        
        // تحليل الموجة 5
        const w5ToW1Ratio = waves.w5.length / waves.w1.length;
        analysis.wave5 = {
            ratio: w5ToW1Ratio,
            fibLevel: this.findClosestFibLevel(w5ToW1Ratio),
            isValid: w5ToW1Ratio >= 0.618 && w5ToW1Ratio <= 1.618
        };
        
        return analysis;
    }

    // العثور على أقرب مستوى فيبوناتشي
    findClosestFibLevel(value) {
        const fibLevels = [0.236, 0.382, 0.500, 0.618, 0.764, 1.000, 1.272, 1.618, 2.618];
        let closest = fibLevels[0];
        let minDiff = Math.abs(value - closest);
        
        for (const level of fibLevels) {
            const diff = Math.abs(value - level);
            if (diff < minDiff) {
                minDiff = diff;
                closest = level;
            }
        }
        
        return closest;
    }

    // تحديد النمط التصحيحي (ABC) مع قواعد صارمة
    identifyCorrectivePattern(points) {
        if (points.length !== 4) return null;
        
        const [pA, pB, pC, pD] = points;
        
        // التحقق من التناوب الصحيح
        if (!this.checkAlternation(points)) return null;
        
        const isBullishCorrection = pA.type === 'high' && pD.type === 'low';
        const isBearishCorrection = pA.type === 'low' && pD.type === 'high';
        
        if (!isBullishCorrection && !isBearishCorrection) return null;
        
        // حساب أطوال الموجات
        const waves = {
            wA: { 
                start: pA,end: pB, 
                length: this.calculateWaveLength(pA, pB),
                percentage: this.calculatePercentageChange(pA.price, pB.price)
            },
            wB: { 
                start: pB, 
                end: pC, 
                length: this.calculateWaveLength(pB, pC),
                percentage: this.calculatePercentageChange(pB.price, pC.price),
                retracement: this.calculateRetracement(pA, pB, pC)
            },
            wC: { 
                start: pC, 
                end: pD, 
                length: this.calculateWaveLength(pC, pD),
                percentage: this.calculatePercentageChange(pC.price, pD.price)
            }
        };
        
        // التحقق من قواعد النمط التصحيحي
        const validation = this.validateCorrectivePattern(waves, isBullishCorrection);
        if (!validation.isValid) return null;
        
        // تحليل نسب فيبوناتشي للتصحيح
        const fibonacciAnalysis = this.analyzeCorrectiveFibonacci(waves);
        
        return {
            type: 'corrective',
            direction: isBullishCorrection ? 'bearish' : 'bullish',
            points: points,
            waves: waves,
            validation: validation,
            fibonacciAnalysis: fibonacciAnalysis,
            confidence: this.calculateCorrectiveConfidence(waves, validation, fibonacciAnalysis),
            targets: this.calculateCorrectiveTargets(waves, !isBullishCorrection)
        };
    }

    // التحقق من قواعد النمط التصحيحي
    validateCorrectivePattern(waves, isBullishCorrection) {
        // القاعدة 1: الموجة B لا تتجاوز 100% من الموجة A (في معظم الحالات)
        const rule1 = waves.wB.retracement <= 1.0;
        
        // القاعدة 2: الموجة C يجب أن تكون على الأقل 61.8% من الموجة A
        const wCToWARatio = waves.wC.length / waves.wA.length;
        const rule2 = wCToWARatio >= 0.618;
        
        // القاعدة 3: الموجة C لا تتجاوز 2.618 من الموجة A
        const rule3 = wCToWARatio <= 2.618;
        
        // القاعدة 4: التحقق من الاتجاه العام للتصحيح
        const rule4 = isBullishCorrection ? 
            (waves.wA.start.price > waves.wC.end.price) : 
            (waves.wA.start.price < waves.wC.end.price);
        
        return {
            rule1: rule1,
            rule2: rule2,
            rule3: rule3,
            rule4: rule4,
            isValid: rule1 && rule2 && rule3 && rule4
        };
    }

    // تحليل نسب فيبوناتشي للتصحيح
    analyzeCorrectiveFibonacci(waves) {
        const analysis = {};
        
        // تحليل الموجة B
        const wBRetracement = waves.wB.retracement;
        analysis.waveB = {
            retracement: wBRetracement,
            fibLevel: this.findClosestFibLevel(wBRetracement),
            isValid: wBRetracement >= 0.236 && wBRetracement <= 0.786
        };
        
        // تحليل الموجة C
        const wCToWARatio = waves.wC.length / waves.wA.length;
        analysis.waveC = {
            ratio: wCToWARatio,
            fibLevel: this.findClosestFibLevel(wCToWARatio),
            isValid: wCToWARatio >= 0.618 && wCToWARatio <= 1.618
        };
        
        return analysis;
    }

    // حساب مستوى الثقة للنمط الدافع
    calculatePatternConfidence(waves, validation, fibonacciAnalysis) {
        let confidence = 0;
        
        // نقاط الثقة من القواعد الأساسية
        if (validation.rule1) confidence += 25;
        if (validation.rule2) confidence += 30;
        if (validation.rule3) confidence += 25;
        if (validation.alternation) confidence += 10;
        
        // نقاط إضافية من نسب فيبوناتشي
        if (fibonacciAnalysis.wave2.isValid) confidence += 2.5;
        if (fibonacciAnalysis.wave3.isValid) confidence += 2.5;
        if (fibonacciAnalysis.wave4.isValid) confidence += 2.5;
        if (fibonacciAnalysis.wave5.isValid) confidence += 2.5;
        
        return Math.min(confidence, 100);
    }

    // حساب مستوى الثقة للنمط التصحيحي
    calculateCorrectiveConfidence(waves, validation, fibonacciAnalysis) {
        let confidence = 0;
        
        // نقاط الثقة من القواعد الأساسية
        if (validation.rule1) confidence += 25;
        if (validation.rule2) confidence += 25;
        if (validation.rule3) confidence += 25;
        if (validation.rule4) confidence += 15;
        
        // نقاط إضافية من نسب فيبوناتشي
        if (fibonacciAnalysis.waveB.isValid) confidence += 5;
        if (fibonacciAnalysis.waveC.isValid) confidence += 5;
        
        return Math.min(confidence, 100);
    }

    // حساب أهداف النمط الدافع
    calculateMotiveTargets(waves, isBullish) {
        const w1Length = waves.w1.length;
        const w3Length = waves.w3.length;
        const startPrice = waves.w5.start.price;
        const direction = isBullish ? 1 : -1;
        
        return {
            // أهداف الموجة 5 بناءً على الموجة 1
            wave5_fib618: startPrice + (direction * w1Length * this.config.fib618),
            wave5_fib1000: startPrice + (direction * w1Length * this.config.fib1000),
            wave5_fib1618: startPrice + (direction * w1Length * this.config.fib1618),
            
            // أهداف الموجة 5 بناءً على الموجة 3
            wave5_w3_fib382: startPrice + (direction * w3Length * this.config.fib382),
            wave5_w3_fib618: startPrice + (direction * w3Length * this.config.fib618),
            
            // الهدف النهائي للنمط
            finalTarget: waves.w5.end.price,
            
            // مستويات الدعم والمقاومة
            support: Math.min(waves.w2.end.price, waves.w4.end.price),
            resistance: Math.max(waves.w1.end.price, waves.w3.end.price, waves.w5.end.price)
        };
    }

    // حساب أهداف النمط التصحيحي
    calculateCorrectiveTargets(waves, isBullish) {
        const wALength = waves.wA.length;
        const startPrice = waves.wC.start.price;
        const direction = isBullish ? 1 : -1;
        
        return {
            // أهداف الموجة C بناءً على الموجة A
            waveC_fib618: startPrice + (direction * wALength * this.config.fib618),
            waveC_fib1000: startPrice + (direction * wALength * this.config.fib1000),
            waveC_fib1272: startPrice + (direction * wALength * this.config.fib1272),
            waveC_fib1618: startPrice + (direction * wALength * this.config.fib1618),
            
            // الهدف النهائي للتصحيح
            finalTarget: waves.wC.end.price,
            
            // مستويات الدعم والمقاومة
            support: isBullish ? waves.wA.start.price : waves.wC.end.price,
            resistance: isBullish ? waves.wC.end.price : waves.wA.start.price
        };
    }

    // البحث عن الأنماط المتداخلة (Nested Patterns)
    findNestedPatterns(zigzag) {
        const nestedPatterns = [];
        
        // البحث عن أنماط فرعية داخل الموجات الرئيسية
        for (let i = 0; i <= zigzag.length - 6; i++) {
            const mainPattern = zigzag.slice(i, i + 6);
            
            // البحث عن تفاصيل أكثر في كل موجة
            for (let j = 0; j < mainPattern.length - 1; j++) {
                const subWave = this.analyzeSubWave(mainPattern[j], mainPattern[j + 1]);
                if (subWave) {
                    nestedPatterns.push(subWave);
                }
            }
        }
        
        return nestedPatterns;
    }

    // تحليل الموجة الفرعية
    analyzeSubWave(startPoint, endPoint) {
        // هذه الدالة يمكن توسيعها لتحليل الموجات الفرعية بتفصيل أكبر
        const length = this.calculateWaveLength(startPoint, endPoint);
        const percentage = this.calculatePercentageChange(startPoint.price, endPoint.price);
        
        return {
            start: startPoint,
            end: endPoint,
            length: length,
            percentage: percentage,
            direction: endPoint.price > startPoint.price ? 'up' : 'down',
            timeframe: endPoint.time - startPoint.time
        };
    }

    // تحليل Elliott Wave الرئيسي
    analyzeElliottWave(zigzag) {
        if (zigzag.length < 4) return null;
        
        const patterns = [];
        
        // البحث عن الأنماط الدافعة (12345)
        for (let i = 0; i <= zigzag.length - 6; i++) {
            const points = zigzag.slice(i, i + 6);
            const pattern = this.identifyMotivePattern(points);
            
            if (pattern && pattern.confidence >= 70) { // فقط الأنماط عالية الثقة
                patterns.push(pattern);
            }
        }
        
        // البحث عن الأنماط التصحيحية (ABC)
        for (let i = 0; i <= zigzag.length - 4; i++) {
            const points = zigzag.slice(i, i + 4);
            const pattern = this.identifyCorrectivePattern(points);
            
            if (pattern && pattern.confidence >= 70) { // فقط الأنماط عالية الثقة
                patterns.push(pattern);
            }
        }
        
        // ترتيب الأنماط حسب مستوى الثقة
        patterns.sort((a, b) => b.confidence - a.confidence);
        
        return patterns;
    }

    // تحليل الاتجاه العام
    analyzeTrend(patterns) {
        if (patterns.length === 0) return 'neutral';
        
        const recentPattern = patterns[0]; // النمط الأحدث والأعلى ثقة
        
        if (recentPattern.type === 'motive') {
            return recentPattern.direction;
        } else if (recentPattern.type === 'corrective') {
            // التصحيح يشير إلى انتهاء الاتجاه السابق
            return recentPattern.direction === 'bullish' ? 'bullish_correction_end' : 'bearish_correction_end';
        }
        
        return 'neutral';
    }

    // حساب مستويات الدعم والمقاومة الديناميكية
    calculateDynamicLevels(patterns, currentPrice) {
        const levels = {
            support: [],
            resistance: [],
            targets: []
        };
        
        patterns.forEach(pattern => {
            if (pattern.type === 'motive') {
                // إضافة مستويات من النمط الدافع
                levels.support.push(pattern.targets.support);
                levels.resistance.push(pattern.targets.resistance);
                
                // إضافة أهداف فيبوناتشي
                Object.values(pattern.targets).forEach(target => {
                    if (typeof target === 'number') {
                        if (pattern.direction === 'bullish' && target > currentPrice) {
                            levels.targets.push(target);
                        } else if (pattern.direction === 'bearish' && target < currentPrice) {
                            levels.targets.push(target);
                        }
                    }
                });
            }
        });
        
        // إزالة المستويات المكررة وترتيبها
        levels.support = [...new Set(levels.support)].sort((a, b) => b - a);
        levels.resistance = [...new Set(levels.resistance)].sort((a, b) => a - b);
        levels.targets = [...new Set(levels.targets)].sort((a, b) => a - b);
        
        return levels;
    }

    // التحليل الرئيسي المحسن
    analyze(klineData) {
        try {
            // تحويل البيانات إلى التنسيق المطلوب
            const formattedData = klineData.map((kline, index) => ({
                time: kline[0],
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5]),
                index: index
            }));

            // التحقق من كفاية البيانات
            if (formattedData.length < 20) {
                return { 
                    patterns: [], 
                    status: 'insufficient_data',
                    message: 'يحتاج التحليل إلى 20 شمعة على الأقل'
                };
            }

            // العثور على النقاط المحورية باستخدام المعاملات المخصصة للإطار الزمني
            const leftBars = this.config.pivotLeftBars || this.config.len1;
            const rightBars = this.config.pivotRightBars || this.config.len1;
            const pivots = this.findPivots(formattedData, leftBars, rightBars);

            if (pivots.length < 6) {
                return { 
                    patterns: [], 
                    status: 'insufficient_pivots',
                    message: 'عدد النقاط المحورية غير كافي للتحليل'
                };
            }

            // إنشاء ZigZag محسن باستخدام حد التغيير المخصص للإطار الزمني
            const minChangePercent = this.config.minChangePercent || 0.5;
            const zigzag = this.createZigZag(pivots, minChangePercent);

            if (zigzag.length < 4) {
                return { 
                    patterns: [], 
                    status: 'insufficient_zigzag',
                    message: 'ZigZag غير كافي للتحليل'
                };
            }

            // تحليل Elliott Wave
            const patterns = this.analyzeElliottWave(zigzag);

            if (!patterns || patterns.length === 0) {
                return {
                    patterns: [],
                    zigzag: zigzag,
                    pivots: pivots,
                    status: 'no_patterns_found',
                    message: 'لم يتم العثور على أنماط Elliott Wave صالحة'
                };
            }

            // تحليل الاتجاه العام
            const trend = this.analyzeTrend(patterns);

            // حساب السعر الحالي
            const currentPrice = formattedData[formattedData.length - 1].close;

            // حساب مستويات الدعم والمقاومة الديناميكية
            const dynamicLevels = this.calculateDynamicLevels(patterns, currentPrice);

            // البحث عن الأنماط المتداخلة
            const nestedPatterns = this.findNestedPatterns(zigzag);

            // تحليل إضافي للموجة الحالية
            const currentWaveAnalysis = this.analyzeCurrentWave(patterns, currentPrice);

            // إنشاء التوصيات
            const recommendations = this.generateRecommendations(patterns, trend, currentPrice, dynamicLevels);

            return {
                patterns: patterns,
                zigzag: zigzag,
                pivots: pivots,
                trend: trend,
                currentPrice: currentPrice,
                dynamicLevels: dynamicLevels,
                nestedPatterns: nestedPatterns,
                currentWaveAnalysis: currentWaveAnalysis,
                recommendations: recommendations,
                status: 'success',
                timestamp: Date.now(),
                summary: this.generateAnalysisSummary(patterns, trend, currentWaveAnalysis)
            };

        } catch (error) {
            console.error('خطأ في تحليل Elliott Wave:', error);
            return { 
                patterns: [], 
                status: 'error', 
                error: error.message,
                stack: error.stack
            };
        }
    }

    // تحليل الموجة الحالية
    analyzeCurrentWave(patterns, currentPrice) {
        if (patterns.length === 0) return null;

        const mostRecentPattern = patterns[0];
        const lastPoint = mostRecentPattern.points[mostRecentPattern.points.length - 1];

        let currentWave = null;
        let expectedTarget = null;
        let stopLoss = null;

        if (mostRecentPattern.type === 'motive') {
            // تحديد الموجة الحالية في النمط الدافع
            const waves = mostRecentPattern.waves;
            
            if (currentPrice > lastPoint.price && mostRecentPattern.direction === 'bullish') {
                currentWave = 'extension_or_new_cycle';
                expectedTarget = mostRecentPattern.targets.wave5_fib1618;
            } else if (currentPrice < lastPoint.price && mostRecentPattern.direction === 'bearish') {
                currentWave = 'extension_or_new_cycle';
                expectedTarget = mostRecentPattern.targets.wave5_fib1618;
            } else {
                currentWave = 'corrective_phase';
                expectedTarget = mostRecentPattern.targets.support;
            }
        } else if (mostRecentPattern.type === 'corrective') {
            // تحديد الموجة الحالية في النمط التصحيحي
            if (Math.abs(currentPrice - lastPoint.price) / lastPoint.price < 0.02) {
                currentWave = 'correction_completion';
                expectedTarget = mostRecentPattern.direction === 'bullish' ? 
                    mostRecentPattern.targets.waveC_fib1618 : 
                    mostRecentPattern.targets.waveC_fib1618;
            } else {
                currentWave = 'new_impulse_starting';
            }
        }

        return {
            currentWave: currentWave,
            expectedTarget: expectedTarget,
            stopLoss: stopLoss,
            confidence: mostRecentPattern.confidence,
            timeframe: this.estimateTimeframe(mostRecentPattern),
            riskReward: this.calculateRiskReward(currentPrice, expectedTarget, stopLoss)
        };
    }

    // تقدير الإطار الزمني
    estimateTimeframe(pattern) {
        const startTime = pattern.points[0].time;
        const endTime = pattern.points[pattern.points.length - 1].time;
        const duration = endTime - startTime;

        // تحويل إلى ساعات
        const hours = duration / (1000 * 60 * 60);

        if (hours < 24) {
            return `${Math.round(hours)} ساعة`;
        } else if (hours < 24 * 7) {
            return `${Math.round(hours / 24)} يوم`;
        } else {
            return `${Math.round(hours / (24 * 7))} أسبوع`;
        }
    }

    // حساب نسبة المخاطرة إلى العائد
    calculateRiskReward(currentPrice, target, stopLoss) {
        if (!target || !stopLoss) return null;

        const potentialProfit = Math.abs(target - currentPrice);
        const potentialLoss = Math.abs(currentPrice - stopLoss);

        return potentialLoss > 0 ? (potentialProfit / potentialLoss).toFixed(2) : null;
    }

    // إنشاء التوصيات
    generateRecommendations(patterns, trend, currentPrice, dynamicLevels) {
        const recommendations = [];

        if (patterns.length === 0) {
            return [{
                type: 'neutral',
                message: 'لا توجد إشارات واضحة حالياً',
                confidence: 0
            }];
        }

        const topPattern = patterns[0];
        
        console.log('🔍 تحليل التوصيات:', {
            نوع_النمط: topPattern.type,
            الاتجاه_العام: trend,
            اتجاه_النمط: topPattern.direction,
            الثقة: topPattern.confidence
        });

        if (topPattern.confidence >= 80) {
            if (topPattern.type === 'motive') {
                if (topPattern.direction === 'bullish') {
                    recommendations.push({
                        type: 'buy',
                        message: 'نمط دافع صاعد قوي - فرصة شراء',
                        entry: currentPrice,
                        targets: [
                            topPattern.targets.wave5_fib618,
                            topPattern.targets.wave5_fib1000,
                            topPattern.targets.wave5_fib1618
                        ],
                        stopLoss: topPattern.targets.support,
                        confidence: topPattern.confidence
                    });
                } else {
                    recommendations.push({
                        type: 'sell',
                        message: 'نمط دافع هابط قوي - فرصة بيع',
                        entry: currentPrice,
                        targets: [
                            topPattern.targets.wave5_fib618,
                            topPattern.targets.wave5_fib1000,
                            topPattern.targets.wave5_fib1618
                        ],
                        stopLoss: topPattern.targets.resistance,
                        confidence: topPattern.confidence
                    });
                }
            } else if (topPattern.type === 'corrective') {
                const correctionDirection = trend === 'bullish' ? 'هابط' : trend === 'bearish' ? 'صاعد' : '';
                const directionText = correctionDirection ? ` ${correctionDirection}` : '';
                recommendations.push({
                    type: 'wait',
                    message: `نمط تصحيحي${directionText} - انتظار اكتمال التصحيح`,
                    expectedCompletion: topPattern.targets.finalTarget,
                    confidence: topPattern.confidence,
                    correctionDirection: correctionDirection
                });
            }
        } else if (topPattern.confidence >= 60) {
            recommendations.push({
                type: 'caution',
                message: 'إشارة متوسطة القوة - يُنصح بالحذر',
                confidence: topPattern.confidence
            });
        }

        return recommendations;
    }

    // إنشاء ملخص التحليل
    generateAnalysisSummary(patterns, trend, currentWaveAnalysis) {
        if (patterns.length === 0) {
            return 'لا توجد أنماط Elliott Wave واضحة في البيانات الحالية';
        }

        const topPattern = patterns[0];
        let summary = `تم العثور على ${patterns.length} نمط Elliott Wave. `;
        
        summary += `النمط الأقوى هو ${topPattern.type === 'motive' ? 'دافع' : 'تصحيحي'} `;
        summary += `${topPattern.direction === 'bullish' ? 'صاعد' : 'هابط'} `;
        summary += `بمستوى ثقة ${topPattern.confidence.toFixed(1)}%. `;

        if (currentWaveAnalysis) {
            summary += `الموجة الحالية: ${this.translateWaveType(currentWaveAnalysis.currentWave)}. `;
        }

        summary += `الاتجاه العام: ${this.translateTrend(trend)}.`;

        return summary;
    }

    // ترجمة نوع الموجة
    translateWaveType(waveType) {
        const translations = {
            'extension_or_new_cycle': 'امتداد أو دورة جديدة',
            'corrective_phase': 'مرحلة تصحيحية',
            'correction_completion': 'اكتمال التصحيح',
            'new_impulse_starting': 'بداية دفعة جديدة'
        };
        return translations[waveType] || waveType;
    }

    // ترجمة الاتجاه
    translateTrend(trend) {
        const translations = {
            'bullish': 'صاعد',
            'bearish': 'هابط',
            'neutral': 'محايد',
            'bullish_correction_end': 'نهاية تصحيح صاعد',
            'bearish_correction_end': 'نهاية تصحيح هابط'
        };
        return translations[trend] || trend;
    }

    // دالة مساعدة لطباعة النتائج بشكل منظم
    printAnalysis(analysis) {
        console.log('\n=== تحليل Elliott Wave ===');
        console.log(`الحالة: ${analysis.status}`);
        
        if (analysis.status === 'success') {
            console.log(`عدد الأنماط المكتشفة: ${analysis.patterns.length}`);
            console.log(`الاتجاه العام: ${this.translateTrend(analysis.trend)}`);
            console.log(`السعر الحالي: ${analysis.currentPrice}`);
            console.log(`\nملخص التحليل: ${analysis.summary}`);
            
            if (analysis.patterns.length > 0) {
                console.log('\n--- أفضل الأنماط ---');
                analysis.patterns.slice(0, 3).forEach((pattern, index) => {
                    console.log(`${index + 1}. نمط ${pattern.type === 'motive' ? 'دافع' : 'تصحيحي'} ${pattern.direction === 'bullish' ? 'صاعد' : 'هابط'}`);
                    console.log(`   مستوى الثقة: ${pattern.confidence.toFixed(1)}%`);
                    console.log(`   النقاط: ${pattern.points.length}`);
                });
            }
            
            if (analysis.recommendations.length > 0) {
                console.log('\n--- التوصيات ---');
                analysis.recommendations.forEach((rec, index) => {
                    console.log(`${index + 1}. ${rec.message} (ثقة: ${rec.confidence || 0}%)`);
                });
            }
        } else {
            console.log(`رسالة: ${analysis.message || 'خطأ غير محدد'}`);
        }
        
        console.log('========================\n');
    }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElliottWaveAnalyzer;
} else if (typeof window !== 'undefined') {
    window.ElliottWaveAnalyzer = ElliottWaveAnalyzer;
}

