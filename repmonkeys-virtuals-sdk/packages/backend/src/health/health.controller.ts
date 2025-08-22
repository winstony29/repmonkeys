import { Controller, Get, Logger } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  getHealth() {
    this.logger.log('🏥 Health check endpoint called');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'wellness-backend',
      version: '1.0.0',
    };
  }

  @Get('detailed')
  getDetailedHealth() {
    this.logger.log('🔍 Detailed health check endpoint called');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'wellness-backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
