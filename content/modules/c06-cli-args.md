---
id: c06-cli-args
type: module
slug: c06-cli-args
order: 6
title: C06: Argumentos de línea de comandos
source: piscina42-web
phase: fase3-c-intermedio
level: intermediate
concepts:
  - main con argc y argv
  - argv[0] es el nombre del programa
  - argv como array de punteros a char
  - validar argc antes de acceder a argv[i]
cognitive_difficulties:
  - entender que argv es char** (no array bidimensional)
  - distinguir conteo argc del índice útil
  - argumentos con espacios (depende del shell)
challenges:
  - reto-c06-argv-count
resources:
  - resource-cs50x-overview
  - resource-cs50x-week4
  - resource-cheat-sh
---

# C06: Argumentos de línea de comandos

## Conceptos clave

- `main` con dos parámetros: `int argc` (número de argumentos) y `char **argv` (array de cadenas). [web:7][web:24]
- `argv[0]` es el nombre del programa; `argv[1]` en adelante son los argumentos del usuario. [web:7]
- Recorrer `argv` como un array de punteros a `char` (cadenas terminadas en `\0`). [web:7]
- Validar `argc` antes de acceder a `argv[i]` para no leer fuera de rango. [web:7]

## Dificultades cognitivas

- Entender que `argv` es un puntero a puntero (`char **`), no un array bidimensional. [web:7]
- Distinguir el conteo `argc` (que incluye el nombre del programa) del índice útil. [web:7]
- Manejar argumentos con espacios (depende del shell, no del programa). [web:7]

## Descripción

C06 introduce la recepción de argumentos desde la línea de comandos, el
primer contacto real con `main(int argc, char **argv)`. El alumno aprende
que el programa puede parametrizarse en tiempo de ejecución, lo que abre
la puerta a herramientas tipo CLI. [web:7][web:24]

Aunque es un módulo corto, sienta la base para C07 (donde los argumentos
suelen combinarse con memoria dinámica) y para los exámenes de la Piscina,
donde muchos retos procesan `argv`. [web:7]

## Retos vinculados

- `reto-c06-argv-count` – contar e imprimir los argumentos recibidos. [web:7]

## Recursos recomendados

- `resource-cs50x-overview` – overview de CS50 como contexto general de C. [web:30]
