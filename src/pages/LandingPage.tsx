import { Coffee, Sparkles, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold">SlideCoffee</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/onboarding')}
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/onboarding')}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Get Started Free
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section with Slide Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-center gap-12">
          {/* Left: Text Content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Presentation Builder
            </div>
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Build presentations that{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                actually matter
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-xl">
              Stop wasting time on slides. Let AI do the research, planning, and design. You focus on the message.
            </p>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg"
              >
                Get Started Free
              </button>
              <button className="border-2 border-gray-300 px-8 py-4 rounded-lg hover:border-gray-400 transition-colors font-semibold text-lg">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500">No credit card required • Free trial includes 1 brand</p>
          </div>

          {/* Right: Slide Grid Showcase */}
          <div className="flex-1 hidden lg:block">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <div
                    key={num}
                    className="aspect-video rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md"
                  >
                    <img
                      src={`/landing-assets/slide${num}.jpg`}
                      alt={`Presentation slide ${num}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/landing-assets/slide${num}.png`
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Banner */}
      <section className="bg-white py-12 overflow-hidden">
        <div className="scrolling-banner">
          <div className="scrolling-content">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <div
                    key={`${setIndex}-${num}`}
                    className="w-80 aspect-video rounded-lg overflow-hidden shadow-lg flex-shrink-0"
                  >
                    <img
                      src={`/landing-assets/slide${num}.jpg`}
                      alt={`Slide ${num}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/landing-assets/slide${num}.png`
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-purple-600 mb-2">
              <Sparkles className="w-12 h-12 mx-auto" />
            </div>
            <div className="text-4xl font-bold mb-2">10,000+</div>
            <div className="text-gray-600">Presentations Created</div>
          </div>
          <div>
            <div className="text-purple-600 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-gray-600">Time Saved</div>
          </div>
          <div>
            <div className="text-purple-600 mb-2">
              <Star className="w-12 h-12 mx-auto fill-current" />
            </div>
            <div className="text-4xl font-bold mb-2">4.9/5</div>
            <div className="text-gray-600">User Rating</div>
          </div>
          <div>
            <div className="text-purple-600 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-gray-600">Happy Teams</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">From idea to professional presentation in three simple steps</p>
          </div>

          {/* Feature 1 */}
          <div className="flex items-center gap-12 mb-20">
            <div className="flex-1">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4">AI-Powered Generation</h3>
              <p className="text-lg text-gray-600 mb-6">
                Watch AI research, plan, and build your presentation in real-time. No more blank page syndrome.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Intelligent content generation based on your topic
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Real-time research and fact-checking
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Professional layouts automatically applied
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <img
                src="/landing-assets/slide11.jpg"
                alt="AI-powered generation"
                className="rounded-xl shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/landing-assets/slide11.png"
                }}
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-12 mb-20 flex-row-reverse">
            <div className="flex-1">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4">Brand Consistency</h3>
              <p className="text-lg text-gray-600 mb-6">
                Define your brand once. Every presentation automatically follows your colors, fonts, and messaging.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Upload your brand guidelines once
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Automatic color and font application
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Consistent messaging across all slides
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <img
                src="/landing-assets/slide1.jpg"
                alt="Brand consistency"
                className="rounded-xl shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/landing-assets/slide1.png"
                }}
              />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-12">
            <div className="flex-1">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-lg text-gray-600 mb-6">
                From prompt to professional presentation in minutes. 80% more efficient than traditional tools.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Generate 20+ slides in under 5 minutes
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Instant revisions with AI chat
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Export to PowerPoint or PDF instantly
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <img
                src="/landing-assets/slide9.jpg"
                alt="Lightning fast"
                className="rounded-xl shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/landing-assets/slide9.png"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 py-20 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Professionals</h2>
            <p className="text-xl text-purple-100">Join thousands of teams who trust SlideCoffee for their most important presentations</p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-lg">
                "SlideCoffee has made me something of a campus hero! It saves me hours of labor that I now channel into more meaningful work."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center text-2xl">
                  👩‍🏫
                </div>
                <div>
                  <div className="font-semibold">Christina Salazar</div>
                  <div className="text-sm text-purple-200">English Language Development Teacher</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-lg">
                "This product rocks! I no longer use Google Slides — it just seems so prehistoric compared to SlideCoffee!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center text-2xl">
                  🎨
                </div>
                <div>
                  <div className="font-semibold">Denise Penn</div>
                  <div className="text-sm text-purple-200">Social Media Content Creator</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-lg">
                "SlideCoffee has been a game-changer for internal collaboration, eliminating our startup's reliance on traditional slides."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center text-2xl">
                  👨‍💼
                </div>
                <div>
                  <div className="font-semibold">Jeff Shuck</div>
                  <div className="text-sm text-purple-200">Principal Consultant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Start free, upgrade when you need more brands</p>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter */}
          <div className="border-2 border-gray-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <p className="text-gray-600 mb-6">Perfect for individuals</p>
            <div className="mb-6">
              <span className="text-5xl font-bold">Free</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>1 brand</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>AI-powered generation</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Export to PowerPoint</span>
              </li>
            </ul>
            <button className="w-full border-2 border-gray-300 px-6 py-3 rounded-lg hover:border-gray-400 transition-colors font-semibold">
              Get Started
            </button>
          </div>

          {/* Professional */}
          <div className="border-2 border-purple-600 rounded-xl p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Professional</h3>
            <p className="text-gray-600 mb-6">For growing teams</p>
            <div className="mb-6">
              <span className="text-5xl font-bold">$29</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>5 brands</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Priority AI generation</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Custom templates</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Priority support</span>
              </li>
            </ul>
            <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
              Start Free Trial
            </button>
          </div>

          {/* Enterprise */}
          <div className="border-2 border-gray-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <p className="text-gray-600 mb-6">For large organizations</p>
            <div className="mb-6">
              <span className="text-5xl font-bold">$99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited brands</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Team collaboration</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Custom AI training</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>API access</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Dedicated support</span>
              </li>
            </ul>
            <button className="w-full border-2 border-gray-300 px-6 py-3 rounded-lg hover:border-gray-400 transition-colors font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 py-20 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to build better presentations?</h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join professionals who trust SlideCoffee for board meetings, investor pitches, and executive presentations.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-white text-purple-600 px-10 py-4 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="/inspiration" className="hover:text-white transition-colors">Inspiration</a></li>
                <li><a href="/insights" className="hover:text-white transition-colors">Insights</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/team" className="hover:text-white transition-colors">Team</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help</a></li>
                <li><a href="/community" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact us</a></li>
              </ul>
            </div>
            
            {/* Social */}
            <div>
              <h3 className="text-white font-semibold mb-4">Social</h3>
              <ul className="space-y-2">
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a></li>
                <li><a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">X</a></li>
              </ul>
            </div>
            
            {/* Privacy */}
            <div>
              <h3 className="text-white font-semibold mb-4">Privacy</h3>
              <ul className="space-y-2">
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/cookie-notice" className="hover:text-white transition-colors">Cookie Notice</a></li>
                <li><a href="/cookie-preferences" className="hover:text-white transition-colors">Cookie Preferences</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coffee className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold text-white">SlideCoffee</span>
            </div>
            <p>© 2024 SlideCoffee. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scrolling Banner CSS */}
      <style>{`
        .scrolling-banner {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .scrolling-content {
          display: flex;
          animation: scroll 30s linear infinite;
        }

        .scrolling-content:hover {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

