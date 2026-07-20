import { Controller, Get, Param } from '@nestjs/common';
import { FACULTADES } from './facultades-data';

@Controller('facultades')
export class FacultadesController {
  @Get()
  findAll() {
    return FACULTADES.map((f) => f.nombre);
  }

  @Get(':facultad/carreras')
  findCarreras(@Param('facultad') facultad: string) {
    const decoded = decodeURIComponent(facultad);
    const facultadData = FACULTADES.find((f) => f.nombre === decoded);
    if (!facultadData) return [];
    return facultadData.carreras.map((c) => c.nombre);
  }
}
