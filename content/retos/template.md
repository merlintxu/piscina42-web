# Plantilla de Challenge (reto individual)

> Formato real usado en `content/retos/*.md` (fichas individuales y dentro de
> colecciones `challenge-collection`). Sustituye los placeholders `{{...}}`.

## Como reto individual (nota espejo en vault)

```markdown
---
id: {{id}}                       # kebab-case, ej. reto-c01-swap-int
type: challenge
title: "{{title}}"
source: piscina42-web
module: {{module_id}}           # ej. c01-punteros
phase: {{phase_id}}             # ej. fase3-c-intermedio
difficulty: {{difficulty}}      # easy | medium | hard
estimated_time_minutes: {{min}}
---

# {{title}}

### Enunciado

{{statement_markdown}}

### Restricciones

- {{restriction_1}}
- {{restriction_2}}

### Casos de prueba sugeridos

```text
{{test_case_1}}
{{test_case_2}}
```

### Dificultad y tags

- Dificultad: {{difficulty}}
- Tags: {{tag_1}}, {{tag_2}}

## Relaciones (vault)

- Reto → Módulo
- [[{{module_id}}]]
- Reto → Fase
- [[{{phase_id}}]]
```

## Como hijo dentro de una colección (`challenge-collection`)

Dentro del archivo `c-retos-basicos.md` (u otro), cada reto se escribe así
(repite el frontmatter por hijo para que el script de sync genere la nota
individual en el vault):

```markdown
## {{id}}

---
id: {{id}}
type: challenge
title: "{{title}}"
source: piscina42-web
module: {{module_id}}
phase: {{phase_id}}
difficulty: {{difficulty}}
estimated_time_minutes: {{min}}
---

### Enunciado
...
```

Notas:
- Campos obligatorios según content-model: `id`, `title`, `module`, `statement`,
  `restrictions`, `test_cases`, `difficulty`.
- NO usar el formato `## {{id}}` sin frontmatter (plantilla obsoleta).
