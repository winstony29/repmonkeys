import { Controller, Post, Get, Put, Delete, Body, Param, Logger } from '@nestjs/common';
import { UserService } from './user.service';

class CreateUserDto {
  walletAddress: string;
  goals: string[];
}

class UpdateGoalsDto {
  goals: string[];
}

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  
  constructor(private readonly userService: UserService) {}
  
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Creating user profile for wallet: ${createUserDto.walletAddress}`);
    
    try {
      const user = await this.userService.createUser(
        createUserDto.walletAddress,
        createUserDto.goals
      );
      
      return {
        success: true,
        data: user,
        message: 'User profile created successfully'
      };
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  @Get(':walletAddress')
  async getUserByWallet(@Param('walletAddress') walletAddress: string) {
    this.logger.log(`Getting user profile for wallet: ${walletAddress}`);
    
    try {
      const user = await this.userService.getUserByWallet(walletAddress);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      this.logger.error(`Error getting user: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  @Put(':walletAddress/goals')
  async updateUserGoals(
    @Param('walletAddress') walletAddress: string,
    @Body() updateGoalsDto: UpdateGoalsDto
  ) {
    this.logger.log(`Updating goals for user: ${walletAddress}`);
    
    try {
      const user = await this.userService.updateUserGoals(
        walletAddress,
        updateGoalsDto.goals
      );
      
      return {
        success: true,
        data: user,
        message: 'User goals updated successfully'
      };
    } catch (error) {
      this.logger.error(`Error updating user goals: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  @Get()
  async getAllUsers() {
    this.logger.log('Getting all users');
    
    try {
      const users = await this.userService.getAllUsers();
      
      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      this.logger.error(`Error getting all users: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  @Delete(':walletAddress')
  async deleteUser(@Param('walletAddress') walletAddress: string) {
    this.logger.log(`Deleting user profile: ${walletAddress}`);
    
    try {
      const deleted = await this.userService.deleteUser(walletAddress);
      
      if (deleted) {
        return {
          success: true,
          message: 'User profile deleted successfully'
        };
      } else {
        return {
          success: false,
          error: 'User not found'
        };
      }
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

