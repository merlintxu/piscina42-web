---
id: cursos-bash-git
type: resource-collection
title: Cursos y recursos de Bash y Git
source: piscina42-web
---

# Cursos y recursos de Bash y Git

Colección de recursos para dominar la terminal Unix, Bash y el flujo de Git
antes y durante la Piscina. Cada recurso tiene su nota individual en el vault.

## resource-bash-basics

---
id: resource-bash-basics
type: resource
title: Bash básico (guía/curso)
url: ""
modules:
  - shell00-shell01
phases:
  - fase1-entorno
language: es
cost: free
---

### Descripción

Curso o guía breve de Bash que cubre historial, variables, control de flujo
y scripting simple. Útil para afrontar Shell00–Shell01 con soltura en la CLI. [web:110][web:113]

## resource-git-basics

---
id: resource-git-basics
type: resource
title: Git básico (tutorial)
url: ""
modules:
  - shell00-shell01
phases:
  - fase1-entorno
language: es
cost: free
---

### Descripción

Tutorial enfocado en el flujo diario de trabajo con Git: `init`, `add`,
`status`, `log`, `commit`, `push` y `gitignore`. Imprescindible desde la
Fase 1 para respaldar el trabajo en la Piscina. [web:112][web:119]

## resource-shell00-subject

---
id: resource-shell00-subject
type: resource
title: Subject oficial de Shell00
url: ""
modules:
  - shell00-shell01
phases:
  - fase1-entorno
language: en
cost: free
---

### Descripción

PDF/subject oficial de Shell00 con enunciados de ejercicios y reglas de
entrega (ejecución con `/bin/sh`). Referencia primaria para los retos de
Shell00. [web:115][web:117]

## resource-shell01-subject

---
id: resource-shell01-subject
type: resource
title: Subject oficial de Shell01
url: ""
modules:
  - shell00-shell01
phases:
  - fase1-entorno
language: en
cost: free
---

### Descripción

PDF/subject oficial de Shell01 con ejercicios de text-processing y scripting.
Referencia primaria para los retos de Shell01. [web:120][web:117]

## resource-godbolt

---
id: resource-godbolt
type: resource
title: GodBolt Compiler Explorer
url: https://godbolt.org/
type: tool
modules:
  - c00-intro
  - c01-punteros
phases:
  - fase2-c-basico
  - fase3-c-intermedio
language: en
cost: free
---

### Descripción

Explorador online que muestra el ensamblador generado por el compilador para tu
código C. Muy útil para *ver* cómo los punteros y las llamadas se traducen a
instrucciones reales, y para depurar comportamientos raros de optimización. [web:111]

## resource-explainshell

---
id: resource-explainshell
type: resource
title: explainshell
url: https://explainshell.com/
type: tool
modules:
  - shell00-shell01
phases:
  - fase1-entorno
language: en
cost: free
---

### Descripción

Pega un comando de shell y desglosa qué hace cada flag/argumento, usando las
páginas `man`. Ideal para entender los one-liners que pide Shell01. [web:113]

## resource-cheat-sh

---
id: resource-cheat-sh
type: resource
title: cheat.sh
url: https://cheat.sh/
type: tool
modules:
  - shell00-shell01
  - c00-intro
phases:
  - fase1-entorno
  - fase2-c-basico
language: en
cost: free
---

### Descripción

Búsqueda de ejemplos de comandos y fragmentos de código por HTTP o desde la
terminal (`curl cheat.sh/...`). Rápido para recordar la sintaxis de `sed`, `awk`,
`grep` o funciones de C durante la Piscina. [web:113]

## resource-progit

---
id: resource-progit
type: resource
title: Pro Git (libro oficial, gratuito)
url: https://git-scm.com/book/es/v2
type: book
modules:
  - shell00-shell01
phases:
  - fase1-entorno
language: es
cost: free
---

### Descripción

Libro oficial de Git, disponible gratis y en español. La sección de "Branching"
y "Distributed Workflows" es oro para entender cómo 42 gestiona el repositorio
Vogsphere y tus entregas. [web:112][web:119]

## resource-learnxinyminutes-bash

---
id: resource-learnxinyminutes-bash
type: resource
title: Learn X in Y minutes — Bash
url: https://learnxinyminutes.com/docs/bash/
type: article
modules:
  - shell00-shell01
phases:
  - fase1-entorno
language: en
cost: free
---

### Descripción

Resumen denso y práctico de la sintaxis de Bash en una sola página. Perfecto
como hoja de referencia rápida antes de Shell00. [web:113]
