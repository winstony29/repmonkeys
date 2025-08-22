import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

class GenerateNonceDto {
  walletAddress: string;
}

class VerifySignatureDto {
  walletAddress: string;
  signature: string;
  nonce: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}
  
  @Post('nonce')
  async generateNonce(@Body() generateNonceDto: GenerateNonceDto) {
    this.logger.log(`Generating nonce for wallet: ${generateNonceDto.walletAddress}`);
    
    try {
      const nonce = await this.authService.generateNonce(generateNonceDto.walletAddress);
      
      return {
        success: true,
        data: { nonce },
        message: 'Nonce generated successfully'
      };
    } catch (error) {
      this.logger.error(`Error generating nonce: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  @Post('verify')
  async verifySignature(@Body() verifySignatureDto: VerifySignatureDto) {
    this.logger.log(`Verifying signature for wallet: ${verifySignatureDto.walletAddress}`);
    
    try {
      const result = await this.authService.verifySignature(
        verifySignatureDto.walletAddress,
        verifySignatureDto.signature,
        verifySignatureDto.nonce
      );
      
      return {
        success: result.success,
        data: result,
        message: result.message
      };
    } catch (error) {
      this.logger.error(`Error verifying signature: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  @Get('status/:walletAddress')
  async getAuthStatus(@Param('walletAddress') walletAddress: string) {
    this.logger.log(`Checking auth status for wallet: ${walletAddress}`);
    
    try {
      const isAuthenticated = await this.authService.isAuthenticated(walletAddress);
      const session = await this.authService.getSession(walletAddress);
      
      return {
        success: true,
        data: {
          isAuthenticated,
          session: session ? {
            id: session.id,
            expiresAt: session.expiresAt
          } : null
        }
      };
    } catch (error) {
      this.logger.error(`Error checking auth status: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  @Post('logout/:walletAddress')
  async logout(@Param('walletAddress') walletAddress: string) {
    this.logger.log(`Logging out user: ${walletAddress}`);
    
    try {
      const success = await this.authService.logout(walletAddress);
      
      return {
        success,
        message: success ? 'Logged out successfully' : 'User not found'
      };
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

