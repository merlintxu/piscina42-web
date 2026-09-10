# CONTENT-PLAN · Research & Content Agent (Piscina42-web)

**Fecha inicio:** 2026-08-27
**Perfil:** piscina42 · Rol: Research & Content Agent principal
**Fuente de verdad:** `content/` (repo). Vault Obsidian = espejo navegable con backlinks + MOC.
**Modelo:** `content/meta/content-model.md` (respeta todos los tipos y campos).

---

## DESGLOSE EN LOTES (por fase y tipo)

### FASE 0 · Auditoría y preparación  [✅ COMPLETADA en este arranque]
- L0.1 Auditoría de estado → `meta/CONTENT-STATUS.md` ✅
- L0.2 Plan maestro → este `meta/CONTENT-PLAN.md` ✅
- L0.3 Limpieza de zombie `modules/c06-c07-cli-memoria.md` ✅

### FASE 1 · Módulos y retos basados en repos/subjects
- **L1.1 Shell00–01**: research repos Piscine → añadir retos realistas a `shell-retos.md`
  (reto-shell00-*, reto-shell01-*) inspirados en subjects reales.
- **L1.2 C00–C02**: retos extra en `c-retos-basicos.md` (bucle, condicionales, ft_putchar…).
- **L1.3 C03–C05**: retos extra en `c-retos-intermedios.md` (ft_substr, ft_strncmp, ft_power, recursión).
- **L1.4 C06–C07**: retos extra en `c-retos-intermedios.md` (ft_putstr tab, ft_atoi_base, ft_split refinado).
- **L1.5 C08–C09**: retos extra en `c-retos-intermedios.md` (t_list add_back, sort, btree básico).
- **L1.6 C10–C13**: retos extra en `c10-c13-retos.md` (bst remove, queue, hash map simple).

### FASE 2 · Recursos externos bien mapeados
- **L2.1 Shell/Bash/Git**: añadir a `cursos-bash-git.md` (GodBolt, explainshell, cheat.sh,
  progit, learnxinyminutes bash).
- **L2.2 C (CS50 + Exercism + artículos)**: ampliar `cs50-recursos.md` y `exercism-c.md`
  (CS50 weeks 2–4, pointers articles, GeeksforGeeks C, cppreference).
- **L2.3 Norminette/Moulinette**: ampliar `norminette-moulinette.md` (norminette repo oficial,
  reglas resumen, herramienta norminette en Python).
- **L2.4 Exam practice**: nueva colección `recursos/exam-practice.md` (DeepWiki exam practice,
  repos de exámenes 42/1337).
- **L2.5 Mapeo 2–3 recursos por módulo**: ajustar frontmatter `resources` de cada module.

### FASE 3 · Hábitos y estrategia (testimonios reales)
- **L3.1 Bloques de estudio/simulación**: habit-exam-sim-weekly, habit-study-block-90m, etc.
- **L3.2 Contacto peers / corrección**: habit-peer-daily, habit-correction-points-track.
- **L3.3 Salud y límites**: habit-sleep-7h, habit-meal-routine, habit-stress-reset.
- **L3.4 Norminette/entrega**: habit-daily-commit, habit-read-subject-twice.
- Total objetivo: 10–15 hábitos en `content/habits/`.

### FASE 4 · Exam practice y simulaciones
- **L4.1 Retos Examshell ampliados**: +10–20 retos en `examshell-retos.md` por nivel/módulo.
- **L4.2 ExamSimulation**: 5–7 entidades `exam-sim-*` (tipo ExamSimulation) en
  `retos/examshell-retos.md` o `phases/fase4-simulacion.md` según acuerdo.
- **L4.3 Mapeo a fase4-simulacion.md**: referenciar las simulaciones.

### FASE 5 · Glosario enriquecido
- **L5.1 Entradas base**: get_next_line, printf, blackhole/galaxia, correction points,
  piscine mental load, peer-to-peer culture, cadence post-Piscine, Moulinette, Vogsphere,
  Examshell, Rush, Norminette, BSQ, libft.
- **L5.2 Formato de cada entry**: definición 2–3 frases + cuándo importa + módulos/fases.

### FASE 6 · Integridad y reporting
- **L6.1** Actualizar CONTENT-STATUS, CONTENT-PLAN, SYNC-LOG tras cada fase.
- **L6.2** Verificar consistencia de IDs/relaciones con content-model.
- **L6.3** Reporte final de entregables y fuentes.

