import type { ElliottWave } from "@/lib/types";

interface ElliottWaveAnalysisProps {
  data?: ElliottWave;
  symbol: string;
}

export default function ElliottWaveAnalysis({ data, symbol }: ElliottWaveAnalysisProps) {
  if (!data) {
    return (
      <div className="card-gradient rounded-2xl border border-border shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center space-x-reverse space-x-2">
            <i className="fas fa-wave-square text-primary"></i>
            <span>تحليل موجات إليوت المتقدم</span>
          </h2>
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-water text-2xl mb-4"></i>
            <p>لا توجد بيانات موجات متاحة</p>
          </div>
        </div>
      </div>
    );
  }

  const getWaveStatus = (waveNum: number, currentWave: number) => {
    if (waveNum < currentWave) return 'completed';
    if (waveNum === currentWave) return 'current';
    return 'pending';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  return (
    <div className="card-gradient rounded-2xl border border-border shadow-xl">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-reverse space-x-2">
          <i className="fas fa-wave-square text-primary"></i>
          <span>تحليل موجات إليوت المتقدم</span>
        </h2>

        <div className="space-y-6">
          {/* Current Pattern Summary */}
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-primary mb-3">النمط الحالي</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">النمط:</span>
                <span className="font-medium" data-testid="text-wave-pattern">
                  {data.wavePattern}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الموجة الحالية:</span>
                <span className="font-medium text-primary" data-testid="text-current-wave">
                  الموجة {data.currentWave}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">مستوى الثقة:</span>
                <span className="font-medium" data-testid="text-confidence">
                  {Math.round(data.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Wave Structure */}
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3">هيكل الموجات</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((waveNum) => {
                const status = getWaveStatus(waveNum, data.currentWave);
                const waveData = data.waveStructure?.find(w => w.wave === waveNum);
                
                return (
                  <div key={waveNum} className="flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <div className={`wave-indicator ${
                        status === 'completed' ? 'wave-completed' :
                        status === 'current' ? 'wave-current' : 'wave-pending'
                      }`}></div>
                      <span>الموجة {waveNum}</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      status === 'completed' ? 'text-primary' :
                      status === 'current' ? 'text-accent-color' : 'text-muted-foreground'
                    }`} data-testid={`text-wave-${waveNum}-status`}>
                      {status === 'completed' ? 'مكتملة' :
                       status === 'current' ? 'جارية' : 'متوقعة'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fibonacci Levels */}
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3">مستويات فيبوناتشي</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">مقاومة 161.8%:</span>
                <span className="font-medium text-error-color" data-testid="text-fib-resistance-1618">
                  {formatPrice(data.fibonacciLevels.resistance1618)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">مقاومة 127.2%:</span>
                <span className="font-medium text-warning-color" data-testid="text-fib-resistance-1272">
                  {formatPrice(data.fibonacciLevels.resistance1272)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">دعم 61.8%:</span>
                <span className="font-medium text-primary" data-testid="text-fib-support-618">
                  {formatPrice(data.fibonacciLevels.support618)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">دعم 38.2%:</span>
                <span className="font-medium text-primary" data-testid="text-fib-support-382">
                  {formatPrice(data.fibonacciLevels.support382)}
                </span>
              </div>
            </div>
          </div>

          {/* Price Targets */}
          {data.targets && data.targets.length > 0 && (
            <div className="bg-secondary p-4 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">الأهداف السعرية</h3>
              <div className="space-y-2 text-sm">
                {data.targets.map((target, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">الهدف {index + 1}:</span>
                    <span className="font-medium text-success-color" data-testid={`text-target-${index + 1}`}>
                      {formatPrice(target)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Quality Indicator */}
          <div className="bg-info/10 p-4 rounded-lg border border-info/20">
            <div className="flex items-center space-x-reverse space-x-2 mb-2">
              <i className="fas fa-info-circle text-info"></i>
              <span className="font-medium text-info">جودة التحليل</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-success-color transition-all duration-500"
                style={{ width: `${data.confidence * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {data.confidence >= 0.7 ? 'تحليل عالي الجودة' :
               data.confidence >= 0.5 ? 'تحليل متوسط الجودة' : 'تحليل أولي'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
