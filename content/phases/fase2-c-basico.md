---
id: fase2-c-basico
type: phase
slug: fase2-c-basico
order: 2
title: Fase 2: Fundamentos de C (C00–C02)
source: piscina42-web
summary: >
  Entrada a la programación en C: sintaxis obligatoria, tipos, flujo de main,
  compilación con gcc, entrada/salida y primeras cadenas. Aquí se asientan las
  bases (tipos, flujo, compilación) sin las cuales los módulos de punteros y
  memoria se vuelven mucho más costosos.
modules:
  - c00-intro
  - c01-punteros
  - c02-c03-cadenas
challenges:
  - reto-c02-strlen-strcmp
resources:
  - resource-cs50x-week1
  - resource-cs50x-overview
  - resource-bash-basics
  - resource-git-basics
habits:
  - habit-terminal-daily
  - habit-git-commits-daily
---

# Fase 2: Fundamentos de C (C00–C02)

## Objetivos

- Escribir y compilar programas básicos en C usando `gcc` y un editor de terminal. [web:24]
- Comprender la estructura de un programa C: `#include`, `main`, tipos, funciones y `return`. [web:24]
- Dominar punteros como mecanismo de referencia a memoria y paso de parámetros. [file:34][web:7]
- Manipular cadenas como arrays de `char` terminados en `\0` y recrear funciones de `<string.h>`. [file:34][web:7]

## Subfases

- Subfase 2.1: C00 – Sintaxis básica, tipos y primeras funciones.
- Subfase 2.2: C01 – Punteros y paso por referencia.
- Subfase 2.3: C02–C03 – Cadenas y funciones de cadena.

## Descripción

La Fase 2 es la entrada real a la programación en C de la Piscina. Tras haber
ganado soltura con la terminal y Git en la Fase 1, el alumno empieza a escribir
código que se compila y ejecuta, aprendiendo a depurar errores de compilación
y de lógica. [file:34][web:24]

C00 introduce la sintaxis y el flujo de un programa; C01 es el primer gran
salto conceptual (punteros y memoria); y C02–C03 consolidan el trabajo con
cadenas, que es donde muchos proyectos de la Piscina se apoyan. [file:34][web:7]

El objetivo pedagógico es que el alumno llegue a C04–C09 con una base sólida
de punteros y cadenas, reduciendo la frustración en módulos más avanzados.

## Relación con módulos

- `c00-intro`: primeros programas, tipos y funciones en C. [web:24]
- `c01-punteros`: direcciones de memoria y paso por referencia. [file:34][web:7]
- `c02-c03-cadenas`:arrays de `char`, `\0` y recreación de `<string.h>`. [file:34][web:7]

## Retos sugeridos

- `reto-c02-strlen-strcmp`: implementar manualmente `strlen` y `strcmp`. [file:34]

## Recursos recomendados

- `resource-cs50x-week1`: fundamentos de C de CS50. [web:24]
- `resource-cs50x-overview`: punto de partida de CS50 en edX. [web:30]
- `resource-bash-basics`: repaso de Bash para el entorno de compilación.
- `resource-git-basics`: flujo diario de commits mientras se programa en C.
