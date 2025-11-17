import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Sparkles, Zap, Target, Check, ArrowRight, Users, Clock, TrendingUp, Star, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading } = useSupabaseAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Rotate slide examples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render landing page if redirecting
  if (user) {
    return null;
  }

  const handleSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const slides = [
    "/slides-example-1.webp",
    "/slides-example-2.webp",
    "/slides-example-3.jpg",
    "/slides-example-4.webp"
  ];

  const testimonials = [
    {
      quote: "SlideCoffee has made me something of a campus hero! It saves me hours of labor that I now channel into more meaningful work.",
      author: "Christina Salazar",
      role: "English Language Development Teacher",
      avatar: "👩‍🏫"
    },
    {
      quote: "This product rocks! I no longer use Google Slides — it just seems so prehistoric compared to SlideCoffee!",
      author: "Denise Penn",
      role: "Social Media Content Creator",
      avatar: "🎨"
    },
    {
      quote: "SlideCoffee has been a game-changer for internal collaboration, eliminating our startup's reliance on traditional slides.",
      author: "Jeff Shuck",
      role: "Principal Consultant",
      avatar: "👨‍💼"
    }
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Presentations Created" },
    { icon: Clock, value: "95%", label: "Time Saved" },
    { icon: TrendingUp, value: "4.9/5", label: "User Rating" },
    { icon: Star, value: "500+", label: "Happy Teams" }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Watch AI research, plan, and build your presentation in real-time. No more blank page syndrome.",
      image: "/slides-example-1.webp"
    },
    {
      icon: Target,
      title: "Brand Consistency",
      description: "Define your brand once. Every presentation automatically follows your colors, fonts, and messaging.",
      image: "/slides-example-2.webp"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "From prompt to professional presentation in minutes. 80% more efficient than traditional tools.",
      image: "/slides-example-3.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            )}
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleSignIn}>
              Sign In
            </Button>
            <Button onClick={handleSignUp} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Presentation Builder
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Build presentations that{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                actually matter
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Stop wasting time on slides. Let AI do the research, planning, and design. 
              You focus on the message.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              No credit card required • Free trial includes 1 brand
            </p>
          </div>

          {/* Animated Slide Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={slides[currentSlide]} 
                  alt="Presentation Example"
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
              </div>
              <div className="flex gap-2 mt-4 justify-center">
                {slides.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <stat.icon className="w-8 h-8 mx-auto text-blue-600" />
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From idea to professional presentation in three simple steps
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                i % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`space-y-6 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold">{feature.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <Button size="lg" variant="outline">
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="relative rounded-2xl shadow-2xl w-full transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Loved by Professionals
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of teams who trust SlideCoffee for their most important presentations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 space-y-6 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-blue-100">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more brands
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter */}
          <div className="border-2 rounded-2xl p-8 space-y-6 hover:shadow-xl transition-shadow">
            <div>
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-600">Perfect for individuals</p>
            </div>
            <div className="text-5xl font-bold">Free</div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>1 brand</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>AI-powered generation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Export to PowerPoint</span>
              </li>
            </ul>
            <Button className="w-full" variant="outline" onClick={handleSignUp}>
              Get Started Free
            </Button>
          </div>

          {/* Professional */}
          <div className="border-2 border-blue-600 rounded-2xl p-8 space-y-6 relative shadow-xl transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-gray-600">For growing teams</p>
            </div>
            <div>
              <span className="text-5xl font-bold">$29</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>5 brands</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Priority AI generation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Custom templates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={handleSignUp}>
              Start Free Trial
            </Button>
          </div>

          {/* Enterprise */}
          <div className="border-2 rounded-2xl p-8 space-y-6 hover:shadow-xl transition-shadow">
            <div>
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-gray-600">For large organizations</p>
            </div>
            <div className="text-5xl font-bold">$99</div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Unlimited brands</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Team collaboration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Custom AI training</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>API access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <span>Dedicated support</span>
              </li>
            </ul>
            <Button className="w-full" variant="outline" onClick={handleSignUp}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to build better presentations?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join professionals who trust SlideCoffee for board meetings, investor pitches, and executive presentations.
          </p>
          <Button 
            size="lg" 
            onClick={handleSignUp}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-6 w-6" />
              )}
              <span className="font-semibold text-white">{APP_TITLE}</span>
            </div>
            <div className="text-sm">
              © 2025 {APP_TITLE}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode={authMode}
      />
    </div>
  );
}

