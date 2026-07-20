import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Incident Manager - E2E Tests', () => {
  let app: INestApplication;
  let createdTicketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/tickets - Crear ticket con clasificacion IA', () => {
    it('debe crear un ticket y devolverlo con estado ABIERTO y sugerencia IA', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tickets')
        .send({
          title: 'No puedo ingresar al SIIU',
          description: 'No puedo conectarme al SIIU para matricularme',
          category: 'Académico - Estudiantes (SIIU)',
          tipo_usuario: 'ESTUDIANTE',
          requester: 'Test User',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('ABIERTO');
      expect(res.body.category).toBeDefined();
      expect(res.body.priority).toBeDefined();
      expect(res.body.ai_suggestion).toBeDefined();
      expect(res.body.title).toBe('No puedo ingresar al SIIU');
      createdTicketId = res.body.id;
    });

    it('debe rechazar ticket con datos invalidos', async () => {
      await request(app.getHttpServer())
        .post('/api/tickets')
        .send({ title: '' })
        .expect(400);
    });
  });

  describe('GET /api/tickets - Listar tickets', () => {
    it('debe devolver un array de tickets', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tickets')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('debe soportar el parametro limit', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tickets?limit=3')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/tickets/:id - Obtener ticket por ID', () => {
    it('debe devolver el ticket creado', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/tickets/${createdTicketId}`)
        .expect(200);

      expect(res.body.id).toBe(createdTicketId);
    });

    it('debe devolver 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/api/tickets/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /api/tickets/:id/estado - Transicion de estado', () => {
    it('debe cambiar de ABIERTO a EN_PROGRESO', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tickets/${createdTicketId}/estado`)
        .send({ status: 'EN_PROGRESO' })
        .expect(200);

      expect(res.body.status).toBe('EN_PROGRESO');
    });

    it('debe cambiar de EN_PROGRESO a RESUELTO y llenar metricas', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tickets/${createdTicketId}/estado`)
        .send({ status: 'RESUELTO' })
        .expect(200);

      expect(res.body.status).toBe('RESUELTO');
      expect(res.body.resolution_time_minutes).toBeGreaterThan(0);
      expect(parseFloat(res.body.cost_human)).toBeGreaterThan(0);
      expect(res.body.cost_ia).toBe(0.05);
      expect(res.body.resolved_at).toBeDefined();
    });

    it('debe rechazar transicion invalida', async () => {
      await request(app.getHttpServer())
        .patch(`/api/tickets/${createdTicketId}/estado`)
        .send({ status: 'ABIERTO' })
        .expect(400);
    });
  });

  describe('POST /api/feedback - Registrar feedback', () => {
    it('debe registrar feedback correctamente', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/feedback')
        .send({
          ticketId: createdTicketId,
          clasificacion_correcta: true,
          sugerencia_util: true,
          comentarios: 'Clasificacion correcta',
        })
        .expect(201);

      expect(res.body.message).toBe('Feedback registrado correctamente');
    });

    it('debe devolver 404 para ticket inexistente', async () => {
      await request(app.getHttpServer())
        .post('/api/feedback')
        .send({
          ticketId: '00000000-0000-0000-0000-000000000000',
          clasificacion_correcta: true,
          sugerencia_util: true,
        })
        .expect(404);
    });
  });

  describe('GET /api/dashboard/precision - Precision de IA', () => {
    it('debe devolver precision global y por categoria', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/precision')
        .expect(200);

      expect(res.body).toHaveProperty('precision_global');
      expect(res.body).toHaveProperty('categorias');
      expect(Array.isArray(res.body.categorias)).toBe(true);
    });
  });

  describe('GET /api/dashboard/kpis - KPIs del dashboard', () => {
    it('debe devolver todos los KPIs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/kpis')
        .expect(200);

      expect(res.body).toHaveProperty('total_tickets_hoy');
      expect(res.body).toHaveProperty('mttr_promedio_horas');
      expect(res.body).toHaveProperty('costo_promedio_por_ticket');
      expect(res.body).toHaveProperty('precision_ia_global');
      expect(res.body).toHaveProperty('distribucion_prioridad');
    });
  });
});
