import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MinLength(1, { message: 'El mensaje debe tener al menos 1 carácter' })
  @MaxLength(500, { message: 'El mensaje no puede exceder 500 caracteres' })
  message: string;

  @IsOptional()
  @IsString()
  ticketId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El contexto del ticket no puede exceder 500 caracteres' })
  ticketContext?: string;
}
