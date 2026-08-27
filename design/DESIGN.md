# DESIGN.md · Sistema visual inicial Piscina42-web

Este archivo describe el sistema visual base de la herramienta Piscina42-web.
Stitch generará una versión más detallada a partir de estos principios.

## Paleta de colores (conceptual)

- `color-bg-main`: #0b0f19  (fondo oscuro, tipo terminal/campus nocturno)
- `color-bg-card`: #141927
- `color-primary`: #4CAF50   (verde confianza / “OK” / progreso)
- `color-secondary`: #03A9F4 (azul enlace / recursos)
- `color-accent`: #FFC107    (amarillo para avisos, exam practice)
- `color-text-main`: #ECEFF4
- `color-text-muted`: #9FA7B8
- `color-border`: #2A2F3C

## Tipografía

- Fuente principal: Inter / system UI (sans-serif, legible para contenido técnico).
- Jerarquía:
  - H1: bold, 32px.
  - H2: bold, 24px.
  - H3: semi‑bold, 20px.
  - Body: regular, 14–16px.
  - Mono (para código/casos de prueba): Roboto Mono / similar.

## Espaciado y layout

- `spacing-xs`: 4px
- `spacing-sm`: 8px
- `spacing-md`: 16px
- `spacing-lg`: 24px
- `spacing-xl`: 32px

- Layouts:
  - Home: columna central max‑width 1200px, PhaseTimeline arriba, grid de PhaseCards abajo.
  - PhasePage: dos columnas (contenido principal + sidebar de hábitos/recursos).
  - ModulePage: contenido ancho, lista de retos en panel lateral o sección inferior.

## Component tokens

- Card:
  - bg: color-bg-card
  - border-radius: 12px
  - shadow: suave (0 4px 16px rgba(0,0,0,0.25))
  - padding: spacing-md

- Button:
  - primary: bg color-primary, text color-bg-main.
  - secondary: bg transparente, borde color-primary, texto color-primary.

## Estado y feedback

- Estados de reto:
  - pending: borde color-border, icono vacío.
  - completed: borde color-primary, icono check verde.
- Estados de fase:
  - not‑started, in‑progress, completed (para futuro panel de progreso).

Este documento es conceptual; Stitch debe tomarlo como referencia y generar un
sistema más detallado con tokens, componentes y variantes.