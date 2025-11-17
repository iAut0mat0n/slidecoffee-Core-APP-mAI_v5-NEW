import { Coffee, TrendingUp, Users, Lightbulb } from 'lucide-react'
import { useLocation } from 'wouter'

export default function Inspiration() {
  const [, setLocation] = useLocation()
  const navigate = (path: string) => setLocation(path)

  const showcases = [
    { icon: TrendingUp, title: 'Startup Pitch Decks', description: 'See how successful startups presented their vision to investors' },
    { icon: Users, title: 'Team Presentations', description: 'Examples of effective internal communication and team updates' },
    { icon: Lightbulb, title: 'Product Launches', description: 'Inspiring product announcement presentations from leading companies' }
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
          <h1 className="text-5xl font-bold mb-6">Get <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Inspired</span></h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Explore examples of great presentations and learn what makes them effective</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {showcases.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
                <item.icon className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own?</h2>
            <p className="text-lg mb-6 opacity-90">Use our AI to build presentations that inspire your audience</p>
            <button onClick={() => navigate('/onboarding')} className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Start Creating
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
