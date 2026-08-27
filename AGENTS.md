# Project Context · Piscina42-web

## Propósito

Este proyecto contiene:
- El modelo de contenido y los materiales para preparar la Piscina de 42 Madrid.
- Una futura web interactiva (app/) que usará estos contenidos.
- Integración con un vault de Obsidian para revisión, enlaces y PKM.

Hermes debe ayudar a investigar, estructurar y rellenar contenido en `content/`,
y sólo tocar código en `app/` cuando se le pida explícitamente.

## Estructura del proyecto

- `docs/` — documentación general (README, visión, roadmap Google).
- `design/` — sistema visual (DESIGN.md exportado desde Stitch, mapa de componentes).
- `content/` — conocimiento estructurado (phases, modules, retos, recursos, meta).
- `app/` — código de la web (models, pages, components, services, public).
- `agent/` — definiciones de agentes específicos (content-agent, code-agent, eval-agent).
- `scripts/` — scripts para md→JSON, sincronización, etc.

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