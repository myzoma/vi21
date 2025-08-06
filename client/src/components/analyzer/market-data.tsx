import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import type { MarketData as MarketDataType } from "@/lib/types";

interface MarketDataProps {
  symbol: string;
  interval: string;
  marketData?: MarketDataType | null;
  isLoading: boolean;
  error: any;
  onSymbolChange: (symbol: string) => void;
  onIntervalChange: (interval: string) => void;
  onAnalyze: () => void;
  onRefresh: () => void;
  isAnalyzing: boolean;
}

export default function MarketData({
  symbol,
  interval,
  marketData,
  isLoading,
  error,
  onSymbolChange,
  onIntervalChange,
  onAnalyze,
  onRefresh,
  isAnalyzing
}: MarketDataProps) {
  const [symbolInput, setSymbolInput] = useState(symbol);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: topSymbols } = useQuery({
    queryKey: ['/api/symbols/top'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    setSymbolInput(symbol);
  }, [symbol]);

  const handleSymbolInputChange = (value: string) => {
    setSymbolInput(value.toUpperCase());
    setShowSuggestions(value.length > 0);
  };

  const handleSymbolSelect = (selectedSymbol: string) => {
    setSymbolInput(selectedSymbol);
    onSymbolChange(selectedSymbol);
    setShowSuggestions(false);
  };

  const handleSymbolSubmit = () => {
    if (symbolInput && symbolInput !== symbol) {
      onSymbolChange(symbolInput);
    }
    setShowSuggestions(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(2)}`;
  };

  return (
    <div className="card-gradient rounded-2xl border border-border shadow-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center space-x-reverse space-x-2">
            <i className="fas fa-chart-candlestick text-primary"></i>
            <span>بيانات السوق المباشرة</span>
          </h2>
          <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
            📊 بيانات حقيقية 100%
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Input
              value={symbolInput}
              onChange={(e) => handleSymbolInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSymbolSubmit()}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="أدخل رمز العملة (مثل: BTCUSDT)"
              className="bg-secondary border-border text-right"
              data-testid="input-symbol"
            />
            
            {/* Symbol Suggestions */}
            {showSuggestions && topSymbols && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto custom-scrollbar">
                {topSymbols
                  .filter((s: string) => s.includes(symbolInput))
                  .slice(0, 8)
                  .map((suggestion: string) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSymbolSelect(suggestion)}
                      className="w-full text-right px-3 py-2 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                      data-testid={`suggestion-${suggestion}`}
                    >
                      <span className="font-medium text-primary">{suggestion}</span>
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          <Select value={interval} onValueChange={onIntervalChange}>
            <SelectTrigger className="bg-secondary border-border" data-testid="select-interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4h">4 ساعات ⭐</SelectItem>
              <SelectItem value="6h">6 ساعات ⭐</SelectItem>
              <SelectItem value="8h">8 ساعات ⭐⭐</SelectItem>
              <SelectItem value="12h">12 ساعة ⭐⭐</SelectItem>
              <SelectItem value="1d">1 يوم ⭐⭐</SelectItem>
              <SelectItem value="1w">1 أسبوع ⭐⭐⭐</SelectItem>
              <SelectItem value="1h">1 ساعة</SelectItem>
              <SelectItem value="2h">2 ساعة</SelectItem>
              <SelectItem value="30m">30 دقيقة</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex space-x-reverse space-x-2">
            <Button 
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="flex-1 primary-gradient hover:opacity-90"
              data-testid="button-analyze"
            >
              {isAnalyzing ? (
                <>
                  <LoadingSpinner size="sm" className="ml-2" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <i className="fas fa-play ml-2"></i>
                  تحليل
                </>
              )}
            </Button>
            <Button 
              onClick={onRefresh}
              variant="outline"
              size="icon"
              className="bg-secondary border-border"
              data-testid="button-refresh"
            >
              <i className="fas fa-sync-alt"></i>
            </Button>
          </div>
        </div>

        {/* Current Price Display */}
        {isLoading ? (
          <div className="bg-secondary p-4 rounded-xl border border-border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 skeleton rounded"></div>
                  <div className="h-6 skeleton rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl mb-6">
            <div className="text-center text-destructive">
              <i className="fas fa-exclamation-triangle text-xl mb-2"></i>
              <p className="font-medium">خطأ في جلب البيانات</p>
              <p className="text-sm opacity-75">تحقق من اتصال الإنترنت ورمز العملة</p>
            </div>
          </div>
        ) : marketData ? (
          <div className="bg-secondary p-4 rounded-xl border border-border mb-6 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-muted-foreground text-sm mb-1">السعر الحالي</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-current-price">
                  {formatPrice(marketData.price)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">التغيير (24س)</p>
                <p className={`text-xl font-semibold ${
                  (marketData.change24h ?? 0) >= 0 ? 'text-success-color' : 'text-error-color'
                }`} data-testid="text-change-24h">
                  {(marketData.change24h ?? 0) >= 0 ? '+' : ''}{(marketData.change24h ?? 0).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">الحجم (24س)</p>
                <p className="text-lg font-medium" data-testid="text-volume-24h">
                  {formatVolume(marketData.volume24h)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">آخر تحديث</p>
                <p className="text-lg font-medium">
                  {new Date(marketData.timestamp).toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Chart Placeholder */}
        <div className="bg-secondary rounded-xl border border-border p-4">
          <div className="h-80 flex items-center justify-center" data-testid="chart-container">
            <div className="text-center text-muted-foreground">
              <i className="fas fa-chart-line text-4xl mb-4"></i>
              <p className="font-medium">الرسم البياني للأسعار</p>
              <p className="text-sm">سيتم عرض الشموع اليابانية هنا</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
