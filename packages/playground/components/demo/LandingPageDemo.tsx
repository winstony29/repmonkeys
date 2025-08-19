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

export default function LandingPageDemo() {
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

  const { address } = useAccount();
  const { getWellnessAdvice } = useWellnessAPI();

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

  // Get NFT metadata URI
  const { data: tokenUri } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_NFT,
    abi: wellnessNFTAbi,
    functionName: 'tokenURI',
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  });

  const startJourney = () => {
    setCurrentView('onboarding');
  };

  const completeOnboarding = () => {
    setCurrentView('dashboard');
  };

  const askWellnessQuestion = async () => {
    if (!wellnessPrompt.trim()) return;
    
    setIsLoadingAI(true);
    try {
      const response = await getWellnessAdvice(wellnessPrompt);
      setAiResponse(response);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setAiResponse({
        type: 'general',
        message: "I'm here to help with your wellness journey! Try asking about workouts, nutrition, or wellness tips."
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const formatWellBalance = () => {
    if (!wellBalance) return '0.00';
    return parseFloat(wellBalance.formatted).toFixed(2);
  };

  const wellnessGoals = [
    'Weight Management', 'Muscle Building', 'Cardio Health',
    'Better Sleep', 'Stress Relief', 'Energy Boost',
    'Nutrition', 'Mental Health', 'Flexibility'
  ];

  const imageThemes = [
    { id: 'nature', name: 'Nature Harmony', description: 'Serene landscapes and natural elements', emoji: '🌿' },
    { id: 'geometric', name: 'Geometric Wellness', description: 'Abstract patterns representing balance', emoji: '🔷' },
    { id: 'cosmic', name: 'Cosmic Energy', description: 'Galaxy and universe-inspired designs', emoji: '✨' },
    { id: 'minimalist', name: 'Zen Minimalism', description: 'Clean, simple, peaceful designs', emoji: '⚪' },
    { id: 'vibrant', name: 'Energy Burst', description: 'Colorful, dynamic, energizing visuals', emoji: '🌈' },
    { id: 'custom', name: 'Custom Vision', description: 'Describe your own unique concept', emoji: '🎨' }
  ];

  const toggleGoal = (goal: string) => {
    if (userGoals.includes(goal)) {
      setUserGoals(userGoals.filter(g => g !== goal));
    } else {
      setUserGoals([...userGoals, goal]);
    }
  };

  const generateWellnessImage = async () => {
    if (!selectedImageTheme && !customPrompt.trim()) return;
    
    setIsGeneratingImage(true);
    try {
      const prompt = selectedImageTheme === 'custom' 
        ? customPrompt 
        : `${imageThemes.find(t => t.id === selectedImageTheme)?.description} wellness NFT artwork, high quality, digital art`;
      
      console.log('Generating image with prompt:', prompt);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockImageUrl = `https://via.placeholder.com/400x400/6366F1/FFFFFF?text=${encodeURIComponent(selectedImageTheme || 'Custom')}`;
      setGeneratedImageUrl(mockImageUrl);
      
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Onboarding View
  if (currentView === 'onboarding') {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="aspect-[9/16] flex flex-col">
          {/* Header */}
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-lg">W</span>
                </div>
                <div>
                  <h1 className="text-slate-800 font-semibold text-lg">WellSpace</h1>
                  <p className="text-slate-600 text-xs">Your wellness journey</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('landing')}
                className="text-slate-600 hover:text-slate-800 transition-colors p-2 hover:bg-slate-200 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-rose-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Step {onboardingStep} of 4</span>
              <span className="text-sm text-slate-500">{Math.round((onboardingStep / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-rose-200 rounded-full h-2">
              <div 
                className="bg-rose-400 h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${(onboardingStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            {onboardingStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Connect Your Wallet</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Securely connect your wallet to start earning $WELL tokens and mint your unique wellness profile NFT.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <Wallet>
                    <ConnectWallet>
                      {address && (
                        <div className="flex items-center space-x-3 justify-center py-2">
                          <Avatar className="h-8 w-8" />
                          <div className="text-left">
                            <Name className="text-sm font-medium" />
                            <div className="text-xs text-slate-500 truncate max-w-[120px]">
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
                    className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Continue
                  </button>
                )}
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Choose Your Goals</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Select the wellness areas you'd like to focus on. We'll personalize your experience accordingly.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {wellnessGoals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                        userGoals.includes(goal)
                          ? "bg-green-100 border-green-300 text-green-700"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="font-medium text-sm">{goal}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setOnboardingStep(3)}
                  disabled={userGoals.length === 0}
                  className="w-full py-3 bg-green-400 hover:bg-green-500 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Continue ({userGoals.length} selected)
                </button>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Design Your NFT</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
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
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{theme.emoji}</span>
                            <div>
                              <div className="font-medium text-sm">{theme.name}</div>
                              <div className="text-xs text-slate-500 mt-1">{theme.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedImageTheme === 'custom' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Describe your vision</label>
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Describe your unique wellness NFT vision..."
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-sm"
                          rows={3}
                        />
                      </div>
                    )}

                    <button
                      onClick={generateWellnessImage}
                      disabled={isGeneratingImage || (!selectedImageTheme || (selectedImageTheme === 'custom' && !customPrompt.trim()))}
                      className="w-full py-3 bg-purple-400 hover:bg-purple-500 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isGeneratingImage ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating with AI...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2" />
                          </svg>
                          <span>Generate My NFT</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="font-semibold text-purple-700 text-sm mb-4">Your Generated NFT</h4>
                      <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-purple-300">
                        <img 
                          src={generatedImageUrl} 
                          alt="Generated Wellness NFT" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-purple-600">
                        Generated by Sogni AI • Ready to mint!
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setGeneratedImageUrl(null);
                          setSelectedImageTheme('');
                          setCustomPrompt('');
                        }}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                      >
                        Regenerate
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
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-emerald-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">You're All Set!</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your wellness profile is ready. Your NFT will be minted and you'll start earning $WELL tokens as you complete activities!
                </p>
                
                {generatedImageUrl && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h4 className="font-medium text-purple-700 text-sm mb-3">Your NFT Preview</h4>
                    <div className="w-20 h-20 mx-auto mb-3 rounded-lg overflow-hidden border border-purple-300">
                      <img 
                        src={generatedImageUrl} 
                        alt="Your Wellness NFT" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-purple-600">Ready to mint to your wallet!</p>
                  </div>
                )}
                
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-700 text-sm mb-3">Your Goals</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {userGoals.map((goal) => (
                      <span key={goal} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={completeOnboarding}
                  className="w-full py-4 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Start My Journey 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="aspect-[9/16] flex flex-col">
          {/* Header */}
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-lg">W</span>
                </div>
                <div>
                  <h1 className="text-slate-800 font-semibold text-lg">WellSpace</h1>
                  <p className="text-slate-600 text-xs">Dashboard</p>
                </div>
              </div>
              {address && (
                <div className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200">
                  ✓ Connected
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Profile Stats */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-indigo-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-indigo-600 text-2xl">⭐</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Wellness Warrior</h3>
                <p className="text-slate-600 text-sm">Level 3 • {tokenId && `NFT #${tokenId.toString()}`}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
                  <div className="text-2xl font-bold text-blue-500">{streakCount}</div>
                  <div className="text-xs text-slate-600 mt-1">Day Streak</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
                  <div className="text-2xl font-bold text-emerald-500">{formatWellBalance()}</div>
                  <div className="text-xs text-slate-600 mt-1">$WELL</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
                  <div className="text-2xl font-bold text-purple-500">{totalScore.toLocaleString()}</div>
                  <div className="text-xs text-slate-600 mt-1">Score</div>
                </div>
              </div>
            </div>

            {/* Today's Focus */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Today's Focus
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">Morning Meditation</div>
                    <div className="text-xs text-slate-600">15 min • Completed</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">Exercise Goal</div>
                    <div className="text-xs text-slate-600">30 min remaining</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-purple-600 text-xl">🧠</span>
                <h4 className="font-bold text-slate-900">AI Assistant</h4>
              </div>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={wellnessPrompt}
                  onChange={(e) => setWellnessPrompt(e.target.value)}
                  placeholder="Ask about workouts, recipes..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                />
                <button
                  onClick={askWellnessQuestion}
                  disabled={isLoadingAI || !wellnessPrompt.trim()}
                  className="px-6 py-3 bg-purple-400 text-white rounded-xl hover:bg-purple-500 disabled:bg-slate-300 transition-all duration-200 font-medium text-sm"
                >
                  {isLoadingAI ? '...' : 'Ask'}
                </button>
              </div>

              {aiResponse && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                    🧠 AI Response
                  </h4>
                  <div className="text-purple-600 text-sm">{aiResponse.message}</div>
                </div>
              )}
            </div>

            {/* Web3 Features */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Web3 Features
              </h4>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-xl">
                  <h5 className="text-sm font-medium text-slate-900 mb-3">Your Identity</h5>
                  {address ? (
                    <Identity address={address}>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10" />
                        <div className="flex flex-col">
                          <Name className="text-sm font-medium" />
                          <Address className="text-xs text-slate-500" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <EthBalance className="text-xs" />
                      </div>
                    </Identity>
                  ) : (
                    <div className="text-xs text-slate-500">Connect wallet to view identity</div>
                  )}
                </div>

                <div className="p-4 border border-slate-200 rounded-xl">
                  <h5 className="text-sm font-medium text-slate-900 mb-3">Fund Wallet</h5>
                  <FundButton />
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-amber-600 text-xl">🏆</span>
                <h4 className="font-bold text-slate-900">Weekly Rewards</h4>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Challenge Complete!</div>
                  <div className="text-sm text-slate-600">Claim 25 $WELL tokens</div>
                </div>
                <button className="bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200">
                  Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page View
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="aspect-[9/16] flex flex-col">
        {/* Header */}
        <div className="bg-slate-100 px-6 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-200 rounded-2xl flex items-center justify-center">
                <span className="text-blue-700 font-bold text-xl">W</span>
              </div>
              <div>
                <h1 className="text-slate-800 font-bold text-xl">WellSpace</h1>
                <p className="text-slate-600 text-sm">Your wellness journey</p>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
            <span className="text-amber-500">✨</span>
            <span>Built on Base • Powered by AI</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                Your personal wellness
                <span className="block text-purple-600">
                  journey, reimagined
                </span>
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Track habits, earn rewards, and get AI-powered insights to transform your health with blockchain technology.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-blue-700">AI Insights</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-green-700">Wellness NFTs</div>
              </div>
              
              <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-amber-700">$WELL Tokens</div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h4 className="text-lg font-bold text-slate-900 mb-4 text-center">
                Connect & Start
              </h4>
              <Wallet>
                <ConnectWallet>
                  {address && (
                    <div className="flex items-center space-x-3 justify-center py-2">
                      <Avatar className="h-8 w-8" />
                      <div className="text-center">
                        <Name className="text-sm font-medium" />
                        <div className="text-xs text-slate-500">Connected</div>
                      </div>
                    </div>
                  )}
                </ConnectWallet>
              </Wallet>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <button 
              onClick={startJourney}
              className="w-full py-4 bg-purple-400 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all duration-200 text-lg"
            >
              Start your journey →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}