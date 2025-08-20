import { Controller, Post, Body, Logger } from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { IsEthereumAddress, IsIn, IsNumber, IsPositive, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class LogActivityDto {
  @IsEthereumAddress()
  walletAddress: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(24)
  sleepDuration: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  sleepQuality: number;

  @IsString()
  @IsIn(['run', 'walk', 'yoga', 'cycle', 'swim', 'gym'])
  fitnessActivityType: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(300)
  fitnessDuration: number;
}

@Controller('wellness')
export class WellnessController {
  private readonly logger = new Logger(WellnessController.name);

  constructor(private readonly wellnessService: WellnessService) {}

  @Post('log-activity')
  async logActivity(@Body() dto: LogActivityDto) {
    this.logger.log(`Received wellness log for ${dto.walletAddress}`);
    try {
      const result = await this.wellnessService.logActivity(
        dto.walletAddress,
        dto.sleepDuration,
        dto.sleepQuality,
        dto.fitnessActivityType,
        dto.fitnessDuration,
      );
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`Failed to log wellness data: ${error.message}`);
      return { success: false, message: error.message };
    }
  }
}

