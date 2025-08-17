'use client'

import { useState, useEffect } from 'react'
import { ConnectWallet } from '@coinbase/onchainkit'
import { useOnchainAddress } from '@coinbase/onchainkit'
import { useReadContract } from 'wagmi'
import { useRouter } from 'next/navigation'
import UserProfile from '@/components/UserProfile'
import { wellnessNFTAbi } from '@/lib/contracts'

export default function Home() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const address = useOnchainAddress()
  const router = useRouter()

  // Check if user has a WellnessNFT profile
  const { data: hasProfileData } = useReadContract({
    address: process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS as `0x${string}`,
    abi: wellnessNFTAbi,
    functionName: 'userHasProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  useEffect(() => {
    if (address && hasProfileData !== undefined) {
      setHasProfile(hasProfileData)
      setIsLoading(false)
    } else if (!address) {
      setIsLoading(false)
    }
  }, [address, hasProfileData])

  // Redirect to onboarding if user doesn't have a profile
  useEffect(() => {
    if (hasProfile === false && address) {
      router.push('/onboarding')
    }
  }, [hasProfile, address, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Wellness App
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet to start your wellness journey on Base
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ConnectWallet />
            
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
        </div>
      </div>
    )
  }

  if (hasProfile) {
    return <UserProfile />
  }

  return null
}

