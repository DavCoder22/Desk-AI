import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  providers: [SeedService],
})
export class SeedModule {}
