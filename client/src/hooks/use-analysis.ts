import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AnalysisResponse } from "@/lib/types";

interface AnalysisParams {
  symbol: string;
  interval: string;
}

export function useAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<AnalysisResponse, Error, AnalysisParams>({
    mutationFn: async ({ symbol, interval }) => {
      const response = await apiRequest('POST', `/api/analyze/${symbol}/${interval}`);
      return response.json();
    },
    onSuccess: (data) => {
      // Cache the analysis result
      queryClient.setQueryData(['/api/analysis', data.symbol, data.interval], data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/analyses/recent'] });
    },
  });
}

export function useStoredAnalysis(symbol: string, interval: string) {
  return useQuery<AnalysisResponse>({
    queryKey: ['/api/analysis', symbol, interval],
    enabled: !!symbol && !!interval,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
