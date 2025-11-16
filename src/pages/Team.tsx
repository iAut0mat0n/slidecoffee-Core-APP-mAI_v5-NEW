import { Coffee } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Team() {
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
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Team</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Meet the people building the future of presentations</p>
        </div>
      </section>
    </div>
  )
}
