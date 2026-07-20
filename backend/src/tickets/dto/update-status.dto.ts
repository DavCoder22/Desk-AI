import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { TicketStatus } from '../enums';

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([TicketStatus.EN_PROGRESO, TicketStatus.RESUELTO, TicketStatus.CERRADO])
  status: string;
}
