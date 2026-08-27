---
id: fase3-c-intermedio
type: phase
slug: fase3-c-intermedio
order: 3
title: Fase 3: C intermedio, memoria y estilo 42
source: piscina42-web
summary: >
  El corazón técnico de la preparación: punteros, cadenas, conversión de datos,
  recursión, argumentos de línea de comandos, memoria dinámica, structs y
  librerías. Cada módulo apila sobre el anterior; aquí se construye la base de
  la futura libft y se consolida la disciplina de Norminette.
modules:
  - c01-punteros
  - c02-c03-cadenas
  - c04-c05-conversion-recursion
  - c06-cli-args
  - c07-asignacion-dinamica
  - c08-c09-structs-lib
challenges:
  - reto-c01-swap-int
  - reto-c01-pointer-arithmetic
  - reto-c02-strlen-strcmp
  - reto-c04-ft-atoi
  - reto-c04-ft-itoa
  - reto-c05-fibonacci
  - reto-c05-factorial
  - reto-c06-argv-count
  - reto-c07-ft-strdup
  - reto-c07-ft-range
  - reto-c07-ft-ultimate-range
  - reto-c07-ft-strjoin
  - reto-c07-ft-split
resources:
  - resource-cs50x-week5
  - resource-exercism-c-basics
  - resource-norminette-overview
habits:
  - habit-norminette-daily
---

# Fase 3: C intermedio, memoria y estilo 42

## Objetivos

- Dominar punteros, cadenas y arrays como estructuras centrales del lenguaje C.
- Practicar conversión de datos, recursión y argumentos de línea de comandos.
- Interiorizar memoria dinámica (`malloc` y `free`), structs y librerías estáticas.
- Incorporar la Norminette y \"La Norma\" como parte diaria del flujo de trabajo. [file:34]

## Subfases

- Subfase 3.1: C01 – Punteros.
- Subfase 3.2: C02–C03 – Cadenas y funciones tipo `<string.h>`.
- Subfase 3.3: C04–C05 – Conversión de datos y recursión.
- Subfase 3.4: C06 – Argumentos de línea de comandos (`argc`/`argv`).
- Subfase 3.5: C07 – Asignación dinámica de memoria (`malloc`, `free`).
- Subfase 3.6: C08–C09 – Structs, macros y librerías estáticas. [file:34][web:7]

## Descripción

Esta fase corresponde al corazón del currículo de la Piscina: los módulos
C01–C09, donde se filtra a mucha gente por la dificultad de punteros y memoria. [file:34]  
El objetivo es construir una comprensión sólida de cómo se representa la información
en memoria (stack y heap) y cómo los programas en C manipulan esa memoria
mediante punteros, arrays, structs y funciones reutilizables. [file:34][web:7]  

Además se entrena la disciplina de la Norminette: límites de longitud de función,
número de variables, prohibición de bucles `for`, `switch`, operadores ternarios
y variables globales, todo ello reforzado con retos específicos. [file:34]

## Relación con módulos

- `c01-punteros`: primeras nociones de direcciones de memoria y paso por referencia.
- `c02-c03-cadenas`: recreación manual de funciones de la librería `<string.h>`. [file:34][web:7]
- `c04-c05-conversion-recursion`: conversión de cadenas a enteros y algoritmos recursivos.
- `c06-cli-args`: parámetros de línea de comandos `argc`/`argv` y manejo de argumentos.
- `c07-asignacion-dinamica`: asignación dinámica de memoria en el heap (`malloc`, `free`, `ft_strdup`, `ft_range`, `ft_strjoin`, `ft_split`).
- `c08-c09-structs-lib`: structs, macros, librerías estáticas y Makefiles. [file:34][web:7]

## Retos sugeridos

- `reto-c01-swap-int`: intercambio de enteros con punteros.
- `reto-c01-pointer-arithmetic`: manipulación de arrays mediante aritmética de punteros.
- `reto-c02-strlen-strcmp`: implementación manual de funciones de cadena. [file:34]

## Recursos recomendados

- `resource-cs50x-week5`: unidades de CS50 donde se tratan punteros y memoria dinámica.
- `resource-exercism-c-basics`: ejercicios de C centrados en punteros y arrays.
- `resource-norminette-overview`: documentación sobre Norminette y La Norma. [file:34][web:24][web:11][web:12]