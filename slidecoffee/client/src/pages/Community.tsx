import { Coffee } from 'lucide-react'
import { useLocation } from 'wouter'

export default function Community() {
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
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Community</h1>
          <p className="text-xl text-gray-600">Join our community of presentation creators</p>
        </div>
      </section>
    </div>
  )
}
