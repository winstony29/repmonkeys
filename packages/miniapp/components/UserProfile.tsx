'use client'

import { useState } from 'react'
import { Address } from '@coinbase/onchainkit/identity'
import { Avatar } from '@coinbase/onchainkit/identity'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import { wellnessNFTAbi, wellTokenAbi } from '@/lib/contracts'
import { Heart, Trophy, MessageCircle, Activity, Target } from 'lucide-react'

export default function UserProfile() {
  const [wellnessPrompt, setWellnessPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAccount()

  const [sleepDuration, setSleepDuration] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [fitnessActivity, setFitnessActivity] = useState('');
  const [fitnessDuration, setFitnessDuration] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

  const normalizeActivityType = (value: string) => {
    const v = value.trim().toLowerCase();
    if (v.includes('run')) return 'run';
    if (v.includes('walk')) return 'walk';
    if (v.includes('yoga')) return 'yoga';
    if (v.includes('cycle') || v.includes('bike')) return 'cycle';
    if (v.includes('swim')) return 'swim';
    if (v.includes('gym') || v.includes('lift') || v.includes('strength')) return 'gym';
    return 'walk';
  };

  const handleLogActivity = async () => {
    if (!address) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!sleepDuration || !fitnessActivity || !fitnessDuration) {
      alert('Please fill out all fields to log your activity.');
      return;
    }
    setIsLogging(true);
    try {
      const payload = {
        walletAddress: address,
        sleepDuration: parseInt(sleepDuration, 10),
        // Backend expects 0-100; slider is 1-5 → scale by 20
        sleepQuality: Math.max(0, Math.min(100, sleepQuality * 20)),
        fitnessActivityType: normalizeActivityType(fitnessActivity),
        fitnessDuration: parseInt(fitnessDuration, 10),
      };

      const res = await fetch(`${apiBaseUrl}/wellness/log-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to log activity');
      }

      // Reset form
      setSleepDuration('');
      setSleepQuality(3);
      setFitnessActivity('');
      setFitnessDuration('');

      alert('Activity logged successfully');
    } catch (error: any) {
      console.error('Failed to log activity:', error);
      alert(error?.message || 'There was an error logging your activity. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

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
        {/* ... (existing header and profile info) */}

        {/* --- NEW: Wellness Log Section --- */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="h-6 w-6 text-wellness-500" />
            Log Your Daily Wellness
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Duration (hours)
              </label>
              <input
                type="number"
                value={sleepDuration}
                onChange={(e) => setSleepDuration(e.target.value)}
                placeholder="e.g., 8"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Activity
              </label>
              <input
                type="text"
                value={fitnessActivity}
                onChange={(e) => setFitnessActivity(e.target.value)}
                placeholder="e.g., Running, Yoga"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Duration (minutes)
              </label>
              <input
                type="number"
                value={fitnessDuration}
                onChange={(e) => setFitnessDuration(e.target.value)}
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Quality (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <button
            onClick={handleLogActivity}
            disabled={isLogging}
            className="mt-6 w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300"
          >
            {isLogging ? 'Logging...' : 'Log Activity'}
          </button>
        </div>

        {/* ... (existing AI assistant and quick actions) */}
      </div>
    </div>
  )
}
