import { Module } from '@nestjs/common';
import { FacultadesController } from './facultades.controller';

@Module({
  controllers: [FacultadesController],
})
export class FacultadesModule {}
