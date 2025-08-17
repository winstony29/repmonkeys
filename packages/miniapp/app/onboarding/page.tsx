'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { wellnessNFTAbi } from '@/lib/contracts'
import { Heart, Target, Sparkles, CheckCircle } from 'lucide-react'

const wellnessGoals = [
  'Lose weight',
  'Build muscle',
  'Improve cardiovascular health',
  'Better sleep',
  'Reduce stress',
  'Increase energy',
  'Better nutrition',
  'Mental wellness',
  'Flexibility and mobility',
  'Overall fitness',
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [goals, setGoals] = useState<string[]>([])
  const [currentGoal, setCurrentGoal] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { address } = useAccount()
  const router = useRouter()

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const addGoal = () => {
    if (currentGoal.trim() && !goals.includes(currentGoal.trim())) {
      setGoals([...goals, currentGoal.trim()])
      setCurrentGoal('')
    }
  }

  const removeGoal = (goalToRemove: string) => {
    setGoals(goals.filter(goal => goal !== goalToRemove))
  }

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      removeGoal(goal)
    } else {
      setGoals([...goals, goal])
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && goals.length === 0) {
      alert('Please select at least one wellness goal to continue.')
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const createProfile = async () => {
    if (!address) {
      alert('Wallet not connected')
      return
    }

    if (goals.length === 0) {
      alert('Please select at least one wellness goal.')
      return
    }

    setIsCreating(true)

    try {
      // Mock IPFS URI generation (Sogni AI artwork)
      const mockIpfsUri = `ipfs://QmMockSogniAIArtwork${Date.now()}`

      // Call the safeMint function on the WellnessNFT contract
      writeContract({
        address: process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS as `0x${string}`,
        abi: wellnessNFTAbi,
        functionName: 'safeMint',
        args: [address, mockIpfsUri],
      })
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile. Please try again.')
      setIsCreating(false)
    }
  }

  // Redirect to main page after successful minting
  if (isSuccess) {
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-12 w-12 text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What are your wellness goals?
        </h2>
        <p className="text-gray-600">
          Select the areas you'd like to focus on. You can select multiple goals.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {wellnessGoals.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleGoal(goal)}
            className={`p-3 rounded-lg border-2 transition-all ${
              goals.includes(goal)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {goal}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Add custom goal:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentGoal}
            onChange={(e) => setCurrentGoal(e.target.value)}
            placeholder="Enter your custom goal..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={addGoal}
            className="px-4 py-2 bg-wellness-500 text-white rounded-lg hover:bg-wellness-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Selected goals:</h4>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => (
              <span
                key={goal}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {goal}
                <button
                  onClick={() => removeGoal(goal)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="h-12 w-12 text-wellness-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Profile
        </h2>
        <p className="text-gray-600">
          Let's review what we've captured before creating your wellness profile.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">Wallet Address</h4>
          <p className="text-sm text-gray-600 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Wellness Goals</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {goals.map((goal, index) => (
              <li key={index}>• {goal}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">What happens next?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• AI will generate your personalized wellness profile</li>
            <li>• Sogni AI will create unique artwork for your NFT</li>
            <li>• Your profile will be minted on the Base blockchain</li>
            <li>• You'll receive your first $WELL tokens</li>
          </ul>
        </div>
      </div>
    </div>
  )

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-wellness-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Created Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your wellness profile NFT has been minted on Base.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Profile
          </h1>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Step {currentStep} of 2
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        {/* Footer */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
          )}

          {currentStep < 2 ? (
            <button
              onClick={nextStep}
              disabled={goals.length === 0}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={createProfile}
              disabled={isCreating || isConfirming}
              className="flex-1 px-6 py-3 bg-wellness-500 text-white rounded-lg hover:bg-wellness-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating || isConfirming ? 'Creating Profile...' : 'Create My Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

