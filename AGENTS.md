# Project Context · Piscina42-web

## Propósito

Este proyecto contiene:
- El modelo de contenido y los materiales para preparar la Piscina de 42 Madrid.
- Una futura web interactiva (app/) que usará estos contenidos.
- Integración con un vault de Obsidian para revisión, enlaces y PKM.

Hermes debe ayudar a investigar, estructurar y rellenar contenido en `content/`,
y sólo tocar código en `app/` cuando se le pida explícitamente.

## Estructura del proyecto

- `docs/` — documentación general (README, visión, roadmap Google, TRAINING-OS-PHASE2.md).
- `design/` — sistema visual (DESIGN.md exportado desde Stitch, mapa de componentes).
- `content/` — conocimiento estructurado (phases, modules, retos, recursos, meta).
- `src/` (y `app/`) — código de la aplicación web (views, components, lib, training).
- `src/training/` — Piscina42 Training OS (Skill Matrix, Diagnóstico, Misiones Diarias, Readiness, persistence).
- `agent/` — definiciones de agentes específicos (content-agent, code-agent, eval-agent).
- `scripts/` — scripts para md→JSON, sincronización, etc.

## Módulo Training OS (Fase 2.1)

- Gestiona el entrenamiento adaptativo diario con fecha objetivo por defecto `2026-10-26`.
- El estado de entrenamiento persiste en `localStorage` bajo la clave `piscina42_training_v1`.
- La evaluación diagnóstica consta de 24 preguntas deterministas que calibran la matriz de competencias (escala 0-5).
- El cálculo del Readiness Score es determinista y no depende de APIs externas de IA.
- Se mantiene sincronizado con los retos completados en `piscina42_progress_v1` sin mutarlo.

## Convenciones de contenido

- El modelo de contenido está definido en `content/meta/content-model.md`.
- Las plantillas para Module, Challenge y Resource están en:
  - `content/modules/template.md`
  - `content/retos/template.md`
  - `content/recursos/template.md`
- Toda ficha de módulo, reto o recurso debe respetar ese modelo y esas plantillas.
- Los IDs siguen `kebab-case`: `c01-punteros`, `reto-c01-swap-int`, `resource-cs50x-week1`.

## Reglas para Hermes

- Trabajar principalmente en `content/` y notas relacionadas en el vault de Obsidian.
- No modificar `app/` ni `scripts/` sin instrucciones explícitas.
- Antes de generar mucho contenido, leer ejemplos ya rellenados:
  - `content/phases/fase1-entorno.md`
  - `content/modules/shell00-shell01.md`
  - `content/modules/c01-punteros.md`
  - `content/retos/c-retos-basicos.md`
  - `content/recursos/cs50-recursos.md`

## Integración con Obsidian

- El vault de Obsidian está configurado vía `OBSIDIAN_VAULT_PATH` en el `.env` del perfil `piscina42`.
- Hermes debe usar la skill Obsidian para leer y escribir notas relacionadas con este proyecto,
  manteniendo la estructura de grafos (wikilinks entre fases, módulos, retos y recursos).
- Sólo debe escribir en la carpeta de proyecto dentro del vault que el usuario indique.

## Qué evitar

- No borrar ni renombrar archivos de contenido sin confirmación explícita.
- No introducir tipos de contenido nuevos sin actualizar antes `content-model.md`.
- No mezclar contexto de este proyecto con otros proyectos del usuario.