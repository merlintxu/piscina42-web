---
id: c01-punteros
type: module
slug: c01-punteros
order: 3
title: C01: Punteros
source: piscina42-web
phase: fase3-c-intermedio
level: intermediate
concepts:
  - direcciones de memoria y representación en RAM
  - operadores & y *
  - paso por referencia
  - punteros a punteros (doble indirección)
  - efectos secundarios y aliasing de memoria
cognitive_difficulties:
  - visualizar la memoria como celdas con direcciones
  - comprender el aliasing (varias variables al mismo dato)
  - aceptar comportamiento indefinido al desreferenciar punteros inválidos
  - disciplina de inicializar punteros y comprobar NULL
challenges:
  - reto-c01-swap-int
  - reto-c01-pointer-arithmetic
resources:
  - resource-cs50x-week5
  - resource-exercism-c-basics
  - resource-exercism-c-track
  - resource-pointers-article
  - resource-godbolt
  - resource-cppreference
---

# C01: Punteros

## Conceptos clave

- Direcciones de memoria y representación en RAM.
- Operadores `&` (dirección) y `*` (desreferenciación).
- Paso de parámetros por referencia usando punteros.
- Punteros a punteros (doble indirección).
- Efectos secundarios y aliasing de memoria. [file:34][web:7]

## Dificultades cognitivas

- Visualizar la memoria como una tabla de celdas con direcciones numéricas.
- Comprender que varias variables pueden apuntar al mismo dato (aliasing).
- Aceptar que desreferenciar punteros inválidos provoca comportamiento indefinido.
- Mantener la disciplina de inicializar punteros y evitar usos de `NULL` sin comprobación. [file:34]

## Descripción

El módulo C01 marca el primer gran salto de la Piscina: en lugar de trabajar sólo
con valores (enteros, caracteres), el alumno empieza a trabajar con **referencias
a ubicaciones de memoria**. Cualquier error conceptual aquí provoca fallos difíciles
de depurar y suele ser causa de frustración y abandono. [file:34][web:7]  

A través de funciones como `ft_swap` y pequeños ejercicios de aritmética de punteros,
C01 enseña a manipular datos indirectamente y a diseñar APIs que modifican valores
pasados por referencia, lo que prepara el terreno para memoria dinámica, listas y árboles
en módulos posteriores. [file:34][web:7]

## Retos vinculados

- `reto-c01-swap-int` – Intercambiar dos enteros usando punteros.
- `reto-c01-pointer-arithmetic` – Recorrer y modificar un array de enteros mediante aritmética de punteros.

## Recursos recomendados

- `resource-cs50x-week5` – sección de CS50 centrada en punteros y memoria. [file:34][web:24]
- `resource-exercism-c-basics` – ejercicios prácticos de C sobre punteros y arrays. [file:34][web:33]