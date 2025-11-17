import { Coffee } from 'lucide-react'
import { useLocation } from 'wouter'

export default function CookieNotice() {
  const [, setLocation] = useLocation()
  const navigate = (path: string) => setLocation(path)
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
          <h1 className="text-4xl font-bold mb-8">Cookie Notice</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: November 16, 2025</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Types of Cookies We Use</h2>
            <p className="text-gray-700 mb-4">
              <strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off. 
              They are usually only set in response to actions made by you such as setting your privacy preferences or logging in.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website 
              by collecting and reporting information anonymously.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Functional Cookies:</strong> These cookies enable enhanced functionality and personalization, 
              such as remembering your preferences and settings.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies in various ways. Please note that removing or blocking cookies 
              can impact your user experience and parts of our website may no longer be fully accessible.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
