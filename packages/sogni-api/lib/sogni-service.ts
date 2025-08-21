import { SogniClient } from '@sogni-ai/sogni-client';

export interface SogniConfig {
  appId: string;
  username: string;
  password: string;
  network?: 'fast' | 'relaxed';
}

export interface GenerateImageParams {
  positivePrompt: string;
  negativePrompt?: string;
  stylePrompt?: string;
  numberOfImages?: number;
  steps?: number;
  guidance?: number;
  sizePreset?: string;
  width?: number;
  height?: number;
  seed?: number;
  tokenType?: 'sogni' | 'spark'; // Default: 'spark' - Spark tokens are used for image generation
  scheduler?: string;
  timeStepSpacing?: string;
  startingImage?: Buffer | Blob | File;
  startingImageStrength?: number;
  controlNet?: {
    name: string;
    image?: Buffer | Blob | File;
    strength?: number;
    mode?: 'balanced' | 'prompt_priority' | 'cn_priority';
    guidanceStart?: number;
    guidanceEnd?: number;
  };
}

export interface GenerateImageResponse {
  imageUrls: string[];
  projectId: string;
  success: boolean;
  error?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  workerCount: number;
  category?: string;
  description?: string;
}

export interface SizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  ratio: string;
  aspect: string;
}

