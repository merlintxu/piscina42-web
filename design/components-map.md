# Mapa de componentes UI · Piscina42-web

Este documento describe los componentes clave de la interfaz de la herramienta
de preparación de la Piscina de 42 Madrid. Sirve como referencia para Stitch,
Google AI Studio y cualquier agente de código.

## Componentes principales

### PhaseTimeline

- Rol: mostrar las 4 fases de preparación (entorno, C básico, C intermedio, simulación) como un roadmap horizontal o vertical.
- Datos:
  - `Phase[]` (id, title, summary, modules, challenges, resources, habits).
- Interacciones:
  - Clic en una fase → navegar a PhasePage correspondiente.

### PhaseCard

- Rol: tarjeta resumen de una fase, usada en la home o en listados.
- Datos:
  - `id`, `title`, breve `summary`, número de módulos/retos/recursos asociados.
- Interacciones:
  - Clic → PhasePage.

### PhasePage

- Rol: vista detallada de una fase.
- Secciones:
  - Encabezado con título y objetivos.
  - Lista de módulos (ModuleCard).
  - Lista de retos destacados.
  - Bloque de hábitos recomendados.
  - Bloque de recursos externos.

### ModuleCard

- Rol: representación compacta de un módulo (Shell00–01, C01, C07, etc.).
- Datos:
  - `Module` (id, title, level, phase, summary breve, recuento de retos).
- Interacciones:
  - Clic → ModulePage.

### ModulePage (ModuleView)

- Rol: vista detallada del módulo (conceptos, dificultades, retos, recursos).
- Secciones:
  - Encabezado: título, nivel, fase.
  - Conceptos clave (lista).
  - Dificultades cognitivas.
  - Descripción (render Markdown).
  - Lista de retos asociados (ChallengeCard).
  - Lista de recursos asociados (ResourceCard).

### ChallengeCard

- Rol: tarjeta que resume un reto.
- Datos:
  - `Challenge` (id, title, module, difficulty, estimated_time).
- Estado:
  - Pendiente / completado (checkbox o icono).
- Interacciones:
  - Clic → ChallengePage (opcional) o modal con enunciado completo.

### ChallengePage

- Rol: vista completa de un reto (enunciado, restricciones, casos de prueba).
- Secciones:
  - Encabezado: título, módulo, fase, dificultad.
  - Enunciado (Markdown).
  - Restricciones (lista).
  - Casos de prueba (bloque de código/Texto).
  - Tags y tiempo estimado.

### ResourceCard

- Rol: tarjeta de recurso externo.
- Datos:
  - `Resource` (title, type, url, modules, phases, language, cost).
- Interacciones:
  - Clic → abrir recurso en nueva pestaña.

### HabitCard

- Rol: tarjeta de hábito de estudio.
- Datos:
  - `Habit` (title, description breve, phases, frequency, metrics).
- Interacciones:
  - Marcar como “activo” o “en práctica”.

### ExamSimulationCard

- Rol: tarjeta de simulación de examen (ExamSimulation).
- Datos:
  - id, título, duración, lista de retos.
- Interacciones:
  - Clic → pantalla de detalle con instrucciones para hacer la simulación.

### GlossaryEntry

- Rol: ficha de glosario.
- Datos:
  - `id`, nombre del concepto, definición, contexto, relaciones con fases/módulos.
- Interacciones:
  - Puede aparecer como tooltip o sección de glosario.

## Layouts principales

- HomeLayout:
  - PhaseTimeline + PhaseCards.
- PhaseLayout:
  - Header de fase + grid de ModuleCards + panel de hábitos + lista de recursos.
- ModuleLayout:
  - ModulePage + sidebar con retos y recursos.
- ChallengeLayout:
  - ChallengePage centrado, con navegación a módulo/fase.

Estos componentes deben respetar el sistema visual definido en DESIGN.md.