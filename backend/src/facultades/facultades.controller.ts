import { Controller, Get, Param, Logger } from '@nestjs/common';
import { FACULTADES } from './facultades-data';

@Controller('facultades')
export class FacultadesController {
  private readonly logger = new Logger(FacultadesController.name);

  @Get()
  findAll() {
    try {
      return FACULTADES.map((f) => f.nombre);
    } catch (err: any) {
      this.logger.error(`findAll error: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Get(':facultad/carreras')
  findCarreras(@Param('facultad') facultad: string) {
    try {
      const decoded = decodeURIComponent(facultad);
      const facultadData = FACULTADES.find((f) => f.nombre === decoded);
      if (!facultadData) return [];
      return facultadData.carreras.map((c) => c.nombre);
    } catch (err: any) {
      this.logger.error(`findCarreras error: ${err.message}`, err.stack);
      throw err;
    }
  }
}
