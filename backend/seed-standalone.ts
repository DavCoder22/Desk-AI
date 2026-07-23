import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.ticket.count();
  if (count > 0) {
    console.log(`Ya existen ${count} tickets. Saltando seed.`);
    return;
  }

  console.log('Sembrando tickets de ejemplo...');

  const tickets = [
    {
      title: 'No puedo ingresar al SIIU',
      description: 'Hola, soy estudiante de la Facultad de Ciencias Exactas. Desde ayer no puedo ingresar al SIIU con mi usuario y contraseña. Me sale "usuario no encontrado".',
      category: 'Académico - Estudiantes (SIIU)',
      subcategoria: 'Inconvenientes en el ingreso',
      tipo_solicitud: 'INCIDENTE',
      priority: 'alto',
      urgency: 'alto',
      impact: 'medio',
      status: 'ABIERTO',
      requester: 'Carlos Pérez',
      tipo_usuario: 'ESTUDIANTE',
      facultad_o_area: 'Ciencias Exactas',
      carrera: 'Sistemas de la Información',
      ai_suggestion: '**PROCEDIMIENTO** | 1) Verificar credenciales en SIIU. 2) Revisar estado de cuenta. 3) Contactar a secretaría. | **ESCALAMIENTO** | Si no se resuelve en 24h, escalar a DTIC. | **REFERENCIA** | KB-SIIU-001',
      user_recommendation: '**QUE HACER** | Intenta recuperar tu contraseña desde la página de inicio del SIIU. | **DONDE ACUDIR** | Secretaría de tu facultad. | **DOCUMENTOS** | Cédula de identidad.',
      itil_category: 'Gestión de Incidentes',
      cobit_control: 'DSS02.03',
    },
    {
      title: 'Problemas con acceso a UVirtual',
      description: 'Docente de Filosofía. No puedo acceder al aula virtual UVirtual. Me sale error 503 al cargar la página.',
      category: 'Plataforma Educativa Virtual (UVirtual)',
      subcategoria: 'Inconvenientes en el ingreso',
      tipo_solicitud: 'INCIDENTE',
      priority: 'critico',
      urgency: 'urgente',
      impact: 'alto',
      status: 'EN_PROGRESO',
      requester: 'María Gómez',
      tipo_usuario: 'DOCENTE',
      facultad_o_area: 'Filosofía',
      carrera: null,
      ai_suggestion: '**PROCEDIMIENTO** | 1) Verificar estado del servidor UVirtual. 2) Limpiar caché del navegador. 3) Probar con otro navegador. | **ESCALAMIENTO** | Error 503 indica problema de servidor, escalar a DTIC. | **REFERENCIA** | KB-UVirtual-002',
      user_recommendation: '**QUE HACER** | Limpia la caché de tu navegador e intenta con Chrome o Edge. | **DONDE ACUDIR** | campusvirtual@uce.edu.ec | **DOCUMENTOS** | Captura de pantalla del error.',
      itil_category: 'Gestión de Incidentes',
      cobit_control: 'DSS02.04',
    },
    {
      title: 'Solicitud de certificado de notas',
      description: 'Necesito un certificado de notas para postular a una beca. Ya realicé el trámite en secretaría pero no sé cómo descargarlo del SIIU.',
      category: 'Académico - Estudiantes (SIIU)',
      subcategoria: 'Certificados para posgrado/externas',
      tipo_solicitud: 'SOLICITUD_SERVICIO',
      priority: 'medio',
      urgency: 'medio',
      impact: 'bajo',
      status: 'RESUELTO',
      requester: 'Ana López',
      tipo_usuario: 'ESTUDIANTE',
      facultad_o_area: 'Ciencias Médicas',
      carrera: 'Medicina',
      ai_suggestion: '**PROCEDIMIENTO** | 1) Ingresar al SIIU. 2) Ir a Reportes > Certificados. 3) Descargar PDF. | **ESCALAMIENTO** | Si no aparece, contactar a secretaría. | **REFERENCIA** | KB-SIIU-003',
      user_recommendation: '**QUE HACER** | Ingresa al SIIU, ve a Reportes y selecciona Certificados. | **DONDE ACUDIR** | Secretaría de tu facultad. | **DOCUMENTOS** | Ninguno.',
      itil_category: 'Gestión de Solicitudes de Servicio',
      cobit_control: 'DSS02.01',
      resolution_time_minutes: 120,
    },
    {
      title: 'Correo institucional no envía mensajes',
      description: 'Mi correo @uce.edu.ec no envía mensajes. Los correos se quedan en la bandeja de salida. Soy personal administrativo.',
      category: 'Correo Electrónico Institucional',
      subcategoria: 'Inconvenientes en envío y recepción',
      tipo_solicitud: 'INCIDENTE',
      priority: 'alto',
      urgency: 'alto',
      impact: 'alto',
      status: 'ABIERTO',
      requester: 'Pedro Martínez',
      tipo_usuario: 'ADMINISTRATIVO',
      facultad_o_area: 'Rectorado',
      carrera: null,
      ai_suggestion: '**PROCEDIMIENTO** | 1) Verificar configuración SMTP. 2) Revisar cuota de almacenamiento. | **ESCALAMIENTO** | Si afecta a varios usuarios, escalar a DTIC. | **REFERENCIA** | KB-Correo-001',
      user_recommendation: '**QUE HACER** | Revisa tu cuota en Outlook Web. Si está llena, elimina correos antiguos. | **DONDE ACUDIR** | Departamento informático de tu facultad. | **DOCUMENTOS** | Captura del error.',
      itil_category: 'Gestión de Incidentes',
      cobit_control: 'DSS02.04',
    },
    {
      title: 'Duda sobre proceso de titulación',
      description: 'Estoy en mi último semestre. ¿Qué documentos necesito para titularme? ¿Dónde presento la solicitud?',
      category: 'Sistema de Titulación',
      subcategoria: 'Guía del proceso',
      tipo_solicitud: 'SOLICITUD_SERVICIO',
      priority: 'medio',
      urgency: 'bajo',
      impact: 'bajo',
      status: 'CERRADO',
      requester: 'Laura Sánchez',
      tipo_usuario: 'ESTUDIANTE',
      facultad_o_area: 'Jurisprudencia',
      carrera: 'Derecho',
      ai_suggestion: '**PROCEDIMIENTO** | 1) Revisar guía en la web UCE. 2) Acercarse a la unidad de titulación. | **ESCALAMIENTO** | Derivar a Coordinación de Titulación. | **REFERENCIA** | KB-Titulacion-001',
      user_recommendation: '**QUE HACER** | Revisa la guía de titulación en la página web de la UCE. | **DONDE ACUDIR** | Unidad de Titulación de tu facultad. | **DOCUMENTOS** | Cédula, certificado de notas.',
      itil_category: 'Gestión de Solicitudes de Servicio',
      cobit_control: 'DSS02.01',
      resolution_time_minutes: 45,
    },
    {
      title: 'Torniquete de acceso no funciona',
      description: 'El torniquete de la entrada principal de la Facultad de Ingeniería no funciona. Los estudiantes no pueden ingresar.',
      category: 'Accesos Peatonal o Vehicular',
      subcategoria: 'Inconvenientes con el acceso',
      tipo_solicitud: 'INCIDENTE',
      priority: 'critico',
      urgency: 'urgente',
      impact: 'alto',
      status: 'EN_PROGRESO',
      requester: 'Juan Rodríguez',
      tipo_usuario: 'DOCENTE',
      facultad_o_area: 'Ingeniería',
      carrera: null,
      ai_suggestion: '**PROCEDIMIENTO** | 1) Contactar a seguridad. 2) Verificar sistema de control de accesos. | **ESCALAMIENTO** | Escalar a DTIC como incidente crítico. | **REFERENCIA** | KB-Accesos-001',
      user_recommendation: '**QUE HACER** | Usa entradas alternativas mientras se repara. | **DONDE ACUDIR** | Unidad de Seguridad del campus. | **DOCUMENTOS** | Ninguno.',
      itil_category: 'Gestión de Incidentes',
      cobit_control: 'DSS02.04',
    },
    {
      title: 'Error en mi nombre en SIIU',
      description: 'Mi nombre está mal escrito en el SIIU. Aparece "Luis" pero es "Luís". En secretaría me dijeron que haga un trámite en línea.',
      category: 'Académico - Estudiantes (SIIU)',
      subcategoria: 'Cambio de datos personales',
      tipo_solicitud: 'SOLICITUD_SERVICIO',
      priority: 'medio',
      urgency: 'medio',
      impact: 'bajo',
      status: 'ABIERTO',
      requester: 'Luís Fernández',
      tipo_usuario: 'ESTUDIANTE',
      facultad_o_area: 'Ciencias Exactas',
      carrera: 'Sistemas de la Información',
      ai_suggestion: '**PROCEDIMIENTO** | 1) Ingresar al SIIU > Datos Personales. 2) Solicitar corrección. 3) Adjuntar cédula. | **ESCALAMIENTO** | Derivar a Secretaría General. | **REFERENCIA** | KB-SIIU-005',
      user_recommendation: '**QUE HACER** | Ingresa al SIIU, ve a Datos Personales y solicita la corrección. | **DONDE ACUDIR** | Secretaría General si el sistema no lo permite. | **DOCUMENTOS** | Cédula de identidad.',
      itil_category: 'Gestión de Solicitudes de Servicio',
      cobit_control: 'DSS02.01',
    },
    {
      title: 'Contrato de Beca Excelencia',
      description: 'Gané la Beca de Excelencia Académica pero no encuentro dónde firmar el contrato. El enlace del correo no funciona.',
      category: 'Becas Excelencia Académica',
      subcategoria: 'Documentos para contrato de beca',
      tipo_solicitud: 'SOLICITUD_SERVICIO',
      priority: 'alto',
      urgency: 'alto',
      impact: 'medio',
      status: 'PENDIENTE_CLASIFICACION',
      requester: 'Diana Torres',
      tipo_usuario: 'ESTUDIANTE',
      facultad_o_area: 'Arquitectura',
      carrera: 'Arquitectura',
      ai_suggestion: '**PROCEDIMIENTO** | 1) Revisar correo institucional. 2) Contactar a Bienestar Estudiantil. | **REFERENCIA** | KB-Becas-001',
      user_recommendation: '**QUE HACER** | Revisa tu correo institucional. Si el enlace no funciona, contacta a Bienestar Estudiantil. | **DONDE ACUDIR** | Unidad de Bienestar Estudiantil. | **DOCUMENTOS** | Cédula, comprobante de beca.',
      itil_category: 'Gestión de Solicitudes de Servicio',
      cobit_control: 'DSS02.01',
    },
    {
      title: 'Suficiencia Informática - sin paralelo',
      description: 'Me matriculé en Suficiencia Informática pero no aparece mi paralelo. Ya pagué. Necesito saber horario y aula.',
      category: 'Suficiencia Informática',
      subcategoria: 'Inconvenientes en visualización de paralelos',
      tipo_solicitud: 'INCIDENTE',
      priority: 'alto',
      urgency: 'urgente',
      impact: 'medio',
      status: 'ABIERTO',
      requester: 'Gabriel Herrera',
      tipo_usuario: 'ESTUDIANTE',
      facultad_o_area: 'Ciencias Exactas',
      carrera: 'Sistemas de la Información',
      ai_suggestion: '**PROCEDIMIENTO** | 1) Verificar matrícula en SIIU. 2) Revisar estado del pago. | **ESCALAMIENTO** | Escalar a Coordinación de Suficiencia. | **REFERENCIA** | KB-Suficiencia-001',
      user_recommendation: '**QUE HACER** | Verifica en SIIU que tu matrícula esté activa. | **DONDE ACUDIR** | Unidad de Suficiencia Informática. | **DOCUMENTOS** | Comprobante de pago.',
      itil_category: 'Gestión de Incidentes',
      cobit_control: 'DSS02.03',
    },
    {
      title: 'Página UCE no carga en Firefox',
      description: 'www.uce.edu.ec no carga en Firefox (pantalla en blanco). En Chrome funciona. Ya limpié caché.',
      category: 'Página Web UCE',
      subcategoria: 'Inconvenientes al abrir la página',
      tipo_solicitud: 'INCIDENTE',
      priority: 'bajo',
      urgency: 'bajo',
      impact: 'bajo',
      status: 'RESUELTO',
      requester: 'Roberto Campos',
      tipo_usuario: 'ESTUDIANTE',
      facultad_o_area: 'Ciencias Exactas',
      carrera: 'Sistemas de la Información',
      ai_suggestion: '**PROCEDIMIENTO** | 1) Verificar compatibilidad del navegador. 2) Usar Chrome/Edge. | **REFERENCIA** | KB-Web-001',
      user_recommendation: '**QUE HACER** | Usa Chrome o Edge para acceder a la página. | **DONDE ACUDIR** | No requiere. | **DOCUMENTOS** | Ninguno.',
      itil_category: 'Gestión de Incidentes',
      cobit_control: 'DSS02.03',
      resolution_time_minutes: 30,
    },
  ];

  for (const t of tickets) {
    const { resolution_time_minutes, ...data } = t;
    const created = await prisma.ticket.create({
      data: {
        ...data,
        cost_human: resolution_time_minutes ? parseFloat(((resolution_time_minutes / 60) * 15).toFixed(2)) : 0,
        cost_ia: 0.05,
        feedback_ia: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        ticket_id: created.id,
        action: 'CREACION',
        details: { seed: true, categoria: t.category },
      },
    });

    console.log(`  ✓ ${created.id.slice(0, 8)}… ${t.title}`);
  }

  const feedbackData = [
    { categoria_sugerida_por_ia: 'Académico - Estudiantes (SIIU)', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Clasificación correcta' },
    { categoria_sugerida_por_ia: 'Académico - Estudiantes (SIIU)', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Bien clasificado' },
    { categoria_sugerida_por_ia: 'Académico - Estudiantes (SIIU)', clasificacion_correcta: true, sugerencia_util: false, comentarios: 'Clasificación OK pero sugerencia no aplicable' },
    { categoria_sugerida_por_ia: 'Plataforma Educativa Virtual (UVirtual)', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Correcto' },
    { categoria_sugerida_por_ia: 'Plataforma Educativa Virtual (UVirtual)', clasificacion_correcta: false, sugerencia_util: false, comentarios: 'Debería ser OTROS' },
    { categoria_sugerida_por_ia: 'Correo Electrónico Institucional', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Perfecto' },
    { categoria_sugerida_por_ia: 'Correo Electrónico Institucional', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'OK' },
    { categoria_sugerida_por_ia: 'Accesos Peatonal o Vehicular', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Correcto' },
    { categoria_sugerida_por_ia: 'Becas Excelencia Académica', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Bien' },
    { categoria_sugerida_por_ia: 'Becas Excelencia Académica', clasificacion_correcta: false, sugerencia_util: false, comentarios: 'Categoría incorrecta' },
    { categoria_sugerida_por_ia: 'Suficiencia Informática', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Correcto' },
    { categoria_sugerida_por_ia: 'Sistema de Titulación', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'OK' },
    { categoria_sugerida_por_ia: 'Página Web UCE', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Correcto' },
    { categoria_sugerida_por_ia: 'Académico - Estudiantes (SIIU)', clasificacion_correcta: true, sugerencia_util: true, comentarios: 'Bien detectado' },
  ];

  const allTickets = await prisma.ticket.findMany();
  for (let i = 0; i < feedbackData.length; i++) {
    const fb = feedbackData[i];
    const ticketIndex = i % allTickets.length;
    await prisma.iAFeedback.create({
      data: {
        ticket_id: allTickets[ticketIndex].id,
        categoria_sugerida_por_ia: fb.categoria_sugerida_por_ia,
        clasificacion_correcta: fb.clasificacion_correcta,
        sugerencia_util: fb.sugerencia_util,
        comentarios: fb.comentarios,
      },
    });
  }

  console.log(`\nSeed completado: ${tickets.length} tickets + ${feedbackData.length} feedbacks creados.`);
}

main()
  .catch((e) => {
    console.error('ERROR:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
