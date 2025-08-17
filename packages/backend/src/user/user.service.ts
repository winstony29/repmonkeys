import { Injectable, Logger } from '@nestjs/common';

interface User {
  id: string;
  walletAddress: string;
  goals: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  
  // Mock in-memory storage (in production, this would be a database)
  private users: Map<string, User> = new Map();
  
  /**
   * Create a new user profile
   * @param walletAddress User's wallet address
   * @param goals User's wellness goals
   * @returns Created user profile
   */
  async createUser(walletAddress: string, goals: string[]): Promise<User> {
    this.logger.log(`Creating user profile for wallet: ${walletAddress}`);
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user: User = {
      id: userId,
      walletAddress,
      goals,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(walletAddress, user);
    this.logger.log(`User profile created with ID: ${userId}`);
    
    return user;
  }
  
  /**
   * Get user by wallet address
   * @param walletAddress User's wallet address
   * @returns User profile or null if not found
   */
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    this.logger.log(`Looking up user with wallet: ${walletAddress}`);
    
    const user = this.users.get(walletAddress);
    if (!user) {
      this.logger.log(`User not found for wallet: ${walletAddress}`);
      return null;
    }
    
    return user;
  }
  
  /**
   * Update user goals
   * @param walletAddress User's wallet address
   * @param goals New wellness goals
   * @returns Updated user profile
   */
  async updateUserGoals(walletAddress: string, goals: string[]): Promise<User> {
    this.logger.log(`Updating goals for user: ${walletAddress}`);
    
    const user = await this.getUserByWallet(walletAddress);
    if (!user) {
      throw new Error(`User not found: ${walletAddress}`);
    }
    
    user.goals = goals;
    user.updatedAt = new Date();
    
    this.users.set(walletAddress, user);
    this.logger.log(`Goals updated for user: ${walletAddress}`);
    
    return user;
  }
  
  /**
   * Get all users (for admin purposes)
   * @returns Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    this.logger.log('Retrieving all users');
    return Array.from(this.users.values());
  }
  
  /**
   * Delete user profile
   * @param walletAddress User's wallet address
   * @returns Success status
   */
  async deleteUser(walletAddress: string): Promise<boolean> {
    this.logger.log(`Deleting user profile: ${walletAddress}`);
    
    const deleted = this.users.delete(walletAddress);
    if (deleted) {
      this.logger.log(`User profile deleted: ${walletAddress}`);
    } else {
      this.logger.log(`User profile not found for deletion: ${walletAddress}`);
    }
    
    return deleted;
  }
}

