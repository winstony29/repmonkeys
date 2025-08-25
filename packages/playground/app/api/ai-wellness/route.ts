import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, userGoals, userProfile, walletAddress, chainId } = await request.json();

    // Path to the Python script - need to go up from packages/playground to project root
    const pythonScriptPath = path.join(process.cwd(), '..', '..', 'repmonkeys-acp-python-sdk', 'ai_wellness_api.py');
    
    console.log('🔍 AI Wellness API - Script path:', pythonScriptPath);
    console.log('🔍 AI Wellness API - Request data:', { userMessage, userGoals, userProfile, walletAddress, chainId });
    
    // Check if Python script exists
    const fs = require('fs');
    if (!fs.existsSync(pythonScriptPath)) {
      console.error('❌ Python script not found at:', pythonScriptPath);
      throw new Error(`Python script not found at ${pythonScriptPath}`);
    }
    
    // Prepare the data to send to Python with blockchain context
    const requestData = {
      user_message: userMessage,
      user_goals: userGoals || [],
      user_profile: userProfile || {},
      wallet_address: walletAddress || null,
      chain_id: chainId || 8453, // Default to Base mainnet
      timestamp: new Date().toISOString(),
      blockchain_context: {
        network: 'base-mainnet',
        contracts: {
          wellness_tracker: process.env.NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS,
          well_token: process.env.NEXT_PUBLIC_WELL_TOKEN_ADDRESS,
          wellness_nft: process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS,
          user_profile: process.env.NEXT_PUBLIC_USER_PROFILE_ADDRESS,
          rewards: process.env.NEXT_PUBLIC_REWARDS_ADDRESS
        }
      }
    };

    console.log('🔍 AI Wellness API - Calling Python script with enhanced data:', requestData);

    // Call the Python script
    const result = await callPythonScript(pythonScriptPath, requestData);
    
    console.log('✅ AI Wellness API - Python script returned:', result);
    
    // Enhance response with blockchain integration suggestions
    const enhancedResult = {
      ...result,
      blockchain_integration: {
        suggested_actions: generateBlockchainActions(result, userMessage),
        wellness_score_impact: calculateWellnessScoreImpact(result),
        token_rewards: estimateTokenRewards(result)
      },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      response: enhancedResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Wellness API Error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Try to get userMessage for fallback
    let userMessage = 'general wellness advice';
    try {
      const body = await request.json();
      userMessage = body.userMessage || 'general wellness advice';
    } catch (parseError) {
      console.error('Failed to parse request body for fallback:', parseError);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get AI wellness advice',
        fallback_response: generateFallbackResponse(userMessage)
      },
      { status: 500 }
    );
  }
}

