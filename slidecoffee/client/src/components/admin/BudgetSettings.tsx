import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function BudgetSettings() {
  const [workspaceId] = useState(1); // TODO: Get from context
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [editingLimit, setEditingLimit] = useState<any>(null);

  // Fetch budget settings
  const { data: budgetSettings, refetch: refetchBudgets } = trpc.aiMetrics.getBudgetSettings.useQuery({
    workspaceId,
  });

  // Fetch model limits
  const { data: modelLimits, refetch: refetchLimits } = trpc.aiMetrics.getModelLimits.useQuery({
    workspaceId,
  });

  // Fetch budget status
  const { data: budgetStatus } = trpc.aiMetrics.getBudgetStatus.useQuery({
    workspaceId,
  });

  // Mutations
  const upsertBudget = trpc.aiMetrics.upsertBudgetSetting.useMutation({
    onSuccess: () => {
      toast.success("Budget setting saved!");
      refetchBudgets();
      setEditingBudget(null);
    },
    onError: (error) => {
      toast.error(`Failed to save budget: ${error.message}`);
    },
  });

  const deleteBudget = trpc.aiMetrics.deleteBudgetSetting.useMutation({
    onSuccess: () => {
      toast.success("Budget setting deleted!");
      refetchBudgets();
    },
  });

  const upsertLimit = trpc.aiMetrics.upsertModelLimit.useMutation({
    onSuccess: () => {
      toast.success("Model limit saved!");
      refetchLimits();
      setEditingLimit(null);
    },
    onError: (error) => {
      toast.error(`Failed to save limit: ${error.message}`);
    },
  });

  const deleteLimit = trpc.aiMetrics.deleteModelLimit.useMutation({
    onSuccess: () => {
      toast.success("Model limit deleted!");
      refetchLimits();
    },
  });

  const handleSaveBudget = () => {
    if (!editingBudget) return;
    upsertBudget.mutate({
      ...editingBudget,
      workspaceId,
    });
  };

  const handleSaveLimit = () => {
    if (!editingLimit) return;
    upsertLimit.mutate({
      ...editingLimit,
      workspaceId,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Budget & Spending Controls</h2>
        <p className="text-muted-foreground">
          Set budgets and spending limits to control AI costs. Alerts will be sent when thresholds are exceeded.
        </p>
      </div>

      {/* Budget Status Cards */}
      {budgetStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatus.daily && (
            <Card className={budgetStatus.daily.percentUsed >= budgetStatus.daily.alertThreshold * 100 ? "border-orange-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Daily Budget Status
                  {budgetStatus.daily.percentUsed >= budgetStatus.daily.alertThreshold * 100 && (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Budget:</span>
                    <span className="font-medium">${budgetStatus.daily.budgetAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Spend:</span>
                    <span className="font-medium">${budgetStatus.daily.currentSpend.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Used:</span>
                    <span className={`font-bold ${budgetStatus.daily.percentUsed >= budgetStatus.daily.alertThreshold * 100 ? "text-orange-500" : "text-green-500"}`}>
                      {budgetStatus.daily.percentUsed.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${budgetStatus.daily.percentUsed >= budgetStatus.daily.alertThreshold * 100 ? "bg-orange-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(budgetStatus.daily.percentUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {budgetStatus.monthly && (
            <Card className={budgetStatus.monthly.percentUsed >= budgetStatus.monthly.alertThreshold * 100 ? "border-orange-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Monthly Budget Status
                  {budgetStatus.monthly.percentUsed >= budgetStatus.monthly.alertThreshold * 100 && (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Budget:</span>
                    <span className="font-medium">${budgetStatus.monthly.budgetAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Spend:</span>
                    <span className="font-medium">${budgetStatus.monthly.currentSpend.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Used:</span>
                    <span className={`font-bold ${budgetStatus.monthly.percentUsed >= budgetStatus.monthly.alertThreshold * 100 ? "text-orange-500" : "text-green-500"}`}>
                      {budgetStatus.monthly.percentUsed.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${budgetStatus.monthly.percentUsed >= budgetStatus.monthly.alertThreshold * 100 ? "bg-orange-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(budgetStatus.monthly.percentUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Budget Settings</CardTitle>
              <CardDescription>Configure daily and monthly AI spending budgets</CardDescription>
            </div>
            <Button
              onClick={() =>
                setEditingBudget({
                  budgetType: "monthly",
                  budgetAmount: 100,
                  alertThreshold: 0.8,
                  enabled: true,
                })
              }
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgetSettings && budgetSettings.length > 0 ? (
            <div className="space-y-4">
              {budgetSettings.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium capitalize">{budget.budgetType} Budget</div>
                    <div className="text-sm text-muted-foreground">
                      ${budget.budgetAmount.toFixed(2)} • Alert at {(budget.alertThreshold * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={budget.enabled} disabled />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBudget(budget)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBudget.mutate({ id: budget.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No budgets configured. Click "Add Budget" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Spending Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Model Spending Limits</CardTitle>
              <CardDescription>Set per-model spending caps to control costs</CardDescription>
            </div>
            <Button
              onClick={() =>
                setEditingLimit({
                  model: "gemini-2.5-flash",
                  dailyLimit: 10,
                  monthlyLimit: 100,
                  enabled: true,
                })
              }
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Limit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {modelLimits && modelLimits.length > 0 ? (
            <div className="space-y-4">
              {modelLimits.map((limit) => (
                <div key={limit.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{limit.model}</div>
                    <div className="text-sm text-muted-foreground">
                      Daily: ${limit.dailyLimit?.toFixed(2) || "No limit"} • Monthly: ${limit.monthlyLimit?.toFixed(2) || "No limit"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={limit.enabled} disabled />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLimit(limit)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLimit.mutate({ id: limit.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No model limits configured. Click "Add Limit" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Budget Dialog */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingBudget.id ? "Edit" : "Add"} Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Budget Type</Label>
                <Select
                  value={editingBudget.budgetType}
                  onValueChange={(value) =>
                    setEditingBudget({ ...editingBudget, budgetType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Budget Amount ($)</Label>
                <Input
                  type="number"
                  value={editingBudget.budgetAmount}
                  onChange={(e) =>
                    setEditingBudget({ ...editingBudget, budgetAmount: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label>Alert Threshold (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={(editingBudget.alertThreshold * 100).toFixed(0)}
                  onChange={(e) =>
                    setEditingBudget({ ...editingBudget, alertThreshold: parseFloat(e.target.value) / 100 })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingBudget.enabled}
                  onCheckedChange={(checked) =>
                    setEditingBudget({ ...editingBudget, enabled: checked })
                  }
                />
                <Label>Enabled</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingBudget(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveBudget}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Model Limit Dialog */}
      {editingLimit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingLimit.id ? "Edit" : "Add"} Model Limit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>AI Model</Label>
                <Select
                  value={editingLimit.model}
                  onValueChange={(value) =>
                    setEditingLimit({ ...editingLimit, model: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Daily Limit ($)</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={editingLimit.dailyLimit || ""}
                  onChange={(e) =>
                    setEditingLimit({ ...editingLimit, dailyLimit: e.target.value ? parseFloat(e.target.value) : null })
                  }
                />
              </div>

              <div>
                <Label>Monthly Limit ($)</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={editingLimit.monthlyLimit || ""}
                  onChange={(e) =>
                    setEditingLimit({ ...editingLimit, monthlyLimit: e.target.value ? parseFloat(e.target.value) : null })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingLimit.enabled}
                  onCheckedChange={(checked) =>
                    setEditingLimit({ ...editingLimit, enabled: checked })
                  }
                />
                <Label>Enabled</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingLimit(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveLimit}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

