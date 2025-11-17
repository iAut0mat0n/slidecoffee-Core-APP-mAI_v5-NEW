import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Cpu,
  Database,
  Wifi,
  HardDrive,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  DollarSign,
  Zap,
} from "lucide-react";
import { AICostDashboard } from "./AICostDashboard";
import { BudgetSettings } from "./admin/BudgetSettings";

export function SystemSettings() {
  const [testingAI, setTestingAI] = useState(false);

  // Get current AI model
  const { data: aiModelData, refetch: refetchAIModel } = trpc.systemSettings.getAIModel.useQuery();
  
  // Get system health
  const { data: systemHealth } = trpc.systemSettings.getSystemHealth.useQuery();

  // Set AI model mutation
  const setAIModel = trpc.systemSettings.setAIModel.useMutation({
    onSuccess: (data) => {
      toast.success("AI Model Updated", {
        description: `Successfully switched to ${data.model}`,
      });
      refetchAIModel();
    },
    onError: (error) => {
      toast.error("Failed to update AI model", {
        description: error.message,
      });
    },
  });

  // Test AI connection mutation
  const testAIConnection = trpc.systemSettings.testAIConnection.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("AI Connection Test Passed", {
          description: `Model: ${data.model} | Response: "${data.response}" | Tokens: ${data.tokensUsed}`,
        });
      } else {
        toast.error("AI Connection Test Failed", {
          description: data.error,
        });
      }
      setTestingAI(false);
    },
    onError: (error) => {
      toast.error("Test failed", {
        description: error.message,
      });
      setTestingAI(false);
    },
  });

  const handleModelChange = (model: string) => {
    setAIModel.mutate({ 
      model: model as "gemini-2.5-flash" | "claude-3-5-sonnet-20241022" | "claude-3-opus-20240229" | "gpt-4-turbo" | "gpt-4o"
    });
  };

  const handleTestConnection = () => {
    setTestingAI(true);
    testAIConnection.mutate({});
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "unavailable":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSpeedBadge = (speed: string) => {
    const colors = {
      Fast: "bg-green-500/10 text-green-500",
      Medium: "bg-yellow-500/10 text-yellow-500",
      Slow: "bg-red-500/10 text-red-500",
    };
    return colors[speed as keyof typeof colors] || colors.Medium;
  };

  return (
    <div className="space-y-6">
      {/* AI Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Model Configuration
          </CardTitle>
          <CardDescription>
            Select the AI model used for slide generation and content creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Model Info */}
          {aiModelData?.modelInfo && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Model</p>
                  <p className="text-2xl font-bold mt-1">{aiModelData.modelInfo.label}</p>
                </div>
                <Badge variant="outline" className={getSpeedBadge(aiModelData.modelInfo.speed)}>
                  <Zap className="h-3 w-3 mr-1" />
                  {aiModelData.modelInfo.speed}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Provider</p>
                  <p className="font-medium">{aiModelData.modelInfo.provider}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cost</p>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {aiModelData.modelInfo.cost}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select AI Model</label>
            <Select
              value={aiModelData?.currentModel}
              onValueChange={handleModelChange}
              disabled={setAIModel.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {aiModelData?.availableModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.label}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {model.provider}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getSpeedBadge(model.speed)}`}>
                          {model.speed}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Connection Button */}
          <Button
            onClick={handleTestConnection}
            disabled={testingAI}
            variant="outline"
            className="w-full"
          >
            {testingAI ? "Testing..." : "Test AI Connection"}
          </Button>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>
            Monitor the status of core system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Database */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">
                    {systemHealth?.database.message || "Checking..."}
                  </p>
                </div>
              </div>
              {systemHealth && getStatusIcon(systemHealth.database.status)}
            </div>

            {/* AI Service */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">AI Service</p>
                  <p className="text-sm text-muted-foreground">
                    {systemHealth?.ai.message || "Checking..."}
                  </p>
                </div>
              </div>
              {systemHealth && getStatusIcon(systemHealth.ai.status)}
            </div>

            {/* Storage (S3) */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Storage (S3)</p>
                  <p className="text-sm text-muted-foreground">
                    {systemHealth?.storage.message || "Checking..."}
                  </p>
                </div>
              </div>
              {systemHealth && getStatusIcon(systemHealth.storage.status)}
            </div>

            {/* WebSocket */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">WebSocket Server</p>
                  <p className="text-sm text-muted-foreground">
                    {systemHealth?.websocket.message || "Checking..."}
                  </p>
                </div>
              </div>
              {systemHealth && getStatusIcon(systemHealth.websocket.status)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Spending Controls */}
      <BudgetSettings />

      {/* AI Cost & Performance Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            AI Cost & Performance Analytics
          </CardTitle>
          <CardDescription>
            Monitor AI usage costs, performance metrics, and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AICostDashboard />
        </CardContent>
      </Card>
    </div>
  );
}

