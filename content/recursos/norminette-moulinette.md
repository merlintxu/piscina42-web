---
id: norminette-moulinette
type: resource-collection
title: Norminette y Moulinette
source: piscina42-web
---

# Norminette y Moulinette

Colección de recursos sobre el estilo obligatorio (Norminette) y el validador
automático (Moulinette) de la Piscina de 42. Cada recurso tiene su nota
individual en el vault.

## resource-norminette-overview

---
id: resource-norminette-overview
type: course
title: Norminette — guía de estilo 42
url: ""
modules:
  - c01-punteros
phases:
  - fase3-c-intermedio
  - fase4-simulacion
language: en
cost: free
---

### Descripción

La Norminette es el linter de estilo de 42: limita longitud de funciones y
líneas, obliga a cierto formato de indentación y nombrado, y rechaza
cualquier ejercicio que no pase. Es obligatoria en todos los módulos C. [file:34]

## resource-moulinette

---
id: resource-moulinette
type: course
title: Moulinette — validador automático
url: ""
modules:
  - c10-c13-avanzado
phases:
  - fase4-simulacion
language: en
cost: free
---

### Descripción

La Moulinette es el sistema que corrige automáticamente los ejercicios de la
Piscina: ejecuta tests ocultos y valida que el código cumple Norminette y
funciona. Un ejercicio solo cuenta como superado cuando la Moulinette lo
aprueba. [file:34]

## resource-norminette-repo

---
id: resource-norminette-repo
type: repository
title: Norminette — repositorio oficial (GitHub)
url: https://github.com/42School/norminette
modules:
  - c00-intro
  - c01-punteros
  - c02-c03-cadenas
  - c04-c05-conversion-recursion
  - c06-cli-args
  - c07-asignacion-dinamica
  - c08-c09-structs-lib
  - c10-c13-avanzado
phases:
  - fase2-c-basico
  - fase3-c-intermedio
  - fase4-simulacion
language: en
cost: free
---

### Descripción

Código fuente del linter Norminette de 42. Instalándolo localmente
(`pip install` + el binario de la VM) puedes validar tu código **antes** de
entregar, ahorrando correcciones perdidas por errores de estilo. [file:34]

## resource-norminette-rules

---
id: resource-norminette-rules
type: article
title: Norminette — resumen de reglas
url: https://github.com/42School/norminette/blob/master/README.md
modules:
  - c00-intro
  - c01-punteros
  - c02-c03-cadenas
phases:
  - fase2-c-basico
  - fase3-c-intermedio
language: en
cost: free
---

### Descripción

Resumen legible de las reglas: 25 líneas máximo por función, 5 variables por
función, indentación de 4 espacios, `else` en la misma línea que `}` del `if`,
sin `for` con más de una instrucción, etc. Tenlo a mano mientras programas. [file:34]

## resource-norminette-python

---
id: resource-norminette-python
type: repository
title: norminette.py — validador en Python
url: https://github.com/R4meau/norminette.py
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

Reimplementación ligera del linter en Python, útil si no puedes instalar el
oficial en tu máquina. No sustituye al validador real de la Piscina, pero da
feedback rápido de estilo durante el estudio. [file:34]
