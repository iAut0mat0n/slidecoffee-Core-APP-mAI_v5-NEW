import { Coffee } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Terms() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Coffee className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold">SlideCoffee</span>
          </div>
        </div>
      </header>
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: November 16, 2025</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using SlideCoffee, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily use SlideCoffee for personal or commercial presentation creation. 
              This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              You are responsible for safeguarding your account credentials and for any activities or actions under your account. 
              You must notify us immediately upon becoming aware of any breach of security.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Content Ownership</h2>
            <p className="text-gray-700 mb-4">
              You retain all rights to the presentations you create using SlideCoffee. We do not claim ownership of your content.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">
              You may not use SlideCoffee for any illegal purposes or to violate any laws. You may not attempt to gain 
              unauthorized access to any portion of the service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              SlideCoffee shall not be liable for any indirect, incidental, special, consequential or punitive damages 
              resulting from your use of or inability to use the service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
