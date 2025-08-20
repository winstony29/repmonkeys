// API client for wellness backend services

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface WellnessUser {
  walletAddress: string
  goals: string[]
  profileData: any
  createdAt: string
  updatedAt: string
}

export interface WellnessResponse {
  type: 'workout' | 'recipe' | 'general'
  data?: any
  message?: string
}

export interface AuthResponse {
  nonce: string
  message: string
}

export interface VerifyResponse {
  success: boolean
  token?: string
  user?: WellnessUser
}

class WellnessAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication
  async getNonce(walletAddress: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    })
  }

  async verifySignature(
    walletAddress: string,
    signature: string,
    nonce: string
  ): Promise<VerifyResponse> {
    return this.request<VerifyResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, nonce }),
    })
  }

  async getAuthStatus(walletAddress: string): Promise<{ isAuthenticated: boolean }> {
    return this.request<{ isAuthenticated: boolean }>(`/auth/status/${walletAddress}`)
  }

  // User Management
  async createUser(userData: Partial<WellnessUser>): Promise<WellnessUser> {
    return this.request<WellnessUser>('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getUser(walletAddress: string): Promise<WellnessUser> {
    return this.request<WellnessUser>(`/user/${walletAddress}`)
  }

  async updateUserGoals(walletAddress: string, goals: string[]): Promise<WellnessUser> {
    return this.request<WellnessUser>(`/user/${walletAddress}/goals`, {
      method: 'PUT',
      body: JSON.stringify({ goals }),
    })
  }

  // Blockchain Operations
  async mintNFT(walletAddress: string, metadataUri: string): Promise<{ transactionHash: string }> {
    return this.request<{ transactionHash: string }>('/blockchain/mint-nft', {
      method: 'POST',
      body: JSON.stringify({ userAddress: walletAddress, metadataUri }),
    })
  }

  async awardTokens(walletAddress: string, amount: string): Promise<{ transactionHash: string }> {
    return this.request<{ transactionHash: string }>('/blockchain/award-tokens', {
      method: 'POST',
      body: JSON.stringify({ userAddress: walletAddress, amount }),
    })
  }

  async getTokenBalance(walletAddress: string): Promise<{ balance: string }> {
    return this.request<{ balance: string }>(`/blockchain/balance/${walletAddress}`)
  }

  // AI Wellness
  async getWellnessAdvice(prompt: string, userContext?: any): Promise<WellnessResponse> {
    return this.request<WellnessResponse>('/ai/wellness-request', {
      method: 'POST',
      body: JSON.stringify({ prompt, userContext }),
    })
  }

  // Sogni AI Image Generation
  async generateWellnessImage(
    prompt: string, 
    options?: {
      negativePrompt?: string;
      stylePrompt?: string;
      steps?: number;
      guidance?: number;
      numberOfImages?: number;
      aspectRatio?: string;
      modelId?: string;
      seed?: number;
    }
  ): Promise<{ 
    imageUrls: string[]; 
    metadata?: any 
  }> {
    const requestBody = {
      prompt,
      negativePrompt: options?.negativePrompt || "blurry, low quality, distorted, ugly, bad anatomy, watermark",
      stylePrompt: options?.stylePrompt || "wellness, peaceful, calming, digital art, high quality, professional, beautiful",
      steps: options?.steps || 30,
      guidance: options?.guidance || 7.5,
      numberOfImages: options?.numberOfImages || 1,
      aspectRatio: options?.aspectRatio || "1:1",
      ...(options?.modelId && { modelId: options.modelId }),
      ...(options?.seed && { seed: options.seed }),
    };

    const response = await fetch('http://localhost:3002/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }

  // Get available Sogni AI models
  async getSogniModels(): Promise<{ 
    models: { 
      recommended: any[]; 
      all: any[] 
    }; 
    totalCount: number 
  }> {
    const response = await fetch('http://localhost:3002/api/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }

  // Health endpoint
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health')
  }
}

export const wellnessAPI = new WellnessAPI()

// React hooks for API calls
export function useWellnessAPI() {
  return {
    async authenticateUser(walletAddress: string, signMessage: (message: string) => Promise<string>) {
      try {
        const { nonce, message } = await wellnessAPI.getNonce(walletAddress)
        const signature = await signMessage(message)
        return await wellnessAPI.verifySignature(walletAddress, signature, nonce)
      } catch (error) {
        console.error('Authentication failed:', error)
        throw error
      }
    },
    
    async createUserProfile(walletAddress: string, goals: string[]) {
      try {
        return await wellnessAPI.createUser({ walletAddress, goals })
      } catch (error) {
        console.error('Failed to create user profile:', error)
        throw error
      }
    },
    
    async getWellnessAdvice(prompt: string) {
      try {
        return await wellnessAPI.getWellnessAdvice(prompt)
      } catch (error) {
        console.error('Failed to get wellness advice:', error)
        throw error
      }
    },

    async generateWellnessImage(prompt: string, options?: any) {
      try {
        return await wellnessAPI.generateWellnessImage(prompt, options)
      } catch (error) {
        console.error('Failed to generate wellness image:', error)
        throw error
      }
    },

    async getSogniModels() {
      try {
        return await wellnessAPI.getSogniModels()
      } catch (error) {
        console.error('Failed to get Sogni models:', error)
        throw error
      }
    }
  }
}
