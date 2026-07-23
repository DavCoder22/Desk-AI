import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AIClassificationResult } from './ai.service';
import { Category, Priority, Urgency, Impact } from '../tickets/enums';

export interface AIConfig {
  apiKey: string;
  model: string;
  apiUrl: string;
}

interface TicketInput {
  tipo_usuario: string;
  titulo: string;
  descripcion: string;
  facultad_o_area?: string;
}

const SYSTEM_PROMPT = `Eres el motor de clasificacion ITIL de la Mesa de Ayuda de la Universidad Central del Ecuador (UCE). Tu tarea es analizar la solicitud y devolver UNICAMENTE un JSON con la clasificacion completa, usando el catalogo oficial de categorias y subcategorias.

CATALOGO DE CATEGORIAS Y SUBCATEGORIAS (lista cerrada):

[A. SOPORTE DE SISTEMAS UCE]
- Accesos Peatonal o Vehicular: Inconvenientes con el acceso | Inconvenientes con el carnet
- Academico - Estudiantes (SIIU): Cambio de datos personales | Cambio de estado inscrito a matriculado | Inconvenientes en el ingreso | Inconvenientes en proceso de matriculacion | Inconvenientes en Encuesta | Inconvenientes en visualizacion de reportes | Inconvenientes en simulacion | Ordenes de cobro caducadas | Dudas sobre perdida de gratuidad
- Becas Excelencia Academica: Documentos para contrato de beca | Requisitos para ser beneficiario | Dudas sobre promedio de calificaciones | Dudas sobre no ser beneficiario
- Instituto Academico de Idiomas: Certificados para posgrado/externas | Homologacion de suficiencia | Novedades con matriculas | Novedades de cursos | Novedades en pase de notas al SIIU | Validacion de conocimientos
- Pagina Web UCE: Error en descargas | Guia para encontrar informacion | Inconvenientes al abrir la pagina
- Plataforma Educativa Virtual (UVirtual): Inconvenientes en el ingreso | Inconvenientes en matricula al aula virtual | Inconvenientes en resolucion de actividades
- Quipux: Actualizacion de informacion | Inconvenientes en el ingreso | Recuperacion de clave
- Sistema de Titulacion: Guia del proceso | Inconvenientes en el ingreso | Problemas en la notificacion
- Suficiencia Informatica: Cambio de estado inscrito a matriculado | Inconvenientes con cronograma | Inconvenientes en proceso de matriculas | Inconvenientes en valor del pago | Inconvenientes en visualizacion de calificaciones | Inconvenientes en visualizacion de paralelos | Inconvenientes en visualizacion del modulo

[B. SOPORTE TECNICO A USUARIOS]
- Correo Electronico Institucional: Configuracion de la cuenta | Guia de utilizacion | Inconvenientes con 2FA | Inconvenientes con Office 365 (OneDrive/Teams) | Inconvenientes en el ingreso a la cuenta | Inconvenientes en envio y recepcion

CAMPOS DE SALIDA:
{
  "categoria": "categoria exacta del catalogo",
  "subcategoria": "subcategoria exacta del catalogo",
  "tipo_solicitud": "INCIDENTE | SOLICITUD_SERVICIO",
  "prioridad": "critico | alto | medio | bajo",
  "urgencia": "urgente | alto | medio | bajo",
  "impacto": "alto | medio | bajo",
  "adjunto_requerido": "documento requerido si aplica (vacio si no)",
  "sugerencia_resolucion": "Debe estructurarse asi: **PROCEDIMIENTO** | 1) Paso 1 | 2) Paso 2 | 3) Paso 3 | **ESCALAMIENTO** | Condiciones para escalar al nivel superior | **REFERENCIA** | Documento/sistema de referencia",
  "recomendacion_usuario": "Debe estructurarse asi: **QUE HACER** | Accion concreta que el usuario debe tomar | **DONDE ACUDIR** | Oficina, persona o sistema al que debe contactar | **DOCUMENTOS** | Lista de documentos si aplica",
  "sugerencia_supervisor": "Debe estructurarse asi: **NIVEL DE ESCALAMIENTO** | N1/N2/N3 segun ITIL | **PRIORIDAD COBIT** | Objetivo de control relacionado | **ACCIONES DE MEJORA** | Recomendaciones para prevenir recurrencia | **SEGUIMIENTO** | Plazo sugerido de revision",
  "itil_proceso": "Gestion de Incidentes | Gestion de Solicitudes de Servicio | Gestion de Problemas",
  "cobit_objetivo": "DSS02.01 | DSS02.02 | DSS02.03 | DSS02.04 | DSS02.05"
}

REGLAS DE CLASIFICACION:
1. Elige la categoria y subcategoria mas especifica posible del catalogo.
2. tipo_solicitud: INCIDENTE (algo dejo de funcionar, error, caida, bloqueo) o SOLICITUD_SERVICIO (tramite, consulta, guia, certificado).
3. Impacto alto: afecta aula completa, facultad, o sistema central (SIIU, correo, UVirtual).
4. Impacto medio: afecta grupo pequeno o varios sistemas menores.
5. Impacto bajo: afecta a un solo usuario.
6. Urgencia urgente: bloquea actividad con fecha limite hoy (matricula, clase en curso, cierre de notas).
7. Urgencia alta: bloquea actividad de la semana.
8. Urgencia media: puede esperar dias.
9. Urgencia baja: sin fecha limite.
10. Prioridad = combinacion impacto x urgencia (matriz ITIL): urgente+alto=critico, alto+alto=alto, medio+medio=medio, resto=bajo.
11. COBIT DSS02: asigna el objetivo segun la naturaleza del ticket:
    - DSS02.01 (Definir esquema de clasificacion): solicitudes nuevas, consultas, tramites
    - DSS02.02 (Registrar y priorizar): tickets que requieren registro y priorizacion estandar
    - DSS02.03 (Diagnosticar y escalar): incidentes tecnicos que requieren diagnostico (sistemas, red, hardware)
    - DSS02.04 (Resolver y recuperar): incidentes de servicio que requieren restauracion (correo, SIIU, UVirtual)
    - DSS02.05 (Cerrar y evaluar): tickets resueltos que requieren confirmacion de cierre
12. sugerencia_resolucion es PARA EL AGENTE (pasos tecnicos). recomendacion_usuario es PARA EL USUARIO (lenguaje claro). sugerencia_supervisor es PARA EL ADMINISTRADOR (acciones de gestion).

EJEMPLO:
Input: { "tipo_usuario": "docente", "titulo": "No puedo iniciar la videollamada de mi clase", "descripcion": "Estoy en el aula ahora mismo y Teams no carga, mis 40 estudiantes estan esperando" }
Output: { "categoria": "Correo Electronico Institucional", "subcategoria": "Inconvenientes con Office 365 (OneDrive/Teams)", "tipo_solicitud": "INCIDENTE", "prioridad": "critico", "urgencia": "urgente", "impacto": "alto", "adjunto_requerido": "", "sugerencia_resolucion": "**PROCEDIMIENTO** | 1) Verificar conectividad de red en el aula (probar ping a office.com). 2) Comprobar estado del servicio Office 365 en portal.microsoft.com. 3) Solicitar reinicio de sesion con credenciales @uce.edu.ec. 4) Si el problema persiste, verificar licencia asignada en admin.microsoft.com. | **ESCALAMIENTO** | Si tras 15 min no se restablece, escalar a DTIC como incidente critico P1. | **REFERENCIA** | KB-Office365-001", "recomendacion_usuario": "**QUE HACER** | Cierra sesion en Teams y vuelve a iniciar con tu correo @uce.edu.ec. Si no funciona, prueba Teams desde el navegador (teams.microsoft.com). | **DONDE ACUDIR** | Contacta al departamento informatico de tu facultad o escribe a soporte.tecnico@uce.edu.ec indicando tu nombre, facultad y aula. | **ALTERNATIVA** | Mientras se resuelve, usa la app movil de Teams en tu celular para impartir la clase.", "sugerencia_supervisor": "**NIVEL DE ESCALAMIENTO** | N1 (soporte facultad) -> N2 (DTIC) si persiste. | **PRIORIDAD COBIT** | DSS02.04 - Resolver y recuperar servicio. Incidente critico P1 que afecta docencia activa con 40 estudiantes. | **ACCIONES DE MEJORA** | 1) Verificar redundancia de conectividad en aulas. 2) Registrar como leccion aprendida en la base de conocimiento. 3) Evaluar si hay patron de fallas en el mismo horario/aula. | **SEGUIMIENTO** | Revision post-mortem dentro de 48h.", "itil_proceso": "Gestion de Incidentes", "cobit_objetivo": "DSS02.04" }`;

