import { useState, useEffect } from "react";
import Header from "@/components/analyzer/header";
import MarketData from "@/components/analyzer/market-data";
import TechnicalIndicators from "@/components/analyzer/technical-indicators";
import ElliottWaveAnalysis from "@/components/analyzer/elliott-wave-analysis";
import TradingSignals from "@/components/analyzer/trading-signals";
import Watchlist from "@/components/analyzer/watchlist";
import PriceAlerts from "@/components/analyzer/price-alerts";
import Recommendations from "@/components/analyzer/recommendations";
import { useMarketData } from "@/hooks/use-market-data";
import { useAnalysis } from "@/hooks/use-analysis";

export default function Analyzer() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState("4h");

  const { data: marketData, isLoading: isLoadingMarket, error: marketError, refetch: refetchMarket } = useMarketData(selectedSymbol);
  
  const { 
    data: analysisData, 
    isLoading: isAnalyzing, 
    error: analysisError, 
    mutate: runAnalysis 
  } = useAnalysis();

  const handleAnalyze = () => {
    runAnalysis({ symbol: selectedSymbol, interval: selectedInterval });
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleIntervalChange = (interval: string) => {
    setSelectedInterval(interval);
  };

  useEffect(() => {
    // Auto-refresh market data every 30 seconds
    const interval = setInterval(() => {
      refetchMarket();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchMarket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Watchlist />
          <PriceAlerts />
          
          {/* Market Overview Card */}
          <div className="card-gradient rounded-2xl border border-border shadow-xl p-6">
            <div className="flex items-center space-x-reverse space-x-3 mb-4">
              <i className="fas fa-chart-pie text-info text-xl"></i>
              <h3 className="text-lg font-semibold">نظرة عامة على السوق</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المجموع الإجمالي للسوق</span>
                <span className="font-bold text-primary">$1.67T</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">هيمنة البيتكوين</span>
                <span className="font-bold">52.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">مؤشر الخوف والطمع</span>
                <span className="font-bold text-warning">62 - طمع</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analysis Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Data & Controls */}
          <div className="lg:col-span-2">
            <MarketData
              symbol={selectedSymbol}
              interval={selectedInterval}
              marketData={marketData}
              isLoading={isLoadingMarket}
              error={marketError}
              onSymbolChange={handleSymbolChange}
              onIntervalChange={handleIntervalChange}
              onAnalyze={handleAnalyze}
              onRefresh={refetchMarket}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Analysis Results Panel */}
          <div className="card-gradient rounded-2xl border border-border shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-reverse space-x-2">
                <i className="fas fa-brain text-secondary"></i>
                <span>نتائج التحليل</span>
              </h2>

              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">جاري تحليل الموجات...</p>
                  </div>
                </div>
              ) : analysisError ? (
                <div className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-destructive text-2xl mb-4"></i>
                  <p className="text-destructive mb-2">فشل في التحليل</p>
                  <p className="text-sm text-muted-foreground">يرجى المحاولة مرة أخرى</p>
                </div>
              ) : analysisData ? (
                <div className="space-y-4">
                  {/* Quick Analysis Summary */}
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary mb-2">ملخص التحليل</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الموجة الحالية:</span>
                        <span className="font-medium">الموجة {analysisData.elliottWaveData?.currentWave}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مستوى الثقة:</span>
                        <span className="font-medium">{Math.round((analysisData.confidence || 0) * 100)}%</span>
                      </div>
                      {analysisData.tradingSignals && analysisData.tradingSignals.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الإشارة:</span>
                          <span className={`font-medium ${
                            analysisData.tradingSignals[0].signal === 'BUY' ? 'text-success-color' :
                            analysisData.tradingSignals[0].signal === 'SELL' ? 'text-error-color' :
                            'text-warning-color'
                          }`}>
                            {analysisData.tradingSignals[0].signal === 'BUY' ? 'شراء' :
                             analysisData.tradingSignals[0].signal === 'SELL' ? 'بيع' : 'انتظار'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-muted-foreground text-2xl mb-4"></i>
                  <p className="text-muted-foreground">اختر رمز العملة واضغط تحليل</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Analysis Results */}
        {analysisData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ElliottWaveAnalysis 
                data={analysisData.elliottWaveData}
                symbol={selectedSymbol}
              />
              <TechnicalIndicators 
                data={analysisData.technicalIndicators}
                symbol={selectedSymbol}
              />
            </div>

            <TradingSignals 
              signals={analysisData.tradingSignals}
              symbol={selectedSymbol}
            />

            <Recommendations 
              analysisData={analysisData}
              symbol={selectedSymbol}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="gradient-bg border-t border-border mt-12">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-2 mb-4 md:mb-0">
              <i className="fas fa-info-circle text-primary"></i>
              <p className="text-muted-foreground">
                محلل موجات إليوت المتقدم - تحليل فني دقيق للأسواق المالية
              </p>
            </div>
            <div className="flex items-center space-x-reverse space-x-3 text-sm text-muted-foreground">
              <i className="fas fa-clock"></i>
              <span>آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
