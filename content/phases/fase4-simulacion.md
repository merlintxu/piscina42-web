---
id: fase4-simulacion
type: phase
slug: fase4-simulacion
order: 4
title: Fase 4: Simulación de la Piscina (Examshell + Rush)
source: piscina42-web
summary: >
  Réplica de la Piscina real bajo cronómetro: simulacros de Examshell, mini-Piscina
  de fin de semana y defensa de Rush en equipo. El objetivo es habituarse al ritmo,
  controlar fugas de memoria y explicar el código completo ante un evaluador.
modules:
  - c10-c13-avanzado
challenges:
  - reto-examshell-c01
  - reto-examshell-c07
  - reto-examshell-c00
  - reto-examshell-c02
  - reto-examshell-c03
  - reto-examshell-c04
  - reto-examshell-c05
  - reto-examshell-c06
  - reto-examshell-c08
  - reto-examshell-c09
  - reto-examshell-c10
  - reto-examshell-c12
  - reto-rush-team
resources:
  - resource-norminette-overview
  - resource-moulinette
  - resource-1337-exam-repos
  - resource-deepwiki-exam-practice
  - resource-exam-study-thread
habits:
  - habit-norminette-daily
  - habit-exam-sim-weekly
  - habit-correction-points-track
  - habit-read-subject-twice
  - habit-valgrind-after-c07
  - habit-peer-daily
---

# Fase 4: Simulación de la Piscina (Examshell + Rush)

## Objetivos

- Practicar bajo presión temporal mediante el Examshell (exámenes tipo Piscina). [file:34]
- Resolver retos de C en sesiones cronometradas que imitan el examen real. [file:34]
- Participar en un Rush: proyecto en equipo de 2–3 personas con entrega y defensa. [file:34]
- Internalizar el uso de Norminette y la Moulinette como validadores obligatorios. [file:34]

## Subfases

- Subfase 4.1: Examshell – exámenes cortos (C01, C07, etc.) con tiempo limitado.
- Subfase 4.2: Rush – proyecto colaborativo de varios días.
- Subfase 4.3: Evaluación entre iguales (peer-evaluation).

## Descripción

La Fase 4 es la réplica de la experiencia real de la Piscina de 42: el
alumno se somete a exámenes automatizados (Examshell) y a un Rush en
equipo, donde se evalúa tanto el código como la capacidad de colaborar. [file:34]

El dominio de la Norminette y la capacidad de depurar rápido bajo presión
son las competencias clave de esta fase; el proyecto final de C10–C13 suele
ser el punto de partida del Rush. [file:34]

## Retos sugeridos

- `reto-examshell-c01` – examen corto de punteros bajo tiempo. [file:34]
- `reto-examshell-c07` – examen corto de memoria dinámica bajo tiempo. [file:34]
- `reto-examshell-c00` – examen corto de fundamentos (C00).
- `reto-examshell-c02` / `reto-examshell-c03` – cadenas y comparación.
- `reto-examshell-c04` / `reto-examshell-c05` – conversión y recursión.
- `reto-examshell-c06` – argumentos de línea de comandos.
- `reto-examshell-c08` / `reto-examshell-c09` – listas y Makefile/lib.
- `reto-examshell-c10` / `reto-examshell-c12` – árboles y estructuras avanzadas.
- `reto-rush-team` – proyecto en equipo con entrega y defensa. [file:34]

## Simulaciones (ExamSimulation)

Colección en `retos/exam-simulations.md` con 6 simulacros progresivos:

- `exam-sim-1` – C00–C02 básico (120 min).
- `exam-sim-2` – Punteros y conversión (120 min).
- `exam-sim-3` – Memoria y argumentos, con Valgrind (150 min).
- `exam-sim-4` – Estructuras y lib (150 min).
- `exam-sim-5` – Mini-Piscina de fin de semana (480 min, todos los niveles).
- `exam-sim-6` – Defensa del Rush (60 min, rol de evaluador).

## Recursos recomendados

- `resource-norminette-overview` – guía de la Norminette (estilo obligatorio). [file:34]
- `resource-moulinette` – validador automático de ejercicios de la Piscina. [file:34]
- `resource-1337-exam-repos` – repos de exámenes resueltos para practicar.
- `resource-deepwiki-exam-practice` – guías de exam practice de la comunidad.
- `resource-exam-study-thread` – hilos sobre qué cae en los exámenes.
