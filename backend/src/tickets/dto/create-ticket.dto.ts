import { IsString, IsNotEmpty, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';
import { Category, TipoUsuario } from '../enums';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
  description: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(Category), { message: 'Categoría no válida' })
  category?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La subcategoría no puede estar vacía' })
  subcategoria?: string;

  @IsOptional()
  @IsString()
  @IsIn(['INCIDENTE', 'SOLICITUD_SERVICIO'], { message: 'Tipo de solicitud no válido' })
  tipo_solicitud?: string;

  @IsOptional()
  @IsString()
  @IsIn([TipoUsuario.ESTUDIANTE, TipoUsuario.DOCENTE, TipoUsuario.ADMINISTRATIVO], { message: 'Tipo de usuario no válido' })
  tipo_usuario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Facultad/área no puede exceder 100 caracteres' })
  facultad_o_area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Carrera no puede exceder 100 caracteres' })
  carrera?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del solicitante es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  requester: string;
}
