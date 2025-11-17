import { Coffee, Check } from 'lucide-react'
import { useLocation } from 'wouter'

export default function Pricing() {
  const [, setLocation] = useLocation()
  const navigate = (path: string) => setLocation(path)

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for individuals getting started',
      features: [
        '1 brand guideline',
        '5 projects per month',
        'Basic AI generation',
        'Export to PowerPoint',
        'Community support'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'For growing teams and professionals',
      features: [
        '5 brand guidelines',
        'Unlimited projects',
        'Priority AI generation',
        'Custom templates',
        'Priority support',
        'Team collaboration',
        'Advanced analytics'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large organizations',
      features: [
        'Unlimited brands',
        'Unlimited projects',
        'Custom AI training',
        'API access',
        'Dedicated support',
        'SSO & advanced security',
        'Custom integrations',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Coffee className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">SlideCoffee</span>
          </div>
          <button onClick={() => navigate('/onboarding')} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Get Started
          </button>
        </div>
      </header>

      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Pricing</span></h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your needs. All plans include our core AI-powered presentation features.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-xl p-8 ${plan.highlighted ? 'border-2 border-purple-600 shadow-xl relative' : 'border-2 border-gray-200 bg-white'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${plan.highlighted ? 'bg-purple-600 text-white hover:bg-purple-700' : 'border-2 border-gray-300 hover:border-gray-400'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6 text-left">
            <div>
              <h3 className="font-bold text-lg mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Yes! Professional and Enterprise plans come with a 14-day free trial. No credit card required.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
