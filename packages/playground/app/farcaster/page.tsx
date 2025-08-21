'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Mock wallet state for standalone functionality
function useMockWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  const connectWallet = () => {
    // Simulate wallet connection
    setIsConnected(true);
    setAddress('0x1234...5678');
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
  };

  return {
    isConnected,
    address,
    connectWallet,
    disconnectWallet
  };
}

// Wellness Data Context - This will sync with your main page
const WellnessContext = createContext<{
  wellnessData: any;
  updateWellnessData: (data: any) => void;
}>({
  wellnessData: null,
  updateWellnessData: () => {},
});

const useWellness = () => useContext(WellnessContext);

// Wellness Provider Component
function WellnessProvider({ children }: { children: React.ReactNode }) {
  const [wellnessData, setWellnessData] = useState({
    streak: 0,
    score: 0,
    activities: 0,
    meals: 0,
    wellBalance: 0.00
  });

  // Try to sync with main page data
  useEffect(() => {
    const syncWithMainPage = () => {
      // Check if main page has wellness data
      const mainPageData = localStorage.getItem('wellness_data_main');
      if (mainPageData) {
        try {
          const parsed = JSON.parse(mainPageData);
          setWellnessData(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (error) {
          console.log('Could not parse main page wellness data');
        }
      }

      // Also check for any other wellness data keys
      const keys = ['wellness_data', 'wellspace_user_data', 'farcaster_wellness'];
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.score || parsed.streak || parsed.activities) {
              setWellnessData(prev => ({
                ...prev,
                ...parsed
              }));
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }
      });
    };

    // Sync immediately and set up interval
    syncWithMainPage();
    const interval = setInterval(syncWithMainPage, 2000); // Sync every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const updateWellnessData = (data: any) => {
    setWellnessData(prev => ({
      ...prev,
      ...data
    }));
  };

  return (
    <WellnessContext.Provider value={{
      wellnessData,
      updateWellnessData
    }}>
      {children}
    </WellnessContext.Provider>
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
  const { isConnected, address, connectWallet, disconnectWallet } = useMockWallet();
  const { userHandle, isConnected: isFarcasterConnected, disconnectUser } = useFarcaster();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isDarkMode ? "bg-white" : "bg-black"
          )}>
            <span className={cn(
              "font-bold text-lg",
              isDarkMode ? "text-black" : "text-white"
            )}>W</span>
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
                  {address}
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
              
              {isConnected ? (
                <Button 
                  onClick={disconnectWallet}
                  variant="outline"
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              ) : (
                <Button 
                  onClick={connectWallet}
                  className="w-full"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
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
  const { address, isConnected } = useMockWallet();
  const { userHandle, isConnected: isFarcasterConnected } = useFarcaster();
  const { wellnessData, updateWellnessData } = useWellness();
  const [currentView, setCurrentView] = useState<'dashboard' | 'activity' | 'meals' | 'goals' | 'rewards'>('dashboard');
  
  // Mock data for recent activities and meals
  const mockActivities = [
    { id: 1, type: 'sleep', name: 'Logged sleep', reward: 30, timestamp: Date.now() - 3600000, completed: true },
    { id: 2, type: 'activity', name: 'Completed workout', reward: 50, timestamp: Date.now() - 300000, completed: true },
    { id: 3, type: 'activity', name: 'Weight Training', reward: 40, timestamp: Date.now() - 1800000, completed: true },
    { id: 4, type: 'activity', name: 'Yoga Session', reward: 45, timestamp: Date.now() - 1200000, completed: true },
    { id: 5, type: 'activity', name: 'Cycling', reward: 35, timestamp: Date.now() - 600000, completed: true },
  ];

  const mockMeals = [
    { id: 1, type: 'breakfast', name: 'Breakfast', calories: 400, timestamp: Date.now() - 3600000 },
    { id: 2, type: 'lunch', name: 'Lunch', calories: 600, timestamp: Date.now() - 2400000 },
    { id: 3, type: 'dinner', name: 'Dinner', calories: 800, timestamp: Date.now() - 1200000 },
    { id: 4, type: 'snack', name: 'Snack', calories: 200, timestamp: Date.now() - 600000 },
  ];

  // Update wellness data from mock activities and meals
  useEffect(() => {
    const newWellnessData = {
      streak: wellnessData.streak,
      score: wellnessData.score,
      lastActivityTimestamp: wellnessData.lastActivityTimestamp,
      dailyStreakStart: wellnessData.dailyStreakStart,
      weeklyGoals: wellnessData.weeklyGoals,
      activities: wellnessData.activities,
      meals: wellnessData.meals,
      wellBalance: wellnessData.wellBalance,
    };

    // Simulate streak and score updates
    const now = Date.now();
    const lastActivityTimestamp = newWellnessData.lastActivityTimestamp;
    const dailyStreakStart = newWellnessData.dailyStreakStart;

    if (lastActivityTimestamp && dailyStreakStart) {
      const lastActivityTime = new Date(lastActivityTimestamp).getTime();
      const dailyStreakStartTime = new Date(dailyStreakStart).getTime();

      if (now - lastActivityTime < 24 * 60 * 60 * 1000) {
        newWellnessData.streak = wellnessData.streak + 1;
      } else {
        newWellnessData.streak = 0;
      }

      if (now - dailyStreakStartTime < 7 * 24 * 60 * 60 * 1000) {
        newWellnessData.score = wellnessData.score + 1;
      } else {
        newWellnessData.score = 0;
      }
    }

    // Simulate activity and meal counts
    newWellnessData.activities = mockActivities.filter(act => act.timestamp > now - 7 * 24 * 60 * 60 * 1000).length;
    newWellnessData.meals = mockMeals.filter(meal => meal.timestamp > now - 7 * 24 * 60 * 60 * 1000).length;

    // Simulate well balance updates
    newWellnessData.wellBalance = wellnessData.wellBalance + (Math.random() * 10 - 5); // Random fluctuation

    updateWellnessData(newWellnessData);
  }, [mockActivities, mockMeals, wellnessData, updateWellnessData]);

  const renderDashboard = () => (
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
              {wellnessData.score}
            </div>
            <div className="text-green-500 text-sm font-medium">+12% this week</div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className={cn(
                "text-xl font-bold transition-colors",
                isDarkMode ? "text-white" : "text-black"
              )}>
                {wellnessData.streak}
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
                ${wellnessData.wellBalance}
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
          {mockActivities.map(activity => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderActivity = () => (
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
          onClick={() => {
            // Simulate logging sleep
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          <Bed className="w-4 h-4 mr-2" />
          Log Sleep
        </Button>
        <Button 
          onClick={() => {
            // Simulate logging a workout
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          Running (30 min)
        </Button>
        <Button 
          onClick={() => {
            // Simulate logging a workout
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          Weight Training
        </Button>
        <Button 
          onClick={() => {
            // Simulate logging a workout
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          Yoga Session
        </Button>
        <Button 
          onClick={() => {
            // Simulate logging a workout
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          Cycling
        </Button>
      </div>
    </div>
  );

  const renderMeals = () => (
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
          onClick={() => {
            // Simulate logging a meal
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          Breakfast
        </Button>
        <Button 
          onClick={() => {
            // Simulate logging a meal
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          Lunch
        </Button>
        <Button 
          onClick={() => {
            // Simulate logging a meal
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          Dinner
        </Button>
        <Button 
          onClick={() => {
            // Simulate logging a meal
            updateWellnessData({ lastActivityTimestamp: Date.now() });
          }}
          variant="outline"
          className="w-full h-12"
        >
          Snack
        </Button>
      </div>
    </div>
  );

  const renderGoals = () => (
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
          <Badge variant={wellnessData.activities >= 5 ? "default" : "secondary"}>
            {wellnessData.activities}/5
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
          <Badge variant={wellnessData.meals >= 21 ? "default" : "secondary"}>
            {wellnessData.meals}/21
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
          <Badge variant={wellnessData.streak >= 7 ? "default" : "secondary"}>
            {wellnessData.streak} days
          </Badge>
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
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
  );

  return (
    <div className="pt-20 pb-6 px-4 min-h-screen transition-colors duration-300">
      <div className="max-w-md mx-auto">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'activity' && renderActivity()}
        {currentView === 'meals' && renderMeals()}
        {currentView === 'goals' && renderGoals()}
        {currentView === 'rewards' && renderRewards()}
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

// Main export with Theme Provider and Farcaster Provider
export default function FarcasterPage() {
  return (
    <ThemeProvider>
      <FarcasterProvider>
        <WellnessProvider>
          <FarcasterPageContent />
        </WellnessProvider>
      </FarcasterProvider>
    </ThemeProvider>
  );
}
