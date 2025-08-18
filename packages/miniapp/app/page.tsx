'use client'

import { useState } from 'react'
import { Wallet, Heart, Trophy, Zap, Shield } from 'lucide-react'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  const connectWallet = () => {
    // Simulate wallet connection
    setIsConnected(true)
    setTimeout(() => setShowDemo(true), 1000)
  }

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🌟 Wellness Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome to your personalized wellness journey on Base!
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 col-span-full lg:col-span-1">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your Wellness NFT
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Level 3 Wellness Warrior
                </p>
                <div className="bg-green-100 text-green-800 py-2 px-4 rounded-full text-sm font-medium">
                  Connected to Base
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Achievements
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Goals</span>
                  <span className="font-semibold text-green-600">5/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Streak</span>
                  <span className="font-semibold text-blue-600">12 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-semibold text-purple-600">2,840</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-8 h-8 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  $WELL Tokens
                </h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  156.2
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Tokens earned this month
                </p>
                <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors w-full">
                  Claim Rewards
                </button>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl shadow-xl p-6 col-span-full lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Today's Wellness Activities
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-semibold text-sm">✓</span>
                    </div>
                    <span className="font-medium text-gray-900">Morning Meditation</span>
                  </div>
                  <p className="text-gray-600 text-sm">15 minutes completed</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">⚡</span>
                    </div>
                    <span className="font-medium text-gray-900">Daily Exercise</span>
                  </div>
                  <p className="text-gray-600 text-sm">45 minutes remaining</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold text-sm">📚</span>
                    </div>
                    <span className="font-medium text-gray-900">Wellness Reading</span>
                  </div>
                  <p className="text-gray-600 text-sm">New article available</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600 font-semibold text-sm">🍎</span>
                    </div>
                    <span className="font-medium text-gray-900">Nutrition Goal</span>
                  </div>
                  <p className="text-gray-600 text-sm">Log your meals</p>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-indigo-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Recommendations
                </h3>
              </div>
              <div className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-sm text-indigo-800">
                    "Based on your sleep pattern, try a 10-minute wind-down routine."
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    "You're close to your step goal! A 15-minute walk will get you there."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              🌟 This is a demo interface - wallet integration coming soon!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌟 Wellness App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Connect your wallet to start your wellness journey on Base
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <Wallet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            {isConnected ? (
              <div className="text-green-600 font-semibold">
                ✓ Wallet Connected! Loading your dashboard...
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Connect Wallet (Demo)
              </button>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What you'll get:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Personalized wellness profile NFT</li>
              <li>• AI-powered wellness recommendations</li>
              <li>• Earn $WELL tokens for healthy habits</li>
              <li>• Access to exclusive wellness content</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Built on Base • Powered by OnchainKit
          </p>
        </div>
      </div>
    </div>
  )
}

