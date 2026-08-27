# Plantilla de Resource (recurso externo)

> Formato real usado en `content/recursos/*.md` (fichas individuales y dentro de
> colecciones `resource-collection`). Sustituye los placeholders `{{...}}`.

## Como recurso individual (nota espejo en vault)

```markdown
---
id: {{id}}                       # kebab-case, ej. resource-cs50x-week1
type: resource
title: "{{title}}"
source: piscina42-web
type_resource: {{type}}         # course | article | video | repository | tool
url: {{url}}
modules:
  - {{module_id_1}}
phases:
  - {{phase_id_1}}
language: {{language}}          # es | en
cost: {{cost}}                  # free | paid | mixed
---

# {{title}}

### Descripción

{{description_markdown}}

## Relaciones (vault)

- Recurso → Módulos
- [[{{module_id_1}}]]
- Recurso → Fases
- [[{{phase_id_1}}]]
```

## Como hijo dentro de una colección (`resource-collection`)

Igual que el individual, pero anidado bajo `## {{id}}` y repitiendo el
frontmatter para que el sync genere la nota espejo:

```markdown
## {{id}}

---
id: {{id}}
type: resource
title: "{{title}}"
source: piscina42-web
type_resource: {{type}}
url: {{url}}
modules:
  - {{module_id_1}}
phases:
  - {{phase_id_1}}
language: {{language}}
cost: {{cost}}
---

### Descripción

{{description_markdown}}
```

Notas:
- Campos obligatorios según content-model: `id`, `title`, `type`, `url`,
  `description`.
- El campo `type` del frontmatter es el tipo de entidad (`resource`); el subtipo
  (course/article/...) va en `type_resource` para no colisionar con `type`.
- NO usar el formato `## {{id}}` sin frontmatter (plantilla obsoleta).
