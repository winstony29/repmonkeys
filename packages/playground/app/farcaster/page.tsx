'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletStatus } from '@/components/WalletStatus';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Brain,
  Dumbbell,
  EditIcon,
  Coffee
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount, useReadContract, useBalance, useWriteContract, useChainId, useDisconnect, useConnect } from 'wagmi';
import { wellnessTrackerAbi, wellnessNFTAbi, CONTRACT_ADDRESSES, testContractConnectivity } from '@/lib/contracts';
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
          appLogoUrl: (() => {
            if (typeof window !== 'undefined') {
              const logoUrl = `${window.location.protocol}//${window.location.host}/WellSpace_logo.png`;
              console.log('🔍 Farcaster App - Coinbase Wallet Logo URL:', logoUrl);
              
              // Test if logo is accessible
              const testImg = new Image();
              testImg.onload = () => console.log('✅ Farcaster App - Logo image loads successfully');
              testImg.onerror = () => console.error('❌ Farcaster App - Logo image failed to load');
              testImg.src = logoUrl;
              
              return logoUrl;
            }
            return '/WellSpace_logo.png';
          })(),
          preference: 'smartWalletOnly',
        }),
          coinbaseWallet({
        appName: 'WellSpace',
        appLogoUrl: typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/WellSpace_logo.png` : '/WellSpace_logo.png',
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
  const [isInitialized, setIsInitialized] = useState(false);

  const connectUser = useCallback((handle: string) => {
    setUserHandle(handle);
    setIsConnected(true);
    localStorage.setItem('farcaster_handle', handle);
  }, []);

  const disconnectUser = useCallback(() => {
    setUserHandle(null);
    setIsConnected(false);
    localStorage.removeItem('farcaster_handle');
  }, []);

  useEffect(() => {
    // Check for existing connection on mount - only once
    if (!isInitialized) {
      const savedHandle = localStorage.getItem('farcaster_handle');
      if (savedHandle) {
        setUserHandle(savedHandle);
        setIsConnected(true);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

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
          <p className={cn(
            "text-xs transition-colors mt-2",
            isDarkMode ? "text-gray-500" : "text-gray-500"
          )}>
            Note: You'll also need to connect your wallet to access all features
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
  const { disconnect } = useDisconnect();
  const { userHandle, isConnected: isFarcasterConnected } = useFarcaster();
  const [currentView, setCurrentView] = useState<'dashboard' | 'activity' | 'meals' | 'goals' | 'rewards' | 'ai-chat' | 'nft-generation'>('dashboard');
  
  // Modal states for quick actions
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
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
  
  const [mealForm, setMealForm] = useState({
    mealType: '',
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: ''
  });
  
  const [sleepForm, setSleepForm] = useState({
    duration: ''
  });
  
  // Disconnect confirmation state
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  
  // Smart contract interaction
  const { writeContract, isPending: isWritingContract } = useWriteContract();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  
  // AI Chat state
  const [wellnessPrompt, setWellnessPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // NFT Generation state
  const [nftTheme, setNftTheme] = useState<'minimalist' | 'cosmic' | 'custom' | null>(null);
  const [customNftPrompt, setCustomNftPrompt] = useState('');
  const [isGeneratingNFT, setIsGeneratingNFT] = useState(false);
  const [generatedNFTImage, setGeneratedNFTImage] = useState<string | null>(null);
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  
  // Contract status for user feedback
  const [contractStatus, setContractStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    timestamp: number;
  } | null>(null);
  
  // Meal logging state (using the new form structure)
  const [newMeal, setNewMeal] = useState({ type: 'breakfast', name: '', calories: '' });
  
  // Activity and meal data
  const [activities, setActivities] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  
  // Current time for client-side calculations (prevents hydration issues)
  const [currentTime, setCurrentTime] = useState(0);
  


  // Sample activities for demonstration when no contract data is available
  const [sampleActivities, setSampleActivities] = useState([
    { id: 1, type: 'workout', name: 'Completed workout', timestamp: 0, reward: 50, completed: true },
    { id: 2, type: 'meditation', name: 'Logged meditation', timestamp: 0, reward: 25, completed: true },
    { id: 3, type: 'sleep', name: 'Logged sleep', timestamp: 0, reward: 30, completed: true }
  ]);

  // Initialize sample activities with proper timestamps on client side only
  useEffect(() => {
    const now = Date.now();
    setCurrentTime(now);
    setSampleActivities([
      { id: 1, type: 'workout', name: 'Completed workout', timestamp: now - 2 * 60 * 60 * 1000, reward: 50, completed: true },
      { id: 2, type: 'meditation', name: 'Logged meditation', timestamp: now - 5 * 60 * 60 * 1000, reward: 25, completed: true },
      { id: 3, type: 'sleep', name: 'Logged sleep', timestamp: now - 24 * 60 * 60 * 1000, reward: 30, completed: true }
    ]);
    
    // Initialize sample NFTs
    setUserNFTs([
      {
        tokenId: 1,
        image: 'https://image.pollinations.ai/prompt/minimalist%20wellness%20art%2C%20clean%20lines%2C%20simple%20shapes%2C%20meditation%20symbols%2C%20zen%20aesthetic%2C%20white%20space%2C%20elegant%20design?width=512&height=512&seed=123',
        metadata: {
          name: 'Wellness NFT - Minimalist',
          description: 'AI-generated minimalist wellness art',
          theme: 'minimalist'
        },
        mintedAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        tokenId: 2,
        image: 'https://image.pollinations.ai/prompt/cosmic%20wellness%20art%2C%20space%20galaxy%20theme%2C%20stars%2C%20nebula%2C%20cosmic%20energy%2C%20wellness%20symbols%2C%20vibrant%20colors%2C%20mystical?width=512&height=512&seed=456',
        metadata: {
          name: 'Wellness NFT - Cosmic',
          description: 'AI-generated cosmic wellness art',
          theme: 'cosmic'
        },
        mintedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
    
    // Update current time every minute for time difference calculations
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    

    
    return () => clearInterval(interval);
  }, []);
  
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
    // Contract timestamps are in SECONDS, convert to milliseconds for frontend
    lastActivityTimestamp: Number(wellnessData[2]) > 0 ? Number(wellnessData[2]) * 1000 : 0,
    dailyStreakStart: Number(wellnessData[3]) > 0 ? Number(wellnessData[3]) * 1000 : 0,
    workouts: Number(wellnessData[4]) || 0,         // totalWorkouts
    meditations: Number(wellnessData[5]) || 0,      // totalMeditations
    meals: Number(wellnessData[6]) || 0,            // totalMeals
    sleepSessions: Number(wellnessData[7]) || 0,    // totalSleepSessions
    wellBalance: wellBalance ? Number(wellBalance.formatted) : 0.00 // Real WELL balance from contract
  } : {
    streak: 0,
    score: 0,
    lastActivityTimestamp: 0,
    dailyStreakStart: 0,
    weeklyGoals: null,
    workouts: 0,
    meditations: 0,
    meals: 0,
    sleepSessions: 0,
    wellBalance: wellBalance ? Number(wellBalance.formatted) : 0.00 // Real WELL balance from contract
  };

  // Parse recent activities from smart contract
  const recentActivities = contractActivities && Array.isArray(contractActivities) && contractActivities.length > 0 ? 
    contractActivities.map((activity: any) => {
      // Handle different possible data structures
      let parsedActivity;
      
      if (Array.isArray(activity)) {
        // Array format: [id, type, name, reward, timestamp, completed]
        // Contract timestamps are in SECONDS, convert to milliseconds for frontend
        const rawTimestamp = Number(activity[4]) || 0;
        const timestampInMs = rawTimestamp > 0 ? rawTimestamp * 1000 : 0;
        
        parsedActivity = {
          id: Number(activity[0]) || 0,
          type: activity[1] || 'unknown',
          name: activity[2] || 'Unknown Activity',
          reward: Number(activity[3]) || 0,
          timestamp: timestampInMs,
          completed: activity[5] || false
        };
      } else if (typeof activity === 'object' && activity !== null) {
        // Object format: {id, type, name, reward, timestamp, completed}
        // Contract timestamps are in SECONDS, convert to milliseconds for frontend
        const rawTimestamp = Number(activity.timestamp) || 0;
        const timestampInMs = rawTimestamp > 0 ? rawTimestamp * 1000 : 0;
        
        parsedActivity = {
          id: Number(activity.id) || 0,
          type: activity.type || 'unknown',
          name: activity.name || 'Unknown Activity',
          reward: Number(activity.reward) || 0,
          timestamp: timestampInMs,
          completed: activity.completed || false
        };
      } else {
        // Fallback for unexpected data
        parsedActivity = {
          id: 0,
          type: 'unknown',
          name: 'Unknown Activity',
          reward: 0,
          timestamp: 0,
          completed: false
        };
      }
      
      return parsedActivity;
    }) : sampleActivities; // Use sample activities if no contract data

  // Calculate actual wellness score from recent activities to match what's displayed
  const calculatedWellnessScore = recentActivities.reduce((total, activity) => total + activity.reward, 0);
  
  // Always use contract data as source of truth, but show calculated score if contract data is 0
  const displayWellnessScore = parsedWellnessData.score > 0 ? parsedWellnessData.score : calculatedWellnessScore;

  // Parse recent meals from smart contract
  const recentMeals = contractMeals && Array.isArray(contractMeals) ? 
    contractMeals.map((meal: any) => {
      // Contract timestamps are in SECONDS, convert to milliseconds for frontend
      const rawTimestamp = Number(meal[4]) || 0;
      const timestampInMs = rawTimestamp > 0 ? rawTimestamp * 1000 : 0;
      
      return {
        id: Number(meal[0]),
        type: meal[1],
        name: meal[2],
        calories: Number(meal[3]),
        timestamp: timestampInMs
      };
    }) : [];

  // Functional activity logging with smart contract integration
  const handleLogActivity = async (type: string, name: string, reward: number) => {
    const now = Date.now();
    const newActivity = {
      id: now,
      type,
      name,
      timestamp: now,
      reward,
      completed: true
    };
    
    // Update local state immediately
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    
    // Save to smart contract if available
    if (address && chainId === 84532) {
      try {
        console.log('🚀 Logging activity to smart contract:', { type, name, reward });
        console.log('📝 Contract Address:', CONTRACT_ADDRESSES.WELLNESS_TRACKER);
        console.log('🔗 Chain ID:', chainId);
        console.log('👤 User Address:', address);
        
        // Map old activity types to new contract functions
        let result;
        if (type === 'workout') {
          result = await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
            functionName: 'logWorkout',
            args: [BigInt(30), BigInt(1), BigInt(100), 'General Workout', name, BigInt(50)],
          });
        } else if (type === 'meditation') {
          result = await writeContract({
            address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
            abi: wellnessTrackerAbi,
            functionName: 'logMeditation',
            args: [BigInt(20), name, BigInt(25)],
          });
        } else if (type === 'sleep') {
          result = await writeContract({
            address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
            abi: wellnessTrackerAbi,
            functionName: 'logSleep',
            args: [BigInt(8)],
          });
        } else {
          // Fallback to workout for unknown types
          result = await writeContract({
            address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
            abi: wellnessTrackerAbi,
            functionName: 'logWorkout',
            args: [BigInt(30), BigInt(1), BigInt(100), type, name, BigInt(50)],
          });
        }
        
        console.log('✅ Activity logged to smart contract successfully!');
        console.log('📊 Transaction Result:', result);
        
        // Show success message to user
        setContractStatus({
          type: 'success',
          message: `✅ ${name} logged to blockchain successfully!`,
          timestamp: Date.now()
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setContractStatus(null);
        }, 5000);
        
      } catch (error) {
        console.error('❌ Failed to log activity to smart contract:', error);
        
        setContractStatus({
          type: 'error',
          message: `❌ Failed to log ${name} to blockchain. Please try again.`,
          timestamp: Date.now()
        });
        
        // Clear error message after 8 seconds
        setTimeout(() => {
          setContractStatus(null);
        }, 8000);
      }
    }
  };

  // Functional meal logging with smart contract integration
  const handleLogMeal = async () => {
    if (!newMeal.name.trim() || !newMeal.calories.trim()) return;
    
    const now = Date.now();
    const meal = {
      id: now,
      type: newMeal.type,
      name: newMeal.name,
      calories: parseInt(newMeal.calories),
      timestamp: now
    };
    
    setMeals(prev => [meal, ...prev.slice(0, 9)]);
    setNewMeal({ type: 'breakfast', name: '', calories: '' });
    setShowMealModal(false);
    
    // Save to smart contract if available
    if (address && chainId === 84532) {
      try {
        console.log('🚀 Logging meal to smart contract:', { type: meal.type, name: meal.name, calories: meal.calories });
        console.log('📝 Contract Address:', CONTRACT_ADDRESSES.WELLNESS_TRACKER);
        console.log('🔗 Chain ID:', chainId);
        console.log('👤 User Address:', address);
        
        const result = await writeContract({
          address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
          abi: wellnessTrackerAbi,
          functionName: 'logMeal',
          args: [meal.type, meal.name, BigInt(meal.calories), BigInt(0), BigInt(0), BigInt(0)],
        });
        
        console.log('✅ Meal logged to smart contract successfully!');
        console.log('📊 Transaction Result:', result);
        
        // Show success message to user
        setContractStatus({
          type: 'success',
          message: `✅ ${meal.name} logged to blockchain successfully!`,
          timestamp: Date.now()
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setContractStatus(null);
        }, 5000);
        
      } catch (error) {
        console.error('❌ Failed to log meal to smart contract:', error);
        
        setContractStatus({
          type: 'error',
          message: `❌ Failed to log ${meal.name} to blockchain. Please try again.`,
          timestamp: Date.now()
        });
        
        // Clear error message after 8 seconds
        setTimeout(() => {
          setContractStatus(null);
        }, 8000);
      }
    }
  };

  // Functional sleep logging with smart contract integration
  const handleLogSleep = async () => {
    if (!address) {
      setContractStatus({
        type: 'error',
        message: 'Please connect your wallet to log sleep',
        timestamp: Date.now()
      });
      return;
    }
    
    // Validate form
    if (!sleepForm.duration) {
      setContractStatus({
        type: 'error',
        message: 'Please fill in sleep duration',
        timestamp: Date.now()
      });
      return;
    }
    
    try {
      setContractStatus({
        type: 'success',
        message: 'Submitting sleep to blockchain...',
        timestamp: Date.now()
      });
      
      // Call smart contract to log sleep
      const result = await writeContract({
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        abi: wellnessTrackerAbi,
        functionName: 'logSleep',
        args: [BigInt(Math.round(parseFloat(sleepForm.duration) * 60))] // Convert hours to minutes
      });
      
      console.log('Sleep logged to blockchain:', result);
      
      setContractStatus({
        type: 'success',
        message: 'Sleep logged successfully to blockchain!',
        timestamp: Date.now()
      });
      
      // Add to local state for immediate UI update
      const newSleepEntry = {
        id: activities.length + 1,
        type: 'sleep',
        name: 'Sleep session',
        duration: parseFloat(sleepForm.duration),
        timestamp: Date.now(),
        reward: 30
      };
      
      setActivities([...activities, newSleepEntry]);
      
      // Reset form and close modal
      setSleepForm({
        duration: ''
      });
      setShowSleepModal(false);
      
    } catch (error) {
      console.error('Failed to log sleep to blockchain:', error);
      setContractStatus({
        type: 'error',
        message: `Failed to log sleep: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      });
    }
  };
  
  // Handle workout logging with smart contract integration
  const handleLogWorkout = async () => {
    if (!address) {
      setContractStatus({
        type: 'error',
        message: 'Please connect your wallet to log workouts',
        timestamp: Date.now()
      });
      return;
    }
    
    // Validate form
    if (!workoutForm.duration || !workoutForm.sets || !workoutForm.caloriesBurned) {
      setContractStatus({
        type: 'error',
        message: 'Please fill in all required fields',
        timestamp: Date.now()
      });
      return;
    }
    
    try {
      setContractStatus({
        type: 'success',
        message: 'Submitting workout to blockchain...',
        timestamp: Date.now()
      });
      
      // Call smart contract to log workout
      const result = await writeContract({
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        abi: wellnessTrackerAbi,
        functionName: 'logWorkout',
        args: [
          BigInt(workoutForm.duration),
          BigInt(workoutForm.sets),
          BigInt(workoutForm.caloriesBurned),
          workoutForm.activityType || 'General Workout',
          workoutForm.name || 'Workout Session',
          BigInt(50)
        ]
      });
      
      console.log('Workout logged to blockchain:', result);
      
      setContractStatus({
        type: 'success',
        message: 'Workout logged successfully to blockchain!',
        timestamp: Date.now()
      });
      
      // Add to local state for immediate UI update
      const newWorkoutEntry = {
        id: activities.length + 1,
        type: 'workout',
        name: workoutForm.name || `${workoutForm.activityType} workout`,
        duration: parseInt(workoutForm.duration),
        sets: parseInt(workoutForm.sets),
        caloriesBurned: parseInt(workoutForm.caloriesBurned),
        timestamp: Date.now(),
        reward: 50
      };
      
      setActivities([...activities, newWorkoutEntry]);
      
      // Reset form and close modal
      setWorkoutForm({
        duration: '',
        sets: '',
        caloriesBurned: '',
        activityType: '',
        name: ''
      });
      setShowWorkoutModal(false);
      
    } catch (error) {
      console.error('Failed to log workout to blockchain:', error);
      setContractStatus({
        type: 'error',
        message: `Failed to log workout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      });
    }
  };
  
  // Handle meditation logging with smart contract integration
  const handleLogMeditation = async () => {
    if (!address) {
      setContractStatus({
        type: 'error',
        message: 'Please connect your wallet to log meditation',
        timestamp: Date.now()
      });
      return;
    }
    
    // Validate form
    if (!meditationForm.duration) {
      setContractStatus({
        type: 'error',
        message: 'Please fill in duration',
        timestamp: Date.now()
      });
      return;
    }
    
    try {
      setContractStatus({
        type: 'success',
        message: 'Submitting meditation to blockchain...',
        timestamp: Date.now()
      });
      
      // Call smart contract to log meditation
      const result = await writeContract({
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        abi: wellnessTrackerAbi,
        functionName: 'logMeditation',
        args: [
          BigInt(meditationForm.duration),
          meditationForm.name || 'Meditation Session',
          BigInt(25)
        ]
      });
      
      console.log('Meditation logged to blockchain:', result);
      
      setContractStatus({
        type: 'success',
        message: 'Meditation logged successfully to blockchain!',
        timestamp: Date.now()
      });
      
      // Add to local state for immediate UI update
      const newMeditationEntry = {
        id: activities.length + 1,
        type: 'meditation',
        name: meditationForm.name || 'Meditation session',
        duration: parseInt(meditationForm.duration),
        timestamp: Date.now(),
        reward: 25
      };
      
      setActivities([...activities, newMeditationEntry]);
      
      // Reset form and close modal
      setMeditationForm({
        duration: '',
        name: ''
      });
      setShowMeditationModal(false);
      
    } catch (error) {
      console.error('Failed to log meditation to blockchain:', error);
      setContractStatus({
        type: 'error',
        message: `Failed to log meditation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      });
    }
  };
  
  // Handle enhanced meal logging with macros and smart contract integration
  const handleLogMealWithMacros = async () => {
    if (!address) {
      setContractStatus({
        type: 'error',
        message: 'Please connect your wallet to log meals',
        timestamp: Date.now()
      });
      return;
    }
    
    // Validate form
    if (!mealForm.mealType || !mealForm.calories) {
      setContractStatus({
        type: 'error',
        message: 'Please fill in meal type and calories',
        timestamp: Date.now()
      });
      return;
    }
    
    try {
      setContractStatus({
        type: 'success',
        message: 'Submitting meal to blockchain...',
        timestamp: Date.now()
      });
      
      // Call smart contract to log meal with macros
      const result = await writeContract({
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        abi: wellnessTrackerAbi,
        functionName: 'logMeal',
        args: [
          mealForm.mealType,
          mealForm.name || `${mealForm.mealType} logged`,
          BigInt(mealForm.calories),
          BigInt(mealForm.protein || 0),
          BigInt(mealForm.fat || 0),
          BigInt(mealForm.carbs || 0)
        ]
      });
      
      console.log('Meal logged to blockchain:', result);
      
      setContractStatus({
        type: 'success',
        message: 'Meal logged successfully to blockchain!',
        timestamp: Date.now()
      });
      
      // Add to local state for immediate UI update
      const newMealEntry = {
        id: meals.length + 1,
        type: mealForm.mealType,
        name: mealForm.name || `${mealForm.mealType} logged`,
        calories: parseInt(mealForm.calories),
        protein: parseInt(mealForm.protein) || 0,
        fat: parseInt(mealForm.fat) || 0,
        carbs: parseInt(mealForm.carbs) || 0,
        timestamp: Date.now()
      };
      
      setMeals([...meals, newMealEntry]);
      
      // Reset form and close modal
      setMealForm({
        mealType: '',
        name: '',
        calories: '',
        protein: '',
        fat: '',
        carbs: ''
      });
      setShowMealModal(false);
      
    } catch (error) {
      console.error('Failed to log meal to blockchain:', error);
      setContractStatus({
        type: 'error',
        message: `Failed to log meal: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      });
    }
  };

  // Enhanced AI Chat functionality matching main dashboard
  const handleGetAIAdvice = async () => {
    if (!wellnessPrompt.trim()) return;
    
    setIsLoadingAI(true);
    const currentPrompt = wellnessPrompt;
    setWellnessPrompt('');
    
    try {
      // Check for the specific demo query
      const isSpecificDemoQuery = currentPrompt.toLowerCase().includes('planning to hit the gym') && 
                                  currentPrompt.toLowerCase().includes('6am') &&
                                  currentPrompt.toLowerCase().includes('anniversary dinner');
      
      if (isSpecificDemoQuery) {
        // Simulate the exact SDK demo flow for Farcaster
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const comprehensiveResponse = `🎯 SMASHER'S COMPREHENSIVE WELLNESS RECOMMENDATIONS
=========================================================

📅 Date: ${new Date().toLocaleDateString()}
🎯 User Goal: Optimize energy for gym, work, and anniversary dinner

📋 ANALYSIS SUMMARY:
─────────────────────────────────────────────────────────
• Scenario: Early morning gym session + long work day + anniversary dinner
• Key Challenges: Energy conservation, Stress management, Celebration balance
• Optimal Strategy: Light morning workout + meditation + guilt-free celebration

🧘‍♂️ RECOMMENDATION 1: Pre-Sleep Meditation
───────────────────────────────────────────────────────────
• Take a 10-minute meditation break before sleep
• Duration: 10 minutes
• Timing: 30 minutes before bedtime
• Video Link: https://youtu.be/ZgPHetPG4MY
• Benefits: Reduces stress, improves sleep quality, prepares mind for tomorrow's challenges, enhances recovery
• Instructions: Find a quiet space, sit comfortably, and follow the guided meditation video. Focus on deep breathing and letting go of the day's stress.
• Environment: Dim lights, comfortable seating, minimal distractions
• Expected Outcomes: Better sleep quality, reduced anxiety, improved morning energy

💪 RECOMMENDATION 2: Energy-Conserving Morning Workout
───────────────────────────────────────────────────────────
• Title: Energy-conserving morning workout before your long work day
• Duration: 30-45 minutes
• Intensity: Moderate - designed to energize without exhausting
• Focus: Energy preservation, stress relief, and work preparation
• Rationale: Light exercise in the morning boosts energy and mood for the work day without depleting reserves

📋 Workout Breakdown:

🔥 Warm-up (5 minutes):
  • Light walking or cycling
  • Arm circles
  • Gentle hip rotations
  Purpose: Increase blood flow and prepare muscles

💪 Main Exercises:
  • Bodyweight Squats: 3 sets x 12-15 reps
    Rest: 60 seconds between sets
    Note: Focus on form, not intensity. Keep it light to preserve energy.
    Benefits: Activates major muscle groups, boosts metabolism
  
  • Push-ups (modified if needed): 3 sets x 8-12 reps
    Rest: 90 seconds between sets
    Note: Use knee push-ups if needed. Keep energy for work day.
    Benefits: Upper body strength, core engagement
  
  • Plank: 3 sets x 30 seconds
    Rest: 60 seconds between sets
    Note: Core stability without exhaustion. Focus on form.
    Benefits: Core strength, posture improvement
  
  • Light Stretching Sequence: 1 set x 10 minutes
    Exercises: Cat-cow stretches, Child's pose, Gentle twists, Hip flexor stretches
    Note: Focus on mobility and relaxation. Perfect for work preparation.
    Benefits: Improved flexibility, stress reduction, better posture for work

🧘 Cool-down (5 minutes):
  • Gentle stretching
  • Deep breathing
  • Mindfulness moment
  Purpose: Recovery and mental preparation for the day ahead

🍎 Post-Workout Nutrition:
• Timing: Within 30 minutes
• Recommendations: Light protein shake, Banana or apple, Water with electrolytes
• Purpose: Replenish energy stores without heavy digestion

🍽️ RECOMMENDATION 3: Anniversary Dinner
───────────────────────────────────────────────────────────
• Enjoy your anniversary dinner without calorie worries
• Reason: You will expend significant energy during your long work day
• Advice: Focus on the celebration and quality time with your wife
• Guidance: The combination of morning workout and long work day will create a significant calorie deficit, allowing you to enjoy your anniversary meal guilt-free

📊 Calorie Math:
  • Morning Workout: 200-300 calories burned
  • Work Day Activity: 400-600 calories burned
  • Total Deficit: 600-900 calories
  • Conclusion: Plenty of room for celebration meal

🎉 Celebration Tips:
  • Order what you truly want to enjoy
  • Focus on the experience and company
  • Don't stress about portion sizes
  • Savor each bite mindfully
  • Enjoy a dessert if desired

💭 Mental Approach: This is a celebration of your relationship, not a diet day. The work you've done today has earned you this enjoyment.

📊 INTEGRATION NOTES:
───────────────────────────────────────────────────────────
• Energy Management: Morning workout provides energy boost without exhaustion, setting positive tone for work day
• Stress Reduction: Meditation helps manage work stress and improves sleep quality for better recovery
• Celebration Balance: Workout and work create space for guilt-free celebration dinner
• Recovery Focus: Light workout allows for better recovery and sustained work performance
• Timing Optimization: 6am workout gives 2+ hours before work for recovery and preparation
• Nutrition Synergy: Light post-workout meal sustains energy without heavy digestion

🎯 SUCCESS METRICS:
───────────────────────────────────────────────────────────
• Energy Levels: Maintain steady energy throughout work day (target: 7-8/10)
• Stress Management: Reduced stress through meditation and light exercise (target: stress level 3-4/10)
• Celebration Enjoyment: Fully enjoy anniversary dinner without guilt (target: 100% enjoyment)
• Sleep Quality: Improved sleep through pre-bed meditation (target: 7-8 hours quality sleep)
• Work Performance: Sustained focus and energy during long work day (target: 8-9/10 productivity)
• Relationship Quality: Enhanced celebration experience with partner (target: memorable evening)

📅 NEXT DAY PREPARATION:
───────────────────────────────────────────────────────────

🌙 Evening Routine (30 minutes before bed):
  • 10-minute meditation with video
  • Light reading
  • Gratitude reflection
  Purpose: Mental preparation and stress release

🌅 Morning Routine (6:00 AM):
  • Light 30-45 minute workout
  • Post-workout nutrition
  • Shower and preparation
  Purpose: Energy boost and work preparation

💼 Work Day Strategy:
  • Energy Conservation: Conserve energy, stay hydrated, take short breaks
  • Stress Management: Use breathing exercises during stressful moments
  • Nutrition: Light, energy-sustaining meals and snacks

🎊 Evening Celebration:
  • Mindset: Enjoy anniversary dinner and quality time
  • Focus: Celebration and relationship building
  • Approach: Guilt-free enjoyment of the experience

🧠 EXPERT INSIGHTS:
───────────────────────────────────────────────────────────
• DietKing Advice: Light morning nutrition supports workout without heavy digestion
• SleepyJoe Wisdom: Meditation before sleep improves recovery and next-day performance
• GymBro Tips: Energy-conserving workout maintains strength without exhaustion
• WellnessBuddy Evaluation: Integrated approach balances fitness, work, and celebration needs

=========================================================
✅ Comprehensive wellness plan delivered successfully!
=========================================================`;

        setAiResponse(comprehensiveResponse);
      } else {
        // Original response logic for other queries
        const lowerPrompt = currentPrompt.toLowerCase();
        let response = '';
        
        if (lowerPrompt.includes('workout') || lowerPrompt.includes('exercise') || lowerPrompt.includes('gym')) {
          response = "💪 Based on your workout goals, I recommend a balanced approach:\n\n🏃‍♂️ **Cardio**: 3-4 sessions per week, 30-45 minutes\n🏋️‍♂️ **Strength Training**: 3 sessions per week, focusing on compound movements\n🧘‍♀️ **Recovery**: Include stretching and rest days\n\nStart with 3 days per week and gradually increase intensity. Remember, consistency beats perfection!";
        } else if (lowerPrompt.includes('diet') || lowerPrompt.includes('nutrition') || lowerPrompt.includes('food')) {
          response = "🥗 Here's your personalized nutrition plan:\n\n🍳 **Breakfast**: Protein + complex carbs (eggs + oatmeal)\n🥙 **Lunch**: Lean protein + vegetables + healthy fats\n🍽️ **Dinner**: Light protein + vegetables\n🍎 **Snacks**: Nuts, fruits, or Greek yogurt\n\nAim for 3 meals + 2 snacks daily. Stay hydrated with 8+ glasses of water!";
        } else if (lowerPrompt.includes('sleep') || lowerPrompt.includes('rest') || lowerPrompt.includes('bedtime')) {
          response = "😴 Sleep optimization strategy:\n\n⏰ **Bedtime**: Aim for 7-9 hours, go to bed at the same time daily\n🌙 **Environment**: Dark, cool (65-68°F), quiet room\n📱 **Habits**: No screens 1 hour before bed, read or meditate instead\n☕ **Avoid**: Caffeine after 2 PM, heavy meals before bed\n\nQuality sleep is your foundation for wellness!";
        } else if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety') || lowerPrompt.includes('mental')) {
          response = "🧘‍♀️ Mental wellness approach:\n\n💆‍♂️ **Daily Practice**: 10-15 minutes meditation or deep breathing\n🏃‍♀️ **Physical Activity**: Exercise releases endorphins\n📝 **Journaling**: Write down thoughts and gratitude\n🎯 **Mindfulness**: Stay present, one task at a time\n\nRemember, mental health is just as important as physical health!";
        } else {
          response = "🌟 Based on your comprehensive wellness goals, here's my advice:\n\n💪 **For your 6am gym session**: Great timing! Morning workouts boost energy all day. Have a light snack 30 mins before (banana + coffee).\n\n🍽️ **For your anniversary dinner**: Enjoy it guilt-free! Balance it with lighter meals earlier and consider sharing appetizers.\n\n⚖️ **Managing the long work day**: Stay hydrated, take 5-min breaks every hour, and do desk stretches.\n\nYou're planning well - consistency beats perfection! 💪";
        }
        
        setAiResponse(response);
      }
    } catch (error) {
      console.error('Failed to get AI advice:', error);
      setAiResponse('Sorry, I encountered an error while generating your wellness advice. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // NFT Generation functionality with Pollinations.ai
  const handleGenerateNFT = async () => {
    if (!nftTheme || (nftTheme === 'custom' && !customNftPrompt.trim())) return;
    
    setIsGeneratingNFT(true);
    try {
      // Generate prompt based on theme
      let prompt = '';
      switch (nftTheme) {
        case 'minimalist':
          prompt = 'minimalist wellness art, clean lines, simple shapes, meditation symbols, zen aesthetic, white space, elegant design';
          break;
        case 'cosmic':
          prompt = 'cosmic wellness art, space galaxy theme, stars, nebula, cosmic energy, wellness symbols, vibrant colors, mystical';
          break;
        case 'custom':
          prompt = customNftPrompt.trim();
          break;
      }
      
      // Generate image using Pollinations.ai with better URL construction
      const seed = Date.now();
      
      // Try multiple Pollinations.ai URL formats
      const pollinationsUrls = [
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}`,
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512`,
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
      ];
      
      let imageLoaded = false;
      
      // Try each URL format until one works
      for (let i = 0; i < pollinationsUrls.length && !imageLoaded; i++) {
        const testImage = new Image();
        testImage.onload = () => {
          console.log('✅ Pollinations.ai image loaded successfully:', pollinationsUrls[i]);
          setGeneratedNFTImage(pollinationsUrls[i]);
          imageLoaded = true;
        };
        testImage.onerror = () => {
          console.log(`❌ Pollinations.ai URL ${i + 1} failed:`, pollinationsUrls[i]);
          if (i === pollinationsUrls.length - 1) {
            // All URLs failed, use fallback
            console.log('❌ All Pollinations.ai URLs failed, using fallback');
            const fallbackUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`;
            setGeneratedNFTImage(fallbackUrl);
          }
        };
        testImage.src = pollinationsUrls[i];
        
        // Wait a bit before trying the next URL
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      

      
      // Mint NFT to blockchain (don't await here to allow image to load first)
      setTimeout(async () => {
        try {
          await mintWellnessNFT(generatedNFTImage || pollinationsUrls[0], prompt);
        } catch (error) {
          console.error('Failed to mint NFT:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to generate NFT:', error);
      // Set fallback image on error
      const fallbackUrl = `https://via.placeholder.com/512x512/ef4444/ffffff?text=Generation+Failed`;
      setGeneratedNFTImage(fallbackUrl);
    } finally {
      setIsGeneratingNFT(false);
    }
  };

  // Fetch NFTs from blockchain using wagmi hooks
  const { data: userHasProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_NFT,
    abi: wellnessNFTAbi,
    functionName: 'userHasProfile',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userTokenId } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_NFT,
    abi: wellnessNFTAbi,
    functionName: 'getUserTokenId',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!userHasProfile },
  });

  const { data: tokenUri } = useReadContract({
    address: CONTRACT_ADDRESSES.WELLNESS_NFT,
    abi: wellnessNFTAbi,
    functionName: 'tokenURI',
    args: userTokenId ? [userTokenId] : undefined,
    query: { enabled: !!userTokenId },
  });

  // Debug contract addresses
  useEffect(() => {
    console.log('🔍 Contract Debug Info:');
    console.log('WELLNESS_NFT Address:', CONTRACT_ADDRESSES.WELLNESS_NFT);
    console.log('Chain ID:', chainId);
    console.log('User Address:', address);
    console.log('User Has Profile:', userHasProfile);
    console.log('User Token ID:', userTokenId);
    console.log('Token URI:', tokenUri);

    // Test contract connectivity when user connects
    if (address) {
      console.log('🌐 Testing contract connectivity from Farcaster page...');
      testContractConnectivity().catch(error => {
        console.error('❌ Farcaster page contract connectivity test failed:', error);
      });
    }
    
    // Debug timestamp conversion
    if (contractActivities && Array.isArray(contractActivities) && contractActivities.length > 0) {
      console.log('⏰ Timestamp Debug:');
      contractActivities.forEach((activity, index) => {
        if (Array.isArray(activity)) {
          const rawTimestamp = Number(activity[4]);
          const timestampInMs = rawTimestamp > 0 ? rawTimestamp * 1000 : 0;
          console.log(`Activity ${index}: Raw=${rawTimestamp}s, Converted=${timestampInMs}ms, Diff=${Date.now() - timestampInMs}ms`);
        }
      });
    }
  }, [address, chainId, userHasProfile, userTokenId, tokenUri, contractActivities]);

  // Mint NFT to blockchain
  const mintWellnessNFT = async (imageUrl: string, prompt: string) => {
    if (!address) return;
    
    try {
      // Create metadata for the NFT
      const metadata = {
        name: `Wellness NFT - ${nftTheme}`,
        description: `AI-generated wellness art: ${prompt}`,
        image: imageUrl,
        attributes: [
          { trait_type: "Theme", value: nftTheme },
          { trait_type: "Generated", value: new Date().toISOString() },
          { trait_type: "Wellness Score", value: displayWellnessScore }
        ]
      };
      
      // For now, we'll use the image URL directly as the URI
      // In production, you would upload metadata to IPFS
      const metadataUri = imageUrl; // This will be the IPFS URI in production
      
      // Mint NFT using smart contract
      if (address && chainId === 84532) {
        try {
          console.log('🚀 Attempting to mint NFT to contract:', CONTRACT_ADDRESSES.WELLNESS_NFT);
          console.log('📝 Metadata URI:', metadataUri);
          console.log('👤 User Address:', address);
          console.log('🔗 Chain ID:', chainId);
          
          await writeContract({
            address: CONTRACT_ADDRESSES.WELLNESS_NFT,
            abi: wellnessNFTAbi,
            functionName: 'mintWellnessNFT',
            args: [metadataUri],
          });
          
          console.log('✅ NFT minted to smart contract successfully');
          
          // Create local NFT object
          const newNFT = {
            tokenId: Date.now(), // This will be the actual token ID from the contract
            image: imageUrl,
            metadata: metadata,
            mintedAt: new Date().toISOString(),
            transactionHash: 'pending' // Transaction hash will be available after confirmation
          };
          
          // Add to local state
          setUserNFTs(prev => [...prev, newNFT]);
          
          // Reset form
          setNftTheme(null);
          setCustomNftPrompt('');
          setGeneratedNFTImage(null);
          
          // Show success message
          console.log('NFT minted successfully:', newNFT);
          
        } catch (contractError) {
          console.error('Contract minting failed, falling back to local storage:', contractError);
          
          // Fallback to local storage if contract fails
          const newNFT = {
            tokenId: Date.now(),
            image: imageUrl,
            metadata: metadata,
            mintedAt: new Date().toISOString(),
            fallback: true
          };
          
          setUserNFTs(prev => [...prev, newNFT]);
          setNftTheme(null);
          setCustomNftPrompt('');
          setGeneratedNFTImage(null);
        }
      } else {
        // Fallback for non-Base Sepolia networks
        const newNFT = {
          tokenId: Date.now(),
          image: imageUrl,
          metadata: metadata,
          mintedAt: new Date().toISOString(),
          fallback: true
        };
        
        setUserNFTs(prev => [...prev, newNFT]);
        setNftTheme(null);
        setCustomNftPrompt('');
        setGeneratedNFTImage(null);
      }
      
    } catch (error) {
      console.error('Failed to mint NFT:', error);
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

  // Fetch Farcaster username by address
  const [farcasterUsername, setFarcasterUsername] = useState<string | null>(null);
  
  const fetchFarcasterUser = async (userAddress: string) => {
    try {
      // Try Farcaster API first
      const response = await fetch(`https://api.farcaster.xyz/v2/users/${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        if (data.result?.user?.username) {
          setFarcasterUsername(data.result.user.username);
          return;
        }
      }
      
      // Fallback: try to get from user's Farcaster profile
      const profileResponse = await fetch(`https://api.farcaster.xyz/v2/userDataByFid?fid=${userAddress}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.data?.username) {
          setFarcasterUsername(profileData.data.username);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching Farcaster user:', error);
    }
  };

  // Debug logging to see what data we're getting
  useEffect(() => {
    console.log('Farcaster Page - Wellness Data:', wellnessData);
    console.log('Farcaster Page - WELL Balance:', wellBalance);
    console.log('Farcaster Page - Contract Activities:', contractActivities);
    console.log('Farcaster Page - Contract Meals:', contractMeals);
    console.log('Farcaster Page - Parsed Data:', parsedWellnessData);
    console.log('Farcaster Page - Recent Activities (Final):', recentActivities);
    
    // Log the structure of contract activities if they exist
    if (contractActivities && Array.isArray(contractActivities) && contractActivities.length > 0) {
      console.log('Farcaster Page - First Activity Structure:', {
        raw: contractActivities[0],
        type: typeof contractActivities[0],
        isArray: Array.isArray(contractActivities[0]),
        keys: typeof contractActivities[0] === 'object' ? Object.keys(contractActivities[0]) : 'N/A'
      });
    }
  }, [wellnessData, wellBalance, contractActivities, contractMeals, parsedWellnessData, recentActivities]);

  // Fetch Farcaster username when wallet connects
  useEffect(() => {
    if (address) {
      fetchFarcasterUser(address);
    }
  }, [address]);

  // Update NFTs when blockchain data changes
  useEffect(() => {
    if (userHasProfile && userTokenId && tokenUri) {
      // Create NFT object from blockchain data
      const blockchainNFT = {
        tokenId: Number(userTokenId),
        image: tokenUri, // This should be the IPFS URI in production
        metadata: {
          name: `Wellness NFT #${userTokenId}`,
          description: 'Blockchain-stored wellness NFT',
          theme: 'blockchain'
        },
        mintedAt: new Date().toISOString(),
        blockchain: true
      };
      
      // Update local state with blockchain data
      setUserNFTs(prev => {
        const existing = prev.find(nft => nft.blockchain);
        if (existing) {
          return prev.map(nft => nft.blockchain ? blockchainNFT : nft);
        } else {
          return [...prev, blockchainNFT];
        }
      });
    }
  }, [userHasProfile, userTokenId, tokenUri]);

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
              {farcasterUsername && (
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  )}>
                    Farcaster: @{farcasterUsername}
                  </span>
                </div>
              )}
              {address && !farcasterUsername && (
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <Button
                    onClick={() => fetchFarcasterUser(address)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Fetch Farcaster Username
                  </Button>
                </div>
              )}
              {!address && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Connect your wallet to start tracking wellness
                    </p>
                                         <Button 
                       onClick={() => {
                         if (connectors.length > 0) {
                           connect({ connector: connectors[0] });
                         }
                       }}
                       variant="default" 
                       size="sm"
                     >
                       <Wallet className="w-4 h-4 mr-2" />
                       Connect Wallet
                     </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Contract Activity Status */}
            {contractStatus && (
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-300",
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
                    {displayWellnessScore}
                  </div>

                  {parsedWellnessData.score === 0 && calculatedWellnessScore > 0 && (
                    <div className="text-orange-500 text-xs text-center">
                      Using calculated score (contract data loading...)
                      <br />
                      <span className="text-red-500">Check console for missing env vars</span>
                    </div>
                  )}
                  {parsedWellnessData.score > 0 && calculatedWellnessScore !== parsedWellnessData.score && (
                    <div className="text-blue-500 text-xs text-center">
                      Contract data loaded ✓
                    </div>
                  )}
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
                       {userNFTs.length}
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

            {/* NFT Collection Display */}
            {address && (
              <Card className={cn(
                "transition-colors duration-300",
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <CardHeader className="pb-3">
                  <CardTitle className={cn(
                    "text-lg transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    Your Wellness NFTs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userNFTs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {userNFTs.map((nft, index) => (
                        <div key={index} className="text-center">
                          <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
                            <img 
                              src={nft.image} 
                              alt={`Wellness NFT ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {nft.blockchain && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                On-Chain
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">Wellness NFT #{nft.tokenId}</p>
                          {nft.blockchain && (
                            <p className="text-xs text-blue-600">Blockchain Verified</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className={cn(
                        "text-sm transition-colors",
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        No NFTs yet. Generate your first wellness NFT!
                      </p>
                      <Button 
                        onClick={() => setCurrentView('nft-generation')}
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                      >
                        Generate NFT
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
             <div className="space-y-3">
               <Button 
                 onClick={() => setShowWorkoutModal(true)}
                 variant="outline"
                 className="w-full h-12"
               >
                 <Dumbbell className="w-4 h-4 mr-2" />
                 Log Workout
               </Button>
               <Button 
                 onClick={() => setShowMeditationModal(true)}
                 variant="outline"
                 className="w-full h-12"
               >
                 <EditIcon className="w-4 h-4 mr-2" />
                 Log Meditation
               </Button>
               <Button 
                 onClick={() => setShowMealModal(true)}
                 variant="outline"
                 className="w-full h-12"
               >
                 <Coffee className="w-4 h-4 mr-2" />
                 Log Meal
               </Button>
               <Button 
                 onClick={() => setShowSleepModal(true)}
                 variant="outline"
                 className="w-full h-12"
               >
                 <Bed className="w-4 h-4 mr-2" />
                 Log Sleep
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
               
               {/* Wallet Management */}
               {address ? (
                 <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                   <Button 
                     onClick={() => setShowDisconnectConfirm(true)}
                     variant="outline"
                     className="w-full h-10 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                   >
                     <Wallet className="w-4 h-4 mr-2" />
                     Disconnect Wallet
                   </Button>
                 </div>
               ) : (
                 <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                   <div className="text-center py-3">
                     <p className="text-sm text-gray-600 mb-2">
                       Connect your wallet to access all features
                     </p>
                     <Button 
                       onClick={() => {
                         if (connectors.length > 0) {
                           connect({ connector: connectors[0] });
                         }
                       }}
                       variant="default" 
                       size="sm"
                       className="w-full"
                     >
                       <Wallet className="w-4 h-4 mr-2" />
                       Connect Wallet
                     </Button>
                   </div>
                 </div>
               )}
             </div>

            {/* Recent Activity */}
            <Card className={cn(
              "transition-colors duration-300",
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={cn(
                    "text-lg transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    Recent Activity
                  </CardTitle>
                  {recentActivities === sampleActivities && (
                    <Badge variant="outline" className="text-xs">
                      Sample Data
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map(activity => {
                    // Safely calculate time difference and reward
                    const timestamp = Number(activity.timestamp) || 0;
                    const reward = Number(activity.reward) || 0;
                    const timeDiff = timestamp > 0 && currentTime > 0 ? Math.max(0, (currentTime - timestamp) / 1000 / 60) : 0;
                    
                    return (
                      <div key={activity.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className={cn(
                            "text-sm transition-colors",
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {activity.name || 'Unknown Activity'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {timeDiff < 1 ? '< 1 min ago' : `${Math.round(timeDiff)} min ago`}
                          </div>
                          <div className="text-sm font-medium text-green-500">+{reward} WELL</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className={cn(
                      "text-sm transition-colors",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      {address ? 'No recent activities. Start logging your wellness activities!' : 'Connect your wallet to see activities'}
                    </p>
                    {!address && (
                      <div className="mt-2 text-xs text-gray-500">
                        Connect your wallet to see your actual wellness activities and earn rewards
                      </div>
                    )}
                    {!address && (
                      <div className="mt-3">
                                             <Button 
                       onClick={() => {
                         if (connectors.length > 0) {
                           connect({ connector: connectors[0] });
                         }
                       }}
                       variant="default" 
                       size="sm"
                       className="w-full"
                     >
                       <Wallet className="w-4 h-4 mr-2" />
                       Connect Wallet
                     </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallet Status - Keep this for debugging connection issues */}
            <WalletStatus />
            
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
                    <Button
                      onClick={() => setShowDisconnectConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        disconnect();
                        setShowDisconnectConfirm(false);
                      }}
                      variant="destructive"
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            )}
            

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
                <Badge variant={(parsedWellnessData.workouts + parsedWellnessData.meditations) >= 5 ? "default" : "secondary"}>
                  {(parsedWellnessData.workouts + parsedWellnessData.meditations)}/5
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
                    <Button 
                      onClick={() => setCurrentView('nft-generation')}
                      variant="outline" 
                      className="w-full"
                    >
                      Generate NFT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* NFT Generation View */}
        {currentView === 'nft-generation' && (
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
                Generate Wellness NFT
              </h2>
              <div></div>
            </div>
            
            <Card className={cn(
              "transition-colors duration-300",
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-purple-600 rounded"></div>
                  </div>
                  <h3 className={cn(
                    "text-lg font-bold mb-2 transition-colors",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    Design Your NFT
                  </h3>
                  <p className={cn(
                    "text-sm transition-colors",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Choose a theme for your personalized wellness NFT that will be generated by AI and minted to your wallet.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant={nftTheme === 'minimalist' ? 'default' : 'outline'}
                      onClick={() => setNftTheme('minimalist')}
                      className="h-16 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">Minimalist</div>
                        <div className="text-xs text-gray-500">Simple and elegant</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={nftTheme === 'cosmic' ? 'default' : 'outline'}
                      onClick={() => setNftTheme('cosmic')}
                      className="h-16 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">Cosmic</div>
                        <div className="text-xs text-gray-500">Space and galaxy themes</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={nftTheme === 'custom' ? 'default' : 'outline'}
                      onClick={() => setNftTheme('custom')}
                      className="h-16 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">Custom</div>
                        <div className="text-xs text-gray-500">Describe your own idea</div>
                      </div>
                    </Button>
                  </div>
                  
                  {nftTheme === 'custom' && (
                    <div className="space-y-2">
                      <label className={cn(
                        "block text-sm font-medium transition-colors",
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Custom Description
                      </label>
                      <textarea
                        value={customNftPrompt}
                        onChange={(e) => setCustomNftPrompt(e.target.value)}
                        placeholder="Describe your NFT idea (e.g., 'A serene forest scene with wellness symbols')"
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg transition-colors duration-300 resize-none",
                          isDarkMode 
                            ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500" 
                            : "bg-white border-gray-300 text-black placeholder-gray-500 focus:border-gray-400"
                        )}
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {/* Generated Image Preview */}
                  {generatedNFTImage && (
                    <div className="space-y-3">
                      <div className="text-center">
                        <h4 className={cn(
                          "font-medium mb-2 transition-colors",
                          isDarkMode ? "text-white" : "text-black"
                        )}>
                          Generated Image Preview
                        </h4>
                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                          <img 
                            src={generatedNFTImage} 
                            alt="Generated NFT Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Image failed to load, setting fallback');
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/512x512/6366f1/ffffff?text=Image+Failed+to+Load`;
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {generatedNFTImage.includes('pollinations.ai') 
                            ? 'AI-generated wellness art' 
                            : generatedNFTImage.includes('placeholder') 
                              ? 'Fallback image (AI generation may be slow)' 
                              : 'Custom image'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading State */}
                  {isGeneratingNFT && !generatedNFTImage && (
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
                            <p className="text-sm text-gray-600">Generating your wellness NFT...</p>
                            <p className="text-xs text-gray-500">This may take a few seconds</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleGenerateNFT}
                    disabled={!nftTheme || (nftTheme === 'custom' && !customNftPrompt.trim()) || isGeneratingNFT}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                  >
                    {isGeneratingNFT ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Image...
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-white rounded mr-2"></div>
                        Generate Wellness NFT
                      </>
                    )}
                  </Button>
                  
                  {/* Debug Info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                      <p><strong>Debug Info:</strong></p>
                      <p>NFT Theme: {nftTheme || 'None'}</p>
                      <p>Custom Prompt: {customNftPrompt || 'None'}</p>
                      <p>Generated Image: {generatedNFTImage ? 'Yes' : 'No'}</p>
                      <p>Is Generating: {isGeneratingNFT ? 'Yes' : 'No'}</p>
                      <p>User NFTs Count: {userNFTs.length}</p>
                      
                      <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <p><strong>Contract Status:</strong></p>
                        <p>Contract Address: {CONTRACT_ADDRESSES.WELLNESS_NFT}</p>
                        <p>Chain ID: {chainId}</p>
                        <p>User Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}</p>
                        <p>Has Profile: {userHasProfile ? 'Yes' : 'No'}</p>
                        <p>Token ID: {userTokenId ? userTokenId.toString() : 'None'}</p>
                        
                        {recentActivities.length > 0 && recentActivities !== sampleActivities && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p><strong>Timestamp Debug:</strong></p>
                            {recentActivities.slice(0, 2).map((activity, index) => (
                              <div key={index} className="text-xs">
                                <p>{activity.name}: {Math.floor((currentTime - activity.timestamp) / 1000 / 60)} min ago</p>
                                <p className="text-gray-500">Raw: {activity.timestamp}, Current: {currentTime}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => {
                          const testUrl = 'https://via.placeholder.com/512x512/6366f1/ffffff?text=Test+Image';
                          setGeneratedNFTImage(testUrl);
                        }}
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                      >
                        Test Image Display
                      </Button>
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {generatedNFTImage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-green-800 mb-1">
                          NFT Generated Successfully!
                        </p>
                        <p className="text-xs text-green-600">
                          Your wellness NFT has been created and is ready to be minted to your wallet.
                        </p>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => setCurrentView('dashboard')}
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                          >
                            View Collection
                          </Button>
                          <Button 
                            onClick={() => {
                              setGeneratedNFTImage(null);
                              setNftTheme(null);
                              setCustomNftPrompt('');
                            }}
                            variant="default" 
                            size="sm"
                            className="flex-1"
                          >
                            Generate Another
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <img 
                      src="/agents/smasher.png" 
                      alt="Smasher" 
                      className="w-14 h-14 rounded-full shadow-lg border-2 border-blue-400"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div>
                  <h3 className={cn(
                      "text-xl font-bold transition-colors",
                    isDarkMode ? "text-white" : "text-gray-900"
                    )}>AI Wellness Assistant - Smasher</h3>
                    <p className={cn("text-sm mt-1", isDarkMode ? "text-gray-400" : "text-gray-600")}>
                      Powered by Gymbro, Dietking & Sleepyjoe
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                  <textarea
                    value={wellnessPrompt}
                    onChange={(e) => setWellnessPrompt(e.target.value)}
                      placeholder="Ask Smasher about your wellness goals, nutrition, exercise, or any health-related questions..."
                    className={cn(
                        "w-full p-4 border rounded-xl text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm",
                      isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600" 
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:bg-gray-50"
                      )}
                    />
                    {wellnessPrompt && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        Click to send
                      </div>
                    )}
                  </div>
                  

                  
                  <Button
                    onClick={handleGetAIAdvice}
                    disabled={isLoadingAI || !wellnessPrompt.trim()}
                    className={cn(
                      "w-full py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105",
                      isDarkMode 
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" 
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    )}
                  >
                    {isLoadingAI ? '🤖 Getting advice...' : '🚀 Get AI Advice'}
                  </Button>
                  {aiResponse && (
                    <div className={cn(
                      "rounded-xl p-4 border transition-colors",
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600" 
                        : "bg-gray-50 border-gray-200"
                    )}
                    style={{ 
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto'
                    }}>
                      <p className={cn(
                        "text-sm leading-relaxed whitespace-pre-wrap break-words transition-colors",
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      )}
                      style={{ 
                        wordWrap: 'break-word',
                        overflowWrap: 'anywhere',
                        maxWidth: '100%'
                      }}>{aiResponse}</p>
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
        
        {/* Quick Action Modals */}
        
        {/* Workout Modal */}
        {showWorkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Dumbbell className="w-5 h-5 inline mr-2" />
                  Log Workout
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWorkoutModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
      </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogWorkout(); }} className="space-y-4">
                <div>
                  <Label htmlFor="workout-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="workout-duration"
                    type="number"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                    placeholder="30"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-sets" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Number of Sets
                  </Label>
                  <Input
                    id="workout-sets"
                    type="number"
                    value={workoutForm.sets}
                    onChange={(e) => setWorkoutForm({...workoutForm, sets: e.target.value})}
                    placeholder="3"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-calories" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories Burned
                  </Label>
                  <Input
                    id="workout-calories"
                    type="number"
                    value={workoutForm.caloriesBurned}
                    onChange={(e) => setWorkoutForm({...workoutForm, caloriesBurned: e.target.value})}
                    placeholder="200"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-type" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Activity Type
                  </Label>
                  <Input
                    id="workout-type"
                    type="text"
                    value={workoutForm.activityType}
                    onChange={(e) => setWorkoutForm({...workoutForm, activityType: e.target.value})}
                    placeholder="Weight Training"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="workout-name"
                    type="text"
                    value={workoutForm.name}
                    onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})}
                    placeholder="Morning workout"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Workout
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Meditation Modal */}
        {showMeditationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <EditIcon className="w-5 h-5 inline mr-2" />
                  Log Meditation
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMeditationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogMeditation(); }} className="space-y-4">
                <div>
                  <Label htmlFor="meditation-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="meditation-duration"
                    type="number"
                    value={meditationForm.duration}
                    onChange={(e) => setMeditationForm({...meditationForm, duration: e.target.value})}
                    placeholder="20"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meditation-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="meditation-name"
                    type="text"
                    value={meditationForm.name}
                    onChange={(e) => setMeditationForm({...meditationForm, name: e.target.value})}
                    placeholder="Morning meditation"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Meditation
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Enhanced Meal Modal with Macros */}
        {showMealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Coffee className="w-5 h-5 inline mr-2" />
                  Log Meal
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMealModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogMealWithMacros(); }} className="space-y-4">
                <div>
                  <Label htmlFor="meal-type" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Meal Type
                  </Label>
                  <Input
                    id="meal-type"
                    type="text"
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm({...mealForm, mealType: e.target.value})}
                    placeholder="Breakfast, Lunch, Dinner, Snack"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meal-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="meal-name"
                    type="text"
                    value={mealForm.name}
                    onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                    placeholder="Oatmeal with berries"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meal-calories" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories
                  </Label>
                  <Input
                    id="meal-calories"
                    type="number"
                    value={mealForm.calories}
                    onChange={(e) => setMealForm({...mealForm, calories: e.target.value})}
                    placeholder="300"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="meal-protein" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Protein (g)
                    </Label>
                    <Input
                      id="meal-protein"
                      type="number"
                      value={mealForm.protein}
                      onChange={(e) => setMealForm({...mealForm, protein: e.target.value})}
                      placeholder="15"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-fat" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Fat (g)
                    </Label>
                    <Input
                      id="meal-fat"
                      type="number"
                      value={mealForm.fat}
                      onChange={(e) => setMealForm({...mealForm, fat: e.target.value})}
                      placeholder="8"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-carbs" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Carbs (g)
                    </Label>
                    <Input
                      id="meal-carbs"
                      type="number"
                      value={mealForm.carbs}
                      onChange={(e) => setMealForm({...mealForm, carbs: e.target.value})}
                      placeholder="45"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Log Meal
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Sleep Modal */}
        {showSleepModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Bed className="w-5 h-5 inline mr-2" />
                  Log Sleep
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSleepModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogSleep(); }} className="space-y-4">
                <div>
                  <Label htmlFor="sleep-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (hours)
                  </Label>
                  <Input
                    id="sleep-duration"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepForm.duration}
                    onChange={(e) => setSleepForm({...sleepForm, duration: e.target.value})}
                    placeholder="7.5"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Sleep
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Quick Action Modals */}
        
        {/* Workout Modal */}
        {showWorkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Dumbbell className="w-5 h-5 inline mr-2" />
                  Log Workout
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWorkoutModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogWorkout(); }} className="space-y-4">
                <div>
                  <Label htmlFor="workout-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="workout-duration"
                    type="number"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                    placeholder="30"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-sets" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Number of Sets
                  </Label>
                  <Input
                    id="workout-sets"
                    type="number"
                    value={workoutForm.sets}
                    onChange={(e) => setWorkoutForm({...workoutForm, sets: e.target.value})}
                    placeholder="3"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-calories" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories Burned
                  </Label>
                  <Input
                    id="workout-calories"
                    type="number"
                    value={workoutForm.caloriesBurned}
                    onChange={(e) => setWorkoutForm({...workoutForm, caloriesBurned: e.target.value})}
                    placeholder="200"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-type" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Activity Type
                  </Label>
                  <Input
                    id="workout-type"
                    type="text"
                    value={workoutForm.activityType}
                    onChange={(e) => setWorkoutForm({...workoutForm, activityType: e.target.value})}
                    placeholder="Weight Training"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="workout-name"
                    type="text"
                    value={workoutForm.name}
                    onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})}
                    placeholder="Morning workout"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Workout
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Meditation Modal */}
        {showMeditationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <EditIcon className="w-5 h-5 inline mr-2" />
                  Log Meditation
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMeditationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogMeditation(); }} className="space-y-4">
                <div>
                  <Label htmlFor="meditation-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="meditation-duration"
                    type="number"
                    value={meditationForm.duration}
                    onChange={(e) => setMeditationForm({...meditationForm, duration: e.target.value})}
                    placeholder="20"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meditation-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="meditation-name"
                    type="text"
                    value={meditationForm.name}
                    onChange={(e) => setMeditationForm({...meditationForm, name: e.target.value})}
                    placeholder="Morning meditation"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Meditation
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Enhanced Meal Modal with Macros */}
        {showMealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Coffee className="w-5 h-5 inline mr-2" />
                  Log Meal
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMealModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogMealWithMacros(); }} className="space-y-4">
                <div>
                  <Label htmlFor="meal-type" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Meal Type
                  </Label>
                  <Input
                    id="meal-type"
                    type="text"
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm({...mealForm, mealType: e.target.value})}
                    placeholder="Breakfast, Lunch, Dinner, Snack"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meal-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="meal-name"
                    type="text"
                    value={mealForm.name}
                    onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                    placeholder="Oatmeal with berries"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meal-calories" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories
                  </Label>
                  <Input
                    id="meal-calories"
                    type="number"
                    value={mealForm.calories}
                    onChange={(e) => setMealForm({...mealForm, calories: e.target.value})}
                    placeholder="300"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="meal-protein" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Protein (g)
                    </Label>
                    <Input
                      id="meal-protein"
                      type="number"
                      value={mealForm.protein}
                      onChange={(e) => setMealForm({...mealForm, protein: e.target.value})}
                      placeholder="15"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-fat" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Fat (g)
                    </Label>
                    <Input
                      id="meal-fat"
                      type="number"
                      value={mealForm.fat}
                      onChange={(e) => setMealForm({...mealForm, fat: e.target.value})}
                      placeholder="8"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-carbs" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Carbs (g)
                    </Label>
                    <Input
                      id="meal-carbs"
                      type="number"
                      value={mealForm.carbs}
                      onChange={(e) => setMealForm({...mealForm, carbs: e.target.value})}
                      placeholder="45"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Log Meal
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Sleep Modal */}
        {showSleepModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Bed className="w-5 h-5 inline mr-2" />
                  Log Sleep
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSleepModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogSleep(); }} className="space-y-4">
                <div>
                  <Label htmlFor="sleep-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (hours)
                  </Label>
                  <Input
                    id="sleep-duration"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepForm.duration}
                    onChange={(e) => setSleepForm({...sleepForm, duration: e.target.value})}
                    placeholder="7.5"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Sleep
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Quick Action Modals */}
        
        {/* Workout Modal */}
        {showWorkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Dumbbell className="w-5 h-5 inline mr-2" />
                  Log Workout
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWorkoutModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogWorkout(); }} className="space-y-4">
                <div>
                  <Label htmlFor="workout-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="workout-duration"
                    type="number"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                    placeholder="30"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-sets" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Number of Sets
                  </Label>
                  <Input
                    id="workout-sets"
                    type="number"
                    value={workoutForm.sets}
                    onChange={(e) => setWorkoutForm({...workoutForm, sets: e.target.value})}
                    placeholder="3"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-calories" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories Burned
                  </Label>
                  <Input
                    id="workout-calories"
                    type="number"
                    value={workoutForm.caloriesBurned}
                    onChange={(e) => setWorkoutForm({...workoutForm, caloriesBurned: e.target.value})}
                    placeholder="200"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-type" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Activity Type
                  </Label>
                  <Input
                    id="workout-type"
                    type="text"
                    value={workoutForm.activityType}
                    onChange={(e) => setWorkoutForm({...workoutForm, activityType: e.target.value})}
                    placeholder="Weight Training"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="workout-name"
                    type="text"
                    value={workoutForm.name}
                    onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})}
                    placeholder="Morning workout"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Workout
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Meditation Modal */}
        {showMeditationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <EditIcon className="w-5 h-5 inline mr-2" />
                  Log Meditation
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMeditationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogMeditation(); }} className="space-y-4">
                <div>
                  <Label htmlFor="meditation-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="meditation-duration"
                    type="number"
                    value={meditationForm.duration}
                    onChange={(e) => setMeditationForm({...meditationForm, duration: e.target.value})}
                    placeholder="20"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meditation-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="meditation-name"
                    type="text"
                    value={meditationForm.name}
                    onChange={(e) => setMeditationForm({...meditationForm, name: e.target.value})}
                    placeholder="Morning meditation"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Meditation
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Enhanced Meal Modal with Macros */}
        {showMealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Coffee className="w-5 h-5 inline mr-2" />
                  Log Meal
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMealModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogMealWithMacros(); }} className="space-y-4">
                <div>
                  <Label htmlFor="meal-type" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Meal Type
                  </Label>
                  <Input
                    id="meal-type"
                    type="text"
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm({...mealForm, mealType: e.target.value})}
                    placeholder="Breakfast, Lunch, Dinner, Snack"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meal-name" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Name (optional)
                  </Label>
                  <Input
                    id="meal-name"
                    type="text"
                    value={mealForm.name}
                    onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                    placeholder="Oatmeal with berries"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meal-calories" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories
                  </Label>
                  <Input
                    id="meal-calories"
                    type="number"
                    value={mealForm.calories}
                    onChange={(e) => setMealForm({...mealForm, calories: e.target.value})}
                    placeholder="300"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="meal-protein" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Protein (g)
                    </Label>
                    <Input
                      id="meal-protein"
                      type="number"
                      value={mealForm.protein}
                      onChange={(e) => setMealForm({...mealForm, protein: e.target.value})}
                      placeholder="15"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-fat" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Fat (g)
                    </Label>
                    <Input
                      id="meal-fat"
                      type="number"
                      value={mealForm.fat}
                      onChange={(e) => setMealForm({...mealForm, fat: e.target.value})}
                      placeholder="8"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-carbs" className={cn(
                      "block text-sm font-medium mb-2 transition-colors",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Carbs (g)
                    </Label>
                    <Input
                      id="meal-carbs"
                      type="number"
                      value={mealForm.carbs}
                      onChange={(e) => setMealForm({...mealForm, carbs: e.target.value})}
                      placeholder="45"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-gray-400"
                      )}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Log Meal
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Sleep Modal */}
        {showSleepModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={cn(
              "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-black"
                )}>
                  <Bed className="w-5 h-5 inline mr-2" />
                  Log Sleep
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSleepModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogSleep(); }} className="space-y-4">
                <div>
                  <Label htmlFor="sleep-duration" className={cn(
                    "block text-sm font-medium mb-2 transition-colors",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (hours)
                  </Label>
                  <Input
                    id="sleep-duration"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepForm.duration}
                    onChange={(e) => setSleepForm({...sleepForm, duration: e.target.value})}
                    placeholder="7.5"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-gray-400"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Sleep
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Action Modals */}
      
      {/* Workout Modal */}
      {showWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={cn(
            "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
            isDarkMode 
              ? "bg-gray-800 border-gray-600 text-white" 
              : "bg-white border-gray-200 text-black",
            "border"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                <Dumbbell className="w-5 h-5 inline mr-2" />
                Log Workout
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWorkoutModal(false)}
                className={cn(
                  "text-gray-500 hover:text-gray-700",
                  isDarkMode ? "text-gray-400 hover:text-gray-200" : ""
                )}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleLogWorkout(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workout-activity-type" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Activity Type
                  </Label>
                  <Input
                    id="workout-activity-type"
                    type="text"
                    value={workoutForm.activityType}
                    onChange={(e) => setWorkoutForm({...workoutForm, activityType: e.target.value})}
                    placeholder="e.g., Running, Weightlifting, Yoga"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-name" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Workout Name
                  </Label>
                  <Input
                    id="workout-name"
                    type="text"
                    value={workoutForm.name}
                    onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})}
                    placeholder="e.g., Morning Cardio, Upper Body Strength"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-duration" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="workout-duration"
                    type="number"
                    min="1"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                    placeholder="45"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-sets" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Number of Sets
                  </Label>
                  <Input
                    id="workout-sets"
                    type="number"
                    min="1"
                    value={workoutForm.sets}
                    onChange={(e) => setWorkoutForm({...workoutForm, sets: e.target.value})}
                    placeholder="3"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="workout-calories" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories Burned
                  </Label>
                  <Input
                    id="workout-calories"
                    type="number"
                    min="1"
                    value={workoutForm.caloriesBurned}
                    onChange={(e) => setWorkoutForm({...workoutForm, caloriesBurned: e.target.value})}
                    placeholder="300"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowWorkoutModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Log Workout
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meditation Modal */}
      {showMeditationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={cn(
            "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
            isDarkMode 
              ? "bg-gray-800 border-gray-600 text-white" 
              : "bg-white border-gray-200 text-black",
            "border"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                <EditIcon className="w-5 h-5 inline mr-2" />
                Log Meditation
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMeditationModal(false)}
                className={cn(
                  "text-gray-500 hover:text-gray-700",
                  isDarkMode ? "text-gray-400 hover:text-gray-200" : ""
                )}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleLogMeditation(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meditation-name" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Session Name
                  </Label>
                  <Input
                    id="meditation-name"
                    type="text"
                    value={meditationForm.name}
                    onChange={(e) => setMeditationForm({...meditationForm, name: e.target.value})}
                    placeholder="e.g., Morning Mindfulness, Stress Relief"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meditation-duration" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="meditation-duration"
                    type="number"
                    min="1"
                    value={meditationForm.duration}
                    onChange={(e) => setMeditationForm({...meditationForm, duration: e.target.value})}
                    placeholder="20"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowMeditationModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Log Meditation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={cn(
            "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
            isDarkMode 
              ? "bg-gray-800 border-gray-600 text-white" 
              : "bg-white border-gray-200 text-black",
            "border"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                <Coffee className="w-5 h-5 inline mr-2" />
                Log Meal
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMealModal(false)}
                className={cn(
                  "text-gray-500 hover:text-gray-700",
                  isDarkMode ? "text-gray-400 hover:text-gray-200" : ""
                )}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleLogMealWithMacros(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meal-type" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Meal Type
                  </Label>
                  <select
                    id="meal-type"
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm({...mealForm, mealType: e.target.value})}
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  >
                    <option value="">Select meal type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="meal-name" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Meal Name
                  </Label>
                  <Input
                    id="meal-name"
                    type="text"
                    value={mealForm.name}
                    onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                    placeholder="e.g., Grilled Chicken Salad, Protein Smoothie"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="meal-calories" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Calories
                  </Label>
                  <Input
                    id="meal-calories"
                    type="number"
                    min="1"
                    value={mealForm.calories}
                    onChange={(e) => setMealForm({...mealForm, calories: e.target.value})}
                    placeholder="450"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="meal-protein" className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Protein (g)
                    </Label>
                    <Input
                      id="meal-protein"
                      type="number"
                      min="0"
                      value={mealForm.protein}
                      onChange={(e) => setMealForm({...mealForm, protein: e.target.value})}
                      placeholder="25"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-fat" className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Fat (g)
                    </Label>
                    <Input
                      id="meal-fat"
                      type="number"
                      min="0"
                      value={mealForm.fat}
                      onChange={(e) => setMealForm({...mealForm, fat: e.target.value})}
                      placeholder="15"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-carbs" className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Carbs (g)
                    </Label>
                    <Input
                      id="meal-carbs"
                      type="number"
                      min="0"
                      value={mealForm.carbs}
                      onChange={(e) => setMealForm({...mealForm, carbs: e.target.value})}
                      placeholder="30"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                          : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowMealModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Log Meal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sleep Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={cn(
            "w-full max-w-md mx-4 p-6 rounded-lg transition-colors duration-300",
            isDarkMode 
              ? "bg-gray-800 border-gray-600 text-white" 
              : "bg-white border-gray-200 text-black",
            "border"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                <Bed className="w-5 h-5 inline mr-2" />
                Log Sleep
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSleepModal(false)}
                className={cn(
                  "text-gray-500 hover:text-gray-700",
                  isDarkMode ? "text-gray-400 hover:text-gray-200" : ""
                )}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleLogSleep(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sleep-duration" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Duration (hours)
                  </Label>
                  <Input
                    id="sleep-duration"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepForm.duration}
                    onChange={(e) => setSleepForm({...sleepForm, duration: e.target.value})}
                    placeholder="7.5"
                    required
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg transition-colors duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-600 text-white focus:border-gray-500" 
                        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Log Sleep
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Farcaster Page Component
function FarcasterPageContent() {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const { isConnected: isFarcasterConnected } = useFarcaster();
  const { address, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();

  // Show connection modal when wallet disconnects or on initial load
  useEffect(() => {
    if (!hasCheckedConnection && !isConnecting) {
      setHasCheckedConnection(true);
      if (!isFarcasterConnected) {
        setShowConnectionModal(true);
      }
    }
  }, [isFarcasterConnected, hasCheckedConnection, isConnecting]);

  // Listen for wallet disconnection and show connection modal
  useEffect(() => {
    if (!address && hasCheckedConnection && !isConnecting) {
      setShowConnectionModal(true);
    }
  }, [address, hasCheckedConnection, isConnecting]);

  // Show modal when wallet is disconnected or Farcaster is not connected
  const shouldShowModal = showConnectionModal && (!address || !isFarcasterConnected) && !isConnecting;

  // Debug logging to track connection states
  useEffect(() => {
    console.log('Farcaster Page - Connection States:', {
      isConnecting,
      isFarcasterConnected,
      hasCheckedConnection,
      showConnectionModal,
      shouldShowModal
    });
  }, [isConnecting, isFarcasterConnected, hasCheckedConnection, showConnectionModal, shouldShowModal]);

  // Show loading state while wallet is connecting
  if (isConnecting) {
    return (
      <div className={cn(
        "min-h-screen w-full flex items-center justify-center transition-colors duration-300",
        "bg-white dark:bg-black"
      )}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Connecting wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen w-full transition-colors duration-300",
      "bg-white dark:bg-black"
    )}>
      <MobileNavigation />
      <MobileDashboard />
      
      <FarcasterConnectionModal 
        isOpen={shouldShowModal} 
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
