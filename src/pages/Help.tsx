import { Coffee, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Help() {
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
          <h1 className="text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers to common questions</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search for help..." className="w-full pl-12 pr-4 py-3 rounded-lg border" />
          </div>
        </div>
      </section>
    </div>
  )
}
