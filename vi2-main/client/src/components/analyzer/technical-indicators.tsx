import type { TechnicalIndicator } from "@/lib/types";

interface TechnicalIndicatorsProps {
  data?: TechnicalIndicator;
  symbol: string;
}

export default function TechnicalIndicators({ data, symbol }: TechnicalIndicatorsProps) {
  if (!data) {
    return (
      <div className="card-gradient rounded-2xl border border-border shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center space-x-reverse space-x-2">
            <i className="fas fa-tachometer-alt text-info"></i>
            <span>المؤشرات التقنية المتقدمة</span>
          </h2>
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-chart-area text-2xl mb-4"></i>
            <p>لا توجد بيانات مؤشرات متاحة</p>
          </div>
        </div>
      </div>
    );
  }

  const getRSIStatus = (rsi: number) => {
    if (rsi >= 70) return { status: 'ذروة شراء', color: 'text-error-color' };
    if (rsi <= 30) return { status: 'ذروة بيع', color: 'text-success-color' };
    return { status: 'طبيعي', color: 'text-info' };
  };

  const getMACDStatus = (macd: any) => {
    if (macd.macd > macd.signal) return { status: 'صاعد', color: 'text-success-color' };
    return { status: 'هابط', color: 'text-error-color' };
  };

  const rsiInfo = getRSIStatus(data.rsi);
  const macdInfo = getMACDStatus(data.macd);

  return (
    <div className="card-gradient rounded-2xl border border-border shadow-xl">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-reverse space-x-2">
          <i className="fas fa-tachometer-alt text-info"></i>
          <span>المؤشرات التقنية المتقدمة</span>
        </h2>

        <div className="space-y-6">
          {/* RSI Section */}
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-signal text-sm"></i>
              <span>مؤشر القوة النسبية (RSI)</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">القيمة الحالية:</span>
                <span className="font-bold text-lg" data-testid="text-rsi-value">
                  {data.rsi.toFixed(1)}
                </span>
              </div>
              
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rsi-bar transition-all duration-500"
                  style={{ width: `${data.rsi}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>30</span>
                <span>70</span>
                <span>100</span>
              </div>
              
              <div className="text-center">
                <span className={`font-medium ${rsiInfo.color}`} data-testid="text-rsi-status">
                  {rsiInfo.status}
                </span>
              </div>
            </div>
          </div>

          {/* MACD Section */}
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-chart-line text-sm"></i>
              <span>MACD</span>
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">MACD:</span>
                <span className={`font-medium ${data.macd.macd >= 0 ? 'text-success-color' : 'text-error-color'}`}>
                  {data.macd.macd.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">إشارة:</span>
                <span className="font-medium">{data.macd.signal.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الهيستوجرام:</span>
                <span className={`font-medium ${data.macd.histogram >= 0 ? 'text-success-color' : 'text-error-color'}`}>
                  {data.macd.histogram.toFixed(4)}
                </span>
              </div>
              <div className="mt-3 p-2 rounded border" style={{ 
                backgroundColor: macdInfo.color === 'text-success-color' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                borderColor: macdInfo.color === 'text-success-color' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'
              }}>
                <span className={`text-xs font-medium ${macdInfo.color}`} data-testid="text-macd-status">
                  اتجاه {macdInfo.status}
                </span>
              </div>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-layer-group text-sm"></i>
              <span>نطاقات بولينجر</span>
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">النطاق العلوي:</span>
                <span className="font-medium text-error-color">
                  ${data.bollingerBands.upper.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المتوسط:</span>
                <span className="font-medium">
                  ${data.bollingerBands.middle.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">النطاق السفلي:</span>
                <span className="font-medium text-success-color">
                  ${data.bollingerBands.lower.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Moving Averages */}
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-chart-area text-sm"></i>
              <span>المتوسطات المتحركة</span>
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">MA(20):</span>
                <span className="font-medium">${data.movingAverages.ma20.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MA(50):</span>
                <span className="font-medium">${data.movingAverages.ma50.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MA(200):</span>
                <span className="font-medium">${data.movingAverages.ma200.toFixed(2)}</span>
              </div>
              
              {data.movingAverages.ma50 > data.movingAverages.ma200 && (
                <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/20">
                  <span className="text-primary text-xs font-medium">
                    ✓ Golden Cross محقق
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ADX */}
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3 flex items-center space-x-reverse space-x-2">
              <i className="fas fa-trending-up text-sm"></i>
              <span>مؤشر الاتجاه (ADX)</span>
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">القوة:</span>
                <span className="font-bold text-lg" data-testid="text-adx-value">
                  {data.adx.toFixed(1)}
                </span>
              </div>
              
              <div className="text-center">
                <span className={`text-sm font-medium ${
                  data.adx >= 25 ? 'text-success-color' : 
                  data.adx >= 20 ? 'text-warning-color' : 'text-muted-foreground'
                }`}>
                  {data.adx >= 25 ? 'اتجاه قوي' : 
                   data.adx >= 20 ? 'اتجاه متوسط' : 'اتجاه ضعيف'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
