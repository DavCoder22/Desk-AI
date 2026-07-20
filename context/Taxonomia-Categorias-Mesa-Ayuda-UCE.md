# Taxonomía de Casos y Prompt de Clasificación — Mesa de Ayuda UCE
## Basado en el catálogo real de servicios TI de la Universidad Central del Ecuador

Este documento reestructura el catálogo oficial de la mesa de ayuda de la UCE
en una taxonomía jerárquica de 3 niveles (**Macro-área → Categoría →
Subcategoría/Caso**) y produce el *system prompt* que usará el motor de
clasificación IA. A diferencia de una taxonomía genérica, esta está tomada
directamente de los casos que la UCE ya gestiona, por lo que la clasificación
que produzca la IA será coherente con el vocabulario y los flujos reales de
la institución.

---

## 1. Estructura jerárquica de la taxonomía

La UCE organiza sus servicios en **dos macro-áreas**:

- **A. Soporte de Sistemas UCE** — sistemas académico-administrativos (SIIU,
  Idiomas, Titulación, Suficiencia, Quipux, Web, UVirtual, Accesos físicos)
- **B. Soporte Técnico a Usuarios** — cuentas y herramientas de productividad
  (correo institucional, Office 365)

Cada categoría tiene subcategorías (los "casos" puntuales que el usuario
selecciona/describe). Esta es la tabla que la IA debe usar como **lista
cerrada** — no debe inventar categorías fuera de esta tabla.

### A. Soporte de Sistemas UCE

| # | Categoría | Subcategoría / Caso | Adjunto requerido | Perfil típico |
|---|---|---|---|---|
| A1 | Accesos Peatonal o Vehicular | Inconvenientes con el acceso | Ubicación de puerta, fecha, hora | Todos |
| A1 | Accesos Peatonal o Vehicular | Inconvenientes con el carnet | Ubicación de puerta, fecha, hora | Todos |
| A2 | Académico – Estudiantes (SIIU) | Cambio de datos personales | Copia de cédula | Estudiante |
| A2 | Académico – Estudiantes (SIIU) | Cambio de estado inscrito → matriculado | Voucher de pago | Estudiante |
| A2 | Académico – Estudiantes (SIIU) | Inconvenientes en el ingreso | — | Estudiante |
| A2 | Académico – Estudiantes (SIIU) | Inconvenientes en proceso de matriculación | — | Estudiante |
| A2 | Académico – Estudiantes (SIIU) | Inconvenientes en Encuesta | — | Estudiante |
| A2 | Académico – Estudiantes (SIIU) | Inconvenientes en visualización de reportes | Especificar qué reporte | Estudiante |
| A2 | Académico – Estudiantes (SIIU) | Inconvenientes en simulación | — | Estudiante |
| A2 | Académico – Estudiantes (SIIU) | Órdenes de cobro caducadas | — | Estudiante |
| A2 | Académico – Estudiantes (SIIU) | Dudas sobre pérdida de gratuidad | — | Estudiante |
| A3 | Becas Excelencia Académica | Documentos para firma de contrato de beca | — | Estudiante |
| A3 | Becas Excelencia Académica | Requisitos para ser beneficiario | — | Estudiante |
| A3 | Becas Excelencia Académica | Dudas sobre promedio de calificaciones | — | Estudiante |
| A3 | Becas Excelencia Académica | Dudas sobre no ser beneficiario | — | Estudiante |
| A4 | Instituto Académico de Idiomas | Certificados para posgrado/instituciones externas | PDF único: solicitud dirigida al Director, registro Senescyt/título, cédula | Estudiante |
| A4 | Instituto Académico de Idiomas | Homologación de suficiencia en idiomas | PDF único: solicitud, diploma notariado (vigencia 5 años), récord académico, matrícula UCE, cédula/pasaporte | Estudiante |
| A4 | Instituto Académico de Idiomas | Novedades con matrículas (SIIU, periodo matrículas) | — | Estudiante |
| A4 | Instituto Académico de Idiomas | Novedades de cursos | — | Estudiante |
| A4 | Instituto Académico de Idiomas | Novedades en pase de notas al SIIU | — | Estudiante |
| A4 | Instituto Académico de Idiomas | Validación de conocimientos / aprobación de niveles | PDF único: solicitud, récord académico (vigencia 5 años), matrícula UCE, cédula/pasaporte | Estudiante |
| A5 | Página Web UCE | Error en descargas de archivos PDF | — | Estudiante |
| A5 | Página Web UCE | Guía para encontrar información | — | Estudiante |
| A5 | Página Web UCE | Inconvenientes al abrir la página web | — | Estudiante |
| A6 | Plataforma Educativa Virtual (UVirtual) | Inconvenientes en el ingreso (Incidente) | — | Estudiante |
| A6 | Plataforma Educativa Virtual (UVirtual) | Inconvenientes en matrícula al aula virtual | — | Estudiante |
| A6 | Plataforma Educativa Virtual (UVirtual) | Inconvenientes al resolver actividades (subir tareas, cuestionarios) | — | Estudiante |
| A7 | Quipux | Actualización de información | — | Estudiante |
| A7 | Quipux | Inconvenientes en el ingreso al sistema | — | Estudiante |
| A7 | Quipux | Recuperación de clave | — | Estudiante |
| A8 | Sistema de Titulación | Guía del proceso de titulación | — | Estudiante |
| A8 | Sistema de Titulación | Inconvenientes en el ingreso | — | Estudiante |
| A8 | Sistema de Titulación | Problemas en la notificación (correo) | — | Estudiante |
| A9 | Suficiencia Informática | Cambio de estado inscrito → matriculado | — | Estudiante |
| A9 | Suficiencia Informática | Inconvenientes con cronograma de inscripciones | — | Estudiante |
| A9 | Suficiencia Informática | Inconvenientes en proceso de matrículas | — | Estudiante |
| A9 | Suficiencia Informática | Inconvenientes en el valor del pago | — | Estudiante |
| A9 | Suficiencia Informática | Inconvenientes en visualización de calificaciones | — | Estudiante |
| A9 | Suficiencia Informática | Inconvenientes en visualización de paralelos | — | Estudiante |
| A9 | Suficiencia Informática | Inconvenientes en visualización del módulo de suficiencia | — | Estudiante |

