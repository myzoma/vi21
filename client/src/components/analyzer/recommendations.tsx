import type { AnalysisResponse } from "@/lib/types";

interface RecommendationsProps {
  analysisData: AnalysisResponse;
  symbol: string;
}

export default function Recommendations({ analysisData, symbol }: RecommendationsProps) {
  if (!analysisData) {
    return null;
  }

  const { technicalIndicators, elliottWaveData, tradingSignals } = analysisData;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  // Generate support/resistance levels from analysis
  const supportResistanceLevels = {
    strongResistance: elliottWaveData?.fibonacciLevels.resistance1618 || 0,
    mediumResistance: elliottWaveData?.fibonacciLevels.resistance1272 || 0,
    mediumSupport: elliottWaveData?.fibonacciLevels.support618 || 0,
    strongSupport: elliottWaveData?.fibonacciLevels.support382 || 0,
  };

  // Calculate risk metrics
  const primarySignal = tradingSignals?.[0];
  const riskRewardRatio = primarySignal 
    ? ((primarySignal.takeProfit - primarySignal.entryPrice) / (primarySignal.entryPrice - primarySignal.stopLoss))
    : 0;

  const getPrimaryRecommendation = () => {
    if (!primarySignal) return null;

    let confidence = Math.round(primarySignal.confidence * 100);
    let riskLevel = "متوسطة";
    
    if (riskRewardRatio > 2) riskLevel = "منخفضة";
    else if (riskRewardRatio < 1.5) riskLevel = "عالية";

    return {
      type: primarySignal.signal,
      confidence,
      riskLevel,
      description: primarySignal.description,
      target: primarySignal.takeProfit,
      risk: riskLevel
    };
  };

  const recommendation = getPrimaryRecommendation();

  return (
    <div className="card-gradient rounded-2xl border border-border shadow-xl">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-reverse space-x-2">
          <i className="fas fa-lightbulb text-accent-color"></i>
          <span>التوصيات الذكية والإشارات</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Recommendation */}
          {recommendation && (
            <div className={`p-6 rounded-xl border-2 ${
              recommendation.type === 'BUY' ? 'signal-buy border-success-color' :
              recommendation.type === 'SELL' ? 'signal-sell border-error-color' :
              'signal-hold border-warning-color'
            }`}>
              <div className="flex items-center space-x-reverse space-x-3 mb-4">
                <i className={`${
                  recommendation.type === 'BUY' ? 'fas fa-arrow-up text-success-color' :
                  recommendation.type === 'SELL' ? 'fas fa-arrow-down text-error-color' :
                  'fas fa-minus text-warning-color'
                } text-2xl`}></i>
                <div>
                  <h3 className={`font-bold ${
                    recommendation.type === 'BUY' ? 'text-success-color' :
                    recommendation.type === 'SELL' ? 'text-error-color' :
                    'text-warning-color'
                  }`} data-testid="text-primary-recommendation">
                    توصية {recommendation.type === 'BUY' ? 'شراء' : recommendation.type === 'SELL' ? 'بيع' : 'انتظار'} قوية
                  </h3>
                  <p className="text-sm opacity-90">
                    مستوى ثقة: {recommendation.confidence}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="opacity-90 mb-4" data-testid="text-recommendation-description">
                  {recommendation.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-white/70">الهدف:</span>
                    <span className={`font-medium block ${
                      recommendation.type === 'BUY' ? 'text-success-color' : 'text-primary'
                    }`} data-testid="text-recommendation-target">
                      {formatPrice(recommendation.target)}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/70">المخاطرة:</span>
                    <span className={`font-medium block ${
                      recommendation.risk === 'منخفضة' ? 'text-success-color' :
                      recommendation.risk === 'عالية' ? 'text-error-color' : 'text-warning-color'
                    }`} data-testid="text-recommendation-risk">
                      {recommendation.risk}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Support/Resistance Analysis */}
          <div className="bg-secondary p-6 rounded-xl border border-border">
            <h3 className="font-bold mb-4 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-layer-group text-info"></i>
              <span>الدعم والمقاومة</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">مقاومة قوية:</span>
                <span className="font-medium text-error-color" data-testid="text-strong-resistance">
                  {formatPrice(supportResistanceLevels.strongResistance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">مقاومة متوسطة:</span>
                <span className="font-medium text-warning-color" data-testid="text-medium-resistance">
                  {formatPrice(supportResistanceLevels.mediumResistance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">دعم متوسط:</span>
                <span className="font-medium text-primary" data-testid="text-medium-support">
                  {formatPrice(supportResistanceLevels.mediumSupport)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">دعم قوي:</span>
                <span className="font-medium text-primary" data-testid="text-strong-support">
                  {formatPrice(supportResistanceLevels.strongSupport)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-secondary p-6 rounded-xl border border-border">
            <h3 className="font-bold mb-4 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-shield-alt text-warning"></i>
              <span>إدارة المخاطر</span>
            </h3>
            <div className="space-y-3 text-sm">
              {primarySignal && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">نسبة المخاطرة:</span>
                    <span className="font-medium text-warning" data-testid="text-risk-ratio">
                      1:{riskRewardRatio.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">حجم المركز المقترح:</span>
                    <span className="font-medium" data-testid="text-position-size">
                      {riskRewardRatio > 2 ? '3-5%' : riskRewardRatio > 1.5 ? '2-3%' : '1-2%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">وقف الخسارة:</span>
                    <span className="font-medium text-error-color" data-testid="text-stop-loss-recommendation">
                      {formatPrice(primarySignal.stopLoss)}
                    </span>
                  </div>
                </>
              )}
              <div className="p-3 bg-warning/10 rounded border border-warning/20 mt-3">
                <span className="text-warning text-xs font-medium">
                  ⚠️ استخدم إدارة مخاطر صارمة
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Analysis Summary */}
        {technicalIndicators && (
          <div className="mt-6 bg-secondary p-6 rounded-xl border border-border">
            <h3 className="font-bold mb-4 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-chart-bar text-info"></i>
              <span>ملخص التحليل التقني</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {/* RSI Analysis */}
              <div>
                <h4 className="font-medium mb-2">مؤشر القوة النسبية</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">القيمة:</span>
                    <span className="font-medium">{technicalIndicators.rsi.toFixed(1)}</span>
                  </div>
                  <div className="text-xs">
                    {technicalIndicators.rsi >= 70 ? (
                      <span className="text-error-color">ذروة شراء - توقع تصحيح</span>
                    ) : technicalIndicators.rsi <= 30 ? (
                      <span className="text-success-color">ذروة بيع - فرصة شراء</span>
                    ) : (
                      <span className="text-info">منطقة طبيعية</span>
                    )}
                  </div>
                </div>
              </div>

              {/* MACD Analysis */}
              <div>
                <h4 className="font-medium mb-2">MACD</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاتجاه:</span>
                    <span className={`font-medium ${
                      technicalIndicators.macd.macd > technicalIndicators.macd.signal ? 'text-success-color' : 'text-error-color'
                    }`}>
                      {technicalIndicators.macd.macd > technicalIndicators.macd.signal ? 'صاعد' : 'هابط'}
                    </span>
                  </div>
                  <div className="text-xs">
                    {technicalIndicators.macd.histogram > 0 ? (
                      <span className="text-success-color">زخم إيجابي</span>
                    ) : (
                      <span className="text-error-color">زخم سلبي</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ADX Analysis */}
              <div>
                <h4 className="font-medium mb-2">قوة الاتجاه</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ADX:</span>
                    <span className="font-medium">{technicalIndicators.adx.toFixed(1)}</span>
                  </div>
                  <div className="text-xs">
                    {technicalIndicators.adx >= 25 ? (
                      <span className="text-success-color">اتجاه قوي</span>
                    ) : technicalIndicators.adx >= 20 ? (
                      <span className="text-warning-color">اتجاه متوسط</span>
                    ) : (
                      <span className="text-muted-foreground">اتجاه ضعيف</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 bg-info/10 border border-info/20 rounded-lg p-4">
          <div className="flex items-start space-x-reverse space-x-2">
            <i className="fas fa-info-circle text-info mt-0.5"></i>
            <div className="text-sm text-info/90">
              <p className="font-medium mb-1">تنويه هام</p>
              <p>
                هذه التوصيات مبنية على التحليل التقني وموجات إليوت باستخدام بيانات حقيقية من Binance. 
                النتائج لأغراض تعليمية وتحليلية فقط. يرجى إجراء بحثك الخاص وإدارة المخاطر بحذر 
                قبل اتخاذ أي قرارات استثمارية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
