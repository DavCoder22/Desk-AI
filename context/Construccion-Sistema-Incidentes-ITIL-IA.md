# Construcción por Fases: Sistema de Gestión de Incidentes Inteligente (ITIL + IA)

Este documento reúne una serie de **prompts detallados y ordenados** que te permitirán construir el proyecto completo con ayuda de una IA generativa. Cada fase se apoya en la anterior, comenzando por el backend, siguiendo con el frontend y finalizando con la dockerización y las pruebas.

## Arquitectura de Referencia (Mejorada)

El siguiente diagrama PlantUML muestra la arquitectura final que se va a implementar. Sirve de guía visual durante todo el proceso.

~~~plantuml
@startuml
skinparam componentStyle uml2

package "Cliente (SPA React/Next.js)" {
  [Dashboard Operativo\n(KPIs, MTTR, Costos)] as FE_Dash
  [Gestión de Tickets\n(Lista, Kanban, Detalle)] as FE_Tickets
}

package "Servidor Backend (NestJS - Modular)" {
  [API Gateway / Controladores] as API

  package "Módulo de Tickets (ITIL)" {
    [Servicio de Incidentes] as IncSvc
    [Repositorio de Tickets] as TicketRepo
    [Repositorio de Logs (Auditoría)] as LogRepo
    [Unidad de Trabajo ACID] as UoW
  }

  package "Módulo de IA (Clasificación y Sugerencias)" {
    [Servicio de Clasificación] as ClassSvc
    [Servicio de Sugerencias] as SugSvc
    [Prompt Manager (versionado)] as PromptMgr
    [Simulacro OpenAI (o API real)] as OpenAIClient
  }

  package "Módulo de Feedback y Mejora Continua" {
    [Servicio de Feedback] as FeedbackSvc
    [Repositorio Feedback] as FeedbackRepo
    [Calculador de Precisión] as PrecisionCalc
  }

  package "Módulo de KPIs y Costos (BSC + TCO)" {
    [Servicio de Métricas] as MetricSvc
    [Calculador MTTR] as MTTRCalc
    [Calculador Costo por Ticket] as CostCalc
    [Repositorio de KPIs (vistas materializadas)] as KpiRepo
  }

  package "Notificaciones y Eventos" {
    [Servicio de Alertas] as AlertSvc
    [Event Bus (Async)] as EventBus
  }
}

database "PostgreSQL" {
  [Tablas: tickets, logs, feedback, kpi_cache] as DB
}

node "Motor de IA Externo (OpenAI)" {
  [API OpenAI GPT-4] as OpenAI
}

' --- Flujos principales ---

' 1. Creación de ticket con clasificación atómica
FE_Tickets -down-> API : POST /tickets
API -down-> IncSvc : crearTicketConIA(datos)
IncSvc -down-> UoW : startTransaction()
UoW -down-> TicketRepo : INSERT ticket (estado: PENDIENTE_CLASIFICACION)
IncSvc -down-> ClassSvc : clasificar(ticket)
ClassSvc -down-> PromptMgr : obtenerPrompt(v2)
ClassSvc -down-> OpenAIClient : enviar prompt
OpenAIClient -down-> OpenAI : HTTP POST (classification)
OpenAI -up-> OpenAIClient : JSON {categoria, prioridad, urgencia, sugerencia}
ClassSvc -up-> IncSvc : resultado clasificación
IncSvc -down-> UoW : actualizar ticket con IA (estado: ABIERTO)
UoW -down-> TicketRepo : UPDATE
IncSvc -down-> EventBus : emitir Evento "TicketCreado"
UoW -down-> LogRepo : INSERT log
UoW -up-> DB : COMMIT (éxito) o ROLLBACK

' 2. Feedback loop para precisión ≥70%
FE_Tickets -down-> API : POST /feedback (ticketId, correccion_humano)
API -down-> FeedbackSvc : registrarFeedback()
FeedbackSvc -down-> FeedbackRepo : INSERT feedback
FeedbackSvc -down-> PrecisionCalc : recalcularPrecision(categoria)
PrecisionCalc -down-> DB : actualizar kpi_cache (accuracy_categoria)
' Si precisión baja, se alerta
FeedbackSvc -down-> AlertSvc : enviarAlerta si precisión < 0.7

