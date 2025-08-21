'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletStatus } from '@/components/WalletStatus';
import { 
  Activity, 
  Utensils, 
  Target, 
  Trophy, 
  TrendingUp,
  Heart,
  Calendar,
  Zap,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  Wallet,
  Bed,
  User,
  CheckCircle,
  MessageSquare,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount, useReadContract, useBalance, useWriteContract, useChainId } from 'wagmi';
import { wellnessTrackerAbi, CONTRACT_ADDRESSES } from '@/lib/contracts';
import { http, createConfig, createStorage } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Wagmi configuration for standalone Farcaster page
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
  connectors: [
    coinbaseWallet({
      appName: 'WellSpace',
      appLogoUrl: '/WellSpace_logo.png',
      preference: 'smartWalletOnly',
    }),
    coinbaseWallet({
      appName: 'WellSpace',
      appLogoUrl: '/WellSpace_logo.png', 
      preference: 'eoaOnly',
    }),
  ],
  // Add wallet persistence and stability
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
  // Add connection stability
  pollingInterval: 4000,
  batch: {
    multicall: true,
  },
});

// Create QueryClient instance
const queryClient = new QueryClient();

// Farcaster User Context
const FarcasterContext = createContext<{
  userHandle: string | null;
  setUserHandle: (handle: string | null) => void;
  isConnected: boolean;
  connectUser: (handle: string) => void;
  disconnectUser: () => void;
}>({
  userHandle: null,
  setUserHandle: () => {},
  isConnected: false,
  connectUser: () => {},
  disconnectUser: () => {},
});

const useFarcaster = () => useContext(FarcasterContext);

// Farcaster Provider Component
function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [userHandle, setUserHandle] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectUser = (handle: string) => {
    setUserHandle(handle);
    setIsConnected(true);
    // Store in localStorage for persistence
    localStorage.setItem('farcaster_handle', handle);
  };

  const disconnectUser = () => {
    setUserHandle(null);
    setIsConnected(false);
    localStorage.removeItem('farcaster_handle');
  };

  useEffect(() => {
    // Check for existing connection on mount
    const savedHandle = localStorage.getItem('farcaster_handle');
    if (savedHandle) {
      setUserHandle(savedHandle);
      setIsConnected(true);
    }
  }, []);

  return (
    <FarcasterContext.Provider value={{
      userHandle,
      setUserHandle,
      isConnected,
      connectUser,
      disconnectUser
    }}>
      {children}
    </FarcasterContext.Provider>
  );
}

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