### B. Soporte Técnico a Usuarios

| # | Categoría | Subcategoría / Caso | Adjunto requerido | Perfil típico |
|---|---|---|---|---|
| B1 | Correo Electrónico Institucional | Configuración de la cuenta (firma, tema, respuestas automáticas, correos prioritarios) | — | Estudiante, docente, administrativo |
| B1 | Correo Electrónico Institucional | Guía de utilización del aplicativo | — | Todos |
| B1 | Correo Electrónico Institucional | Inconvenientes con 2FA (autenticación de dos factores) | — | Todos |
| B1 | Correo Electrónico Institucional | Inconvenientes con aplicaciones Office 365 (OneDrive, Teams, etc.) | — | Todos |
| B1 | Correo Electrónico Institucional | Inconvenientes en el ingreso a la cuenta (clave) | — | Todos |
| B1 | Correo Electrónico Institucional | Inconvenientes en envío y recepción de correo | — | Todos |

> **Nota:** este catálogo que compartiste está enfocado en el perfil
> **estudiante**. Para tu proyecto (que incluye también docentes y
> administrativos) puedes replicar la misma estructura de "Académico" con
> los casos equivalentes de **docente** (distributivo, carga de notas,
> gestión de curso en UVirtual) y **administrativo** (nómina, sistema
> financiero), manteniendo el mismo patrón de categoría → subcategoría →
> adjunto requerido. Si quieres, en el siguiente paso te ayudo a completar
> esas dos ramas siguiendo exactamente este mismo formato.

---

## 2. Reglas de inferencia de prioridad/impacto por categoría

Como el catálogo real no trae explícitamente prioridad, se infiere por tipo
de caso (útil para tu campo `priority`/`urgency`/`impact` del ticket):

| Patrón del caso | Impacto | Urgencia típica |
|---|---|---|
| Bloquea matrícula, pago o fecha límite institucional (A2, A3, A4-Novedades matrículas, A9) | Alto | Urgente si está en periodo activo |
| Ingreso/autenticación a cualquier sistema (SIIU, UVirtual, Quipux, correo, Titulación) | Medio-Alto | Alto (bloquea toda actividad del usuario) |
| Trámites documentales con adjuntos (A4 certificados/homologación) | Bajo | Medio (no es un "incidente", es una solicitud de servicio) |
| Guías, dudas informativas ("guía del proceso", "guía de uso") | Bajo | Bajo — son *consultas*, no incidentes |
| Accesos físicos (carnet, puerta) | Medio | Depende si bloquea ingreso al campus en el momento |
| 2FA / Office 365 / envío-recepción de correo | Alto | Alto (afecta comunicación oficial) |

**Distinción clave para tu clasificador:** el catálogo mezcla dos tipos de
solicitud que conviene separar como campo adicional `tipo_solicitud`:
- `INCIDENTE` — algo que funcionaba y dejó de funcionar (ingreso, envío de correo, matrícula bloqueada)
- `SOLICITUD_SERVICIO` — un trámite o consulta que no implica una falla (certificados, guías, requisitos de becas)

Esto es relevante porque en **ITIL** son procesos distintos (Incident
Management vs. Request Fulfillment), y mencionarlo en tu presentación suma
puntos de rigor técnico.

---

## 3. Prompt de sistema para el motor de clasificación IA

