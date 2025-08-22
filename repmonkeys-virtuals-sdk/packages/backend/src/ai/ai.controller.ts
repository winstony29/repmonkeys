import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiService } from './ai.service';

class WellnessRequestDto {
  userId: string;
  prompt: string;
}

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  
  constructor(private readonly aiService: AiService) {}
  
  @Post('wellness-request')
  async handleWellnessRequest(@Body() requestDto: WellnessRequestDto) {
    this.logger.log(`Wellness request from user ${requestDto.userId}: ${requestDto.prompt}`);
    
    try {
      const response = await this.aiService.handleUserRequest(
        requestDto.userId,
        requestDto.prompt
      );
      
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error processing wellness request: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

