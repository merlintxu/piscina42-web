# Glosario: Norminette, Moulinette, Vogsphere, Examshell, Rush, etc.

Mini-handbook de términos de la cultura 42 y la Piscina de 42 Madrid. Cada
entrada: definición breve + cuándo importa + módulos/fases relacionados.

---

## Norminette

Linter de estilo obligatorio de 42. Limita la longitud de funciones (25 líneas),
número de variables por función (5), indentación (4 espacios), y obliga a cierto
formato de `if`/`else`, bucles y nombrado. Cualquier ejercicio que no la pase es
rechazado automáticamente.

- **Cuándo importa:** en todos los módulos C (C00–C13) y en los Makefiles.
- **Relacionado:** c00-intro, c01-punteros, c02-c03-cadenas, c04-c05-conversion-recursion,
  c06-cli-args, c07-asignacion-dinamica, c08-c09-structs-lib, c10-c13-avanzado,
  fase2-c-basico, fase3-c-intermedio, fase4-simulacion.
- **Recursos:** resource-norminette-overview, resource-norminette-repo, resource-norminette-rules.

## Moulinette

Sistema automático que corrige los ejercicios de la Piscina: ejecuta tests
ocultos y valida Norminette + funcionamiento. Un ejercicio solo cuenta como
superado cuando la Moulinette lo aprueba.

- **Cuándo importa:** al entregar cualquier reto; es el "examen real" de cada módulo.
- **Relacionado:** todos los módulos C, fase4-simulacion.
- **Recursos:** resource-moulinette.

## Vogsphere

Repositorio git de 42 donde se entregan los ejercicios. El flujo es propio de 42
(no es GitHub directo): clonas, haces commit/push a Vogsphere, y la Moulinette
lee de ahí.

- **Cuándo importa:** desde Shell00 (Git) hasta el final; entender git es previo.
- **Relacionado:** shell00-shell01, fase1-entorno, habit-git-commits-daily, habit-daily-commit.

## Examshell

Entorno de exámenes cronometrados de la Piscina (ranks C00–C13 y exámenes
finales). Ventana de 2–3h, sin internet ni ayuda, con retos similares a los de
los módulos pero bajo presión.

- **Cuándo importa:** en la Fase 4 y en los exámenes reales de la Piscina.
- **Relacionado:** fase4-simulacion, reto-examshell-c00…c12, exam-sim-1…6.
- **Recursos:** resource-1337-exam-repos, resource-deepwiki-exam-practice, resource-exam-study-thread.

## Rush

Proyecto en equipo (2–3 personas) de varios días, con entrega y defensa técnica
ante evaluadores. Evalúa código y capacidad de colaborar.

- **Cuándo importa:** al final de la Piscina, como culminación práctica.
- **Relacionado:** fase4-simulacion, reto-rush-team, exam-sim-6, c10-c13-avanzado.

## Correction points

Puntos que ganas corrigiendo el trabajo de otros alumnos (peer-evaluation). La
Piscina exige un mínimo para validar la experiencia; no basta con aprobar retos.

- **Cuándo importa:** durante toda la Piscina; monitorízalos con habit-correction-points-track.
- **Relacionado:** habit-peer-daily, habit-correction-points-track, fase4-simulacion.

## Peer-to-peer culture

Modelo de 42 donde el aprendizaje es entre iguales: nadie da clase magistral; se
aprende corrigiendo, explicando y resolviendo dudas con otros alumnos.

- **Cuándo importa:** desde el día 1; es la base del método 42.
- **Relacionado:** habit-peer-daily, fase1-entorno.

## libft

Proyecto fundacional de 42 (post-Piscina, pero semilla en C07): una librería
propia que reimplementa funciones de `<string.h>`/`<stdlib.h>` (ft_strlen,
ft_strdup, ft_split…). Los retos C07 alimentan directamente su contenido.

- **Cuándo importa:** al salir de la Piscina; se entrena en c07-asignacion-dinamica.
- **Relacionado:** c07-asignacion-dinamica, reto-c07-ft-strdup, reto-c07-ft-split, reto-c07-ft-strjoin.

## BSQ

"Blackhole / galaxia" — proyecto final de la Piscina (a veces llamado BSQ por
"Biggest Square"). Busca el mayor cuadrado en una cuadrícula; integra todo lo
aprendido. Sujeto variable según campus.

- **Cuándo importa:** al final de la Piscina como reto integrador.
- **Relacionado:** c10-c13-avanzado, fase4-simulacion.

## get_next_line (GNL)

Función clásica de 42 que lee una línea de un file descriptor con `read`,
gestionando buffers y memoria. Aunque aparece tras la Piscina, se entrena con
punteros y memoria de C07.

- **Cuándo importa:** post-Piscina; semilla en c07-asignacion-dinamica.
- **Relacionado:** c07-asignacion-dinamica, c01-punteros.

## printf (ft_printf)

Reimplementación de `printf` (variadic functions con `stdarg.h`); proyecto
post-Piscina que consolida punteros, cadenas y conversión.

- **Cuándo importa:** post-Piscina; semilla en c04-c05-conversion-recursion y c02-c03-cadenas.
- **Relacionado:** c04-c05-conversion-recursion, c02-c03-cadenas.

## Piscine mental load

Carga cognitiva y emocional intensa de la Piscina (jornadas largas, ritmo rápido,
exámenes frecuentes). Gestionarla es parte del éxito tanto como el código.

- **Cuándo importa:** toda la Piscina.
- **Relacionado:** habit-sleep-7h, habit-meal-routine, habit-stress-reset, habit-study-block-90m.

## Cadence post-Piscine

Ritmo y hábitos tras la Piscina: encadenar libft → get_next_line → ft_printf →
proyectos del Common Core. Mantener los hábitos de estudio sostiene el avance.

- **Cuándo importa:** tras superar la Piscina.
- **Relacionado:** c07-asignacion-dinamica, c04-c05-conversion-recursion, habit-exam-sim-weekly.

---

*Glosario poblado en FASE 5 del CONTENT-PLAN (sesión 2026-08-27).*
