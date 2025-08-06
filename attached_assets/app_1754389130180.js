// ===== متغيرات عامة =====
let currentAnalysis = null;
let isAnalyzing = false;
let currentSymbol = 'BTCUSDT';
let currentInterval = '4h'; // الإطار الافتراضي محسن للدقة العالية
let allSymbols = [];
let symbolPrices = {};

// قاموس أسماء العملات الشائعة بالعربية - موسع
const popularSymbolNames = {
    // العملات الرئيسية
    'BTCUSDT': 'البيتكوين',
    'ETHUSDT': 'الإيثريوم', 
    'BNBUSDT': 'بينانس كوين',
    'ADAUSDT': 'كاردانو',
    'XRPUSDT': 'الريبل',
    'SOLUSDT': 'سولانا',
    'DOTUSDT': 'بولكادوت',
    'DOGEUSDT': 'دوجكوين',
    'AVAXUSDT': 'أفالانش',
    'SHIBUSDT': 'شيبا إينو',
    'MATICUSDT': 'بوليجون',
    'LTCUSDT': 'لايتكوين',
    'ATOMUSDT': 'كوزموس',
    'LINKUSDT': 'تشين لينك',
    'UNIUSDT': 'يونيسواب',
    'BCHUSDT': 'بيتكوين كاش',
    'XLMUSDT': 'ستيلار',
    'VETUSDT': 'في تشين',
    'FILUSDT': 'فايلكوين',
    'TRXUSDT': 'ترون',
    'ETCUSDT': 'إيثريوم كلاسيك',
    'EOSUSDT': 'إيوس',
    'XMRUSDT': 'مونيرو',
    'AAVEUSDT': 'آيف',
    'MKRUSDT': 'ميكر',
    'COMPUSDT': 'كومباوند',
    'YFIUSDT': 'يرن فاينانس',
    'SNXUSDT': 'سينثتكس',
    'CRVUSDT': 'كيرف',
    '1INCHUSDT': 'ون إنش',
    'SUSHIUSDT': 'سوشي',
    
    // عملات إضافية شائعة
    'NEARUSDT': 'نير بروتوكول',
    'ALGOUSDT': 'الجوراند',
    'ICPUSDT': 'إنترنت كمبيوتر',
    'FTMUSDT': 'فانتوم',
    'SANDUSDT': 'ذا ساندبوكس',
    'MANAUSDT': 'ديسنترالاند',
    'AXSUSDT': 'أكسي إنفينيتي',
    'GALAUSDT': 'جالا',
    'ENJUSDT': 'إنجين كوين',
    'CHZUSDT': 'تشيليز',
    'FLOWUSDT': 'فلو',
    'IMXUSDT': 'إيميوتابل إكس',
    'APECUSDT': 'إيب كوين',
    'LRCUSDT': 'لوبرينج',
    'BATUSDT': 'بيسك أتنشن توكن',
    'ZECUSDT': 'زي كاش',
    'DASHUSDT': 'داش',
    'NEOUSDT': 'نيو',
    'QTUMUSDT': 'كوانتوم',
    'ONTUSDT': 'أونتولوجي',
    'ZILUSDT': 'زيليكا',
    'ICXUSDT': 'أيكون',
    'OMGUSDT': 'أوميسيجو',
    'ZRXUSDT': 'زيرو إكس',
    'KNCUSDT': 'كايبر نتورك',
    'BANDUSDT': 'باند بروتوكول',
    'STORJUSDT': 'ستورج',
    'CVCUSDT': 'سيفيك',
    'REPUSDT': 'أوجر',
    'RENUSDT': 'رين',
    'KMDUSDT': 'كومودو',
    'NKNUSDT': 'إن كي إن',
    'SCUSDT': 'سياكوين',
    'DGBUSDT': 'ديجي بايت',
    'BTGUSDT': 'بيتكوين جولد',
    'WAVESUSDT': 'ويفز',
    'ZENUSDT': 'هورايزن',
    'COTIUSDT': 'كوتي',
    'CHRUSDT': 'كرومايا',
    'STMXUSDT': 'ستورم إكس',
    'DENTUSDT': 'دنت',
    'KEYUSDT': 'سيلف كي',
    'ANKRUSDT': 'أنكر',
    'WINUSDT': 'وين كوين',
    'COSUSDT': 'كونتينتوس',
    'COCOSUSDT': 'كوكوس',
    'MTLUSDT': 'ميتال',
    'TOMOUSDT': 'توموشين',
    'PERUSDT': 'بيرو',
    'NULSUSDT': 'نولز',
    'ONEUSDT': 'هارموني',
    'FETUSDT': 'فيتش',
    'CELRUSDT': 'سيلر نتورك',
    'OGNUSDT': 'أوريجين بروتوكول',
    'OXTUSDT': 'أوركيد',
    'LSKUSDT': 'ليسك',
    'ARDRUSDT': 'أردور',
    'MDTUSDT': 'ميزرابل داتا',
    'STPTUSDT': 'ستاندرد توكنايزيشن',
    'NCTUSDT': 'بولي سوارم',
    'CTXCUSDT': 'كورتكس',
    'BTSUSDT': 'بيت شيرز',
    'LENDUSDT': 'إيتلند',
    'HOTUSDT': 'هولو',
    'DOCKUSDT': 'دوك',
    'POLYUSDT': 'بولي ماث',
    'PHXUSDT': 'فينيكس جلوبال',
    'HCUSDT': 'هايبر كاش',
    'GOLUSDT': 'جولوم',
    'COSMUSDT': 'كوزموس',
    'CVPUSDT': 'باور بول',
    'BNTUSDT': 'بانكور',
    'BZRXUSDT': 'بي زيرو إكس',
    'REPV2USDT': 'أوجر في 2',
    'BALANCUSDT': 'بالانسر',
    'JSTUSDT': 'جست',
    'SRMUST': 'سيروم',
    'ANTUSDT': 'أراجون',
    'CREAMUST': 'كريم فاينانس',
    'UMAUSDT': 'يوما',
    'NMRUSDT': 'نيوميرير',
    'OXENUSDT': 'أوكسين',
    'PONDUSDT': 'مارلين',
    'DEGOUSDT': 'ديجو فاينانس',
    'ALICEUSDT': 'مايي نيبور أليس',
    'LINAUSDT': 'لينا',
    'PERPUSDT': 'بيربيتوال بروتوكول',
    'RAMPUSDT': 'رامب',
    'SUPERUSDT': 'سوبرفارم',
    'CFXUSDT': 'كونفلوكس',
    'EPSUSDT': 'إليبسيس',
    'AUTOUSDT': 'أوتو',
    'TKOUSDT': 'توكيماك',
    'PUNDIXUSDT': 'بونديكس',
    'TLMUSDT': 'إيليين ورلدز',
    'BTCSTUSDT': 'بيتكوين ستاندرد هاشريت',
    'BARUSDT': 'فيوتشر',
    'FORTHUSDT': 'أمبليفورث جوفرنانس',
    'BAKEUSDT': 'بيكري توكن',
    'BURGERUSDT': 'برجر سواب',
    'SLPUSDT': 'سموث لوف بوشن',
    'SXPUSDT': 'سواي',
    'CKBUSDT': 'نيرفوس نتورك',
    'TWTUSD': 'ترست والت توكن',
    'FIROUSDT': 'فيرو',
    'LITUSDT': 'ليتنتري',
    'SFPUSDT': 'سيف بال',
    'DODOUSDT': 'دودو',
    'CAKEUSDT': 'بانكيك سواب',
    'ACMUSDT': 'أك ميلان فان توكن',
    'BADGERUSDT': 'بادجر داو',
    'FISUSDT': 'ستافي',
    'OMUSDT': 'مانترا داو',
    '1INCHUSDT': 'ون إنش',
    'REEFUSDT': 'ريف فاينانس',
    'OGUSDT': 'أوريجين بروتوكول',
    'ATMUSDT': 'كوزموس',
    'ASRUSDT': 'أسر',
    'CELOUSDT': 'سيلو',
    'RIFUSDT': 'ريف توكن',
    'BTCDOMUSDT': 'بيتكوين دومينانس',
    'TRUUSDT': 'ترو يو إس دي',
    'CKBUSDT': 'نيرفوس نتورك',
    'TWTUSDT': 'ترست والت توكن',
    'FIROUSDT': 'فيرو',
    'LITUSDT': 'ليتنتري',
    'SFPUSDT': 'سيف بال',
    'DODOUSDT': 'دودو',
    'CAKEUSDT': 'بانكيك سواب',
    'ACMUSDT': 'أك ميلان فان توكن',
    'BADGERUSDT': 'بادجر داو',
    'FISUSDT': 'ستافي',
    'OMUSDT': 'مانترا داو',
    'PONDUSDT': 'مارلين',
    'DEGOUSDT': 'ديجو فاينانس',
    'ALICEUSDT': 'مايي نيبور أليس',
    'LINAUSDT': 'لينا',
    'PERPUSDT': 'بيربيتوال بروتوكول'
};

