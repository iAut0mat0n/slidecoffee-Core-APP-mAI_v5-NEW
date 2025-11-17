/**
 * Auto Top-up Settings Component
 * 
 * Allows account owners to configure automatic credit top-up
 * - Enable/disable auto top-up
 * - Set top-up amount (100-10,000 credits)
 * - Set trigger threshold (when to auto top-up)
 * - Manual top-up button
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Coins, Zap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AutoTopupSettings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.autoTopup.getSettings.useQuery();
  
  const [enabled, setEnabled] = useState(settings?.enabled || false);
  const [amount, setAmount] = useState(settings?.amount?.toString() || "1000");
  const [threshold, setThreshold] = useState(settings?.threshold?.toString() || "100");

  // Update local state when data loads
  useState(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setAmount(settings.amount.toString());
      setThreshold(settings.threshold.toString());
    }
  });

  const updateMutation = trpc.autoTopup.updateSettings.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.autoTopup.getSettings.invalidate();
      utils.subscription.getCredits.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update settings", {
        description: error.message,
      });
    },
  });

  const manualTopupMutation = trpc.autoTopup.manualTopup.useMutation({
    onSuccess: (data) => {
      toast.success(data.message, {
        description: `New balance: ${data.newBalance.toLocaleString()} credits`,
      });
      utils.autoTopup.getSettings.invalidate();
      utils.subscription.getCredits.invalidate();
    },
    onError: (error) => {
      toast.error("Top-up failed", {
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    const amountNum = parseInt(amount);
    const thresholdNum = parseInt(threshold);

    if (isNaN(amountNum) || amountNum < 100 || amountNum > 10000) {
      toast.error("Invalid amount", {
        description: "Amount must be between 100 and 10,000 credits",
      });
      return;
    }

    if (isNaN(thresholdNum) || thresholdNum < 0 || thresholdNum > 1000) {
      toast.error("Invalid threshold", {
        description: "Threshold must be between 0 and 1,000 credits",
      });
      return;
    }

    updateMutation.mutate({
      enabled,
      amount: amountNum,
      threshold: thresholdNum,
    });
  };

  const handleManualTopup = () => {
    const amountNum = parseInt(amount);
    
    if (isNaN(amountNum) || amountNum < 100 || amountNum > 10000) {
      toast.error("Invalid amount", {
        description: "Amount must be between 100 and 10,000 credits",
      });
      return;
    }

    manualTopupMutation.mutate({ amount: amountNum });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto Top-up Settings
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Auto Top-up Settings
        </CardTitle>
        <CardDescription>
          Automatically add credits when running low to avoid interruptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-green-600" />
            <span className="font-medium">Current Balance</span>
          </div>
          <span className="text-2xl font-bold">
            {settings?.currentCredits.toLocaleString()}
          </span>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-topup-toggle" className="text-base font-medium">
              Enable Auto Top-up
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically add credits when balance falls below threshold
            </p>
          </div>
          <Switch
            id="auto-topup-toggle"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {/* Settings (only show when enabled) */}
        {enabled && (
          <>
            {/* Top-up Amount */}
            <div className="space-y-2">
              <Label htmlFor="topup-amount">Top-up Amount</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="topup-amount"
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
              <p className="text-xs text-muted-foreground">
                How many credits to add each time (100-10,000)
              </p>
            </div>

            {/* Trigger Threshold */}
            <div className="space-y-2">
              <Label htmlFor="topup-threshold">Trigger Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="topup-threshold"
                  type="number"
                  min="0"
                  max="1000"
                  step="10"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Auto top-up when balance falls below this amount
              </p>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                When your balance reaches {threshold} credits, we'll automatically add{" "}
                {amount} credits to your account.
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex-1"
          >
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
          
          <Button
            onClick={handleManualTopup}
            disabled={manualTopupMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Coins className="h-4 w-4" />
            {manualTopupMutation.isPending ? "Processing..." : "Top Up Now"}
          </Button>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          💳 Auto top-up uses your default payment method on file
        </p>
      </CardContent>
    </Card>
  );
}

