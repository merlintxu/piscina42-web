# Notas de exportación desde Google Stitch · Piscina42-web

## Objetivo

Usar Google Stitch para:

- Generar un diseño de alta fidelidad para:
  - Home (PhaseTimeline + PhaseCards).
  - PhasePage.
  - ModulePage.
  - ChallengePage.
- Exportar:
  - Diseño visual (DESIGN.md actualizado con tokens, componentes, estilos).
  - Código base de frontend (React, si es posible) para integrarlo en `app/`.

## Procedimiento estándar

1. Preparar el prompt de Stitch (ver sección Prompt abajo).
2. Abrir Stitch: https://stitch.withgoogle.com/
3. Crear un nuevo proyecto “Piscina42-web”.
4. Pegar el prompt en Stitch, incluyendo:
   - Descripción de la herramienta.
   - Componentes clave (PhaseTimeline, ModuleView, ChallengeCard).
   - Estilo deseado (basado en este DESIGN.md).
5. Ajustar manualmente:
   - Layouts.
   - Detalles de tipografía y colores.
   - Estados de componentes (hover, completed, etc.).
6. Exportar:
   - DESIGN.md desde Stitch (reemplazar el actual en `design/`).
   - Código UI (React/HTML/CSS) y copiarlo en `app/src/components/` y `app/src/pages/`.

7. Anotar en este archivo:
   - Fecha de exportación.
   - Versión del diseño.
   - Cambios importantes respecto al diseño anterior.

## Prompt base para Stitch

Ver “Prompt para Google Stitch” (archivo o sección aparte); actualizar cuando
cambien componentes o prioridades del proyecto.