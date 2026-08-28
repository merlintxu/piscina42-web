# Piscina42 Training OS — Phase 2.1 Technical Documentation

## 1. Executive Summary & Philosophy

**Piscina42 Training OS (Phase 2.1)** transforms the Piscina42 platform from a static educational catalog into an **adaptive daily training operating system** designed to prepare candidates for the demanding selection pool at **42 Madrid** (default target date: **2026-10-26**).

### Core Principles
1. **Piscine Methodology Alignment**: Autonomy, Peer-Learning, Norminette compliance, and mental endurance under timed exams (Examshell).
2. **Deterministic & Conservative**: All readiness scores, diagnostic grading, and daily mission generation algorithms are strictly deterministic and mathematically calibrated, with zero reliance on external AI dependencies.
3. **Clean Storage Separation**:
   - `ContentJSON`: Canonical content generated from markdown files.
   - `piscina42_progress_v1`: User activity log (completed challenges, bookmarks, active habits, exam scores).
   - `piscina42_training_v1`: Training OS domain state (skill mastery matrix, diagnostic test result, daily missions history, readiness history, training profile).

---

## 2. Domain Models & Architecture

All training domain types are declared in `src/training/types.ts`:

### 2.1 Skill Mastery & Categories
Competencies are divided into **5 strategic axes**:
- **`terminal`**: Unix CLI navigation, permissions (octal chmod), redirection & pipes, shell scripting basics.
- **`git`**: Staging area, atomic commits, Vogsphere push etiquette.
- **`c_prog`**: Types & `write()`, pointers & addresses, pointer arithmetic & arrays, string manipulation (`\0`), integer overflow & conversions (`INT_MIN`), recursion, CLI arguments (`argc`/`argv`), dynamic memory (`malloc`/`free`).
- **`engineering`**: 42 Norminette v3 compliance, `-Wall -Wextra -Werror` zero-warning rule, Valgrind memory leak prevention, peer evaluation defense.
- **`meta`**: Unix `man` pages autonomy, Examshell time & stress management, deep work cognitive focus.

### 2.2 Skill Levels (0 to 5)
Each competency is evaluated on a discrete 0–5 scale with explicit pedagogical criteria:
- **Level 0 (No iniciado)**: Unexposed or 0 evidence.
- **Level 1 (Familiarizado)**: Understands syntax and basic concepts with guidance.
- **Level 2 (Práctico básico)**: Solves fundamental exercises with standard cases.
- **Level 3 (Autónomo)**: Resolves edge cases (`NULL`, `INT_MIN`, empty inputs) without help.
- **Level 4 (Rigor 42)**: Writes 100% Norminette-clean code and defends implementation in peer reviews.
- **Level 5 (Velocidad Examen)**: Solves under time pressure in terminal without IDE auto-completion.

---

## 3. The 24-Question Diagnostic Test

Located in `src/training/diagnosticQuestions.ts` and evaluated via `src/training/diagnostic.ts`:
- **24 deterministic questions** across all 5 skill categories.
- Immediate option validation and in-depth C/42 architectural explanations.
- Generates a complete `DiagnosticResult` with:
  - Overall accuracy percentage.
  - Per-category mastery bars.
  - Granular skill score mapping.
  - Tailored pedagogical recommendations.
  - Automatic calibration of baseline levels (0–3) in `piscina42_training_v1`.

---

## 4. Daily Mission Engine

Located in `src/training/dailyMissionEngine.ts`:
- Deterministically generates a custom daily mission for any given date (`YYYY-MM-DD`).
- **Prioritization Logic**:
  1. Identifies the user's lowest-level skill in the Skill Matrix.
  2. Scans `ContentJSON.challenges` for unsolved challenges matching that skill.
  3. Includes an engineering review item (Norminette audit & `-Wall -Wextra -Werror`).
  4. Selects a daily habit to reinforce discipline and endurance.
  5. Provides a clear pedagogical rationale explaining why today's mission was assigned.
- Interactive checkboxes update streaks and daily completion metrics.

---

## 5. Readiness Score Formula

Calculated in `src/training/skillEngine.ts`:
$$\text{Readiness} = 0.35 \times \text{C\_Mastery} + 0.20 \times \text{Unix\_Git} + 0.25 \times \text{Rigor\_Norminette} + 0.20 \times \text{Examshell}$$

- **Countdown**: Calculates exact days and weeks remaining until `profile.targetDate` (`2026-10-26`).
- **Projected Hours**: Estimated remaining study hours based on `profile.availableHoursPerWeek` (default 15h/week).
- **Pace Status**:
  - `ahead`: Score $\ge 70\%$
  - `on_track`: Standard progression.
  - `needs_attention`: $\le 60\text{ days left and } \text{Score} < 40\%$
  - `critical`: $\le 30\text{ days left and } \text{Score} < 50\%$

---

## 6. Synchronization & Persistence Layer

Located in `src/training/trainingStorage.ts`:
- Automatically syncs completed challenges from `piscina42_progress_v1` into `piscina42_training_v1` as evidence records.
- Increments skill mastery levels as evidence accumulates.
- Preserves user changes and profile customizations (hours/week, target date, pace).

---

## 7. Roadmap to Future Phases

- **Phase 2.2**: Local code testing simulator with client-side syntax validation and real-time Norminette linting regexes.
- **Phase 3.0**: Advanced Exam Arena with strict timed simulations and offline command sandbox.
