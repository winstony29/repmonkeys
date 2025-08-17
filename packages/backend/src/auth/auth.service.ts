import { Injectable, Logger } from '@nestjs/common';

interface AuthSession {
  id: string;
  walletAddress: string;
  nonce: string;
  expiresAt: Date;
  isAuthenticated: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  // Mock in-memory session storage (in production, this would be Redis or database)
  private sessions: Map<string, AuthSession> = new Map();
  
  /**
   * Generate a nonce for wallet authentication
   * @param walletAddress User's wallet address
   * @returns Generated nonce
   */
  async generateNonce(walletAddress: string): Promise<string> {
    this.logger.log(`Generating nonce for wallet: ${walletAddress}`);
    
    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Create or update session
    const session: AuthSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletAddress,
      nonce,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      isAuthenticated: false,
    };
    
    this.sessions.set(walletAddress, session);
    this.logger.log(`Nonce generated for ${walletAddress}: ${nonce}`);
    
    return nonce;
  }
  
  /**
   * Verify wallet signature and authenticate user
   * @param walletAddress User's wallet address
   * @param signature Signature from wallet
   * @param nonce Nonce used for signing
   * @returns Authentication result
   */
  async verifySignature(
    walletAddress: string,
    signature: string,
    nonce: string
  ): Promise<{ success: boolean; message: string; sessionId?: string }> {
    this.logger.log(`Verifying signature for wallet: ${walletAddress}`);
    
    const session = this.sessions.get(walletAddress);
    
    if (!session) {
      return {
        success: false,
        message: 'No active session found'
      };
    }
    
    if (session.expiresAt < new Date()) {
      this.sessions.delete(walletAddress);
      return {
        success: false,
        message: 'Session expired'
      };
    }
    
    if (session.nonce !== nonce) {
      return {
        success: false,
        message: 'Invalid nonce'
      };
    }
    
    // Mock signature verification (in production, this would verify the actual signature)
    // For now, we'll accept any signature as valid
    if (signature && signature.length > 0) {
      session.isAuthenticated = true;
      session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extend to 24 hours
      
      this.sessions.set(walletAddress, session);
      
      this.logger.log(`User authenticated successfully: ${walletAddress}`);
      
      return {
        success: true,
        message: 'Authentication successful',
        sessionId: session.id
      };
    }
    
    return {
      success: false,
      message: 'Invalid signature'
    };
  }
  
  /**
   * Check if a user is authenticated
   * @param walletAddress User's wallet address
   * @returns Authentication status
   */
  async isAuthenticated(walletAddress: string): Promise<boolean> {
    const session = this.sessions.get(walletAddress);
    
    if (!session) {
      return false;
    }
    
    if (session.expiresAt < new Date()) {
      this.sessions.delete(walletAddress);
      return false;
    }
    
    return session.isAuthenticated;
  }
  
  /**
   * Invalidate user session (logout)
   * @param walletAddress User's wallet address
   * @returns Success status
   */
  async logout(walletAddress: string): Promise<boolean> {
    this.logger.log(`Logging out user: ${walletAddress}`);
    
    const deleted = this.sessions.delete(walletAddress);
    
    if (deleted) {
      this.logger.log(`User logged out successfully: ${walletAddress}`);
    }
    
    return deleted;
  }
  
  /**
   * Get active session for a wallet
   * @param walletAddress User's wallet address
   * @returns Session or null if not found
   */
  async getSession(walletAddress: string): Promise<AuthSession | null> {
    const session = this.sessions.get(walletAddress);
    
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        this.sessions.delete(walletAddress);
      }
      return null;
    }
    
    return session;
  }
}

