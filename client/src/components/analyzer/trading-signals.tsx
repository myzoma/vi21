import type { TradingSignal } from "@/lib/types";

interface TradingSignalsProps {
  signals?: TradingSignal[];
  symbol: string;
}

export default function TradingSignals({ signals, symbol }: TradingSignalsProps) {
  if (!signals || signals.length === 0) {
    return (
      <div className="card-gradient rounded-2xl border border-border shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center space-x-reverse space-x-2">
            <i className="fas fa-signal text-accent-color"></i>
            <span>إشارات التداول الذكية</span>
          </h2>
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-chart-line text-2xl mb-4"></i>
            <p>لا توجد إشارات تداول متاحة</p>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'fas fa-arrow-up';
      case 'SELL': return 'fas fa-arrow-down';
      default: return 'fas fa-minus';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-success-color';
      case 'SELL': return 'text-error-color';
      default: return 'text-warning-color';
    }
  };

  const getSignalBgClass = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'signal-buy';
      case 'SELL': return 'signal-sell';
      default: return 'signal-hold';
    }
  };

  const getSignalText = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'شراء';
      case 'SELL': return 'بيع';
      default: return 'انتظار';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'STRONG': return 'قوية';
      case 'MEDIUM': return 'متوسطة';
      default: return 'ضعيفة';
    }
  };

  const primarySignal = signals[0];

  return (
    <div className="card-gradient rounded-2xl border border-border shadow-xl">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-reverse space-x-2">
          <i className="fas fa-signal text-accent-color"></i>
          <span>إشارات التداول الذكية</span>
        </h2>

        {/* Primary Signal Overview */}
        <div className={`p-6 rounded-xl border-2 mb-6 ${getSignalBgClass(primarySignal.signal)}`}>
          <div className="flex items-center space-x-reverse space-x-4 mb-4">
            <div className="p-3 rounded-full bg-white/10">
              <i className={`${getSignalIcon(primarySignal.signal)} ${getSignalColor(primarySignal.signal)} text-2xl`}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1" data-testid="text-primary-signal">
                إشارة {getSignalText(primarySignal.signal)} {getStrengthText(primarySignal.strength)}
              </h3>
              <p className="text-sm opacity-90">
                مستوى الثقة: {Math.round(primarySignal.confidence * 100)}%
              </p>
            </div>
          </div>
          
          <p className="text-sm opacity-90 mb-4" data-testid="text-signal-description">
            {primarySignal.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-white/70">نقطة الدخول:</span>
              <p className="font-bold text-lg" data-testid="text-entry-price">
                {formatPrice(primarySignal.entryPrice)}
              </p>
            </div>
            <div>
              <span className="text-white/70">وقف الخسارة:</span>
              <p className="font-bold text-lg text-error-color" data-testid="text-stop-loss">
                {formatPrice(primarySignal.stopLoss)}
              </p>
            </div>
            <div>
              <span className="text-white/70">جني الأرباح:</span>
              <p className="font-bold text-lg text-success-color" data-testid="text-take-profit">
                {formatPrice(primarySignal.takeProfit)}
              </p>
            </div>
          </div>
        </div>

        {/* Supporting Factors */}
        {primarySignal.supportingFactors && primarySignal.supportingFactors.length > 0 && (
          <div className="bg-secondary p-4 rounded-lg border border-border mb-6">
            <h3 className="font-semibold mb-3 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-check-circle text-success-color"></i>
              <span>العوامل المؤيدة</span>
            </h3>
            <ul className="space-y-2">
              {primarySignal.supportingFactors.map((factor, index) => (
                <li key={index} className="text-sm flex items-start space-x-reverse space-x-2">
                  <i className="fas fa-arrow-left text-primary text-xs mt-1 mr-2"></i>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Management */}
        <div className="bg-warning/10 p-4 rounded-lg border border-warning/20 mb-6">
          <h3 className="font-semibold mb-3 flex items-center space-x-reverse space-x-2">
            <i className="fas fa-shield-alt text-warning"></i>
            <span>إدارة المخاطر</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">نسبة المخاطرة/العائد:</span>
                <span className="font-medium">
                  1:{((primarySignal.takeProfit - primarySignal.entryPrice) / (primarySignal.entryPrice - primarySignal.stopLoss)).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المخاطرة المحتملة:</span>
                <span className="font-medium text-error-color">
                  {(((primarySignal.entryPrice - primarySignal.stopLoss) / primarySignal.entryPrice) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">العائد المحتمل:</span>
                <span className="font-medium text-success-color">
                  {(((primarySignal.takeProfit - primarySignal.entryPrice) / primarySignal.entryPrice) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">حجم المركز المقترح:</span>
                <span className="font-medium">2-3% من المحفظة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Signals */}
        {signals.length > 1 && (
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3">إشارات إضافية</h3>
            <div className="space-y-3">
              {signals.slice(1).map((signal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <i className={`${getSignalIcon(signal.signal)} ${getSignalColor(signal.signal)}`}></i>
                    <div>
                      <span className="font-medium">
                        {getSignalText(signal.signal)} {getStrengthText(signal.strength)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        ثقة: {Math.round(signal.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(signal.entryPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-reverse space-x-2">
            <i className="fas fa-info-circle text-info mt-0.5"></i>
            <div className="text-sm text-info/90">
              <p className="font-medium mb-1">تنويه هام</p>
              <p>
                هذه الإشارات مبنية على التحليل التقني وموجات إليوت وهي لأغراض تعليمية فقط. 
                يرجى إجراء بحثك الخاص وإدارة المخاطر بحذر قبل اتخاذ أي قرارات استثمارية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
