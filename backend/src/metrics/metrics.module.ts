import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [TicketsModule],
  controllers: [MetricsController],
})
export class MetricsModule {}
