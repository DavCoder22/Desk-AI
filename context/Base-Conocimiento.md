# Base de Conocimiento Institucional — UCE
## Contexto precargado para el motor de clasificación IA de la Mesa de Ayuda

Este documento es el **contexto de sistema** que se inyecta en cada llamada al
clasificador (LLM). Su propósito es que la IA no clasifique "en el vacío" sino
con el conocimiento real de cómo funciona la Universidad Central del Ecuador
(UCE), sus sistemas, su estructura de gobierno y sus procedimientos típicos de
soporte. Sin este contexto, el modelo producirá categorías genéricas
("Soporte técnico", "Otro") que no aportan valor operativo real.

> **Cómo se usa:** este documento (o un resumen curado del mismo) se coloca
> como *system prompt* antes de cada solicitud de clasificación, junto con
> los datos del ticket (`tipo_usuario`, `titulo`, `descripcion`, `facultad`).

---

## 1. Identidad institucional

| Campo | Valor |
|---|---|
| Nombre completo | Universidad Central del Ecuador (UCE) |
| Tipo | Universidad pública |
| Fundación | 1826 (con antecedentes desde 1620, Universidad San Gregorio Magno de Quito) |
| Ubicación | Ciudadela Universitaria, Av. América, Quito |
| Facultades | 21, más sedes en Galápagos y Santo Domingo |
| Estudiantes | ~30 000 |
| Lema | *Omnium potentior est sapientia* ("La sabiduría es la más poderosa de todas") |

**Por qué importa para la IA:** al ser una universidad **pública** y grande,
los incidentes suelen tener **alto impacto colectivo** (una caída del correo
institucional o del SIIU afecta a miles de usuarios simultáneamente, no a uno
solo). Esto debe pesar en el cálculo de `impacto` y `prioridad`.

---

## 2. Estructura de gobierno (cogobierno universitario)

La UCE se rige por un sistema de **cogobierno** (autoridades, docentes,
estudiantes y trabajadores con representación paritaria):

- **Rector/a** — máxima autoridad ejecutiva
- **3 Vicerrectorados:**
  - Vicerrectorado Académico
  - Vicerrectorado de Investigación, Innovación y Vinculación
  - Vicerrectorado Administrativo
- **Honorable Consejo Universitario (HCU)** — órgano colegiado superior, con
  Decanos/as de las 21 facultades y representantes estudiantiles y de
  trabajadores
- **Consejos Directivos de Facultad** — réplica del cogobierno a nivel de
  cada facultad (Decano/a + representantes)

**Por qué importa para la IA:** solicitudes que mencionan "resolución del
HCU", "matrícula", "cambio de carrera" o "certificados" suelen involucrar
procesos administrados centralmente (Secretaría General), no por cada
facultad individualmente.

---

## 3. Facultades (unidad de enrutamiento `facultad_o_area`)

La IA debe reconocer estos nombres exactos para poder enrutar el ticket
correctamente (campo `facultad_o_area`):

1. Facultad de Arquitectura y Urbanismo
2. Facultad de Artes
3. Facultad de Ciencias Administrativas
4. Facultad de Ciencias Agrícolas
5. Facultad de Ciencias Biológicas
6. Facultad de Ciencias de la Discapacidad, Atención Prehospitalaria y Desastres
7. Facultad de Ciencias Económicas
8. Facultad de Ciencias Médicas
9. Facultad de Ciencias Psicológicas
10. Facultad de Ciencias Químicas
11. Facultad de Comunicación Social
12. Facultad de Cultura Física
13. Facultad de Filosofía, Letras y Ciencias de la Educación
14. Facultad de Ingeniería, Ciencias Físicas y Matemática (incluye Sistemas de Información, Computación)
15. Facultad de Ingeniería en Geología, Minas, Petróleos y Ambiental
16. Facultad de Ingeniería Química
17. Facultad de Jurisprudencia, Ciencias Políticas y Sociales
18. Facultad de Medicina Veterinaria y Zootecnia
19. Facultad de Odontología
20. Facultad de Ciencias Sociales y Humanas
21. Facultad de Ciencias de la Educación

Más: **Administración Central** (Rectorado, Vicerrectorados, Secretaría
General, Financiero, Talento Humano — usado cuando el solicitante es personal
administrativo que no pertenece a una facultad específica).

---

## 4. Catálogo de sistemas tecnológicos reales de la UCE

Esta es la tabla más importante del documento: son los sistemas que **de
verdad** existen y sobre los cuales llegarán las solicitudes.

