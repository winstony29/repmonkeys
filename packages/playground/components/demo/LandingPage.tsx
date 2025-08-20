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
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { wellnessNFTAbi, wellTokenAbi, CONTRACT_ADDRESSES, formatTokenAmount } from '@/lib/contracts';
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

  const { isDarkMode } = useTheme();

  const { address } = useAccount();
  const { getWellnessAdvice } = useWellnessAPI();
  const { generateImage } = useSogniGeneration();

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

  const completeOnboarding = () => {
    setCurrentView('dashboard');
  };

  // Onboarding View
  if (currentView === 'onboarding') {
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

                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-800 font-medium text-sm">Ready to Begin!</p>
                      <p className="text-green-600 text-xs">Your profile and NFT are being prepared</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={completeOnboarding}
                  className={cn(
                    "w-full py-3 font-semibold rounded-xl transition-all duration-200",
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  )}
                >
                  Enter WellSpace
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
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isDarkMode ? "bg-white" : "bg-black"
                  )}>
                    <span className={cn(
                      "font-bold text-sm",
                      isDarkMode ? "text-black" : "text-white"
                    )}>W</span>
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
                      <div className={cn(
                        "text-xs transition-colors",
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {address.slice(0, 6)}...{address.slice(-4)}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={cn(
              "rounded-2xl p-6 border shadow-sm transition-colors",
              isDarkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-green-500 text-sm font-medium">+12%</span>
              </div>
              <div className={cn(
                "text-2xl font-bold mb-1 transition-colors",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>{totalScore}</div>
              <div className={cn(
                "text-sm transition-colors",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>Wellness Score</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <span className="text-green-500 text-sm font-medium">+2</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{streakCount}</div>
              <div className="text-sm text-gray-500">Day Streak</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-green-500 text-sm font-medium">+5.2</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {wellBalance ? formatTokenAmount(wellBalance.value, wellBalance.decimals) : '0.00'}
              </div>
              <div className="text-sm text-gray-500">$WELL Balance</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                  </svg>
                </div>
                <span className="text-blue-500 text-sm font-medium">New</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
              <div className="text-sm text-gray-500">NFTs Earned</div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - AI Assistant & Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Wellness Assistant */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Wellness Assistant</h2>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={wellnessPrompt}
                    onChange={(e) => setWellnessPrompt(e.target.value)}
                    placeholder="Ask me about your wellness goals, nutrition, exercise, or any health-related questions..."
                    className="w-full p-4 border border-gray-300 rounded-xl text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={getWellnessAdviceHandler}
                    disabled={isLoadingAI || !wellnessPrompt.trim()}
                    className="px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors"
                  >
                    {isLoadingAI ? 'Getting advice...' : 'Get AI Advice'}
                  </button>
                  {aiResponse && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-900 text-sm leading-relaxed">{aiResponse.advice || 'Here\'s your personalized wellness advice!'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 text-left group">
                    <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-300 transition-colors">
                      <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-2">Log Activity</h3>
                    <p className="text-green-700 text-sm">Track your daily wellness activities and earn rewards</p>
                  </button>
                  
                  <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 text-left group">
                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-300 transition-colors">
                      <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-purple-900 mb-2">View NFTs</h3>
                    <p className="text-purple-700 text-sm">Browse your wellness achievement NFTs</p>
                  </button>
                  
                  <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-left group">
                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-300 transition-colors">
                      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-900 mb-2">View Analytics</h3>
                    <p className="text-blue-700 text-sm">Deep dive into your wellness metrics</p>
                  </button>
                  
                  <button className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 text-left group">
                    <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-300 transition-colors">
                      <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-yellow-900 mb-2">Claim Rewards</h3>
                    <p className="text-yellow-700 text-sm">Redeem your earned $WELL tokens</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Completed workout</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <span className="text-sm font-medium text-green-600">+50 WELL</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Logged meditation</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">+25 WELL</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Minted new NFT</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                    <span className="text-sm font-medium text-purple-600">NFT</span>
                  </div>
                </div>
              </div>

              {/* Goals Progress */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Weekly Goals</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Exercise</span>
                      <span className="text-sm text-gray-500">4/5 days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Meditation</span>
                      <span className="text-sm text-gray-500">3/7 days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '43%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Sleep</span>
                      <span className="text-sm text-gray-500">6/7 nights</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '86%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Landing Page View
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
              <div className={cn(
                "w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-colors",
                isDarkMode ? "bg-white" : "bg-black"
              )}>
                <span className={cn(
                  "font-bold text-xl lg:text-2xl",
                  isDarkMode ? "text-black" : "text-white"
                )}>W</span>
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
                <button 
                  onClick={startJourney}
                  className={cn(
                    "px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg",
                    isDarkMode 
                      ? "bg-white text-black hover:bg-gray-100" 
                      : "bg-black text-white hover:bg-gray-800"
                  )}
                >
                  Get started
                </button>
                <button className={cn(
                  "px-8 py-4 border-2 font-semibold rounded-2xl transition-all duration-300 text-lg",
                  isDarkMode 
                    ? "border-gray-600 text-white hover:border-gray-400" 
                    : "border-gray-400 text-black hover:border-gray-600"
                )}>
                  Watch demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <div className={cn(
                    "text-3xl lg:text-4xl font-bold mb-1 transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>10K+</div>
                  <div className={cn(
                    "text-sm transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>Active users</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={cn(
                    "text-3xl lg:text-4xl font-bold mb-1 transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>500K</div>
                  <div className={cn(
                    "text-sm transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>$WELL earned</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={cn(
                    "text-3xl lg:text-4xl font-bold mb-1 transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>95%</div>
                  <div className={cn(
                    "text-sm transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>Success rate</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="mt-16 lg:mt-0 relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-600 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400 text-sm">Your wellness score</div>
                    <div className="text-green-400 text-sm font-medium">+12%</div>
                  </div>
                  <div className="text-white text-3xl font-bold">2,840</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-600">
                    <div className="text-white text-xl font-bold mb-1">12</div>
                    <div className="text-gray-400 text-xs">Day Streak</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-600">
                    <div className="text-white text-xl font-bold mb-1">3</div>
                    <div className="text-gray-400 text-xs">NFTs Earned</div>
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
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">AI Health Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized recommendations powered by advanced AI that learns from your wellness patterns and goals.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Wellness NFTs</h3>
              <p className="text-gray-600 leading-relaxed">
                Mint unique NFTs that represent your wellness achievements and milestones on your health journey.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-200 transition-colors">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Earn $WELL Tokens</h3>
              <p className="text-gray-600 leading-relaxed">
                Get rewarded with $WELL tokens for completing wellness activities and maintaining healthy habits.
              </p>
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
              Join thousands of users who are already earning rewards for their healthy lifestyle choices.
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
                            isDarkMode ? "text-white" : "text-gray-900"
                          )} />
                          <div className={cn(
                            "text-xs sm:text-sm transition-colors",
                            isDarkMode ? "text-gray-400" : "text-gray-500"
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

            {/* Trust Indicators */}
            <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className={cn(
                  "text-2xl sm:text-3xl font-bold mb-1 transition-colors",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>10K+</div>
                <div className={cn(
                  "text-sm sm:text-base transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>Active Users</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl sm:text-3xl font-bold mb-1 transition-colors",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>$500K</div>
                <div className={cn(
                  "text-sm sm:text-base transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>Rewards Earned</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl sm:text-3xl font-bold mb-1 transition-colors",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>95%</div>
                <div className={cn(
                  "text-sm sm:text-base transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>Success Rate</div>
              </div>
            </div>
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
