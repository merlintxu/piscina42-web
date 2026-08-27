---
id: c08-c09-structs-lib
type: module
title: C08–C09: Structs, macros y librerías estáticas
source: piscina42-web
phase: fase3-c-intermedio
level: intermediate
challenges:
  - reto-c08-struct-basic
  - reto-c08-ft-list-size
  - reto-c09-makefile-lib
resources:
  - resource-cs50x-week5
  - resource-exercism-c-track
---

# C08–C09: Structs, macros y librerías estáticas

## Conceptos clave

- `struct`: agrupar variables de distinto tipo bajo un mismo nombre; acceso con `.` y `->`. [web:7][file:34]
- Punteros a struct y la diferencia entre `s.miembro` y `p->miembro`. [web:7]
- Macros con `#define`: sustitución de texto en preprocesado, sin chequeo de tipos. [web:7]
- Librerías estáticas (`.a`): empaquetar objetos con `ar` y enlazarlos en un Makefile. [web:7]
- Listas enlazadas simples: nodo con `data` y `next`, recorrido e inserción. [file:34]

## Dificultades cognitivas

- Entender que un `struct` es una plantilla de memoria contigua, no un objeto. [web:7]
- Manejar punteros a struct sin perder la referencia ni liberar mal. [file:34]
- Separar responsabilidades en un Makefile (compilar, enlazar, limpiar). [web:7]

## Descripción

C08 y C09 cierran la parte intermedia de la Piscina: el alumno aprende a
crear tipos compuestos con `struct`, a parametrizar con macros y a empaquetar
su código en una librería que otros programas pueden enlazar. [web:7][file:34]

El trabajo con listas enlazadas (introducidas aquí mediante la `t_list` de
`libft`) es la antesala de los módulos avanzados (C10–C13), donde aparecen
árboles, pilas y estructuras más complejas. [file:34]

## Retos vinculados

- `reto-c08-struct-basic` – definir y usar un struct sencillo. [web:7]
- `reto-c08-ft-list-size` – contar nodos de una lista enlazada. [file:34]
- `reto-c09-makefile-lib` – Makefile que compila y genera una librería. [web:7]

## Recursos recomendados

- `resource-cs50x-week5` – semana de CS50 sobre datos y memoria dinámica. [web:24]
