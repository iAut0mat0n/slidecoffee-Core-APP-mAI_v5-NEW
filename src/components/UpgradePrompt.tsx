import { X, Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface UpgradePromptProps {
  currentPlan: string;
  currentSlides: number;
  limit: number;
  onClose?: () => void;
  onUpgrade?: (planId: string) => void;
  showOneTimeOffer?: boolean;
}

export default function UpgradePrompt({
  currentPlan,
  currentSlides,
  limit,
  onClose,
  onUpgrade,
  showOneTimeOffer = false,
}: UpgradePromptProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const isAtLimit = currentSlides >= limit;

  // Subscription upgrade options based on actual pricing
  const upgradePlans = [
    {
      id: 'americano',
      name: 'Americano',
      monthlyPrice: 12,
      annualPrice: 120,
      slides: 75,
      features: ['7 presentations/month (70 slides)', '5 edits/month', 'All templates', 'AI generation', 'No watermark', 'PDF + PPTX export'],
    },
    {
      id: 'cappuccino',
      name: 'Cappuccino',
      monthlyPrice: 29,
      annualPrice: 288,
      slides: 450,
      features: ['30 presentations/month (300 slides)', 'Unlimited edits', 'Premium AI (Claude Sonnet)', 'Custom branding', 'Advanced analytics', 'Priority support'],
      popular: true,
    },
    {
      id: 'coldbrew',
      name: 'Cold Brew',
      monthlyPrice: 59,
      annualPrice: 588,
      slides: 800,
      features: ['60 presentations/month (600 slides)', 'Unlimited edits', '3-20 team seats', 'Team collaboration', 'Shared brand library', 'Priority support'],
    },
  ];

  const handleUpgrade = (planId: string) => {
    onUpgrade?.(planId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAtLimit ? '🎯 Slide Limit Reached' : '⚠️ Approaching Limit'}
            </h2>
            <p className="text-gray-600 mt-1">
              You've used {currentSlides} of {limit} slides this month on the {currentPlan} plan
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* One-time offer section (shown when user hits limit on free plan) */}
          {showOneTimeOffer && currentPlan === 'espresso' && currentSlides >= limit && (
            <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ☕ Upgrade to Americano
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Get <strong>7 presentations per month (75 slides)</strong> for just <strong>$12/month</strong>!
                  </p>
                  <button
                    onClick={() => handleUpgrade('americano')}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Upgrade to Americano
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-sm text-gray-600 mt-2">Perfect for weekly presentations</p>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          {showOneTimeOffer && currentPlan === 'espresso' && currentSlides >= limit && (
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or choose a monthly plan</span>
              </div>
            </div>
          )}

          {/* Subscription plans */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upgrade to a monthly plan
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {upgradePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative border-2 rounded-xl p-6 transition-all cursor-pointer ${
                    plan.popular
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">${plan.monthlyPrice}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      or ${plan.annualPrice}/year
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      {plan.slides} slides/month
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Upgrade to {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel action */}
          {onClose && (
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Maybe later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
