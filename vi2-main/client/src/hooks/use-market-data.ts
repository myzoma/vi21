import { useQuery } from "@tanstack/react-query";
import type { MarketData } from "@/lib/types";

export function useMarketData(symbol: string) {
  return useQuery<MarketData>({
    queryKey: ['/api/market', symbol],
    enabled: !!symbol,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}

export function useTopSymbols() {
  return useQuery<string[]>({
    queryKey: ['/api/symbols/top'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useKlineData(symbol: string, interval: string, limit: number = 100) {
  return useQuery<number[][]>({
    queryKey: ['/api/klines', symbol, interval],
    enabled: !!symbol && !!interval,
    staleTime: 60 * 1000, // 1 minute
  });
}
