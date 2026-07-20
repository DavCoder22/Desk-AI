# Base de Conocimiento Institucional — UCE
## Contexto precargado para el motor de clasificación IA de la Mesa de Ayuda

Este documento es el **contexto de sistema** que se inyecta en cada llamada al
clasificador (LLM). Su propósito es que la IA no clasifique "en el vacío" sino
con el conocimiento real de cómo funciona la Universidad Central del Ecuador
(UCE), sus sistemas, su estructura de gobierno y sus procedimientos típicos de
soporte.

> **Cómo se usa:** este documento (o un resumen curado del mismo) se coloca
> como *system prompt* antes de cada solicitud de clasificación, junto con
> los datos del ticket (`tipo_usuario`, `titulo`, `descripcion`, `facultad`).

---

## 1. Identidad institucional

| Campo | Valor |
|---|---|
| Nombre completo | Universidad Central del Ecuador (UCE) |
| Tipo | Universidad pública |
| Fundación | 1826 |
| Ubicación | Ciudadela Universitaria, Av. América, Quito |
| Facultades | 21, más sedes en Galápagos y Santo Domingo |
| Estudiantes | ~30 000 |
| Lema | *Omnium potentior est sapientia* |

## 2. Estructura de gobierno (cogobierno universitario)

- **Rector/a** — máxima autoridad ejecutiva
- **3 Vicerrectorados:** Académico, Investigación, Administrativo
- **Honorable Consejo Universitario (HCU)** — órgano colegiado superior
- **Consejos Directivos de Facultad** — Decano/a + representantes

## 3. Facultades (unidad de enrutamiento `facultad_o_area`)

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
14. Facultad de Ingeniería, Ciencias Físicas y Matemática
15. Facultad de Ingeniería en Geología, Minas, Petróleos y Ambiental
16. Facultad de Ingeniería Química
17. Facultad de Jurisprudencia, Ciencias Políticas y Sociales
18. Facultad de Medicina Veterinaria y Zootecnia
19. Facultad de Odontología
20. Facultad de Ciencias Sociales y Humanas
21. Facultad de Ciencias de la Educación
Más: **Administración Central** (Rectorado, Vicerrectorados, Secretaría General)

## 4. Catálogo de sistemas tecnológicos reales de la UCE

| Sistema | URL / Nombre | Para qué sirve | A quién aplica |
|---|---|---|---|
| **Correo institucional** | `mail.uce.edu.ec` (Office 365) | Comunicación oficial; validación de identidad | Todos |
| **SIIU** | Portal académico-administrativo | Matrícula, notas/kardex, distributivo | Estudiantes, docentes, administrativos |
| **Campus Virtual / EVA** | `uvirtual.uce.edu.ec` | Aulas virtuales, tareas, materiales | Estudiantes, docentes |
| **Red WiFi institucional** | Red inalámbrica de campus | Conectividad; requiere autenticación con correo | Todos |
| **Biblioteca virtual / RI-UCE** | SIB | Bases de datos científicas, tesis | Estudiantes, docentes, investigadores |
| **Office 365 institucional** | Word, Excel, Teams, OneDrive | Ofimática y videoconferencia | Estudiantes, docentes |
| **Equipos y laboratorios de facultad** | Hardware físico | Computadores, proyectores | Estudiantes, docentes |
| **Sistema financiero/administrativo** | Módulos internos | Nómina, pagos, presupuesto | Personal administrativo |

**Contacto:** DTIC gestiona correo, SIIU y conectividad central. Cada facultad tiene un departamento informático (nivel 1). Administración Central reporta a `soporte.tecnico@uce.edu.ec`.

## 5. Actores del sistema (`tipo_usuario`)

| Actor | Solicitudes típicas | Consideración especial |
|---|---|---|
| **Estudiante** | Acceso a correo, SIIU (notas/matrícula), EVA, WiFi | Prioridad sube en periodo de matrícula/cierres |
| **Docente** | EVA, distributivo SIIU, Teams para clase, equipos de aula | Prioridad **alta automática** si es en horario de clase |
| **Administrativo** | Correo, sistema financiero/nómina, red interna | Prioridad alta si proceso tiene fecha límite |

## 6. Taxonomía de categorías (lista cerrada para la IA)

