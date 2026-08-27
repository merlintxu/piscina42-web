---
id: reto-c06-argv-count
type: challenge
slug: reto-c06-argv-count
title: Contar e imprimir argumentos (argv)
source: piscina42-web
module: c06-cli-args
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 20
tags:
  - argc
  - argv
  - main
  - norminette
norminette_focus: true
---

### Enunciado

Escribe un programa que reciba argumentos por línea de comandos y, para cada
uno, los imprima precedidos de su índice (o bien imprima el total de
argumentos recibidos):

```c
int     main(int argc, char **argv);
```

Ignora `argv[0]` (nombre del programa) al contar argumentos útiles. [web:7]

### Restricciones

- Usar `argc` y `argv` en `main`. [web:7]
- Cumplir Norminette.
- No acceder a `argv[i]` para `i >= argc`. [web:7]

### Casos de prueba sugeridos

```text
./a.out uno dos tres -> 3 argumentos (o lista: 1:uno 2:dos 3:tres)
./a.out -> 0 argumentos
```

### Dificultad y tags

- Dificultad: easy
- Tags: argc, argv, main, Norminette
