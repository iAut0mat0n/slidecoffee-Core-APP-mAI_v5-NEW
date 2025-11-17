import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Check, Sparkles, Zap, Crown, Users, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out SlideCoffee",
    credits: "75 credits/month",
    features: [
      "1 brand",
      "Unlimited projects",
      "AI-powered generation",
      "Export to PowerPoint & PDF",
      "Community support",
    ],
    icon: Sparkles,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$18",
    period: "/month",
    description: "For professionals & consultants",
    credits: "2,000 credits/month",
    features: [
      "3 brands",
      "Unlimited projects",
      "Priority AI generation",
      "Research & citations",
      "Custom templates",
      "Email support",
    ],
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    popular: true,
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    price: "$35",
    period: "/month",
    description: "For power users & agencies",
    credits: "5,000 credits/month",
    features: [
      "10 brands",
      "Unlimited projects",
      "Advanced AI models",
      "Priority support",
      "Custom branding",
      "Analytics dashboard",
    ],
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    id: "team",
    name: "Team",
    price: "$35",
    period: "/seat/month",
    description: "For small teams (2-10 members)",
    credits: "6,000 credits/seat/month",
    features: [
      "10 brands",
      "Shared workspaces",
      "Team collaboration",
      "Centralized billing",
      "Admin controls",
      "Priority support",
    ],
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    id: "business",
    name: "Business",
    price: "$60",
    period: "/seat/month",
    description: "For larger organizations (5+ members)",
    credits: "10,000 credits/seat/month",
    features: [
      "25 brands",
      "Advanced team features",
      "SSO & security",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
    icon: Building2,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom needs",
    credits: "Unlimited credits",
    features: [
      "Unlimited brands",
      "White-label options",
      "Custom AI training",
      "On-premise deployment",
      "24/7 phone support",
      "Custom contract",
    ],
    icon: Crown,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
  },
];

export default function Subscription() {
  const { data: user } = trpc.auth.me.useQuery();
  const upgradePlan = trpc.subscription.upgrade.useMutation({
    onSuccess: () => {
      toast.success("Subscription updated successfully!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update subscription");
    },
  });

  const handleUpgrade = (planId: string) => {
    if (planId === "enterprise") {
      toast.info("Please contact sales for Enterprise pricing");
      return;
    }
    
    if (planId === "team" || planId === "business") {
      toast.info("Team and Business plans coming soon! Contact us for early access.");
      return;
    }

    upgradePlan.mutate({ tier: planId as "starter" | "pro" | "pro_plus" | "team" | "business" | "enterprise" });
  };

  const currentTier = user?.subscriptionTier || "starter";

  const isCurrentPlan = (planId: string) => currentTier === planId;
  
  const canUpgrade = (planId: string) => {
    const tierOrder = ["starter", "pro", "pro_plus", "team", "business", "enterprise"];
    const currentIndex = tierOrder.indexOf(currentTier);
    const planIndex = tierOrder.indexOf(planId);
    return planIndex > currentIndex;
  };

  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your presentation needs. All plans include AI-powered slide generation and unlimited projects.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Currently on: <span className="font-bold capitalize">{currentTier.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);
            const canUpgradeToThis = canUpgrade(plan.id);

            return (
              <Card
                key={plan.id}
                className={`relative p-6 ${
                  plan.popular
                    ? "border-2 border-purple-500 shadow-lg"
                    : isCurrent
                    ? "border-2 border-green-500"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-lg ${plan.bgColor} mb-4`}>
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{plan.credits}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={isCurrent || !canUpgradeToThis || upgradePlan.isPending}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {upgradePlan.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : canUpgradeToThis ? (
                    plan.id === "enterprise" ? "Contact Sales" : "Upgrade"
                  ) : (
                    "Downgrade"
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What are credits?</h3>
              <p className="text-sm text-muted-foreground">
                Credits are used for AI-powered features like outline generation and slide creation. A simple presentation uses ~100-200 credits, while complex presentations with research use ~400-600 credits.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade your plan at any time. Downgrades take effect at the end of your current billing cycle.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What happens if I run out of credits?</h3>
              <p className="text-sm text-muted-foreground">
                You can upgrade to a higher tier for more credits, or wait until your monthly credits reset. We'll notify you when you're running low.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do unused credits roll over?</h3>
              <p className="text-sm text-muted-foreground">
                No, credits reset at the beginning of each billing cycle. However, you can always upgrade to a higher tier if you need more credits.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

