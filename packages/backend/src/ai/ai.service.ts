import { Injectable, Logger } from '@nestjs/common';

export interface WorkoutPlan {
  type: 'workout';
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    duration?: string;
  }>;
  totalDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Recipe {
  type: 'recipe';
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export type WellnessResponse = WorkoutPlan | Recipe | { type: 'general'; message: string };

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  /**
   * Primary Wellness Agent - Hub that orchestrates requests to specialist agents
   * @param userId User identifier
   * @param prompt User's wellness request
   * @returns Structured wellness response
   */
  async handleUserRequest(userId: string, prompt: string): Promise<WellnessResponse> {
    this.logger.log(`Processing request for user ${userId}: ${prompt}`);
    
    // Intent recognition - determine what type of specialist agent to call
    const intent = this.recognizeIntent(prompt);
    
    // Route to appropriate specialist agent
    switch (intent) {
      case 'workout':
        return await this.getWorkoutSpecialistResponse(prompt);
      case 'recipe':
        return await this.getRecipeSpecialistResponse(prompt);
      case 'meditation':
        return await this.getMeditationSpecialistResponse(prompt);
      case 'sleep':
        return await this.getSleepSpecialistResponse(prompt);
      default:
        return await this.getGeneralWellnessResponse(prompt);
    }
  }
  
  /**
   * Intent recognition - determines what the user is asking for
   * @param prompt User's input
   * @returns Recognized intent
   */
  private recognizeIntent(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('workout') || lowerPrompt.includes('exercise') || lowerPrompt.includes('training')) {
      return 'workout';
    }
    
    if (lowerPrompt.includes('recipe') || lowerPrompt.includes('food') || lowerPrompt.includes('meal') || lowerPrompt.includes('cook')) {
      return 'recipe';
    }
    
    if (lowerPrompt.includes('meditation') || lowerPrompt.includes('mindfulness') || lowerPrompt.includes('breathing')) {
      return 'meditation';
    }
    
    if (lowerPrompt.includes('sleep') || lowerPrompt.includes('rest') || lowerPrompt.includes('bedtime')) {
      return 'sleep';
    }
    
    return 'general';
  }
  
  /**
   * Workout Specialist Agent (A2A)
   * @param prompt User's workout request
   * @returns Structured workout plan
   */
  private async getWorkoutSpecialistResponse(prompt: string): Promise<WorkoutPlan> {
    this.logger.log('Workout specialist agent processing request');
    
    // Mock workout plan generation based on prompt
    const isCardio = prompt.toLowerCase().includes('cardio') || prompt.toLowerCase().includes('running');
    const isStrength = prompt.toLowerCase().includes('strength') || prompt.toLowerCase().includes('weights');
    
    if (isCardio) {
      return {
        type: 'workout',
        exercises: [
          { name: 'Jumping Jacks', sets: 3, reps: 20, duration: '30 seconds' },
          { name: 'High Knees', sets: 3, reps: 15, duration: '30 seconds' },
          { name: 'Burpees', sets: 3, reps: 10, duration: '45 seconds' },
          { name: 'Mountain Climbers', sets: 3, reps: 20, duration: '30 seconds' },
        ],
        totalDuration: '20 minutes',
        difficulty: 'intermediate'
      };
    } else if (isStrength) {
      return {
        type: 'workout',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 15, duration: '2 minutes' },
          { name: 'Squats', sets: 3, reps: 20, duration: '2 minutes' },
          { name: 'Plank', sets: 3, reps: 1, duration: '1 minute' },
          { name: 'Lunges', sets: 3, reps: 12, duration: '3 minutes' },
        ],
        totalDuration: '25 minutes',
        difficulty: 'intermediate'
      };
    } else {
      // Default full-body workout
      return {
        type: 'workout',
        exercises: [
          { name: 'Push-ups', sets: 2, reps: 10, duration: '2 minutes' },
          { name: 'Squats', sets: 2, reps: 15, duration: '2 minutes' },
          { name: 'Plank', sets: 2, reps: 1, duration: '30 seconds' },
          { name: 'Jumping Jacks', sets: 2, reps: 15, duration: '1 minute' },
        ],
        totalDuration: '15 minutes',
        difficulty: 'beginner'
      };
    }
  }
  
  /**
   * Recipe Specialist Agent (A2A)
   * @param prompt User's recipe request
   * @returns Structured recipe
   */
  private async getRecipeSpecialistResponse(prompt: string): Promise<Recipe> {
    this.logger.log('Recipe specialist agent processing request');
    
    // Mock recipe generation based on prompt
    const isHealthy = prompt.toLowerCase().includes('healthy') || prompt.toLowerCase().includes('low-calorie');
    const isQuick = prompt.toLowerCase().includes('quick') || prompt.toLowerCase().includes('fast');
    
    if (isHealthy && isQuick) {
      return {
        type: 'recipe',
        name: 'Quick Healthy Buddha Bowl',
        ingredients: [
          '1 cup quinoa',
          '1 cup chickpeas',
          '1 avocado',
          '1 cup cherry tomatoes',
          '1 cup cucumber',
          '2 tbsp olive oil',
          '1 lemon',
          'Salt and pepper to taste'
        ],
        instructions: [
          'Cook quinoa according to package instructions',
          'Drain and rinse chickpeas',
          'Chop vegetables and avocado',
          'Mix all ingredients in a bowl',
          'Drizzle with olive oil and lemon juice',
          'Season with salt and pepper'
        ],
        prepTime: '10 minutes',
        cookTime: '15 minutes',
        servings: 2,
        nutrition: {
          calories: 450,
          protein: 18,
          carbs: 65,
          fat: 22
        }
      };
    } else {
      return {
        type: 'recipe',
        name: 'Classic Pasta Carbonara',
        ingredients: [
          '8 oz spaghetti',
          '4 slices bacon',
          '2 large eggs',
          '1/2 cup parmesan cheese',
          '2 cloves garlic',
          'Black pepper',
          'Salt'
        ],
        instructions: [
          'Cook pasta according to package instructions',
          'Cook bacon until crispy, then crumble',
          'Beat eggs with parmesan and pepper',
          'Drain pasta, reserving 1 cup of pasta water',
          'Toss hot pasta with egg mixture and bacon',
          'Add pasta water if needed for creaminess'
        ],
        prepTime: '5 minutes',
        cookTime: '20 minutes',
        servings: 2,
        nutrition: {
          calories: 650,
          protein: 28,
          carbs: 75,
          fat: 32
        }
      };
    }
  }
  
  /**
   * Meditation Specialist Agent (A2A)
   * @param prompt User's meditation request
   * @returns Meditation guidance
   */
  private async getMeditationSpecialistResponse(prompt: string): Promise<WellnessResponse> {
    this.logger.log('Meditation specialist agent processing request');
    
    return {
      type: 'general',
      message: 'Here\'s a 5-minute breathing meditation: Sit comfortably, close your eyes, and focus on your breath. Inhale for 4 counts, hold for 4, exhale for 6. Repeat for 5 minutes. This helps reduce stress and improve focus.'
    };
  }
  
  /**
   * Sleep Specialist Agent (A2A)
   * @param prompt User's sleep request
   * @returns Sleep advice
   */
  private async getSleepSpecialistResponse(prompt: string): Promise<WellnessResponse> {
    this.logger.log('Sleep specialist agent processing request');
    
    return {
      type: 'general',
      message: 'For better sleep: Establish a consistent bedtime routine, avoid screens 1 hour before bed, keep your bedroom cool and dark, and try relaxation techniques like deep breathing or progressive muscle relaxation.'
    };
  }
  
  /**
   * General Wellness Agent (fallback)
   * @param prompt User's request
   * @returns General wellness advice
   */
  private async getGeneralWellnessResponse(prompt: string): Promise<WellnessResponse> {
    this.logger.log('General wellness agent processing request');
    
    return {
      type: 'general',
      message: 'I\'m here to help with your wellness journey! I can assist with workout plans, healthy recipes, meditation guidance, and sleep tips. What specific area would you like to focus on today?'
    };
  }
}

