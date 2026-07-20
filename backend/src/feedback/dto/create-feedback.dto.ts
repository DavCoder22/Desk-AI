import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @IsBoolean()
  clasificacion_correcta: boolean;

  @IsBoolean()
  sugerencia_util: boolean;

  @IsString()
  @IsOptional()
  comentarios?: string;
}
