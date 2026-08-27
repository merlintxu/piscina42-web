---
id: c02-c03-cadenas
type: module
slug: c02-c03-cadenas
order: 4
title: C02–C03: Cadenas y funciones de <string.h>
source: piscina42-web
phase: fase3-c-intermedio
level: intermediate
concepts:
  - cadena como array de char terminado en \0
  - recorrido de cadenas con punteros e índices
  - recreación manual de strlen/strcmp/strcpy/strcat/strdup
  - longitud vs capacidad y desbordamiento de buffer
cognitive_difficulties:
  - entender que la cadena es un puntero, no un objeto
  - no olvidar el \0 al construir cadenas manualmente
  - distinguir strcmp (contenido) de == (punteros)
challenges:
  - reto-c02-strlen-strcmp
resources:
  - resource-cs50x-overview
  - resource-cs50x-week2
  - resource-geeksforgeeks-c
  - resource-cppreference
---

# C02–C03: Cadenas y funciones de <string.h>

## Conceptos clave

- Cadena como array de `char` terminado en `\0` (no existe el tipo `string` en C). [file:34][web:7]
- Recorrido de cadenas con punteros e índices; frontera en el carácter nulo. [file:34]
- Recreación manual de `strlen`, `strcmp`, `strcpy`, `strcat`, `strdup`. [file:34][web:7]
- Nociones de longitud vs. capacidad y riesgos de desbordamiento de buffer. [web:7]

## Dificultades cognitivas

- Entender que una "cadena" es un puntero al primer carácter, no un objeto. [file:34]
- No olvidar el `\0` al construir cadenas manualmente (cadenas colgantes). [file:34]
- Distinguir entre comparar contenido (`strcmp`) y comparar punteros (`==`). [file:34]

## Descripción

C02 y C03 agrupan el trabajo con cadenas de caracteres, uno de los ejes
transversales de la Piscina: casi todos los módulos posteriores (C04, C06, C07)
manipulan texto. El alumno aprende que en C una cadena es simplemente un array
de `char` terminado en `\0` y que debe gestionar su propia memoria y límites. [file:34][web:7]

La práctica típica consiste en reimplementar las funciones de la librería
estándar `<string.h>` a mano, lo que refuerza punteros, aritmética y atención
al carácter terminador. [file:34]

## Retos vinculados

- `reto-c02-strlen-strcmp` – implementar manualmente `strlen` y `strcmp`. [file:34]

## Recursos recomendados

- `resource-cs50x-overview` – overview de CS50, útil como contexto general de C. [web:30]
