'use client';

import { useState, useEffect, createContext, useContext } from 'react';


import {
  Avatar,
  Name,
  Identity,
  EthBalance,
  Address,
} from '@coinbase/onchainkit/identity';
import {
  Wallet,
  ConnectWallet,
} from '@coinbase/onchainkit/wallet';
import { FundButton } from '@coinbase/onchainkit/fund';
import { cn } from '@/lib/utils';
import { useAccount, useReadContract, useBalance, useWriteContract, useChainId } from 'wagmi';
import { wellnessNFTAbi, wellTokenAbi, userProfileAbi, wellnessTrackerAbi, CONTRACT_ADDRESSES, formatTokenAmount } from '@/lib/contracts';
import { useWellnessAPI } from '@/lib/api';
import { useSogniGeneration } from '@/lib/sogni';

// Theme Context
const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleTheme: () => void;
}>({
  isDarkMode: false,
  toggleTheme: () => {},
});

const useTheme = () => useContext(ThemeContext);

// Theme Provider Component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document and save preference
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme Toggle Button Component
function ThemeToggleButton() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg border-2 transition-all duration-300 hover:scale-110",
        isDarkMode 
          ? "bg-white border-gray-200 text-gray-900 hover:bg-gray-100" 
          : "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
      )}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

function LandingPageContent() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'dashboard'>('landing');
  const [wellnessPrompt, setWellnessPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedImageTheme, setSelectedImageTheme] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(12);
  const [totalScore, setTotalScore] = useState(2840);
  
  // Network switching state
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [networkSwitchAttempts, setNetworkSwitchAttempts] = useState(0);
  
  // Activity tracking state
  const [activities, setActivities] = useState([
    { id: 1, type: 'workout', name: 'Completed workout', timestamp: Date.now() - 2 * 60 * 60 * 1000, reward: 50, completed: true },
    { id: 2, type: 'meditation', name: 'Logged meditation', timestamp: Date.now() - 5 * 60 * 60 * 1000, reward: 25, completed: true },
    { id: 3, type: 'nft', name: 'Minted new NFT', timestamp: Date.now() - 24 * 60 * 60 * 1000, reward: 'NFT', completed: true }
  ]);
  
  // Weekly goals state
  const [weeklyGoals, setWeeklyGoals] = useState({
    exercise: { current: 4, target: 5, completed: true },
    meditation: { current: 3, target: 7, completed: false },
    sleep: { current: 6, target: 7, completed: false }
  });
  
  // Meal logging state
  const [meals, setMeals] = useState([
    { id: 1, type: 'breakfast', name: 'Oatmeal with berries', calories: 320, timestamp: Date.now() - 4 * 60 * 60 * 1000 },
    { id: 2, type: 'lunch', name: 'Grilled chicken salad', calories: 450, timestamp: Date.now() - 1 * 60 * 60 * 1000 }
  ]);
  
  // Show meal logging modal
  const [showMealModal, setShowMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState({ type: 'breakfast', name: '', calories: '' });
  
  // User onboarding status
  const [isUserOnboarded, setIsUserOnboarded] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  const { isDarkMode } = useTheme();

  const { address } = useAccount();
  const chainId = useChainId();
  const { getWellnessAdvice } = useWellnessAPI();
  const { generateImage } = useSogniGeneration();
  const { writeContract, isPending: isWritingContract } = useWriteContract();
  
  // Contract interaction state
  const [contractError, setContractError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [contractHealth, setContractHealth] = useState<'healthy' | 'degraded' | 'unhealthy'>('healthy');
  const [wellnessDataInitialized, setWellnessDataInitialized] = useState(false);

  // Get user's WellnessNFT token ID
  const { data: tokenId } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_NFT,
    abi: wellnessNFTAbi,
    functionName: 'getUserTokenId',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get user's $WELL token balance
  const { data: wellBalance } = useBalance({
    address,
    token: CONTRACT_ADDRESSES.WELL_TOKEN,
  });

  const wellnessGoals = [
    'Weight Management',
    'Better Sleep',
    'Exercise Routine',
    'Stress Reduction',
    'Healthy Nutrition',
    'Mental Health',
    'Hydration',
    'Mindfulness'
  ];

  const imageThemes = [
    { id: 'nature', name: 'Nature & Zen', description: 'Peaceful natural landscapes' },
    { id: 'abstract', name: 'Abstract Art', description: 'Colorful abstract patterns' },
    { id: 'geometric', name: 'Geometric', description: 'Clean geometric designs' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant' },
    { id: 'cosmic', name: 'Cosmic', description: 'Space and galaxy themes' },
    { id: 'custom', name: 'Custom', description: 'Describe your own idea' }
  ];

  const toggleGoal = (goal: string) => {
    setUserGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const startJourney = () => {
    if (!address) {
      // If no wallet connected, this will be handled by showing ConnectWallet button
      return;
    }
    // If wallet connected, go to onboarding (will auto-redirect to dashboard if already onboarded)
    setCurrentView('onboarding');
    setOnboardingStep(1);
  };

  const getWellnessAdviceHandler = async () => {
    if (!wellnessPrompt.trim()) return;
    
    setIsLoadingAI(true);
    try {
      const response = await getWellnessAdvice(wellnessPrompt);
      setAiResponse(response);
    } catch (error) {
      console.error('Failed to get wellness advice:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateWellnessImage = async () => {
    setIsGeneratingImage(true);
    try {
      // Generate image using Sogni AI
      const imageUrl = await generateImage(selectedImageTheme, customPrompt, userGoals);
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error('Failed to generate image:', error);
      // Fallback to placeholder on error
      setGeneratedImageUrl('https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Generation+Failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const completeOnboarding = async () => {
    if (address) {
      try {
        // Save user profile to smart contract
        const success = await saveUserProfile(userGoals, selectedImageTheme, customPrompt);
        if (success) {
          setIsUserOnboarded(true);
          setCurrentView('dashboard');
          
          // Show success message
          console.log('✅ Onboarding completed successfully!');
        } else {
          console.error('Failed to save user profile to smart contract');
          // Still show dashboard but with warning
          setIsUserOnboarded(true);
          setCurrentView('dashboard');
          setContractError('Profile saved locally but smart contract transaction failed');
        }
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Fallback to dashboard anyway for now
        setIsUserOnboarded(true);
        setCurrentView('dashboard');
        setContractError('Profile saved locally due to smart contract error');
      }
    }
  };
  
  // Activity tracking functions
  const logActivity = async (type: string, name: string, reward: number) => {
    const newActivity = {
      id: Date.now(),
      type,
      name,
      timestamp: Date.now(),
      reward,
      completed: true
    };
    
    // Update local state immediately for UI responsiveness
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
    setTotalScore(prev => prev + reward);
    setStreakCount(prev => prev + 1);
    
    // Update weekly goals
    if (type === 'workout') {
      setWeeklyGoals(prev => ({
        ...prev,
        exercise: { ...prev.exercise, current: Math.min(prev.exercise.current + 1, prev.exercise.target) }
      }));
    } else if (type === 'meditation') {
      setWeeklyGoals(prev => ({
        ...prev,
        meditation: { ...prev.meditation, current: Math.min(prev.meditation.current + 1, prev.meditation.target) }
      }));
    }
    
    // Save to smart contract if available
    if (address && hasWellnessData) {
      // Force network switch to Base Sepolia if not already connected
      if (chainId !== 84532) {
        console.log('🔄 Switching to Base Sepolia testnet for activity logging...');
        try {
          await (window.ethereum as any).request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }], // 84532 in hex
          });
          console.log('✅ Switched to Base Sepolia testnet');
          
          // Wait a moment for the switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if switch was successful
          const newChainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
          if (newChainId !== '0x14a34') {
            console.log('⚠️ Network switch failed, using localStorage only');
            // Fallback to localStorage
            if (address) {
              const localStorageKey = `wellspace_user_${address}`;
              const existingData = localStorage.getItem(localStorageKey);
              if (existingData) {
                try {
                  const userData = JSON.parse(existingData);
                  userData.streakCount = streakCount + 1;
                  userData.totalScore = totalScore + reward;
                  userData.activities = [newActivity, ...(userData.activities || []).slice(0, 9)];
                  userData.weeklyGoals = weeklyGoals;
                  localStorage.setItem(localStorageKey, JSON.stringify(userData));
                } catch (error) {
                  console.error('Error updating localStorage:', error);
                }
              }
            }
            return;
          }
        } catch (error: any) {
          console.error('Error switching to Base Sepolia:', error);
          if (error.code === 4902) {
            // Chain not added, add it first
            await addBaseSepoliaNetwork();
            // Try switching again
            try {
              await (window.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x14a34' }],
              });
            } catch (switchError) {
              console.log('⚠️ Network switch failed after adding chain, using localStorage only');
              // Fallback to localStorage
              if (address) {
                const localStorageKey = `wellspace_user_${address}`;
                const existingData = localStorage.getItem(localStorageKey);
                if (existingData) {
                  try {
                    const userData = JSON.parse(existingData);
                    userData.streakCount = streakCount + 1;
                    userData.totalScore = totalScore + reward;
                    userData.activities = [newActivity, ...(userData.activities || []).slice(0, 9)];
                    userData.weeklyGoals = weeklyGoals;
                    localStorage.setItem(localStorageKey, JSON.stringify(userData));
                  } catch (error) {
                    console.error('Error updating localStorage:', error);
                  }
                }
              }
              return;
            }
          } else {
            console.log('⚠️ Network switch failed, using localStorage only');
            // Fallback to localStorage
            if (address) {
              const localStorageKey = `wellspace_user_${address}`;
              const existingData = localStorage.getItem(localStorageKey);
              if (existingData) {
                try {
                  const userData = JSON.parse(existingData);
                  userData.streakCount = streakCount + 1;
                  userData.totalScore = totalScore + reward;
                  userData.activities = [newActivity, ...(userData.activities || []).slice(0, 9)];
                  userData.weeklyGoals = weeklyGoals;
                  localStorage.setItem(localStorageKey, JSON.stringify(userData));
                } catch (error) {
                  console.error('Error updating localStorage:', error);
                }
              }
            }
            return;
          }
        }
      }
      try {
        console.log('📝 Logging activity to smart contract:', { type, name, reward });
        await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logActivity',
          args: [type, name, BigInt(reward)],
        });
        console.log('✅ Activity logged to smart contract successfully');
        
        // Also save to localStorage as backup
        const localStorageKey = `wellspace_user_${address}`;
        const existingData = localStorage.getItem(localStorageKey);
        if (existingData) {
          try {
            const userData = JSON.parse(existingData);
            userData.streakCount = streakCount + 1;
            userData.totalScore = totalScore + reward;
            userData.activities = [newActivity, ...(userData.activities || []).slice(0, 9)];
            userData.weeklyGoals = weeklyGoals;
            localStorage.setItem(localStorageKey, JSON.stringify(userData));
            console.log('💾 Activity also saved to localStorage backup');
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
        }
      } catch (error) {
        console.error('Error logging activity to smart contract:', error);
        console.log('🔄 Falling back to localStorage only');
        
        // Fallback to localStorage only
        if (address) {
          const localStorageKey = `wellspace_user_${address}`;
          const existingData = localStorage.getItem(localStorageKey);
          if (existingData) {
            try {
              const userData = JSON.parse(existingData);
              userData.streakCount = streakCount + 1;
              userData.totalScore = totalScore + reward;
              userData.activities = [newActivity, ...(userData.activities || []).slice(0, 9)];
              userData.weeklyGoals = weeklyGoals;
              localStorage.setItem(localStorageKey, JSON.stringify(userData));
            } catch (localError) {
              console.error('Error updating localStorage:', localError);
            }
          }
        }
      }
    } else {
      // No smart contract available or wrong network, use localStorage only
      if (chainId !== 84532) {
        console.log('⚠️ Wrong network detected, using localStorage only');
      } else {
        console.log('📱 Using localStorage fallback for activity logging');
      }
      if (address) {
        const localStorageKey = `wellspace_user_${address}`;
        const existingData = localStorage.getItem(localStorageKey);
        if (existingData) {
          try {
            const userData = JSON.parse(existingData);
            userData.streakCount = streakCount + 1;
            userData.totalScore = totalScore + reward;
            userData.activities = [newActivity, ...(userData.activities || []).slice(0, 9)];
            userData.weeklyGoals = weeklyGoals;
            localStorage.setItem(localStorageKey, JSON.stringify(userData));
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
        }
      }
    }
  };
  
  // Meal logging functions
  const addMeal = async () => {
    if (!newMeal.name.trim() || !newMeal.calories.trim()) return;
    
    const meal = {
      id: Date.now(),
      type: newMeal.type,
      name: newMeal.name,
      calories: parseInt(newMeal.calories),
      timestamp: Date.now()
    };
    
    setMeals(prev => [meal, ...prev]);
    setNewMeal({ type: 'breakfast', name: '', calories: '' });
    setShowMealModal(false);
    
    // Save meal to smart contract if available
    if (address && hasWellnessData) {
      // Force network switch to Base Sepolia if not already connected
      if (chainId !== 84532) {
        console.log('🔄 Switching to Base Sepolia testnet for meal logging...');
        try {
          await (window.ethereum as any).request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }], // 84532 in hex
          });
          console.log('✅ Switched to Base Sepolia testnet');
          
          // Wait a moment for the switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if switch was successful
          const newChainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
          if (newChainId !== '0x14a34') {
            console.log('⚠️ Network switch failed, meal logged to localStorage only');
            return;
          }
        } catch (error: any) {
          console.error('Error switching to Base Sepolia:', error);
          if (error.code === 4902) {
            // Chain not added, add it first
            await addBaseSepoliaNetwork();
            // Try switching again
            try {
              await (window.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x14a34' }],
              });
            } catch (switchError) {
              console.log('⚠️ Network switch failed after adding chain, meal logged to localStorage only');
              return;
            }
          } else {
            console.log('⚠️ Network switch failed, meal logged to localStorage only');
            return;
          }
        }
      }
      try {
        console.log('🍽️ Logging meal to smart contract:', { type: newMeal.type, name: newMeal.name, calories: parseInt(newMeal.calories) });
        await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logMeal',
          args: [newMeal.type, newMeal.name, BigInt(newMeal.calories)],
        });
        console.log('✅ Meal logged to smart contract successfully');
      } catch (error) {
        console.error('Error logging meal to smart contract:', error);
        console.log('🔄 Falling back to localStorage only');
      }
    } else if (chainId !== 84532) {
      console.log('⚠️ Wrong network detected, meal logged to localStorage only');
    }
    
    // Give reward for logging meal
    logActivity('meal', 'Logged meal', 10);
  };
  
  // Quick action functions
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'workout':
        await logActivity('workout', 'Completed workout', 50);
        break;
      case 'meditation':
        await logActivity('meditation', 'Logged meditation', 25);
        break;
      case 'meal':
        setShowMealModal(true);
        break;
      case 'sleep':
        await logActivity('sleep', 'Logged sleep', 30);
        setWeeklyGoals(prev => ({
          ...prev,
          sleep: { ...prev.sleep, current: Math.min(prev.sleep.current + 1, prev.sleep.target) }
        }));
        break;
    }
  };
  
  // Utility function to format timestamps
  const formatTimeAgo = (timestamp: number) => {
    // Handle invalid timestamps
    if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
      console.warn('⚠️ Invalid timestamp received:', timestamp);
      return 'Just now';
    }
    
    try {
      const now = Date.now();
      const diff = now - timestamp;
      
      // Handle future timestamps (shouldn't happen but just in case)
      if (diff < 0) {
        console.warn('⚠️ Future timestamp detected:', timestamp);
        return 'Just now';
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (minutes < 60) return `${minutes} minutes ago`;
      if (hours < 24) return `${hours} hours ago`;
      return `${days} days ago`;
    } catch (error) {
      console.error('❌ Error formatting timestamp:', error, 'timestamp:', timestamp);
      return 'Just now';
    }
  };
  
  // Get user onboarding status from smart contract
  const { data: isOnboarded, isLoading: isCheckingContract, error: contractReadError } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_PROFILE,
    abi: userProfileAbi,
    functionName: 'hasUserOnboarded',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  
  // Get user profile data from smart contract
  const { data: profileData, error: profileError } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_PROFILE,
    abi: userProfileAbi,
    functionName: 'getUserProfile',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!isOnboarded },
  });

  // Get user wellness data from WellnessTracker contract
  const { data: wellnessData, error: wellnessError } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
    abi: wellnessTrackerAbi,
    functionName: 'getUserWellnessData',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Check if user has wellness data initialized
  const { data: hasWellnessData, error: wellnessDataError } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
    abi: wellnessTrackerAbi,
    functionName: 'hasUserWellnessData',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get user's recent activities from smart contract
  const { data: contractActivities, error: activitiesError } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
    abi: wellnessTrackerAbi,
    functionName: 'getUserRecentActivities',
    args: address ? [address, BigInt(10)] : undefined,
    query: { enabled: !!address && !!hasWellnessData },
  });

  // Get user's recent meals from smart contract
  const { data: contractMeals, error: mealsError } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
    abi: wellnessTrackerAbi,
    functionName: 'getUserRecentMeals',
    args: address ? [address, BigInt(10)] : undefined,
    query: { enabled: !!address && !!hasWellnessData },
  });
  
  // Debug logging
  useEffect(() => {
    if (address) {
      console.log('🔍 Debug - Wallet connected:', address);
      console.log('🔍 Debug - User Profile Contract address:', CONTRACT_ADDRESSES.USER_PROFILE);
      console.log('🔍 Debug - Wellness Tracker Contract address:', CONTRACT_ADDRESSES.WELLNESS_TRACKER);
      console.log('🔍 Debug - Contract read error:', contractReadError);
      console.log('🔍 Debug - Profile error:', profileError);
      console.log('🔍 Debug - Wellness error:', wellnessError);
      console.log('🔍 Debug - Is onboarded:', isOnboarded);
      console.log('🔍 Debug - Has wellness data:', hasWellnessData);
      console.log('🔍 Debug - Profile data:', profileData);
      console.log('🔍 Debug - Wellness data:', wellnessData);
      console.log('🔍 Debug - Contract activities:', contractActivities);
      console.log('🔍 Debug - Contract meals:', contractMeals);
    }
  }, [address, contractReadError, profileError, wellnessError, isOnboarded, hasWellnessData, profileData, wellnessData, contractActivities, contractMeals]);

  // Force network switch to Base Sepolia on component mount
  useEffect(() => {
    if (address && chainId !== 84532) {
      console.log('🔄 Component mounted - checking network connection...');
      console.log('⚠️ Wrong network detected:', chainId);
      
      // Auto-switch to Base Sepolia
      const forceNetworkSwitch = async () => {
        try {
          console.log('🔄 Auto-switching to Base Sepolia testnet...');
          await (window.ethereum as any).request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }], // 84532 in hex
          });
          console.log('✅ Auto-switched to Base Sepolia testnet');
        } catch (error: any) {
          console.error('Error auto-switching to Base Sepolia:', error);
          if (error.code === 4902) {
            // Chain not added, add it first
            console.log('🔗 Adding Base Sepolia network first...');
            await addBaseSepoliaNetwork();
            // Try switching again
            try {
              await (window.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x14a34' }],
              });
              console.log('✅ Auto-switched to Base Sepolia testnet after adding network');
            } catch (switchError) {
              console.log('⚠️ Auto-switch failed after adding network');
            }
          }
        }
      };
      
      // Delay the auto-switch slightly to avoid conflicts
      setTimeout(forceNetworkSwitch, 1000);
    }
  }, [address, chainId]);

  // Aggressive network switching - run immediately when wallet connects
  useEffect(() => {
    if (address) {
      console.log('🔍 Wallet connected, checking network...');
      
      const checkAndSwitchNetwork = async () => {
        // Get current network from MetaMask directly
        try {
          const currentChainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
          console.log('🔍 Current MetaMask chain ID:', currentChainId);
          
          if (currentChainId !== '0x14a34') { // Not Base Sepolia
            console.log('🚨 WRONG NETWORK DETECTED! Forcing switch to Base Sepolia...');
            setIsNetworkSwitching(true);
            setNetworkSwitchAttempts(prev => prev + 1);
            
            // Force switch immediately
            try {
              await (window.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x14a34' }],
              });
              console.log('✅ Forced network switch to Base Sepolia');
              setIsNetworkSwitching(false);
            } catch (error: any) {
              console.error('❌ Network switch failed:', error);
              if (error.code === 4902) {
                console.log('🔗 Adding Base Sepolia network...');
                await addBaseSepoliaNetwork();
                // Try switching again
                await (window.ethereum as any).request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x14a34' }],
                });
                console.log('✅ Network switch successful after adding chain');
                setIsNetworkSwitching(false);
              } else {
                setIsNetworkSwitching(false);
              }
            }
          } else {
            console.log('✅ Already on Base Sepolia testnet');
            setIsNetworkSwitching(false);
          }
        } catch (error) {
          console.error('Error checking network:', error);
          setIsNetworkSwitching(false);
        }
      };
      
      // Run immediately and also after a short delay
      checkAndSwitchNetwork();
      setTimeout(checkAndSwitchNetwork, 500);
      setTimeout(() => {
        if (networkSwitchAttempts < 3) {
          checkAndSwitchNetwork();
        }
      }, 2000);
    }
  }, [address, networkSwitchAttempts]);
  
  // Update local state when contract data changes
  useEffect(() => {
    if (isOnboarded !== undefined) {
      setIsUserOnboarded(!!isOnboarded);
      
      // If user is onboarded and we're trying to go to onboarding, redirect to dashboard
      if (isOnboarded && currentView === 'onboarding') {
        setCurrentView('dashboard');
      }
    }
  }, [isOnboarded, currentView]);
  
  // Load profile data when available
  useEffect(() => {
    if (profileData && Array.isArray(profileData)) {
      // profile is an array: [hasOnboarded, goals, imageTheme, customPrompt, streakCount, totalScore, createdAt, lastActive, profileImageUrl, nftTokenId]
      setUserGoals([...(profileData[1] || [])]);
      setSelectedImageTheme(profileData[2] || '');
      setCustomPrompt(profileData[3] || '');
      setStreakCount(Number(profileData[4]) || 0);
      setTotalScore(Number(profileData[5]) || 0);
      setGeneratedImageUrl(profileData[8] || null);
    }
  }, [profileData]);

  // Load wellness data from smart contract when available
  useEffect(() => {
    if (wellnessData && Array.isArray(wellnessData)) {
      // wellnessData is an array: [streakCount, totalScore, lastActivityTimestamp, dailyStreakStart, weeklyGoals, totalActivities, totalMeals]
      console.log('📊 Loading wellness data from smart contract:', wellnessData);
      
      const [contractStreakCount, contractTotalScore, lastActivityTimestamp, dailyStreakStart, contractWeeklyGoals, totalActivities, totalMeals] = wellnessData;
      
      // Update local state with contract data
      setStreakCount(Number(contractStreakCount) || 0);
      setTotalScore(Number(contractTotalScore) || 0);
      
      // Update weekly goals if available
      if (contractWeeklyGoals && Array.isArray(contractWeeklyGoals)) {
        const [exerciseCurrent, exerciseTarget, meditationCurrent, meditationTarget, sleepCurrent, sleepTarget, exerciseCompleted, meditationCompleted, sleepCompleted] = contractWeeklyGoals;
        
        setWeeklyGoals({
          exercise: { 
            current: Number(exerciseCurrent) || 0, 
            target: Number(exerciseTarget) || 5, 
            completed: exerciseCompleted || false 
          },
          meditation: { 
            current: Number(meditationCurrent) || 0, 
            target: Number(meditationTarget) || 7, 
            completed: meditationCompleted || false 
          },
          sleep: { 
            current: Number(sleepCurrent) || 0, 
            target: Number(sleepTarget) || 7, 
            completed: sleepCompleted || false 
          }
        });
      }
      
      console.log('✅ Wellness data loaded from smart contract successfully');
    }
  }, [wellnessData]);

  // Load activities from smart contract when available
  useEffect(() => {
    if (contractActivities && Array.isArray(contractActivities)) {
      console.log('📊 Loading activities from smart contract:', contractActivities);
      console.log('🔍 Raw activity data structure:', contractActivities[0]);
      console.log('🔍 Activity data type:', typeof contractActivities[0]);
      console.log('🔍 Activity data keys:', Object.keys(contractActivities[0] || {}));
      console.log('🔍 Activity data length:', contractActivities[0]?.length);
      
      // Check if contract data is valid
      const hasValidData = contractActivities.length > 0 && 
        contractActivities[0] && 
        (contractActivities[0][0] !== undefined || contractActivities[0].id !== undefined);
      
      console.log('🔍 Has valid data:', hasValidData);
      
      if (hasValidData) {
        const formattedActivities = contractActivities.map((activity, index) => {
          console.log(`🔍 Processing activity ${index}:`, activity);
          console.log(`🔍 Activity type:`, typeof activity);
          console.log(`🔍 Activity keys:`, Object.keys(activity || {}));
          
          // Handle both array format [0,1,2,3,4,5] and object format {id, type, name, etc}
          let formatted;
          if (Array.isArray(activity)) {
            console.log(`🔍 Activity is array format`);
            // Convert timestamp from seconds to milliseconds if it's a reasonable value
            let timestamp = Number(activity[4]) || Date.now();
            if (timestamp > 1000000000 && timestamp < 10000000000) {
              // If timestamp is in seconds (10 digits), convert to milliseconds
              timestamp = timestamp * 1000;
              console.log(`🔍 Converting timestamp from seconds to milliseconds: ${Number(activity[4])} -> ${timestamp}`);
            }
            
            formatted = {
              id: Number(activity[0]) || 0, // id
              type: activity[1] || 'unknown', // activityType
              name: activity[2] || 'Unknown Activity', // name
              reward: Number(activity[3]) || 0, // reward
              timestamp: timestamp, // timestamp (converted if needed)
              completed: activity[5] || false // completed
            };
          } else if (typeof activity === 'object' && activity !== null) {
            console.log(`🔍 Activity is object format`);
            // Convert timestamp from seconds to milliseconds if it's a reasonable value
            let timestamp = Number(activity.timestamp) || Date.now();
            if (timestamp > 1000000000 && timestamp < 10000000000) {
              // If timestamp is in seconds (10 digits), convert to milliseconds
              timestamp = timestamp * 1000;
              console.log(`🔍 Converting timestamp from seconds to milliseconds: ${Number(activity.timestamp)} -> ${timestamp}`);
            }
            
            formatted = {
              id: Number(activity.id) || 0,
              type: activity.activityType || activity.type || 'unknown',
              name: activity.name || 'Unknown Activity',
              reward: Number(activity.reward) || 0,
              timestamp: timestamp, // timestamp (converted if needed)
              completed: activity.completed || false
            };
          } else {
            console.log(`🔍 Activity is unknown format:`, activity);
            formatted = {
              id: 0,
              type: 'unknown',
              name: 'Unknown Activity',
              reward: 0,
              timestamp: Date.now(),
              completed: false
            };
          }
          
          console.log(`🔍 Formatted activity ${index}:`, formatted);
          return formatted;
        });
        
        setActivities(formattedActivities);
        console.log('✅ Activities loaded from smart contract successfully');
        console.log('🔍 Final formatted activities:', formattedActivities);
      } else {
        console.log('⚠️ Contract activities data incomplete, falling back to localStorage');
        // Fallback to localStorage
        if (address) {
          const localStorageKey = `wellspace_user_${address}`;
          const savedData = localStorage.getItem(localStorageKey);
          if (savedData) {
            try {
              const userData = JSON.parse(savedData);
              if (userData.activities && Array.isArray(userData.activities)) {
                setActivities(userData.activities);
                console.log('📱 Activities loaded from localStorage fallback');
              }
            } catch (error) {
              console.error('Error loading activities from localStorage:', error);
            }
          }
        }
      }
    }
  }, [contractActivities, address]);

  // Load meals from smart contract when available
  useEffect(() => {
    if (contractMeals && Array.isArray(contractMeals)) {
      console.log('🍽️ Loading meals from smart contract:', contractMeals);
      console.log('🔍 Raw meal data structure:', contractMeals[0]);
      console.log('🔍 Meal data type:', typeof contractMeals[0]);
      console.log('🔍 Meal data keys:', Object.keys(contractMeals[0] || {}));
      console.log('🔍 Meal data length:', contractMeals[0]?.length);
      
      // Check if contract data is valid
      const hasValidData = contractMeals.length > 0 && 
        contractMeals[0] && 
        (contractMeals[0][0] !== undefined || contractMeals[0].id !== undefined);
      
      console.log('🔍 Has valid meal data:', hasValidData);
      
      if (hasValidData) {
        const formattedMeals = contractMeals.map((meal, index) => {
          console.log(`🔍 Processing meal ${index}:`, meal);
          console.log(`🔍 Meal type:`, typeof meal);
          console.log(`🔍 Meal keys:`, Object.keys(meal || {}));
          
          // Handle both array format [0,1,2,3,4] and object format {id, type, name, etc}
          let formatted;
          if (Array.isArray(meal)) {
            console.log(`🔍 Meal is array format`);
            // Convert timestamp from seconds to milliseconds if it's a reasonable value
            let timestamp = Number(meal[4]) || Date.now();
            if (timestamp > 1000000000 && timestamp < 10000000000) {
              // If timestamp is in seconds (10 digits), convert to milliseconds
              timestamp = timestamp * 1000;
              console.log(`🔍 Converting meal timestamp from seconds to milliseconds: ${Number(meal[4])} -> ${timestamp}`);
            }
            
            formatted = {
              id: Number(meal[0]) || 0, // id
              type: meal[1] || 'breakfast', // mealType
              name: meal[2] || 'Unknown Meal', // name
              calories: Number(meal[3]) || 0, // calories
              timestamp: timestamp // timestamp (converted if needed)
            };
          } else if (typeof meal === 'object' && meal !== null) {
            console.log(`🔍 Meal is object format`);
            // Convert timestamp from seconds to milliseconds if it's a reasonable value
            let timestamp = Number(meal.timestamp) || Date.now();
            if (timestamp > 1000000000 && timestamp < 10000000000) {
              // If timestamp is in seconds (10 digits), convert to milliseconds
              timestamp = timestamp * 1000;
              console.log(`🔍 Converting meal timestamp from seconds to milliseconds: ${Number(meal.timestamp)} -> ${timestamp}`);
            }
            
            formatted = {
              id: Number(meal.id) || 0,
              type: meal.mealType || meal.type || 'breakfast',
              name: meal.name || 'Unknown Meal',
              calories: Number(meal.calories) || 0,
              timestamp: timestamp // timestamp (converted if needed)
            };
          } else {
            console.log(`🔍 Meal is unknown format:`, meal);
            formatted = {
              id: 0,
              type: 'breakfast',
              name: 'Unknown Meal',
              calories: 0,
              timestamp: Date.now()
            };
          }
          
          console.log(`🔍 Formatted meal ${index}:`, formatted);
          return formatted;
        });
        
        setMeals(formattedMeals);
        console.log('✅ Meals loaded from smart contract successfully');
        console.log('🔍 Final formatted meals:', formattedMeals);
      } else {
        console.log('⚠️ Contract meals data incomplete, falling back to localStorage');
        // Fallback to localStorage
        if (address) {
          const localStorageKey = `wellspace_user_${address}`;
          const savedData = localStorage.getItem(localStorageKey);
          if (savedData) {
            try {
              const userData = JSON.parse(savedData);
              if (userData.meals && Array.isArray(userData.meals)) {
                setMeals(userData.meals);
                console.log('📱 Meals loaded from localStorage fallback');
              }
            } catch (error) {
              console.error('Error loading meals from localStorage:', error);
            }
          }
        }
      }
    }
  }, [contractMeals, address]);
  
  // Fallback: Load from localStorage if smart contract fails
  useEffect(() => {
    if (address && !isOnboarded && !isCheckingContract) {
      const localStorageKey = `wellspace_user_${address}`;
      const savedData = localStorage.getItem(localStorageKey);
      
      if (savedData) {
        try {
          const userData = JSON.parse(savedData);
          console.log('📱 Loading from localStorage fallback:', userData);
          
          setIsUserOnboarded(true);
          setUserGoals(userData.goals || []);
          setSelectedImageTheme(userData.imageTheme || '');
          setCustomPrompt(userData.customPrompt || '');
          setStreakCount(userData.streakCount || 0);
          setTotalScore(userData.totalScore || 0);
          setGeneratedImageUrl(userData.profileImageUrl || null);
          
          // Load activities and weekly goals
          if (userData.activities) {
            setActivities(userData.activities);
          }
          if (userData.weeklyGoals) {
            setWeeklyGoals(userData.weeklyGoals);
          }
          
          // If we're on onboarding page, redirect to dashboard
          if (currentView === 'onboarding') {
            setCurrentView('dashboard');
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }
    }
  }, [address, isOnboarded, isCheckingContract, currentView]);

  // Check contract health on mount and when address changes
  useEffect(() => {
    if (address) {
      checkContractHealth();
    }
  }, [address]);

  // Auto-hide wellness data initialization success message
  useEffect(() => {
    if (wellnessDataInitialized) {
      const timer = setTimeout(() => {
        setWellnessDataInitialized(false);
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [wellnessDataInitialized]);
  
  // Check contract health and accessibility
  const checkContractHealth = async () => {
    if (!address) return;
    
    try {
      // Try to read from the contract to check if it's accessible
      const testRead = await fetch('/api/contract-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: CONTRACT_ADDRESSES.USER_PROFILE,
          chainId: 84532 
        })
      });
      
      if (testRead.ok) {
        setContractHealth('healthy');
        setContractError(null);
      } else {
        setContractHealth('degraded');
        setContractError('Contract may be temporarily unavailable');
      }
    } catch (error) {
      setContractHealth('unhealthy');
      setContractError('Unable to connect to smart contract');
    }
  };

  const saveUserProfile = async (goals: string[], imageTheme: string, customPrompt: string) => {
    if (!address) return false;
    
    setIsSavingProfile(true);
    setContractError(null);
    
    try {
      // Check contract health first
      await checkContractHealth();
      
      if (contractHealth === 'unhealthy') {
        throw new Error('Smart contract is currently unavailable');
      }
      
      // Initialize wellness data on WellnessTracker contract if not already done
      if (!hasWellnessData) {
        // Force network switch to Base Sepolia if not already connected
        if (chainId !== 84532) {
          console.log('🔄 Switching to Base Sepolia testnet for profile initialization...');
          try {
            await (window.ethereum as any).request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x14a34' }], // 84532 in hex
            });
            console.log('✅ Switched to Base Sepolia testnet');
            
            // Wait a moment for the switch to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if switch was successful
            const newChainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
            if (newChainId !== '0x14a34') {
              console.log('⚠️ Network switch failed, skipping smart contract initialization');
            } else {
              console.log('🚀 Initializing wellness data on smart contract...');
              await writeContract({
                address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
                abi: wellnessTrackerAbi,
                functionName: 'initializeWellnessData',
                args: [],
              });
              console.log('✅ Wellness data initialized on smart contract');
            }
          } catch (error: any) {
            console.error('Error switching to Base Sepolia:', error);
            if (error.code === 4902) {
              // Chain not added, add it first
              await addBaseSepoliaNetwork();
              // Try switching again
              try {
                await (window.ethereum as any).request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x14a34' }],
                });
                console.log('🚀 Initializing wellness data on smart contract...');
                await writeContract({
                  address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
                  abi: wellnessTrackerAbi,
                  functionName: 'initializeWellnessData',
                  args: [],
                });
                console.log('✅ Wellness data initialized on smart contract');
              } catch (switchError) {
                console.log('⚠️ Network switch failed after adding chain, skipping smart contract initialization');
              }
            } else {
              console.log('⚠️ Network switch failed, skipping smart contract initialization');
            }
          }
        } else {
          console.log('🚀 Initializing wellness data on smart contract...');
          await writeContract({
            address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
            abi: wellnessTrackerAbi,
            functionName: 'initializeWellnessData',
            args: [],
          });
          console.log('✅ Wellness data initialized on smart contract');
        }
      }
      
      // Save user profile to smart contract
      const result = await writeContract({
        address: CONTRACT_ADDRESSES.USER_PROFILE,
        abi: userProfileAbi,
        functionName: 'createProfile',
        args: [goals, imageTheme, customPrompt, generatedImageUrl || ''],
      });
      
      console.log('📝 Transaction submitted:', result);
      
      // Save to localStorage as backup while transaction processes
      const localStorageKey = `wellspace_user_${address}`;
      const userData = {
        goals,
        imageTheme,
        customPrompt,
        streakCount,
        totalScore,
        profileImageUrl: generatedImageUrl || '',
        timestamp: Date.now()
      };
      localStorage.setItem(localStorageKey, JSON.stringify(userData));
      console.log('💾 Saved to localStorage backup:', userData);
      
      setIsSavingProfile(false);
      return true;
    } catch (error) {
      console.error('Error saving user profile to smart contract:', error);
      setContractError(error instanceof Error ? error.message : 'Failed to save profile');
      
      // Fallback: save to localStorage only
      try {
        const localStorageKey = `wellspace_user_${address}`;
        const userData = {
          goals,
          imageTheme,
          customPrompt,
          streakCount,
          totalScore,
          profileImageUrl: generatedImageUrl || '',
          timestamp: Date.now()
        };
        localStorage.setItem(localStorageKey, JSON.stringify(userData));
        console.log('💾 Saved to localStorage fallback:', userData);
        
        setIsSavingProfile(false);
        return true;
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        setIsSavingProfile(false);
        return false;
      }
    }
    };

  // Initialize wellness data on smart contract
  const initializeWellnessData = async () => {
    if (!address) return false;
    
    // Force network switch to Base Sepolia if not already connected
    if (chainId !== 84532) {
      console.log('🔄 Switching to Base Sepolia testnet...');
      try {
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14a34' }], // 84532 in hex
        });
        console.log('✅ Switched to Base Sepolia testnet');
        
        // Wait a moment for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if switch was successful
        const newChainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
        if (newChainId !== '0x14a34') {
          setContractError('Failed to switch to Base Sepolia testnet. Please switch manually.');
          return false;
        }
      } catch (error: any) {
        console.error('Error switching to Base Sepolia:', error);
        if (error.code === 4902) {
          // Chain not added, add it first
          await addBaseSepoliaNetwork();
          // Try switching again
          await (window.ethereum as any).request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }],
          });
        } else {
          setContractError('Failed to switch to Base Sepolia testnet. Please switch manually.');
          return false;
        }
      }
    }
    
    try {
      console.log('🚀 Initializing wellness data on smart contract...');
      await writeContract({
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        abi: wellnessTrackerAbi,
        functionName: 'initializeWellnessData',
        args: [],
      });
      console.log('✅ Wellness data initialized on smart contract');
      setWellnessDataInitialized(true);
      return true;
    } catch (error) {
      console.error('Error initializing wellness data:', error);
      setContractError('Failed to initialize wellness data on smart contract');
      return false;
    }
  };

  // Reset weekly goals on smart contract
  const resetWeeklyGoals = async () => {
    if (!address || !hasWellnessData) return false;
    
    // Force network switch to Base Sepolia if not already connected
    if (chainId !== 84532) {
      console.log('🔄 Switching to Base Sepolia testnet for weekly goals reset...');
      try {
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14a34' }], // 84532 in hex
        });
        console.log('✅ Switched to Base Sepolia testnet');
        
        // Wait a moment for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if switch was successful
        const newChainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
        if (newChainId !== '0x14a34') {
          setContractError('Failed to switch to Base Sepolia testnet. Please switch manually.');
          return false;
        }
      } catch (error: any) {
        console.error('Error switching to Base Sepolia:', error);
        if (error.code === 4902) {
          // Chain not added, add it first
          await addBaseSepoliaNetwork();
          // Try switching again
          try {
            await (window.ethereum as any).request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x14a34' }],
            });
          } catch (switchError) {
            setContractError('Failed to switch to Base Sepolia testnet after adding chain. Please switch manually.');
            return false;
          }
        } else {
          setContractError('Failed to switch to Base Sepolia testnet. Please switch manually.');
          return false;
        }
      }
    }
    
    try {
      console.log('🔄 Resetting weekly goals on smart contract...');
      await writeContract({
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        abi: wellnessTrackerAbi,
        functionName: 'resetWeeklyGoals',
        args: [],
      });
      console.log('✅ Weekly goals reset on smart contract');
      
      // Update local state
      setWeeklyGoals({
        exercise: { current: 0, target: 5, completed: false },
        meditation: { current: 0, target: 7, completed: false },
        sleep: { current: 0, target: 7, completed: false }
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting weekly goals:', error);
      setContractError('Failed to reset weekly goals on smart contract');
      return false;
    }
  };

  // Add Base Sepolia network to MetaMask
  const addBaseSepoliaNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask first.');
      return;
    }

    try {
      await (window.ethereum as any).request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x14a34', // 84532 in hex
          chainName: 'Base Sepolia',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org'],
        }],
      });
      console.log('✅ Base Sepolia network added to MetaMask');
    } catch (error: any) {
      console.error('Error adding Base Sepolia network:', error);
      if (error.code === 4001) {
        alert('Network addition was rejected by user.');
      } else {
        alert('Failed to add Base Sepolia network. Please add it manually.');
      }
    }
  };

  // Network switching overlay - prevent any OnchainKit components from rendering until network is correct
  if (address && chainId !== 84532 && isNetworkSwitching) {
    return (
      <div className={cn(
        "min-h-screen w-full overflow-hidden transition-colors duration-300",
        isDarkMode ? "bg-black" : "bg-white"
      )}>
        <ThemeToggleButton />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className={cn(
              "text-xl font-semibold transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>Switching to Base Sepolia Testnet...</h2>
            <p className={cn(
              "transition-colors",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>Please approve the network switch in MetaMask</p>
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Current Network:</strong> {chainId === 1 ? 'Ethereum Mainnet' : `Network ID ${chainId}`}
              </p>
              <p className="text-sm text-red-800 mt-1">
                <strong>Required:</strong> Base Sepolia Testnet (Chain ID: 84532)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding View
  if (currentView === 'onboarding') {
    // Show loading state while checking onboarding status
    if (isCheckingContract) {
      return (
        <div className={cn(
          "min-h-screen w-full overflow-hidden transition-colors duration-300",
          isDarkMode ? "bg-black" : "bg-white"
        )}>
          <ThemeToggleButton />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className={cn(
                "text-xl font-semibold transition-colors",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>Checking your profile...</h2>
              <p className={cn(
                "transition-colors",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>Please wait while we load your wellness data</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className={cn(
        "min-h-screen w-full overflow-hidden transition-colors duration-300",
        isDarkMode ? "bg-black" : "bg-white"
      )}>
        <ThemeToggleButton />
        <div className="flex flex-col min-h-screen max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">


          {/* Header */}
          <div className={cn(
            "px-6 py-6 lg:px-8 lg:py-8 transition-colors duration-300",
            isDarkMode ? "bg-black" : "bg-gray-900"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-white font-semibold text-xl lg:text-2xl">Get started</h1>
                  <p className="text-gray-400 text-sm lg:text-base">Step {onboardingStep} of 4</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={cn(
            "flex-1 rounded-t-3xl lg:rounded-t-none px-6 py-8 lg:px-8 lg:py-12 overflow-y-auto transition-colors duration-300",
            isDarkMode ? "bg-gray-900" : "bg-white"
          )}>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-1 mb-6">
                <div 
                  className="bg-black h-1 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${(onboardingStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {onboardingStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Securely connect your wallet to start earning $WELL tokens and mint your unique wellness profile NFT.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <Wallet>
                    <ConnectWallet>
                      {address && (
                        <div className="flex items-center space-x-4 py-3">
                          <Avatar className="h-12 w-12" />
                          <div>
                            <Name className="text-base font-semibold" />
                            <div className="text-sm text-gray-500">
                              {address.slice(0, 6)}...{address.slice(-4)}
                            </div>
                          </div>
                        </div>
                      )}
                    </ConnectWallet>
                  </Wallet>
                </div>

                {address && (
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className={cn(
                      "w-full py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-base shadow-lg hover:shadow-xl",
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                    )}
                  >
                    Continue
                  </button>
                )}
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Goals</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Select the wellness areas you'd like to focus on. We'll personalize your experience accordingly.
                  </p>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {wellnessGoals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all duration-300 text-left transform hover:scale-[1.02] active:scale-[0.98]",
                        userGoals.includes(goal)
                          ? isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white shadow-lg"
                            : "bg-gray-800 border-gray-700 text-white shadow-lg"
                          : isDarkMode
                            ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-700 hover:shadow-md"
                            : "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-200 hover:shadow-md"
                      )}
                    >
                      <div className="font-medium">{goal}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setOnboardingStep(3)}
                  disabled={userGoals.length === 0}
                  className={cn(
                    "w-full py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none text-base shadow-lg hover:shadow-xl disabled:shadow-none",
                    userGoals.length === 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                  )}
                >
                  Continue ({userGoals.length} selected)
                </button>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Design Your NFT</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Choose a theme for your personalized wellness NFT that will be generated by AI and minted to your wallet.
                  </p>
                </div>

                {!generatedImageUrl ? (
                  <>
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                      {imageThemes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedImageTheme(theme.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                            selectedImageTheme === theme.id
                              ? "bg-purple-100 border-purple-300 text-purple-700"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <div className="font-medium text-sm">{theme.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{theme.description}</div>
                        </button>
                      ))}
                    </div>

                    {selectedImageTheme === 'custom' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Describe your custom NFT idea:
                        </label>
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Describe the style, colors, and elements you'd like in your wellness NFT..."
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none h-20"
                        />
                      </div>
                    )}

                    <button
                      onClick={generateWellnessImage}
                      disabled={!selectedImageTheme || (selectedImageTheme === 'custom' && !customPrompt.trim()) || isGeneratingImage}
                      className="w-full py-3 bg-purple-400 hover:bg-purple-500 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isGeneratingImage ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating your NFT...</span>
                        </>
                      ) : (
                        <span>Generate Wellness NFT</span>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <img 
                        src={generatedImageUrl} 
                        alt="Generated Wellness NFT" 
                        className="w-48 h-48 mx-auto rounded-xl border border-gray-200 shadow-lg"
                      />
                      <p className="text-sm text-gray-600 mt-3">
                        Your personalized wellness NFT is ready!
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setGeneratedImageUrl(null);
                          setSelectedImageTheme('');
                          setCustomPrompt('');
                        }}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:bg-gray-50"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => setOnboardingStep(4)}
                        className="flex-1 py-3 bg-purple-400 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all duration-200"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    You're all set! Your wellness journey starts now with personalized insights and rewards.
                  </p>
                </div>

                {/* Contract Status Indicator */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium text-sm">Smart Contract Ready</p>
                      <p className="text-blue-600 text-xs">Your profile will be saved on-chain</p>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {contractError && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-red-800 font-medium text-sm">Contract Warning</p>
                        <p className="text-red-600 text-xs">{contractError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={completeOnboarding}
                  disabled={isSavingProfile}
                  className={cn(
                    "w-full py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2",
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-500"
                      : "bg-gray-800 hover:bg-gray-700 text-white disabled:bg-gray-500",
                    isSavingProfile ? "opacity-75 cursor-not-allowed" : ""
                  )}
                >
                  {isSavingProfile ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Enter WellSpace</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View (full-width professional design)
  if (currentView === 'dashboard') {
    return (
      <div className={cn(
        "min-h-screen w-full transition-colors duration-300",
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      )}>
        <ThemeToggleButton />
        {/* Navigation Header */}
        <header className={cn(
          "border-b sticky top-0 z-40 transition-colors duration-300",
          isDarkMode 
            ? "bg-gray-800 border-gray-700" 
            : "bg-white border-gray-200"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Nav */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/WellSpace_logo.png" 
                    alt="WellSpace Logo" 
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl object-cover"
                  />
                  <span className={cn(
                    "text-xl font-bold transition-colors",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>WellSpace</span>
                </div>
                
                {/* Navigation Menu */}
                <nav className="hidden md:flex space-x-8">
                  <button className={cn(
                    "font-medium border-b-2 pb-4 -mb-px transition-colors",
                    isDarkMode 
                      ? "text-white border-white" 
                      : "text-gray-900 border-black"
                  )}>
                    Home
                  </button>
                  <button className={cn(
                    "font-medium transition-colors",
                    isDarkMode 
                      ? "text-gray-400 hover:text-white" 
                      : "text-gray-500 hover:text-gray-900"
                  )}>
                    Activity
                  </button>
                  <button className={cn(
                    "font-medium transition-colors",
                    isDarkMode 
                      ? "text-gray-400 hover:text-white" 
                      : "text-gray-500 hover:text-gray-900"
                  )}>
                    Rewards
                  </button>
                  <button className={cn(
                    "font-medium transition-colors",
                    isDarkMode 
                      ? "text-gray-400 hover:text-white" 
                      : "text-gray-500 hover:text-gray-900"
                  )}>
                    NFTs
                  </button>
                </nav>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-4">
                {address && (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8" />
                    <div className="hidden sm:block">
                      <Name className={cn(
                        "text-sm font-medium transition-colors",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )} />
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "text-xs transition-colors",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </div>
                        {/* Contract Status Indicator */}
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isOnboarded ? "bg-green-500" : "bg-yellow-500"
                        )} title={isOnboarded ? "Profile saved on-chain" : "Profile saved locally"} />
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setCurrentView('landing')}
                  className={cn(
                    "p-2 transition-colors",
                    isDarkMode 
                      ? "text-gray-400 hover:text-gray-200" 
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Contract Status Banner */}
          {contractError && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border transition-colors",
              isDarkMode 
                ? "bg-red-900/20 border-red-700/50 text-red-200" 
                : "bg-red-50 border-red-200 text-red-800"
            )}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Smart Contract Notice</p>
                  <p className="text-sm opacity-90">{contractError}</p>
                  <p className="text-xs opacity-75 mt-1">
                    Your data is safely stored locally and will sync when the contract is available.
                  </p>
                  <button
                    onClick={checkContractHealth}
                    className={cn(
                      "mt-2 px-3 py-1 text-xs rounded-lg transition-colors",
                      isDarkMode 
                        ? "bg-red-800/50 hover:bg-red-800/70 text-red-200" 
                        : "bg-red-100 hover:bg-red-200 text-red-800"
                    )}
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wellness Data Initialization Banner */}
          {address && !hasWellnessData && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border transition-colors",
              isDarkMode 
                ? "bg-blue-900/20 border-blue-700/50 text-blue-200" 
                : "bg-blue-50 border-blue-200 text-blue-800"
            )}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Initialize On-Chain Wellness Data</p>
                  <p className="text-sm opacity-90">
                    Your wellness data is currently stored locally. Initialize on-chain storage for better security and transparency.
                  </p>
                  <button
                    onClick={initializeWellnessData}
                    className={cn(
                      "mt-2 px-4 py-2 text-sm rounded-lg transition-colors font-medium",
                      isDarkMode 
                        ? "bg-blue-800/50 hover:bg-blue-800/70 text-blue-200" 
                        : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                    )}
                  >
                    🚀 Initialize On-Chain
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wellness Data Success Banner */}
          {address && hasWellnessData && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border transition-colors",
              isDarkMode 
                ? "bg-green-900/20 border-green-700/50 text-green-200" 
                : "bg-green-50 border-green-200 text-green-800"
            )}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">✅ On-Chain Wellness Data Active</p>
                  <p className="text-sm opacity-90">
                    Your wellness data is now stored securely on the blockchain. All activities, meals, and progress are being tracked on-chain.
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">
                      🔗 Smart Contract Connected
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">
                      📊 Real-time Sync
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Temporary Success Message */}
          {wellnessDataInitialized && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border transition-colors animate-pulse",
              isDarkMode 
                ? "bg-green-900/20 border-green-700/50 text-green-200" 
                : "bg-green-50 border-green-200 text-green-800"
            )}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">🎉 Wellness Data Successfully Initialized!</p>
                  <p className="text-sm opacity-90">
                    Your wellness data is now being stored on the blockchain. This message will disappear shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Network Switch Banner */}
          {address && chainId !== 84532 && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border transition-colors",
              isDarkMode 
                ? "bg-red-900/20 border-red-700/50 text-red-200" 
                : "bg-red-50 border-red-200 text-red-800"
            )}>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="font-bold text-lg">🚨 CRITICAL: Wrong Network Detected</p>
                  <p className="text-sm opacity-90">
                    You're currently connected to <strong>{chainId === 1 ? 'Ethereum Mainnet' : `Network ID ${chainId}`}</strong>. 
                    WellSpace requires <strong>Base Sepolia Testnet (Chain ID: 84532)</strong>.
                  </p>
                  <p className="text-sm opacity-90 mt-2">
                    <strong>⚠️ WARNING:</strong> Transactions on the wrong network will fail and may charge you gas fees on the wrong blockchain!
                  </p>
                  <div className="mt-3 text-xs opacity-75">
                    <p><strong>To fix this:</strong></p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Open MetaMask</li>
                      <li>Click the network dropdown (top of MetaMask)</li>
                      <li>Select "Base Sepolia" or add it if not listed</li>
                      <li>If adding manually: Network Name: "Base Sepolia", RPC URL: "https://sepolia.base.org", Chain ID: "84532"</li>
                    </ol>
                  </div>
                  <div className="mt-3 flex space-x-3">
                    <button
                      onClick={addBaseSepoliaNetwork}
                      className={cn(
                        "px-4 py-2 text-sm rounded-lg transition-colors font-medium",
                        isDarkMode 
                          ? "bg-red-800/50 hover:bg-red-800/70 text-red-200" 
                          : "bg-red-100 hover:bg-red-200 text-red-800"
                      )}
                    >
                      🔗 Add Base Sepolia to MetaMask
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await (window.ethereum as any).request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x14a34' }],
                          });
                        } catch (error: any) {
                          if (error.code === 4902) {
                            await addBaseSepoliaNetwork();
                          }
                        }
                      }}
                      className={cn(
                        "px-4 py-2 text-sm rounded-lg transition-colors font-medium",
                        isDarkMode 
                          ? "bg-blue-800/50 hover:bg-blue-800/70 text-blue-200" 
                          : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                      )}
                    >
                      🔄 Switch to Base Sepolia Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Network Status Indicator */}
          {address && (
            <div className="mb-6 flex items-center justify-between">
              <div className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors",
                chainId === 84532
                  ? isDarkMode 
                    ? "bg-green-900/20 border-green-700/50 text-green-200" 
                    : "bg-green-50 border-green-200 text-green-800"
                  : isDarkMode 
                    ? "bg-red-900/20 border-red-700/50 text-red-200" 
                    : "bg-red-50 border-red-200 text-red-800"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  chainId === 84532 ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-sm font-medium">
                  {chainId === 84532 ? '✅ Base Sepolia Testnet' : '❌ Wrong Network'}
                </span>
                {chainId !== 84532 && (
                  <span className="text-xs opacity-75">
                    (Current: {chainId === 1 ? 'Ethereum Mainnet' : `ID ${chainId}`})
                  </span>
                )}
              </div>
              {chainId !== 84532 && (
                <button
                  onClick={async () => {
                    try {
                      await (window.ethereum as any).request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x14a34' }],
                      });
                    } catch (error: any) {
                      if (error.code === 4902) {
                        await addBaseSepoliaNetwork();
                      }
                    }
                  }}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg transition-colors font-medium",
                    isDarkMode 
                      ? "bg-blue-800/50 hover:bg-blue-800/70 text-blue-200" 
                      : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                  )}
                >
                  🔄 Switch Network
                </button>
              )}
            </div>
          )}



          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className={cn(
              "text-3xl font-bold mb-2 transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>Welcome back!</h1>
            <p className={cn(
              "transition-colors",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>Track your wellness journey and earn rewards</p>
          </div>

                    {/* Main Wellness Widget - Similar to Landing Page */}
          <div className="mb-8">
            <div className={cn(
              "max-w-2xl rounded-3xl p-8 border shadow-lg transition-colors duration-300",
              isDarkMode 
                ? "bg-gray-800 border-gray-700 shadow-gray-900/50" 
                : "bg-white border-gray-200 shadow-gray-200/50"
            )}>
              {/* Wellness Score Section */}
              <div className={cn(
                "rounded-2xl p-6 border mb-6 transition-colors duration-300",
                isDarkMode 
                  ? "bg-gray-900 border-gray-600" 
                  : "bg-gray-50 border-gray-300"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "text-sm transition-colors duration-300",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>Your wellness score</div>
                  <div className="text-green-500 text-sm font-medium">+12%</div>
                </div>
                <div className={cn(
                  "text-4xl font-bold transition-colors duration-300",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>{totalScore}</div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className={cn(
                  "rounded-xl p-4 border transition-colors duration-300",
                  isDarkMode 
                    ? "bg-gray-900 border-gray-600 hover:bg-gray-800" 
                    : "bg-gray-100 border-gray-300 hover:bg-gray-50"
                )}>
                  <div className={cn(
                    "text-2xl font-bold mb-1 transition-colors duration-300",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>{streakCount}</div>
                  <div className={cn(
                    "text-xs transition-colors duration-300",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>Day Streak</div>
                </div>
                <div className={cn(
                  "rounded-xl p-4 border transition-colors duration-300",
                  isDarkMode 
                    ? "bg-gray-900 border-gray-600 hover:bg-gray-800" 
                    : "bg-gray-100 border-gray-300 hover:bg-gray-50"
                )}>
                  <div className={cn(
                    "text-2xl font-bold mb-1 transition-colors duration-300",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>3</div>
                  <div className={cn(
                    "text-xs transition-colors duration-300",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>NFTs Earned</div>
                </div>
                <div className={cn(
                  "rounded-xl p-4 border transition-colors duration-300",
                  isDarkMode 
                    ? "bg-gray-900 border-gray-600 hover:bg-gray-800" 
                    : "bg-gray-100 border-gray-300 hover:bg-gray-50"
                )}>
                  <div className={cn(
                    "text-2xl font-bold mb-1 transition-colors duration-300",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    {wellBalance ? formatTokenAmount(wellBalance.value, wellBalance.decimals) : '0.00'}
                  </div>
                  <div className={cn(
                    "text-xs transition-colors duration-300",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>$WELL Balance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - AI Assistant & Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Wellness Assistant */}
              <div className={cn(
                "rounded-2xl p-6 border shadow-sm transition-colors",
                isDarkMode 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white border-gray-200"
              )}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    isDarkMode 
                      ? "bg-gray-700" 
                      : "bg-gray-200"
                  )}>
                    <svg className={cn(
                      "w-5 h-5 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className={cn(
                    "text-xl font-semibold transition-colors",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>AI Wellness Assistant</h2>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={wellnessPrompt}
                    onChange={(e) => setWellnessPrompt(e.target.value)}
                    placeholder="Ask me about your wellness goals, nutrition, exercise, or any health-related questions..."
                    className={cn(
                      "w-full p-4 border rounded-xl text-sm resize-none h-24 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors",
                      isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    )}
                  />
                  <button
                    onClick={getWellnessAdviceHandler}
                    disabled={isLoadingAI || !wellnessPrompt.trim()}
                    className={cn(
                      "px-6 py-3 font-medium rounded-xl transition-colors",
                      isDarkMode 
                        ? "bg-white text-black hover:bg-gray-100 disabled:bg-gray-600" 
                        : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
                    )}
                  >
                    {isLoadingAI ? 'Getting advice...' : 'Get AI Advice'}
                  </button>
                  {aiResponse && (
                    <div className={cn(
                      "rounded-xl p-4 border transition-colors",
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600" 
                        : "bg-gray-50 border-gray-200"
                    )}>
                      <p className={cn(
                        "text-sm leading-relaxed transition-colors",
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      )}>{aiResponse.advice || 'Here\'s your personalized wellness advice!'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className={cn(
                "rounded-2xl p-6 border shadow-sm transition-colors",
                isDarkMode 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white border-gray-200"
              )}>
                <h2 className={cn(
                  "text-xl font-semibold mb-6 transition-colors",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleQuickAction('workout')}
                    className={cn(
                      "p-6 rounded-xl border transition-all duration-200 text-left group",
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      isDarkMode 
                        ? "bg-gray-600 group-hover:bg-gray-500" 
                        : "bg-gray-200 group-hover:bg-gray-300"
                    )}>
                      <svg className={cn(
                        "w-6 h-6 transition-colors",
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className={cn(
                      "font-semibold mb-2 transition-colors",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Log Workout</h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>Complete workout and earn +50 WELL</p>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('meditation')}
                    className={cn(
                      "p-6 rounded-xl border transition-all duration-200 text-left group",
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      isDarkMode 
                        ? "bg-gray-600 group-hover:bg-gray-500" 
                        : "bg-gray-200 group-hover:bg-gray-300"
                    )}>
                      <svg className={cn(
                        "w-6 h-6 transition-colors",
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className={cn(
                      "font-semibold mb-2 transition-colors",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Log Meditation</h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>Complete meditation and earn +25 WELL</p>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('meal')}
                    className={cn(
                      "p-6 rounded-xl border transition-all duration-200 text-left group",
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      isDarkMode 
                        ? "bg-gray-600 group-hover:bg-gray-500" 
                        : "bg-gray-200 group-hover:bg-gray-300"
                    )}>
                      <svg className={cn(
                        "w-6 h-6 transition-colors",
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                      </svg>
                    </div>
                    <h3 className={cn(
                      "font-semibold mb-2 transition-colors",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Log Meal</h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>Track your nutrition and earn +10 WELL</p>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('sleep')}
                    className={cn(
                      "p-6 rounded-xl border transition-all duration-200 text-left group",
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      isDarkMode 
                        ? "bg-gray-600 group-hover:bg-gray-500" 
                        : "bg-gray-200 group-hover:bg-gray-300"
                    )}>
                      <svg className={cn(
                        "w-6 h-6 transition-colors",
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <h3 className={cn(
                      "font-semibold mb-2 transition-colors",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Log Sleep</h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>Track your sleep and earn +30 WELL</p>
                  </button>
                </div>
              </div>
              
              {/* Meal Logging Section */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Today's Meals</h2>
                  <button 
                    onClick={() => setShowMealModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    + Add Meal
                  </button>
                </div>
                
                <div className="space-y-3">
                  {meals.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No meals logged today. Start tracking your nutrition!</p>
                  ) : (
                    meals.slice(0, 3).map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            meal.type === 'breakfast' ? 'bg-yellow-100' :
                            meal.type === 'lunch' ? 'bg-orange-100' :
                            meal.type === 'dinner' ? 'bg-red-100' :
                            'bg-green-100'
                          }`}>
                            <span className={`text-xs font-medium ${
                              meal.type === 'breakfast' ? 'text-yellow-700' :
                              meal.type === 'lunch' ? 'text-orange-700' :
                              meal.type === 'dinner' ? 'text-red-700' :
                              'text-green-700'
                            }`}>
                              {meal.type.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{meal.name}</p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(meal.timestamp)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{meal.calories} cal</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'workout' ? 'bg-green-100' :
                        activity.type === 'meditation' ? 'bg-blue-100' :
                        activity.type === 'meal' ? 'bg-purple-100' :
                        activity.type === 'sleep' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          activity.type === 'workout' ? 'text-green-600' :
                          activity.type === 'meditation' ? 'text-blue-600' :
                          activity.type === 'meal' ? 'text-purple-600' :
                          activity.type === 'sleep' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        activity.type === 'workout' ? 'text-green-600' :
                        activity.type === 'meditation' ? 'text-blue-600' :
                        activity.type === 'meal' ? 'text-purple-600' :
                        activity.type === 'sleep' ? 'text-yellow-600' :
                        'text-purple-600'
                      }`}>
                        {typeof activity.reward === 'number' ? `+${activity.reward} WELL` : activity.reward}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals Progress */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Weekly Goals</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Exercise</span>
                      <span className="text-sm text-gray-500">{weeklyGoals.exercise.current}/{weeklyGoals.exercise.target} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(weeklyGoals.exercise.current / weeklyGoals.exercise.target) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Meditation</span>
                      <span className="text-sm text-gray-500">{weeklyGoals.meditation.current}/{weeklyGoals.meditation.target} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(weeklyGoals.meditation.current / weeklyGoals.meditation.target) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Sleep</span>
                      <span className="text-sm text-gray-500">{weeklyGoals.sleep.current}/{weeklyGoals.sleep.target} nights</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(weeklyGoals.sleep.current / weeklyGoals.sleep.target) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                
                {/* Reset Weekly Goals Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={resetWeeklyGoals}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                  >
                    🔄 Reset Weekly Goals
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Meal Logging Modal */}
        {showMealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Log Your Meal</h3>
                <button 
                  onClick={() => setShowMealModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                  <select
                    value={newMeal.type}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Description</label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Oatmeal with berries"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                    placeholder="e.g., 320"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowMealModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMeal}
                    disabled={!newMeal.name.trim() || !newMeal.calories.trim()}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Log Meal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Landing Page View
  // Check network before rendering any OnchainKit components
  if (address && chainId !== 84532) {
    return (
      <div className={cn(
        "min-h-screen w-full overflow-hidden transition-colors duration-300",
        isDarkMode ? "bg-black" : "bg-white"
      )}>
        <ThemeToggleButton />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 border-4 border-red-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className={cn(
              "text-2xl font-bold transition-colors mb-4",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>🚨 Wrong Network Detected</h2>
            <p className={cn(
              "transition-colors mb-6",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              You're currently connected to <strong>{chainId === 1 ? 'Ethereum Mainnet' : `Network ID ${chainId}`}</strong>.
              <br />
              WellSpace requires <strong>Base Sepolia Testnet (Chain ID: 84532)</strong>.
            </p>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    await (window.ethereum as any).request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: '0x14a34' }],
                    });
                  } catch (error: any) {
                    if (error.code === 4902) {
                      await addBaseSepoliaNetwork();
                    }
                  }
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                🔄 Switch to Base Sepolia Now
              </button>
              <button
                onClick={addBaseSepoliaNetwork}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors ml-3"
              >
                🔗 Add Base Sepolia to MetaMask
              </button>
            </div>
            <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-yellow-800">
              <p><strong>⚠️ Important:</strong> Transactions on the wrong network will fail and may charge you gas fees on the wrong blockchain!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen w-full transition-colors duration-300",
      isDarkMode ? "bg-black" : "bg-white"
    )}>
      <ThemeToggleButton />
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-16 lg:mb-20">
            <div className="flex items-center space-x-4">
              <img 
                src="/WellSpace_logo.png" 
                alt="WellSpace Logo" 
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl object-cover"
              />
              <div>
                <h1 className={cn(
                  "font-bold text-2xl lg:text-3xl transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>WellSpace</h1>
                <p className={cn(
                  "text-sm lg:text-base transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>Wellness reimagined</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              <nav className="flex space-x-8">
                <a href="#features" className={cn(
                  "transition-colors",
                  isDarkMode 
                    ? "text-gray-300 hover:text-white" 
                    : "text-gray-600 hover:text-black"
                )}>Features</a>
                <a href="#how-it-works" className={cn(
                  "transition-colors",
                  isDarkMode 
                    ? "text-gray-300 hover:text-white" 
                    : "text-gray-600 hover:text-black"
                )}>How it works</a>
                <a href="#rewards" className={cn(
                  "transition-colors",
                  isDarkMode 
                    ? "text-gray-300 hover:text-white" 
                    : "text-gray-600 hover:text-black"
                )}>Rewards</a>
              </nav>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="space-y-8">
              <div>
                <h2 className={cn(
                  "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  Transform your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">wellness</span>
                </h2>
                <p className={cn(
                  "text-lg lg:text-xl leading-relaxed max-w-2xl lg:max-w-none transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  AI-powered insights, blockchain rewards, and personalized health tracking in one seamless experience. Start your journey today.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                {!address ? (
                  <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                    <ConnectWallet />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                    <button 
                      onClick={startJourney}
                      disabled={isCheckingContract}
                      className={cn(
                        "px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg",
                        isDarkMode 
                          ? "bg-white text-black hover:bg-gray-100" 
                          : "bg-black text-white hover:bg-gray-800",
                        isCheckingContract ? "opacity-50 cursor-not-allowed" : ""
                      )}
                    >
                      {isCheckingContract ? 'Checking...' : (isUserOnboarded ? 'Continue Journey' : 'Get started')}
                    </button>
                  </div>
                )}
              </div>

              {/* App Infrastructure Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <div className={cn(
                    "text-3xl lg:text-4xl font-bold mb-1 transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>Base</div>
                  <div className={cn(
                    "text-sm transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>Layer 2 Network</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={cn(
                    "text-3xl lg:text-4xl font-bold mb-1 transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>AI + Web3</div>
                  <div className={cn(
                    "text-sm transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>Hybrid Architecture</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={cn(
                    "text-3xl lg:text-4xl font-bold mb-1 transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>Open</div>
                  <div className={cn(
                    "text-sm transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>Source & Transparent</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="mt-16 lg:mt-0 relative">
              <div className={cn(
                "rounded-3xl p-8 border shadow-2xl transition-colors duration-300",
                isDarkMode 
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" 
                  : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300"
              )}>
                <div className={cn(
                  "rounded-2xl p-6 border mb-6 transition-colors duration-300",
                  isDarkMode 
                    ? "bg-gray-900 border-gray-600" 
                    : "bg-white border-gray-400"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "text-sm transition-colors duration-300",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>Your wellness score</div>
                    <div className="text-green-500 text-sm font-medium">+12%</div>
                  </div>
                  <div className={cn(
                    "text-3xl font-bold transition-colors duration-300",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>2,840</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn(
                    "rounded-xl p-4 border transition-colors duration-300",
                    isDarkMode 
                      ? "bg-gray-800 border-gray-600" 
                      : "bg-gray-50 border-gray-400"
                  )}>
                    <div className={cn(
                      "text-xl font-bold mb-1 transition-colors duration-300",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>12</div>
                    <div className={cn(
                      "text-xs transition-colors duration-300",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>Day Streak</div>
                  </div>
                  <div className={cn(
                    "rounded-xl p-4 border transition-colors duration-300",
                    isDarkMode 
                      ? "bg-gray-800 border-gray-600" 
                      : "bg-gray-50 border-gray-400"
                  )}>
                    <div className={cn(
                      "text-xl font-bold mb-1 transition-colors duration-300",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>3</div>
                    <div className={cn(
                      "text-xs transition-colors duration-300",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>NFTs Earned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={cn(
        "py-20 lg:py-32 transition-colors duration-300",
        isDarkMode ? "bg-gray-900" : "bg-white"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className={cn(
              "text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Everything you need for wellness
            </h2>
            <p className={cn(
              "text-lg lg:text-xl max-w-3xl mx-auto transition-colors",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Comprehensive tools and insights to help you achieve your health goals while earning rewards
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors",
                isDarkMode 
                  ? "bg-gray-700 group-hover:bg-gray-600" 
                  : "bg-gray-200 group-hover:bg-gray-300"
              )}>
                <svg className={cn(
                  "w-8 h-8 transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className={cn(
                "text-xl lg:text-2xl font-bold mb-4 transition-colors",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>AI Health Insights</h3>
              <p className={cn(
                "leading-relaxed transition-colors",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Get personalized recommendations powered by advanced AI that learns from your wellness patterns and goals.
              </p>
            </div>

            <div className="text-center group">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors",
                isDarkMode 
                  ? "bg-gray-700 group-hover:bg-gray-600" 
                  : "bg-gray-200 group-hover:bg-gray-300"
              )}>
                <svg className={cn(
                  "w-8 h-8 transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                </svg>
              </div>
              <h3 className={cn(
                "text-xl lg:text-2xl font-bold mb-4 transition-colors",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>Wellness NFTs</h3>
              <p className={cn(
                "leading-relaxed transition-colors",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Mint unique NFTs that represent your wellness achievements and milestones on your health journey.
              </p>
            </div>

            <div className="text-center group">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors",
                isDarkMode 
                  ? "bg-gray-700 group-hover:bg-gray-600" 
                  : "bg-gray-200 group-hover:bg-gray-300"
              )}>
                <svg className={cn(
                  "w-8 h-8 transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className={cn(
                "text-xl lg:text-2xl font-bold mb-4 transition-colors",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>Earn $WELL Tokens</h3>
              <p className={cn(
                "leading-relaxed transition-colors",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Get rewarded with $WELL tokens for completing wellness activities and maintaining healthy habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={cn(
        "py-20 lg:py-32 transition-colors duration-300",
        isDarkMode ? "bg-gray-50" : "bg-gray-100"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className={cn(
              "text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 transition-colors",
              isDarkMode ? "text-gray-900" : "text-gray-900"
            )}>
              How it works
            </h2>
            <p className={cn(
              "text-lg lg:text-xl max-w-3xl mx-auto transition-colors",
              isDarkMode ? "text-gray-700" : "text-gray-600"
            )}>
              Simple steps to start your wellness journey with AI-powered insights and blockchain rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transition-colors",
                isDarkMode 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-800 text-white"
              )}>
                1
              </div>
              <h3 className={cn(
                "text-xl lg:text-2xl font-bold mb-4 transition-colors",
                isDarkMode ? "text-gray-900" : "text-gray-900"
              )}>Connect Wallet</h3>
              <p className={cn(
                "leading-relaxed transition-colors",
                isDarkMode ? "text-gray-700" : "text-gray-600"
              )}>
                Securely connect your Web3 wallet to start earning rewards and minting wellness NFTs.
              </p>
            </div>

            <div className="text-center">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transition-colors",
                isDarkMode 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-800 text-white"
              )}>
                2
              </div>
              <h3 className={cn(
                "text-xl lg:text-2xl font-bold mb-4 transition-colors",
                isDarkMode ? "text-gray-900" : "text-gray-900"
              )}>Track Wellness</h3>
              <p className={cn(
                "leading-relaxed transition-colors",
                isDarkMode ? "text-gray-700" : "text-gray-600"
              )}>
                Log your activities, get AI insights, and build healthy habits while earning $WELL tokens.
              </p>
            </div>

            <div className="text-center">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transition-colors",
                isDarkMode 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-800 text-white"
              )}>
                3
              </div>
              <h3 className={cn(
                "text-xl lg:text-2xl font-bold mb-4 transition-colors",
                isDarkMode ? "text-gray-900" : "text-gray-900"
              )}>Earn Rewards</h3>
              <p className={cn(
                "leading-relaxed transition-colors",
                isDarkMode ? "text-gray-700" : "text-gray-600"
              )}>
                Mint unique NFTs for milestones and accumulate $WELL tokens for your wellness achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className={cn(
        "py-20 lg:py-32 transition-colors duration-300",
        isDarkMode ? "bg-white" : "bg-white"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className={cn(
              "text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 transition-colors",
              isDarkMode ? "text-gray-900" : "text-gray-900"
            )}>
              Rewards & Incentives
            </h2>
            <p className={cn(
              "text-lg lg:text-xl max-w-3xl mx-auto transition-colors",
              isDarkMode ? "text-gray-700" : "text-gray-600"
            )}>
              Get rewarded for your wellness journey with $WELL tokens and unique NFTs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-2xl border transition-colors",
                isDarkMode 
                  ? "bg-gray-50 border-gray-200" 
                  : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    isDarkMode 
                      ? "bg-gray-800" 
                      : "bg-gray-800"
                  )}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold transition-colors",
                      isDarkMode ? "text-gray-900" : "text-gray-900"
                    )}>$WELL Token Rewards</h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-700" : "text-gray-600"
                    )}>Earn tokens for every wellness activity</p>
                  </div>
                </div>
                <ul className={cn(
                  "space-y-2 text-sm transition-colors",
                  isDarkMode ? "text-gray-700" : "text-gray-600"
                )}>
                  <li>• Workout completion: +50 WELL</li>
                  <li>• Meditation session: +25 WELL</li>
                  <li>• Meal logging: +10 WELL</li>
                  <li>• Sleep tracking: +30 WELL</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-2xl border transition-colors",
                isDarkMode 
                  ? "bg-gray-50 border-gray-200" 
                  : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    isDarkMode 
                      ? "bg-gray-800" 
                      : "bg-gray-800"
                  )}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold transition-colors",
                      isDarkMode ? "text-gray-900" : "text-gray-900"
                    )}>Wellness NFTs</h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-700" : "text-gray-600"
                    )}>Unique digital collectibles for milestones</p>
                  </div>
                </div>
                <ul className={cn(
                  "space-y-2 text-sm transition-colors",
                  isDarkMode ? "text-gray-700" : "text-gray-600"
                )}>
                  <li>• 7-day streak achievement</li>
                  <li>• Monthly wellness goals</li>
                  <li>• Special event participation</li>
                  <li>• Community challenges</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={cn(
        "py-12 sm:py-16 lg:py-24 xl:py-32 transition-colors duration-300",
        isDarkMode ? "bg-gray-800" : "bg-gray-50"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={cn(
              "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Ready to transform your wellness?
            </h2>
            <p className={cn(
              "text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed transition-colors",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Start your wellness journey today and discover the power of AI-powered insights combined with blockchain rewards.
            </p>

            {/* Wallet Connection Card */}
            <div className={cn(
              "rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg border mb-6 sm:mb-8 max-w-sm sm:max-w-md lg:max-w-lg mx-auto transition-colors duration-300",
              isDarkMode 
                ? "bg-gray-700 border-gray-600" 
                : "bg-white border-gray-200"
            )}>
              <h3 className={cn(
                "text-lg sm:text-xl font-bold mb-4 sm:mb-6 transition-colors",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                Connect Your Wallet
              </h3>
              <div className="w-full">
                <Wallet>
                  <ConnectWallet>
                    {address && (
                      <div className="flex items-center space-x-3 py-2 justify-center">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12" />
                        <div className="text-left">
                          <Name className={cn(
                            "text-base sm:text-lg font-medium transition-colors",
                            isDarkMode ? "text-white" : "text-white"
                          )} />
                          <div className={cn(
                            "text-xs sm:text-sm transition-colors",
                            isDarkMode ? "text-gray-400" : "text-gray-300"
                          )}>Connected</div>
                        </div>
                      </div>
                    )}
                  </ConnectWallet>
                </Wallet>
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={startJourney}
              className={cn(
                "w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg text-base sm:text-lg",
                isDarkMode 
                  ? "bg-white text-black hover:bg-gray-100" 
                  : "bg-black text-white hover:bg-gray-800"
              )}
            >
              Get started
            </button>


          </div>
        </div>
      </section>
    </div>
  );
}

// Main export with Theme Provider
export default function LandingPage() {
  return (
    <ThemeProvider>
      <LandingPageContent />
    </ThemeProvider>
  );
}
