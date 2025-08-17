'use client'

import { useState } from 'react'
import { Address, Avatar } from '@coinbase/onchainkit'
import { useOnchainAddress } from '@coinbase/onchainkit'
import { useBalance, useReadContract } from 'wagmi'
import { wellnessNFTAbi, wellTokenAbi } from '@/lib/contracts'
import { Heart, Trophy, MessageCircle, Activity, Target } from 'lucide-react'

export default function UserProfile() {
  const [wellnessPrompt, setWellnessPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const address = useOnchainAddress()

  // Get user's WellnessNFT token ID
  const { data: tokenId } = useReadContract({
    address: process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS as `0x${string}`,
    abi: wellnessNFTAbi,
    functionName: 'getUserTokenId',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Get user's $WELL token balance
  const { data: wellBalance } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_WELL_TOKEN_ADDRESS as `0x${string}`,
    query: {
      enabled: !!address && !!process.env.NEXT_PUBLIC_WELL_TOKEN_ADDRESS,
    },
  })

  // Get NFT metadata URI
  const { data: tokenUri } = useReadContract({
    address: process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS as `0x${string}`,
    abi: wellnessNFTAbi,
    functionName: 'tokenURI',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })

  const askWellnessQuestion = async () => {
    if (!wellnessPrompt.trim()) {
      alert('Please enter a wellness question')
      return
    }

    setIsLoading(true)

    try {
      // Mock API call to AI service
      console.log('Asking wellness question:', wellnessPrompt)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock AI response based on prompt
      let mockResponse
      if (wellnessPrompt.toLowerCase().includes('workout')) {
        mockResponse = {
          type: 'workout',
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 15, duration: '2 minutes' },
            { name: 'Squats', sets: 3, reps: 20, duration: '2 minutes' },
            { name: 'Plank', sets: 3, reps: 1, duration: '1 minute' },
          ],
          totalDuration: '15 minutes',
          difficulty: 'intermediate'
        }
      } else if (wellnessPrompt.toLowerCase().includes('recipe')) {
        mockResponse = {
          type: 'recipe',
          name: 'Healthy Buddha Bowl',
          ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Cherry tomatoes'],
          prepTime: '10 minutes',
          cookTime: '15 minutes'
        }
      } else {
        mockResponse = {
          type: 'general',
          message: 'I\'m here to help with your wellness journey! I can assist with workout plans, healthy recipes, meditation guidance, and sleep tips. What specific area would you like to focus on today?'
        }
      }

      setAiResponse(mockResponse)
    } catch (error) {
      console.error('Error getting AI response:', error)
      alert('Failed to get AI response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderAiResponse = () => {
    if (!aiResponse) return null

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary-500" />
          AI Wellness Assistant
        </h3>
        
        {aiResponse.type === 'workout' && (
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="font-semibold text-primary-700 mb-2">Your Workout Plan:</h4>
              <p className="text-sm text-primary-600">
                Duration: {aiResponse.totalDuration} | Difficulty: {aiResponse.difficulty}
              </p>
            </div>
            <div className="space-y-3">
              {aiResponse.exercises.map((exercise: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{exercise.name}</span>
                  <span className="text-sm text-gray-600">
                    {exercise.sets} sets × {exercise.reps} reps
                    {exercise.duration && ` (${exercise.duration})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {aiResponse.type === 'recipe' && (
          <div className="space-y-4">
            <div className="bg-wellness-50 rounded-lg p-4">
              <h4 className="font-semibold text-wellness-700 mb-2">Recipe: {aiResponse.name}</h4>
              <p className="text-sm text-wellness-600">
                Prep: {aiResponse.prepTime} | Cook: {aiResponse.cookTime}
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Ingredients:</h5>
              <ul className="space-y-1">
                {aiResponse.ingredients.map((ingredient: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">• {ingredient}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {aiResponse.type === 'general' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-2">Wellness Guidance:</h4>
            <p className="text-blue-600">{aiResponse.message}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wellness Dashboard</h1>
                <p className="text-gray-600">Your personalized health journey on Base</p>
              </div>
            </div>
            <div className="text-right">
              <Address />
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <Avatar />
              <p className="text-sm text-primary-600 mt-2">Profile NFT</p>
              <p className="text-xs text-primary-500">Token ID: {tokenId?.toString() || 'Loading...'}</p>
            </div>

            <div className="bg-wellness-50 rounded-lg p-4 text-center">
              <Trophy className="h-8 w-8 text-wellness-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-wellness-700">
                {wellBalance ? parseFloat(wellBalance.formatted).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-wellness-600">$WELL Tokens</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Target className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-700">Active</p>
              <p className="text-sm text-gray-600">Profile Status</p>
            </div>
          </div>
        </div>

        {/* AI Wellness Assistant */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="h-6 w-6 text-primary-500" />
            <h2 className="text-xl font-bold text-gray-900">AI Wellness Assistant</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Ask me anything about wellness, workouts, nutrition, or mental health
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to know?
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Examples: "Give me a workout plan", "Healthy recipe ideas", "Sleep tips"
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={wellnessPrompt}
                onChange={(e) => setWellnessPrompt(e.target.value)}
                placeholder="Ask your wellness question..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={askWellnessQuestion}
                disabled={isLoading}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '...' : 'Ask'}
              </button>
            </div>
          </div>

          {renderAiResponse()}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="h-6 w-6 text-wellness-500" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <Activity className="h-6 w-6 text-primary-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Track Workout</span>
            </button>
            
            <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <Heart className="h-6 w-6 text-wellness-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Log Nutrition</span>
            </button>
            
            <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <Target className="h-6 w-6 text-primary-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Meditation</span>
            </button>
            
            <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <Trophy className="h-6 w-6 text-wellness-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Sleep Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

