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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'dashboard'>('landing');
  const [wellnessPrompt, setWellnessPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [onboardingStep, setOnboardingStep] = useState(1);
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
      // Fallback to mock response
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
    'Lose weight', 'Build muscle', 'Improve cardiovascular health',
    'Better sleep', 'Reduce stress', 'Increase energy',
    'Better nutrition', 'Mental wellness', 'Flexibility and mobility'
  ];

  const toggleGoal = (goal: string) => {
    if (userGoals.includes(goal)) {
      setUserGoals(userGoals.filter(g => g !== goal));
    } else {
      setUserGoals([...userGoals, goal]);
    }
  };

  const renderAiResponse = () => {
    if (!aiResponse) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          🧠 AI Wellness Assistant
        </h4>
        
        {aiResponse.type === 'workout' && (
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <h5 className="font-medium text-blue-700 dark:text-blue-300 text-sm mb-1">Your Workout Plan:</h5>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Duration: {aiResponse.totalDuration} | Difficulty: {aiResponse.difficulty}
              </p>
            </div>
            <div className="space-y-2">
              {aiResponse.exercises?.map((exercise: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{exercise.name}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {exercise.sets} sets × {exercise.reps} reps
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {aiResponse.type === 'recipe' && (
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <h5 className="font-medium text-green-700 dark:text-green-300 text-sm mb-1">Recipe: {aiResponse.name}</h5>
              <p className="text-xs text-green-600 dark:text-green-400">
                Prep: {aiResponse.prepTime} | Cook: {aiResponse.cookTime}
              </p>
            </div>
            <div>
              <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Ingredients:</h6>
              <ul className="space-y-1">
                {aiResponse.ingredients?.map((ingredient: string, index: number) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400">• {ingredient}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {aiResponse.type === 'general' && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-purple-600 dark:text-purple-300 text-sm">{aiResponse.message}</p>
          </div>
        )}
      </div>
    );
  };

  // Onboarding View
  if (currentView === 'onboarding') {
    return (
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        <div className="aspect-[9/16] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-green-500">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <h1 className="text-white font-bold text-lg">WellSpace</h1>
            </div>
            <button
              onClick={() => setCurrentView('landing')}
              className="text-white/80 hover:text-white p-1"
            >
              ←
            </button>
          </div>

          {/* Onboarding Content */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to Your Wellness Journey!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Let's personalize your experience
              </p>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Step {onboardingStep} of 3</span>
                <span>{Math.round((onboardingStep / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(onboardingStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1">
              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Connect Your Wallet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Connect your wallet to start earning $WELL tokens and minting your wellness profile NFT.
                  </p>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Wallet>
                      <ConnectWallet>
                        {address && (
                          <div className="flex items-center space-x-2 justify-center">
                            <Avatar className="h-6 w-6" />
                            <Name className="text-sm" />
                          </div>
                        )}
                      </ConnectWallet>
                    </Wallet>
                  </div>
                  {address && (
                    <button
                      onClick={() => setOnboardingStep(2)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  )}
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Choose Your Goals</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Select what you want to focus on in your wellness journey.
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {wellnessGoals.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={cn(
                          "p-3 text-xs border rounded-lg transition-colors text-left",
                          userGoals.includes(goal)
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
                        )}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    disabled={userGoals.length === 0}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                  >
                    Continue ({userGoals.length} selected)
                  </button>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl">🎉</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">You're All Set!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Your wellness profile is ready. You'll start earning $WELL tokens as you complete activities!
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 text-sm mb-2">Your Goals:</h4>
                    <div className="flex flex-wrap gap-1">
                      {userGoals.map((goal) => (
                        <span key={goal} className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={completeOnboarding}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Start My Journey! 🚀
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="w-full max-w-sm mx-auto bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        <div className="aspect-[9/16] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-green-500">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <h1 className="text-white font-bold text-lg">WellSpace</h1>
            </div>
            <div className="flex items-center space-x-2">
              {address ? (
                <div className="bg-green-500/30 text-white text-xs px-2 py-1 rounded-lg">
                  ✓ Connected
                </div>
              ) : (
                <button className="bg-white/20 text-white text-xs px-3 py-1 rounded-lg hover:bg-white/30 transition-colors">
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Profile Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-lg">🌟</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Wellness Profile</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Level 3 • Wellness Warrior</p>
                {tokenId && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">NFT #{tokenId.toString()}</p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{streakCount}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Day Streak</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{formatWellBalance()}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">$WELL</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalScore.toLocaleString()}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Score</div>
                </div>
              </div>
            </div>

            {/* Today's Focus */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Today's Focus</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Morning Meditation</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">15 min • Completed</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">🎯</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Exercise Goal</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">30 min remaining</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Wellness Assistant */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-purple-600 dark:text-purple-400">🧠</span>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">AI Assistant</h4>
              </div>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={wellnessPrompt}
                  onChange={(e) => setWellnessPrompt(e.target.value)}
                  placeholder="Ask about workouts, recipes..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={askWellnessQuestion}
                  disabled={isLoadingAI || !wellnessPrompt.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {isLoadingAI ? '...' : 'Ask'}
                </button>
              </div>

              {renderAiResponse()}
            </div>

            {/* OnchainKit Integration */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm flex items-center space-x-2">
                <span>⚡</span>
                <span>Web3 Features</span>
              </h4>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Your Identity</h5>
                  {address ? (
                    <Identity address={address}>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8" />
                        <div className="flex flex-col">
                          <Name className="text-sm font-medium" />
                          <Address className="text-xs text-gray-500 dark:text-gray-400 truncate" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <EthBalance className="text-xs" />
                      </div>
                    </Identity>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400">Connect wallet to view identity</div>
                  )}
                </div>

                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Fund Wallet</h5>
                  <FundButton />
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-yellow-600 dark:text-yellow-400">🏆</span>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Rewards</h4>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Weekly Challenge!</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Claim 25 $WELL tokens</div>
                  </div>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                    Claim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page View
  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
      <div className="aspect-[9/16] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-green-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <h1 className="text-white font-bold text-lg">WellSpace</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="text-white/80 hover:text-white p-1"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Hero Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium mb-6 self-center">
            <span>✨</span>
            <span>Built on Base • Powered by AI</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                Your personal wellness
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                  journey, reimagined
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Track habits, earn rewards, and get AI-powered insights to transform your health.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 dark:text-blue-400">🧠</span>
                </div>
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Insights</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 dark:text-green-400">💖</span>
                </div>
                <div className="text-xs font-medium text-green-700 dark:text-green-300">Wellness NFTs</div>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-600 dark:text-yellow-400">⚡</span>
                </div>
                <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300">$WELL Tokens</div>
              </div>
            </div>

            {/* OnchainKit Demo */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Connect & Start
              </h4>
              <Wallet>
                <ConnectWallet>
                  {address && (
                    <div className="flex items-center space-x-2 justify-center">
                      <Avatar className="h-6 w-6" />
                      <Name className="text-sm" />
                    </div>
                  )}
                </ConnectWallet>
              </Wallet>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 mt-6">
              <button 
                onClick={startJourney}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                Start your journey →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}