// قاموس الأطر الزمنية بالعربية
const intervalNames = {
    '1m': '1 دقيقة',
    '5m': '5 دقائق',
    '15m': '15 دقيقة',
    '30m': '30 دقيقة',
    '1h': '1 ساعة',
    '2h': '2 ساعة',
    '4h': '4 ساعات',
    '6h': '6 ساعات',
    '8h': '8 ساعات',
    '12h': '12 ساعة',
    '1d': '1 يوم',
    '3d': '3 أيام',
    '1w': '1 أسبوع',
    '1M': '1 شهر'
};

// ===== ترجمة أنواع الموجات =====
const waveTypeTranslations = {
    // أنواع الموجات الأساسية
    'wave_1': 'الموجة 1 (بداية الدافع)',
    'wave_2': 'الموجة 2 (تصحيح أول)',
    'wave_3': 'الموجة 3 (الدافع الأقوى)',
    'wave_4': 'الموجة 4 (تصحيح ثاني)',
    'wave_5': 'الموجة 5 (نهاية الدافع)',
    
    // أنواع الموجات التصحيحية
    'wave_a': 'الموجة A (بداية التصحيح)',
    'wave_b': 'الموجة B (ارتداد مؤقت)',
    'wave_c': 'الموجة C (نهاية التصحيح)',
    
    // حالات خاصة
    'new_impulse_starting': 'بداية دافع جديد',
    'correction_in_progress': 'تصحيح جاري',
    'impulse_completing': 'اكتمال الدافع',
    'extended_wave': 'موجة ممتدة',
    'flat_correction': 'تصحيح مسطح',
    'zigzag_correction': 'تصحيح متعرج',
    'triangle_correction': 'تصحيح مثلثي',
    'complex_correction': 'تصحيح معقد',
    
    // حالات غير محددة
    'undefined': 'غير محدد',
    'unknown': 'غير معروف',
    'analyzing': 'قيد التحليل'
};

// ===== تحديد اتجاه النمط =====
function getPatternDirection(pattern, trend) {
    if (!pattern) return 'غير محدد';
    
    console.log('🎯 تحديد اتجاه النمط:', {
        نوع_النمط: pattern.type,
        اتجاه_النمط: pattern.direction,
        الاتجاه_العام: trend
    });
    
    if (pattern.type === 'corrective') {
        // للأنماط التصحيحية، الاتجاه عكس الاتجاه العام
        if (trend === 'bullish') return 'تصحيحي هابط';
        if (trend === 'bearish') return 'تصحيحي صاعد';
        
        // إذا لم يكن هناك اتجاه عام واضح، استخدم اتجاه النمط نفسه
        if (pattern.direction === 'bearish') return 'تصحيحي هابط';
        if (pattern.direction === 'bullish') return 'تصحيحي صاعد';
        
        return 'تصحيحي';
    } else if (pattern.type === 'motive') {
        // للأنماط الدافعة، الاتجاه مع الاتجاه العام
        if (pattern.direction === 'bullish' || trend === 'bullish') return 'دافع صاعد';
        if (pattern.direction === 'bearish' || trend === 'bearish') return 'دافع هابط';
        return 'دافع';
    }
    
    return pattern.type === 'motive' ? 'دافع' : 'تصحيحي';
}

// ===== تحديد رقم الموجة الحالية =====
function getCurrentWaveNumber(analysis) {
    if (!analysis || !analysis.currentWaveAnalysis) {
        return 'غير محدد';
    }
    
    const currentWave = analysis.currentWaveAnalysis.currentWave;
    const patterns = analysis.patterns || [];
    const topPattern = patterns[0];
    
    console.log('🌊 تحليل الموجة الحالية:', {
        الموجة_الحالية: currentWave,
        نوع_النمط: topPattern?.type,
        اتجاه_النمط: topPattern?.direction
    });
    
    if (!currentWave || !topPattern) {
        return 'غير محدد';
    }
    
    // ترجمة نوع الموجة
    const translatedWave = waveTypeTranslations[currentWave] || currentWave;
    
    // تحديد الموجة بدقة أكبر
    if (topPattern.type === 'motive') {
        // للأنماط الدافعة
        if (currentWave.includes('1') || currentWave === 'wave_1') {
            return `الموجة 1 (بداية ${topPattern.direction === 'bullish' ? 'الصعود' : 'الهبوط'})`;
        }
        if (currentWave.includes('2') || currentWave === 'wave_2') {
            return 'الموجة 2 (تصحيح 23.6%-61.8%)';
        }
        if (currentWave.includes('3') || currentWave === 'wave_3') {
            return 'الموجة 3 (أقوى موجة - الهدف الأساسي)';
        }
        if (currentWave.includes('4') || currentWave === 'wave_4') {
            return 'الموجة 4 (تصحيح 23.6%-50%)';
        }
        if (currentWave.includes('5') || currentWave === 'wave_5') {
            return `الموجة 5 (نهاية ${topPattern.direction === 'bullish' ? 'الصعود' : 'الهبوط'})`;
        }
    } else if (topPattern.type === 'corrective') {
        // للأنماط التصحيحية
        const correctionDirection = topPattern.direction === 'bearish' ? 'هابط' : 'صاعد';
        
        if (currentWave.includes('a') || currentWave.includes('A') || currentWave === 'wave_a') {
            return `الموجة A (بداية التصحيح ${correctionDirection})`;
        }
        if (currentWave.includes('b') || currentWave.includes('B') || currentWave === 'wave_b') {
            return `الموجة B (ارتداد مؤقت 50%-78.6%)`;
        }
        if (currentWave.includes('c') || currentWave.includes('C') || currentWave === 'wave_c') {
            return `الموجة C (نهاية التصحيح ${correctionDirection})`;
        }
    }
    
    // إذا لم نجد تطابق، استخدم الترجمة الأساسية
    return translatedWave || 'قيد التحليل';
}