export class SogniService {
  private client: SogniClient | null = null;
  private config: SogniConfig;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: SogniConfig) {
    this.config = {
      network: 'fast',
      ...config
    };
  }

  /**
   * Initialize the Sogni client with authentication and model loading
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized && this.client) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    await this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🚀 Initializing Sogni client...');
      
      // Create client instance
      this.client = await SogniClient.createInstance({
        appId: this.config.appId,
        network: this.config.network!,
      });

      console.log('🔐 Authenticating with Sogni...');
      
      // Login to account
      await this.client.account.login(
        this.config.username,
        this.config.password
      );

      console.log('⏳ Loading available models...');
      
      // Wait for models to be available
      await this.client.projects.waitForModels();

      this.isInitialized = true;
      console.log('✅ Sogni client initialized successfully');
      
    } catch (error) {
      this.isInitialized = false;
      this.client = null;
      this.initPromise = null;
      console.error('❌ Failed to initialize Sogni client:', error);
      throw error;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<ModelInfo[]> {
    await this.initialize();
    
    if (!this.client) {
      throw new Error('Sogni client not initialized');
    }

    return this.client.projects.availableModels.map(model => ({
      id: model.id,
      name: model.name || model.id,
      workerCount: model.workerCount || 0,
      category: model.category,
      description: model.description,
    }));
  }

  /**
   * Get the most popular model (highest worker count)
   */
  async getMostPopularModel(): Promise<ModelInfo> {
    const models = await this.getAvailableModels();
    
    if (models.length === 0) {
      throw new Error('No models available');
    }

    return models.reduce((a, b) => 
      a.workerCount > b.workerCount ? a : b
    );
  }

  /**
   * Get available size presets for a specific model
   */
  async getSizePresets(modelId: string): Promise<SizePreset[]> {
    await this.initialize();
    
    if (!this.client) {
      throw new Error('Sogni client not initialized');
    }

    try {
      const presets = await this.client.projects.getSizePresets(
        this.config.network!,
        modelId
      );
      return presets;
    } catch (error) {
      console.warn('Failed to get size presets, returning defaults:', error);
      // Return default presets if API call fails
      return [
        {
          id: 'square',
          label: 'Square',
          width: 512,
          height: 512,
          ratio: '1:1',
          aspect: '1'
        },
        {
          id: 'square_hd',
          label: 'Square HD',
          width: 1024,
          height: 1024,
          ratio: '1:1',
          aspect: '1'
        }
      ];
    }
  }

  /**
   * Generate images using Sogni AI
   */
  async generateImage(params: GenerateImageParams): Promise<GenerateImageResponse> {
    try {
      await this.initialize();
      
      if (!this.client) {
        throw new Error('Sogni client not initialized');
      }

      const models = await this.getAvailableModels();
      if (models.length === 0) {
        throw new Error('No models available');
      }

      // Use the most popular model by default
      const model = models.reduce((a, b) => 
        a.workerCount > b.workerCount ? a : b
      );

      console.log('🎯 Using model:', model.id);
      console.log('📝 Generating with prompt:', params.positivePrompt);

      // Create project with parameters
      const project = await this.client.projects.create({
        network: this.config.network!,
        modelId: model.id,
        positivePrompt: params.positivePrompt,
        negativePrompt: params.negativePrompt || '',
        stylePrompt: params.stylePrompt || '',
        numberOfImages: params.numberOfImages || 1,
        steps: params.steps || 20,
        guidance: params.guidance || 7.5,
        sizePreset: params.sizePreset || 'square_hd',
        width: params.width,
        height: params.height,
        seed: params.seed,
        tokenType: params.tokenType || 'spark',
        scheduler: params.scheduler,
        timeStepSpacing: params.timeStepSpacing,
        startingImage: params.startingImage,
        startingImageStrength: params.startingImageStrength,
        controlNet: params.controlNet,
      });

      console.log('⏳ Waiting for image generation...');

      // Wait for completion
      const imageUrls = await project.waitForCompletion();

      console.log('✅ Image generation completed:', imageUrls);

      return {
        imageUrls,
        projectId: project.id,
        success: true,
      };

    } catch (error: any) {
      console.error('❌ Image generation failed:', error);
      return {
        imageUrls: [],
        projectId: '',
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate image with progress tracking
   */
  async generateImageWithProgress(
    params: GenerateImageParams,
    onProgress?: (progress: number) => void,
    onJobCompleted?: (jobId: string, imageUrl: string) => void
  ): Promise<GenerateImageResponse> {
    try {
      await this.initialize();
      
      if (!this.client) {
        throw new Error('Sogni client not initialized');
      }

      const models = await this.getAvailableModels();
      if (models.length === 0) {
        throw new Error('No models available');
      }

      const model = models.reduce((a, b) => 
        a.workerCount > b.workerCount ? a : b
      );

      console.log('🎯 Using model:', model.id);

      const project = await this.client.projects.create({
        network: this.config.network!,
        modelId: model.id,
        positivePrompt: params.positivePrompt,
        negativePrompt: params.negativePrompt || '',
        stylePrompt: params.stylePrompt || '',
        numberOfImages: params.numberOfImages || 1,
        steps: params.steps || 20,
        guidance: params.guidance || 7.5,
        sizePreset: params.sizePreset || 'square_hd',
        width: params.width,
        height: params.height,
        seed: params.seed,
        tokenType: params.tokenType || 'spark',
        scheduler: params.scheduler,
        timeStepSpacing: params.timeStepSpacing,
        startingImage: params.startingImage,
        startingImageStrength: params.startingImageStrength,
        controlNet: params.controlNet,
      });

      // Set up event listeners
      if (onProgress) {
        project.on('progress', onProgress);
      }

      if (onJobCompleted) {
        project.on('jobCompleted', (job: any) => {
          onJobCompleted(job.id, job.resultUrl);
        });
      }

      project.on('jobFailed', (job: any) => {
        console.error('Job failed:', job.id, job.error);
      });

      // Wait for completion
      const imageUrls = await project.waitForCompletion();

      return {
        imageUrls,
        projectId: project.id,
        success: true,
      };

    } catch (error: any) {
      console.error('❌ Image generation failed:', error);
      return {
        imageUrls: [],
        projectId: '',
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<{ sogni: number; spark: number } | null> {
    try {
      await this.initialize();
      
      if (!this.client) {
        throw new Error('Sogni client not initialized');
      }

      // Access balance information if available
      const balance = (this.client.account as any).balance;
      return balance || null;
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return null;
    }
  }

  /**
   * Disconnect the client
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch (error) {
        console.error('Error disconnecting Sogni client:', error);
      }
      this.client = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
}

// Utility function to create a Sogni service instance
export function createSogniService(): SogniService {
  const config: SogniConfig = {
    appId: process.env.SOGNI_APP_ID!,
    username: process.env.SOGNI_USERNAME || process.env.SOGNI_USER!,
    password: process.env.SOGNI_PASSWORD || process.env.SOGNI_PASS!,
    network: (process.env.SOGNI_NETWORK as 'fast' | 'relaxed') || 'fast',
  };

  if (!config.appId || !config.username || !config.password) {
    throw new Error('Missing Sogni configuration. Please set SOGNI_APP_ID, SOGNI_USERNAME, and SOGNI_PASSWORD environment variables.');
  }

  return new SogniService(config);
}
