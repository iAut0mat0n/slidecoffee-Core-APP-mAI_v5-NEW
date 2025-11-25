import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPlan() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('americano'); // Pre-select Americano
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'espresso',
      name: 'Espresso',
      subtitle: 'Free Forever',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for trying SlideCoffee',
      features: [
        '5 slides (one-time)',
        'Basic templates',
        'PDF export only',
        'Watermark on exports',
      ],
      color: 'gray',
    },
    {
      id: 'americano',
      name: 'Americano',
      subtitle: 'Best for Individuals',
      price: { monthly: 12, annual: 120 },
      description: 'Perfect for weekly presentations',
      features: [
        '7 presentations/month (70 slides)',
        '5 edits/month',
        'All templates',
        'AI generation ✨',
        'No watermark',
        'PDF + PPTX export',
        'Email support',
      ],
      color: 'purple',
      recommended: true,
    },
    {
      id: 'cappuccino',
      name: 'Cappuccino',
      subtitle: 'Most Popular',
      price: { monthly: 29, annual: 288 },
      description: 'Daily presentations with premium AI',
      features: [
        '30 presentations/month (300 slides)',
        'Unlimited edits',
        'Premium AI (Claude Sonnet) 🤖',
        'Custom branding & fonts',
        'Advanced analytics',
        'Priority support',
        'Remove footer branding',
      ],
      color: 'blue',
      popular: true,
    },
  ];

  const selectedPlanDetails = plans.find((p) => p.id === selectedPlan);
  const price = selectedPlanDetails?.price?.[billing] || 0;

  const handleContinue = async () => {
    setLoading(true);
    
    try {
      if (selectedPlan === 'espresso') {
        // Free plan - refresh user data and continue to dashboard
        await refreshUser();
        toast.success('Welcome to SlideCoffee! You\'re on the free Espresso plan.');
        navigate('/dashboard');
        return;
      }

      // For paid plans, initiate Stripe checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planId: selectedPlan,
          billing,
          returnUrl: window.location.origin + '/dashboard?welcome=true',
        }),
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Plan selection error:', error);
      toast.error('Failed to process plan selection');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Refresh user data before going to dashboard
    await refreshUser();
    toast.success('You can upgrade anytime from Settings!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-purple-100 rounded-full text-sm font-medium mb-4 text-purple-700">
            Step 3 of 3
          </div>
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Start with Americano (our most popular starter plan) or choose what fits you best
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billing === 'annual'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual <span className="text-sm">(Save 17%)</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative bg-white rounded-2xl p-8 cursor-pointer transition-all border-2 ${
                selectedPlan === plan.id
                  ? `border-${plan.color}-500 shadow-xl scale-105`
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommended
                  </div>
                </div>
              )}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-full shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold">${plan.price[billing]}</span>
                  {plan.price[billing] > 0 && (
                    <span className="text-gray-600">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan === plan.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="px-8 py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
          <button
            onClick={handleContinue}
            disabled={loading}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              'Processing...'
            ) : selectedPlan === 'espresso' ? (
              'Continue with Free Plan'
            ) : (
              <>Continue with {selectedPlanDetails?.name} (${price})</>
            )}
          </button>
        </div>

        {/* Progress */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="w-12 h-1 bg-purple-600 rounded-full"></div>
          <div className="w-12 h-1 bg-purple-600 rounded-full"></div>
          <div className="w-12 h-1 bg-purple-600 rounded-full"></div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-4">
            ✓ No credit card required for free plan · ✓ Cancel anytime · ✓ 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