// ===== تكوين المحلل حسب الإطار الزمني =====
function getAnalyzerConfigForTimeframe(interval) {
    const configs = {
        // الأطر الزمنية القصيرة (1-15 دقيقة) - حساسية عالية
        '1m': {
            len1: 2,
            len2: 4,
            len3: 8,
            minWaveLength: 0.2,
            maxWaveLength: 2.0,
            pivotLeftBars: 2,
            pivotRightBars: 2,
            minChangePercent: 0.3,
            confidenceThreshold: 60
        },
        '5m': {
            len1: 3,
            len2: 6,
            len3: 12,
            minWaveLength: 0.3,
            maxWaveLength: 3.0,
            pivotLeftBars: 3,
            pivotRightBars: 3,
            minChangePercent: 0.5,
            confidenceThreshold: 65
        },
        '15m': {
            len1: 4,
            len2: 8,
            len3: 16,
            minWaveLength: 0.4,
            maxWaveLength: 4.0,
            pivotLeftBars: 4,
            pivotRightBars: 4,
            minChangePercent: 0.8,
            confidenceThreshold: 70
        },
        
        // الأطر الزمنية المتوسطة (30 دقيقة - 4 ساعات) - توازن
        '30m': {
            len1: 5,
            len2: 10,
            len3: 20,
            minWaveLength: 0.6,
            maxWaveLength: 5.0,
            pivotLeftBars: 5,
            pivotRightBars: 5,
            minChangePercent: 1.0,
            confidenceThreshold: 75
        },
        '1h': {
            len1: 6,
            len2: 12,
            len3: 24,
            minWaveLength: 0.8,
            maxWaveLength: 6.0,
            pivotLeftBars: 6,
            pivotRightBars: 6,
            minChangePercent: 1.2,
            confidenceThreshold: 80
        },
        '2h': {
            len1: 7,
            len2: 14,
            len3: 28,
            minWaveLength: 1.0,
            maxWaveLength: 7.0,
            pivotLeftBars: 7,
            pivotRightBars: 7,
            minChangePercent: 1.5,
            confidenceThreshold: 80
        },
        '4h': {
            len1: 8,
            len2: 16,
            len3: 32,
            minWaveLength: 1.2,
            maxWaveLength: 8.0,
            pivotLeftBars: 8,
            pivotRightBars: 8,
            minChangePercent: 2.0,
            confidenceThreshold: 85
        },
        
        // الأطر الزمنية الطويلة (6 ساعات - شهر) - استقرار عالي
        '6h': {
            len1: 10,
            len2: 20,
            len3: 40,
            minWaveLength: 1.5,
            maxWaveLength: 10.0,
            pivotLeftBars: 10,
            pivotRightBars: 10,
            minChangePercent: 2.5,
            confidenceThreshold: 85
        },
        '8h': {
            len1: 12,
            len2: 24,
            len3: 48,
            minWaveLength: 2.0,
            maxWaveLength: 12.0,
            pivotLeftBars: 12,
            pivotRightBars: 12,
            minChangePercent: 3.0,
            confidenceThreshold: 90
        },
        '12h': {
            len1: 15,
            len2: 30,
            len3: 60,
            minWaveLength: 2.5,
            maxWaveLength: 15.0,
            pivotLeftBars: 15,
            pivotRightBars: 15,
            minChangePercent: 3.5,
            confidenceThreshold: 90
        },
        '1d': {
            len1: 8,
            len2: 16,
            len3: 32,
            minWaveLength: 1.5,
            maxWaveLength: 8.0,
            pivotLeftBars: 8,
            pivotRightBars: 8,
            minChangePercent: 2.0,
            confidenceThreshold: 85
        },
        '3d': {
            len1: 10,
            len2: 20,
            len3: 40,
            minWaveLength: 2.0,
            maxWaveLength: 10.0,
            pivotLeftBars: 10,
            pivotRightBars: 10,
            minChangePercent: 3.0,
            confidenceThreshold: 85
        },
        '1w': {
            len1: 12,
            len2: 24,
            len3: 48,
            minWaveLength: 3.0,
            maxWaveLength: 12.0,
            pivotLeftBars: 12,
            pivotRightBars: 12,
            minChangePercent: 4.0,
            confidenceThreshold: 90
        },
        '1M': {
            len1: 15,
            len2: 30,
            len3: 60,
            minWaveLength: 4.0,
            maxWaveLength: 15.0,
            pivotLeftBars: 15,
            pivotRightBars: 15,
            minChangePercent: 5.0,
            confidenceThreshold: 90
        }
    };
    
    // إرجاع التكوين المناسب أو التكوين الافتراضي
    const config = configs[interval] || configs['1h'];
    
    console.log(`🔧 تكوين المحلل للإطار الزمني ${interval}:`, {
        حساسية_الموجات: `${config.len1}-${config.len2}-${config.len3}`,
        طول_الموجة: `${config.minWaveLength}-${config.maxWaveLength}`,
        نقاط_التحول: `${config.pivotLeftBars}/${config.pivotRightBars}`,
        حد_التغيير: `${config.minChangePercent}%`,
        عتبة_الثقة: `${config.confidenceThreshold}%`
    });
    
    return config;
}

// ===== دوال مساعدة للواجهة =====
function updateStatus(message, type = 'active') {
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const statusIndicator = statusIcon.parentElement;
    
    statusText.textContent = message;
    statusIndicator.className = `status-indicator ${type}`;
}

function updateLastUpdate() {
    const lastUpdateElement = document.getElementById('last-update');
    const now = new Date();
    const timeString = now.toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    lastUpdateElement.textContent = `آخر تحديث: ${timeString}`;
}