' 3. Cálculo de KPIs para dashboard
EventBus -down-> MetricSvc : suscripción a eventos (creación, asignación, resolución)
MetricSvc -down-> MTTRCalc : calcularMTTR(ticketId)
MetricSvc -down-> CostCalc : calcularCosto(ticketId, costoIA)
MetricSvc -down-> KpiRepo : actualizar kpi_cache
FE_Dash -down-> API : GET /dashboard/kpis
API -down-> MetricSvc : obtenerKPIs()
MetricSvc -down-> KpiRepo : SELECT

' Notas
note right of UoW
  **Transacción ACID:**
  - Atomicidad total entre ticket, clasificación IA y log.
  - Rollback si falla OpenAI o DB.
  - Estado siempre consistente.
end note

note right of PrecisionCalc
  **Precisión ≥ 70%:**
  - Se evalúa por categoría en lotes de 100 tickets.
  - Feedback humano corrige clasificación.
  - Precisión = (aciertos IA / total) en ventana semanal.
  - Si cae debajo, se dispara ajuste del prompt.
end note

note right of CostCalc
  **TCO (Costo por Ticket):**
  - Costo operador humano: $X/hora.
  - Costo IA: tokens consumidos × $0.0X.
  - Tiempo de resolución: diferencia entre created_at y resolved_at.
  - Costo total = costo_humano + costo_IA.
end note

@enduml
~~~

---

## Instrucciones Generales

- Trabaja en una misma conversación de IA (ChatGPT, Claude, etc.) para mantener el contexto.
- Pega cada prompt en orden (Fase 1, Fase 2, ...). La IA irá generando el código y dando instrucciones.
- Si la conversación se alarga y la IA pierde memoria, exporta el código generado, crea un resumen y continúa en una nueva charla.
- Es recomendable que ejecutes cada fase y verifiques que funciona antes de pasar a la siguiente.

---

## Fase 1: Inicialización del proyecto NestJS + TypeORM + PostgreSQL

**Objetivo:** Crear la estructura base del backend con conexión a BD y primeras migraciones.

**Prompt para la IA:**

~~~
Eres un desarrollador backend senior experto en NestJS, TypeORM y PostgreSQL. Quiero que me generes la configuración inicial de un proyecto NestJS con TypeORM y PostgreSQL, dockerizado parcialmente para la base de datos.

Tareas:
1. Inicializa un proyecto NestJS (`nest new incident-manager --skip-git --package-manager npm`).
2. Instala las dependencias necesarias: @nestjs/typeorm, typeorm, pg, @nestjs/config, class-validator, class-transformer.
3. Configura TypeORM para conectarse a una base de datos PostgreSQL usando variables de entorno (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME). Define el archivo `app.module.ts` con la importación de TypeORM de forma asíncrona a través de ConfigModule.
4. Crea un módulo `DatabaseModule` que se encargue de la configuración de TypeORM.
5. Define una entidad `Ticket` con estos campos:
   - id (uuid, PK)
   - title (varchar)
   - description (text)
   - category (varchar) – inicialmente categorías sugeridas: Redes, Software, Hardware, Soporte General
   - priority (varchar: crítico, alto, medio, bajo)
   - urgency (varchar: urgente, alto, medio, bajo)
   - impact (varchar: alto, medio, bajo)
   - status (varchar, default 'PENDIENTE_CLASIFICACION') – ciclo: PENDIENTE_CLASIFICACION -> ABIERTO -> EN_PROGRESO -> RESUELTO -> CERRADO
   - requester (varchar)
   - assigned_to (varchar, nullable)
   - ai_suggestion (text, nullable)
   - feedback_ia (jsonb, nullable) – almacenará: {clasificacion_correcta: boolean, sugerencia_util: boolean}
   - resolution_time_minutes (integer, nullable) – se llena al resolver
   - cost_human (decimal, nullable)
   - cost_ia (decimal, nullable)
   - created_at, updated_at, resolved_at (timestamps)
   - Use columnas adecuadas y decoradores.
