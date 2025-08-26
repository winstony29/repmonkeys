import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, userGoals, userProfile, walletAddress, chainId } = await request.json();

    // Path to the Python script
    const scriptPath = path.resolve(process.cwd(), '..', '..', 'repmonkeys-acp-python-sdk', 'test_acp_agent_coordination.py');
    
    console.log('🔍 AI Wellness API - Current working directory:', process.cwd());
    console.log('🔍 AI Wellness API - Script path:', scriptPath);
    console.log('🔍 AI Wellness API - Script exists:', fs.existsSync(scriptPath));
    console.log('🔍 AI Wellness API - Request data:', { userMessage, userGoals, userProfile, walletAddress, chainId });
    
    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      console.error('❌ Python script not found at:', scriptPath);
      throw new Error(`Python script not found at ${scriptPath}`);
    }
    
    // Prepare the data to send to Python - format expected by the script
    const requestData = {
      user_message: userMessage,
      user_goals: userGoals || [],
      user_profile: userProfile || {},
      wallet_address: walletAddress,
      chain_id: chainId,
      timestamp: new Date().toISOString()
    };

    console.log('🔍 AI Wellness API - Calling ACP agent coordination script with data:', requestData);

    // Call the Python script and collect all progress updates
    const result = await callPythonScriptWithProgress(scriptPath, requestData);
    
    console.log('✅ AI Wellness API - ACP agent coordination script returned:', result);
    
    return NextResponse.json({
      success: true,
      response: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI Wellness API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      fallback_response: "🌟 Here's your comprehensive wellness advice:\n\n🎯 **Set Clear Goals**: Define what wellness means to you\n📊 **Track Progress**: Monitor your habits and improvements\n🔄 **Stay Consistent**: Small daily actions create lasting change\n🎉 **Celebrate Wins**: Acknowledge your progress, no matter how small\n\nYou're on the right path! Keep going! 💪"
    }, { status: 500 });
  }
}

async function callPythonScriptWithProgress(scriptPath: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Call the Python script with the full path to the virtual environment's Python
    const pythonPath = path.resolve(process.cwd(), '..', '..', 'repmonkeys-acp-python-sdk', 'venv', 'bin', 'python3.12');
    const args = [scriptPath, '--user-input', JSON.stringify(data)];
    
    console.log('🔍 AI Wellness API - Executing Python script with venv:', pythonPath, args.join(' '));
    
    const pythonProcess = spawn(pythonPath, args, {
      cwd: path.dirname(scriptPath), // Set working directory to script location
      env: { ...process.env, PYTHONPATH: path.dirname(scriptPath) } // Set Python path
    });
    
    let output = '';
    let errorOutput = '';
    let wellnessPlan: any = null;
    const progressUpdates: any[] = [];

    pythonProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter((line: string) => line.trim());
      
      lines.forEach((line: string) => {
        try {
          const update = JSON.parse(line);
          
          if (update.type === 'wellness_plan') {
            // This is the final wellness plan
            wellnessPlan = update.data;
          } else {
            // This is a progress update
            progressUpdates.push(update);
          }
        } catch (parseError) {
          // If it's not valid JSON, treat it as regular output
          output += line + '\n';
        }
      });
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        if (wellnessPlan) {
          // Add progress updates to the wellness plan
          wellnessPlan.progress_updates = progressUpdates;
          resolve(wellnessPlan);
        } else {
          console.error('No wellness plan found in output');
          reject(new Error('No wellness plan response from Python script'));
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
    }, 60000); // 60 second timeout for progress updates
  });
}
