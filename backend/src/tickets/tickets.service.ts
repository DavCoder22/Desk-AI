import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { TicketStatus, Priority, Urgency, Impact, Category } from './enums';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AIService } from '../ai/ai.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async createWithAIClassification(dto: CreateTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          title: dto.title,
          description: dto.description,
          category: dto.category || 'PENDIENTE',
          tipo_usuario: dto.tipo_usuario || 'ESTUDIANTE',
          facultad_o_area: dto.facultad_o_area || null,
          carrera: dto.carrera || null,
          requester: dto.requester,
          status: TicketStatus.PENDIENTE_CLASIFICACION,
          priority: Priority.MEDIO,
          urgency: Urgency.MEDIO,
          impact: Impact.MEDIO,
        },
      });

      const aiResult = await this.aiService.classify({
        title: dto.title,
        description: dto.description,
        tipo_usuario: dto.tipo_usuario,
        facultad_o_area: dto.facultad_o_area,
      });

      const updatedTicket = await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          category: aiResult.category,
          subcategoria: aiResult.subcategoria || dto.subcategoria || null,
          tipo_solicitud: aiResult.tipo_solicitud || dto.tipo_solicitud || null,
          priority: aiResult.priority,
          urgency: aiResult.urgency,
          impact: aiResult.impact,
          ai_suggestion: aiResult.suggestion,
          user_recommendation: aiResult.user_recommendation || null,
          supervisor_suggestion: aiResult.supervisor_suggestion || null,
          itil_category: aiResult.itil_category || null,
          cobit_control: aiResult.cobit_control || null,
          status: TicketStatus.ABIERTO,
        },
      });

      await tx.auditLog.create({
        data: {
          ticket_id: updatedTicket.id,
          action: 'CREACION',
          details: { resultado_IA: aiResult } as any,
        },
      });

      return updatedTicket;
    });
  }

  async findAll(limit?: number, sortBy?: string) {
    const order: any = { created_at: 'desc' };
    if (sortBy) {
      const parts = sortBy.split(':');
      if (parts.length === 2) {
        order[parts[0]] = parts[1].toUpperCase() === 'ASC' ? 'asc' : 'desc';
      }
    }
    const options: any = { orderBy: order };
    if (limit) options.take = limit;
    return this.prisma.ticket.findMany(options);
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    return ticket;
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const ticket = await this.findOne(id);
    const newStatus = dto.status;

    const validTransitions: Record<string, string[]> = {
      [TicketStatus.ABIERTO]: [TicketStatus.EN_PROGRESO],
      [TicketStatus.EN_PROGRESO]: [TicketStatus.RESUELTO],
      [TicketStatus.RESUELTO]: [TicketStatus.CERRADO],
    };

    const allowed = validTransitions[ticket.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transicion invalida de ${ticket.status} a ${newStatus}`,
      );
    }

    const updateData: any = { status: newStatus };

    if (newStatus === TicketStatus.RESUELTO) {
      const resolved_at = new Date();
      const diffMs = resolved_at.getTime() - ticket.created_at.getTime();
      const resolution_time_minutes = Math.floor(diffMs / 60000);
      Object.assign(updateData, {
        resolved_at,
        resolution_time_minutes,
        cost_human: parseFloat(((resolution_time_minutes / 60) * 15).toFixed(2)),
        cost_ia: 0.05,
      });
    }

    return this.prisma.ticket.update({ where: { id }, data: updateData });
  }

  async userAction(id: string, accion: string) {
    const ticket = await this.findOne(id);

    if (accion === 'CERRAR') {
      if (ticket.status === TicketStatus.CERRADO) {
        throw new BadRequestException('El ticket ya esta cerrado');
      }
      const resolved_at = new Date();
      const diffMs = resolved_at.getTime() - ticket.created_at.getTime();
      const resolution_time_minutes = Math.floor(diffMs / 60000);
      return this.prisma.ticket.update({
        where: { id },
        data: {
          status: TicketStatus.CERRADO,
          resolved_at,
          resolution_time_minutes: ticket.resolution_time_minutes || resolution_time_minutes,
          cost_human: ticket.cost_human ?? parseFloat(((resolution_time_minutes / 60) * 15).toFixed(2)),
          cost_ia: ticket.cost_ia ?? 0.05,
        },
      });
    }

    if (accion === 'REENVIAR') {
      return this.prisma.ticket.update({
        where: { id },
        data: {
          status: TicketStatus.ABIERTO,
          resolved_at: null,
        },
      });
    }

    throw new BadRequestException(`Accion invalida: ${accion}. Use CERRAR o REENVIAR.`);
  }

  async getKPIs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalTicketsHoy, mttrResult, costResult, distribucionPrioridad, feedbackTotal, feedbackCorrect] =
      await Promise.all([
        this.prisma.ticket.count({
          where: {
            created_at: { gte: today, lt: tomorrow },
          },
        }),
        this.prisma.ticket.aggregate({
          _avg: { resolution_time_minutes: true },
          where: {
            status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] },
            resolution_time_minutes: { not: null },
          },
        }),
        this.prisma.ticket.aggregate({
          _avg: { cost_human: true, cost_ia: true },
          where: {
            status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] },
          },
        }),
        this.prisma.ticket.groupBy({
          by: ['priority'],
          _count: { priority: true },
        }),
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

    const mttrHoras = mttrResult._avg.resolution_time_minutes
      ? parseFloat((mttrResult._avg.resolution_time_minutes / 60).toFixed(2))
      : 0;

    const avgHuman = costResult._avg.cost_human || 0;
    const avgIa = costResult._avg.cost_ia || 0;
    const costoPromedio = parseFloat((avgHuman + avgIa).toFixed(2));

    const distribucion = distribucionPrioridad.map((r) => ({
      priority: r.priority,
      count: r._count.priority,
    }));

    const correctMap = new Map(feedbackCorrect.map((r) => [r.categoria_sugerida_por_ia, r._count.id]));

    const precisionPorCategoria = feedbackTotal.map((row) => {
      const total = row._count.id;
      const aciertos = correctMap.get(row.categoria_sugerida_por_ia) || 0;
      const precision = total > 0 ? aciertos / total : 0;
      return {
        categoria: row.categoria_sugerida_por_ia,
        precision: parseFloat(precision.toFixed(2)),
        total,
        alerta: precision < 0.7,
      };
    });

    let precisionGlobal = 0;
    if (feedbackTotal.length > 0) {
      const totalGlobal = feedbackTotal.reduce((s, r) => s + r._count.id, 0);
      const aciertosGlobal = feedbackCorrect.reduce((s, r) => s + r._count.id, 0);
      precisionGlobal = totalGlobal > 0 ? parseFloat((aciertosGlobal / totalGlobal).toFixed(2)) : 0;
    }

    return {
      total_tickets_hoy: totalTicketsHoy,
      mttr_promedio_horas: mttrHoras,
      costo_promedio_por_ticket: costoPromedio,
      precision_ia_global: precisionGlobal,
      distribucion_prioridad: distribucion,
      precision_por_categoria: precisionPorCategoria,
    };
  }

  async getResolucionDetalle() {
    const resolved = await this.prisma.ticket.findMany({
      where: {
        status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] },
        resolution_time_minutes: { not: null },
      },
      orderBy: { resolved_at: 'desc' },
    });

    const mttrPorPrioridad = await Promise.all(
      Object.values(Priority).map(async (p) => {
        const agg = await this.prisma.ticket.aggregate({
          _avg: { resolution_time_minutes: true },
          _count: { id: true },
          where: {
            priority: p,
            status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] },
            resolution_time_minutes: { not: null },
          },
        });
        return {
          prioridad: p,
          mttr_horas: agg._avg.resolution_time_minutes
            ? parseFloat((agg._avg.resolution_time_minutes / 60).toFixed(2))
            : 0,
          count: agg._count.id,
        };
      }),
    );

    const mttrPorCategoria = await Promise.all(
      Object.values(Category).map(async (c) => {
        const agg = await this.prisma.ticket.aggregate({
          _avg: { resolution_time_minutes: true },
          _count: { id: true },
          where: {
            category: c,
            status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] },
            resolution_time_minutes: { not: null },
          },
        });
        return {
          categoria: c,
          mttr_horas: agg._avg.resolution_time_minutes
            ? parseFloat((agg._avg.resolution_time_minutes / 60).toFixed(2))
            : 0,
          count: agg._count.id,
        };
      }),
    );

    const mttrGlobal = resolved.length > 0
      ? parseFloat((resolved.reduce((s, t) => s + (t.resolution_time_minutes || 0), 0) / resolved.length / 60).toFixed(2))
      : 0;

    return {
      mttr_global_horas: mttrGlobal,
      total_resueltos: resolved.length,
      mttr_por_prioridad: mttrPorPrioridad,
      mttr_por_categoria: mttrPorCategoria,
      tickets_resueltos: resolved.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        category: t.category,
        resolution_time_minutes: t.resolution_time_minutes,
        resolution_time_horas: parseFloat(((t.resolution_time_minutes || 0) / 60).toFixed(2)),
        resolved_at: t.resolved_at,
      })),
    };
  }

  async getCostosDetalle() {
    const [totalResueltos, costosAgregados, tickets] = await Promise.all([
      this.prisma.ticket.count({
        where: { status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] } },
      }),
      this.prisma.ticket.aggregate({
        _sum: { cost_human: true, cost_ia: true },
        _avg: { cost_human: true, cost_ia: true },
        where: { status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] } },
      }),
      this.prisma.ticket.findMany({
        where: { status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] } },
        orderBy: { resolved_at: 'desc' },
        take: 50,
      }),
    ]);

    const totalHuman = costosAgregados._sum.cost_human || 0;
    const totalIa = costosAgregados._sum.cost_ia || 0;

    return {
      total_tickets_resueltos: totalResueltos,
      costo_total_humano: parseFloat(totalHuman.toFixed(2)),
      costo_total_ia: parseFloat(totalIa.toFixed(2)),
      costo_total_tco: parseFloat((totalHuman + totalIa).toFixed(2)),
      costo_promedio_humano: parseFloat((costosAgregados._avg.cost_human || 0).toFixed(2)),
      costo_promedio_ia: parseFloat((costosAgregados._avg.cost_ia || 0).toFixed(2)),
      costo_promedio_tco: parseFloat(((costosAgregados._avg.cost_human || 0) + (costosAgregados._avg.cost_ia || 0)).toFixed(2)),
      tickets: tickets.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        cost_human: t.cost_human,
        cost_ia: t.cost_ia,
        costo_total: parseFloat(((t.cost_human || 0) + (t.cost_ia || 0)).toFixed(2)),
        resolution_time_minutes: t.resolution_time_minutes,
        resolved_at: t.resolved_at,
      })),
    };
  }

  async getCobitDss02() {
    const total = await this.prisma.ticket.count();
    const resueltos = await this.prisma.ticket.count({
      where: { status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] } },
    });
    const abiertos = await this.prisma.ticket.count({
      where: { status: { in: [TicketStatus.ABIERTO, TicketStatus.EN_PROGRESO] } },
    });
    const sinClasificar = await this.prisma.ticket.count({
      where: { status: TicketStatus.PENDIENTE_CLASIFICACION },
    });

    const [mttrAgg, costAgg] = await Promise.all([
      this.prisma.ticket.aggregate({
        _avg: { resolution_time_minutes: true },
        where: {
          status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] },
          resolution_time_minutes: { not: null },
        },
      }),
      this.prisma.ticket.aggregate({
        _sum: { cost_human: true, cost_ia: true },
        where: { status: { in: [TicketStatus.RESUELTO, TicketStatus.CERRADO] } },
      }),
    ]);

    const cumplimientoTickets = total > 0
      ? parseFloat((resueltos / total).toFixed(2))
      : 0;

    const costoAnualEstimado = ((costAgg._sum.cost_human || 0) + (costAgg._sum.cost_ia || 0)) * 12;

    return {
      total_incidentes: total,
      incidentes_resueltos: resueltos,
      incidentes_abiertos: abiertos,
      incidentes_sin_clasificar: sinClasificar,
      tasa_resolucion: cumplimientoTickets,
      mttr_promedio_horas: mttrAgg._avg.resolution_time_minutes
        ? parseFloat((mttrAgg._avg.resolution_time_minutes / 60).toFixed(2))
        : 0,
      costo_total_gestion: parseFloat(((costAgg._sum.cost_human || 0) + (costAgg._sum.cost_ia || 0)).toFixed(2)),
      costo_anual_estimado: parseFloat(costoAnualEstimado.toFixed(2)),
      control_objetivos: [
        { codigo: 'DSS02.01', nombre: 'Definir esquema de clasificación de incidentes', estado: cumplimientoTickets >= 0.8 ? 'CUMPLE' : 'NO_CUMPLE', valor: total > 0 ? parseFloat((resueltos / total).toFixed(2)) : 0 },
        { codigo: 'DSS02.02', nombre: 'Registrar y priorizar incidentes', estado: abiertos <= total * 0.3 ? 'CUMPLE' : 'NO_CUMPLE', valor: total > 0 ? parseFloat(((total - abiertos) / total).toFixed(2)) : 0 },
        { codigo: 'DSS02.03', nombre: 'Diagnosticar y escalar incidentes', estado: sinClasificar === 0 ? 'CUMPLE' : 'NO_CUMPLE', valor: total > 0 ? parseFloat(((total - sinClasificar) / total).toFixed(2)) : 0 },
        { codigo: 'DSS02.04', nombre: 'Resolver y recuperar servicio', estado: cumplimientoTickets >= 0.75 ? 'CUMPLE' : 'NO_CUMPLE', valor: cumplimientoTickets },
        { codigo: 'DSS02.05', nombre: 'Cerrar incidentes y evaluar', estado: resueltos > 0 ? 'CUMPLE' : 'NO_CUMPLE', valor: total > 0 ? parseFloat((resueltos / total).toFixed(2)) : 0 },
      ],
    };
  }
}