6. Define una entidad `AuditLog` con: id, ticket_id (relación), action (varchar), details (jsonb), timestamp.
7. Crea migraciones automáticas (`synchronize: true` solo para desarrollo) y asegura que al levantar el backend se genere la base de datos.
8. Proporciona un script de seed que inserte 20 tickets de ejemplo con diferentes estados y categorías, usando el QueryRunner de TypeORM dentro de una transacción. Los datos deben ser realistas (ej. "VPN caída", "Impresora no funciona", etc.).
9. Crea un `docker-compose.yml` que solo levante el servicio `db` (postgres:15) con las variables de entorno necesarias. El backend se ejecutará localmente (sin Docker aún) para desarrollo.
10. Proporciona instrucciones claras para instalar dependencias, levantar la BD con Docker, correr migraciones y seed, e iniciar la aplicación.

Entrega todo el código fuente, los archivos de configuración y las instrucciones.
~~~

---

## Fase 2: Endpoint de creación de ticket con transacción ACID y llamada simulada a OpenAI

**Objetivo:** Implementar el corazón transaccional y la integración básica con IA.

**Prompt para la IA:**

~~~
Partiendo del proyecto NestJS anterior, ahora debes implementar la lógica de creación de un ticket con clasificación atómica (ACID) y un mock del servicio de IA.

Requisitos:
1. Crea un módulo `TicketsModule` con su controlador y servicio.
2. Endpoint `POST /tickets`:
   - Recibe DTO validado: title (string, requerido), description (string, requerido), category (string, requerido), requester (string, requerido).
   - El servicio `TicketsService.createWithAIClassification(dto)` debe:
     a) Usar `QueryRunner` de TypeORM para iniciar una transacción.
     b) Insertar un nuevo ticket con estado 'PENDIENTE_CLASIFICACION'.
     c) Llamar a un servicio `AIService.classify(ticket)` que simula una llamada a OpenAI: esperar 1.5 segundos y devolver un JSON con { category, priority, urgency, impact, suggestion }. Implementa una lógica mock basada en palabras clave del título/descripción (ej. si contiene "VPN" -> categoría Redes, prioridad alta, etc.). Asegúrate de que la función devuelva un objeto.
     d) Actualizar el ticket con los campos devueltos por la IA: category (si la IA la cambia), priority, urgency, impact, ai_suggestion, y cambiar status a 'ABIERTO'.
     e) Insertar un registro en AuditLog con action: 'CREACION', details: {resultado_IA: {...}}.
     f) Hacer commit de la transacción.
     g) Si en cualquier paso ocurre un error, hacer rollback y lanzar una excepción HTTP 500.
   - El endpoint debe devolver el ticket completo (incluyendo ai_suggestion).
3. Implementa el servicio `AIService` como un provider inyectable. Su método `classify(ticket: Ticket)` debe:
   - Tener una lista de categorías predefinidas.
   - Analizar texto simple (contiene palabras clave) para asignar categoría y prioridad. Esto servirá como base para luego conectar OpenAI real.
   - Devolver una promesa que se resuelve en 1.5s con un objeto como el descrito.
4. Asegura que la respuesta del POST incluya el ticket con todos los campos actualizados.
5. Agrega manejo de errores con filtros de excepción globales.
6. Proporciona un test unitario básico (con Jest) para el servicio `TicketsService.createWithAIClassification` que verifique:
   - Que el ticket se crea correctamente.
   - Que se llama al servicio de IA.
   - Que si la IA falla, la transacción se revierte (usa un spy para simular error en AIService).
   - Que el estado pasa de PENDIENTE_CLASIFICACION a ABIERTO.
7. Incluye instrucciones para ejecutar los tests.

