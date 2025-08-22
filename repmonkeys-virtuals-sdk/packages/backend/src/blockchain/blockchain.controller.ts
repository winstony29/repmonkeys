import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

class MintNftDto {
  userAddress: string;
  metadataUri: string;
}

class AwardTokensDto {
  userAddress: string;
  amount: number;
}

@Controller('blockchain')
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name);
  
  constructor(private readonly blockchainService: BlockchainService) {}
  
  @Post('mint-nft')
  async mintNft(@Body() mintNftDto: MintNftDto) {
    this.logger.log(`Minting NFT for user: ${mintNftDto.userAddress}`);
    return await this.blockchainService.mintNft(
      mintNftDto.userAddress,
      mintNftDto.metadataUri
    );
  }
  
  @Post('award-tokens')
  async awardTokens(@Body() awardTokensDto: AwardTokensDto) {
    this.logger.log(`Awarding ${awardTokensDto.amount} tokens to: ${awardTokensDto.userAddress}`);
    return await this.blockchainService.awardWellTokens(
      awardTokensDto.userAddress,
      awardTokensDto.amount
    );
  }
  
  @Get('balance/:userAddress')
  async getUserBalance(@Param('userAddress') userAddress: string) {
    this.logger.log(`Getting balance for user: ${userAddress}`);
    return await this.blockchainService.getUserWellBalance(userAddress);
  }
  
  @Post('set-contracts')
  async setContractAddresses(
    @Body() body: { nftAddress: string; tokenAddress: string }
  ) {
    this.logger.log('Setting contract addresses');
    this.blockchainService.setContractAddresses(body.nftAddress, body.tokenAddress);
    return { message: 'Contract addresses set successfully' };
  }
}