@Injectable()
export class AiApiClient {
  private readonly logger = new Logger(AiApiClient.name);
  private config: AIConfig | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.resolve(__dirname, '../../ai-config.json');
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8');
        this.config = JSON.parse(raw);
        if (!this.config.apiKey || this.config.apiKey === 'tu-api-key-aqui') {
          this.logger.warn('AI config encontrada pero sin API key valida');
          this.config = null;
        } else {
          this.logger.log(`AI config cargada: modelo=${this.config.model}`);
        }
      } else {
        this.logger.warn('ai-config.json no encontrado. Usando clasificador local (keywords).');
      }
    } catch (err) {
      this.logger.error('Error al cargar ai-config.json', err);
      this.config = null;
    }
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.apiKey;
  }

  getConfig(): AIConfig | null {
    return this.config;
  }

  async classifyRemote(ticket: TicketInput): Promise<AIClassificationResult> {
    if (!this.isConfigured()) {
      throw new Error('AI API no configurada');
    }

    const userPrompt = `tipo_usuario: ${ticket.tipo_usuario}\ntitulo: ${ticket.titulo}\ndescripcion: ${ticket.descripcion}${ticket.facultad_o_area ? `\nfacultad: ${ticket.facultad_o_area}` : ''}`;

    const body = {
      model: this.config!.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    };

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`,
      };

      if (this.config!.apiUrl.includes('openrouter')) {
        headers['HTTP-Referer'] = 'https://github.com/DavCoder22/Desk-AI';
        headers['X-Title'] = 'DeskAI';
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(this.config!.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API HTTP ${response.status}: ${errorText}`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Respuesta vacia de la API');
      }

      const cleaned = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      const validCategories = Object.values(Category);
      const validPriorities = [Priority.CRITICO, Priority.ALTO, Priority.MEDIO, Priority.BAJO];
      const validUrgencies = [Urgency.URGENTE, Urgency.ALTO, Urgency.MEDIO, Urgency.BAJO];
      const validImpacts = [Impact.ALTO, Impact.MEDIO, Impact.BAJO];
      const validItil = ['Gestion de Incidentes', 'Gestion de Solicitudes de Servicio', 'Gestion de Problemas'];
      const validCobit = ['DSS02.01', 'DSS02.02', 'DSS02.03', 'DSS02.04', 'DSS02.05'];

      return {
        category: validCategories.includes(parsed.categoria) ? parsed.categoria : Category.OTROS,
        subcategoria: parsed.subcategoria || '',
        tipo_solicitud: ['INCIDENTE', 'SOLICITUD_SERVICIO'].includes(parsed.tipo_solicitud) ? parsed.tipo_solicitud : 'SOLICITUD_SERVICIO',
        priority: validPriorities.includes(parsed.prioridad) ? parsed.prioridad : Priority.MEDIO,
        urgency: validUrgencies.includes(parsed.urgencia) ? parsed.urgencia : Urgency.MEDIO,
        impact: validImpacts.includes(parsed.impacto) ? parsed.impacto : Impact.MEDIO,
        suggestion: parsed.sugerencia_resolucion || 'Revisar solicitud para determinar accion.',
        user_recommendation: parsed.recomendacion_usuario || 'Si el problema persiste, contacta al departamento informatico de tu facultad.',
        supervisor_suggestion: parsed.sugerencia_supervisor || 'Revisar ticket y asignar al equipo correspondiente.',
        itil_category: validItil.includes(parsed.itil_proceso) ? parsed.itil_proceso : 'Gestion de Incidentes',
        cobit_control: validCobit.includes(parsed.cobit_objetivo) ? parsed.cobit_objetivo : 'DSS02.03',
      };
    } catch (error: any) {
      this.logger.error(`Error en llamada a API IA: ${error.message}`);
      throw error;
    }
  }
}
