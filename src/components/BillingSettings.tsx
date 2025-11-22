import { useState, useEffect } from 'react';
import { Check, Crown, Zap, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  limits: {
    slidesPerMonth: number;
    presentationsPerMonth: number;
  };
  priceIds: {
    monthly: string;
    annual: string;
  } | null;
  popular?: boolean;
}

export default function BillingSettings() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);
  const [usage, setUsage] = useState({ slides: 0, presentations: 0 });

  const currentPlanId = user?.plan || 'espresso';

  useEffect(() => {
    fetchPlans();
    fetchUsage();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/stripe/plans');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage/current', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage || { slides: 0, presentations: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!plans) return;

    const plan = plans.find(p => p.id === planId);
    if (!plan || !plan.priceIds) {
      toast.error('Invalid plan selected');
      return;
    }

    setUpgradingTo(planId);

    try {
      const priceId = billingCycle === 'monthly' 
        ? plan.priceIds.monthly 
        : plan.priceIds.annual;

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process');
    } finally {
      setUpgradingTo(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const currentPlan = plans.find(p => p.id === currentPlanId);
  const limit = currentPlan?.limits?.slidesPerMonth || 5;
  const usagePercent = limit === -1 ? 0 : Math.min(100, (usage.slides / limit) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Subscription & Billing</h2>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold">{currentPlan?.name || 'Espresso'}</h3>
              {currentPlanId !== 'espresso' && <Crown className="w-5 h-5 text-yellow-500" />}
            </div>
            <p className="text-gray-600">
              {currentPlanId === 'espresso' ? 'Free Plan' : `$${currentPlan?.price.monthly || 0}/month`}
            </p>
          </div>
          {currentPlanId !== 'espresso' && (
            <button
              onClick={handleManageSubscription}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Manage <ExternalLink size={16} />
            </button>
          )}
        </div>

        {/* Usage Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Slide Usage This Month</span>
            <span className="text-gray-600">
              {usage.slides} / {limit === -1 ? '∞' : limit} slides
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${
                usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* Warning if approaching limit */}
        {usagePercent >= 80 && limit !== -1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            ⚠️ You're approaching your monthly limit. Consider upgrading to avoid interruptions.
          </div>
        )}
      </div>

      {/* Billing Cycle Toggle */}
      {currentPlanId === 'espresso' && (
        <>
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.filter(p => p.id !== 'espresso').map((plan) => {
              const price = billingCycle === 'monthly' ? plan.price.monthly : Math.round(plan.price.annual / 12);
              const isCurrentPlan = plan.id === currentPlanId;

              return (
                <div
                  key={plan.id}
                  className={`
                    relative border-2 rounded-xl p-6 transition-all
                    ${plan.popular ? 'border-purple-500 shadow-lg scale-105' : 'border-gray-200'}
                    ${isCurrentPlan ? 'bg-gray-50' : 'bg-white'}
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-gray-600">/month</span>
                    {billingCycle === 'annual' && (
                      <div className="text-sm text-gray-500">
                        Billed ${plan.price.annual} annually
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || upgradingTo === plan.id}
                    className={`
                      w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                      ${isCurrentPlan
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    {upgradingTo === plan.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        <Zap size={16} />
                        Upgrade to {plan.name}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Trust Indicators */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span>30-day money back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span>Secure payment via Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
