import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from '../src/tickets/tickets.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AIService } from '../src/ai/ai.service';
import { CreateTicketDto } from '../src/tickets/dto/create-ticket.dto';
import { TicketStatus } from '../src/tickets/enums';

const mockTx = {
  ticket: {
    create: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
};

const mockPrisma = {
  $transaction: jest.fn().mockImplementation((cb: Function) => cb(mockTx)),
  ticket: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  iAFeedback: {
    groupBy: jest.fn(),
  },
};

const mockAiService = {
  classify: jest.fn(),
};

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AIService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWithAIClassification', () => {
    const dto: CreateTicketDto = {
      title: 'No puedo ingresar al SIIU',
      description: 'No puedo conectarme al SIIU',
      category: 'Académico - Estudiantes (SIIU)',
      tipo_usuario: 'ESTUDIANTE',
      facultad_o_area: undefined,
      requester: 'Test User',
    };

    it('should create ticket with AI classification successfully', async () => {
      const mockTicket = { id: '1', ...dto, status: TicketStatus.PENDIENTE_CLASIFICACION };
      const mockAiResult = { category: 'Académico - Estudiantes (SIIU)', subcategoria: 'Inconvenientes en el ingreso', tipo_solicitud: 'INCIDENTE', priority: 'alto', urgency: 'urgente', impact: 'alto', suggestion: 'Test', user_recommendation: 'Contacta a Secretaria' };
      const mockUpdatedTicket = { ...mockTicket, ...mockAiResult, status: TicketStatus.ABIERTO, ai_suggestion: 'Test' };

      mockTx.ticket.create.mockResolvedValue(mockTicket);
      mockTx.ticket.update.mockResolvedValue(mockUpdatedTicket);
      mockAiService.classify.mockResolvedValue(mockAiResult);

      const result = await service.createWithAIClassification(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockTx.ticket.create).toHaveBeenCalled();
      expect(mockTx.ticket.update).toHaveBeenCalled();
      expect(mockTx.auditLog.create).toHaveBeenCalled();
      expect(mockAiService.classify).toHaveBeenCalledWith({ title: dto.title, description: dto.description, tipo_usuario: dto.tipo_usuario, facultad_o_area: dto.facultad_o_area });
      expect(result.status).toBe(TicketStatus.ABIERTO);
    });

    it('should rollback transaction if AI service fails', async () => {
      mockTx.ticket.create.mockResolvedValue({ id: '1', ...dto });
      mockAiService.classify.mockRejectedValue(new Error('AI Error'));

      await expect(service.createWithAIClassification(dto)).rejects.toThrow();
    });
  });
});
