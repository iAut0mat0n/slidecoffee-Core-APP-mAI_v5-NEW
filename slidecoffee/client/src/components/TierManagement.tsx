import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function TierManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    billingPeriod: "monthly" as "monthly" | "yearly",
    credits: 0,
    collaboratorSeats: 1,
    maxBrands: 1,
    maxStorageGB: 5,
    features: [] as string[],
    featureInput: "",
    isActive: true,
    isPublic: true,
    sortOrder: 0,
  });

  const { data: tiers, refetch } = trpc.tier.getAll.useQuery();

  const createMutation = trpc.tier.create.useMutation({
    onSuccess: () => {
      toast.success("Tier created successfully");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.tier.update.useMutation({
    onSuccess: () => {
      toast.success("Tier updated successfully");
      setEditingTier(null);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.tier.delete.useMutation({
    onSuccess: () => {
      toast.success("Tier deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const toggleActiveMutation = trpc.tier.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Tier status updated");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      billingPeriod: "monthly",
      credits: 0,
      collaboratorSeats: 1,
      maxBrands: 1,
      maxStorageGB: 5,
      features: [],
      featureInput: "",
      isActive: true,
      isPublic: true,
      sortOrder: 0,
    });
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      features: JSON.stringify(formData.features),
      limits: JSON.stringify({}),
    };
    
    if (editingTier) {
      updateMutation.mutate({
        id: editingTier.id,
        ...submitData,
      });
    } else {
      createMutation.mutate(submitData as any);
    }
  };

  const handleEdit = (tier: any) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      slug: tier.slug,
      description: tier.description || "",
      price: tier.price,
      billingPeriod: tier.billingPeriod,
      credits: tier.credits,
      collaboratorSeats: tier.collaboratorSeats,
      maxBrands: tier.maxBrands || 1,
      maxStorageGB: tier.maxStorageGB || 5,
      features: JSON.parse(tier.features || "[]"),
      featureInput: "",
      isActive: tier.isActive === 1,
      isPublic: tier.isPublic === 1,
      sortOrder: tier.sortOrder,
    });
  };

  const addFeature = () => {
    if (formData.featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, formData.featureInput.trim()],
        featureInput: "",
      });
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Tiers</CardTitle>
              <CardDescription>Create and manage subscription plans</CardDescription>
            </div>
            <Dialog
              open={isCreateOpen || !!editingTier}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) {
                  setEditingTier(null);
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTier ? "Edit Tier" : "Create New Tier"}</DialogTitle>
                  <DialogDescription>
                    Configure pricing, limits, and features for this subscription tier
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        placeholder="Pro Plan"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input
                        placeholder="pro"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used in code (lowercase, no spaces)
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Perfect for growing teams..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price (cents)</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="2999 = $29.99"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        ${(formData.price / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label>Billing Period</Label>
                      <Select
                        value={formData.billingPeriod}
                        onValueChange={(value: "monthly" | "yearly") =>
                          setFormData({ ...formData, billingPeriod: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Credits/Month</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.credits}
                        onChange={(e) =>
                          setFormData({ ...formData, credits: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label>Collaborator Seats</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.collaboratorSeats}
                        onChange={(e) =>
                          setFormData({ ...formData, collaboratorSeats: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Projects</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.maxBrands}
                        onChange={(e) =>
                          setFormData({ ...formData, maxBrands: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label>Max Storage (GB)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.maxStorageGB}
                        onChange={(e) =>
                          setFormData({ ...formData, maxStorageGB: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Features</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a feature..."
                        value={formData.featureInput}
                        onChange={(e) => setFormData({ ...formData, featureInput: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                      />
                      <Button type="button" onClick={addFeature} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {feature}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeFeature(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                      />
                      <Label>Public</Label>
                    </div>
                    <div>
                      <Label>Sort Order</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.sortOrder}
                        onChange={(e) =>
                          setFormData({ ...formData, sortOrder: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingTier(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingTier ? "Update" : "Create"} Tier
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!tiers || tiers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No subscription tiers yet. Create one to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers?.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tier.name}</div>
                        <div className="text-sm text-muted-foreground">{tier.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          ${(tier.price / 100).toFixed(2)}/
                          {tier.billingPeriod === "monthly" ? "mo" : "yr"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tier.credits} credits</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{tier.maxBrands || "∞"} brands</div>
                        <div className="text-muted-foreground">{tier.collaboratorSeats} seats</div>
                        <div className="text-muted-foreground">{tier.maxStorageGB || "∞"} GB</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(tier.features || "[]")
                          .slice(0, 2)
                          .map((feature: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        {JSON.parse(tier.features || "[]").length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{JSON.parse(tier.features || "[]").length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Switch
                          checked={tier.isActive === 1}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: tier.id, isActive: checked })
                          }
                        />
                        {tier.isPublic === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleEdit(tier);
                            setIsCreateOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this tier?")) {
                              deleteMutation.mutate({ id: tier.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

