import { Module } from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { WellnessController } from './wellness.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [WellnessService],
  controllers: [WellnessController],
  exports: [WellnessService],
})
export class WellnessModule {}


