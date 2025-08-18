'use client'

import { useState } from 'react'
import { 
  ArrowRight, 
  Heart, 
  Brain, 
  Trophy, 
  Zap, 
  Shield, 
  Star, 
  CheckCircle, 
  Smartphone,
  Target,
  Users,
  Sparkles,
  Play,
  ChevronRight,
  Wallet
} from 'lucide-react'

export default function Home() {
  const [showApp, setShowApp] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const startJourney = () => {
    setShowApp(true)
  }

  const connectWallet = () => {
    setIsConnected(true)
    // You can add OnchainKit wallet connection here later
  }

  if (showApp) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">WellSpace</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isConnected ? (
                <button 
                  onClick={connectWallet}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connected</span>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main App Interface */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Your Wellness Profile</h3>
                  <p className="text-sm text-gray-600 mt-1">Level 3 • Wellness Warrior</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Daily Streak</span>
                    <span className="font-semibold text-blue-600">12 days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">$WELL Tokens</span>
                    <span className="font-semibold text-green-600">156.2</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Total Score</span>
                    <span className="font-semibold text-purple-600">2,840</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Today's Focus */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Focus</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900">Morning Meditation</span>
                    </div>
                    <p className="text-sm text-gray-600">15 minutes • Completed</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">Exercise Goal</span>
                    </div>
                    <p className="text-sm text-gray-600">30 min remaining</p>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">AI Wellness Insights</h2>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-purple-800 text-sm">
                    "Based on your sleep pattern, you might benefit from reducing screen time 1 hour before bed. This could improve your sleep quality by 23%."
                  </p>
                </div>
              </div>

              {/* Rewards */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Available Rewards</h2>
                  </div>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    View all
                  </button>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Weekly Challenge Complete!</h3>
                      <p className="text-sm text-gray-600 mt-1">Claim your 25 $WELL tokens</p>
                    </div>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors">
                      Claim
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">WellSpace</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm font-medium">How it works</a>
              <a href="#community" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Community</a>
            </div>

            <button 
              onClick={startJourney}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Built on Base • Powered by AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your personal wellness
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              journey, reimagined
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            Track habits, earn rewards, and get AI-powered insights to transform your health. 
            No wallet required to start – connect when you're ready for Web3 features.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={startJourney}
              className="bg-gray-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2 text-lg"
            >
              <span>Start your journey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2 text-lg">
              <Play className="w-5 h-5" />
              <span>Watch demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools to track, improve, and reward your healthy habits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized recommendations based on your habits, sleep patterns, and wellness goals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Wellness NFTs</h3>
              <p className="text-gray-600 leading-relaxed">
                Mint unique NFTs that represent your wellness journey and unlock exclusive content.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn $WELL Tokens</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete wellness activities and earn tokens that can be used for rewards and perks.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Goal Setting</h3>
              <p className="text-gray-600 leading-relaxed">
                Set achievable wellness goals with AI assistance and track your progress over time.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Challenges</h3>
              <p className="text-gray-600 leading-relaxed">
                Join wellness challenges with friends and the community to stay motivated.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile-First Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Beautiful, intuitive interface designed for mobile with seamless wallet integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How WellSpace works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start your wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Free</h3>
              <p className="text-gray-600">
                Begin tracking your wellness habits immediately. No wallet or crypto knowledge required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Track & Improve</h3>
              <p className="text-gray-600">
                Log activities, set goals, and receive AI-powered insights to optimize your wellness.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn Rewards</h3>
              <p className="text-gray-600">
                Connect your wallet when ready to earn tokens, mint NFTs, and unlock Web3 features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your wellness?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of users who are already on their wellness journey
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={startJourney}
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2 text-lg"
            >
              <span>Start for free</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mt-6">
            No credit card required • Connect wallet optionally
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">WellSpace</span>
          </div>
          
          <div className="text-center text-gray-600 space-y-2">
            <p>Built with ❤️ for the wellness community</p>
            <p className="text-sm">Powered by Base • OnchainKit • AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