1. `CORREO_INSTITUCIONAL` — cuentas, contraseñas, Office 365
2. `SISTEMA_ACADEMICO_SIIU` — matrícula, notas, kardex, distributivo
3. `AULA_VIRTUAL_EVA` — acceso a cursos, tareas, materiales
4. `RED_CONECTIVIDAD` — WiFi campus, VPN, red de facultad
5. `HARDWARE_LABORATORIOS` — equipos, proyectores, laboratorios
6. `BIBLIOTECA_VIRTUAL` — bases de datos, repositorio, tesis
7. `SISTEMA_FINANCIERO_ADMINISTRATIVO` — nómina, pagos (solo administrativos)
8. `CUENTA_ACCESOS_GENERAL` — creación/activación de credenciales no cubierta
9. `OTROS` — únicamente si no encaja en ninguna anterior

## 7. Reglas de clasificación (prioridad / urgencia / impacto)

**Impacto:**
- `alto` → afecta a un aula, facultad, o sistema central (SIIU, correo, WiFi)
- `medio` → afecta a un grupo pequeño (laboratorio, carrera)
- `bajo` → afecta a un solo usuario

**Urgencia:**
- `urgente` → bloquea actividad con fecha límite hoy (examen, cierre notas, clase)
- `alto` → bloquea actividad de la semana
- `medio` → puede esperar días
- `bajo` → sin fecha límite

**Prioridad** = impacto × urgencia (matriz ITIL):
| | Urgencia alta | Urgencia media | Urgencia baja |
|---|---|---|---|
| Impacto alto | Crítico | Alto | Medio |
| Impacto medio | Alto | Medio | Bajo |
| Impacto bajo | Medio | Bajo | Bajo |

**Reglas específicas:**
- Si `tipo_usuario = docente` y descripción menciona "ahora"/"en este momento"/"estoy en clase" → `urgencia = urgente`
- Si menciona "no puedo matricularme" y en periodo de matrícula → `impacto = alto`, `categoria = SISTEMA_ACADEMICO_SIIU`
- Si menciona "WiFi" + aula/laboratorio → `impacto = medio` como mínimo
- Si menciona "contraseña" o "no puedo entrar" → categoría del sistema mencionado, no CUENTA_ACCESOS_GENERAL

## 8. Base de conocimiento de resoluciones (KB)

### CORREO_INSTITUCIONAL
- Recuperar contraseña desde `mail.uce.edu.ec` → opción "recuperar contraseña"
- Credenciales iniciales se envían al correo personal registrado
- Si autoservicio falla → escalar a departamento informático facultad (nivel 1) → DTIC (nivel 2)

### SISTEMA_ACADEMICO_SIIU
- Usuario/contraseña = mismos que correo institucional
- Notas no reflejadas, matrícula bloqueada → reportar a Secretaría de Facultad → Secretaría General/DTIC
- Cambios de facultad/carrera requieren procedimiento formal ante Secretaría General

### AULA_VIRTUAL_EVA
- Verificar navegador compatible y limpiar caché
- Si curso no aparece → validar matrícula en SIIU primero
- Contacto: `campusvirtual@uce.edu.ec`

### RED_CONECTIVIDAD
- Autenticación WiFi usa credenciales de correo institucional
- Si falla en aula/laboratorio específico (varios afectados) → escalar como incidente de infraestructura

### BIBLIOTECA_VIRTUAL
- Acceso mediante correo institucional a bases de datos
- Consultas de acceso → SIB / RI-UCE

### HARDWARE_LABORATORIOS
- Reporte inicial al departamento informático de la facultad correspondiente

### SISTEMA_FINANCIERO_ADMINISTRATIVO
- Solo aplica a personal administrativo; escalar a `soporte.tecnico@uce.edu.ec`

## 9. Ejemplo few-shot

---
**Input:**
```json
{
  "tipo_usuario": "docente",
  "titulo": "No puedo iniciar la videollamada de mi clase",
  "descripcion": "Estoy en el aula ahora mismo y Teams no carga, mis 40 estudiantes estan esperando"
}
```
**Output:**
```json
{
  "categoria": "AULA_VIRTUAL_EVA",
  "prioridad": "critico",
  "urgencia": "urgente",
  "impacto": "alto",
  "sugerencia_resolucion": "Verificar conexion a internet del aula y reiniciar sesion en Teams con credenciales institucionales. Si el problema persiste, escalar de inmediato al departamento informatico de la facultad, ya que afecta a una clase completa en curso."
}
```
---

## 10. Integración en PromptMgr

1. Este documento se guarda como `contexto-institucional-uce.md` en `backend/contexto/`
2. En `AIService.classify()`, construir system prompt con: rol del asistente + secciones 6, 7, 8 + ejemplo few-shot + datos del ticket
3. Exigir salida JSON con: `categoria`, `prioridad`, `urgencia`, `impacto`, `sugerencia_resolucion`
4. Si se usa clasificador mock (keywords), usar reglas de sección 7 y diccionario de sección 4
