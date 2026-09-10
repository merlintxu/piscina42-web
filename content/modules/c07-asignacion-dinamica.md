---
id: c07-asignacion-dinamica
type: module
slug: c07-asignacion-dinamica
order: 7
title: C07: Asignación dinámica de memoria
source: piscina42-web
phase: fase3-c-intermedio
level: intermediate
concepts:
  - malloc y reserva en el heap
  - free y fugas de memoria
  - ft_strdup (duplicar cadena en heap)
  - ft_range / ft_ultimate_range (arrays de int en heap)
  - ft_strjoin / ft_split (cadenas dinámicas)
cognitive_difficulties:
  - diferencia stack (automático) vs heap (manual)
  - no perder la referencia antes de free
  - calcular tamaño exacto y comprobar malloc != NULL
  - liberar correctamente en error parcial
challenges:
  - reto-c07-ft-strdup
  - reto-c07-ft-range
  - reto-c07-ft-ultimate-range
  - reto-c07-ft-strjoin
  - reto-c07-ft-split
resources:
  - resource-cs50x-week5
  - resource-cs50x-week4
  - resource-exercism-c-track
---

# C07: Asignación dinámica de memoria

## Conceptos clave

- `malloc(size)` reserva `size` bytes en el heap y devuelve `void *`. [file:34][web:7]
- `free(ptr)` libera la memoria previamente reservada; no liberar → fuga de memoria. [file:34][web:7]
- `ft_strdup` duplica una cadena en el heap (reserva + copia + `\0`). [file:34]
- `ft_range` / `ft_ultimate_range` construyen arrays de `int` en el heap. [file:34]
- `ft_strjoin` concatena dos cadenas en una nueva reservada; `ft_split` parte una cadena en un array de cadenas. [file:34]

## Dificultades cognitivas

- Entender la diferencia entre stack (automático) y heap (manual, con `malloc`/`free`). [web:7]
- No perder la referencia al puntero antes de `free` (memoria irrecuperable). [file:34]
- Calcular el tamaño exacto (`strlen + 1` para el `\0`) y comprobar `malloc` != NULL. [file:34]
- Liberar correctamente en caso de error parcial (evitar fugas). [file:34]

## Descripción

C07 es el módulo donde el alumno pasa a gestionar memoria manualmente. Hasta
ahora las cadenas y arrays vivían en el stack o como literales; aquí aprende
a pedir memoria al sistema con `malloc` y a devolverla con `free`. [file:34][web:7]

Las funciones típicas de la Piscina (las de la librería personal del alumno,
tipo `libft`) obligan a combinar punteros, cadenas y reserva dinámica:
`ft_strdup`, `ft_range`, `ft_ultimate_range`, `ft_strjoin` y `ft_split` son
ejercicios de referencia de este módulo. [file:34]

El objetivo pedagógico es que el alumno interiorice que "quien reserva,
libera", y que un puntero colgante o una fuga son errores silenciosos que
la Moulinette/Moulinette penaliza. [file:34]

## Retos vinculados

- `reto-c07-ft-strdup` – duplicar cadena con `malloc`. [file:34]
- `reto-c07-ft-range` – array de enteros en el heap entre min y max. [file:34]
- `reto-c07-ft-ultimate-range` – rango con validación de errores. [file:34]
- `reto-c07-ft-strjoin` – concatenar dos cadenas en memoria nueva. [file:34]
- `reto-c07-ft-split` – partir cadena en array de cadenas. [file:34]

## Recursos recomendados

- `resource-cs50x-week5` – semana de CS50 sobre datos y memoria dinámica. [web:24]
