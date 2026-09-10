# Project Context · Piscina42-web

## Propósito

Este proyecto es una plataforma interactiva y sistema operativo de entrenamiento para preparar con rigor técnico la Piscina de 42 Madrid.

Contiene:
- **Base de conocimiento estructurada** (`content/`): fases pedagógicas, módulos temáticos, retos prácticos de código en C/Shell, recursos de estudio, hábitos y simulaciones de examen.
- **Aplicación web full-stack** (`src/`, `server.ts`, `server/`): cliente React + TypeScript + Vite respaldado por un servidor Express para servir la API de contenidos, grafo de relaciones, simulador Norminette y mentoría técnica.
- **Piscina42 Training OS** (`src/training/`): motor adaptativo de entrenamiento diario, evaluación diagnóstica de 24 preguntas, matriz de competencias técnicas (escala 0-5), generador determinista de misiones diarias (`learn` vs `prove`, simulaciones peer-eval, debriefs) y cálculo de Readiness.
- **Scripts de tooling y build** (`scripts/`): compilación y validación de Markdown a JSON estructurado y utilidades del repositorio.
- **Integración con vault de Obsidian**: enlace de notas y modelos conceptuales con el PKM del usuario.

---

## Arquitectura Real del Proyecto

```
piscina42-web/
├── content/              # Fuente autoritativa de contenido en Markdown
│   ├── phases/           # Definición de fases (entorno, C básico, punteros, etc.)
│   ├── modules/          # Módulos temáticos (shell00, c00..c08, etc.)
│   ├── retos/            # Retos de código y ejercicios con especificaciones
│   ├── recursos/         # Recursos externos (cursos, docs, herramientas)
│   ├── habitos/          # Hábitos formativos y de disciplina
│   ├── examenes/         # Simulaciones de examen 42
│   └── meta/             # Metamodelo y especificación del grafo
├── server.ts             # Servidor backend Express + middleware de Vite
├── server/               # Lógica del servidor (parser de Markdown a ContentJSON, grafo)
│   └── contentParser.ts  # Carga y parsing de content/ hacia estructuras tipadas
├── src/                  # Aplicación cliente React + Vite + Tailwind
│   ├── views/            # Vistas principales (Dashboard, Training, Modules, Retos, etc.)
│   ├── components/       # Componentes visuales y módulos extraídos (Navbar, training/*, etc.)
│   ├── training/         # Piscina42 Training OS (motor determinista de entrenamiento)
│   ├── lib/              # Utilidades de frontend (persistencia, grafo, markdown)
│   ├── hooks/            # Hooks personalizados
│   └── types.ts          # Tipos globales del contenido y progreso de usuario
├── scripts/              # Scripts de utilidad (ej. build-content.js, validaciones)
└── docs/ / design/       # Documentación de diseño y roadmap
```

---

## Separación de Modelos de Datos (Crítico)

Es fundamental distinguir con claridad las tres capas de estado del sistema:

### 1. `ContentJSON` (Estructura de Contenido Autoritativo - Solo Lectura en Cliente)
- **Definición**: Representa todo el conocimiento estático parseado desde `content/` (fases, módulos, retos, recursos, hábitos, exámenes).
- **Origen**: Generado por el backend en `server/contentParser.ts` a partir de los ficheros Markdown y servido en `/api/content`.
- **Inmutabilidad**: El usuario no muta `ContentJSON`; es el catálogo pedagógico de referencia.

### 2. `UserProgress` (Progreso Clásico de Usuario)
- **Definición**: Estado de resolución del contenido disponible (`completedChallenges`, `activeHabits`, `completedHabitDays`, `completedExams`, notas y marcadores).
- **Persistencia**: Persiste en `localStorage` bajo la clave `piscina42_progress_v1`.
- **Propósito**: Rastreo directo de qué retos se han marcado como completados o qué exámenes se han rendido.

### 3. `TrainingState` (Piscina42 Training OS)
- **Definición**: Estado adaptativo del entrenamiento del usuario (`profile`, `diagnostic`, `skills` mastery 0-5, `dailyMissions`, `debriefs`, `streakDays`, `readinessScore`).
- **Persistencia**: Persiste en `localStorage` bajo la clave `piscina42_training_v1`.
- **Propósito**: Calibración de la matriz de habilidades, misiones diarias generadas según lagunas técnicas y cálculo determinista de preparación hacia la fecha objetivo (por defecto `2026-10-26`).
- **Relación**: Se sincroniza con `UserProgress` y `ContentJSON` para detectar evidencias, pero mantiene su propio ciclo de vida e integridad sin mutar `UserProgress`.

---

## Convenciones y Modelo de Contenido

- El modelo de contenido está definido en `content/meta/content-model.md`.
- Toda ficha de módulo, reto o recurso debe respetar las plantillas existentes (`content/modules/template.md`, `content/retos/template.md`, etc.).
- **IDs autoritativos**: Siguen estrictamente `kebab-case` (`c01-punteros`, `reto-c01-swap-int`, `resource-cs50x-week1`).
- Los algoritmos de evaluación y cálculo de readiness en `src/training/` son deterministas y no dependen de servicios externos de IA.

---

## Reglas y Directivas de Mantenimiento

1. **Autoridad del contenido**: `content/` es la única fuente de verdad sobre el temario, retos y recursos.
2. **Conservación de identificadores**: No renombrar ni cambiar IDs existentes para no invalidar el progreso de los usuarios ni los enlaces del grafo de conocimiento.
3. **No borrado arbitrario**: No eliminar ni alterar destructivamente archivos de contenido sin confirmación explícita.
4. **Aislamiento de contexto**: No mezclar contexto ni convenciones de este proyecto con otros proyectos externos del usuario.
5. **Obsidian Vault**: En caso de interactuar con el vault configurado en `OBSIDIAN_VAULT_PATH`, mantener la estructura de grafos con wikilinks exactos y operar únicamente en la carpeta destinada a Piscina 42.
