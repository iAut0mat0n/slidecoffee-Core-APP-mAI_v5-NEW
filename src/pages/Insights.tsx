import { Coffee, BarChart3, FileText, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Insights() {
  const navigate = useNavigate()

  const articles = [
    { icon: FileText, title: '10 Tips for Better Presentations', date: 'Nov 10, 2025', readTime: '5 min read' },
    { icon: BarChart3, title: 'Data Visualization Best Practices', date: 'Nov 5, 2025', readTime: '8 min read' },
    { icon: Video, title: 'How to Present with Confidence', date: 'Oct 28, 2025', readTime: '6 min read' }
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
          <h1 className="text-5xl font-bold mb-6">Presentation <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Insights</span></h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Learn from experts and improve your presentation skills</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
          <div className="space-y-6 max-w-4xl">
            {articles.map((article) => (
              <div key={article.title} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <article.icon className="w-12 h-12 text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                    <p className="text-gray-600">{article.date} • {article.readTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-purple-50 rounded-xl p-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Want More Tips?</h3>
            <p className="text-gray-600 mb-6">Subscribe to our newsletter for weekly presentation insights</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg border" />
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
