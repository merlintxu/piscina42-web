# CONTENT-PLAN · Generación del resto de contenidos (Piscina42-web)

**Fecha:** 2026-08-27
**Fuente de verdad:** `content/` (repo). El vault es espejo navegable.
**Estado previo:** 6 golden examples completos (fase1, fase3, shell00-shell01, c01-punteros,
c-retos-basicos, cs50-recursos). Resto en stubs. Modelo y C06/C07 ya corregidos según decisión de usuario.

## Reglas de generación
- Seguir `content/meta/content-model.md` como contrato de tipos/campos.
- Seguir `content/modules/template.md`, `content/retos/template.md`, `content/recursos/template.md`.
- Imitar el estilo y nivel de detalle de los golden examples.
- No cambiar IDs ni el modelo sin aprobación. Cambios sugeridos se proponen, no se aplican en masa.
- Cada lote: toca `content/` y luego espejo en vault, manteniendo IDs y relaciones. Informe antes/después.

## Inventario de pendientes (stubs → contenido)
### Phases
- `fase2-c-basico` · `fase4-simulacion`

### Modules (stubs)
- `c00-intro` · `c02-c03-cadenas` · `c04-c05-conversion-recursion` · `c06-cli-args` · `c07-asignacion-dinamica` · `c08-c09-structs-lib` · `c10-c13-avanzado`

### Retos (colecciones a poblar + retos referenciados sin autoría)
- `c-retos-intermedios`, `shell-retos`, `examshell-retos`, `rush-retos`
- Referenciados pendientes: `reto-shell00-midls`, `reto-shell00-git-clean`, `reto-shell01-find-sh`, `reto-c02-strlen-strcmp`

### Recursos (colecciones a poblar + referenciados sin autoría)
- `cursos-bash-git`, `exercism-c`, `norminette-moulinette`
- Referenciados pendientes: `resource-shell00-subject`, `resource-shell01-subject`, `resource-bash-basics`, `resource-git-basics`, `resource-exercism-c-basics`, `resource-norminette-overview`

## Lotes
### Lote 1 — Fundamentos (C00/C02 + Bash/Git + Shell)
- `content/phases/fase2-c-basico.md` (completar)
- `content/modules/c00-intro.md` (completar)
- `content/modules/c02-c03-cadenas.md` (completar)
- `content/retos/c-retos-basicos.md` → añadir `reto-c02-strlen-strcmp`
- `content/recursos/cursos-bash-git.md` (poblar colección: resource-bash-basics, resource-git-basics, resource-shell00-subject, resource-shell01-subject)
- `content/retos/shell-retos.md` → añadir reto-shell00-midls, reto-shell00-git-clean, reto-shell01-find-sh

### Lote 2 — C04/C05
- `content/modules/c04-c05-conversion-recursion.md`
- `content/retos/c-retos-intermedios.md` (retos de conversión/recursión)

### Lote 3 — C06/C07
- `content/modules/c06-cli-args.md`
- `content/modules/c07-asignacion-dinamica.md`
- `content/retos/c-retos-intermedios.md` (retos de memoria dinámica: ft_strdup, ft_range, ft_strjoin, ft_split)

### Lote 4 — C08/C09
- `content/modules/c08-c09-structs-lib.md`
- `content/retos/c-retos-intermedios.md` (structs, macros, librerías)

### Lote 5 — C10–C13 + Simulación + Examshell/Rush
- `content/modules/c10-c13-avanzado.md`
- `content/phases/fase4-simulacion.md`
- `content/retos/examshell-retos.md`
- `content/retos/rush-retos.md`
- `content/recursos/norminette-moulinette.md`

## Notas de consistencia detectadas
- El `type` de las colecciones en el repo es `challenge-collection` / `resource-collection`, pero las
  plantillas `template.md` usan `## {{id}}` sin frontmatter. Mantener el formato de golden examples
  (frontmatter + secciones) para consistencia; no revertir a plantilla sin acuerdo.
- `resource-exercism-c-basics` referenciado en c01-punteros; se poblará en `exercism-c.md` (Lote 1 o 3).
