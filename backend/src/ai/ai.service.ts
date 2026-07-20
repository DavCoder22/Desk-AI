import { Injectable, Logger } from '@nestjs/common';
import { Category, Priority, Urgency, Impact, TipoUsuario, Subcategorias, AdjuntosRequeridos } from '../tickets/enums';
import { AiApiClient } from './ai-api-client';

export interface AIClassificationResult {
  category: string;
  subcategoria: string;
  tipo_solicitud: string;
  priority: string;
  urgency: string;
  impact: string;
  suggestion: string;
  user_recommendation: string;
  supervisor_suggestion: string;
  itil_category: string;
  cobit_control: string;
}

export interface TicketForClassification {
  id?: string;
  title: string;
  description: string;
  tipo_usuario?: string;
  facultad_o_area?: string;
}

interface CategoryProfile {
  keywords: { term: string; weight: number }[];
  basePriority: string;
  baseUrgency: string;
  baseImpact: string;
  subcategoriaTipica: string;
  suggestionTemplate: string;
  userRecommendationTemplate: string;
}

const SUB = {
  ACCESO: 'Inconvenientes con el acceso',
  CARNET: 'Inconvenientes con el carnet',
  INGRESO: 'Inconvenientes en el ingreso',
  MATRICULA: 'Inconvenientes en proceso de matriculación',
  NOTAS: 'Inconvenientes en visualización de reportes',
  CERTIFICADOS: 'Certificados para posgrado/externas',
  CURSOS: 'Novedades de cursos',
  GUIA: 'Guía para encontrar información',
  ERROR_DESCARGAS: 'Error en descargas',
  UVIRTUAL_INGRESO: 'Inconvenientes en el ingreso',
  UVIRTUAL_ACTIVIDADES: 'Inconvenientes en resolución de actividades',
  CLAVE: 'Recuperación de clave',
  TITULACION_GUIA: 'Guía del proceso',
  CONFIG_CORREO: 'Configuración de la cuenta',
  ENVIO_RECEPCION: 'Inconvenientes en envío y recepción',
};

const S = (proc: string, esc: string, ref: string) =>
  `**PROCEDIMIENTO** | ${proc} | **ESCALAMIENTO** | ${esc} | **REFERENCIA** | ${ref}`;

