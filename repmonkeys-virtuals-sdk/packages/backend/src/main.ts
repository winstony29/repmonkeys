import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('🚀 Starting Wellness Backend...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Enable CORS for frontend
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:8081'],
      credentials: true,
    });
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe());
    
    // Global prefix
    app.setGlobalPrefix('api');
    
    const port = process.env.PORT || 3001;
    await app.listen(port);
    
    logger.log(`✅ Wellness Backend successfully started on port ${port}`);
    logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🔗 API Base URL: http://localhost:${port}/api`);
    
  } catch (error) {
    logger.error('❌ Failed to start Wellness Backend:', error.stack);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 Fatal error during bootstrap:', error);
  process.exit(1);
});