async function callPythonScript(scriptPath: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, JSON.stringify(data)]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Clean the output - remove any warning messages and find the JSON
          const cleanOutput = output.trim();
          console.log('🔍 Raw Python output:', cleanOutput);
          
          // Try to find JSON in the output (in case there are warning messages)
          const jsonMatch = cleanOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonString = jsonMatch[0];
            const result = JSON.parse(jsonString);
            resolve(result);
          } else {
            console.error('No JSON found in Python output');
            reject(new Error('No JSON response from Python script'));
          }
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError);
          console.error('Raw output was:', output);
          reject(new Error('Invalid response from Python script'));
        }
      } else {
        console.error('Python script failed with code:', code);
        console.error('Error output:', errorOutput);
        reject(new Error(`Python script failed with code ${code}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(error);
    });

    // Set a timeout
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python script timeout'));
    }, 30000); // 30 second timeout
  });
}

function generateBlockchainActions(aiResponse: any, userMessage: string): any[] {
  const actions = [];
  const lowerMessage = userMessage.toLowerCase();
  
  // Suggest blockchain actions based on AI response and user message
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    actions.push({
      type: 'log_workout',
      description: 'Log this workout to earn $WELL tokens',
      contract_function: 'logWorkout',
      estimated_rewards: '5-10 $WELL tokens'
    });
  }
  
  if (lowerMessage.includes('meal') || lowerMessage.includes('nutrition')) {
    actions.push({
      type: 'log_meal',
      description: 'Track your nutrition for wellness score',
      contract_function: 'logMeal',
      estimated_rewards: '2-5 $WELL tokens'
    });
  }
  
  if (lowerMessage.includes('meditation') || lowerMessage.includes('sleep')) {
    actions.push({
      type: 'log_wellness_activity',
      description: 'Record your wellness activity',
      contract_function: 'logWellnessActivity',
      estimated_rewards: '3-7 $WELL tokens'
    });
  }
  
  return actions;
}

function calculateWellnessScoreImpact(aiResponse: any): number {
  // Calculate potential wellness score impact based on AI response
  let impact = 0;
  
  if (aiResponse.type === 'workout') {
    impact = 15; // Workouts have high impact
  } else if (aiResponse.type === 'recipe') {
    impact = 8; // Nutrition has medium-high impact
  } else if (aiResponse.type === 'general') {
    impact = 5; // General advice has medium impact
  }
  
  return impact;
}

function estimateTokenRewards(aiResponse: any): string {
  // Estimate $WELL token rewards based on AI response
  let tokens = 0;
  
  if (aiResponse.type === 'workout') {
    tokens = 8; // Workouts earn more tokens
  } else if (aiResponse.type === 'recipe') {
    tokens = 5; // Nutrition earns medium tokens
  } else if (aiResponse.type === 'general') {
    tokens = 3; // General advice earns fewer tokens
  }
  
  return `${tokens} $WELL tokens`;
}

function generateFallbackResponse(userMessage: string): string {
  const lowerPrompt = userMessage.toLowerCase();
  
  if (lowerPrompt.includes('workout') || lowerPrompt.includes('exercise') || lowerPrompt.includes('gym')) {
    return "💪 Based on your workout goals, I recommend a balanced approach:\n\n🏃‍♂️ **Cardio**: 3-4 sessions per week, 30-45 minutes\n🏋️‍♂️ **Strength Training**: 3 sessions per week, focusing on compound movements\n🧘‍♀️ **Recovery**: Include stretching and rest days\n\nStart with 3 days per week and gradually increase intensity. Remember, consistency beats perfection!";
  }
  
  if (lowerPrompt.includes('diet') || lowerPrompt.includes('nutrition') || lowerPrompt.includes('food')) {
    return "🥗 Here's your personalized nutrition plan:\n\n🍳 **Breakfast**: Protein + complex carbs (eggs + oatmeal)\n🥙 **Lunch**: Lean protein + vegetables + healthy fats\n🍽️ **Dinner**: Light protein + vegetables\n🍎 **Snacks**: Nuts, fruits, or Greek yogurt\n\nAim for 3 meals + 2 snacks daily. Stay hydrated with 8+ glasses of water!";
  }
  
  if (lowerPrompt.includes('sleep') || lowerPrompt.includes('rest') || lowerPrompt.includes('bedtime')) {
    return "😴 Sleep optimization strategy:\n\n⏰ **Bedtime**: Aim for 7-9 hours, go to bed at the same time daily\n🌙 **Environment**: Dark, cool (65-68°F), quiet room\n📱 **Habits**: No screens 1 hour before bed, read or meditate instead\n☕ **Avoid**: Caffeine after 2 PM, heavy meals before bed\n\nQuality sleep is your foundation for wellness!";
  }
  
  if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety') || lowerPrompt.includes('mental')) {
    return "🧘‍♀️ Mental wellness approach:\n\n💆‍♂️ **Daily Practice**: 10-15 minutes meditation or deep breathing\n🏃‍♀️ **Physical Activity**: Exercise releases endorphins\n📝 **Journaling**: Write down thoughts and gratitude\n🎯 **Mindfulness**: Stay present, one task at a time\n\nRemember, mental health is just as important as physical health!";
  }
  
  // Default response
  return "🌟 Here's your comprehensive wellness advice:\n\n🎯 **Set Clear Goals**: Define what wellness means to you\n📊 **Track Progress**: Monitor your habits and improvements\n🔄 **Stay Consistent**: Small daily actions create lasting change\n🎉 **Celebrate Wins**: Acknowledge your progress, no matter how small\n\nYou're on the right path! Keep going! 💪";
}
