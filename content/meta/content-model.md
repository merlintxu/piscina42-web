# Content Model · Piscina42-web

Este documento define los tipos de contenido y campos que se usan en `content/`
para describir la preparación de la Piscina de 42 Madrid.

## 1. Tipos de contenido

- Phase
- Module
- Challenge
- Resource
- Habit
- ExamSimulation

Cada tipo tiene un conjunto fijo de campos obligatorios y otros opcionales.
Hermes debe respetar estos campos al generar o modificar contenido.

---

## 2. Tipo: Phase

Representa una fase grande del plan de preparación (entorno, C básico, etc.).

### Campos

- `id` (string, obligatorio)
  - Identificador único, en `kebab-case`. Ej.: `fase1-entorno`.
- `title` (string, obligatorio)
  - Título corto de la fase. Ej.: `Fase 1: Entorno y flujo de trabajo`.
- `summary` (markdown, obligatorio)
  - Resumen de qué cubre la fase y por qué existe.
- `objectives` (lista de strings, obligatorio)
  - Objetivos pedagógicos concretos para la fase.
- `subphases` (lista de strings, opcional)
  - Ids o nombres de subfases internas. Ej.: `subfase-3-1-c01-punteros`.
- `modules` (lista de ids Module, opcional)
  - Módulos del currículo 42 asociados a esta fase. Ej.: `c01-punteros`, `c02-c03-cadenas`.
- `challenges` (lista de ids Challenge, opcional)
  - Retos destacados para esta fase.
- `resources` (lista de ids Resource, opcional)
  - Recursos recomendados para esta fase (cursos, repos, artículos).
- `habits` (lista de ids Habit, opcional)
  - Hábitos que el usuario debería practicar durante esta fase.

---

## 3. Tipo: Module

Representa un módulo del currículo de la Piscina (Shell00/01, C00–C13).

> **Convención de módulos C06 / C07 (separados):** en la Piscina real, C06
> (argumentos de línea de comandos, `argc`/`argv`) y C07 (asignación dinámica
> de memoria: `malloc`, `free`, `ft_strdup`, `ft_range`, `ft_ultimate_range`,
> `ft_strjoin`, `ft_split`) son módulos distintos. Por tanto se modelan con ids
> separados: **`c06-cli-args`** y **`c07-asignacion-dinamica`**. El id híbrido
> `c06-c07-cli-memoria` quedó retirado; no debe usarse.

### Campos

- `id` (string, obligatorio)
  - Identificador único. Ej.: `shell00-shell01`, `c01-punteros`.
- `title` (string, obligatorio)
  - Nombre del módulo. Ej.: `C01: Punteros`.
- `phase` (id Phase, obligatorio)
  - Fase principal a la que pertenece. Ej.: `fase3-c-intermedio`.
- `concepts` (lista de strings, obligatorio)
  - Conceptos principales del módulo. Ej.: `punteros`, `paso por referencia`.
- `cognitive_difficulties` (lista de strings, opcional)
  - Barreras cognitivas típicas (según tu informe Gemini). Ej.: `visualizar memoria RAM`.
- `description` (markdown, obligatorio)
  - Explicación del módulo, su rol dentro del currículo C00–C13.
- `challenges` (lista de ids Challenge, obligatorio)
  - Retos vinculados directamente a este módulo.
- `resources` (lista de ids Resource, opcional)
  - Recursos externos específicos (repositorios de Piscine, CS50, etc.).
- `level` (enum: `basic` | `intermediate` | `advanced`, obligatorio)
  - Nivel de dificultad relativo.

---

## 4. Tipo: Challenge

Representa un reto/práctica específica que el usuario puede completar.

### Campos

- `id` (string, obligatorio)
  - Identificador único. Ej.: `reto-c01-swap-int`.
- `title` (string, obligatorio)
  - Nombre corto del reto. Ej.: `Intercambio de enteros con punteros`.
- `module` (id Module, obligatorio)
  - Módulo 42 al que está asociado. Ej.: `c01-punteros`.
- `phase` (id Phase, opcional)
  - Fase del roadmap en la que se recomienda trabajar este reto.
- `statement` (markdown, obligatorio)
  - Enunciado completo del reto, con una única referencia a la función principal.
- `restrictions` (lista de strings, obligatorio)
  - Restricciones técnicas y de estilo (Norminette, longitud de función, variables máximas, etc.).
- `test_cases` (lista de bloques markdown, obligatorio)
  - Casos de prueba sugeridos con entradas/salidas esperadas.
- `difficulty` (enum: `easy` | `medium` | `hard`, obligatorio)
  - Dificultad relativa del reto.
- `tags` (lista de strings, opcional)
  - Tags libres: `punteros`, `memoria dinámica`, `examshell`, `rush`.
- `estimated_time_minutes` (integer, opcional)
  - Tiempo estimado para completar el reto.
- `norminette_focus` (boolean, opcional)
  - Si el reto está pensado explícitamente para practicar Norminette.

---

## 5. Tipo: Resource

Representa un recurso externo (curso, vídeo, repo, artículo, etc.).

### Campos

- `id` (string, obligatorio)
  - Identificador. Ej.: `resource-cs50x-week1`, `resource-exercism-c`.
- `title` (string, obligatorio)
  - Nombre del recurso.
- `type` (enum: `course` | `article` | `video` | `repository` | `tool`, obligatorio)
- `url` (string, obligatorio)
  - URL accesible.
- `description` (markdown, obligatorio)
  - Descripción breve, qué aporta y cómo se relaciona con la Piscina.
- `modules` (lista de ids Module, opcional)
  - Módulos a los que ayuda directamente.
- `phases` (lista de ids Phase, opcional)
  - Fases del roadmap en que se recomienda usarlo.
- `language` (string, opcional)
  - Idioma principal del recurso. Ej.: `es`, `en`.
- `cost` (enum: `free` | `paid` | `mixed`, opcional)

---

## 6. Tipo: Habit

Representa un hábito de estudio o práctica (no un reto técnico).

### Campos

- `id` (string, obligatorio)
  - Ej.: `habit-norminette-daily`, `habit-sleep-7h`.
- `title` (string, obligatorio)
- `description` (markdown, obligatorio)
- `phases` (lista de ids Phase, opcional)
- `frequency` (string, opcional)
  - Ej.: `daily`, `3x per week`.
- `metrics` (lista de strings, opcional)
  - Cómo medir que el hábito se está cumpliendo.

---

## 7. Tipo: ExamSimulation

Representa simulaciones de Examshell o mini-Piscina.

### Campos

- `id` (string, obligatorio)
  - Ej.: `exam-sim-1`, `mini-piscina-weekend-1`.
- `title` (string, obligatorio)
- `description` (markdown, obligatorio)
- `duration_minutes` (integer, obligatorio)
- `levels` (lista de ids Challenge, obligatorio)
  - Retos que componen la simulación, en orden.
- `rules` (lista de strings, obligatorio)
  - Reglas simplificadas inspiradas en Examshell (ventana de tiempo, entorno restringido, etc.).
- `phase` (id Phase, opcional)
  - Fase en la que se recomienda realizar esta simulación.

---