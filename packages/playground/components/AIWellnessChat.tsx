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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

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
        
        // Add to chat history
        setChatHistory(prev => [...prev, {
          user: message,
          ai: newResponse,
          timestamp: new Date(),
        }]);
        
        setMessage('');
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('AI Wellness API Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 max-w-2xl">
                <div className="text-sm text-gray-900 dark:text-white">
                  {chat.ai.advice || chat.ai.message}
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
            {aiResponse.advice || aiResponse.message}
          </div>
          
          {aiResponse.blockchain_integration && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
