# DeskAI — Sistema de Gestión de Incidentes Inteligente

**Universidad Central del Ecuador**  
**Estudiante:** David Malquin ([@DavCoder22](https://github.com/DavCoder22))  
**Materia:** ESTRATEGIA, GESTIÓN Y ADQUISICIÓN EN LOS SISTEMAS  

---

## Descripción

DeskAI es un sistema inteligente de gestión de incidentes y solicitudes de servicio diseñado para la Mesa de Ayuda de la Universidad Central del Ecuador. Integra los marcos de referencia **ITIL** (Gestión de Incidentes), **COBIT DSS02** (Gestión de Servicios), **TCO** (Costo Total de Propiedad) y **BSC** (Balanced Scorecard) para ofrecer una solución completa de soporte TI.

El sistema utiliza **inteligencia artificial** para clasificar automáticamente los tickets, recomendar procedimientos de resolución y proporcionar sugerencias tanto para agentes de soporte como para usuarios finales.

---

## Funcionalidades

### Portal de Usuario
- Creación de solicitudes con clasificación automática por IA
- Consulta de estado de tickets en tiempo real
- Vista detallada de cada ticket con recomendaciones personalizadas
- Acciones: cerrar ticket (solución aceptada) o reenviar (solución no funcionó)
- Asistente virtual IA contextual para resolver dudas sobre el sistema

### Panel de Administración
- Dashboard con KPIs: tickets hoy, MTTR, costo promedio, precisión de IA
- Gestión completa de incidentes con transiciones de estado (ITIL)
- Drawer de detalle con clasificación ITIL, sugerencias de resolución y métricas COBIT
- Transiciones: Pendiente → Abierto → En Progreso → Resuelto → Cerrado

### Analítica y Métricas
- **MTTR** (Mean Time To Resolve) por prioridad y categoría
- **TCO** (Total Cost of Ownership): desglose costo humano vs. IA por ticket
- **COBIT DSS02**: dashboard de cumplimiento de 5 objetivos de control
- **Precisión de IA**: métricas de acierto por categoría con alertas visuales

### Inteligencia Artificial
- Clasificación automática en 10 categorías del catálogo UCE
- Perfiles de palabras clave con scoring local (fallback)
- Integración con API externa (OpenAI / OpenRouter) cuando está configurada
- Generación de recomendaciones estructuradas:
  - **Agente:** procedimiento, escalamiento, referencia
  - **Usuario:** qué hacer, dónde acudir, documentos necesarios
  - **Supervisor:** nivel de escalamiento, prioridad COBIT, acciones de mejora

### Experiencia de Usuario
- Diseño responsive (móvil y escritorio)
- Modo oscuro / claro
- Roles de usuario (Admin / Usuario) con navegación adaptativa
- Validaciones robustas en todos los formularios
- Asistente virtual flotante contextual

---

## Arquitectura

```
┌─────────────────────┐      ┌──────────────────────┐
│   Frontend (Next.js)│ ───→ │  Backend (NestJS)     │
│   Puerto 3001       │      │  Puerto 3000          │
│                     │      │                       │
│   - Portal Usuario  │ API  │  - Tickets API        │
│   - Dashboard Admin │      │  - Clasificación IA   │
│   - Métricas        │      │  - Feedback Loop      │
│   - Asistente IA    │      │  - Health Check       │
└─────────────────────┘      └──────────┬────────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   PostgreSQL        │
                              │   (Prisma ORM)      │
                              └───────────────────┘
```

---

## Stack Tecnológico

| Capa       | Tecnología                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14, React 18, Tailwind CSS  |
| Backend    | NestJS 10, TypeScript               |
| Base de datos | PostgreSQL + Prisma ORM            |
| IA         | Clasificador local (keywords) + API externa (OpenAI/OpenRouter) |
| Charts     | Recharts                            |
| Notificaciones | react-hot-toast                  |

---

## Cobertura del Trabajo

Este proyecto cubre los siguientes aspectos de la materia **ESTRATEGIA, GESTIÓN Y ADQUISICIÓN EN LOS SISTEMAS**:

1. **ITIL — Gestión de Incidentes**
   - Ciclo de vida completo del incidente (detección, registro, clasificación, diagnóstico, resolución, cierre)
   - Matriz de prioridad (Impacto × Urgencia)
   - Categorización y subcategorización según catálogo UCE
   - SLA/OLAs implícitos en las transiciones de estado

2. **COBIT DSS02 — Gestión de Solicitudes y Servicios**
   - DSS02.01: Definir esquema de clasificación de incidentes
   - DSS02.02: Registrar y priorizar incidentes
   - DSS02.03: Diagnosticar y escalar incidentes
   - DSS02.04: Resolver y recuperar el servicio
   - DSS02.05: Cerrar incidentes y evaluar
   - Dashboard de cumplimiento con indicadores por objetivo de control

3. **TCO — Costo Total de Propiedad**
   - Costeo por ticket: costo humano ($15/hora) + costo IA ($0.05/ticket)
   - Desglose por ticket y agregado
   - Proyección de costo anual estimado

4. **BSC — Balanced Scorecard**
   - MTTR como KPI principal de eficiencia
   - Precisión de IA como indicador de calidad
   - Distribución de prioridades como métrica operativa
   - Tasa de resolución como indicador de cumplimiento

5. **Inteligencia Artificial aplicada a Gestión de Servicios**
   - Clasificación automática con reglas de negocio UCE
   - Recomendaciones contextuales estructuradas
   - Asistente virtual para usuarios finales
   - Feedback loop para mejora continua de precisión
   - Sistema de alertas cuando la precisión cae bajo 70%

---

## Instalación y Despliegue

### Requisitos
- Node.js 18+
- PostgreSQL

### Desarrollo

```bash
# Backend
cd backend
npm install
npm run start:dev    # http://localhost:3000

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:3001
```

### Producción

```bash
# Build ambos proyectos
npm run build

# O usando el script de despliegue
.\deploy.ps1 -Mode all
```

Variables de entorno (`.env` en backend):

```
DATABASE_URL="postgresql://..."
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tudominio.com
```

---

## Licencia

Proyecto académico — Universidad Central del Ecuador  
**Repositorio:** [github.com/DavCoder22/Desk-AI](https://github.com/DavCoder22/Desk-AI)  
**Autor:** [David Malquin (DavCoder22)](https://github.com/DavCoder22)
