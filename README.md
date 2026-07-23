# DeskAI — Sistema de Gestión de Incidentes Inteligente

**Universidad Central del Ecuador**  
**Estudiante:** David Malquin ([@DavCoder22](https://github.com/DavCoder22))  
**Materia:** ESTRATEGIA, GESTIÓN Y ADQUISICIÓN EN LOS SISTEMAS  
**Repositorio:** [github.com/DavCoder22/Desk-AI](https://github.com/DavCoder22/Desk-AI)

---

## API de DeskAI

> **API REST desplegada en Render (gratuito):**  
> 🔗 **https://desk-ai-577d.onrender.com**

La API está disponible las 24 horas y se actualiza automáticamente al hacer push al repositorio. Puedes probar el CRUD completo directamente desde esa URL o con cualquier cliente HTTP (Postman, curl, etc.).

### Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Estado del servidor y base de datos |
| `GET` | `/api/tickets` | Listar todos los tickets |
| `GET` | `/api/tickets/:id` | Obtener un ticket por ID |
| `POST` | `/api/tickets` | Crear un nuevo ticket |
| `PATCH` | `/api/tickets/:id/user-action` | Acción de usuario (CERRAR/REENVIAR) |
| `GET` | `/api/ai/kpis` | KPIs del dashboard |
| `POST` | `/api/ai/chat` | Chat con asistente IA |
| `POST` | `/api/feedback` | Registrar feedback de clasificación IA |

### Ejemplo con curl

```bash
# Verificar salud de la API
curl https://desk-ai-577d.onrender.com/api/health

# Listar tickets
curl https://desk-ai-577d.onrender.com/api/tickets

# Crear ticket
curl -X POST https://desk-ai-577d.onrender.com/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Problema de prueba",
    "description": "Test de conexión a la API",
    "requester": "David Malquin",
    "tipo_usuario": "ESTUDIANTE",
    "category": "Académico - Estudiantes (SIIU)"
  }'
```

---

## Descripción

DeskAI es un prototipo web inteligente de gestión de incidentes y solicitudes de servicio para la Mesa de Ayuda de la Universidad Central del Ecuador. Integra los marcos de referencia **ITIL**, **COBIT DSS02**, **TCO** y **BSC**, y utiliza inteligencia artificial (local o API externa) para clasificar tickets automáticamente y generar recomendaciones.

---

## Funcionalidades principales

### Portal de Usuario (`/portal`)
- Ver todas tus solicitudes de soporte en tarjetas interactivas (sin necesidad de escribir tu nombre).
- Filtrar solicitudes por nombre de solicitante.
- Crear nuevas solicitudes con clasificación automática por IA.
- Ver detalle de cada ticket: descripción, estado, prioridad, categoría y recomendación personalizada.
- Cerrar ticket si la solución fue útil o reenviarlo si el problema persiste.
- Asistente virtual IA flotante para resolver dudas.

### Panel de Administración (`/dashboard`)
- Dashboard con KPIs: tickets de hoy, MTTR, costo promedio y precisión de IA.
- Gestión de incidentes (ITIL).
- Transiciones de estado: *Pendiente → Abierto → En Progreso → Resuelto → Cerrado*.
- Métricas de desempeño: MTTR/Resolución, Costos (TCO), Cumplimiento COBIT DSS02, Precisión de IA.

### Roles
- **Admin:** acceso a Dashboard, Incidentes, Resolución, Costos, COBIT y Métricas IA.
- **Usuario:** acceso al Portal de Usuario para crear y consultar sus tickets.

Puedes cambiar de rol con el botón de la esquina superior derecha (**Admin** / **Usuario**).

---

## Arquitectura

```text
Frontend (Next.js)  →  Backend (NestJS)  →  SQLite (Prisma)
   localhost:3001          localhost:3000     backend/prisma/dev.db
```

| Capa       | Tecnología                           |
|------------|--------------------------------------|
| Frontend   | Next.js 14, React 18, Tailwind CSS   |
| Backend    | NestJS 10, TypeScript                |
| Base de datos | SQLite con Prisma ORM             |
| IA         | Clasificador local o API externa (OpenRouter/Groq) |
| Gráficos   | Recharts                             |

---

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior

No se requiere PostgreSQL; el proyecto usa **SQLite** para facilitar las pruebas locales.

---

## Cómo ejecutar el proyecto

Opción recomendada en Windows: usa los archivos `.bat` incluidos.

### Opción 1: archivos `.bat` (recomendado)

1. Abre una terminal CMD en la carpeta raíz del proyecto.
2. Ejecuta el backend:
   ```cmd
   backend.bat
   ```
   El script:
   - Instala dependencias si faltan.
   - Genera el cliente Prisma.
   - Crea / regenera la base de datos SQLite.
   - Siembra 10 tickets de ejemplo.
   - Inicia el backend en `http://localhost:3000`.
3. Abre **otra** terminal CMD en la misma carpeta.
4. Ejecuta el frontend:
   ```cmd
   frontend.bat
   ```
   El script:
   - Instala dependencias si faltan.
   - Inicia el frontend en `http://localhost:3001`.
5. Abre en tu navegador: `http://localhost:3001/portal`

### Opción 2: comandos manuales

Backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npx ts-node seed-standalone.ts
npm run start:dev
```

Frontend (en otra terminal):
```bash
cd frontend
npm install
npm run dev
```

Después abre `http://localhost:3001`.

### Opción 3: inicio limpio (reinstala todo)

```cmd
clean-start-all.bat
```

---

## Guía rápida del prototipo web

| Vista | Ruta | Para qué sirve |
|-------|------|----------------|
| **Portal de Usuario** | `/portal` | Crear y revisar tus solicitudes |
| **Dashboard** | `/dashboard` | KPIs generales para administradores |
| **Incidentes** | `/tickets` | Listado y administración de tickets |
| **Resolución** | `/resolucion` | Métricas MTTR por prioridad y categoría |
| **Costos** | `/costos` | Análisis de costos TCO |
| **COBIT** | `/cobit` | Cumplimiento de objetivos DSS02 |
| **Métrica IA** | `/metrica-ia` | Precisión del clasificador IA |

### Crear una solicitud
1. Ve a `http://localhost:3001/portal`.
2. Haz clic en **Nueva Solicitud**.
3. Completa título, descripción, tipo de usuario, facultad/carrera (opcional) y tu nombre.
4. El sistema clasifica automáticamente el ticket.

### Consultar el estado
- En `/portal` aparecen todos los tickets de ejemplo.
- Escribe un nombre en el filtro para buscar tickets específicos.
- Haz clic en una tarjeta para ver el detalle completo.

### Cambiar de rol
- Usa el botón **Admin** / **Usuario** en la esquina superior derecha.
- El Admin accede al dashboard y gestión; el Usuario va directamente al portal.

---

## Configuración de IA (opcional)

Por defecto el sistema usa un **clasificador local por keywords**. Para usar un modelo remoto (OpenRouter):

```bash
cd backend
node setup-ai.js
```

Introduce tu API key cuando se solicite. El script detecta automáticamente el proveedor y guarda la configuración en `backend/ai-config.json`.

---

## Scripts útiles

| Script | Descripción |
|--------|-------------|
| `backend.bat` | Inicia el backend completo (dependencias, Prisma, seed, servidor) |
| `frontend.bat` | Inicia el frontend en modo desarrollo |
| `seed.bat` | Regenera Prisma y siembra tickets de ejemplo |
| `clean-start-all.bat` | Limpieza total: borra caches, reinstala, compila e inicia todo |
| `kill-all.bat` | Mata procesos Node/PowerShell atascados |

---

## Estructura del repositorio

```text
Desk-AI/
├── backend/              # API NestJS + Prisma + IA
│   ├── prisma/           # Esquema de SQLite
│   ├── src/              # Código fuente del backend
│   └── seed-standalone.ts # Script para sembrar datos de ejemplo
├── frontend/             # Aplicación Next.js
│   └── src/
│       ├── app/          # Páginas (portal, dashboard, tickets, etc.)
│       └── components/   # Componentes reutilizables
├── INFORME-DESKAI.md     # Informe académico
└── README.md             # Este archivo
```

---

## Estructura del repositorio

```text
Desk-AI/
├── backend/              # API NestJS + Prisma + IA
│   ├── prisma/           # Esquemas de base de datos
│   │   ├── schema.prisma       # SQLite (desarrollo local)
│   │   └── render-schema.prisma # PostgreSQL (Render)
│   ├── src/              # Código fuente del backend
│   └── seed-standalone.ts # Script para sembrar datos de ejemplo
├── frontend/             # Aplicación Next.js
│   └── src/
│       ├── app/          # Páginas (portal, dashboard, tickets, etc.)
│       └── components/   # Componentes reutilizables
├── render.yaml           # Blueprint de despliegue en Render
├── INFORME-DESKAI.md     # Informe académico
└── README.md             # Este archivo
```

---

## Despliegue en Render (API)

La API ya está desplegada gratuitamente en Render: **https://desk-ai-577d.onrender.com**

### Configuración del servicio en Render

El servicio usa **Render Blueprint** (`render.yaml`). Para recrear o configurar:

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. **New** → **Blueprint** → selecciona el repositorio `DavCoder22/Desk-AI`
3. Render detecta `render.yaml` y crea automáticamente:
   - Base de datos PostgreSQL gratuita (`deskai-db`)
   - Servicio web (`deskai-api`)
4. Espera ~3-5 min para el primer build

### Configuración manual (si ya tienes el servicio creado)

En tu servicio existente, ve a **Settings** y configura:

- **Build Command:**
  ```
  cd backend && cp prisma/render-schema.prisma prisma/schema.prisma && npm install && npx prisma generate && npx nest build
  ```
- **Start Command:**
  ```
  cd backend && npx prisma db push --accept-data-loss --skip-generate && npx ts-node seed-standalone.ts && node dist/main
  ```
- **Environment Variables:**
  - `DATABASE_URL` = URL de tu base de datos PostgreSQL (desde Render → Databases → Internal Database URL)
  - `NODE_ENV` = `production`
  - `PORT` = `10000`

> **Nota:** Render free tier se duerme tras 15 min de inactivity. El primer request tarda ~30s en despertar.

---

## Autoría

**David Malquin** — [@DavCoder22](https://github.com/DavCoder22)  
Proyecto académico — Universidad Central del Ecuador
