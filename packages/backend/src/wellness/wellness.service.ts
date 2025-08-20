import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class WellnessService {
  private readonly logger = new Logger(WellnessService.name);

  constructor(private readonly blockchainService: BlockchainService) {}

  async logActivity(
    walletAddress: string,
    sleepDuration: number,
    sleepQuality: number,
    fitnessActivityType: string,
    fitnessDuration: number,
  ) {
    this.logger.log(`Logging activity for ${walletAddress}`);
    return await this.blockchainService.logWellnessActivity(
      walletAddress,
      sleepDuration,
      sleepQuality,
      fitnessActivityType,
      fitnessDuration,
    );
  }
}