function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return '--';
    return Number(num).toLocaleString('ar-SA', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatPercentage(num, decimals = 2) {
    if (num === null || num === undefined) return '--';
    const formatted = formatNumber(num, decimals);
    return num >= 0 ? `+${formatted}%` : `${formatted}%`;
}

// ===== جلب قائمة العملات من Binance =====
async function loadAllSymbols() {
    try {
        updateStatus('جاري تحميل قائمة العملات...', 'active');
        
        const response = await fetch('https://api1.binance.com/api/v3/exchangeInfo');
        const data = await response.json();
        
        // فلترة العملات التي تنتهي بـ USDT وهي نشطة
        allSymbols = data.symbols
            .filter(symbol => 
                symbol.symbol.endsWith('USDT') && 
                symbol.status === 'TRADING'
            )
            .map(symbol => symbol.symbol)
            .sort();
            
        console.log(`✅ تم تحميل ${allSymbols.length} عملة من Binance`);
        
        // جلب الأسعار الحالية (بشكل غير متزامن لتحسين الأداء)
        loadSymbolPrices().catch(error => {
            console.warn('تحذير: فشل في تحميل بعض الأسعار:', error);
        });
        
        updateStatus('تم تحميل قائمة العملات بنجاح', 'success');
        
    } catch (error) {
        console.error('❌ خطأ في تحميل قائمة العملات:', error);
        updateStatus('فشل في تحميل قائمة العملات، استخدام القائمة الاحتياطية', 'warning');
        
        // استخدام قائمة احتياطية موسعة
        allSymbols = Object.keys(popularSymbolNames);
        console.log(`📦 تم استخدام القائمة الاحتياطية: ${allSymbols.length} عملة`);
    }
}

async function loadSymbolPrices() {
    try {
        const response = await fetch('https://api1.binance.com/api/v3/ticker/price');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const prices = await response.json();
        
        // تحويل إلى كائن للوصول السريع - معالجة محسنة
        symbolPrices = {};
        let processedCount = 0;
        
        for (const item of prices) {
            if (item.symbol.endsWith('USDT')) {
                symbolPrices[item.symbol] = parseFloat(item.price);
                processedCount++;
                
                // معالجة بدفعات لتجنب تجميد الواجهة
                if (processedCount % 100 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
        }
        
        console.log(`💰 تم تحميل أسعار ${Object.keys(symbolPrices).length} عملة`);
        
        // تحديث قائمة المراقبة إذا كانت موجودة
        if (typeof updateWatchlistDisplay === 'function') {
            updateWatchlistDisplay();
        }
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الأسعار:', error);
        
        // إضافة أسعار وهمية للعملات الشائعة كحل احتياطي
        const fallbackPrices = {
            'BTCUSDT': 43000,
            'ETHUSDT': 2600,
            'BNBUSDT': 310,
            'ADAUSDT': 0.48,
            'XRPUSDT': 0.62,
            'SOLUSDT': 98,
            'DOTUSDT': 7.2,
            'LTCUSDT': 73
        };
        
        symbolPrices = { ...symbolPrices, ...fallbackPrices };
        console.log('📦 تم استخدام أسعار احتياطية للعملات الشائعة');
    }
}

// ===== البحث في العملات =====
function handleSymbolInput(event) {
    const input = event.target;
    const query = input.value.toUpperCase().trim();
    
    if (event.key === 'Enter') {
        selectSymbol(query);
        return;
    }
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    const suggestions = allSymbols
        .filter(symbol => symbol.includes(query))
        .slice(0, 10);
        
    showSuggestions(suggestions);
}

function showSuggestions(suggestions) {
    const dropdown = document.getElementById('suggestions-dropdown');
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    dropdown.innerHTML = suggestions.map(symbol => {
        const price = symbolPrices[symbol];
        const arabicName = popularSymbolNames[symbol];
        
        return `
            <div class="suggestion-item" onclick="selectSymbol('${symbol}')">
                <div>
                    <span class="suggestion-symbol">${symbol}</span>
                    ${arabicName ? `<small style="color: #888; margin-right: 8px;">${arabicName}</small>` : ''}
                </div>
                ${price ? `<span class="suggestion-price">$${formatNumber(price, 4)}</span>` : ''}
            </div>
        `;
    }).join('');
    
    dropdown.classList.add('show');
}

function hideSuggestions() {
    const dropdown = document.getElementById('suggestions-dropdown');
    dropdown.classList.remove('show');
}

function selectSymbol(symbol) {
    const input = document.getElementById('symbol-input');
    input.value = symbol;
    currentSymbol = symbol;
    hideSuggestions();
    saveSettings();
    
    const displayName = popularSymbolNames[symbol] || symbol;
    console.log('تم تغيير العملة إلى:', symbol, '(' + displayName + ')');
    updateStatus(`تم تغيير العملة إلى ${displayName}`, 'active');
    runAnalysis();
}

// إخفاء القائمة عند النقر خارجها
document.addEventListener('click', function(event) {
    const symbolSelector = document.querySelector('.symbol-selector');
    if (!symbolSelector.contains(event.target)) {
        hideSuggestions();
    }
});

// ===== دوال تغيير الإعدادات =====
function changeSymbol() {
    // هذه الدالة لم تعد مستخدمة مع النظام الجديد
    const input = document.getElementById('symbol-input');
    selectSymbol(input.value.toUpperCase().trim());
}

function changeInterval() {
    const intervalSelect = document.getElementById('interval-select');
    const newInterval = intervalSelect.value;
    
    // تحذير للأطر الزمنية القصيرة
    const shortIntervals = ['1m', '5m', '15m', '30m'];
    if (shortIntervals.includes(newInterval)) {
        const confirmed = confirm(
            `⚠️ تحذير: الأطر الزمنية القصيرة (${intervalNames[newInterval]}) قد تعطي نتائج أقل دقة.\n\n` +
            `للحصول على أفضل دقة، يُنصح باستخدام الأطر الزمنية الطويلة (4 ساعات فما فوق).\n\n` +
            `هل تريد المتابعة؟`
        );
        
        if (!confirmed) {
            // إعادة تعيين الإختيار للقيمة السابقة
            intervalSelect.value = currentInterval;
            return;
        }
        
        // إظهار تحذير في الواجهة
        updateStatus(`⚠️ تم اختيار إطار زمني قصير - دقة أقل متوقعة`, 'warning');
    } else if (['4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'].includes(newInterval)) {
        // تهنئة للأطر الزمنية الطويلة
        updateStatus(`✅ إطار زمني ممتاز للحصول على دقة عالية`, 'success');
    }
    
    currentInterval = newInterval;
    saveSettings();
    console.log('تم تغيير الإطار الزمني إلى:', currentInterval, '(' + intervalNames[currentInterval] + ')');
    
    setTimeout(() => {
    updateStatus(`تم تغيير الإطار الزمني إلى ${intervalNames[currentInterval]}`, 'active');
    runAnalysis();
    }, 1500);
}

// ===== الربط مع Binance API =====
async function getBinanceData(symbol = currentSymbol, interval = currentInterval) {
    try {
        updateStatus('جاري تحميل بيانات السوق...', 'active');
  const response = await fetch(`https://api1.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateStatus('تم تحميل البيانات بنجاح', 'active');
        return data;
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        updateStatus('خطأ في تحميل البيانات', 'error');
        throw error;
    }
}

// ===== التحليل الرئيسي =====
async function runAnalysis() {
    if (isAnalyzing) return;
    
    try {
        isAnalyzing = true;
        updateStatus('جاري التحليل...', 'active');
        
        // تحديث واجهة التحميل
        showLoadingStates();
        
        // جلب البيانات
  const rawData = await getBinanceData();
        
        // فحص صحة البيانات
        if (!rawData || !Array.isArray(rawData) || rawData.length < 2) {
            throw new Error('البيانات المستلمة من API غير صحيحة أو غير كافية');
        }
        
        // فحص صحة تنسيق البيانات
        const lastCandle = rawData[rawData.length - 1];
        if (!lastCandle || !Array.isArray(lastCandle) || lastCandle.length < 6) {
            throw new Error('تنسيق البيانات المستلمة غير صحيح');
        }
        
        // فحص أن البيانات تحتوي على أرقام صحيحة
        const price = parseFloat(lastCandle[4]);
        if (isNaN(price) || price <= 0) {
            throw new Error('البيانات المستلمة لا تحتوي على أسعار صحيحة');
        }
        
        console.log('✅ تم جلب البيانات بنجاح:', {
            عدد_الشموع: rawData.length,
            آخر_سعر: price,
            الوقت: new Date(parseInt(lastCandle[0])).toLocaleString()
        });
        
                // تحليل البيانات مع تكيف المعاملات حسب الإطار الزمني
        updateStatus('جاري تحليل الأنماط...', 'active');
        const analyzerConfig = getAnalyzerConfigForTimeframe(currentInterval);
        const analyzer = new ElliottWaveAnalyzer(analyzerConfig);
        const result = analyzer.analyze(rawData);
  
        // فحص نتائج التحليل
        if (!result) {
            throw new Error('فشل في الحصول على نتائج التحليل');
        }
        
        if (result.status === 'error') {
            throw new Error(result.error || 'خطأ في عملية التحليل');
        }
        
        console.log('✅ تم التحليل بنجاح:', {
            العملة: currentSymbol,
            الإطار_الزمني: currentInterval,
            عدد_الأنماط: result.patterns?.length || 0,
            الاتجاه: result.trend,
            عدد_التوصيات: result.recommendations?.length || 0,
            دقة_التحليل: result.patterns?.[0]?.confidence || 0
        });
        
        currentAnalysis = result;
        
        // تسجيل التحليل في الإحصائيات
        if (typeof recordCurrentAnalysis === 'function') {
            const analysisRecord = {
                symbol: currentSymbol,
                interval: currentInterval,
                patterns: result.patterns || [],
                timestamp: Date.now()
            };
            recordCurrentAnalysis(analysisRecord);
            
            // تحديث عرض الإحصائيات
            setTimeout(() => {
                updateStatisticsDisplay();
                updateAnalyticsDisplay();
                updateHeaderStats();
            }, 500);
        }
        
        // عرض النتائج
        displayMarketData(rawData);
  displayResults(result);
        displayRecommendations(result);
        
        // حساب وعرض المؤشرات التقنية الحقيقية
        try {
            updateStatus('جاري حساب المؤشرات التقنية الحقيقية...', 'active');
            const technicalAnalysis = await calculateRealTechnicalIndicators(rawData);
            displayTechnicalIndicators(technicalAnalysis);
            displayTradingSignals(technicalAnalysis.signals);
            console.log('✅ تم حساب المؤشرات التقنية والإشارات بنجاح');
        } catch (error) {
            console.error('❌ خطأ في المؤشرات التقنية:', error);
            
            // عرض رسالة خطأ في واجهة المؤشرات
            const indicatorsContainer = document.getElementById('technical-indicators');
            const signalsContainer = document.getElementById('trading-signals');
            
            if (indicatorsContainer) {
                indicatorsContainer.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>فشل في حساب المؤشرات التقنية</p>
                        <small>${error.message}</small>
                        <div style="margin-top: 1rem;">
                            <button onclick="runAnalysis()" class="btn-primary">إعادة المحاولة</button>
                        </div>
                    </div>
                `;
            }
            
            if (signalsContainer) {
                signalsContainer.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>فشل في تحليل الإشارات التجارية</p>
                        <small>يتطلب المؤشرات التقنية الصحيحة</small>
                    </div>
                `;
            }
        }
        
        updateStatus('اكتمل التحليل الشامل', 'success');
        updateLastUpdate();
        
    } catch (error) {
        console.error('❌ خطأ في التحليل:', error);
        updateStatus(`خطأ: ${error.message}`, 'error');
        showErrorStates(error.message);
    } finally {
        isAnalyzing = false;
    }
}

// ===== عرض حالات التحميل =====
function showLoadingStates() {
    const marketData = document.getElementById('market-data');
    const analysisResults = document.getElementById('analysis-results');
    const recommendations = document.getElementById('recommendations');
    
    marketData.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>جاري تحميل بيانات السوق...</span>
        </div>
    `;
    
    analysisResults.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>جاري التحليل الفني...</span>
        </div>
    `;
    
    recommendations.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>جاري إنشاء التوصيات...</span>
        </div>
    `;
}

// ===== عرض حالات الخطأ =====
function showErrorStates(errorMessage) {
    const marketData = document.getElementById('market-data');
    const analysisResults = document.getElementById('analysis-results');
    const recommendations = document.getElementById('recommendations');
    
    const errorHtml = `
        <div style="text-align: center; padding: 2rem; color: #f44336;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>حدث خطأ في التحليل</p>
            <small style="opacity: 0.7;">${errorMessage}</small>
        </div>
    `;
    
    marketData.innerHTML = errorHtml;
    analysisResults.innerHTML = errorHtml;
    recommendations.innerHTML = errorHtml;
}

// ===== عرض بيانات السوق =====
function displayMarketData(rawData) {
    const marketDataDiv = document.getElementById('market-data');
    
    if (!rawData || rawData.length === 0) {
        marketDataDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #f44336;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>لا توجد بيانات متاحة من Binance API</p>
            </div>
        `;
        return;
    }
    
    // آخر شمعة
    const lastCandle = rawData[rawData.length - 1];
    const prevCandle = rawData[rawData.length - 2];
    
    if (!lastCandle || !prevCandle) {
        marketDataDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #f44336;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>البيانات المستلمة غير كافية للتحليل</p>
            </div>
        `;
        return;
    }
    
    const currentPrice = parseFloat(lastCandle[4]); // سعر الإغلاق
    const openPrice = parseFloat(lastCandle[1]); // سعر الافتتاح
    const highPrice = parseFloat(lastCandle[2]); // أعلى سعر
    const lowPrice = parseFloat(lastCandle[3]); // أقل سعر
    const volume = parseFloat(lastCandle[5]); // الحجم
    const timestamp = parseInt(lastCandle[0]); // الوقت
    
    const prevPrice = parseFloat(prevCandle[4]);
    const priceChange = currentPrice - prevPrice;
    const priceChangePercent = (priceChange / prevPrice) * 100;
    
    const isPositive = priceChange >= 0;
    
    // تحويل الوقت إلى تاريخ مقروء
    const lastUpdateTime = new Date(timestamp).toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    marketDataDiv.innerHTML = `
        <div class="market-info">
            <div class="market-item price">
                <i class="fas fa-dollar-sign"></i>
                <div class="label">السعر الحالي</div>
                <div class="value">$${formatNumber(currentPrice, 4)}</div>
            </div>
            
            <div class="market-item change ${isPositive ? 'positive' : 'negative'}">
                <i class="fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                <div class="label">التغيير (24س)</div>
                <div class="value" style="color: ${isPositive ? '#4CAF50' : '#f44336'}; font-weight: 700;">${formatPercentage(priceChangePercent)}</div>
            </div>
            
            <div class="market-item volume">
                <i class="fas fa-chart-bar"></i>
                <div class="label">الحجم</div>
                <div class="value">${formatNumber(volume, 0)}</div>
            </div>
            
            <div class="market-item">
                <i class="fas fa-chart-line"></i>
                <div class="label">أعلى سعر</div>
                <div class="value">$${formatNumber(highPrice, 4)}</div>
            </div>
            
            <div class="market-item">
                <i class="fas fa-chart-line"></i>
                <div class="label">أقل سعر</div>
                <div class="value">$${formatNumber(lowPrice, 4)}</div>
            </div>
            
            <div class="market-item">
                <i class="fas fa-clock"></i>
                <div class="label">آخر تحديث</div>
                <div class="value" style="font-size: 0.9rem;">${lastUpdateTime}</div>
            </div>
        </div>
        
        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(76, 175, 80, 0.1); border-radius: 8px; border: 1px solid rgba(76, 175, 80, 0.3); text-align: center;">
            <p style="color: #4CAF50; font-size: 0.9rem; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <i class="fas fa-check-circle"></i>
                البيانات الحقيقية من Binance API - ${popularSymbolNames[currentSymbol] || currentSymbol} (${intervalNames[currentInterval]}) - ${rawData.length} شمعة
            </p>
        </div>
    `;
}

// ===== عرض نتائج التحليل =====
function displayResults(analysis) {
  const resultsDiv = document.getElementById('analysis-results');
    
    if (!analysis || analysis.status === 'error') {
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #f44336;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>فشل في التحليل</p>
                <small>${analysis?.error || 'خطأ غير معروف'}</small>
            </div>
        `;
        return;
    }
    
    const patterns = analysis.patterns || [];
    const topPattern = patterns[0];
    const trend = analysis.trend;
    const currentWaveAnalysis = analysis.currentWaveAnalysis;
    
    // تحديد نوع النمط والاتجاه مع التفاصيل
    const patternType = getPatternDirection(topPattern, trend);
    const trendText = trend === 'bullish' ? 'صاعد' : trend === 'bearish' ? 'هابط' : 'جانبي';
    const confidence = topPattern?.confidence || 0;
    const currentWave = getCurrentWaveNumber(analysis);
    
    resultsDiv.innerHTML = `
        <div class="analysis-grid">
            <div class="analysis-item pattern">
                <i class="fas fa-wave-square"></i>
                <div class="label">نوع النمط</div>
                <div class="value">${patternType}</div>
            </div>
            
            <div class="analysis-item trend">
                <i class="fas ${trend === 'bullish' ? 'fa-arrow-trend-up' : trend === 'bearish' ? 'fa-arrow-trend-down' : 'fa-arrows-left-right'}"></i>
                <div class="label">الاتجاه العام</div>
                <div class="value">${trendText}</div>
            </div>
            
            <div class="analysis-item wave">
                <i class="fas fa-water"></i>
                <div class="label">الموجة الحالية</div>
                <div class="value" style="font-size: 1.1rem; line-height: 1.3;">${currentWave}</div>
            </div>
            
            <div class="analysis-item confidence">
                <i class="fas fa-percentage"></i>
                <div class="label">دقة التحليل</div>
                <div class="value">${formatNumber(confidence, 0)}%</div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h3 style="color: #4CAF50; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-info-circle"></i>
                ملخص التحليل - ${popularSymbolNames[currentSymbol] || currentSymbol} (${intervalNames[currentInterval]})
            </h3>
            <p style="line-height: 1.8; color: #e0e0e0;">
                ${analysis.summary || `تحليل موجات إليوت للعملة ${popularSymbolNames[currentSymbol] || currentSymbol} على الإطار الزمني ${intervalNames[currentInterval]}. يتم تحليل البيانات باستخدام معاملات مخصصة لهذا الإطار الزمني لضمان دقة أفضل.`}
            </p>
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(33, 150, 243, 0.1); border-radius: 8px; border-left: 3px solid #2196F3;">
                <small style="color: #2196F3; font-weight: 600;">
                    <i class="fas fa-cog"></i> 
                    تم تحسين المعاملات تلقائياً للإطار الزمني ${intervalNames[currentInterval]} لتحليل أكثر دقة
                </small>
            </div>
        </div>
    `;
}

// ===== عرض التوصيات =====
function displayRecommendations(analysis) {
  const recDiv = document.getElementById('recommendations');
  
    if (!analysis || !analysis.recommendations || analysis.recommendations.length === 0) {
        recDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #888;">
                <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>لا توجد توصيات متاحة حالياً</p>
            </div>
        `;
        return;
    }
    
    const recommendationsHtml = analysis.recommendations.map(rec => {
        const iconMap = {
            'buy': 'fa-arrow-up',
            'sell': 'fa-arrow-down',
            'wait': 'fa-clock',
            'caution': 'fa-exclamation-triangle',
            'neutral': 'fa-minus'
        };
        
        const icon = iconMap[rec.type] || 'fa-info';
        
        let detailsHtml = '';
        if (rec.confidence) {
            detailsHtml += `<span class="confidence-badge">الثقة: ${formatNumber(rec.confidence, 0)}%</span>`;
        }
        if (rec.entry) {
            detailsHtml += `<span>نقطة الدخول: $${formatNumber(rec.entry, 4)}</span>`;
        }
        if (rec.targets && rec.targets.length > 0) {
            detailsHtml += `<span>الأهداف: ${rec.targets.map(t => '$' + formatNumber(t, 4)).join(', ')}</span>`;
        }
        if (rec.stopLoss) {
            detailsHtml += `<span>وقف الخسارة: $${formatNumber(rec.stopLoss, 4)}</span>`;
        }
        if (rec.expectedCompletion) {
            detailsHtml += `<span>الهدف المتوقع: $${formatNumber(rec.expectedCompletion, 4)}</span>`;
        }
        if (rec.correctionDirection) {
            detailsHtml += `<span>اتجاه التصحيح: ${rec.correctionDirection}</span>`;
        }
        
        return `
      <div class="recommendation ${rec.type}">
                <i class="fas ${icon}"></i>
                <div class="recommendation-content">
                    <div class="recommendation-message">${rec.message}</div>
                    ${detailsHtml ? `<div class="recommendation-details">${detailsHtml}</div>` : ''}
                </div>
      </div>
    `;
    }).join('');
    
    recDiv.innerHTML = `<div class="recommendations-list">${recommendationsHtml}</div>`;
}

// ===== حفظ واستعادة الإعدادات المحسن =====
function saveSettings() {
    try {
        const settings = {
            symbol: currentSymbol,
            interval: currentInterval,
            timestamp: Date.now(),
            version: '2.0'
        };
        
        localStorage.setItem('elliott_settings', JSON.stringify(settings));
        localStorage.setItem('elliott_symbol', currentSymbol); // للتوافق مع النسخة القديمة
        localStorage.setItem('elliott_interval', currentInterval); // للتوافق مع النسخة القديمة
        
        console.log('✅ تم حفظ الإعدادات:', settings);
    } catch (error) {
        console.error('❌ خطأ في حفظ الإعدادات:', error);
    }
}

function loadSettings() {
    try {
        // محاولة تحميل الإعدادات الجديدة
        const settingsJson = localStorage.getItem('elliott_settings');
        if (settingsJson) {
            const settings = JSON.parse(settingsJson);
            if (settings.version === '2.0') {
                currentSymbol = settings.symbol || 'BTCUSDT';
                currentInterval = settings.interval || '1h';
                console.log('✅ تم تحميل الإعدادات الجديدة:', settings);
            }
        } else {
            // التوافق مع النسخة القديمة
    const savedSymbol = localStorage.getItem('elliott_symbol');
    const savedInterval = localStorage.getItem('elliott_interval');
    
    if (savedSymbol) {
        currentSymbol = savedSymbol;
    }
    
    if (savedInterval && intervalNames[savedInterval]) {
        currentInterval = savedInterval;
            } else {
                // إذا لم توجد إعدادات محفوظة، استخدم الإطار الزمني الأمثل
                currentInterval = '4h';
            }
            
            console.log('📦 تم تحميل إعدادات النسخة القديمة');
        }
        
        // تحديث واجهة المستخدم
        const symbolInput = document.getElementById('symbol-input');
        if (symbolInput) {
            symbolInput.value = currentSymbol;
        }
        
        const intervalSelect = document.getElementById('interval-select');
        if (intervalSelect) {
            intervalSelect.value = currentInterval;
        }
        
        // التحقق من صحة العملة المحفوظة
        if (!allSymbols.includes(currentSymbol) && !Object.keys(popularSymbolNames).includes(currentSymbol)) {
            console.warn('⚠️ العملة المحفوظة غير صالحة، استخدام البيتكوين كافتراضي');
            currentSymbol = 'BTCUSDT';
            if (symbolInput) {
                symbolInput.value = currentSymbol;
            }
        }
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الإعدادات:', error);
        // استخدام القيم الافتراضية
        currentSymbol = 'BTCUSDT';
        currentInterval = '1h';
    }
}

// ===== تشغيل التطبيق =====
document.addEventListener('DOMContentLoaded', async function() {
    // استعادة الإعدادات المحفوظة
    loadSettings();
    
    // تحميل قائمة المراقبة المحفوظة
    const savedWatchlist = localStorage.getItem('elliott_watchlist');
    if (savedWatchlist) {
        try {
            watchlist = JSON.parse(savedWatchlist);
            console.log(`📋 تم تحميل قائمة المراقبة: ${watchlist.length} عملة`);
        } catch (error) {
            console.error('خطأ في تحميل قائمة المراقبة:', error);
            watchlist = [];
        }
    } else {
        // إضافة عملات افتراضية لقائمة المراقبة للمستخدمين الجدد
        watchlist = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'LTCUSDT'];
        localStorage.setItem('elliott_watchlist', JSON.stringify(watchlist));
        console.log('📋 تم إنشاء قائمة مراقبة افتراضية');
    }
    
    // تحميل قائمة العملات من Binance (في الخلفية)
    loadAllSymbols().catch(error => {
        console.error('فشل في تحميل قائمة العملات:', error);
    });
    
    // تحديث قائمة المراقبة
    updateWatchlistDisplay();
    
    // تشغيل التحليل الأولي
    runAnalysis();
    
    // تحديث دوري كل 5 دقائق
    setInterval(runAnalysis, 5 * 60 * 1000);
    
    // تحديث قائمة العملات والأسعار كل 30 دقيقة
    setInterval(() => {
        loadAllSymbols().catch(error => {
            console.error('فشل في تحديث قائمة العملات:', error);
        });
    }, 30 * 60 * 1000);
});

// تشغيل التحليل عند تحميل الصفحة (للتوافق مع النسخة القديمة)
window.onload = runAnalysis;

// ===== الميزات التفاعلية =====

// متغيرات للميزات التفاعلية
let watchlist = JSON.parse(localStorage.getItem('elliott_watchlist')) || [];
let priceAlerts = JSON.parse(localStorage.getItem('elliott_alerts')) || [];
let marketSentiment = 50; // قيمة افتراضية

// ===== قائمة المراقبة =====
function toggleWatchlist() {
    const content = document.getElementById('watchlist-content');
    const icon = document.getElementById('watchlist-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-minus';
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-plus';
    }
}

function addToWatchlist(symbol) {
    if (!symbol) {
        alert('⚠️ لم يتم تحديد عملة للإضافة');
        return;
    }
    
    if (watchlist.includes(symbol)) {
        alert(`💡 ${symbol} موجودة بالفعل في قائمة المراقبة`);
        return;
    }
    
    watchlist.push(symbol);
    localStorage.setItem('elliott_watchlist', JSON.stringify(watchlist));
    updateWatchlistDisplay();
    
    // تغيير أيقونة الإضافة
    const addBtn = document.getElementById('add-watchlist-btn');
    if (addBtn) {
    addBtn.style.color = '#FFD700';
    addBtn.className = 'fas fa-star';
    
    setTimeout(() => {
        addBtn.style.color = '#4CAF50';
    }, 1000);
    }
    
    const symbolName = popularSymbolNames[symbol] || symbol;
    updateStatus(`✅ تم إضافة ${symbolName} لقائمة المراقبة`, 'success');
    console.log(`⭐ تم إضافة ${symbol} لقائمة المراقبة`);
}

function removeFromWatchlist(symbol) {
    watchlist = watchlist.filter(s => s !== symbol);
    localStorage.setItem('elliott_watchlist', JSON.stringify(watchlist));
    updateWatchlistDisplay();
}

async function updateWatchlistDisplay() {
    const content = document.getElementById('watchlist-content');
    
    if (watchlist.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star-half-alt"></i>
                <p>أضف العملات المفضلة لديك</p>
            </div>
        `;
        return;
    }
    
    // جلب أسعار العملات في قائمة المراقبة
    let watchlistHtml = '';
    
    for (const symbol of watchlist) {
        const price = symbolPrices[symbol];
        const arabicName = popularSymbolNames[symbol];
        
        // REMOVED: Fake random price changes - will be replaced with real data
        const changeClass = 'neutral';
        const changeText = '--';
        
        watchlistHtml += `
            <div class="watchlist-item" onclick="selectSymbol('${symbol}')">
                <div>
                    <div class="watchlist-symbol">${symbol}</div>
                    ${arabicName ? `<small style="color: #888;">${arabicName}</small>` : ''}
                </div>
                <div style="text-align: right;">
                    <div class="watchlist-price">$${price ? formatNumber(price, 4) : '--'}</div>
                    <div class="watchlist-change ${changeClass}">${changeText}</div>
                </div>
                <button class="remove-watchlist" onclick="event.stopPropagation(); removeFromWatchlist('${symbol}')" title="إزالة">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }
    
    content.innerHTML = watchlistHtml;
}

// REMOVED: All fake market sentiment functions
// These were generating fake data with Math.random() which is misleading

// ===== تنبيهات الأسعار =====
function toggleAlerts() {
    const modal = document.getElementById('alertModal');
    modal.style.display = 'block';
    
    // تعبئة العملة الحالية
    document.getElementById('alertSymbol').value = currentSymbol;
}

function closeAlertModal() {
    const modal = document.getElementById('alertModal');
    modal.style.display = 'none';
    document.getElementById('alertForm').reset();
}

function addPriceAlert(symbol, condition, price) {
    const alert = {
        id: Date.now(),
        symbol: symbol,
        condition: condition,
        price: parseFloat(price),
        created: new Date().toISOString()
    };
    
    priceAlerts.push(alert);
    localStorage.setItem('elliott_alerts', JSON.stringify(priceAlerts));
    updateAlertsDisplay();
    closeAlertModal();
}

function removePriceAlert(alertId) {
    priceAlerts = priceAlerts.filter(alert => alert.id !== alertId);
    localStorage.setItem('elliott_alerts', JSON.stringify(priceAlerts));
    updateAlertsDisplay();
}

function updateAlertsDisplay() {
    const content = document.getElementById('alerts-content');
    
    if (priceAlerts.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>لا توجد تنبيهات نشطة</p>
            </div>
        `;
        return;
    }
    
    let alertsHtml = '';
    
    priceAlerts.forEach(alert => {
        const conditionText = alert.condition === 'above' ? 'أعلى من' : 'أقل من';
        const arabicName = popularSymbolNames[alert.symbol];
        
        alertsHtml += `
            <div class="alert-item">
                <div class="alert-info">
                    <div class="alert-symbol">${alert.symbol}</div>
                    <div class="alert-condition">${conditionText} $${formatNumber(alert.price, 4)}</div>
                    ${arabicName ? `<small style="color: #666;">${arabicName}</small>` : ''}
                </div>
                <div class="alert-actions">
                    <button class="alert-btn delete" onclick="removePriceAlert(${alert.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = alertsHtml;
}

function checkPriceAlerts() {
    if (priceAlerts.length === 0) return;
    
    priceAlerts.forEach(alert => {
        const currentPrice = symbolPrices[alert.symbol];
        if (!currentPrice) return;
        
        let triggered = false;
        
        if (alert.condition === 'above' && currentPrice >= alert.price) {
            triggered = true;
        } else if (alert.condition === 'below' && currentPrice <= alert.price) {
            triggered = true;
        }
        
        if (triggered) {
            showNotification(
                `تنبيه سعر: ${alert.symbol}`,
                `السعر الحالي $${formatNumber(currentPrice, 4)} ${alert.condition === 'above' ? 'تجاوز' : 'انخفض عن'} $${formatNumber(alert.price, 4)}`
            );
            
            // إزالة التنبيه بعد التفعيل
            removePriceAlert(alert.id);
        }
    });
}

function showNotification(title, message) {
    // إشعار المتصفح
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico'
        });
    }
    
    // إشعار في الواجهة
    updateStatus(`🔔 ${title}: ${message}`, 'active');
}

// طلب إذن الإشعارات
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// معالج إرسال نموذج التنبيه
document.addEventListener('DOMContentLoaded', function() {
    const alertForm = document.getElementById('alertForm');
    if (alertForm) {
        alertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const symbol = document.getElementById('alertSymbol').value.toUpperCase();
            const condition = document.getElementById('alertCondition').value;
            const price = document.getElementById('alertPrice').value;
            
            if (symbol && condition && price) {
                addPriceAlert(symbol, condition, price);
            }
        });
    }
    
    // تحديث العروض الأولية
    updateWatchlistDisplay();
    updateAlertsDisplay();
    requestNotificationPermission();
    
    // فحص التنبيهات كل دقيقة
    setInterval(checkPriceAlerts, 60000);
});

