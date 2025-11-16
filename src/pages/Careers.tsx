import { Coffee, Briefcase, Heart, Rocket, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Careers() {
  const navigate = useNavigate()

  const benefits = [
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health insurance and wellness programs' },
    { icon: Rocket, title: 'Growth', description: 'Learning budget and career development opportunities' },
    { icon: Users, title: 'Remote-First', description: 'Work from anywhere with flexible hours' },
    { icon: Briefcase, title: 'Equity', description: 'Competitive salary and stock options' },
  ]

  const positions = [
    { title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Product Designer', department: 'Design', location: 'Remote', type: 'Full-time' },
    { title: 'AI/ML Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Customer Success Manager', department: 'Customer Success', location: 'Remote', type: 'Full-time' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Coffee className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">SlideCoffee</span>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Join Our <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Team</span></h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Help us transform how the world creates presentations</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Why SlideCoffee?</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl p-6 text-center shadow-md">
                <benefit.icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Open Positions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {positions.map((position) => (
              <div key={position.title} className="bg-gray-50 rounded-lg p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-bold text-lg mb-1">{position.title}</h3>
                  <p className="text-gray-600 text-sm">{position.department} • {position.location} • {position.type}</p>
                </div>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">Apply</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

