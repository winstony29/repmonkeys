// Sogni API integration for wellness NFT generation

export interface SogniGenerateRequest {
  prompt: string;
}

export interface SogniGenerateResponse {
  imageUrls: string[];
  error?: string;
}

class SogniService {
  private baseUrl: string;

  constructor() {
    // Use Sogni API service URL - adjust based on your deployment
    this.baseUrl = process.env.NEXT_PUBLIC_SOGNI_API_URL || 'http://localhost:3001';
    console.log('SogniService initialized with baseUrl:', this.baseUrl);
  }

  async generateWellnessImage(prompt: string): Promise<string> {
    try {
      console.log('Generating image with prompt:', prompt);
      console.log('Making request to:', `${this.baseUrl}/api/generate`);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: SogniGenerateResponse = await response.json();
      console.log('Response data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.imageUrls || data.imageUrls.length === 0) {
        throw new Error('No images generated');
      }

      console.log('Successfully generated image:', data.imageUrls[0]);
      return data.imageUrls[0];
    } catch (error) {
      console.error('Sogni API error:', error);
      throw error;
    }
  }

  // Generate prompt based on user selections and goals
  buildWellnessPrompt(
    theme: string, 
    customPrompt: string, 
    userGoals: string[] = []
  ): string {
    let basePrompt = '';

    // Build prompt based on theme selection
    switch (theme) {
      case 'meditation':
        basePrompt = 'A serene meditation scene with a person in peaceful contemplation, soft lighting, zen garden, ultra realistic, calming atmosphere';
        break;
      case 'fitness':
        basePrompt = 'A person exercising in a modern gym, dynamic movement, motivational lighting, ultra realistic, energetic atmosphere';
        break;
      case 'nutrition':
        basePrompt = 'A vibrant healthy meal with fresh organic vegetables and fruits, clean eating concept, ultra realistic, appetizing';
        break;
      case 'nature':
        basePrompt = 'A person connecting with nature, forest setting, natural lighting, peaceful atmosphere, ultra realistic';
        break;
      case 'yoga':
        basePrompt = 'A person practicing yoga in a beautiful studio, sunrise lighting, peaceful pose, ultra realistic, zen atmosphere';
        break;
      case 'running':
        basePrompt = 'A person running on a scenic trail, dynamic motion, golden hour lighting, ultra realistic, motivational';
        break;
      case 'custom':
        basePrompt = customPrompt;
        break;
      default:
        basePrompt = 'A person living a healthy wellness lifestyle, ultra realistic, positive energy';
    }

    // Enhance prompt with user goals if available
    if (userGoals.length > 0) {
      const goalContext = userGoals.join(', ');
      basePrompt += `, incorporating elements of ${goalContext}`;
    }

    // Add style modifiers for NFT-quality artwork
    basePrompt += ', digital art, high quality, vibrant colors, portrait orientation, NFT artwork style';

    return basePrompt;
  }
}

export const sogniService = new SogniService();

// React hook for using Sogni service
export function useSogniGeneration() {
  return {
    async generateImage(
      theme: string, 
      customPrompt: string, 
      userGoals: string[] = []
    ): Promise<string> {
      const prompt = sogniService.buildWellnessPrompt(theme, customPrompt, userGoals);
      return await sogniService.generateWellnessImage(prompt);
    }
  };
}
