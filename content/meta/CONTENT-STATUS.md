# CONTENT-STATUS · Auditoría del estado actual (Piscina42-web)

**Fecha:** 2026-08-27
**Fuente de verdad:** `content/` (repo). El vault de Obsidian es espejo navegable.

## Estado por tipo de contenido

### Phases
| Fase | Archivo | Estado |
|------|--------|--------|
| fase1-entorno | phases/fase1-entorno.md | ✅ completa (golden) |
| fase2-c-basico | phases/fase2-c-basico.md | ✅ completa (Lote 1 previo) |
| fase3-c-intermedio | phases/fase3-c-intermedio.md | ✅ completa (golden + lotes) |
| fase4-simulacion | phases/fase4-simulacion.md | ✅ completa (Lote 5 previo) |

### Modules
| Módulo | Archivo | Estado |
|--------|--------|--------|
| shell00-shell01 | modules/shell00-shell01.md | ✅ completa (golden) |
| c00-intro | modules/c00-intro.md | ✅ completa (Lote 1) |
| c01-punteros | modules/c01-punteros.md | ✅ completa (golden) |
| c02-c03-cadenas | modules/c02-c03-cadenas.md | ✅ completa (Lote 1) |
| c04-c05-conversion-recursion | modules/c04-c05-conversion-recursion.md | ✅ completa (Lote 2) |
| c06-cli-args | modules/c06-cli-args.md | ✅ completa (Lote 3) |
| c07-asignacion-dinamica | modules/c07-asignacion-dinamica.md | ✅ completa (Lote 3) |
| c08-c09-structs-lib | modules/c08-c09-structs-lib.md | ✅ completa (Lote 4) |
| c10-c13-avanzado | modules/c10-c13-avanzado.md | ✅ completa (Lote 5) |

> Todas las fichas de Module existen y están completas. Lo que FALTAN son
> **retos adicionales inspirados en repos/subjects reales** para enriquecerlas
> (la FASE 1 de este plan), no volver a escribir las fichas.

### Challenges (retos)
Colecciones existentes y sus hijos:
- `c-retos-basicos` (C00–C02): reto-c01-swap-int, reto-c01-pointer-arithmetic, reto-c02-strlen-strcmp,
  reto-c00-ft-putchar, reto-c00-ft-print-alphabet, reto-c00-ft-ft, reto-c01-ft-putstr,
  reto-c02-ft-strcpy ✅
- `shell-retos` (Shell00–01): reto-shell00-midls, reto-shell00-git-clean, reto-shell01-find-sh ✅
- `c-retos-intermedios` (C03–C09): reto-c03-ft-substr, reto-c03-ft-strncmp, reto-c04-ft-atoi, reto-c04-ft-itoa,
  reto-c05-fibonacci, reto-c05-factorial, reto-c05-ft-power, reto-c06-argv-count, reto-c06-ft-putstr-tab,
  reto-c06-ft-atoi-base, reto-c07-ft-strdup, reto-c07-ft-range, reto-c07-ft-ultimate-range, reto-c07-ft-strjoin,
  reto-c07-ft-split, reto-c08-struct-basic, reto-c08-ft-list-size, reto-c08-ft-list-add-back, reto-c08-ft-list-sort,
  reto-c09-makefile-lib, reto-c09-ft-btree-basic ✅
- `c10-c13-retos` (C10–C13): reto-c10-bst-insert, reto-c10-bst-remove, reto-c11-stack, reto-c11-queue,
  reto-c12-templates, reto-c12-hash-map ✅
- `examshell-retos`: reto-examshell-c01, reto-examshell-c07 ✅ (A AMPLIAR en FASE 4)
- `rush-retos`: reto-rush-team ✅

### Resources (recursos)
Colecciones:
- `cs50-recursos`: resource-cs50x-week1, resource-cs50x-week5, resource-cs50x-overview ✅
- `cursos-bash-git`: resource-bash-basics, resource-git-basics, resource-shell00-subject, resource-shell01-subject ✅
- `exercism-c`: resource-exercism-c-basics ✅ (A AMPLIAR en FASE 2)
- `norminette-moulinette`: resource-norminette-overview, resource-moulinette ✅ (A AMPLIAR en FASE 2)

> FASE 1 COMPLETADA (2026-08-27, sesión de continuación). Retos base/Shell ya existían;
> se añadieron los retos inspirados en repos/subjects reales para C03, C05 (power),
> C06 (putstr_tab, atoi_base), C08 (add_back, sort), C09 (btree) y C10–C13
> (bst_remove, queue, hash_map). Total en repo: 20 en c-retos-intermedios, 6 en c10-c13-retos.
> El vault (espejo) se sincronizó: 0 wikilinks rotos verificados.
>
> FASE 2 COMPLETADA: 4 colecciones ampliadas (+17 recursos con URL reales) y nueva
> colección `exam-practice.md` (+3). Mapeados 2–6 recursos por módulo.
> FASE 3 COMPLETADA: 13 hábitos (3 originales + 10 nuevos).
> FASE 4 COMPLETADA: `examshell-retos.md` con 12 retos (C00–C12); `exam-simulations.md`
> con 6 ExamSimulation; mapeados en `fase4-simulacion.md`.
> FASE 5 COMPLETADA: `meta/glossary.md` poblado con 16 entradas.
> FASE 6 COMPLETADA: vault sincronizado (79 notas, 0 wikilinks rotos), MOC regenerado,
> SYNC-LOG y CONTENT-STATUS actualizados. **CONTENT-PLAN 100% ejecutado.**

---

## FASE A · Adopción del schema refinado (rama feature/schema-and-app) — 2026-08-27

**Estado:** ✅ APLICADO en `content/`. Pendiente de regenerar el vault espejo (mismo grafo de ids).

