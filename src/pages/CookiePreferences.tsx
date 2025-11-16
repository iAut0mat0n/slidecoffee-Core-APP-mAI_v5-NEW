import { Coffee } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function CookiePreferences() {
  const navigate = useNavigate()
  const [essential] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [functional, setFunctional] = useState(false)

  const handleSave = () => {
    // Save cookie preferences
    alert('Cookie preferences saved!')
  }

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
          <h1 className="text-4xl font-bold mb-8">Cookie Preferences</h1>
          <p className="text-gray-600 mb-8">Manage your cookie preferences below</p>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">Essential Cookies</h3>
                  <p className="text-gray-600">Required for the website to function properly</p>
                </div>
                <input type="checkbox" checked={essential} disabled className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">Analytics Cookies</h3>
                  <p className="text-gray-600">Help us understand how you use our website</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={analytics} 
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-5 h-5" 
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">Functional Cookies</h3>
                  <p className="text-gray-600">Remember your preferences and settings</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={functional} 
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="w-5 h-5" 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="mt-8 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </section>
    </div>
  )
}