// إغلاق المودال عند النقر خارجه
window.addEventListener('click', function(event) {
    const modal = document.getElementById('alertModal');
    if (event.target === modal) {
        closeAlertModal();
    }
});

// REMOVED: All fake backtesting functions
// These were generating misleading performance metrics

// REMOVED: displayPerformanceMetrics - was generating fake performance data

// REMOVED: Rating functions - were part of fake backtesting system

// REMOVED: All fake statistics and analytics functions
// These were generating misleading data and fake performance metrics

// ===== مؤشرات تقنية حقيقية =====
const realIndicators = new RealTechnicalIndicators();

async function calculateRealTechnicalIndicators(data) {
    try {
        console.log('🔍 بدء حساب المؤشرات التقنية الحقيقية...');
        
        if (!data || data.length < 50) {
            throw new Error('البيانات غير كافية لحساب المؤشرات التقنية (مطلوب 50 شمعة على الأقل)');
        }
        
        // تحويل البيانات للشكل المطلوب
        const formattedData = data.map(candle => ({
            timestamp: candle[0],
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5])
        }));
        
        // حساب جميع المؤشرات
        const analysis = realIndicators.analyzeAllIndicators(formattedData);
        
        console.log('✅ تم حساب المؤشرات التقنية بنجاح');
        return analysis;
        
    } catch (error) {
        console.error('❌ خطأ في حساب المؤشرات التقنية:', error);
        throw error;
    }
}

