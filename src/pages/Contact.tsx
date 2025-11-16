import { Coffee, Mail, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Contact() {
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
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 mb-12">We'd love to hear from you</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Email Us</h3>
              <p className="text-gray-600">support@slidecoffee.com</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Live Chat</h3>
              <p className="text-gray-600">Available 9am-5pm EST</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
