import { Controller, Get, Post, Patch, Param, Body, Query, BadRequestException, Logger } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UserActionDto } from './dto/user-action.dto';

@Controller('tickets')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name);

  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() dto: CreateTicketDto) {
    this.logger.log(`POST /api/tickets body=${JSON.stringify(dto)}`);
    try {
      return await this.ticketsService.createWithAIClassification(dto);
    } catch (err: any) {
      this.logger.error(`POST /api/tickets error: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    this.logger.log(`GET /api/tickets queries: limit=${limit} sortBy=${sortBy}`);
    try {
      const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : undefined;
      return await this.ticketsService.findAll(parsedLimit, sortBy);
    } catch (err: any) {
      this.logger.error(`GET /api/tickets error: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Get('test/simple')
  testSimple() {
    return { ok: true, message: 'El backend responde correctamente' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id || id.length < 5) {
      throw new BadRequestException('ID de ticket no válido');
    }
    try {
      return await this.ticketsService.findOne(id);
    } catch (err: any) {
      this.logger.error(`GET /api/tickets/${id} error: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Patch(':id/estado')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    try {
      return await this.ticketsService.updateStatus(id, dto);
    } catch (err: any) {
      this.logger.error(`PATCH estado error: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Patch(':id/accion-usuario')
  async userAction(@Param('id') id: string, @Body() dto: UserActionDto) {
    try {
      return await this.ticketsService.userAction(id, dto.accion);
    } catch (err: any) {
      this.logger.error(`PATCH accion-usuario error: ${err.message}`, err.stack);
      throw err;
    }
  }
}
