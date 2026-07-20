import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarFeedback(dto: CreateFeedbackDto): Promise<{ message: string }> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: dto.ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ${dto.ticketId} no encontrado`);

    await this.prisma.$transaction(async (tx) => {
      await tx.iAFeedback.create({
        data: {
          ticket_id: dto.ticketId,
          categoria_sugerida_por_ia: ticket.category,
          clasificacion_correcta: dto.clasificacion_correcta,
          sugerencia_util: dto.sugerencia_util,
          comentarios: dto.comentarios || null,
        },
      });

      await tx.ticket.update({
        where: { id: dto.ticketId },
        data: {
          feedback_ia: {
            clasificacion_correcta: dto.clasificacion_correcta,
            sugerencia_util: dto.sugerencia_util,
          },
        },
      });
    });

    return { message: 'Feedback registrado correctamente' };
  }

  async getPrecision() {
    const [totalByCat, correctByCat] = await Promise.all([
      this.prisma.iAFeedback.groupBy({
        by: ['categoria_sugerida_por_ia'],
        _count: { id: true },
      }),
      this.prisma.iAFeedback.groupBy({
        by: ['categoria_sugerida_por_ia'],
        where: { clasificacion_correcta: true },
        _count: { id: true },
      }),
    ]);

    const correctMap = new Map(correctByCat.map((r) => [r.categoria_sugerida_por_ia, r._count.id]));

    let precisionGlobal = 0;
    let totalGlobal = 0;
    let aciertosGlobal = 0;

    const categorias = totalByCat.map((row) => {
      const total = row._count.id;
      const aciertos = correctMap.get(row.categoria_sugerida_por_ia) || 0;
      const precision = total > 0 ? aciertos / total : 0;
      totalGlobal += total;
      aciertosGlobal += aciertos;
      return {
        categoria: row.categoria_sugerida_por_ia,
        precision: parseFloat(precision.toFixed(2)),
        total,
        alerta: precision < 0.7,
      };
    });

    precisionGlobal = totalGlobal > 0 ? parseFloat((aciertosGlobal / totalGlobal).toFixed(2)) : 0;

    return {
      precision_global: precisionGlobal,
      categorias,
    };
  }
}