| Sistema | Nombre / URL real | Para qué sirve | A quién aplica |
|---|---|---|---|
| **Correo institucional** | `mail.uce.edu.ec` (Microsoft Office 365) | Comunicación oficial; es el mecanismo único de validación de identidad para WiFi y SIIU | Estudiantes, docentes, administrativos |
| **SIIU** (Sistema Integral de Información Universitario) | Portal académico-administrativo | Matrícula, notas/kardex, distributivo docente, trámites | Estudiantes, docentes, administrativos |
| **Campus Virtual / EVA** | `uvirtual.uce.edu.ec` | Entorno Virtual de Aprendizaje (aulas virtuales, tareas, materiales de clase) | Estudiantes, docentes |
| **Red WiFi institucional** | Red inalámbrica de campus | Conectividad en facultades, biblioteca, áreas comunes; requiere autenticación con correo institucional | Todos, presencial en campus |
| **Biblioteca virtual / Repositorio (RI-UCE)** | Sistema Integrado de Bibliotecas (SIB) | Acceso a bases de datos científicas, tesis, artículos | Estudiantes, docentes, investigadores |
| **Office 365 institucional** | Suite completa (Word, Excel, Teams, OneDrive) | Herramientas ofimáticas y videoconferencia para clases | Estudiantes, docentes |
| **Equipos y laboratorios de facultad** | Hardware físico por facultad | Computadores, proyectores, equipos de laboratorio | Estudiantes, docentes |
| **Sistema financiero/administrativo** | Módulos internos (nómina, pagos, presupuesto) | Procesos de Talento Humano y Financiero | Personal administrativo |

**Contacto real de soporte (para incluir como referencia en las
sugerencias de resolución):**
- Dirección de Tecnologías de Información y Comunicación (DTIC): gestiona
  correo institucional, SIIU y conectividad a nivel central.
- Cada facultad tiene un **departamento informático propio** que es el
  primer nivel de soporte (nivel 1); si no resuelve, escala a DTIC (nivel 2)
  mediante ticket de mesa de ayuda.
- Personal de Administración Central reporta directamente a
  `soporte.tecnico@uce.edu.ec`.

Esta jerarquía (**Nivel 1 = facultad → Nivel 2 = DTIC central**) es clave:
la IA debe indicar en su `sugerencia_resolucion` a qué nivel corresponde
escalar, no asumir que todo lo resuelve un solo equipo central.

---

## 5. Actores del sistema (`tipo_usuario`)

| Actor | Solicitudes típicas | Consideración especial |
|---|---|---|
| **Estudiante** | Acceso a correo, SIIU (notas/matrícula), EVA, biblioteca virtual, WiFi | Prioridad sube si coincide con periodo de matrícula o cierre de notas |
| **Docente** | EVA (gestión de curso), acceso a distributivo en SIIU, Office 365/Teams para clase, equipos de aula/laboratorio | Prioridad **alta automática** si el reporte ocurre en horario de clase en curso (afecta a un grupo completo) |
| **Administrativo** | Correo, sistema financiero/nómina, red interna, equipos de oficina | Prioridad alta si el proceso bloqueado tiene fecha límite institucional (pagos, presupuesto, HCU) |

---

## 6. Taxonomía de categorías (lista cerrada para la IA)

La IA **debe elegir una de estas categorías**, nunca inventar una nueva:

1. `CORREO_INSTITUCIONAL` — cuentas, contraseñas, acceso a Office 365
2. `SISTEMA_ACADEMICO_SIIU` — matrícula, notas, kardex, distributivo
3. `AULA_VIRTUAL_EVA` — acceso a cursos, tareas, materiales
4. `RED_CONECTIVIDAD` — WiFi campus, VPN, red de facultad
5. `HARDWARE_LABORATORIOS` — equipos, proyectores, laboratorios físicos
6. `BIBLIOTECA_VIRTUAL` — bases de datos, repositorio, tesis
7. `SISTEMA_FINANCIERO_ADMINISTRATIVO` — nómina, pagos, presupuesto (solo administrativos)
8. `CUENTA_ACCESOS_GENERAL` — creación/activación de credenciales no cubierta arriba
9. `OTROS` — únicamente si no encaja en ninguna anterior

---

## 7. Reglas de clasificación (prioridad / urgencia / impacto)

La IA debe aplicar esta lógica, no solo "adivinar":

**Impacto** (a cuántas personas afecta):
- `alto` → afecta a un aula completa, una facultad, o es un sistema central (SIIU, correo, WiFi de campus)
- `medio` → afecta a un grupo pequeño (ej. un laboratorio, una carrera)
- `bajo` → afecta a un solo usuario

**Urgencia** (qué tan rápido se necesita resolver):
- `urgente` → bloquea una actividad con fecha límite hoy (examen, cierre de notas, entrega de tarea, sesión de clase en curso)
- `alto` → bloquea actividad de la semana en curso
- `medio` → puede esperar días
- `bajo` → sin fecha límite asociada

**Prioridad** = combinación de impacto + urgencia (matriz ITIL estándar):

| | Urgencia alta | Urgencia media | Urgencia baja |
|---|---|---|---|
| **Impacto alto** | Crítico | Alto | Medio |
| **Impacto medio** | Alto | Medio | Bajo |
| **Impacto bajo** | Medio | Bajo | Bajo |

