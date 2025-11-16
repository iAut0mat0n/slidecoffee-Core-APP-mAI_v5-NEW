import { Coffee, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Templates() {
  const navigate = useNavigate()

  const categories = [
    { name: 'Pitch Decks', count: 24 },
    { name: 'Business Reviews', count: 18 },
    { name: 'Sales Presentations', count: 32 },
    { name: 'Marketing', count: 28 },
    { name: 'Education', count: 15 },
    { name: 'Reports', count: 21 }
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
          <h1 className="text-5xl font-bold mb-6">Presentation <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Templates</span></h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Start with professionally designed templates. Customize with AI to match your brand.</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search templates..." className="w-full pl-12 pr-4 py-3 rounded-lg border bg-white" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-600 transition-colors cursor-pointer">
                <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.count} templates</p>
              </div>
            ))}
          </div>

          <div className="text-center bg-purple-50 rounded-xl p-12">
            <h3 className="text-2xl font-bold mb-4">Create Custom Templates</h3>
            <p className="text-gray-600 mb-6">Use our AI to generate custom templates based on your brand guidelines</p>
            <button onClick={() => navigate('/onboarding')} className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