Campos añadidos sin alterar el significado de las notas:

- **Phase** (4): `slug` (= id), `order` (1–4), `summary` (2–3 frases).
- **Module** (9): `slug` (= id), `order` (1–9 según progresión Shell→C→avanzado),
  `concepts[]` y `cognitive_difficulties[]` extraídos de las secciones del body.
- **Challenge** (35 en total): `slug` (= id), `tags[]` (de la sección "Tags:" del body),
  `norminette_focus` (`true` para retos de C; `false` para los de Shell).
- **Habit** (13): `slug` (= id).
- **ExamSimulation** (6): `slug` (= id). `duration_minutes`, `levels[]`, `rules[]` ya presentes.
- **Resource**: normalización de `type`. Antes había colisión (repetían `type: resource`
  y luego el subtipo). Ahora `type` es el subtipo único (course/article/repository/tool/book)
  y la entidad Resource se infiere por directorio en el pipeline. Ver `meta/CONTENT-PLAN.md`.

**Decisión de modelo:** la entidad se deriva de la carpeta (`phases/`, `modules/`,
`retos/`, `recursos/`, `habits/`) + tipo de frontmatter; `exam-simulations.md` se parsea
como colección de 6 `ExamSimulation` sin envoltura.

**Siguiente fase:** FASE B (script `scripts/md-to-json.ts` alineado al schema → `app/public/content.json`).

---

## FASE B · Pipeline Markdown→JSON (feature/schema-and-app) — 2026-08-27

**Estado:** ✅ IMPLEMENTADO y verificado (build OK).

- `scripts/md-to-json.ts`: recorre `content/`, parsea frontmatter (parser propio,
  tolerante a BOM/CRLF y `:` en valores), expande colecciones
  (`challenge-collection`/`resource-collection`) y `exam-simulations.md`.
- Salida: `app/public/content.json` con `ContentJSON = { phases, modules,
  challenges, resources, habits, exams }`.
- Conteo real generado: **4 phases, 9 modules, 55 challenges, 28 resources,
  13 habits, 6 exams**.
- `docs/CONTENT-JSON.md`: schema + instrucciones de ejecución.
- `.gitignore`: añadidos `/scripts/node_modules/` y `/scripts/dist/`.

**Nota:** `app/` sigue excluido en `.gitignore`; `app/public/content.json` se
regenera con el script tras cualquier cambio en `content/`.

---

## FASE C · Esqueleto de la web en React (feature/schema-and-app) — 2026-08-27

**Estado:** ✅ IMPLEMENTADO y verificado (`npm run build` → 206 módulos, sin errores).

- Stack: **Vite + React + TypeScript** (SPA de datos estáticos).
- `app/package.json`, `app/vite.config.ts`, `app/tsconfig.json`, `app/index.html`.
- `app/src/models/index.ts`: tipos TS equivalentes al schema.
- `app/src/services/contentLoader.ts`: carga `content.json` y helpers
  (`getPhases`, `getPhaseById`, `getModulesByPhase`, `getModuleById`,
  `getChallengesByModule`, `getResourcesByModule`, `getHabitsByPhase`,
  `getExamSimulationsByPhase`, + extras).
- `app/src/pages/Home.tsx`: grid de `PhaseCard` con título, summary y CTA.
- `app/src/pages/PhasePage.tsx`: objetivos (react-markdown), módulos, hábitos,
  simulaciones y recursos de la fase.
- `app/src/pages/ModulePage.tsx`: conceptos, dificultades, body (react-markdown),
  retos y recursos del módulo.
- Componentes: `PhaseCard`, `ModuleCard`, `HabitCard`, `ResourceCard`,
  `ChallengeCard`; estilos mínimos en `styles.css`.
- Verificado: el bundle embebe datos reales (`fase1-entorno`, `reto-c01-swap-int`,
  `exam-sim-1` presentes en el build).

**Nota:** `app/` está gitignoreado; este commit NO incluye el código de la web,
solo el registro de estado. El código vive en el working tree local.

### Habits (hábitos)
Existen 3 iniciales: habit-terminal-daily, habit-git-commits-daily, habit-norminette-daily.
> FASE 3 debe ampliar a 10–15 hábitos basados en testimonios reales.

### ExamSimulation
> Tipo definido en content-model (sección 7) pero **ninguna entidad creada aún**.
> FASE 4 debe crear 5–7 simulaciones `exam-sim-*`.

### Glosario
- `meta/glossary.md` existe pero **está vacío** (solo título).
> FASE 5 debe poblarlo como mini-handbook.

## Archivos zombie / inconsistencia resuelta
- `modules/c06-c07-cli-memoria.md` (zombie, 1 línea) — **ELIMINADO** en esta auditoría.
  El content-model ya lo retiró; el vault lo tenía borrado. Ahora el repo es coherente.

## Plantillas vs práctica real
- `modules/template.md`, `retos/template.md`, `recursos/template.md` usan formato
  `## {{id}}` SIN frontmatter.
- La práctica real (golden examples + todo el contenido ya creado) usa **frontmatter YAML**
  + sección `## Relaciones (vault)`.
- **Decisión:** mantener frontmatter YAML en todo el nuevo contenido (coherencia con fuente
  de verdad ya sincronizada). Las plantillas quedan desactualizadas; se anotará en CONTENT-PLAN
  la conveniencia de actualizarlas.

## Conclusión de la auditoría
El esqueleto está completo y verificado (67 notas en vault, 0 wikilinks rotos). Este plan
se centra en **PROFUNDIZAR**, no en crear estructura: añadir retos realistas (FASE 1),
recursos mapeados (FASE 2), hábitos de testimonios (FASE 3), exam simulations (FASE 4) y
glosario rico (FASE 5).
