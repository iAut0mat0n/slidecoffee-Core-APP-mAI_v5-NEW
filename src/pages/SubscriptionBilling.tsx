import { useState } from 'react';
import CollapsibleSidebar from '../components/CollapsibleSidebar';

export default function SubscriptionBilling() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 0, annual: 0 },
      features: ['5 presentations/month', 'Basic templates', 'Export to PDF', 'Community support'],
      current: true,
    },
    {
      name: 'Pro',
      price: { monthly: 29, annual: 290 },
      features: ['Unlimited presentations', 'All templates', 'AI generation', 'Brand guidelines', 'Priority support', 'Export to PPT/PDF'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, annual: 990 },
      features: ['Everything in Pro', 'Custom branding', 'API access', 'SSO', 'Dedicated support', 'SLA guarantee', 'Advanced analytics'],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
            <p className="text-gray-600 mt-1">Manage your plan and payment methods</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Current Plan</h2>
                <p className="text-gray-600 mt-1">You are on the Starter plan</p>
              </div>
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                Active
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Presentations this month</div>
                <div className="text-2xl font-bold">3 / 5</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Next billing date</div>
                <div className="text-2xl font-bold">-</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Monthly cost</div>
                <div className="text-2xl font-bold">$0</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Annual <span className="text-xs text-green-600 ml-1">(Save 17%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 relative ${
                  plan.popular
                    ? 'border-purple-600'
                    : plan.current
                    ? 'border-green-500'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    CURRENT PLAN
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price[billingCycle]}</span>
                  <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full px-4 py-3 rounded-lg font-medium ${
                    plan.current
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500 mb-3">No payment method on file</p>
              <button className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Add Payment Method
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Billing History</h2>
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500">No billing history yet</p>
              <p className="text-sm text-gray-400 mt-1">Your invoices will appear here after your first payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