Entrega los archivos modificados/creados: service, controller, DTO, test, y actualiza el módulo principal.
~~~

---

## Fase 3: Endpoint de feedback y cálculo de precisión de la IA

**Objetivo:** Implementar el ciclo de mejora continua y la medición de precisión ≥70%.

**Prompt para la IA:**

~~~
Sobre el backend existente, añade la funcionalidad de feedback humano para las clasificaciones de la IA y el cálculo de precisión por categoría.

Requisitos:
1. Crea una entidad `IAFeedback`:
   - id (uuid)
   - ticket_id (relación ManyToOne con Ticket)
   - categoria_sugerida_por_ia (varchar) – la categoría que asignó la IA
   - clasificacion_correcta (boolean) – si el humano confirma que la categoría es correcta
   - sugerencia_util (boolean) – si la sugerencia fue de ayuda
   - comentarios (text, nullable)
   - created_at
2. Migración automática para crear la tabla.
3. Endpoint `POST /feedback`:
   - DTO: ticketId (uuid), clasificacion_correcta (boolean), sugerencia_util (boolean), comentarios (opcional).
   - El servicio `FeedbackService.registrarFeedback(dto)`:
     a) Buscar el ticket por ID (debe existir).
     b) Crear un registro en IAFeedback con la categoría que tenía el ticket en ese momento.
     c) Actualizar el campo `feedback_ia` del ticket con un JSON {clasificacion_correcta, sugerencia_util} (para rápida consulta).
     d) Guardar todo dentro de una transacción simple (usando el mismo repositorio).
   - Devolver un mensaje de confirmación.
4. Nuevo endpoint `GET /dashboard/precision`:
   - Devuelve la precisión de la IA calculada como:
     (total de feedbacks con clasificacion_correcta = true / total de feedbacks) para cada categoría, y un promedio global.
   - Si para alguna categoría la precisión cae por debajo de 0.7 (70%), incluye en la respuesta una alerta: `{categoria, precision, alerta: true}`.
   - Para el cálculo, usa una consulta al repositorio de IAFeedback agrupando por categoria_sugerida_por_ia.
5. Actualiza el seed para insertar algunos feedbacks de ejemplo (al menos 15) que muestren una precisión del 75% en algunas categorías y 60% en otra, para probar la alerta.
6. Escribe un test unitario para el servicio de feedback que:
   - Registre un feedback y compruebe que se crea en BD.
   - Pruebe el cálculo de precisión con datos de ejemplo (mock del repositorio).
7. Instrucciones para probar el endpoint con Postman/curl.

Proporciona todos los archivos necesarios (entidad, DTO, servicio, controlador, test) e integra el módulo en la aplicación.
~~~

---

## Fase 4: Dashboard de KPIs (MTTR, costo por ticket, métricas ITIL)

**Objetivo:** Implementar el endpoint que alimentará el dashboard con indicadores de gestión.

**Prompt para la IA:**

~~~
Agrega al backend la funcionalidad para calcular y exponer KPIs de gestión de incidentes (ITIL, BSC, TCO).

Tareas:
1. En el servicio `TicketsService` (o crea un `MetricsService`), implementa el cálculo de:
   - `total_tickets_hoy`: contar los creados hoy.
   - `mttr_promedio`: tiempo medio de resolución en horas, solo de tickets en estado RESUELTO o CERRADO que tengan `resolution_time_minutes` lleno, calculado como AVG(resolution_time_minutes)/60.
   - `costo_promedio_por_ticket`: promedio de (cost_human + cost_ia) de los tickets resueltos.
   - `distribucion_prioridad`: agrupación por prioridad (count).
   - `precision_ia_global`: puedes reutilizar lo del endpoint anterior o consultarlo directamente.
