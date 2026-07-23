import { Controller, Get, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let db = 'ok';
    let count = 0;
    try {
      count = await this.prisma.ticket.count();
    } catch (err: any) {
      this.logger.error(`DB health check failed: ${err.message}`);
      db = 'error: ' + err.message;
    }

    return {
      status: 'ok',
      database: db,
      tickets_count: count,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage().rss,
    };
  }
}
