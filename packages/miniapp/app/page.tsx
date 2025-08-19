'use client'

import { useState } from 'react'

export default function Home() {
  const [showApp, setShowApp] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const startJourney = () => {
    setShowApp(true)
  }

  const connectWallet = () => {
    setIsConnected(true)
  }

  if (showApp) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">WellSpace</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isConnected ? (
                <button 
                  onClick={connectWallet}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                  ✓ Connected
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* App Dashboard */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white text-2xl">🌟</span>
                </div>
                <h3 className="font-semibold text-gray-900">Your Wellness Profile</h3>
                <p className="text-sm text-gray-600 mt-1">Level 3 • Wellness Warrior</p>
              </div>
              
              <div className="space-y-3">
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

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Focus */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Focus</h2>
                <div className="grid gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600">✓</span>
                      </div>
                      <span className="font-medium text-gray-900">Morning Meditation</span>
                    </div>
                    <p className="text-sm text-gray-600">15 minutes • Completed</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">🎯</span>
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
                  <span className="text-purple-600 text-xl">🧠</span>
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
                    <span className="text-yellow-600 text-xl">🏆</span>
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
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">WellSpace</span>
          </div>

          <button 
            onClick={startJourney}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Get started →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span>✨</span>
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
              className="bg-gray-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors text-lg"
            >
              Start your journey →
            </button>
            
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors text-lg">
              ▶ Watch demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools to track, improve, and reward your healthy habits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600">
                Get personalized recommendations based on your habits, sleep patterns, and wellness goals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">💖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Wellness NFTs</h3>
              <p className="text-gray-600">
                Mint unique NFTs that represent your wellness journey and unlock exclusive content.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn $WELL Tokens</h3>
              <p className="text-gray-600">
                Complete wellness activities and earn tokens that can be used for rewards and perks.
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
          
          <button 
            onClick={startJourney}
            className="bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors text-lg"
          >
            Start for free →
          </button>
          
          <p className="text-gray-400 text-sm mt-6">
            No credit card required • Connect wallet optionally
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
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