---

## ORDEN DE EJECUCIÓN (propuesta)

1. **FASE 0** (hecha): auditoría + plan + limpieza.
2. **FASE 1** (L1.1 → L1.6): retos es la carne técnica; se hace primero porque los módulos
   ya existen y solo faltan ejercicios. Orden por bloque de dificultad creciente.
3. **FASE 2** (L2.1 → L2.5): recursos se mapean sobre los módulos ya completos; se hace
   después de FASE 1 para poder citar retos en las descripciones.
4. **FASE 3** (L3.1 → L3.4): hábitos son transversales; se añaden tras tener módulos y recursos.
5. **FASE 4** (L4.1 → L4.3): exam simulations requieren retos Examshell (FASE 1/4.1) y hábitos
   de simulación (FASE 3); va al final de la parte técnica.
6. **FASE 5** (L5.1 → L5.2): glosario cierra el handbook; puede hacerse en paralelo pero se
   deja al final para absorber terminología de todas las fases.
7. **FASE 6**: limpieza y reporte.

### Fuentes prioritarias por fase
- FASE 1: repos mlrcbsousa/42piscine, pasqualerossi/42-Piscine, oceane-razafy/42-piscine,
  DeepWiki 42-Piscine, 1337 Piscine Study Roadmap.
- FASE 2: CS50 (weeks 1–5), Exercism C, explainshell, progit, norminette repo oficial.
- FASE 3: artículos "42 Piscine – How To Prepare?", "Get ready for Piscine!", "5 point guide",
  hilos r/42_school.
- FASE 4: DeepWiki exam practice, repos exámenes 42/1337, hilos "What to study for Piscine?".
- FASE 5: las fuentes anteriores + definiciones de cultura 42 (Vogsphere, BSQ, etc.).

### Convenciones de ejecución
- Cada lote: AVISO previo (qué archivos toco) → ejecución → resumen post-lote.
- Formato de notas: frontmatter YAML (coherente con contenido existente), NO el formato
  `## {{id}}` de las plantillas (plantillas desactualizadas; se anota para revisión futura).
- Research vía web_search / web_extract; adaptar ideas, no copiar texto largo; citar inspiración.
- Tras cada fase: sincronizar vault (espejo) y verificar 0 wikilinks rotos.

---

## ANEXO · Cambio de modelo (FASE A, feature/schema-and-app, 2026-08-27)

Para el pipeline Markdown→JSON y la app React, el schema conceptual es:

- **Phase**: id, slug, title, summary, order, modules[], challenges[], resources[], habits[], body
- **Module**: id, slug, title, phase, order, level, concepts[], cognitive_difficulties[], challenges[], resources[], body
- **Challenge**: id, slug, title, module, phase?, difficulty, estimated_time_minutes?, tags[], norminette_focus?, body
- **Resource**: id, title, type (subtipo: course|article|repository|tool|book), url, description, modules[], phases[], language?, cost?
- **Habit**: id, slug, title, description, phases[], frequency?, metrics[]
- **ExamSimulation**: id, slug, title, description, phase?, duration_minutes, levels[], rules[]

### Reglas adoptadas (resuelven ambigüedades reales del repo)
1. **`type` de Resource = subtipo.** No se repite la clave `type`. La entidad Resource se
   infiere por estar en `content/recursos/`. Antes había archivos con `type: resource` y
   luego `type: course/article` (colisión YAML) → normalizado a un único `type` subtipo.
2. **Colecciones multi-entidad.** `challenge-collection` y `resource-collection` contienen
   varios bloques `--- ... ---` con su propio frontmatter; el script los expande.
3. **`exam-simulations.md`** es una colección de 6 `ExamSimulation` sin frontmatter de
   envoltura; el script la parsea como bloques consecutivos.
4. **Campos derivados del body** cuando faltan en frontmatter (p.ej. `summary` de una
   fase, `description` de un recurso) se extraen del primer párrafo/sección en el pipeline.

### Slugs asignados
- Phase: fase1-entorno, fase2-c-basico, fase3-c-intermedio, fase4-simulacion (id = slug).
- Module: shell00-shell01, c00-intro, c01-punteros, c02-c03-cadenas,
  c04-c05-conversion-recursion, c06-cli-args, c07-asignacion-dinamica,
  c08-c09-structs-lib, c10-c13-avanzado (id = slug).
- Challenge/Habit/ExamSimulation: `slug` = `id` en todos los casos (estables para URLs).
