/**
 * Upgrade Modal
 * 
 * Beautiful pricing comparison modal shown when:
 * - User clicks credit display widget
 * - User runs out of credits
 * - User hits tier limits (brands, projects)
 * 
 * Shows all pricing tiers with benefits and clear CTAs
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Users, Building2, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier?: string;
  reason?: "credits" | "brands" | "projects" | "general";
}

const PRICING_TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "forever",
    credits: 75,
    brands: 1,
    description: "Perfect for trying out SlideCoffee",
    icon: Zap,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    features: [
      "75 credits/month",
      "1 brand",
      "Unlimited projects",
      "AI-powered slides",
      "Export to PPTX/PDF",
      "Email support",
    ],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 18,
    period: "month",
    credits: 2000,
    brands: 3,
    description: "For professionals and consultants",
    icon: Sparkles,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    features: [
      "2,000 credits/month",
      "3 brands",
      "Unlimited projects",
      "Priority AI processing",
      "Advanced layouts",
      "Priority support",
      "Version history",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    price: 35,
    period: "month",
    credits: 5000,
    brands: 10,
    description: "For agencies and power users",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    features: [
      "5,000 credits/month",
      "10 brands",
      "Unlimited projects",
      "Everything in Pro",
      "Workspace collaboration",
      "Custom templates",
      "API access (coming soon)",
    ],
    cta: "Upgrade to Pro Plus",
    highlighted: false,
  },
  {
    id: "business",
    name: "Business",
    price: 60,
    period: "seat/month",
    credits: 10000,
    brands: 25,
    description: "For growing teams",
    icon: Building2,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    features: [
      "10,000 credits/seat/month",
      "25 brands",
      "Unlimited projects",
      "Everything in Pro Plus",
      "Team management",
      "SSO (coming soon)",
      "Dedicated support",
    ],
    cta: "Upgrade to Business",
    highlighted: false,
  },
];

export function UpgradeModal({ open, onOpenChange, currentTier = "starter", reason = "general" }: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const upgradeMutation = trpc.subscription.upgrade.useMutation({
    onSuccess: () => {
      toast.success("Plan upgraded successfully!", {
        description: "Your new credits are now available.",
      });
      onOpenChange(false);
      window.location.reload(); // Refresh to show new credits
    },
    onError: (error) => {
      toast.error("Upgrade failed", {
        description: error.message,
      });
    },
  });

  const handleUpgrade = (tierId: string) => {
    if (tierId === currentTier) {
      toast.info("You're already on this plan");
      return;
    }

    setSelectedTier(tierId);
    
    // In production, this would redirect to Stripe checkout
    // For now, just update the tier directly
    upgradeMutation.mutate({
      tier: tierId as any,
    });
  };

  const getReasonMessage = () => {
    switch (reason) {
      case "credits":
        return "You've run out of credits! Upgrade to keep creating amazing presentations.";
      case "brands":
        return "You've reached your brand limit. Upgrade to add more brands.";
      case "projects":
        return "You've reached your project limit. Upgrade for unlimited projects.";
      default:
        return "Unlock more credits and features with a premium plan.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-base">
            {getReasonMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = tier.id === currentTier;
            const isSelected = tier.id === selectedTier;
            const isUpgrading = upgradeMutation.isPending && isSelected;

            return (
              <div
                key={tier.id}
                className={cn(
                  "relative flex flex-col p-6 rounded-lg border-2 transition-all",
                  tier.highlighted && "ring-2 ring-blue-500 ring-offset-2",
                  isCurrent && "opacity-60",
                  tier.borderColor
                )}
              >
                {/* Badge */}
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">
                    {tier.badge}
                  </Badge>
                )}

                {/* Icon */}
                <div className={cn("mb-4", tier.bgColor, "w-12 h-12 rounded-lg flex items-center justify-center")}>
                  <Icon className={cn("h-6 w-6", tier.color)} />
                </div>

                {/* Name & Price */}
                <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
                <div className="mb-2">
                  {tier.price === 0 ? (
                    <span className="text-3xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isCurrent || isUpgrading}
                  variant={tier.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  {isUpgrading ? (
                    "Upgrading..."
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    tier.cta
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Enterprise */}
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-4">
                Custom solutions for large organizations. Unlimited everything.
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Unlimited credits & brands</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Custom integrations & SSO</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>SLA & priority support</span>
                </li>
              </ul>
            </div>
            <Button variant="outline" size="lg" className="ml-4">
              Contact Sales
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>All plans include a 14-day money-back guarantee. Cancel anytime.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

