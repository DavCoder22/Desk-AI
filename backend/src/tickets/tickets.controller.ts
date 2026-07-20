import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UserActionDto } from './dto/user-action.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.createWithAIClassification(dto);
  }

  @Get()
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.ticketsService.findAll(limit, sortBy);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id || id.length < 5) {
      throw new BadRequestException('ID de ticket no válido');
    }
    return this.ticketsService.findOne(id);
  }

  @Patch(':id/estado')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ticketsService.updateStatus(id, dto);
  }

  @Patch(':id/accion-usuario')
  userAction(@Param('id') id: string, @Body() dto: UserActionDto) {
    return this.ticketsService.userAction(id, dto.accion);
  }
}
