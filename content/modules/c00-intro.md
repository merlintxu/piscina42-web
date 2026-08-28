---
id: c00-intro
type: module
slug: c00-intro
order: 2
title: C00: Introducción a C
source: piscina42-web
phase: fase2-c-basico
level: basic
concepts:
  - estructura de un programa C (main, include, return)
  - tipos básicos (int, char, float, double)
  - funciones (declaración, definición, prototipo)
  - entrada/salida básica (printf, write)
  - compilación con gcc (preprocesado, compilación, enlazado)
cognitive_difficulties:
  - comprender el flujo de main más allá de "línea a línea"
  - confundir declaración, asignación y dirección
  - leer errores del compilador y separar compilación/enlazado
resources:
  - resource-cs50x-week1
  - resource-cs50x-overview
  - resource-cs50x-week2
  - resource-geeksforgeeks-c
  - resource-cppreference
  - resource-cheat-sh
---

# C00: Introducción a C

## Conceptos clave

- Estructura de un programa C: `#include <stdio.h>`, `int main(void)`, `return 0`. [web:24]
- Tipos básicos: `int`, `char`, `float`, `double` y modificadores de tamaño. [web:24]
- Funciones: declaración, definición, prototipo y valor de retorno. [web:24]
- Entrada/salida básica: `printf`, `write` y formateo de salida. [web:24]
- Compilación con `gcc`: etapas preprocesado → compilación → enlazado. [web:24]

## Dificultades cognitivas

- Asumir que el código se "ejecuta línea a línea" sin entender el flujo de `main`.
- Confundir declaración de variable con asignación o con su dirección.
- Entender por qué `gcc` separa compilación y enlazado y leer errores del compilador. [web:24]

## Descripción

C00 es el módulo de entrada a la programación en C de la Piscina. El alumno
escribe sus primeros programas, aprende la sintaxis obligatoria (la función
`main`, el valor de retorno, las directivas de preprocesador) y cómo compilar
y ejecutarlos con `gcc`. [web:24]

Aunque el módulo es "básico", sienta las bases de todo lo posterior: si el
alumno no interioriza el flujo de un programa y el uso de tipos, los módulos
de punteros y memoria se vuelven mucho más costosos. [file:34]

## Retos vinculados

> Pendiente de autoría en `content/retos/` (se añadirán en lotes siguientes). Por ahora,
> los retos de esta fase se agrupan en `c-retos-basicos`.

## Recursos recomendados

- `resource-cs50x-week1` – semana 1 de CS50 (fundamentos de C). [web:24]
- `resource-cs50x-overview` – overview de CS50 en edX como punto de partida. [web:30]