const U = (que: string, donde: string, docs?: string) =>
  `**QUE HACER** | ${que} | **DONDE ACUDIR** | ${donde}${docs ? ` | **DOCUMENTOS** | ${docs}` : ''}`;

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  private readonly profiles: CategoryProfile[] = [
    {
      keywords: [{ term: 'acceso peatonal', weight: 5 }, { term: 'torniquete', weight: 4 }, { term: 'puerta', weight: 3 }, { term: 'carnet', weight: 3 }, { term: 'ingreso peatonal', weight: 4 }, { term: 'acceso vehicular', weight: 4 }, { term: 'porton', weight: 3 }],
      basePriority: Priority.MEDIO, baseUrgency: Urgency.MEDIO, baseImpact: Impact.MEDIO,
      subcategoriaTipica: SUB.ACCESO,
      suggestionTemplate: S(
        '1) Identificar ubicacion exacta del acceso (puerta, facultad, edificio). 2) Si es inconveniente con carnet, verificar estado en sistema de identificacion. 3) Si es acceso bloqueado sin carnet, referir a guardiania de la facultad.',
        'Escalar a Departamento de Seguridad si el problema es del sistema electronico de control de accesos.',
        'KB-Accesos-001 - Procedimiento de control de accesos UCE'
      ),
      userRecommendationTemplate: U(
        'Acercate a guardiania de tu facultad con tu cedula de identidad para que verifiquen tu acceso.',
        'Departamento de Seguridad de la UCE (edificio administrativo). Si el problema es con el carnet, solicita reposicion en la oficina de bienestar.',
        'Cedula de identidad'
      ),
    },
    {
      keywords: [{ term: 'siiu', weight: 5 }, { term: 'matricula', weight: 5 }, { term: 'matricular', weight: 5 }, { term: 'notas', weight: 4 }, { term: 'kardex', weight: 4 }, { term: 'certificado de notas', weight: 4 }, { term: 'pensum', weight: 3 }, { term: 'horario', weight: 3 }, { term: 'estudiante', weight: 2 }, { term: 'academico', weight: 3 }, { term: 'reporte', weight: 2 }, { term: 'encuesta', weight: 2 }, { term: 'simulacion', weight: 2 }, { term: 'orden de cobro', weight: 3 }, { term: 'gratuidad', weight: 2 }, { term: 'voucher', weight: 3 }],
      basePriority: Priority.ALTO, baseUrgency: Urgency.URGENTE, baseImpact: Impact.ALTO,
      subcategoriaTipica: SUB.INGRESO,
      suggestionTemplate: S(
        '1) Verificar credenciales del usuario (correo institucional y SIIU comparten directorio activo). 2) Si el problema es de matricula, confirmar que el periodo este activo y que el usuario cumpla prerequisitos. 3) Para notas/reportes, contactar a Secretaria de Facultad para confirmacion de actas. 4) Si es orden de cobro caducada, referir a Departamento Financiero. 5) Limpiar cache del navegador y probar en modo incognito.',
        'Si el problema persiste tras los pasos anteriores, escalar a Secretaria General con los detalles del usuario y pantallazos del error.',
        'KB-SIIU-001 - Gestion de cuentas SIIU'
      ),
      userRecommendationTemplate: U(
        'Contacta a Secretaria de tu Facultad presencialmente o via correo institucional. Para certificados de notas, acude a Secretaria General en la Ciudadela Universitaria.',
        'Secretaria de tu Facultad (horario 08:00-16:00). Para certificados: Secretaria General, edificio administrativo, planta baja.',
        'Cedula de identidad y numero de matricula'
      ),
    },
    {
      keywords: [{ term: 'beca', weight: 5 }, { term: 'excelencia academica', weight: 4 }, { term: 'contrato de beca', weight: 4 }, { term: 'beneficiario', weight: 3 }, { term: 'promedio', weight: 3 }, { term: 'requisitos', weight: 2 }],
      basePriority: Priority.MEDIO, baseUrgency: Urgency.MEDIO, baseImpact: Impact.BAJO,
      subcategoriaTipica: 'Requisitos para ser beneficiario',
      suggestionTemplate: S(
        '1) Identificar el tipo de consulta sobre becas. 2) Si es documentos para contrato, verificar que esten completos segun checklist. 3) Si es duda sobre requisitos/promedio, proporcionar informacion actualizada de la convocatoria.',
        'Derivar a la Direccion de Bienestar Universitario para casos especificos que requieran validacion manual.',
        'KB-Becas-001 - Convocatorias y requisitos'
      ),
      userRecommendationTemplate: U(
        'Acercate a la Direccion de Bienestar Universitario en la Ciudadela Universitaria con tus documentos.',
        'Direccion de Bienestar Universitario, edificio de gobierno, 2do piso. Tambien puedes consultar www.uce.edu.ec/becas.',
        'Cedula, record academico, formulario de solicitud'
      ),
    },
    {
      keywords: [{ term: 'idiomas', weight: 5 }, { term: 'certificado idiomas', weight: 4 }, { term: 'homologacion', weight: 4 }, { term: 'suficiencia idioma', weight: 4 }, { term: 'ingles', weight: 3 }, { term: 'pase de notas', weight: 3 }, { term: 'instituto de idiomas', weight: 4 }],
      basePriority: Priority.MEDIO, baseUrgency: Urgency.MEDIO, baseImpact: Impact.MEDIO,
      subcategoriaTipica: SUB.CERTIFICADOS,
      suggestionTemplate: S(
        '1) Si es certificado/homologacion, solicitar documentos requeridos (cedula, record, solicitud). 2) Verificar vigencia de 5 anos para homologaciones. 3) Si son novedades de matricula, contactar al Instituto de Idiomas directamente.',
        'Para pase de notas al SIIU, verificar con Secretaria del Instituto. Si hay error en el sistema, escalar a DTIC.',
        'KB-Idiomas-001 - Certificados y homologaciones'
      ),
      userRecommendationTemplate: U(
        'Acercate al Instituto Academico de Idiomas con los documentos requeridos.',
        'Instituto Academico de Idiomas, Ciudadela Universitaria (junto a la Facultad de Filosofia).',
        'Cedula, record academico, solicitud. Para homologacion: diploma original con vigencia maxima de 5 anos.'
      ),
    },
    {
      keywords: [{ term: 'pagina web', weight: 4 }, { term: 'web uce', weight: 4 }, { term: 'www.uce.edu.ec', weight: 4 }, { term: 'descarga', weight: 3 }, { term: 'pdf', weight: 2 }, { term: 'sitio web', weight: 3 }],
      basePriority: Priority.MEDIO, baseUrgency: Urgency.MEDIO, baseImpact: Impact.MEDIO,
      subcategoriaTipica: 'Inconvenientes al abrir la página',
      suggestionTemplate: S(
        '1) Confirmar si el problema es general (toda la web) o especifico (una pagina/seccion). 2) Si es error en descargas PDF, probar con otro navegador. 3) Si la web no carga, verificar si otros usuarios estan afectados.',
        'Escalar a DTIC si el servidor web presenta problemas de caida general.',
        'KB-Web-001 - Administracion sitio web UCE'
      ),
      userRecommendationTemplate: U(
        'Prueba abrir la pagina con otro navegador (Chrome, Edge) o en modo incognito.',
        'Si el problema persiste, reportalo a soporte.tecnico@uce.edu.ec indicando la URL exacta y el error que aparece.',
      ),
    },
    {
      keywords: [{ term: 'uvirtual', weight: 5 }, { term: 'aula virtual', weight: 4 }, { term: 'plataforma educativa', weight: 4 }, { term: 'campus virtual', weight: 3 }, { term: 'tarea', weight: 3 }, { term: 'cuestionario', weight: 3 }, { term: 'curso virtual', weight: 3 }, { term: 'actividades', weight: 2 }, { term: 'subir', weight: 2 }],
      basePriority: Priority.ALTO, baseUrgency: Urgency.ALTO, baseImpact: Impact.ALTO,
      subcategoriaTipica: SUB.UVIRTUAL_INGRESO,
      suggestionTemplate: S(
        '1) Solicitar borrar cache/cookies y probar Chrome o Edge. 2) Verificar que el curso este "visible" en el panel del EVA (solo docentes). 3) Si el curso no aparece al estudiante, validar en SIIU que la matricula este confirmada (sincronizacion toma hasta 24h). 4) Para problemas con tareas/cuestionarios, verificar fecha de entrega y configuracion de la actividad.',
        'Contactar a campusvirtual@uce.edu.ec si es problema general del servidor o si hay mas de 5 usuarios afectados.',
        'KB-UVirtual-001 - Gestion de aulas virtuales'
      ),
      userRecommendationTemplate: U(
        'Limpia la cache de tu navegador y prueba con Chrome o Edge. Si no puedes ver un curso, espera 24h desde tu matricula para la sincronizacion.',
        'Si el problema persiste, escribe a campusvirtual@uce.edu.ec explicando tu caso, incluyendo tu nombre completo, facultad y nombre del curso.',
      ),
    },
    {
      keywords: [{ term: 'quipux', weight: 5 }, { term: 'sistema documental', weight: 3 }, { term: 'documento', weight: 2 }, { term: 'tramite', weight: 3 }, { term: 'certificado digital', weight: 2 }],
      basePriority: Priority.ALTO, baseUrgency: Urgency.ALTO, baseImpact: Impact.MEDIO,
      subcategoriaTipica: SUB.INGRESO,
      suggestionTemplate: S(
        '1) Verificar credenciales del usuario (Quipux usa las mismas del correo institucional). 2) Si es recuperacion de clave, realizar reset desde el panel de administracion. 3) Si es actualizacion de informacion, verificar que el usuario tenga permisos de edicion.',
        'Escalar a DTIC si el sistema no responde o si hay error de base de datos.',
        'KB-Quipux-001 - Administracion Quipux'
      ),
      userRecommendationTemplate: U(
        'Intenta ingresar con tus credenciales de correo institucional @uce.edu.ec.',
        'Si olvidaste tu clave, contacta al departamento informatico de tu facultad para restablecerla. Si el sistema no carga, escribe a soporte.tecnico@uce.edu.ec.',
      ),
    },
    {
      keywords: [{ term: 'titulacion', weight: 5 }, { term: 'titulo', weight: 4 }, { term: 'graduacion', weight: 3 }, { term: 'grado', weight: 3 }, { term: 'tesis', weight: 2 }, { term: 'notificacion', weight: 2 }, { term: 'proceso de titulacion', weight: 4 }],
      basePriority: Priority.MEDIO, baseUrgency: Urgency.MEDIO, baseImpact: Impact.MEDIO,
      subcategoriaTipica: SUB.TITULACION_GUIA,
      suggestionTemplate: S(
        '1) Identificar el tipo de consulta (guia, ingreso, notificacion). 2) Si es guia del proceso, proporcionar enlace al reglamento de titulacion. 3) Si es inconveniente de ingreso, verificar credenciales y periodo de titulacion.',
        'Si es problema de notificacion en el sistema, revisar bandeja de spam y configuracion de correo. Escalar a Secretaria General si no se visualiza la notificacion.',
        'KB-Titulacion-001 - Proceso de titulacion UCE'
      ),
      userRecommendationTemplate: U(
        'Revisa la guia de titulacion en la pagina web de tu facultad.',
        'Si tienes problemas con el sistema de titulacion, contacta a la Secretaria de tu Facultad. Para notificaciones, revisa tambien la bandeja de spam de tu correo institucional.',
      ),
    },
    {
      keywords: [{ term: 'suficiencia informatica', weight: 5 }, { term: 'suficiencia', weight: 4 }, { term: 'informatica', weight: 3 }, { term: 'calificaciones suficiencia', weight: 3 }, { term: 'paralelos', weight: 3 }, { term: 'inscripcion suficiencia', weight: 4 }],
      basePriority: Priority.MEDIO, baseUrgency: Urgency.MEDIO, baseImpact: Impact.MEDIO,
      subcategoriaTipica: 'Inconvenientes en proceso de matrículas',
      suggestionTemplate: S(
        '1) Verificar que el usuario este inscrito en el modulo de suficiencia informatica. 2) Si es cambio de estado inscrito a matriculado, confirmar pago. 3) Si es problema de visualizacion (calificaciones, paralelos), limpiar cache.',
        'Escalar al Instituto de Idiomas si el problema es del sistema de gestion de suficiencia.',
        'KB-Suficiencia-001 - Modulo de suficiencia informatica'
      ),
      userRecommendationTemplate: U(
        'Si tienes problemas con la suficiencia informatica, contacta al Instituto Academico de Idiomas donde gestionan este modulo.',
        'Instituto Academico de Idiomas, Ciudadela Universitaria. Verifica tambien que tu pago este registrado en el sistema financiero.',
      ),
    },
    {
      keywords: [{ term: 'correo', weight: 5 }, { term: 'email', weight: 3 }, { term: 'mail', weight: 3 }, { term: 'outlook', weight: 4 }, { term: 'office 365', weight: 4 }, { term: 'onedrive', weight: 3 }, { term: 'teams', weight: 3 }, { term: '2fa', weight: 3 }, { term: 'autenticacion dos factores', weight: 3 }, { term: 'firma', weight: 2 }, { term: '@uce', weight: 3 }, { term: 'uce.edu.ec', weight: 3 }],
      basePriority: Priority.ALTO, baseUrgency: Urgency.ALTO, baseImpact: Impact.ALTO,
      subcategoriaTipica: SUB.CONFIG_CORREO,
      suggestionTemplate: S(
        '1) Verificar estado de la cuenta en admin.microsoft.com (bloqueada por seguridad o intentos fallidos). 2) Si es 2FA, guiar al usuario en configuracion de la aplicacion de autenticacion. 3) Si es problema de envio/recepcion, verificar DNS (SPF, DKIM, DMARC). 4) Para Office 365 (OneDrive/Teams), verificar licencia asignada.',
        'Escalar a DTIC si hay compromiso de seguridad o si la cuenta requiere reactivacion manual.',
        'KB-Correo-001 - Gestion de cuentas institucionales'
      ),
      userRecommendationTemplate: U(
        'Intenta recuperar tu contrasena en mail.uce.edu.ec usando la opcion "Olvide mi contrasena".',
        'Si el problema persiste, acude al departamento informatico de tu facultad con tu cedula, o escribe a soporte.tecnico@uce.edu.ec. Para 2FA, descarga Microsoft Authenticator o usa Google Authenticator.',
        'Cedula de identidad'
      ),
    },
  ];

  private readonly defaultResult: AIClassificationResult = {
    category: Category.OTROS,
    subcategoria: '',
    tipo_solicitud: 'SOLICITUD_SERVICIO',
    priority: Priority.BAJO,
    urgency: Urgency.BAJO,
    impact: Impact.BAJO,
    suggestion: '**PROCEDIMIENTO** | Revisar la solicitud en detalle. Identificar el sistema o servicio involucrado. Si corresponde a alguna categoria del catalogo UCE, reclasificar manualmente. | **ESCALAMIENTO** | Asignar al equipo de soporte general si no se puede clasificar. | **REFERENCIA** | Catalogo de categorias UCE',
    user_recommendation: '**QUE HACER** | Si tu solicitud no corresponde a servicios habituales, contacta a la Direccion de Tecnologias (DTIC). | **DONDE ACUDIR** | soporte.tecnico@uce.edu.ec o acude al departamento informatico de tu facultad.',
    supervisor_suggestion: '**REVISION MANUAL REQUERIDA** | Este ticket no pudo ser clasificado automaticamente. Revise los detalles y asigne la categoria, prioridad y equipo de soporte correspondiente. | **PRIORIDAD COBIT** | DSS02.01 - Definir esquema de clasificacion | **ACCIONES DE MEJORA** | Actualizar el perfil de palabras clave del clasificador local si este patron se repite.',
    itil_category: 'Gestion de Incidentes / Solicitudes de Servicio',
    cobit_control: 'DSS02.01',
  };

  constructor(private readonly aiApiClient: AiApiClient) {}

  async classify(ticket: TicketForClassification, forceLocal = false): Promise<AIClassificationResult> {
    if (!forceLocal && this.aiApiClient.isConfigured()) {
      try {
        this.logger.log(`Usando API IA para clasificar ticket: ${ticket.title}`);
        const result = await this.aiApiClient.classifyRemote({
          tipo_usuario: ticket.tipo_usuario || 'ESTUDIANTE',
          titulo: ticket.title,
          descripcion: ticket.description,
          facultad_o_area: ticket.facultad_o_area,
        });
        this.logger.log(`API IA: categoria=${result.category}`);
        return result;
      } catch (error: any) {
        this.logger.warn(`API IA fallo (${error.message}), usando fallback local`);
      }
    }
    return this.classifyLocal(ticket);
  }

  private classifyLocal(ticket: TicketForClassification): Promise<AIClassificationResult> {
    const text = `${ticket.title} ${ticket.description}`.toLowerCase();
    const isEstudiante = ticket.tipo_usuario === TipoUsuario.ESTUDIANTE;
    const isDocente = ticket.tipo_usuario === TipoUsuario.DOCENTE;

    const scores = this.profiles.map((profile) => {
      let score = 0;
      for (const kw of profile.keywords) {
        if (text.includes(kw.term)) score += kw.weight;
      }
      return { profile, score };
    });

    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];

    let result: AIClassificationResult;
    if (best && best.score > 0) {
      const category = this.getCategoryForProfile(best.profile);
      const sub = best.profile.subcategoriaTipica;
      const tieneFalla = ['no puedo', 'no funciona', 'no carga', 'error', 'falla', 'no conecta', 'dejo de'].some((p) => text.includes(p));
      result = {
        category,
        subcategoria: sub,
        tipo_solicitud: tieneFalla ? 'INCIDENTE' : 'SOLICITUD_SERVICIO',
        priority: best.profile.basePriority,
        urgency: best.profile.baseUrgency,
        impact: best.profile.baseImpact,
        suggestion: best.profile.suggestionTemplate,
        user_recommendation: best.profile.userRecommendationTemplate,
        supervisor_suggestion: best.profile.suggestionTemplate,
        itil_category: '',
        cobit_control: '',
      };
    } else {
      result = { ...this.defaultResult };
    }

    const itilMap: Record<string, string> = {
      [Category.ACCESOS_PEATONAL_VEHICULAR]: 'Gestion de Incidentes - Infraestructura Fisica',
      [Category.ACADEMICO_SIIU]: 'Gestion de Incidentes - Sistema Academico',
      [Category.BECAS_EXCELENCIA]: 'Gestion de Solicitudes - Bienestar',
      [Category.IDIOMAS]: 'Gestion de Solicitudes - Instituto de Idiomas',
      [Category.PAGINA_WEB_UCE]: 'Gestion de Incidentes - Plataforma Web',
      [Category.UVIRTUAL]: 'Gestion de Incidentes - Plataforma Educativa',
      [Category.QUIPUX]: 'Gestion de Incidentes - Sistema Documental',
      [Category.TITULACION]: 'Gestion de Solicitudes - Titulacion',
      [Category.SUFICIENCIA_INFORMATICA]: 'Gestion de Solicitudes - Suficiencia',
      [Category.CORREO_INSTITUCIONAL]: 'Gestion de Incidentes - Servicio de Correo',
    };
    result.itil_category = itilMap[result.category] || 'Gestion de Incidentes';

    const cobitMap: Record<string, string> = {
      [Category.ACCESOS_PEATONAL_VEHICULAR]: 'DSS02.03',
      [Category.ACADEMICO_SIIU]: 'DSS02.04',
      [Category.BECAS_EXCELENCIA]: 'DSS02.01',
      [Category.IDIOMAS]: 'DSS02.01',
      [Category.PAGINA_WEB_UCE]: 'DSS02.03',
      [Category.UVIRTUAL]: 'DSS02.04',
      [Category.QUIPUX]: 'DSS02.02',
      [Category.TITULACION]: 'DSS02.01',
      [Category.SUFICIENCIA_INFORMATICA]: 'DSS02.01',
      [Category.CORREO_INSTITUCIONAL]: 'DSS02.04',
    };
    result.cobit_control = cobitMap[result.category] || 'DSS02.03';

    result.supervisor_suggestion = result.suggestion;

    const keywordsAhora = ['ahora', 'en este momento', 'estoy en clase', 'estoy dando clase', 'mis estudiantes', 'en el aula'];
    if (isDocente && keywordsAhora.some((kw) => text.includes(kw))) {
      result.urgency = Urgency.URGENTE;
      result.impact = Impact.ALTO;
      result.priority = result.urgency === Urgency.URGENTE && result.impact === Impact.ALTO ? Priority.CRITICO : result.priority;
    }

    if (result.category === Category.ACADEMICO_SIIU && (text.includes('matricula') || text.includes('matricularme'))) {
      result.urgency = Urgency.URGENTE;
      result.impact = Impact.ALTO;
      result.priority = Priority.CRITICO;
    }

    if (result.tipo_solicitud === 'INCIDENTE' && isEstudiante && result.urgency === Urgency.BAJO) {
      result.urgency = Urgency.MEDIO;
    }

    return new Promise<AIClassificationResult>((resolve) => {
      setTimeout(() => resolve(result), 500);
    });
  }

  private getCategoryForProfile(profile: CategoryProfile): string {
    const idx = this.profiles.indexOf(profile);
    const categories = [
      Category.ACCESOS_PEATONAL_VEHICULAR,
      Category.ACADEMICO_SIIU,
      Category.BECAS_EXCELENCIA,
      Category.IDIOMAS,
      Category.PAGINA_WEB_UCE,
      Category.UVIRTUAL,
      Category.QUIPUX,
      Category.TITULACION,
      Category.SUFICIENCIA_INFORMATICA,
      Category.CORREO_INSTITUCIONAL,
    ];
    return categories[idx] || Category.OTROS;
  }
}
