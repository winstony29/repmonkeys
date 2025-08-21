'use client';

import { useState } from 'react';
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
  Zap
} from 'lucide-react';

interface WellnessData {
  activities: number;
  meals: number;
  streak: number;
  weeklyGoal: number;
  score: number;
}

export default function WellnessFrame() {
  const [currentView, setCurrentView] = useState<'main' | 'activity' | 'meal' | 'goals'>('main');
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    activities: 12,
    meals: 8,
    streak: 5,
    weeklyGoal: 7,
    score: 85
  });

  const handleLogActivity = () => {
    setWellnessData(prev => ({
      ...prev,
      activities: prev.activities + 1,
      streak: prev.streak + 1,
      score: Math.min(100, prev.score + 5)
    }));
    // Here you would also call your smart contract
  };

  const handleLogMeal = () => {
    setWellnessData(prev => ({
      ...prev,
      meals: prev.meals + 1,
      score: Math.min(100, prev.score + 3)
    }));
  };

  const renderMainView = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-2">WellSpace</h1>
        <p className="text-gray-600">Your Wellness Journey</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <Activity className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-sm font-medium">{wellnessData.activities}</p>
            <p className="text-xs text-gray-500">Activities</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-3">
            <Utensils className="w-6 h-6 mx-auto text-orange-500 mb-1" />
            <p className="text-sm font-medium">{wellnessData.meals}</p>
            <p className="text-xs text-gray-500">Meals</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-3">
            <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-sm font-medium">{wellnessData.streak}</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-3">
            <Trophy className="w-6 h-6 mx-auto text-purple-500 mb-1" />
            <p className="text-sm font-medium">{wellnessData.score}</p>
            <p className="text-xs text-gray-500">Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={() => setCurrentView('activity')}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Log Activity
        </Button>
        <Button 
          onClick={() => setCurrentView('meal')}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          Log Meal
        </Button>
        <Button 
          onClick={() => setCurrentView('goals')}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          Set Goals
        </Button>
      </div>
    </div>
  );

  const renderActivityView = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentView('main')}
          className="absolute left-2 top-2"
        >
          ← Back
        </Button>
        <h2 className="text-xl font-bold text-blue-600">Log Activity</h2>
      </div>
      
      <div className="space-y-3">
        <Button 
          onClick={handleLogActivity}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          🏃‍♂️ Running (30 min)
        </Button>
        <Button 
          onClick={handleLogActivity}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          🏋️‍♂️ Weight Training
        </Button>
        <Button 
          onClick={handleLogActivity}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          🧘‍♀️ Yoga Session
        </Button>
        <Button 
          onClick={handleLogActivity}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          🚴‍♂️ Cycling
        </Button>
      </div>
    </div>
  );

  const renderMealView = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentView('main')}
          className="absolute left-2 top-2"
        >
          ← Back
        </Button>
        <h2 className="text-xl font-bold text-orange-600">Log Meal</h2>
      </div>
      
      <div className="space-y-3">
        <Button 
          onClick={handleLogMeal}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          🍳 Breakfast
        </Button>
        <Button 
          onClick={handleLogMeal}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          🥗 Lunch
        </Button>
        <Button 
          onClick={handleLogMeal}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          🍽️ Dinner
        </Button>
        <Button 
          onClick={handleLogMeal}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          🍎 Snack
        </Button>
      </div>
    </div>
  );

  const renderGoalsView = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentView('main')}
          className="absolute left-2 top-2"
        >
          ← Back
        </Button>
        <h2 className="text-xl font-bold text-green-600">Weekly Goals</h2>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span>Exercise 5x/week</span>
          <Badge variant={wellnessData.activities >= 5 ? "default" : "secondary"}>
            {wellnessData.activities}/5
          </Badge>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span>Log 3 meals/day</span>
          <Badge variant={wellnessData.meals >= 21 ? "default" : "secondary"}>
            {wellnessData.meals}/21
          </Badge>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span>Maintain streak</span>
          <Badge variant={wellnessData.streak >= 7 ? "default" : "secondary"}>
            {wellnessData.streak} days
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg">
            {currentView === 'main' && 'WellSpace Dashboard'}
            {currentView === 'activity' && 'Log Activity'}
            {currentView === 'meal' && 'Log Meal'}
            {currentView === 'goals' && 'Weekly Goals'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentView === 'main' && renderMainView()}
          {currentView === 'activity' && renderActivityView()}
          {currentView === 'meal' && renderMealView()}
          {currentView === 'goals' && renderGoalsView()}
        </CardContent>
      </Card>
    </div>
  );
}
