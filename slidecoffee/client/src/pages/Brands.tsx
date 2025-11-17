import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Palette, Trash2, Plus, X, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Brands() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBrand, setEditingBrand] = useState<number | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [, setLocation] = useLocation();
  const [newBrand, setNewBrand] = useState({
    name: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#8B5CF6",
    accentColor: "#10B981",
    fontPrimary: "Inter",
    fontSecondary: "Georgia",
    guidelinesText: "",
  });

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find((w) => w.isDefault) || workspaces?.[0];

  const { data: brands, refetch, isLoading } = trpc.brands.list.useQuery(
    { workspaceId: defaultWorkspace?.id || 0 },
    { enabled: !!defaultWorkspace }
  );

  const updateBrand = trpc.brands.update.useMutation({
    onSuccess: () => {
      toast.success("Brand updated successfully");
      setEditingBrand(null);
      setNewBrand({
        name: "",
        primaryColor: "#3B82F6",
        secondaryColor: "#8B5CF6",
        accentColor: "#10B981",
        fontPrimary: "Inter",
        fontSecondary: "Georgia",
        guidelinesText: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createBrand = trpc.brands.create.useMutation({
    onSuccess: () => {
      toast.success("Brand created successfully");
      setIsCreating(false);
      setNewBrand({
        name: "",
        primaryColor: "#3B82F6",
        secondaryColor: "#8B5CF6",
        accentColor: "#10B981",
        fontPrimary: "Inter",
        fontSecondary: "Georgia",
        guidelinesText: "",
      });
      refetch();
    },
    onError: (error) => {
      // Check if it's a brand limit error
      if (error.message.includes("Brand limit reached")) {
        setShowUpgradeDialog(true);
        // Don't log this as an error - it's an expected user flow
        return;
      }
      toast.error(error.message);
    },
  });

  const deleteBrand = trpc.brands.delete.useMutation({
    onSuccess: () => {
      toast.success("Brand deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateBrand = () => {
    if (!defaultWorkspace) {
      toast.error("No workspace found");
      return;
    }
    if (!newBrand.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    if (editingBrand) {
      // Update existing brand
      updateBrand.mutate({
        id: editingBrand,
        ...newBrand,
      });
    } else {
      // Create new brand
      createBrand.mutate({
        workspaceId: defaultWorkspace.id,
        ...newBrand,
      });
    }
  };

  const handleEditBrand = (brand: any) => {
    setEditingBrand(brand.id);
    setNewBrand({
      name: brand.name,
      primaryColor: brand.primaryColor || "#3B82F6",
      secondaryColor: brand.secondaryColor || "#8B5CF6",
      accentColor: brand.accentColor || "#10B981",
      fontPrimary: brand.fontPrimary || "Inter",
      fontSecondary: brand.fontSecondary || "Georgia",
      guidelinesText: brand.guidelinesText || "",
    });
    setIsCreating(true);
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingBrand(null);
    setNewBrand({
      name: "",
      primaryColor: "#3B82F6",
      secondaryColor: "#8B5CF6",
      accentColor: "#10B981",
      fontPrimary: "Inter",
      fontSecondary: "Georgia",
      guidelinesText: "",
    });
  };

  const handleDeleteBrand = (id: number) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      deleteBrand.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Brands</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your brand identities. Each brand can have its own colors, fonts, and guidelines.
          </p>
        </div>

        {/* Create New Brand Section */}
        {!isCreating && (
          <Button
            size="lg"
            onClick={() => {
              setEditingBrand(null);
              setIsCreating(true);
            }}
            className="w-full md:w-auto transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Brand
          </Button>
        )}

        {isCreating && (
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">{editingBrand ? "Edit Brand" : "Create New Brand"}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base">
                      Brand Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Acme Corp"
                      value={newBrand.name}
                      onChange={(e) =>
                        setNewBrand({ ...newBrand, name: e.target.value })
                      }
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Brand Colors</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={newBrand.primaryColor}
                          onChange={(e) =>
                            setNewBrand({ ...newBrand, primaryColor: e.target.value })
                          }
                          className="w-16 h-12 p-1 cursor-pointer"
                        />
                        <div className="flex-1">
                          <Label className="text-sm text-muted-foreground">Primary Color</Label>
                          <Input
                            value={newBrand.primaryColor}
                            onChange={(e) =>
                              setNewBrand({ ...newBrand, primaryColor: e.target.value })
                            }
                            className="h-10"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={newBrand.secondaryColor}
                          onChange={(e) =>
                            setNewBrand({ ...newBrand, secondaryColor: e.target.value })
                          }
                          className="w-16 h-12 p-1 cursor-pointer"
                        />
                        <div className="flex-1">
                          <Label className="text-sm text-muted-foreground">Secondary Color</Label>
                          <Input
                            value={newBrand.secondaryColor}
                            onChange={(e) =>
                              setNewBrand({ ...newBrand, secondaryColor: e.target.value })
                            }
                            className="h-10"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={newBrand.accentColor}
                          onChange={(e) =>
                            setNewBrand({ ...newBrand, accentColor: e.target.value })
                          }
                          className="w-16 h-12 p-1 cursor-pointer"
                        />
                        <div className="flex-1">
                          <Label className="text-sm text-muted-foreground">Accent Color</Label>
                          <Input
                            value={newBrand.accentColor}
                            onChange={(e) =>
                              setNewBrand({ ...newBrand, accentColor: e.target.value })
                            }
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontPrimary" className="text-base">
                        Primary Font
                      </Label>
                      <Input
                        id="fontPrimary"
                        placeholder="e.g., Inter"
                        value={newBrand.fontPrimary}
                        onChange={(e) =>
                          setNewBrand({ ...newBrand, fontPrimary: e.target.value })
                        }
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontSecondary" className="text-base">
                        Secondary Font
                      </Label>
                      <Input
                        id="fontSecondary"
                        placeholder="e.g., Georgia"
                        value={newBrand.fontSecondary}
                        onChange={(e) =>
                          setNewBrand({ ...newBrand, fontSecondary: e.target.value })
                        }
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="guidelines" className="text-base">
                    Brand Guidelines
                  </Label>
                  <Textarea
                    id="guidelines"
                    placeholder="Describe your brand voice, tone, and messaging guidelines. This helps the AI create presentations that match your style."
                    value={newBrand.guidelinesText}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, guidelinesText: e.target.value })
                    }
                    rows={16}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleCreateBrand}
                  disabled={createBrand.isPending || updateBrand.isPending}
                  className="flex-1"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {editingBrand
                    ? (updateBrand.isPending ? "Updating..." : "Update Brand")
                    : (createBrand.isPending ? "Creating..." : "Create Brand")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brands Grid */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <div className="flex gap-2">
                        <Skeleton className="w-10 h-10 rounded" />
                        <Skeleton className="w-10 h-10 rounded" />
                        <Skeleton className="w-10 h-10 rounded" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : brands && brands.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Brands ({brands.length})</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <Card key={brand.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Palette className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{brand.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(brand.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Color Palette */}
                    <div>
                      <p className="text-sm font-medium mb-2">Colors</p>
                      <div className="flex gap-2">
                        {brand.primaryColor && (
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                            style={{ backgroundColor: brand.primaryColor }}
                            title={`Primary: ${brand.primaryColor}`}
                          />
                        )}
                        {brand.secondaryColor && (
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                            style={{ backgroundColor: brand.secondaryColor }}
                            title={`Secondary: ${brand.secondaryColor}`}
                          />
                        )}
                        {brand.accentColor && (
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                            style={{ backgroundColor: brand.accentColor }}
                            title={`Accent: ${brand.accentColor}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Fonts */}
                    {(brand.fontPrimary || brand.fontSecondary) && (
                      <div>
                        <p className="text-sm font-medium mb-2">Fonts</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {brand.fontPrimary && <p>Primary: {brand.fontPrimary}</p>}
                          {brand.fontSecondary && <p>Secondary: {brand.fontSecondary}</p>}
                        </div>
                      </div>
                    )}

                    {/* Guidelines Preview */}
                    {brand.guidelinesText && (
                      <div>
                        <p className="text-sm font-medium mb-2">Guidelines</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {brand.guidelinesText}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditBrand(brand)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteBrand(brand.id)}
                        disabled={deleteBrand.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {brands && brands.length === 0 && !isCreating && (
          <Card className="border-dashed border-2 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Palette className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-3 max-w-lg">
                <h3 className="text-3xl font-bold tracking-tight">Create Your First Brand</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Brands are the foundation of your presentations. Define your colors, fonts, and guidelines so AI can generate slides that perfectly match your identity.
                </p>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Custom colors & fonts</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Brand guidelines & tone</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Consistent presentations</span>
                  </div>
                </div>
              </div>
              <Button size="lg" onClick={() => setIsCreating(true)} className="mt-2 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Brand
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Upgrade to Add More Brands</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-base pt-2">
              You've reached the brand limit for your <strong>Starter</strong> plan (1 brand). Upgrade to create more brands and unlock additional features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Professional Plan</p>
                  <p className="text-sm text-muted-foreground">Up to 5 brands</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Enterprise Plan</p>
                  <p className="text-sm text-muted-foreground">Unlimited brands</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowUpgradeDialog(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => {
                  setShowUpgradeDialog(false);
                  setLocation("/subscription");
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