2. Para calcular el costo automáticamente, añade lógica al momento de resolver un ticket. Crea un endpoint `PATCH /tickets/:id/estado` que permita cambiar el estado del ticket.
   - Validar transiciones: solo se puede pasar a RESUELTO si está en EN_PROGRESO, y a CERRADO desde RESUELTO.
   - Al cambiar a RESUELTO:
     a) Registrar `resolved_at = new Date()`.
     b) Calcular `resolution_time_minutes` = diferencia en minutos entre `created_at` y ahora.
     c) Calcular `cost_human` = (resolution_time_minutes / 60) * 15 (tarifa $15/hora).
     d) Calcular `cost_ia` = número de tokens simulados * 0.03 (precio fijo por ticket, $0.05). Para simplificar, asigna un costo fijo por ticket de $0.05 para IA.
     e) Guardar cambios.
   - El endpoint debe devolver el ticket actualizado.
3. Endpoint `GET /dashboard/kpis` que devuelva un JSON con todos los indicadores anteriores.
4. Actualiza el seed para que varios tickets estén en estado RESUELTO, con tiempos de resolución y costos rellenados, para que el dashboard tenga datos de ejemplo.
5. Escribe tests unitarios para:
   - La transición de estado y cálculo de costos.
   - El endpoint GET /dashboard/kpis, mockeando el servicio para que devuelva valores calculados.
6. Instrucciones de uso.

Entrega todos los archivos involucrados.
~~~

---

## Fase 5: Frontend – Configuración y dashboard con gráficos

**Objetivo:** Crear la aplicación Next.js con Tailwind CSS y Recharts, conectada al backend.

**Prompt para la IA (cambio de contexto a frontend):**

~~~
Ahora vamos a construir el frontend con Next.js 14 (App Router), Tailwind CSS y Recharts. Supondremos que el backend ya está corriendo en http://localhost:3000 (puerto 3001 si es necesario, pero podemos configurar proxy). El frontend se ejecutará en puerto 3001.

Tareas:
1. Inicializa un proyecto Next.js con TypeScript, Tailwind CSS y Recharts.
2. Configura un proxy en `next.config.js` para redirigir `/api/*` a `http://localhost:3000/api/*` (así evitamos CORS en desarrollo).
3. Crea una carpeta `components` y dentro:
   - `Sidebar.tsx`: igual al diseño: logo "DeskAI", enlaces Dashboard, Todos los Incidentes, Mis Tickets; lista de servicios estática; enlace a Métricas.
   - `Header.tsx`: barra superior con título de página actual y acciones (notificaciones, perfil).
   - `KPICard.tsx`: componente reutilizable para tarjetas del dashboard (título, valor, variación, color).
   - `BarChartPrioridad.tsx`: componente que recibe datos de distribución y renderiza un gráfico de barras con Recharts.
4. Crea la página principal `app/page.tsx` que redirige a `/dashboard`.
5. Crea la ruta `app/dashboard/page.tsx`:
   - Hace fetch a `/api/dashboard/kpis` (recuerda el proxy) con useEffect.
   - Muestra 4 tarjetas KPI: Incidentes Hoy, MTTR Promedio (en horas), Costo por Ticket, Precisión IA.
   - Si precisión < 70, la tarjeta se pone roja y muestra alerta.
   - Incluye el gráfico de barras de distribución de prioridad.
   - Muestra una tabla con los últimos 5 tickets (necesitas un endpoint GET /api/tickets?limit=5&sortBy=created_at:desc, que deberás agregar al backend, pero por ahora puedes simular los datos o pedir que se cree un endpoint simple). Por ahora, para esta fase, usaremos datos mock en el frontend mientras implementas el endpoint real. De todas formas, crea el componente `UltimosTickets.tsx` que reciba un array de tickets y muestre ID, resumen, estado, prioridad, costo.
