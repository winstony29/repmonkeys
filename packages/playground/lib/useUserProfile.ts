'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, userProfileAbi } from './contracts';

export interface UserProfile {
  hasOnboarded: boolean;
  goals: string[];
  preferredImageTheme: string;
  customPrompt: string;
  streakCount: number;
  totalScore: number;
  createdAt: number;
  lastActive: number;
  profileImageUrl: string;
}

export function useUserProfile() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read user profile from contract
  const { data: profileData, refetch: refetchProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_PROFILE,
    abi: userProfileAbi,
    functionName: 'getUserProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!CONTRACT_ADDRESSES.USER_PROFILE,
    },
  });

  // Check if user has onboarded
  const { data: hasOnboarded } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_PROFILE,
    abi: userProfileAbi,
    functionName: 'hasUserOnboarded',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!CONTRACT_ADDRESSES.USER_PROFILE,
    },
  });

  // Write contract hooks
  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Parse profile data
  const userProfile: UserProfile | null = profileData ? {
    hasOnboarded: profileData[0],
    goals: profileData[1],
    preferredImageTheme: profileData[2],
    customPrompt: profileData[3],
    streakCount: Number(profileData[4]),
    totalScore: Number(profileData[5]),
    createdAt: Number(profileData[6]),
    lastActive: Number(profileData[7]),
    profileImageUrl: profileData[8],
  } : null;

  // Create or update profile
  const createProfile = async (
    goals: string[],
    imageTheme: string,
    customPrompt: string,
    profileImageUrl: string
  ) => {
    if (!address || !CONTRACT_ADDRESSES.USER_PROFILE) {
      throw new Error('Wallet not connected or contract not deployed');
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.USER_PROFILE,
        abi: userProfileAbi,
        functionName: 'createProfile',
        args: [goals, imageTheme, customPrompt, profileImageUrl],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      setIsLoading(false);
    }
  };

  // Update goals
  const updateGoals = async (newGoals: string[]) => {
    if (!address || !CONTRACT_ADDRESSES.USER_PROFILE) {
      throw new Error('Wallet not connected or contract not deployed');
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.USER_PROFILE,
        abi: userProfileAbi,
        functionName: 'updateGoals',
        args: [newGoals],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goals');
      setIsLoading(false);
    }
  };

  // Update streak
  const updateStreak = async (newStreak: number) => {
    if (!address || !CONTRACT_ADDRESSES.USER_PROFILE) {
      throw new Error('Wallet not connected or contract not deployed');
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.USER_PROFILE,
        abi: userProfileAbi,
        functionName: 'updateStreak',
        args: [BigInt(newStreak)],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update streak');
      setIsLoading(false);
    }
  };

  // Update score
  const updateScore = async (newScore: number) => {
    if (!address || !CONTRACT_ADDRESSES.USER_PROFILE) {
      throw new Error('Wallet not connected or contract not deployed');
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.USER_PROFILE,
        abi: userProfileAbi,
        functionName: 'updateScore',
        args: [BigInt(newScore)],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update score');
      setIsLoading(false);
    }
  };

  // Update profile image
  const updateProfileImage = async (newImageUrl: string) => {
    if (!address || !CONTRACT_ADDRESSES.USER_PROFILE) {
      throw new Error('Wallet not connected or contract not deployed');
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.USER_PROFILE,
        abi: userProfileAbi,
        functionName: 'updateProfileImage',
        args: [newImageUrl],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile image');
      setIsLoading(false);
    }
  };

  // Update activity (call this periodically when user is active)
  const updateActivity = async () => {
    if (!address || !CONTRACT_ADDRESSES.USER_PROFILE) return;

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.USER_PROFILE,
        abi: userProfileAbi,
        functionName: 'updateActivity',
      });
    } catch (err) {
      console.warn('Failed to update activity:', err);
    }
  };

  // Effect to handle transaction completion
  useEffect(() => {
    if (isSuccess) {
      setIsLoading(false);
      refetchProfile();
    }
  }, [isSuccess, refetchProfile]);

  // Effect to handle confirmation loading
  useEffect(() => {
    setIsLoading(isConfirming);
  }, [isConfirming]);

  return {
    // Data
    userProfile,
    hasOnboarded: Boolean(hasOnboarded),
    isConnected,
    address,
    
    // Loading states
    isLoading,
    isConfirming,
    
    // Error handling
    error,
    
    // Functions
    createProfile,
    updateGoals,
    updateStreak,
    updateScore,
    updateProfileImage,
    updateActivity,
    refetchProfile,
    
    // Contract availability
    isContractDeployed: !!CONTRACT_ADDRESSES.USER_PROFILE,
  };
}
