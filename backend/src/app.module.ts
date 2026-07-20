import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TicketsModule } from './tickets/tickets.module';
import { AIModule } from './ai/ai.module';
import { FeedbackModule } from './feedback/feedback.module';
import { SeedModule } from './seed/seed.module';
import { MetricsModule } from './metrics/metrics.module';
import { FacultadesModule } from './facultades/facultades.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TicketsModule,
    AIModule,
    FeedbackModule,
    SeedModule,
    MetricsModule,
    FacultadesModule,
    HealthModule,
  ],
})
export class AppModule {}
