'use client';

import { useState, useEffect } from 'react';
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
import Modal from './Modal';

export default function LandingPage() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'dashboard' | 'settings'>('landing');
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
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const { address } = useAccount();
  const { getWellnessAdvice, generateWellnessImage: apiGenerateImage } = useWellnessAPI();

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
    query: { enabled: !!address },
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
    { 
      id: 'nature', 
      name: 'Nature & Zen', 
      description: 'Peaceful natural landscapes',
      prompt: 'serene natural landscape, peaceful zen garden, flowing water, lush greenery, meditation space, tranquil atmosphere',
      stylePrompt: 'wellness, peaceful, calming, nature photography, high quality, serene, beautiful lighting'
    },
    { 
      id: 'abstract', 
      name: 'Abstract Art', 
      description: 'Colorful abstract patterns',
      prompt: 'flowing abstract wellness art, harmonious colors, balanced composition, energy flow, chakra colors, peaceful patterns',
      stylePrompt: 'abstract art, wellness, colorful, balanced, harmonious, digital art, high quality, flowing'
    },
    { 
      id: 'geometric', 
      name: 'Geometric', 
      description: 'Clean geometric designs',
      prompt: 'geometric wellness mandala, sacred geometry, balanced patterns, symmetrical design, calming colors, mindfulness symbols',
      stylePrompt: 'geometric art, wellness, minimalist, clean, balanced, symmetrical, high quality, professional'
    },
    { 
      id: 'minimalist', 
      name: 'Minimalist', 
      description: 'Simple and elegant',
      prompt: 'minimalist wellness art, simple clean design, balanced composition, negative space, calming colors, zen aesthetic',
      stylePrompt: 'minimalist, wellness, clean, simple, elegant, zen, high quality, professional, balanced'
    },
    { 
      id: 'cosmic', 
      name: 'Cosmic', 
      description: 'Space and galaxy themes',
      prompt: 'cosmic wellness energy, galaxy meditation, starlight healing, celestial harmony, universe connection, peaceful cosmos',
      stylePrompt: 'cosmic art, wellness, galaxy, peaceful, ethereal, high quality, beautiful, spiritual, calming'
    },
    { 
      id: 'custom', 
      name: 'Custom', 
      description: 'Describe your own idea',
      prompt: '',
      stylePrompt: 'wellness, peaceful, calming, digital art, high quality, professional, beautiful'
    }
  ];

  const featureDetails = {
    'ai-insights': {
      title: 'AI Health Insights',
      description: 'Get personalized wellness recommendations powered by advanced AI technology. Our system analyzes your health data, activity patterns, and goals to provide actionable insights.',
      features: [
        'Personalized health recommendations',
        'Activity pattern analysis',
        'Goal-based suggestions',
        'Real-time health monitoring',
        'Predictive wellness analytics'
      ],
      benefits: 'Improve your wellness journey with data-driven insights that adapt to your unique lifestyle and health goals.'
    },
    'nft-minting': {
      title: 'Wellness NFTs',
      description: 'Mint unique NFTs that represent your wellness achievements and milestones. Each NFT is AI-generated and reflects your personal wellness journey.',
      features: [
        'AI-generated unique artwork',
        'Achievement-based minting',
        'Customizable themes',
        'Blockchain verified ownership',
        'Tradeable wellness collectibles'
      ],
      benefits: 'Own your wellness journey with verifiable, tradeable digital assets that celebrate your achievements.'
    },
    'token-rewards': {
      title: 'Earn $WELL Tokens',
      description: 'Get rewarded with $WELL tokens for maintaining healthy habits and achieving your wellness goals. Use tokens for premium features and rewards.',
      features: [
        'Habit-based token earning',
        'Goal achievement bonuses',
        'Daily activity rewards',
        'Premium feature access',
        'Community staking pools'
      ],
      benefits: 'Turn your healthy lifestyle into tangible rewards with our blockchain-based incentive system.'
    }
  };

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
    if (!selectedImageTheme && !customPrompt.trim()) return;
    
    setIsGeneratingImage(true);
    try {
      const selectedTheme = imageThemes.find(t => t.id === selectedImageTheme);
      
      let prompt, stylePrompt;
      if (selectedImageTheme === 'custom') {
        prompt = customPrompt;
        stylePrompt = 'wellness, peaceful, calming, digital art, high quality, professional, beautiful';
      } else if (selectedTheme) {
        prompt = selectedTheme.prompt;
        stylePrompt = selectedTheme.stylePrompt;
      } else {
        throw new Error('No theme selected');
      }
      
      console.log('Generating image with enhanced parameters:');
      console.log('- Theme:', selectedImageTheme);
      console.log('- Prompt:', prompt);
      console.log('- Style:', stylePrompt);
      
      // Call the Sogni API with enhanced options
      const options = {
        stylePrompt,
        negativePrompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature, deformed",
        steps: 35, // Higher quality
        guidance: 8.0, // Better prompt following
        aspectRatio: "1:1", // Square for NFT
        numberOfImages: 1
      };
      
      const data = await apiGenerateImage(prompt, options);
      
      if (data.imageUrls && data.imageUrls.length > 0) {
        setGeneratedImageUrl(data.imageUrls[0]);
        console.log('✅ Image generated successfully!');
        console.log('Metadata:', data.metadata);
      } else {
        throw new Error('No image URLs returned from API');
      }
      
    } catch (error) {
      console.error('Failed to generate image:', error);
      // Fallback to placeholder if Sogni API fails
      const fallbackImageUrl = `https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=AI-Error`;
      setGeneratedImageUrl(fallbackImageUrl);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const completeOnboarding = () => {
    setCurrentView('dashboard');
  };

  const openFeatureModal = (featureKey: string) => {
    setSelectedFeature(featureKey);
    setShowFeatureModal(true);
  };

  const closeFeatureModal = () => {
    setShowFeatureModal(false);
    setSelectedFeature(null);
  };

  const openSettings = () => {
    setCurrentView('settings');
  };

  // Settings View
  if (currentView === 'settings') {
    return (
      <div className="w-full max-w-sm mx-auto bg-black overflow-hidden min-h-screen relative">
        <div className="flex flex-col min-h-screen">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 py-2 text-white text-xs bg-black">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
              <svg className="w-4 h-4 ml-1" fill="white" viewBox="0 0 24 24">
                <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm14 14V6H6v12h12z"/>
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="bg-black px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-white font-semibold text-lg">Settings</h1>
                  <p className="text-gray-400 text-sm">Manage your preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
            <div className="space-y-6">
              {/* Account Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Profile Settings</p>
                          <p className="text-sm text-gray-500">Manage your personal information</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Privacy & Security</p>
                          <p className="text-sm text-gray-500">Control your data and privacy</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wellness Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Wellness</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Wellness Goals</p>
                          <p className="text-sm text-gray-500">Customize your health objectives</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 4.343l1.414 1.414m9.899 9.899l1.414 1.414m-9.9-1.414l1.414-1.414M19.071 4.929l-1.414 1.414M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Notifications</p>
                          <p className="text-sm text-gray-500">Manage reminders and alerts</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">App</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Help & Support</p>
                          <p className="text-sm text-gray-500">Get help and contact support</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Sign Out</p>
                          <p className="text-sm text-gray-500">Disconnect your wallet</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding View
  if (currentView === 'onboarding') {
    return (
      <div className="w-full max-w-sm mx-auto bg-black overflow-hidden relative">
        <div className="aspect-[9/16] flex flex-col">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 py-2 text-white text-xs bg-black">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
              <svg className="w-4 h-4 ml-1" fill="white" viewBox="0 0 24 24">
                <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm14 14V6H6v12h12z"/>
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="bg-black px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-white font-semibold text-lg">Get started</h1>
                  <p className="text-gray-400 text-sm">Step {onboardingStep} of 4</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-t-3xl px-6 py-8 overflow-y-auto">
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
                    className="w-full py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-base shadow-lg hover:shadow-xl"
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
                          ? "bg-black border-black text-white shadow-lg"
                          : "bg-white border-gray-200 text-gray-900 hover:border-gray-300 hover:shadow-md"
                      )}
                    >
                      <div className="font-medium">{goal}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setOnboardingStep(3)}
                  disabled={userGoals.length === 0}
                  className="w-full py-4 bg-black hover:bg-gray-900 disabled:bg-gray-300 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none text-base shadow-lg hover:shadow-xl disabled:shadow-none"
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
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-xl transition-all duration-200"
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

  // Dashboard View (existing wellness app content)
  if (currentView === 'dashboard') {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="aspect-[9/16] flex flex-col">
          {/* Header with Profile */}
          <div className="bg-gray-900 px-6 py-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-lg">W</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg">Welcome back!</h1>
                  {address && (
                    <p className="text-gray-300 text-sm">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentView('landing')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold">{totalScore}</div>
                <div className="text-gray-400 text-sm">Wellness Score</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold">{streakCount}</div>
                <div className="text-gray-400 text-sm">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6">
            {/* Token Balance */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-800 font-medium">$WELL Balance</p>
                  <p className="text-yellow-600 text-2xl font-bold">
                    {wellBalance ? formatTokenAmount(wellBalance.value, wellBalance.decimals) : '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* AI Wellness Assistant */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-blue-800 font-semibold mb-3">AI Wellness Assistant</h3>
              <div className="space-y-3">
                <textarea
                  value={wellnessPrompt}
                  onChange={(e) => setWellnessPrompt(e.target.value)}
                  placeholder="Ask me about your wellness goals, nutrition, or exercise..."
                  className="w-full p-3 border border-blue-200 rounded-lg text-sm resize-none h-20"
                />
                <button
                  onClick={getWellnessAdviceHandler}
                  disabled={isLoadingAI || !wellnessPrompt.trim()}
                  className="w-full py-2 bg-blue-400 hover:bg-blue-500 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  {isLoadingAI ? 'Getting advice...' : 'Get AI Advice'}
                </button>
                {aiResponse && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-blue-900 text-sm">{aiResponse.advice || 'Here\'s your personalized wellness advice!'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-gray-900 font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-green-50 border border-green-200 rounded-xl p-4 text-left hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="text-green-800 font-medium text-sm">Log Activity</div>
                  <div className="text-green-600 text-xs">Track your progress</div>
                </button>
                
                <button className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left hover:bg-purple-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <div className="text-purple-800 font-medium text-sm">View NFT</div>
                  <div className="text-purple-600 text-xs">My wellness NFT</div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-around">
              <button className="flex flex-col items-center space-y-1 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <span className="text-xs">Home</span>
              </button>
              <button className="flex flex-col items-center space-y-1 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs">Stats</span>
              </button>
              <button className="flex flex-col items-center space-y-1 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page View
  return (
    <div className="w-full max-w-sm mx-auto bg-black overflow-hidden min-h-screen relative">
      <div className="flex flex-col min-h-screen">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 py-2 text-white text-xs bg-black">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            </div>
            <svg className="w-4 h-4 ml-1" fill="white" viewBox="0 0 24 24">
              <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm14 14V6H6v12h12z"/>
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="bg-black px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">WellSpace</h1>
                <p className="text-gray-400 text-sm">Wellness reimagined</p>
              </div>
            </div>
            <button 
              onClick={openSettings}
              className="p-2 hover:bg-gray-800 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 -1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>

          {/* Hero Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                Transform your wellness
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                AI-powered insights, blockchain rewards, and personalized health tracking in one seamless experience.
              </p>
            </div>

            {/* Key Stat */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Your wellness score</p>
                  <p className="text-white text-2xl font-bold">2,840</p>
                </div>
                <div className="text-green-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
          {/* Features Cards */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Features</h3>
            
            <div 
              onClick={() => openFeatureModal('ai-insights')}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-200">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-base">AI Health Insights</h4>
                  <p className="text-gray-600 text-sm">Personalized recommendations based on your data</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div 
              onClick={() => openFeatureModal('nft-minting')}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-green-200">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-base">Wellness NFTs</h4>
                  <p className="text-gray-600 text-sm">Mint unique NFTs representing your achievements</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div 
              onClick={() => openFeatureModal('token-rewards')}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-yellow-200">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-base">Earn $WELL Tokens</h4>
                  <p className="text-gray-600 text-sm">Get rewarded for maintaining healthy habits</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h4 className="text-base font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h4>
            <Wallet>
              <ConnectWallet>
                {address && (
                  <div className="flex items-center space-x-3 py-2">
                    <Avatar className="h-8 w-8" />
                    <div>
                      <Name className="text-sm font-medium" />
                      <div className="text-xs text-gray-500">Connected</div>
                    </div>
                  </div>
                )}
              </ConnectWallet>
            </Wallet>
          </div>

          {/* CTA Button */}
          <button 
            onClick={startJourney}
            className="w-full py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-base shadow-lg hover:shadow-xl"
          >
            Get started
          </button>
        </div>
      </div>

      {/* Feature Modal */}
      {selectedFeature && (
        <Modal
          isOpen={showFeatureModal}
          onClose={closeFeatureModal}
          title={featureDetails[selectedFeature as keyof typeof featureDetails]?.title || ''}
        >
          <div className="space-y-6">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                {featureDetails[selectedFeature as keyof typeof featureDetails]?.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
              <ul className="space-y-2">
                {featureDetails[selectedFeature as keyof typeof featureDetails]?.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <h5 className="font-medium text-blue-900 mb-2">Benefits</h5>
              <p className="text-blue-800 text-sm">
                {featureDetails[selectedFeature as keyof typeof featureDetails]?.benefits}
              </p>
            </div>

            <button
              onClick={closeFeatureModal}
              className="w-full py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
