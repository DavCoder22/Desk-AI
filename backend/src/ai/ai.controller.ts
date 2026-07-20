import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiApiClient } from './ai-api-client';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller('ai')
export class AIController {
  private readonly logger = new Logger(AIController.name);

  private readonly systemPrompt = `Eres un asistente de la Mesa de Ayuda de la Universidad Central del Ecuador (UCE). Tu funcion es ayudar a los usuarios (estudiantes, docentes, personal administrativo) a entender:

1. COMO FUNCIONA EL SISTEMA DE TICKETS:
   - Los usuarios crean solicitudes desde el Portal de Usuario.
   - La IA clasifica automaticamente el ticket (categoria, prioridad, urgencia, impacto).
   - Un agente de soporte revisa, procesa y da seguimiento.
   - El usuario puede consultar el estado de su ticket en el portal.
   - El usuario puede cerrar un ticket si quedo satisfecho o reenviarlo si el problema persiste.

2. FLUJO DE ATENCION:
   - Pendiente de Clasificacion -> Abierto -> En Progreso -> Resuelto -> Cerrado.
   - Cada ticket tiene una recomendacion para el usuario generada por IA.

3. QUE HACER SI LA SOLUCION NO AYUDA:
   - Si la recomendacion no resuelve el problema, usa el boton "No solucionado - Reenviar" en el portal. Esto reabrira el ticket para que un agente humano lo revise.
   - Tambien puedes contactar al departamento informatico de tu facultad.
   - Correo de soporte: soporte.tecnico@uce.edu.ec.

4. SISTEMAS QUE SOPORTA LA MESA DE AYUDA:
   - Accesos (peatonal/vehicular): problemas con puertas, torniquetes, carnet.
   - SIIU (Sistema Academico): matricula, notas, kardex, certificados, horarios.
   - UVirtual (Aula Virtual): ingreso, cursos, tareas, cuestionarios.
   - Correo Institucional (Office 365): Outlook, Teams, OneDrive, 2FA.
   - Pagina Web UCE: descargas, navegacion.
   - Quipux: sistema documental, tramites.
   - Titulacion: proceso de titulacion, guia.
   - Suficiencia Informatica e Idiomas: certificados, homologaciones.
   - Becas: excelencia academica, requisitos.

Responde de forma clara, amigable y en espanol. Si el usuario pregunta sobre su ticket especifico, pidele su numero de ticket o nombre para orientarlo mejor. Si no sabes la respuesta exacta, suguiere contactar a soporte.tecnico@uce.edu.ec.`;

  private readonly localResponses: Record<string, string> = {
    'hola': '¡Hola! Soy el asistente virtual de la Mesa de Ayuda UCE. Puedo ayudarte a entender como funciona el sistema de tickets, consultar el estado de tus solicitudes, o guiarte sobre que hacer si un problema persiste. ¿En que puedo ayudarte?',
    'como funciona': 'El sistema de tickets de la UCE funciona asi: 1) Creas una solicitud desde el Portal de Usuario. 2) La IA clasifica automaticamente tu ticket. 3) Un agente de soporte lo revisa y procesa. 4) Puedes ver el estado en tiempo real desde el portal. 5) Si quedas satisfecho, cierras el ticket. Si no, lo reenvias.',
    'ticket': 'Para consultar el estado de tu ticket, ingresa tu nombre en el Portal de Usuario y veras todas tus solicitudes. Cada una muestra su estado actual y una recomendacion personalizada. Si la solucion no te ayuda, usa el boton "No solucionado - Reenviar".',
    'no funciona': 'Si la solucion propuesta no resolvio tu problema: 1) Usa el boton "No solucionado - Reenviar" en el portal para que un agente humano lo revise. 2) Contacta al departamento informatico de tu facultad. 3) Escribe a soporte.tecnico@uce.edu.ec con tu numero de ticket.',
    'contacto': 'Puedes contactar a soporte: Correo: soporte.tecnico@uce.edu.ec. Departamento informatico de tu facultad (horario 08:00-16:00). A traves del Portal de Usuario (reenviando tu ticket).',
    'siiu': 'El SIIU es el Sistema Academico de la UCE. Si tienes problemas con: Matricula: contacta a Secretaria de tu Facultad. Notas/Reportes: contacta a Secretaria de tu Facultad. Certificados: acude a Secretaria General. Clave: usa la opcion de recuperacion con tu correo institucional.',
    'uvirtual': 'La plataforma UVirtual (Moodle) es el aula virtual de la UCE. Si no puedes ingresar: 1) Limpia la cache de tu navegador. 2) Usa Chrome o Edge. 3) Si un curso no aparece, espera 24h desde tu matricula. 4) Escribe a campusvirtual@uce.edu.ec si persiste.',
    'correo': 'El correo institucional es @uce.edu.ec (Office 365). Si tienes problemas: 1) Recupera tu clave en mail.uce.edu.ec. 2) Para 2FA, usa Microsoft Authenticator. 3) Contacta al departamento informatico de tu facultad.',
  };

  constructor(private readonly aiApiClient: AiApiClient) {}

  @Post('chat')
  async chat(@Body() dto: ChatMessageDto) {
    const { message, ticketId, ticketContext } = dto;
    const msg = message.toLowerCase().trim();

    const config = this.aiApiClient.getConfig();

    if (config && this.aiApiClient.isConfigured()) {
      try {
        const userPrompt = `Contexto del ticket: ${ticketContext || 'Ninguno'}\nTicket ID: ${ticketId || 'Nuevo'}\n\nConsulta del usuario: ${message}\n\nResponde en espanol, de forma clara y amigable. Si la consulta es sobre un ticket especifico, orienta al usuario sobre como ver su estado en el portal. Si la solucion no ayuda, suguiere reenviar el ticket o contactar a soporte.`;

        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
            ...(config.apiUrl.includes('openrouter') ? { 'HTTP-Referer': 'https://github.com/incident-manager', 'X-Title': 'DeskAI' } : {}),
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: this.systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return { response: content };
        }
      } catch (err: any) {
        this.logger.warn(`AI chat API fallo: ${err.message}`);
      }
    }

    const localKey = Object.keys(this.localResponses).find(k => msg.includes(k));
    const local = localKey ? this.localResponses[localKey] : `Hola, soy el asistente de la Mesa de Ayuda UCE. Para consultar el estado de tu ticket ingresa tu nombre en el Portal de Usuario. Si necesitas ayuda sobre un sistema en especifico (SIIU, UVirtual, correo, accesos, etc.) o quieres saber como funciona el proceso de atencion, solo preguntame. Tambien puedes contactar a soporte.tecnico@uce.edu.ec.`;

    return { response: local };
  }
}
