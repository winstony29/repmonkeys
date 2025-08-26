import React, { useState, useCallback, useContext } from 'react';
import { AppContext } from './AppProvider';

interface AIResponse {
  type: string;
  advice?: string;
  message?: string;
  blockchain_integration?: {
    suggested_actions: Array<{
      type: string;
      description: string;
      contract_function: string;
      estimated_rewards: string;
    }>;
    wellness_score_impact: number;
    token_rewards: string;
  };
  primary_focus?: string;
  primary_agent?: string;
  agent_contributions?: {
    [key: string]: {
      specialty: string;
      contribution: string;
      recommendations: string[];
    };
  };
  integrated_recommendations?: {
    weekly_schedule: {
      [key: string]: string;
    };
  };
  implementation_priority?: string[];
  progress_updates?: Array<{
    type: string;
    agent: string;
    message: string;
    emoji?: string;
    progress?: number;
  }>;
}

interface AIWellnessChatProps {
  className?: string;
}

export const AIWellnessChat: React.FC<AIWellnessChatProps> = ({ className = '' }) => {
  const { address, chainId } = useContext(AppContext);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{
    user: string;
    ai: AIResponse;
    timestamp: Date;
  }>>([]);
  
  // New state for thinking animations
  const [thinkingStatus, setThinkingStatus] = useState<string>('');
  const [agentProgress, setAgentProgress] = useState<{
    [key: string]: { status: string; progress: number; message: string; emoji: string };
  }>({});

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setThinkingStatus('🚀 Starting AI Wellness Assistant...');
    setAgentProgress({});

    try {
      const response = await fetch('/api/ai-wellness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: message,
          userGoals: [], // TODO: Get from user profile
          userProfile: {}, // TODO: Get from user profile
          walletAddress: address,
          chainId: chainId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const newResponse = data.response;
        setAiResponse(newResponse);
        
        // Process progress updates to show thinking animations
        if (newResponse.progress_updates) {
          newResponse.progress_updates.forEach((update: any) => {
            if (update.type === 'status') {
              setThinkingStatus(update.message);
            } else if (update.type === 'agent_thinking') {
              setAgentProgress(prev => ({
                ...prev,
                [update.agent]: {
                  status: 'thinking',
                  progress: 0,
                  message: update.message,
                  emoji: update.emoji
                }
              }));
            } else if (update.type === 'agent_progress') {
              setAgentProgress(prev => ({
                ...prev,
                [update.agent]: {
                  ...prev[update.agent],
                  progress: update.progress,
                  message: update.message
                }
              }));
            } else if (update.type === 'agent_complete') {
              setAgentProgress(prev => ({
                ...prev,
                [update.agent]: {
                  ...prev[update.agent],
                  status: 'complete',
                  progress: 100,
                  message: update.message
                }
              }));
            }
          });
        }
        
        // Add to chat history
        setChatHistory(prev => [...prev, {
          user: message,
          ai: newResponse,
          timestamp: new Date(),
        }]);
        
        setMessage('');
        setThinkingStatus('');
        setAgentProgress({});
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('AI Wellness API Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setThinkingStatus('');
      setAgentProgress({});
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, address, chainId]);

  const handleBlockchainAction = useCallback(async (action: any) => {
    console.log('Blockchain action requested:', action);
    // TODO: Implement blockchain actions based on AI response
    // This could trigger contract calls to log workouts, meals, etc.
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 AI Wellness Assistant
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Get personalized wellness advice powered by AI agents. Ask about workouts, nutrition, sleep, or mental health!
        </p>
      </div>

      {/* Thinking Animations */}
      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              {thinkingStatus}
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Coordinating with specialist agents...
            </p>
          </div>
          
          {/* Agent Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(agentProgress).map(([agentName, progress]) => (
              <div key={agentName} className="p-3 bg-white dark:bg-gray-700 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {progress.emoji} {agentName}
                  </h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    progress.status === 'thinking' ? 'bg-yellow-100 text-yellow-800' :
                    progress.status === 'complete' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {progress.status === 'thinking' ? 'Thinking...' :
                     progress.status === 'complete' ? 'Complete' : 'Ready'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {progress.message}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {progress.progress}% complete
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="mb-6 max-h-96 overflow-y-auto space-y-4">
        {chatHistory.map((chat, index) => (
          <div key={index} className="space-y-3">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs">
                <p className="text-sm">{chat.user}</p>
              </div>
            </div>
            
            {/* AI Response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 max-w-4xl">
                <div className="text-sm text-gray-900 dark:text-white">
                  {/* Display the main message */}
                  <div className="mb-3 font-medium">
                    {chat.ai.message}
                  </div>
                  
                  {/* Display the full wellness plan */}
                  {chat.ai.primary_focus && (
                    <div className="space-y-4">
                      {/* Primary Focus */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          🎯 Primary Focus: {chat.ai.primary_focus}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Led by {chat.ai.primary_agent}
                        </p>
                      </div>
                      
                      {/* Agent Contributions */}
                      {chat.ai.agent_contributions && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            🤝 Specialist Agent Recommendations
                          </h4>
                          
                          {Object.entries(chat.ai.agent_contributions).map(([agentName, agentData]: [string, any]) => (
                            <div key={agentName} className="p-3 bg-white dark:bg-gray-700 rounded-lg border">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                {agentName === 'GymBro' ? '💪 GymBro' : 
                                 agentName === 'DietKing' ? '🥗 DietKing' : 
                                 agentName === 'SleepyJoe' ? '😴 SleepyJoe' : 
                                 '🌟 WellnessBuddy'} - {agentData.specialty}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {agentData.contribution}
                              </p>
                              <div className="space-y-1">
                                {agentData.recommendations && agentData.recommendations.map((rec: string, index: number) => (
                                  <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                    • {rec}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Weekly Schedule */}
                      {chat.ai.integrated_recommendations?.weekly_schedule && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            📅 Weekly Schedule
                          </h4>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            {Object.entries(chat.ai.integrated_recommendations.weekly_schedule).map(([day, activity]: [string, string]) => (
                              <div key={day} className="flex justify-between">
                                <span className="font-medium capitalize text-green-700 dark:text-green-300">{day}:</span>
                                <span className="text-green-600 dark:text-green-400">{activity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Implementation Priority */}
                      {chat.ai.implementation_priority && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                            🚀 Implementation Priority
                          </h4>
                          <div className="space-y-1">
                            {chat.ai.implementation_priority.map((priority: string, index: number) => (
                              <div key={index} className="text-sm text-purple-700 dark:text-purple-300">
                                {priority}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Blockchain Integration */}
                {chat.ai.blockchain_integration && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      🔗 Blockchain Actions Available
                    </h4>
                    
                    <div className="space-y-2">
                      {chat.ai.blockchain_integration.suggested_actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {action.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {action.estimated_rewards}
                            </p>
                          </div>
                          <button
                            onClick={() => handleBlockchainAction(action)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            Execute
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
                      <p>Wellness Score Impact: +{chat.ai.blockchain_integration.wellness_score_impact}</p>
                      <p>Token Rewards: {chat.ai.blockchain_integration.token_rewards}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current AI Response */}
      {aiResponse && !chatHistory.length && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-gray-900 dark:text-white mb-3">
            {/* Display the main message */}
            <div className="mb-3 font-medium">
              {aiResponse.message}
            </div>
            
            {/* Display the full wellness plan */}
            {aiResponse.primary_focus && (
              <div className="space-y-4">
                {/* Primary Focus */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    🎯 Primary Focus: {aiResponse.primary_focus}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Led by {aiResponse.primary_agent}
                  </p>
                </div>
                
                {/* Agent Contributions */}
                {aiResponse.agent_contributions && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      🤝 Specialist Agent Recommendations
                    </h4>
                    
                    {Object.entries(aiResponse.agent_contributions).map(([agentName, agentData]: [string, any]) => (
                      <div key={agentName} className="p-3 bg-white dark:bg-gray-700 rounded-lg border">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          {agentName === 'GymBro' ? '💪 GymBro' : 
                           agentName === 'DietKing' ? '🥗 DietKing' : 
                           agentName === 'SleepyJoe' ? '😴 SleepyJoe' : 
                           '🌟 WellnessBuddy'} - {agentData.specialty}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {agentData.contribution}
                        </p>
                        <div className="space-y-1">
                          {agentData.recommendations && agentData.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                              • {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Weekly Schedule */}
                {aiResponse.integrated_recommendations?.weekly_schedule && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      📅 Weekly Schedule
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {Object.entries(aiResponse.integrated_recommendations.weekly_schedule).map(([day, activity]: [string, string]) => (
                        <div key={day} className="flex justify-between">
                          <span className="font-medium capitalize text-green-700 dark:text-green-300">{day}:</span>
                          <span className="text-green-600 dark:text-green-400">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Implementation Priority */}
                {aiResponse.implementation_priority && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                      🚀 Implementation Priority
                    </h4>
                    <div className="space-y-1">
                      {aiResponse.implementation_priority.map((priority: string, index: number) => (
                        <div key={index} className="text-sm text-purple-700 dark:text-purple-300">
                          {priority}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {aiResponse.blockchain_integration && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🔗 Suggested Blockchain Actions
              </h4>
              {aiResponse.blockchain_integration.suggested_actions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border mb-2">
                  <div>
                    <p className="text-sm font-medium">{action.description}</p>
                    <p className="text-xs text-gray-500">{action.estimated_rewards}</p>
                  </div>
                  <button
                    onClick={() => handleBlockchainAction(action)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Execute
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">
            ❌ {error}
          </p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me about workouts, nutrition, sleep, or mental health..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '🤔 Thinking...' : 'Send'}
          </button>
        </div>
        
        {!address && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            💡 Connect your wallet to unlock blockchain features and earn $WELL tokens!
          </p>
        )}
      </form>

      {/* Status Indicators */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${address ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>{address ? 'Wallet Connected' : 'Wallet Disconnected'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${chainId === 8453 ? 'bg-green-500' : 'bg-red-400'}`}></div>
          <span>{chainId === 8453 ? 'Base Mainnet' : 'Wrong Network'}</span>
        </div>
      </div>
    </div>
  );
};
