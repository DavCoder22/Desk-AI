export enum TicketStatus {
  PENDIENTE_CLASIFICACION = 'PENDIENTE_CLASIFICACION',
  ABIERTO = 'ABIERTO',
  EN_PROGRESO = 'EN_PROGRESO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
}

export enum Priority {
  CRITICO = 'critico',
  ALTO = 'alto',
  MEDIO = 'medio',
  BAJO = 'bajo',
}

export enum Urgency {
  URGENTE = 'urgente',
  ALTO = 'alto',
  MEDIO = 'medio',
  BAJO = 'bajo',
}

export enum Impact {
  ALTO = 'alto',
  MEDIO = 'medio',
  BAJO = 'bajo',
}

export enum TipoUsuario {
  ESTUDIANTE = 'ESTUDIANTE',
  DOCENTE = 'DOCENTE',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
}

export enum Category {
  ACCESOS_PEATONAL_VEHICULAR = 'Accesos Peatonal o Vehicular',
  ACADEMICO_SIIU = 'Académico - Estudiantes (SIIU)',
  BECAS_EXCELENCIA = 'Becas Excelencia Académica',
  IDIOMAS = 'Instituto Académico de Idiomas',
  PAGINA_WEB_UCE = 'Página Web UCE',
  UVIRTUAL = 'Plataforma Educativa Virtual (UVirtual)',
  QUIPUX = 'Quipux',
  TITULACION = 'Sistema de Titulación',
  SUFICIENCIA_INFORMATICA = 'Suficiencia Informática',
  CORREO_INSTITUCIONAL = 'Correo Electrónico Institucional',
  OTROS = 'OTROS',
}

export const Subcategorias: Record<string, string[]> = {
  'Accesos Peatonal o Vehicular': ['Inconvenientes con el acceso', 'Inconvenientes con el carnet'],
  'Académico - Estudiantes (SIIU)': ['Cambio de datos personales', 'Cambio de estado inscrito a matriculado', 'Inconvenientes en el ingreso', 'Inconvenientes en proceso de matriculación', 'Inconvenientes en Encuesta', 'Inconvenientes en visualización de reportes', 'Inconvenientes en simulación', 'Órdenes de cobro caducadas', 'Dudas sobre pérdida de gratuidad'],
  'Becas Excelencia Académica': ['Documentos para contrato de beca', 'Requisitos para ser beneficiario', 'Dudas sobre promedio de calificaciones', 'Dudas sobre no ser beneficiario'],
  'Instituto Académico de Idiomas': ['Certificados para posgrado/externas', 'Homologación de suficiencia', 'Novedades con matrículas', 'Novedades de cursos', 'Novedades en pase de notas al SIIU', 'Validación de conocimientos'],
  'Página Web UCE': ['Error en descargas', 'Guía para encontrar información', 'Inconvenientes al abrir la página'],
  'Plataforma Educativa Virtual (UVirtual)': ['Inconvenientes en el ingreso', 'Inconvenientes en matrícula al aula virtual', 'Inconvenientes en resolución de actividades'],
  'Quipux': ['Actualización de información', 'Inconvenientes en el ingreso', 'Recuperación de clave'],
  'Sistema de Titulación': ['Guía del proceso', 'Inconvenientes en el ingreso', 'Problemas en la notificación'],
  'Suficiencia Informática': ['Cambio de estado inscrito a matriculado', 'Inconvenientes con cronograma', 'Inconvenientes en proceso de matrículas', 'Inconvenientes en valor del pago', 'Inconvenientes en visualización de calificaciones', 'Inconvenientes en visualización de paralelos', 'Inconvenientes en visualización del módulo'],
  'Correo Electrónico Institucional': ['Configuración de la cuenta', 'Guía de utilización', 'Inconvenientes con 2FA', 'Inconvenientes con Office 365 (OneDrive/Teams)', 'Inconvenientes en el ingreso a la cuenta', 'Inconvenientes en envío y recepción'],
};

export const AdjuntosRequeridos: Record<string, string> = {
  'Cambio de datos personales': 'Copia de cédula',
  'Cambio de estado inscrito a matriculado': 'Voucher de pago',
  'Certificados para posgrado/externas': 'PDF único: solicitud dirigida al Director, registro Senescyt/título, cédula',
  'Homologación de suficiencia': 'PDF único: solicitud, diploma notariado (vigencia 5 años), récord académico, matrícula UCE, cédula/pasaporte',
  'Validación de conocimientos': 'PDF único: solicitud, récord académico (vigencia 5 años), matrícula UCE, cédula/pasaporte',
};

export enum TipoSolicitud {
  INCIDENTE = 'INCIDENTE',
  SOLICITUD_SERVICIO = 'SOLICITUD_SERVICIO',
}