function displayTechnicalIndicators(analysis) {
    const container = document.getElementById('technical-indicators');
    if (!container) return;
    
    if (!analysis || analysis.error) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>فشل في حساب المؤشرات التقنية</p>
                <small>${analysis?.error || 'خطأ غير معروف'}</small>
            </div>
        `;
        return;
    }
    
    const indicators = analysis.indicators;
    const currentData = indicators.rsi?.[indicators.rsi.length - 1];
    const currentMACD = indicators.macd?.histogram?.[indicators.macd.histogram.length - 1];
    const currentBB = indicators.bollingerBands?.[indicators.bollingerBands.length - 1];
    const currentADX = indicators.adx?.[indicators.adx.length - 1];
    
    container.innerHTML = `
        <div class="real-indicators-grid">
            <div class="indicator-card">
                <div class="indicator-header">
                    <i class="fas fa-tachometer-alt"></i>
                    <h4>مؤشر القوة النسبية (RSI)</h4>
                    <span class="authenticity-tag">حقيقي</span>
                </div>
                <div class="indicator-content">
                    <div class="indicator-value ${getRSIClass(currentData?.value)}">
                        ${currentData ? currentData.value.toFixed(1) : '--'}
                    </div>
                    <div class="indicator-status">
                        ${getRSIStatus(currentData?.value)}
                    </div>
                </div>
            </div>
            
            <div class="indicator-card">
                <div class="indicator-header">
                    <i class="fas fa-wave-square"></i>
                    <h4>MACD</h4>
                    <span class="authenticity-tag">حقيقي</span>
                </div>
                <div class="indicator-content">
                    <div class="indicator-value ${getMACDClass(currentMACD?.value)}">
                        ${currentMACD ? currentMACD.value.toFixed(4) : '--'}
                    </div>
                    <div class="indicator-status">
                        ${getMACDStatus(currentMACD?.value)}
                    </div>
                </div>
            </div>
            
            <div class="indicator-card">
                <div class="indicator-header">
                    <i class="fas fa-arrows-alt-h"></i>
                    <h4>البولنجر باندز</h4>
                    <span class="authenticity-tag">حقيقي</span>
                </div>
                <div class="indicator-content">
                    <div class="bb-values">
                        <div class="bb-value">العلوي: ${currentBB ? currentBB.upper.toFixed(4) : '--'}</div>
                        <div class="bb-value">الوسط: ${currentBB ? currentBB.middle.toFixed(4) : '--'}</div>
                        <div class="bb-value">السفلي: ${currentBB ? currentBB.lower.toFixed(4) : '--'}</div>
                    </div>
                </div>
            </div>
            
            <div class="indicator-card">
                <div class="indicator-header">
                    <i class="fas fa-compass"></i>
                    <h4>مؤشر قوة الاتجاه (ADX)</h4>
                    <span class="authenticity-tag">حقيقي</span>
                </div>
                <div class="indicator-content">
                    <div class="indicator-value ${getADXClass(currentADX?.adx)}">
                        ${currentADX ? currentADX.adx.toFixed(1) : '--'}
                    </div>
                    <div class="indicator-status">
                        ${getADXStatus(currentADX?.adx)}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="indicators-summary">
            <div class="summary-header">
                <i class="fas fa-chart-line"></i>
                <h4>ملخص المؤشرات التقنية</h4>
            </div>
            <div class="summary-content">
                <p>تم حساب جميع المؤشرات باستخدام البيانات الحقيقية من Binance API. 
                   عدد نقاط البيانات: ${analysis.dataPoints}</p>
                <div class="calculation-time">
                    آخر تحديث: ${new Date(analysis.timestamp).toLocaleString('ar-SA')}
                </div>
            </div>
        </div>
    `;
}

function displayTradingSignals(signals) {
    const container = document.getElementById('trading-signals');
    if (!container) return;
    
    if (!signals || signals.error) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>فشل في تحليل الإشارات التجارية</p>
                <small>${signals?.error || 'خطأ غير معروف'}</small>
            </div>
        `;
        return;
    }
    
    const overallClass = signals.overall === 'bullish' ? 'bullish' : 
                        signals.overall === 'bearish' ? 'bearish' : 'neutral';
    
    container.innerHTML = `
        <div class="signals-overview">
            <div class="overall-signal ${overallClass}">
                <div class="signal-icon">
                    <i class="fas ${signals.overall === 'bullish' ? 'fa-arrow-up' : 
                                   signals.overall === 'bearish' ? 'fa-arrow-down' : 'fa-minus'}"></i>
                </div>
                <div class="signal-content">
                    <h3>الإشارة العامة: ${getSignalText(signals.overall)}</h3>
                    <div class="signal-strength">قوة الإشارة: ${signals.strength}%</div>
                    <div class="signal-confidence">مستوى الثقة: ${signals.confidence}%</div>
                </div>
            </div>
        </div>
        
        <div class="individual-signals">
            <h4>الإشارات التفصيلية:</h4>
            <div class="signals-list">
                ${signals.signals.map(signal => `
                    <div class="signal-item ${signal.direction}">
                        <div class="signal-type">${signal.type}</div>
                        <div class="signal-direction ${signal.direction}">
                            <i class="fas ${signal.direction === 'bullish' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                            ${signal.direction === 'bullish' ? 'صاعد' : 'هابط'}
                        </div>
                        <div class="signal-strength-badge ${signal.strength}">
                            ${signal.strength === 'strong' ? 'قوي' : 
                              signal.strength === 'medium' ? 'متوسط' : 'ضعيف'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="signals-disclaimer">
            <i class="fas fa-info-circle"></i>
            <p>هذه الإشارات مبنية على المؤشرات التقنية الحقيقية وليست نصائح استثمارية. 
               يرجى إجراء البحث الخاص بك قبل اتخاذ أي قرارات تداول.</p>
        </div>
    `;
}

// دوال مساعدة للمؤشرات
function getRSIClass(value) {
    if (!value) return '';
    if (value < 30) return 'oversold';
    if (value > 70) return 'overbought';
    return 'normal';
}

function getRSIStatus(value) {
    if (!value) return 'غير متاح';
    if (value < 30) return 'تشبع بيعي (فرصة شراء)';
    if (value > 70) return 'تشبع شرائي (فرصة بيع)';
    return 'منطقة طبيعية';
}

function getMACDClass(value) {
    if (!value) return '';
    return value > 0 ? 'positive' : 'negative';
}

function getMACDStatus(value) {
    if (!value) return 'غير متاح';
    return value > 0 ? 'إشارة صاعدة' : 'إشارة هابطة';
}

function getADXClass(value) {
    if (!value) return '';
    if (value > 50) return 'strong-trend';
    if (value > 25) return 'trend';
    return 'weak-trend';
}

function getADXStatus(value) {
    if (!value) return 'غير متاح';
    if (value > 50) return 'اتجاه قوي جداً';
    if (value > 25) return 'اتجاه قوي';
    return 'اتجاه ضعيف';
}

function getSignalText(signal) {
    switch(signal) {
        case 'bullish': return 'صاعد';
        case 'bearish': return 'هابط';
        default: return 'محايد';
    }
}
