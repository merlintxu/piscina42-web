# CONTENT-JSON · Pipeline Markdown → JSON

Script: `scripts/md-to-json.ts`
Salida: `app/public/content.json`

## Qué hace

Recorre `content/` y construye un objeto `ContentJSON` con el schema refinado del
proyecto (ver `meta/CONTENT-PLAN.md` → ANEXO). No modifica ningún `.md`: solo lee.

```jsonc
{
  "phases":     Phase[],
  "modules":    Module[],
  "challenges": Challenge[],
  "resources":  Resource[],
  "habits":     Habit[],
  "exams":      ExamSimulation[]
}
```

## Cómo se mapea cada carpeta

| Carpeta              | Entidad            | Notas de parseo                                            |
|----------------------|--------------------|------------------------------------------------------------|
| `content/phases/`    | Phase              | 1 doc por archivo (frontmatter `type: phase`).            |
| `content/modules/`   | Module             | 1 doc por archivo (frontmatter `type: module`).           |
| `content/retos/`     | Challenge          | Notas individuales + colecciones (`challenge-collection`).|
| `content/recursos/`  | Resource           | Notas individuales + colecciones (`resource-collection`). |
| `content/habits/`    | Habit              | 1 doc por archivo (frontmatter `type: habit`).            |
| `content/retos/exam-simulations.md` | ExamSimulation | Colección de 6 bloques `---` fm `---` sin envoltura. |

## Formato de las colecciones

Las colecciones (`challenge-collection` / `resource-collection`) tienen un frontmatter
de envoltura y, en el body, bloques hijo con este formato:

```markdown
## <id>

---
id: <id>
type: challenge        # o resource
slug: <id>
title: ...
# ... campos ...
---

### Enunciado
...
```

El pipeline localiza el `---` de cada bloque hijo y extrae su frontmatter.

## Parser de frontmatter

No usa `js-yaml` (falla con `:` en valores sin comillas, p.ej. `title: C06: ...`).
Usa un parser propio que:

- Quita BOM UTF-8 si lo hay.
- Normaliza CRLF → LF (el repo mezcla ambos).
- Soporta strings, números, booleanos y listas (`- item`).

## Ejecución

Desde la raíz del repo:

```bash
# 1) compilar (solo build-time; typescript vive en scripts/)
cd scripts
npm install --no-save typescript@5 @types/node@20
./node_modules/.bin/tsc -p tsconfig.json

# 2) generar el JSON
node dist/md-to-json.js
```

O, si prefieres ts-node:

```bash
cd scripts
npm install --no-save typescript@5 ts-node@10 @types/node@20
npx ts-node md-to-json.ts
```

Salida esperada (con el content/ actual):

```
content.json generado en .../app/public/content.json
  phases:    4
  modules:   9
  challenges:55
  resources: 28
  habits:    13
  exams:     6
```

> Nota: `app/` está excluido en `.gitignore`, así que `app/public/content.json` NO se
> versiona. Hay que regenerarlo con este script tras cualquier cambio en `content/`.

## Dependencias

- `typescript` (build-time, en `scripts/`). El script compilado (`dist/md-to-json.js`)
  no necesita ninguna dependencia de runtime salvo Node estándar.
