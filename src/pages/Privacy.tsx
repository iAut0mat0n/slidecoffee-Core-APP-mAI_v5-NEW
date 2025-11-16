import { Coffee } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Privacy() {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: November 16, 2025</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, including your name, email address, and presentation content. 
              We also automatically collect certain information about your device when you use our service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to provide, maintain, and improve our services, to process your transactions, 
              and to communicate with you about products, services, and promotional offers.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not share your personal information with third parties except as described in this policy. 
              We may share information with service providers who perform services on our behalf.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We take reasonable measures to help protect your personal information from loss, theft, misuse, 
              unauthorized access, disclosure, alteration, and destruction.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to access, update, or delete your personal information at any time. 
              You can also opt out of receiving promotional communications from us.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