6. Agrega estado de carga y manejo de errores.
7. Asegura que el diseño sea responsive y use la paleta de colores corporativa (azul #1E40AF, etc.) configurada en Tailwind.

Entrega todos los archivos, instrucciones para instalar dependencias y ejecutar el frontend.
~~~

---

## Fase 6: Frontend – Lista de tickets, detalle (drawer) y creación

**Objetivo:** Implementar las vistas restantes y conexión con los endpoints reales.

**Prompt para la IA:**

~~~
Sobre el frontend anterior, completa las siguientes funcionalidades:

1. **Página de lista de tickets** (`app/tickets/page.tsx`):
   - Al cargar, hace fetch a `GET /api/tickets` (necesitarás implementar este endpoint básico en el backend que devuelva todos los tickets con ordenación y filtros simples, o por ahora usa datos mock locales que luego conectarás).
   - Muestra la tabla con columnas: ID, Resumen, Solicitante, Asignado, Prioridad, Estado, Categoría, Fecha creación.
   - Agrega ordenamiento al hacer clic en columnas (solo frontend, ordena el array).
   - Barra de búsqueda que filtre por título.
   - Botón "+ Nuevo Ticket" que abre un modal.
   - Al hacer clic en una fila, se abre un panel lateral (drawer) con el detalle.

2. **Componente Drawer de detalle** (`TicketDrawer.tsx`):
   - Recibe un ticket object.
   - Muestra todos los campos, incluyendo la prioridad y urgencia/impacto con badges.
   - Muestra la sugerencia de la IA en un recuadro destacado.
   - Si el ticket tiene `ai_suggestion`, muestra dos botones: "Útil" / "No útil" (para enviar feedback). Al hacer clic, se envía `POST /api/feedback` con los datos correspondientes (clasificacion_correcta: true/false según botón, sugerencia_util: true/false). Al enviar, muestra un toast de confirmación.
   - Si el estado es RESUELTO, muestra MTTR y costo.

3. **Modal de nuevo ticket** (`NewTicketModal.tsx`):
   - Formulario con título, descripción, categoría (selector), solicitante.
   - Al enviar, llama a `POST /api/tickets`.
   - Muestra un spinner "Clasificando con IA..." durante 1.5s (simulado), luego cierra modal y refresca la lista.

4. **Endpoints reales (mínimo):** Debes implementar en el backend (si no existen) los siguientes endpoints básicos:
   - `GET /tickets`: devuelve todos los tickets, ordenados por fecha descendente.
   - `GET /tickets/:id`: devuelve un ticket por ID.
   Usa los ya existentes o crea controladores simples. Asegura que retornen datos de ejemplo si no hay BD.

5. Conecta el frontend a estos endpoints usando fetch y useEffect. Usa variables de entorno para la URL base (`NEXT_PUBLIC_API_URL`).

6. Agrega React Hot Toast para notificaciones.

Entrega los nuevos archivos y modificaciones necesarias.
~~~

---

## Fase 7: Dockerización completa (backend + frontend + BD)

**Objetivo:** Empaquetar todo en contenedores para despliegue con un solo comando.

**Prompt para la IA:**

~~~
Teniendo el backend NestJS (en `/backend`) y el frontend Next.js (en `/frontend`), dockeriza toda la aplicación.

Requisitos:
1. Crea un `Dockerfile` para el backend:
   - Usa node:18-alpine.
   - Copia package*.json, instala dependencias.
   - Copia el resto del código.
   - Compila (`npm run build`).
   - Expone el puerto 3000.
   - Comando: `npm run start:prod`.
2. Crea un `Dockerfile` para el frontend:
   - node:18-alpine, instala dependencias, construye (`npm run build`).
   - Usa `npm start` para producción. Expone puerto 3001 (configurable).
3. Crea un `docker-compose.yml` en la raíz del proyecto que defina servicios:
   - `db`: postgres:15, con volumen para persistencia, variables de entorno.
   - `backend`: construido desde ./backend, dependiente de db, variables de entorno para conexión (DB_HOST=db, DB_PORT=5432, etc.). Puerto 3000:3000.
   - `frontend`: construido desde ./frontend, dependiente de backend, puerto 3001:3000 (o 3000 si prefieres, pero que no choque). Configura variable `NEXT_PUBLIC_API_URL=http://backend:3000/api` para que el frontend haga peticiones al backend internamente (servidor o cliente? Ajusta para que sea correcto). En Next.js, las peticiones desde el navegador deben apuntar a la misma URL del frontend con un proxy, pero en producción puede configurarse el backend directamente. Para simplificar, usa el proxy de Next.js reescribiendo `/api` a `http://backend:3000/api` en el next.config.js (eso funciona tanto en cliente como servidor). Asegúrate de que el next.config.js exporte la reescritura adecuada.
4. Añade un script de inicialización (`init-db.sql` o similar) que se copie al contenedor de postgres para ejecutar migraciones y seed al arrancar. O mejor, aprovecha que el backend con TypeORM puede sincronizar esquema (`synchronize:true`). Para el seed, puedes crear un script que se ejecute en el backend al iniciar si una variable de entorno RUN_SEED=true. Implementa un endpoint o un script de seed automático que verifique si hay datos y si no, inserte los 20 tickets y feedbacks.
5. Incluye instrucciones claras en un README.md para construir y levantar todo con `docker-compose up --build`.
6. Asegúrate de que los contenedores se comuniquen correctamente y que el frontend muestre los datos.

Entrega los Dockerfiles, docker-compose.yml y las configuraciones necesarias.
~~~

---

## Fase 8: Pruebas de funcionamiento end-to-end y verificación de requisitos

**Objetivo:** Validar que todo el sistema cumple con los requisitos (ACID, precisión, KPIs, ITIL).

**Prompt para la IA (final):**

~~~
Ahora, necesito que elabores un plan de pruebas funcionales y scripts de verificación para el sistema de gestión de incidentes. Quiero asegurarme de que se cumplan los puntos clave antes de la presentación.

Tareas:
1. Escribe un conjunto de pruebas de integración para el backend usando Jest y Supertest:
   - Prueba `POST /tickets`: crea un ticket, verifica que devuelva estado ABIERTO y tenga sugerencia de IA.
   - Simula un fallo en el servicio de IA (mock) y comprueba que la transacción se revierte y el ticket no se crea (verificar en BD).
   - Prueba `POST /feedback` y luego `GET /dashboard/precision` para validar que la precisión se calcula correctamente y se emite alerta si < 70%.
   - Prueba `PATCH /tickets/:id/estado` para transitar a RESUELTO y verificar que se llenan resolution_time_minutes, cost_human, cost_ia.
   - Prueba `GET /dashboard/kpis` y comprueba que los números sean coherentes con los datos de seed.
2. Escribe pruebas de interfaz con Playwright o Cypress (elige una) que verifiquen el flujo completo:
   - Navegar a la app.
   - Ver dashboard con KPIs.
   - Ir a lista de tickets, crear uno nuevo (llenar formulario), esperar clasificación y verlo en tabla.
   - Hacer clic en el ticket, ver detalle con sugerencia IA, enviar feedback (útil/no útil).
   - Refrescar y verificar que precisión se actualizó en el dashboard.
   - Cambiar estado a RESUELTO (quizás desde backend o creando un botón en frontend para pruebas) y comprobar que aparecen MTTR y costo.
3. Proporciona un script bash (`test-e2e.sh`) que levante los contenedores Docker, espere a que estén listos, ejecute las pruebas de integración y luego las e2e, y finalmente detenga los contenedores.
4. Incluye en el README instrucciones para ejecutar todas las pruebas.

El objetivo es tener una demostración automatizada de que el sistema funciona y cumple con los requisitos: clasificación automática, precisión monitoreada, cálculo de costos, MTTR, y transacciones atómicas.

Entrega los archivos de pruebas, configuraciones y scripts.
~~~

---

## Conclusión

Siguiendo estas fases en orden, obtendrás un prototipo funcional completo que demuestra todos los aspectos solicitados: **gestión de incidentes ITIL, integración con IA, transacciones ACID, precisión ≥70%, métricas BSC/TCO y despliegue con Docker**.

Pega cada prompt en tu herramienta de IA favorita y construye paso a paso. ¡Mucho éxito en tu entrega!
