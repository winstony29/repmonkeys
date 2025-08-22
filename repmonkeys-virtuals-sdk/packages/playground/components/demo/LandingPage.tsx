'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Image from 'next/image';


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
import { useAccount, useReadContract, useBalance, useWriteContract, useChainId, useDisconnect } from 'wagmi';
import { wellnessNFTAbi, wellTokenAbi, userProfileAbi, wellnessTrackerAbi, CONTRACT_ADDRESSES, formatTokenAmount, testContractConnectivity } from '@/lib/contracts';
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
   
   // Chat interface state
   const [showChatModal, setShowChatModal] = useState(false);
   const [chatMessages, setChatMessages] = useState<Array<{id: number, type: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
   const [currentMessage, setCurrentMessage] = useState('');
   const [thinkingProgress, setThinkingProgress] = useState({
     gymbro: 0,
     dietking: 0,
     sleepyjoe: 0,
     compiling: 0
   });
  
  // Contract status for user feedback
  const [contractStatus, setContractStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    timestamp: number;
  } | null>(null);
  
  // Loading state for contract data refresh
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  
  // Disconnect confirmation state
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedImageTheme, setSelectedImageTheme] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  
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
  
  // Modal states for quick actions
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  
  // Form states for quick actions
  const [workoutForm, setWorkoutForm] = useState({
    duration: '',
    sets: '',
    caloriesBurned: '',
    activityType: '',
    name: ''
  });
  
  const [meditationForm, setMeditationForm] = useState({
    duration: '',
    name: ''
  });
  
  const [sleepForm, setSleepForm] = useState({
    duration: ''
  });
  
  // User onboarding status
  const [isUserOnboarded, setIsUserOnboarded] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  const { isDarkMode } = useTheme();

  const { address } = useAccount();
  const { disconnect } = useDisconnect();
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
     
     // Add user message to chat
     const userMessage = {
       id: Date.now(),
       type: 'user' as const,
       content: wellnessPrompt,
       timestamp: new Date()
     };
     
     console.log('🔍 Setting chat messages and modal state...');
     setChatMessages(prev => [...prev, userMessage]);
     setShowChatModal(true);
     console.log('🔍 showChatModal set to true');
     setCurrentMessage('');
     
     // Start the thinking process
     setThinkingProgress({ gymbro: 0, dietking: 0, sleepyjoe: 0, compiling: 0 });
     
     // Simulate the agents thinking
     const simulateThinking = async () => {
       // Gymbro thinking
       for (let i = 0; i <= 100; i += 10) {
         await new Promise(resolve => setTimeout(resolve, 100));
         setThinkingProgress(prev => ({ ...prev, gymbro: i }));
       }
       
       // Dietking thinking
       for (let i = 0; i <= 100; i += 10) {
         await new Promise(resolve => setTimeout(resolve, 100));
         setThinkingProgress(prev => ({ ...prev, dietking: i }));
       }
       
       // Sleepyjoe thinking
       for (let i = 0; i <= 100; i += 10) {
         await new Promise(resolve => setTimeout(resolve, 100));
         setThinkingProgress(prev => ({ ...prev, sleepyjoe: i }));
       }
       
       // Compiling progress
       for (let i = 0; i <= 100; i += 20) {
         await new Promise(resolve => setTimeout(resolve, 150));
         setThinkingProgress(prev => ({ ...prev, compiling: i }));
       }
       
       // Add Smasher's response
       const smasherResponse = {
         id: Date.now() + 1,
         type: 'assistant' as const,
         content: generateSmasherResponse(wellnessPrompt),
         timestamp: new Date()
       };
       
       setChatMessages(prev => [...prev, smasherResponse]);
       setThinkingProgress({ gymbro: 0, dietking: 0, sleepyjoe: 0, compiling: 0 });
     };
     
     simulateThinking();
   };
   
   // Generate hardcoded responses from Smasher
   const generateSmasherResponse = (prompt: string): string => {
     const lowerPrompt = prompt.toLowerCase();
     
     if (lowerPrompt.includes('workout') || lowerPrompt.includes('exercise') || lowerPrompt.includes('gym')) {
       return "💪 Based on your workout goals, I recommend a balanced approach:\n\n🏃‍♂️ **Cardio**: 3-4 sessions per week, 30-45 minutes\n🏋️‍♂️ **Strength Training**: 3 sessions per week, focusing on compound movements\n🧘‍♀️ **Recovery**: Include stretching and rest days\n\nStart with 3 days per week and gradually increase intensity. Remember, consistency beats perfection!";
     }
     
     if (lowerPrompt.includes('diet') || lowerPrompt.includes('nutrition') || lowerPrompt.includes('food')) {
       return "🥗 Here's your personalized nutrition plan:\n\n🍳 **Breakfast**: Protein + complex carbs (eggs + oatmeal)\n🥙 **Lunch**: Lean protein + vegetables + healthy fats\n🍽️ **Dinner**: Light protein + vegetables\n🍎 **Snacks**: Nuts, fruits, or Greek yogurt\n\nAim for 3 meals + 2 snacks daily. Stay hydrated with 8+ glasses of water!";
     }
     
     if (lowerPrompt.includes('sleep') || lowerPrompt.includes('rest') || lowerPrompt.includes('bedtime')) {
       return "😴 Sleep optimization strategy:\n\n⏰ **Bedtime**: Aim for 7-9 hours, go to bed at the same time daily\n🌙 **Environment**: Dark, cool (65-68°F), quiet room\n📱 **Habits**: No screens 1 hour before bed, read or meditate instead\n☕ **Avoid**: Caffeine after 2 PM, heavy meals before bed\n\nQuality sleep is your foundation for wellness!";
     }
     
     if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety') || lowerPrompt.includes('mental')) {
       return "🧘‍♀️ Mental wellness approach:\n\n💆‍♂️ **Daily Practice**: 10-15 minutes meditation or deep breathing\n🏃‍♀️ **Physical Activity**: Exercise releases endorphins\n📝 **Journaling**: Write down thoughts and gratitude\n🎯 **Mindfulness**: Stay present, one task at a time\n\nRemember, mental health is just as important as physical health!";
     }
     
     // Default response
     return "🌟 Here's your comprehensive wellness advice:\n\n🎯 **Set Clear Goals**: Define what wellness means to you\n📊 **Track Progress**: Monitor your habits and improvements\n🔄 **Stay Consistent**: Small daily actions create lasting change\n🎉 **Celebrate Wins**: Acknowledge your progress, no matter how small\n\nYou're on the right path! Keep going! 💪";
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
            console.log('⚠️ Network switch failed - cannot log meal to blockchain');
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
              console.log('⚠️ Network switch failed after adding chain - cannot log meal to blockchain');
              return;
            }
          } else {
            console.log('⚠️ Network switch failed - cannot log meal to blockchain');
            return;
          }
        }
      }
      try {
        // Check if wellness data is initialized, if not, initialize it first
        if (!hasWellnessData) {
          console.log('🔄 Wellness data not initialized, initializing first...');
          const initialized = await initializeWellnessData();
          if (!initialized) {
            console.log('⚠️ Failed to initialize wellness data - cannot log meal to blockchain');
            return;
          }
          // Wait a moment for the initialization to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('🍽️ Logging meal to smart contract:', { type: newMeal.type, name: newMeal.name, calories: parseInt(newMeal.calories) });
        const txHash = await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logMeal',
          args: [newMeal.type, newMeal.name, BigInt(newMeal.calories), BigInt(0), BigInt(0), BigInt(0)],
        });
        console.log('✅ Meal transaction submitted:', txHash);
        console.log('⏳ Waiting for transaction confirmation...');
        
        // Wait a moment for the transaction to be mined
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Meal logged to smart contract successfully');
        
        // Show success message
        setContractStatus({
          type: 'success',
          message: '✅ Meal logged successfully! Your wellness score has been updated.',
          timestamp: Date.now()
        });
        
        // Note: Wellness score will update automatically via contract data refresh
        console.log('✅ Transaction successful - wellness score should update automatically');
      } catch (error) {
        console.error('❌ Error logging meal to smart contract:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          hasWellnessData,
          meal: newMeal
        });
        console.log('🔄 Smart contract failed - no localStorage fallback');
      }
    } else if (chainId !== 84532) {
      console.log('⚠️ Wrong network detected - cannot log meal to blockchain');
    }
    
    // Meal logged successfully
  };
  
  // Quick action functions
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'workout':
        setShowWorkoutModal(true);
        break;
      case 'meditation':
        setShowMeditationModal(true);
        break;
      case 'meal':
        setShowMealModal(true);
        break;
      case 'sleep':
        setShowSleepModal(true);
        break;
    }
  };
  
  // Handle workout logging with smart contract integration
  const handleLogWorkout = async () => {
    if (!address) {
      setContractError('Please connect your wallet to log workouts');
      return;
    }
    
    // Validate form
    if (!workoutForm.duration || !workoutForm.sets || !workoutForm.caloriesBurned) {
      setContractError('Please fill in all required fields');
      return;
    }
    
          try {
        setContractError(null);
        
        // Check if wellness data is initialized, if not, initialize it first
        if (!hasWellnessData) {
          console.log('🔄 Wellness data not initialized, initializing first...');
          const initialized = await initializeWellnessData();
          if (!initialized) {
            setContractError('Failed to initialize wellness data. Please try again.');
            return;
          }
          // Wait a moment for the initialization to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('🚀 Logging workout to smart contract...');
        
        // Call smart contract to log workout
        const txHash = await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logWorkout',
          args: [
            BigInt(workoutForm.duration),
            BigInt(workoutForm.sets),
            BigInt(workoutForm.caloriesBurned),
            workoutForm.activityType || 'General Workout',
            workoutForm.name || 'Workout Session',
            BigInt(50) // Reward for workout
          ]
        });
      
        console.log('✅ Workout transaction submitted:', txHash);
        console.log('⏳ Waiting for transaction confirmation...');
        
        // Wait a moment for the transaction to be mined
        await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success message
      setContractStatus({
        type: 'success',
        message: '✅ Workout logged successfully! Your wellness score has been updated.',
        timestamp: Date.now()
      });
      
      console.log('🎉 Workout successfully logged to blockchain!');
      
      // Reset form and close modal
      setWorkoutForm({
        duration: '',
        sets: '',
        caloriesBurned: '',
        activityType: '',
        name: ''
      });
      setShowWorkoutModal(false);
      
      // Note: Wellness score will update automatically via contract data refresh
      console.log('✅ Transaction successful - wellness score should update automatically');
      
    } catch (error) {
      console.error('❌ Failed to log workout to blockchain:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        hasWellnessData,
        workoutForm
      });
      setContractError(`Failed to log workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle meditation logging with smart contract integration
  const handleLogMeditation = async () => {
    if (!address) {
      setContractError('Please connect your wallet to log meditation');
      return;
    }
    
    // Validate form
    if (!meditationForm.duration) {
      setContractError('Please fill in duration');
      return;
    }
    
          try {
        setContractError(null);
        
        // Check if wellness data is initialized, if not, initialize it first
        if (!hasWellnessData) {
          console.log('🔄 Wellness data not initialized, initializing first...');
          const initialized = await initializeWellnessData();
          if (!initialized) {
            setContractError('Failed to initialize wellness data. Please try again.');
            return;
          }
          // Wait a moment for the initialization to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('🚀 Logging meditation to smart contract...');
        
        // Call smart contract to log meditation
        const txHash = await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logMeditation',
          args: [
            BigInt(meditationForm.duration),
            meditationForm.name || 'Meditation Session',
            BigInt(25) // Reward for meditation
          ]
        });
      
        console.log('✅ Meditation transaction submitted:', txHash);
        console.log('⏳ Waiting for transaction confirmation...');
        
        // Wait a moment for the transaction to be mined
        await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success message
      setContractStatus({
        type: 'success',
        message: '✅ Meditation logged successfully! Your wellness score has been updated.',
        timestamp: Date.now()
      });
      
      console.log('🎉 Meditation successfully logged to blockchain!');
      
      // Reset form and close modal
      setMeditationForm({
        duration: '',
        name: ''
      });
      setShowMeditationModal(false);
      
      // Note: Wellness score will update automatically via contract data refresh
      console.log('✅ Transaction successful - wellness score should update automatically');
      
    } catch (error) {
      console.error('❌ Failed to log meditation to blockchain:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        hasWellnessData,
        meditationForm
      });
      setContractError(`Failed to log meditation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle sleep logging with smart contract integration
  const handleLogSleep = async () => {
    if (!address) {
      setContractError('Please connect your wallet to log sleep');
      return;
    }
    
    // Validate form
    if (!sleepForm.duration) {
      setContractError('Please fill in sleep duration');
      return;
    }
    
    // Validate sleep duration doesn't exceed 24 hours
    const sleepHours = parseFloat(sleepForm.duration);
    if (sleepHours > 24) {
      setContractError('Sleep duration cannot exceed 24 hours');
      return;
    }
    
          try {
        setContractError(null);
        
        // Check if wellness data is initialized, if not, initialize it first
        if (!hasWellnessData) {
          console.log('🔄 Wellness data not initialized, initializing first...');
          const initialized = await initializeWellnessData();
          if (!initialized) {
            setContractError('Failed to initialize wellness data. Please try again.');
            return;
          }
          // Wait a moment for the initialization to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('🚀 Logging sleep to smart contract...');
        
        // Call smart contract to log sleep
        const txHash = await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logSleep',
          args: [BigInt(Math.round(parseFloat(sleepForm.duration)))], // Send duration in hours
        });
      
        console.log('✅ Sleep transaction submitted:', txHash);
        console.log('⏳ Waiting for transaction confirmation...');
        
        // Wait a moment for the transaction to be mined
        await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success message
      setContractStatus({
        type: 'success',
        message: '✅ Sleep logged successfully! Your wellness score has been updated.',
        timestamp: Date.now()
      });
      
      console.log('🎉 Sleep successfully logged to blockchain!');
      
      // Reset form and close modal
      setSleepForm({
        duration: ''
      });
      setShowSleepModal(false);
      
      // Note: Wellness score will update automatically via contract data refresh
      console.log('✅ Transaction successful - wellness score should update automatically');
      
    } catch (error) {
      console.error('❌ Failed to log sleep to blockchain:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        hasWellnessData,
        sleepForm
      });
      setContractError(`Failed to log sleep: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  
    // Enhanced Debug logging for main app
  useEffect(() => {
    if (address) {
      console.log('🔍 LandingPage Debug - Wallet connected:', address);
      console.log('🔍 LandingPage Debug - Chain ID:', chainId);
      console.log('🔍 LandingPage Debug - Contract Addresses:');
      console.log('  - WELLNESS_NFT:', CONTRACT_ADDRESSES.WELLNESS_NFT);
      console.log('  - WELL_TOKEN:', CONTRACT_ADDRESSES.WELL_TOKEN);
      console.log('  - WELLNESS_TRACKER:', CONTRACT_ADDRESSES.WELLNESS_TRACKER);
      console.log('  - USER_PROFILE:', CONTRACT_ADDRESSES.USER_PROFILE);
      console.log('  - REWARDS:', CONTRACT_ADDRESSES.REWARDS);
      console.log('🔍 LandingPage Debug - Contract Read Status:');
      console.log('  - Contract read error:', contractReadError);
      console.log('  - Profile error:', profileError);
      console.log('  - Wellness error:', wellnessError);
      console.log('🔍 LandingPage Debug - User Status:');
      console.log('  - Is onboarded:', isOnboarded);
      console.log('  - Has wellness data:', hasWellnessData);
      console.log('🔍 LandingPage Debug - Contract Data:');
      console.log('  - Profile data:', profileData);
      console.log('  - Wellness data:', wellnessData);
      console.log('  - Contract activities:', contractActivities);
      console.log('  - Contract meals:', contractMeals);
      console.log('🔍 LandingPage Debug - Local State:');
      console.log('  - Total score:', totalScore);
      console.log('  - Streak count:', streakCount);
      console.log('  - Well balance:', wellBalance);

      // Check if environment variables are missing
      const requiredVars = [
        'NEXT_PUBLIC_WELLNESS_NFT_ADDRESS',
        'NEXT_PUBLIC_WELL_TOKEN_ADDRESS',
        'NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS',
        'NEXT_PUBLIC_USER_PROFILE_ADDRESS',
        'NEXT_PUBLIC_REWARDS_ADDRESS'
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        console.warn('⚠️ LandingPage - Some environment variables appear undefined in this check:', missingVars);
        console.log('📝 Note: This can happen during Next.js hydration - environment variables may still load correctly');
      } else {
        console.log('✅ LandingPage - All environment variables are set');
      }

      // Test contract connectivity
      testContractConnectivity().catch(error => {
        console.error('❌ Contract connectivity test failed:', error);
      });
    }
  }, [address, chainId, contractReadError, profileError, wellnessError, isOnboarded, hasWellnessData, profileData, wellnessData, contractActivities, contractMeals, totalScore, streakCount, wellBalance]);

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
      console.log('🔍 LandingPage - Profile data loaded from contract:', profileData);
      setUserGoals([...(profileData[1] || [])]);
      setSelectedImageTheme(profileData[2] || '');
      setCustomPrompt(profileData[3] || '');
      setStreakCount(Number(profileData[4]) || 0);
      setTotalScore(Number(profileData[5]) || 0);
      setGeneratedImageUrl(profileData[8] || null);
      console.log('✅ LandingPage - Profile data processed and local state updated');
    }
  }, [profileData]);

  // Load wellness data from smart contract when available
  useEffect(() => {
    if (wellnessData && Array.isArray(wellnessData)) {
      // wellnessData is an array: [streakCount, totalScore, lastActivityTimestamp, dailyStreakStart, totalWorkouts, totalMeditations, totalMeals, totalSleepSessions]
      console.log('📊 Loading wellness data from smart contract:', wellnessData);
      
      const [contractStreakCount, contractTotalScore, lastActivityTimestamp, dailyStreakStart, totalWorkouts, totalMeditations, totalMeals, totalSleepSessions] = wellnessData;
      
      // Update local state with contract data
      setStreakCount(Number(contractStreakCount) || 0);
      setTotalScore(Number(contractTotalScore) || 0);
      
      // Debug timestamp conversion for wellness data
      if (lastActivityTimestamp > 0) {
        const lastActivityMs = Number(lastActivityTimestamp) * 1000;
        console.log(`🔍 Wellness data timestamp conversion: ${lastActivityTimestamp}s -> ${lastActivityMs}ms`);
      }
      if (dailyStreakStart > 0) {
        const dailyStreakMs = Number(dailyStreakStart) * 1000;
        console.log(`🔍 Daily streak timestamp conversion: ${dailyStreakStart}s -> ${dailyStreakMs}ms`);
      }
      
      // Note: Weekly goals are now handled by a separate getUserWeeklyGoals contract call
      // This keeps the wellness data structure simple with just basic counts
      
      console.log('✅ LandingPage - Wellness data loaded from smart contract successfully');
      console.log('🔍 LandingPage - Raw wellness data:', wellnessData);
      console.log('🔍 LandingPage - Parsed data:', {
        streakCount: Number(contractStreakCount),
        totalScore: Number(contractTotalScore),
        lastActivityTimestamp: Number(lastActivityTimestamp),
        dailyStreakStart: Number(dailyStreakStart),
        totalWorkouts: Number(totalWorkouts),
        totalMeditations: Number(totalMeditations),
        totalMeals: Number(totalMeals),
        totalSleepSessions: Number(totalSleepSessions)
      });
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
            // Contract timestamps are in SECONDS, convert to milliseconds for frontend
            const rawTimestamp = Number(activity[4]) || 0;
            const timestamp = rawTimestamp > 0 ? rawTimestamp * 1000 : Date.now();
            if (rawTimestamp > 0) {
              console.log(`🔍 Converting timestamp from seconds to milliseconds: ${rawTimestamp} -> ${timestamp}`);
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
            // Contract timestamps are in SECONDS, convert to milliseconds for frontend
            const rawTimestamp = Number(activity.timestamp) || 0;
            const timestamp = rawTimestamp > 0 ? rawTimestamp * 1000 : Date.now();
            if (rawTimestamp > 0) {
              console.log(`🔍 Converting timestamp from seconds to milliseconds: ${rawTimestamp} -> ${timestamp}`);
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
        console.log('✅ LandingPage - Activities loaded from smart contract successfully');
        console.log('🔍 LandingPage - Final formatted activities:', formattedActivities);
      } else {
        console.log('⚠️ LandingPage - Contract activities data incomplete - no fallback to localStorage');
        setActivities([]); // Set empty array instead of falling back
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
            // Contract timestamps are in SECONDS, convert to milliseconds for frontend
            const rawTimestamp = Number(meal[4]) || 0;
            const timestamp = rawTimestamp > 0 ? rawTimestamp * 1000 : Date.now();
            if (rawTimestamp > 0) {
              console.log(`🔍 Converting meal timestamp from seconds to milliseconds: ${rawTimestamp} -> ${timestamp}`);
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
            // Contract timestamps are in SECONDS, convert to milliseconds for frontend
            const rawTimestamp = Number(meal.timestamp) || 0;
            const timestamp = rawTimestamp > 0 ? rawTimestamp * 1000 : Date.now();
            if (rawTimestamp > 0) {
              console.log(`🔍 Converting meal timestamp from seconds to milliseconds: ${rawTimestamp} -> ${timestamp}`);
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
        console.log('✅ LandingPage - Meals loaded from smart contract successfully');
        console.log('🔍 LandingPage - Final formatted meals:', formattedMeals);
      } else {
        console.log('⚠️ LandingPage - Contract meals data incomplete - no fallback to localStorage');
        setMeals([]); // Set empty array instead of falling back
      }
    }
  }, [contractMeals, address]);
  
  // No more localStorage fallbacks - only use smart contract data

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
      
      // No localStorage fallbacks - only use smart contract data
      
      setIsSavingProfile(false);
      return true;
    } catch (error) {
      console.error('Error saving user profile to smart contract:', error);
      setContractError(error instanceof Error ? error.message : 'Failed to save profile');
      
      // No localStorage fallbacks - only use smart contract data
      setIsSavingProfile(false);
      return false;
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
                          <div className="flex-1">
                            <Name className="text-base font-semibold" />
                            <div className="text-sm text-gray-500">
                              {address.slice(0, 6)}...{address.slice(-4)}
                            </div>
                          </div>
                          {/* Disconnect Wallet Button */}
                          <button
                            onClick={() => setShowDisconnectConfirm(true)}
                            className={cn(
                              "p-2 rounded-lg transition-colors text-sm font-medium",
                              "text-red-600 hover:text-red-700 hover:bg-red-50"
                            )}
                            title="Disconnect Wallet"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </button>
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
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                    <Image 
                      src="/WellSpace_logo.png" 
                      alt="WellSpace Logo" 
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                    {/* Disconnect Wallet Button */}
                    <button
                      onClick={() => setShowDisconnectConfirm(true)}
                      className={cn(
                        "ml-2 p-1.5 rounded-lg transition-colors text-xs font-medium",
                        isDarkMode 
                          ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" 
                          : "text-red-600 hover:text-red-700 hover:bg-red-50"
                      )}
                      title="Disconnect Wallet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
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

          {/* Smart Contract Activity Status */}
          {contractStatus && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border transition-all duration-300",
              contractStatus.type === 'success'
                ? isDarkMode 
                  ? "bg-green-900/20 border-green-700/50 text-green-200" 
                  : "bg-green-50 border-green-200 text-green-800"
                : isDarkMode 
                  ? "bg-red-900/20 border-red-700/50 text-red-200" 
                  : "bg-red-50 border-red-200 text-red-800"
            )}>
              <div className="flex items-center space-x-3">
                <svg className={cn(
                  "w-5 h-5",
                  contractStatus.type === 'success' ? "text-green-500" : "text-red-500"
                )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                    contractStatus.type === 'success' 
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  } />
                </svg>
                <div>
                  <p className="font-medium">
                    {contractStatus.type === 'success' ? '✅ Smart Contract Success' : '❌ Smart Contract Error'}
                  </p>
                  <p className="text-sm opacity-90">{contractStatus.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {contractStatus.type === 'success' 
                      ? 'Your activity has been successfully logged to the blockchain!'
                      : 'There was an issue logging your activity. Please try again.'
                    }
                  </p>
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
                  <div className="flex items-center space-x-2">
                    <div className="text-green-500 text-sm font-medium">+12%</div>
                    <button
                      onClick={() => window.location.reload()}
                      className={cn(
                        "p-1 rounded-lg transition-colors hover:bg-gray-200",
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                      )}
                      title="Refresh wellness score"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={cn(
                  "text-4xl font-bold transition-colors duration-300",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>{totalScore}</div>
                <div className="mt-2 text-xs text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
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
                                     )}>AI Wellness Assistant - Smasher</h2>
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
                    onClick={() => {
                      console.log('🔍 Button clicked!');
                      console.log('🔍 Current view:', currentView);
                      console.log('🔍 Wellness prompt:', wellnessPrompt);
                      setCurrentMessage(wellnessPrompt);
                      getWellnessAdviceHandler();
                      console.log('🔍 After calling function - showChatModal should be true');
                    }}
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
        
        {/* Workout Modal */}
        {showWorkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Log Your Workout</h3>
                <button 
                  onClick={() => setShowWorkoutModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                  <input
                    type="text"
                    value={workoutForm.activityType}
                    onChange={(e) => setWorkoutForm(prev => ({ ...prev, activityType: e.target.value }))}
                    placeholder="e.g., Running, Weightlifting, Yoga"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workout Name</label>
                  <input
                    type="text"
                    value={workoutForm.name}
                    onChange={(e) => setWorkoutForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Morning Cardio, Upper Body Strength"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="45"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={workoutForm.sets}
                    onChange={(e) => setWorkoutForm(prev => ({ ...prev, sets: e.target.value }))}
                    placeholder="3"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories Burned</label>
                  <input
                    type="number"
                    min="1"
                    value={workoutForm.caloriesBurned}
                    onChange={(e) => setWorkoutForm(prev => ({ ...prev, caloriesBurned: e.target.value }))}
                    placeholder="300"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowWorkoutModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogWorkout}
                    disabled={!workoutForm.duration || !workoutForm.sets || !workoutForm.caloriesBurned}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Log Workout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Meditation Modal */}
        {showMeditationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Log Your Meditation</h3>
                <button 
                  onClick={() => setShowMeditationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Name</label>
                  <input
                    type="text"
                    value={meditationForm.name}
                    onChange={(e) => setMeditationForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Morning Mindfulness, Stress Relief"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={meditationForm.duration}
                    onChange={(e) => setMeditationForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="20"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowMeditationModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogMeditation}
                    disabled={!meditationForm.duration}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Log Meditation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Sleep Modal */}
        {showSleepModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Log Your Sleep</h3>
                <button 
                  onClick={() => setShowSleepModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepForm.duration}
                    onChange={(e) => setSleepForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="7.5"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowSleepModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogSleep}
                    disabled={!sleepForm.duration}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Log Sleep
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
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl overflow-hidden flex items-center justify-center">
                <Image 
                  src="/WellSpace_logo.png" 
                  alt="WellSpace Logo" 
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
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
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className={cn(
              "text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              How it works
            </h2>
            <p className={cn(
              "text-lg lg:text-xl max-w-3xl mx-auto transition-colors",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Simple steps to start your wellness journey with AI-powered insights and blockchain rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
                          <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transition-colors",
              isDarkMode 
                ? "bg-gray-700 text-white" 
                : "bg-gray-800 text-white"
            )}>
              1
            </div>
            <h3 className={cn(
              "text-xl lg:text-2xl font-bold mb-4 transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>Connect Wallet</h3>
            <p className={cn(
              "leading-relaxed transition-colors",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Securely connect your Web3 wallet to start earning rewards and minting wellness NFTs.
            </p>
            </div>

            <div className="text-center">
                          <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transition-colors",
              isDarkMode 
                ? "bg-gray-700 text-white" 
                : "bg-gray-800 text-white"
            )}>
              2
            </div>
            <h3 className={cn(
              "text-xl lg:text-2xl font-bold mb-4 transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>Track Wellness</h3>
            <p className={cn(
              "leading-relaxed transition-colors",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Log your activities, get AI insights, and build healthy habits while earning $WELL tokens.
            </p>
            </div>

            <div className="text-center">
                          <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transition-colors",
              isDarkMode 
                ? "bg-gray-700 text-white" 
                : "bg-gray-800 text-white"
            )}>
              3
            </div>
            <h3 className={cn(
              "text-xl lg:text-2xl font-bold mb-4 transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>Earn Rewards</h3>
            <p className={cn(
              "leading-relaxed transition-colors",
              isDarkMode ? "text-gray-300" : "text-gray-600"
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
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className={cn(
              "text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 transition-colors",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Rewards & Incentives
            </h2>
            <p className={cn(
              "text-lg lg:text-xl max-w-3xl mx-auto transition-colors",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Get rewarded for your wellness journey with $WELL tokens and unique NFTs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-2xl border transition-colors",
                isDarkMode 
                  ? "bg-gray-700 border-gray-600" 
                  : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    isDarkMode 
                      ? "bg-gray-600" 
                      : "bg-gray-800"
                  )}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold transition-colors",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>$WELL Token Rewards</h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    )}>Earn tokens for every wellness activity</p>
                  </div>
                </div>
                <ul className={cn(
                  "space-y-2 text-sm transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
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
                  ? "bg-gray-700 border-gray-600" 
                  : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    isDarkMode 
                      ? "bg-gray-600" 
                      : "bg-gray-800"
                  )}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold transition-colors",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Wellness NFTs</h3>
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    )}>Unique digital collectibles for milestones</p>
                  </div>
                </div>
                <ul className={cn(
                  "space-y-2 text-sm transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
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
      
               {/* Chat Modal Overlay - Only show on dashboard */}
         {(() => {
           console.log('🔍 Modal render check:', { showChatModal, currentView, shouldShow: showChatModal && currentView === 'dashboard' });
           return showChatModal && currentView === 'dashboard';
         })() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300">
          <div className={cn(
            "bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden transition-all duration-300",
            isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          )}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">AI Wellness Assistant - Smasher</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Gymbro, Dietking & Sleepyjoe</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChatModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.type === 'user' 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  )}>
                    <div className="whitespace-pre-line">{message.content}</div>
                    <div className={cn(
                      "text-xs mt-2",
                      message.type === 'user' ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Thinking Progress */}
              {thinkingProgress.gymbro > 0 && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">Gymbro is thinking...</span>
                    </div>
                    <div className="w-full bg-yellow-200 dark:bg-yellow-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${thinkingProgress.gymbro}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-300">{thinkingProgress.gymbro}%</span>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">D</span>
                      </div>
                      <span className="font-medium text-green-800 dark:text-green-200">Dietking is thinking...</span>
                    </div>
                    <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${thinkingProgress.dietking}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-300">{thinkingProgress.dietking}%</span>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">S</span>
                      </div>
                      <span className="font-medium text-blue-800 dark:text-blue-200">Sleepyjoe is thinking...</span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${thinkingProgress.sleepyjoe}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-300">{thinkingProgress.sleepyjoe}%</span>
                  </div>
                  
                  {thinkingProgress.compiling > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">⚡</span>
                        </div>
                        <span className="font-medium text-purple-800 dark:text-purple-200">Compiling progress...</span>
                      </div>
                      <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${thinkingProgress.compiling}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-purple-600 dark:text-purple-300">{thinkingProgress.compiling}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask Smasher anything about wellness..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && currentMessage.trim() && getWellnessAdviceHandler()}
                />
                <button
                  onClick={() => currentMessage.trim() && getWellnessAdviceHandler()}
                  disabled={!currentMessage.trim()}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={cn(
            "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
            isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
          )}>
            <div className="text-center mb-6">
              <h3 className={cn(
                "text-xl font-bold mb-2 transition-colors",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Disconnect Wallet?
              </h3>
              <p className={cn(
                "text-sm transition-colors",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                This will disconnect your wallet and you'll need to reconnect to continue using WellSpace.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg border transition-colors font-medium",
                  isDarkMode 
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  disconnect();
                  setShowDisconnectConfirm(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
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
