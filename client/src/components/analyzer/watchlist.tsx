import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMarketData } from "@/hooks/use-market-data";
import type { WatchlistItem } from "@/lib/types";

export default function Watchlist() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ['/api/watchlist'],
  });

  const addMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await apiRequest('POST', '/api/watchlist', { symbol: symbol.toUpperCase() });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      setNewSymbol("");
      setIsAddDialogOpen(false);
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة العملة إلى قائمة المراقبة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإضافة",
        description: error.message || "فشل في إضافة العملة",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/watchlist/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف العملة من قائمة المراقبة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "فشل في حذف العملة",
        variant: "destructive",
      });
    },
  });

  const handleAddSymbol = () => {
    if (newSymbol.trim()) {
      addMutation.mutate(newSymbol.trim());
    }
  };

  const handleRemoveSymbol = (id: string) => {
    removeMutation.mutate(id);
  };

  return (
    <div className="card-gradient rounded-2xl border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-reverse space-x-3">
            <i className="fas fa-star text-accent-color text-xl"></i>
            <h3 className="text-lg font-semibold">قائمة المراقبة</h3>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="primary-gradient hover:opacity-90"
                data-testid="button-add-to-watchlist"
              >
                <i className="fas fa-plus text-sm"></i>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة عملة للمراقبة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="مثل: BTCUSDT"
                  className="text-right"
                  data-testid="input-watchlist-symbol"
                />
                <div className="flex justify-end space-x-reverse space-x-2">
                  <Button
                    onClick={() => setIsAddDialogOpen(false)}
                    variant="outline"
                    data-testid="button-cancel-watchlist"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleAddSymbol}
                    disabled={!newSymbol.trim() || addMutation.isPending}
                    className="primary-gradient"
                    data-testid="button-confirm-add-watchlist"
                  >
                    {addMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-secondary p-3 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-4 w-20 skeleton rounded mb-1"></div>
                    <div className="h-3 w-16 skeleton rounded"></div>
                  </div>
                  <div className="text-left">
                    <div className="h-5 w-24 skeleton rounded mb-1"></div>
                    <div className="h-4 w-16 skeleton rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : !watchlist || watchlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-star text-2xl mb-4 opacity-50"></i>
              <p>قائمة المراقبة فارغة</p>
              <p className="text-sm">أضف عملات لتتبع أسعارها</p>
            </div>
          ) : (
            watchlist.map((item) => (
              <WatchlistItemCard
                key={item.id}
                item={item}
                onRemove={() => handleRemoveSymbol(item.id)}
                isRemoving={removeMutation.isPending}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface WatchlistItemCardProps {
  item: WatchlistItem;
  onRemove: () => void;
  isRemoving: boolean;
}

function WatchlistItemCard({ item, onRemove, isRemoving }: WatchlistItemCardProps) {
  const { data: marketData, isLoading } = useMarketData(item.symbol);

  return (
    <div className="bg-secondary p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer group">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium text-primary" data-testid={`text-watchlist-symbol-${item.symbol}`}>
            {item.symbol}
          </span>
          <p className="text-sm text-muted-foreground">
            {item.symbol.replace('USDT', '').replace('BTC', '').replace('ETH', '')}
          </p>
        </div>
        
        <div className="flex items-center space-x-reverse space-x-2">
          <div className="text-left">
            {isLoading ? (
              <>
                <div className="h-5 w-20 skeleton rounded mb-1"></div>
                <div className="h-4 w-12 skeleton rounded"></div>
              </>
            ) : marketData ? (
              <>
                <div className="font-bold" data-testid={`text-watchlist-price-${item.symbol}`}>
                  ${marketData.price.toFixed(marketData.price > 1 ? 2 : 6)}
                </div>
                <div className={`text-sm ${
                  marketData.change24h >= 0 ? 'text-success-color' : 'text-error-color'
                }`} data-testid={`text-watchlist-change-${item.symbol}`}>
                  {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">خطأ في البيانات</div>
            )}
          </div>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            variant="ghost"
            size="sm"
            disabled={isRemoving}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            data-testid={`button-remove-watchlist-${item.symbol}`}
          >
            <i className="fas fa-times text-sm"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