// Farcaster User Connection Modal
function FarcasterConnectionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [handle, setHandle] = useState('');
  const { connectUser } = useFarcaster();
  const { isDarkMode } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      connectUser(handle.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
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
            Connect Your Farcaster Handle
          </h3>
          <p className={cn(
            "text-sm transition-colors",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Enter your Farcaster handle to start tracking your wellness journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>
              Farcaster Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              className={cn(
                "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                isDarkMode 
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500" 
                  : "bg-white border-gray-300 text-black placeholder-gray-500 focus:border-gray-400"
              )}
              required
            />
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Connect
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Mobile Navigation Component
function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { address, isConnected } = useAccount();
  const { userHandle, isConnected: isFarcasterConnected, disconnectUser } = useFarcaster();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
            <img 
              src="/WellSpace_logo.png" 
              alt="WellSpace Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className={cn(
              "font-bold text-xl transition-colors",
              isDarkMode ? "text-white" : "text-black"
            )}>WellSpace</h1>
            <p className={cn(
              "text-xs transition-colors",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>Mobile</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* Farcaster Status */}
          {isFarcasterConnected && userHandle && (
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium transition-colors",
              isDarkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"
            )}>
              {userHandle}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg transition-all duration-300 hover:scale-110",
              isDarkMode 
                ? "bg-white text-gray-900 hover:bg-gray-100" 
                : "bg-gray-900 text-white hover:bg-gray-800"
            )}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-100"
            )}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={cn(
          "absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300",
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}>
          <div className="px-4 py-3 space-y-3">
            {/* Farcaster Connection Status */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm transition-colors",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}>Farcaster:</span>
              {isFarcasterConnected ? (
                <Badge variant="default" className="text-xs">
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Disconnected
                </Badge>
              )}
            </div>
            
            {isFarcasterConnected && userHandle && (
              <div className="text-xs">
                <span className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>Handle: </span>
                <span className={cn(
                  "font-medium transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  {userHandle}
                </span>
              </div>
            )}

            {/* Wallet Status */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm transition-colors",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}>Wallet:</span>
              {isConnected ? (
                <Badge variant="default" className="text-xs">
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Disconnected
                </Badge>
              )}
            </div>
            
            {isConnected && address && (
              <div className="text-xs">
                <span className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>Address: </span>
                <span className={cn(
                  "font-mono transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {!isFarcasterConnected ? (
                <Button 
                  onClick={() => {/* This will be handled by parent component */}}
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Connect Farcaster
                </Button>
              ) : (
                <Button 
                  onClick={disconnectUser}
                  variant="outline"
                  className="w-full"
                >
                  Disconnect Farcaster
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Mobile Dashboard
function MobileDashboard() {
  const { isDarkMode } = useTheme();
  const { address, isConnected } = useAccount();
  const { userHandle, isConnected: isFarcasterConnected } = useFarcaster();
  const [currentView, setCurrentView] = useState<'dashboard' | 'activity' | 'meals' | 'goals' | 'rewards' | 'ai-chat'>('dashboard');
  
  // Smart contract interaction
  const { writeContract, isPending: isWritingContract } = useWriteContract();
  const chainId = useChainId();
  
  // AI Chat state
  const [wellnessPrompt, setWellnessPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Meal logging state
  const [showMealModal, setShowMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState({ type: 'breakfast', name: '', calories: '' });
  
  // Activity and meal data
  const [activities, setActivities] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  
  // Get user wellness data from WellnessTracker contract (same as main page)
  const { data: wellnessData, error: wellnessError } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
    abi: wellnessTrackerAbi,
    functionName: 'getUserWellnessData',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get user's $WELL token balance (same as main page)
  const { data: wellBalance } = useBalance({
    address,
    token: CONTRACT_ADDRESSES.WELL_TOKEN,
  });

  // Get user's recent activities from smart contract
  const { data: contractActivities, error: activitiesError } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
    abi: wellnessTrackerAbi,
    functionName: 'getUserRecentActivities',
    args: address ? [address, BigInt(10)] : undefined,
    query: { enabled: !!address },
  });

  // Get user's recent meals from smart contract
  const { data: contractMeals, error: mealsError } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
    abi: wellnessTrackerAbi,
    functionName: 'getUserRecentMeals',
    args: address ? [address, BigInt(10)] : undefined,
    query: { enabled: !!address },
  });

  // Parse wellness data from smart contract
  const parsedWellnessData = wellnessData && Array.isArray(wellnessData) ? {
    streak: Number(wellnessData[0]) || 0,           // streakCount
    score: Number(wellnessData[1]) || 0,            // totalScore
    lastActivityTimestamp: Number(wellnessData[2]) || 0,
    dailyStreakStart: Number(wellnessData[3]) || 0,
    weeklyGoals: wellnessData[4] || null,
    activities: Number(wellnessData[5]) || 0,       // totalActivities
    meals: Number(wellnessData[6]) || 0,            // totalMeals
    wellBalance: wellBalance ? Number(wellBalance.formatted) : 0.00 // Real WELL balance from contract
  } : {
    streak: 0,
    score: 0,
    lastActivityTimestamp: 0,
    dailyStreakStart: 0,
    weeklyGoals: null,
    activities: 0,
    meals: 0,
    wellBalance: wellBalance ? Number(wellBalance.formatted) : 0.00 // Real WELL balance from contract
  };

  // Parse recent activities from smart contract
  const recentActivities = contractActivities && Array.isArray(contractActivities) ? 
    contractActivities.map((activity: any) => ({
      id: Number(activity[0]),
      type: activity[1],
      name: activity[2],
      reward: Number(activity[3]),
      timestamp: Number(activity[4]),
      completed: activity[5]
    })) : [];

  // Parse recent meals from smart contract
  const recentMeals = contractMeals && Array.isArray(contractMeals) ? 
    contractMeals.map((meal: any) => ({
      id: Number(meal[0]),
      type: meal[1],
      name: meal[2],
      calories: Number(meal[3]),
      timestamp: Number(meal[4])
    })) : [];

  // Functional activity logging with smart contract integration
  const handleLogActivity = async (type: string, name: string, reward: number) => {
    const newActivity = {
      id: Date.now(),
      type,
      name,
      timestamp: Date.now(),
      reward,
      completed: true
    };
    
    // Update local state immediately
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    
    // Save to smart contract if available
    if (address && chainId === 84532) {
      try {
        await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logActivity',
          args: [type, name, BigInt(reward)],
        });
        console.log('✅ Activity logged to smart contract');
      } catch (error) {
        console.log('🔄 Falling back to localStorage only');
      }
    }
    
    // Always save to localStorage as backup
    if (address) {
      const localStorageKey = `wellspace_user_${address}`;
      const existingData = localStorage.getItem(localStorageKey);
      if (existingData) {
        try {
          const userData = JSON.parse(existingData);
          userData.activities = [newActivity, ...(userData.activities || []).slice(0, 9)];
          localStorage.setItem(localStorageKey, JSON.stringify(userData));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }
    }
  };

  // Functional meal logging with smart contract integration
  const handleLogMeal = async () => {
    if (!newMeal.name.trim() || !newMeal.calories.trim()) return;
    
    const meal = {
      id: Date.now(),
      type: newMeal.type,
      name: newMeal.name,
      calories: parseInt(newMeal.calories),
      timestamp: Date.now()
    };
    
    setMeals(prev => [meal, ...prev.slice(0, 9)]);
    setNewMeal({ type: 'breakfast', name: '', calories: '' });
    setShowMealModal(false);
    
    // Save to smart contract if available
    if (address && chainId === 84532) {
      try {
        await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logMeal',
          args: [meal.type, meal.name, BigInt(meal.calories)],
        });
        console.log('✅ Meal logged to smart contract');
      } catch (error) {
        console.log('🔄 Falling back to localStorage only');
      }
    }
    
    // Always save to localStorage as backup
    if (address) {
      const localStorageKey = `wellspace_user_${address}`;
      const existingData = localStorage.getItem(localStorageKey);
      if (existingData) {
        try {
          const userData = JSON.parse(existingData);
          userData.meals = [meal, ...(userData.meals || []).slice(0, 9)];
          localStorage.setItem(localStorageKey, JSON.stringify(userData));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }
    }
  };

  // Functional sleep logging with smart contract integration
  const handleLogSleep = async () => {
    await handleLogActivity('sleep', 'Logged sleep', 30);
  };

  // AI Chat functionality (placeholder)
  const handleGetAIAdvice = async () => {
    if (!wellnessPrompt.trim()) return;
    
    setIsLoadingAI(true);
    try {
      // Simulate AI response (placeholder)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAiResponse('This is a placeholder AI response. In the full version, this would connect to your wellness AI service.');
    } catch (error) {
      console.error('Failed to get AI advice:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Safe JSON serialization function that handles BigInt
  const safeStringify = (obj: any) => {
    try {
      return JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );
    } catch (error) {
      return 'Error serializing data';
    }
  };

  // Debug logging to see what data we're getting
  useEffect(() => {
    console.log('Farcaster Page - Wellness Data:', wellnessData);
    console.log('Farcaster Page - WELL Balance:', wellBalance);
    console.log('Farcaster Page - Contract Activities:', contractActivities);
    console.log('Farcaster Page - Contract Meals:', contractMeals);
    console.log('Farcaster Page - Parsed Data:', parsedWellnessData);
  }, [wellnessData, wellBalance, contractActivities, contractMeals, parsedWellnessData]);

  return (
    <div className="pt-20 pb-6 px-4 min-h-screen transition-colors duration-300">
      <div className="max-w-md mx-auto">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className={cn(
                "text-2xl font-bold mb-2 transition-colors",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Welcome back!
              </h2>
              <p className={cn(
                "text-sm transition-colors",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Track your wellness journey and earn rewards
              </p>
              {isFarcasterConnected && userHandle && (
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isDarkMode ? "text-green-400" : "text-green-600"
                  )}>
                    Connected as {userHandle}
                  </span>
                </div>
              )}
            </div>

            {/* Wellness Score Card */}
            <Card className={cn(
              "transition-colors duration-300",
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className={cn(
                  "text-center text-lg transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  Your Wellness Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={cn(
                    "text-4xl font-bold mb-2 transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    {parsedWellnessData.score}
                  </div>
                  <div className="text-green-500 text-sm font-medium">+12% this week</div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className={cn(
                      "text-xl font-bold transition-colors",
                      isDarkMode ? "text-white" : "text-black"
                    )}>
                      {parsedWellnessData.streak}
                    </div>
                    <div className={cn(
                      "text-xs transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Day Streak
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-xl font-bold transition-colors",
                      isDarkMode ? "text-white" : "text-black"
                    )}>
                      3
                    </div>
                    <div className={cn(
                      "text-xs transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      NFTs Earned
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-xl font-bold transition-colors",
                      isDarkMode ? "text-white" : "text-black"
                    )}>
                      ${parsedWellnessData.wellBalance}
                    </div>
                    <div className={cn(
                      "text-xs transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      $WELL Balance
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button 
                onClick={() => setCurrentView('activity')}
                variant="outline"
                className="w-full h-12"
              >
                Log Activity
              </Button>
              <Button 
                onClick={() => setCurrentView('meals')}
                variant="outline"
                className="w-full h-12"
              >
                Log Meal
              </Button>
              <Button 
                onClick={() => setCurrentView('goals')}
                variant="outline"
                className="w-full h-12"
              >
                View Goals
              </Button>
              <Button 
                onClick={() => setCurrentView('ai-chat')}
                variant="outline"
                className="w-full h-12"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Wellness Chat
              </Button>
              <Button 
                onClick={() => setCurrentView('rewards')}
                variant="outline"
                className="w-full h-12"
              >
                Rewards & NFTs
              </Button>
            </div>

            {/* Recent Activity */}
            <Card className={cn(
              "transition-colors duration-300",
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className={cn(
                  "text-lg transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className={cn(
                          "text-sm transition-colors",
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {activity.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{(Date.now() - activity.timestamp) / 1000 / 60} min ago</div>
                        <div className="text-sm font-medium text-green-500">+{activity.reward} WELL</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      No recent activities. Start logging your wellness activities!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallet Status - Keep this for debugging connection issues */}
            <WalletStatus />
            
            {/* Debug Info - Remove this in production */}
            <Card className={cn(
              "transition-colors duration-300",
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className={cn(
                  "text-sm transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  Debug Info (Contract Data)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <strong>Raw Wellness Data:</strong> {safeStringify(wellnessData)}
                </div>
                <div className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <strong>WELL Balance:</strong> {safeStringify(wellBalance)}
                </div>
                <div className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <strong>Contract Activities:</strong> {safeStringify(contractActivities)}
                </div>
                <div className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <strong>Contract Meals:</strong> {safeStringify(contractMeals)}
                </div>
                <div className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <strong>Parsed Data:</strong> {safeStringify(parsedWellnessData)}
                </div>
                <div className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <strong>Wallet Connected:</strong> {isConnected ? 'Yes' : 'No'}
                </div>
                <div className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <strong>Wallet Address:</strong> {address || 'None'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ... rest of the views remain the same ... */}
        {currentView === 'activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className={cn(
                  "transition-colors",
                  isDarkMode ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-100"
                )}
              >
                ← Back
              </Button>
              <h2 className={cn(
                "text-xl font-bold transition-colors",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Log Activity
              </h2>
              <div></div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleLogSleep}
                variant="outline"
                className="w-full h-12"
              >
                <Bed className="w-4 h-4 mr-2" />
                Log Sleep
              </Button>
              <Button 
                onClick={() => handleLogActivity('running', 'Running (30 min)', 35)}
                variant="outline"
                className="w-full h-12"
              >
                Running (30 min)
              </Button>
              <Button 
                onClick={() => handleLogActivity('weight-training', 'Weight Training', 40)}
                variant="outline"
                className="w-full h-12"
              >
                Weight Training
              </Button>
              <Button 
                onClick={() => handleLogActivity('yoga', 'Yoga Session', 45)}
                variant="outline"
                className="w-full h-12"
              >
                Yoga Session
              </Button>
              <Button 
                onClick={() => handleLogActivity('cycling', 'Cycling', 30)}
                variant="outline"
                className="w-full h-12"
              >
                Cycling
              </Button>
            </div>
          </div>
        )}

        {currentView === 'meals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className={cn(
                  "transition-colors",
                  isDarkMode ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-100"
                )}
              >
                ← Back
              </Button>
              <h2 className={cn(
                "text-xl font-bold transition-colors",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Log Meal
              </h2>
              <div></div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleLogMeal}
                variant="outline"
                className="w-full h-12"
              >
                Breakfast
              </Button>
              <Button 
                onClick={handleLogMeal}
                variant="outline"
                className="w-full h-12"
              >
                Lunch
              </Button>
              <Button 
                onClick={handleLogMeal}
                variant="outline"
                className="w-full h-12"
              >
                Dinner
              </Button>
              <Button 
                onClick={handleLogMeal}
                variant="outline"
                className="w-full h-12"
              >
                Snack
              </Button>
            </div>
          </div>
        )}

        {currentView === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className={cn(
                  "transition-colors",
                  isDarkMode ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-100"
                )}
              >
                ← Back
              </Button>
              <h2 className={cn(
                "text-xl font-bold transition-colors",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Weekly Goals
              </h2>
              <div></div>
            </div>
            
            <div className="space-y-3">
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg transition-colors",
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              )}>
                <span className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Exercise 5x/week
                </span>
                <Badge variant={parsedWellnessData.activities >= 5 ? "default" : "secondary"}>
                  {parsedWellnessData.activities}/5
                </Badge>
              </div>
              
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg transition-colors",
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              )}>
                <span className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Log 3 meals/day
                </span>
                <Badge variant={parsedWellnessData.meals >= 21 ? "default" : "secondary"}>
                  {parsedWellnessData.meals}/21
                </Badge>
              </div>
              
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg transition-colors",
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              )}>
                <span className={cn(
                  "transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Maintain streak
                </span>
                <Badge variant={parsedWellnessData.streak >= 7 ? "default" : "secondary"}>
                  {parsedWellnessData.streak} days
                </Badge>
              </div>
            </div>
          </div>
        )}

        {currentView === 'rewards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className={cn(
                  "transition-colors",
                  isDarkMode ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-100"
                )}
              >
                ← Back
              </Button>
              <h2 className={cn(
                "text-xl font-bold transition-colors",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Rewards & NFTs
              </h2>
              <div></div>
            </div>
            
            <div className="space-y-4">
              <Card className={cn(
                "transition-colors duration-300",
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h3 className={cn(
                      "font-bold mb-2 transition-colors",
                      isDarkMode ? "text-white" : "text-black"
                    )}>
                      Earn $WELL Tokens
                    </h3>
                    <p className={cn(
                      "text-sm mb-3 transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Complete wellness activities to earn tokens
                    </p>
                    <Button variant="outline" className="w-full">
                      Claim Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(
                "transition-colors duration-300",
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h3 className={cn(
                      "font-bold mb-2 transition-colors",
                      isDarkMode ? "text-white" : "text-black"
                    )}>
                      Mint Wellness NFTs
                    </h3>
                    <p className={cn(
                      "text-sm mb-3 transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Unlock achievements as unique NFTs
                    </p>
                    <Button variant="outline" className="w-full">
                      View Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* AI Chat View */}
        {currentView === 'ai-chat' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className={cn(
                  "transition-colors",
                  isDarkMode ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-100"
                )}
              >
                ← Back
              </Button>
              <h2 className={cn(
                "text-xl font-bold transition-colors",
                isDarkMode ? "text-white" : "text-black"
              )}>
                AI Wellness Assistant
              </h2>
              <div></div>
            </div>
            
            <Card className={cn(
              "transition-colors duration-300",
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  )}>
                    <Brain className={cn(
                      "w-5 h-5 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )} />
                  </div>
                  <h3 className={cn(
                    "text-lg font-semibold transition-colors",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>AI Wellness Assistant</h3>
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
                  <Button
                    onClick={handleGetAIAdvice}
                    disabled={isLoadingAI || !wellnessPrompt.trim()}
                    className="w-full"
                  >
                    {isLoadingAI ? 'Getting advice...' : 'Get AI Advice'}
                  </Button>
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
                      )}>{aiResponse}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Meal Logging Modal */}
        {showMealModal && (
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
                  Log Your Meal
                </h3>
                <p className={cn(
                  "text-sm transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Track your nutrition to maintain a healthy lifestyle
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleLogMeal(); }} className="space-y-4">
                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Meal Type
                  </label>
                  <select
                    value={newMeal.type}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value }))}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Meal Name
                  </label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Grilled chicken salad"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black placeholder-gray-500 focus:border-gray-400"
                    )}
                    required
                  />
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories
                  </label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                    placeholder="e.g., 450"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black placeholder-gray-500 focus:border-gray-400"
                    )}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMealModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Log Meal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Farcaster Page Component
function FarcasterPageContent() {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const { isConnected: isFarcasterConnected } = useFarcaster();

  // Show connection modal if not connected
  useEffect(() => {
    if (!isFarcasterConnected) {
      setShowConnectionModal(true);
    }
  }, [isFarcasterConnected]);

  return (
    <div className={cn(
      "min-h-screen w-full transition-colors duration-300",
      "bg-white dark:bg-black"
    )}>
      <MobileNavigation />
      <MobileDashboard />
      
      <FarcasterConnectionModal 
        isOpen={showConnectionModal} 
        onClose={() => setShowConnectionModal(false)} 
      />
    </div>
  );
}

// Main export with standalone providers
export default function FarcasterPage() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FarcasterProvider>
            <FarcasterPageContent />
          </FarcasterProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
