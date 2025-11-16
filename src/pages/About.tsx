import { Coffee, Target, Heart, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We believe presentations should communicate ideas, not waste time. Our mission is to eliminate the tedious parts of slide creation.',
    },
    {
      icon: Heart,
      title: 'User-Focused',
      description: 'Every feature we build starts with understanding what presenters actually need. Your feedback shapes our product.',
    },
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'We leverage the latest AI technology to push the boundaries of what\'s possible in presentation design.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Coffee className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SlideCoffee
            </span>
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            About <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">SlideCoffee</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to transform how professionals create presentations. 
            By combining AI with beautiful design, we help you focus on your message, not formatting.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg mx-auto text-gray-700">
            <p>
              SlideCoffee was born from a simple frustration: creating presentations takes too long. 
              As professionals ourselves, we spent countless hours tweaking layouts, choosing colors, 
              and formatting slides—time that could have been spent on the actual content.
            </p>
            <p>
              We knew there had to be a better way. With advances in AI and design automation, 
              we set out to build a tool that would handle the tedious parts while letting creators 
              focus on what matters: their message.
            </p>
            <p>
              Today, SlideCoffee helps thousands of professionals create beautiful, impactful 
              presentations in a fraction of the time. Whether you're pitching to investors, 
              presenting to your team, or teaching a class, we're here to make your ideas shine.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                  <value.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">Presentations Created</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Happy Teams</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Time Saved</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9/5</div>
              <div className="text-lg opacity-90">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Join thousands of professionals</h2>
          <p className="text-xl text-gray-600 mb-8">Start creating better presentations today</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-purple-600 text-white px-10 py-4 rounded-lg hover:bg-purple-700 transition-colors font-bold text-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  )
}