```
Eres el motor de clasificación de la Mesa de Ayuda de la Universidad
Central del Ecuador (UCE). Tu tarea es analizar la solicitud de un
usuario (estudiante, docente o administrativo) y devolver ÚNICAMENTE un
JSON con la clasificación, usando exclusivamente el catálogo oficial de
categorías y subcategorías que se te proporciona. No inventes categorías
ni subcategorías fuera de esta lista.

CATÁLOGO DE CATEGORÍAS Y SUBCATEGORÍAS (lista cerrada):

[A. SOPORTE DE SISTEMAS UCE]
- Accesos Peatonal o Vehicular: Inconvenientes con el acceso | Inconvenientes con el carnet
- Académico - Estudiantes (SIIU): Cambio de datos personales | Cambio de estado inscrito a matriculado | Inconvenientes en el ingreso | Inconvenientes en proceso de matriculación | Inconvenientes en Encuesta | Inconvenientes en visualización de reportes | Inconvenientes en simulación | Órdenes de cobro caducadas | Dudas sobre pérdida de gratuidad
- Becas Excelencia Académica: Documentos para contrato de beca | Requisitos para ser beneficiario | Dudas sobre promedio de calificaciones | Dudas sobre no ser beneficiario
- Instituto Académico de Idiomas: Certificados para posgrado/externas | Homologación de suficiencia | Novedades con matrículas | Novedades de cursos | Novedades en pase de notas al SIIU | Validación de conocimientos
- Página Web UCE: Error en descargas | Guía para encontrar información | Inconvenientes al abrir la página
- Plataforma Educativa Virtual (UVirtual): Inconvenientes en el ingreso | Inconvenientes en matrícula al aula virtual | Inconvenientes en resolución de actividades
- Quipux: Actualización de información | Inconvenientes en el ingreso | Recuperación de clave
- Sistema de Titulación: Guía del proceso | Inconvenientes en el ingreso | Problemas en la notificación
- Suficiencia Informática: Cambio de estado inscrito a matriculado | Inconvenientes con cronograma | Inconvenientes en proceso de matrículas | Inconvenientes en valor del pago | Inconvenientes en visualización de calificaciones | Inconvenientes en visualización de paralelos | Inconvenientes en visualización del módulo

[B. SOPORTE TÉCNICO A USUARIOS]
- Correo Electrónico Institucional: Configuración de la cuenta | Guía de utilización | Inconvenientes con 2FA | Inconvenientes con Office 365 (OneDrive/Teams) | Inconvenientes en el ingreso a la cuenta | Inconvenientes en envío y recepción

REGLAS DE CLASIFICACIÓN:
1. Elige la categoría y subcategoría más específica posible del catálogo.
   Si ninguna coincide exactamente, elige la más cercana semánticamente
   y explica brevemente por qué en el campo "notas_clasificacion".
2. Determina "tipo_solicitud": INCIDENTE (algo dejó de funcionar) o
   SOLICITUD_SERVICIO (trámite, consulta, documento).
3. Determina "impacto" (alto/medio/bajo) según cuántos usuarios afecta
   y si bloquea un proceso con fecha límite institucional (matrícula,
   pagos, cierre de notas, titulación).
4. Determina "urgencia" (urgente/alto/medio/bajo) según si el usuario
   necesita resolución inmediata (ej. está en clase, matrícula cierra hoy)
   o puede esperar.
5. Calcula "prioridad" combinando impacto x urgencia (matriz ITIL:
   alto+urgente=crítico, alto+alto=alto, medio+medio=medio, resto=bajo).
6. Si la subcategoría requiere un adjunto obligatorio según el catálogo
   (ej. cédula, voucher, PDF de solicitud), indícalo en el campo
   "adjunto_requerido"; si el usuario no lo mencionó, "sugerencia_resolucion"
   debe pedirlo explícitamente antes de continuar el trámite.
7. Genera "sugerencia_resolucion" con pasos concretos y realistas, basados
   en el procedimiento real de la UCE para esa subcategoría (no inventes
   procedimientos).

DATOS DEL TICKET:
tipo_usuario: {{estudiante|docente|administrativo}}
titulo: {{titulo}}
descripcion: {{descripcion}}

FORMATO DE SALIDA (JSON estricto, sin texto adicional):
{
  "categoria": "",
  "subcategoria": "",
  "tipo_solicitud": "",
  "prioridad": "",
  "urgencia": "",
  "impacto": "",
  "adjunto_requerido": "",
  "sugerencia_resolucion": "",
  "notas_clasificacion": ""
}
```

---

## 4. Siguiente paso recomendado

Con esta taxonomía real ya tienes:
- El **seed de datos** de tu backend (Fase 1) puede generarse directamente
  desde esta tabla — 20 tickets de ejemplo repartidos entre estas
  categorías reales, mucho más creíble que datos inventados.
- El **clasificador mock** (si no conectas LLM real) puede ser una tabla de
  palabras clave → categoría/subcategoría basada exactamente en esta lista.
- El **prompt de la sección 3** es el que va directo a tu `AIService` si
  conectas la API de OpenAI.

¿Quieres que arme el **seed de 20 tickets de ejemplo** usando exactamente
estas categorías/subcategorías reales para que lo pegues en tu Fase 1, o
prefieres que complete primero las ramas de **docente** y
**administrativo** siguiendo este mismo formato?
