import { Controller, Get } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';

@Controller('dashboard')
export class MetricsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('kpis')
  getKPIs() {
    return this.ticketsService.getKPIs();
  }

  @Get('resolucion')
  getResolucion() {
    return this.ticketsService.getResolucionDetalle();
  }

  @Get('costos')
  getCostos() {
    return this.ticketsService.getCostosDetalle();
  }

  @Get('cobit')
  getCobit() {
    return this.ticketsService.getCobitDss02();
  }
}
