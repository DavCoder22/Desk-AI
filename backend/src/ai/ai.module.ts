import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AiApiClient } from './ai-api-client';
import { AIController } from './ai.controller';

@Module({
  controllers: [AIController],
  providers: [AIService, AiApiClient],
  exports: [AIService],
})
export class AIModule {}
