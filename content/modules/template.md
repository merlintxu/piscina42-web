# Plantilla de Module (ficha de módulo C00–C13)

> Formato real usado en `content/modules/*.md` (coherente con el content-model y
> con las notas espejo del vault). Sustituye los placeholders `{{...}}`.

```markdown
---
id: {{id}}                       # kebab-case, ej. c01-punteros
type: module
title: "{{title}}"               # ej. C01: Punteros
source: piscina42-web
phase: {{phase}}                 # ej. fase3-c-intermedio
level: {{level}}                # basic | intermediate | advanced
concepts:
  - {{concept_1}}
  - {{concept_2}}
cognitive_difficulties:
  - {{difficulty_1}}
challenges:
  - {{challenge_id_1}}
  - {{challenge_id_2}}
resources:
  - {{resource_id_1}}
---

# {{title}}

## Conceptos clave

- {{concept_1}}
- {{concept_2}}

## Dificultades cognitivas

- {{difficulty_1}}

## Descripción

{{description_markdown}}

## Retos vinculados

- [[{{challenge_id_1}}]] – {{challenge_title_1}}
- [[{{challenge_id_2}}]] – {{challenge_title_2}}

## Recursos recomendados

- [[{{resource_id_1}}]] – {{resource_title_1}}

## Relaciones (vault)

- Módulo → Fase
- [[{{phase}}]]
- Módulo → Retos
- [[{{challenge_id_1}}]], [[{{challenge_id_2}}]]
- Módulo → Recursos
- [[{{resource_id_1}}]]
```

Notas:
- Mantener SIEMPRE frontmatter YAML (no el formato `## {{id}}` antiguo).
- Los enlaces `[[...]]` crean backlinks automáticos en el vault (espejo).
- Respetar los campos obligatorios de `content/meta/content-model.md`.
