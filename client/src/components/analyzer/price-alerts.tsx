import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PriceAlert } from "@/lib/types";

export default function PriceAlerts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: "",
    condition: "above" as "above" | "below",
    targetPrice: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery<PriceAlert[]>({
    queryKey: ['/api/alerts'],
  });

  const addMutation = useMutation({
    mutationFn: async (alertData: { symbol: string; condition: string; targetPrice: number }) => {
      const response = await apiRequest('POST', '/api/alerts', alertData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      setNewAlert({ symbol: "", condition: "above", targetPrice: "" });
      setIsAddDialogOpen(false);
      toast({
        title: "تم إنشاء التنبيه",
        description: "سيتم إشعارك عند الوصول للسعر المحدد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء التنبيه",
        description: error.message || "فشل في إنشاء التنبيه",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/alerts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "تم حذف التنبيه",
        description: "تم حذف التنبيه بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "فشل في حذف التنبيه",
        variant: "destructive",
      });
    },
  });

  const handleAddAlert = () => {
    if (newAlert.symbol.trim() && newAlert.targetPrice) {
      addMutation.mutate({
        symbol: newAlert.symbol.toUpperCase(),
        condition: newAlert.condition,
        targetPrice: parseFloat(newAlert.targetPrice)
      });
    }
  };

  const handleDeleteAlert = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="card-gradient rounded-2xl border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-reverse space-x-3">
            <i className="fas fa-bell text-warning text-xl"></i>
            <h3 className="text-lg font-semibold">تنبيهات الأسعار</h3>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-warning hover:bg-yellow-600 text-surface-900"
                data-testid="button-add-alert"
              >
                <i className="fas fa-plus text-sm"></i>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة تنبيه سعر</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alert-symbol">العملة</Label>
                  <Input
                    id="alert-symbol"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
                    placeholder="مثل: BTCUSDT"
                    className="text-right"
                    data-testid="input-alert-symbol"
                  />
                </div>
                
                <div>
                  <Label htmlFor="alert-condition">النوع</Label>
                  <Select value={newAlert.condition} onValueChange={(value: "above" | "below") => setNewAlert({ ...newAlert, condition: value })}>
                    <SelectTrigger id="alert-condition" data-testid="select-alert-condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">أعلى من</SelectItem>
                      <SelectItem value="below">أقل من</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="alert-price">السعر المستهدف</Label>
                  <Input
                    id="alert-price"
                    type="number"
                    step="0.0001"
                    value={newAlert.targetPrice}
                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                    placeholder="0.0000"
                    className="text-right"
                    data-testid="input-alert-price"
                  />
                </div>
                
                <div className="flex justify-end space-x-reverse space-x-2">
                  <Button
                    onClick={() => setIsAddDialogOpen(false)}
                    variant="outline"
                    data-testid="button-cancel-alert"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleAddAlert}
                    disabled={!newAlert.symbol.trim() || !newAlert.targetPrice || addMutation.isPending}
                    className="bg-warning hover:bg-yellow-600 text-surface-900"
                    data-testid="button-confirm-add-alert"
                  >
                    {addMutation.isPending ? "جاري الإضافة..." : "إضافة تنبيه"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-secondary p-3 rounded-lg border-r-4 border-warning">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-4 w-16 skeleton rounded mb-2"></div>
                    <div className="h-3 w-32 skeleton rounded"></div>
                  </div>
                  <div className="w-6 h-6 skeleton rounded"></div>
                </div>
              </div>
            ))
          ) : !alerts || alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-bell text-2xl mb-4 opacity-50"></i>
              <p>لا توجد تنبيهات</p>
              <p className="text-sm">أضف تنبيهات لمراقبة الأسعار</p>
            </div>
          ) : (
            alerts.filter(alert => alert.isActive).map((alert) => (
              <div key={alert.id} className="bg-secondary p-3 rounded-lg border-r-4 border-warning">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-medium text-warning" data-testid={`text-alert-symbol-${alert.id}`}>
                      {alert.symbol}
                    </span>
                    <p className="text-sm text-muted-foreground" data-testid={`text-alert-condition-${alert.id}`}>
                      {alert.condition === 'above' ? 'أعلى من' : 'أقل من'} ${alert.targetPrice.toFixed(alert.targetPrice > 1 ? 2 : 6)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteAlert(alert.id)}
                    variant="ghost"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    data-testid={`button-delete-alert-${alert.id}`}
                  >
                    <i className="fas fa-times text-sm"></i>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
