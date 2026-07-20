import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UserActionDto {
  @IsString()
  @IsNotEmpty({ message: 'La acción es obligatoria' })
  @IsIn(['CERRAR', 'REENVIAR'], { message: 'Acción no válida. Use CERRAR o REENVIAR' })
  accion: string;
}