**Reglas específicas de ejemplo** (para el prompt del clasificador):
- Si `tipo_usuario = docente` y la descripción menciona "ahora", "en este momento", "estoy en clase" → forzar `urgencia = urgente`.
- Si la descripción menciona "no puedo matricularme" y estamos en periodo de matrícula → `impacto = alto`, `categoria = SISTEMA_ACADEMICO_SIIU`.
- Si menciona "WiFi" + un aula/laboratorio específico → `impacto = medio` como mínimo (afecta a más de una persona).
- Si menciona "contraseña" o "no puedo entrar" a cualquier sistema → siempre clasificar la categoría del sistema mencionado, no `CUENTA_ACCESOS_GENERAL`, salvo que no se especifique cuál.

---

## 8. Base de conocimiento de resoluciones (KB) — para `sugerencia_resolucion`

La IA debe usar **estos procedimientos reales** como base de su sugerencia,
sin inventar pasos que no existan institucionalmente:

### CORREO_INSTITUCIONAL
- Recuperar contraseña desde `mail.uce.edu.ec` → opción "recuperar contraseña".
- Si el usuario es nuevo (estudiante/docente recién admitido), las
  credenciales iniciales se envían a su correo personal registrado.
- Si el autoservicio falla → escalar al departamento informático de la
  facultad (nivel 1); si persiste, escalar a DTIC (nivel 2).

### SISTEMA_ACADEMICO_SIIU
- Usuario y contraseña son los mismos que el correo institucional.
- Errores de sistema comprobados (notas no reflejadas, matrícula bloqueada
  sin causa académica) → reportar a Secretaría de la Facultad, quien
  escala a Secretaría General/DTIC.
- Cambios de facultad o carrera y errores de sistema SIIU tienen
  procedimiento formal ante Secretaría General, no son autogestionables.

### AULA_VIRTUAL_EVA
- Verificar navegador compatible y limpiar caché como primer paso.
- Si el curso no aparece matriculado, validar primero en SIIU que la
  matrícula esté confirmada (la causa raíz suele estar ahí, no en el EVA).
- Contacto de plataforma: `campusvirtual@uce.edu.ec`.

### RED_CONECTIVIDAD
- La autenticación WiFi usa las credenciales del correo institucional.
- Si falla en un aula/laboratorio específico (varios usuarios afectados) →
  escalar como incidente de infraestructura de facultad, no como caso
  individual.

### BIBLIOTECA_VIRTUAL
- Acceso mediante correo institucional a las bases de datos científicas.
- Consultas de acceso a tesis/repositorio → Sistema Integrado de
  Bibliotecas (SIB) / RI-UCE.

### HARDWARE_LABORATORIOS
- Reporte inicial siempre al departamento informático de la facultad
  correspondiente (son quienes gestionan el inventario físico).

### SISTEMA_FINANCIERO_ADMINISTRATIVO
- Solo aplica a personal administrativo; escalar directamente a
  `soporte.tecnico@uce.edu.ec` según procedimiento de Administración
  Central.

---

## 9. Ejemplo de ticket ya clasificado (para calibrar al modelo — few-shot)

```json
{
  "input": {
    "tipo_usuario": "docente",
    "titulo": "No puedo iniciar la videollamada de mi clase",
    "descripcion": "Estoy en el aula ahora mismo y Teams no carga, mis 40 estudiantes están esperando"
  },
  "output": {
    "categoria": "AULA_VIRTUAL_EVA",
    "prioridad": "critico",
    "urgencia": "urgente",
    "impacto": "alto",
    "sugerencia_resolucion": "Verificar conexión a internet del aula y reiniciar sesión en Teams con credenciales institucionales. Si el problema persiste, escalar de inmediato al departamento informático de la facultad, ya que afecta a una clase completa en curso."
  }
}
```

---

## 10. Cómo integrar esto en el `PromptMgr` (Fase 2 de tu backend)

1. Guarda este documento como `contexto-institucional-uce.md` en el backend.
2. En `AIService.classify(ticket)`, construye el prompt de sistema
   concatenando: (a) el rol del asistente, (b) las secciones 6, 7 y 8 de
   este documento (taxonomía, reglas, KB), (c) el ejemplo few-shot de la
   sección 9, y (d) los datos del ticket actual.
3. Exige salida en JSON estricto con los 5 campos (`categoria`, `prioridad`,
   `urgencia`, `impacto`, `sugerencia_resolucion`) para que el backend
   pueda parsear la respuesta sin ambigüedad.
4. Si por ahora usas el clasificador mock (basado en palabras clave, sin
   LLM real), usa las reglas de la sección 7 y el diccionario de la
   sección 4 como tu tabla de decisión — así el mock ya se comporta de
   forma coherente con la universidad real, no genérica.

---

## Fuentes consultadas

Estructura de facultades, gobierno universitario, SIIU, correo institucional
y DTIC verificados contra la página oficial de la UCE (uce.edu.ec), el
Campus Virtual (uvirtual.uce.edu.ec), y comunicados institucionales de la
Dirección de Tecnologías de Información y Telecomunicaciones (2025-2026).
