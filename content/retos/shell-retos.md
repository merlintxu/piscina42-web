---
id: shell-retos
type: challenge-collection
title: Retos de Shell (Shell00–Shell01)
source: piscina42-web
---

# Retos de Shell (Shell00–Shell01)

Colección de retos de la Fase 1 (terminal, Bash y Git). Cada reto tiene su
nota individual en el vault.

## reto-shell00-midls

---
id: reto-shell00-midls
type: challenge
slug: reto-shell00-midls
title: midLS (listado tipo Shell00)
source: piscina42-web
module: shell00-shell01
phase: fase1-entorno
difficulty: easy
estimated_time_minutes: 30
tags:
  - shell
  - ls
  - permisos
  - shell00
norminette_focus: false
---

### Enunciado

Reproduce el comportamiento del comando `midLS` de Shell00: listar los
archivos y directorios del árbol actual ordenados por fecha de modificación,
separados por comas, respetando el formato exigido por el subject. [web:115][web:118]

### Restricciones

- El script debe ejecutarse con `/bin/sh`.
- No usar herramientas gráficas; sólo comandos de shell (ls, find, etc.). [web:110][web:118]
- Cumplir el formato de salida del subject (separadores, orden). [web:115]

### Casos de prueba sugeridos

```text
Carpeta con a.txt (mod 10:00), b.txt (mod 09:30):
midLS -> "b.txt, a.txt"  (formato según subject)
```

### Dificultad y tags

- Dificultad: easy
- Tags: shell, ls, permisos, Shell00


## reto-shell00-git-clean

---
id: reto-shell00-git-clean
type: challenge
slug: reto-shell00-git-clean
title: clean (borrado de basura)
source: piscina42-web
module: shell00-shell01
phase: fase1-entorno
difficulty: easy
estimated_time_minutes: 20
tags:
  - shell
  - find
  - limpieza
  - shell00
norminette_focus: false
---

### Enunciado

Crea un script tipo `clean` que encuentre y borre en el árbol actual los
archivos de respaldo `*~` y los archivos temporales `#*#`. [web:115][web:118]

### Restricciones

- Una sola línea de `find` con `-name` y `-delete` (o equivalente).
- No borrar archivos que no coincidan con los patrones. [web:115]

### Casos de prueba sugeridos

```text
Árbol con a.txt~, #b.txt#:
clean -> elimina a.txt~ y #b.txt#, deja el resto intacto.
```

### Dificultad y tags

- Dificultad: easy
- Tags: shell, find, limpieza, Shell00


## reto-shell01-find-sh

---
id: reto-shell01-find-sh
type: challenge
slug: reto-shell01-find-sh
title: find_sh (nombres .sh sin extensión)
source: piscina42-web
module: shell00-shell01
phase: fase1-entorno
difficulty: easy
estimated_time_minutes: 15
tags:
  - shell
  - find
  - sed
  - shell01
norminette_focus: false
---

### Enunciado

Escribe una línea de comando que encuentre todos los archivos `.sh` en el
árbol y muestre sólo el nombre del fichero sin la extensión. [web:120]

### Restricciones

- Usar `find` y `sed`/`basename` en un pipeline.
- No listar la ruta completa, sólo el nombre base sin `.sh`. [web:120]

### Casos de prueba sugeridos

```text
Árbol con x/y.sh, z.sh:
find_sh -> "y", "z"  (orden según subject)
```

### Dificultad y tags

- Dificultad: easy
- Tags: shell, find, sed, Shell01


## reto-shell00-hello

---
id: reto-shell00-hello
type: challenge
slug: reto-shell00-hello
title: Hello, Shell00
source: piscina42-web
module: shell00-shell01
phase: fase1-entorno
difficulty: easy
estimated_time_minutes: 10
tags:
  - shell
  - echo
  - shell00
norminette_focus: false
---

### Enunciado

Crea un script que imprima exactamente el texto `Hello, Shell00!` por
salida estándar (sin comillas ni saltos extra). Inspirado en el ex00 de
Shell00 de repos como mlrcbsousa/42piscine. [web:155]

### Restricciones

- El script debe ejecutarse con `/bin/sh`.
- Sin argumentos; salida literal exacta. [web:115][web:118]
- Cumplir el formato de entrega del subject.

### Casos de prueba sugeridos

```text
./hello.sh -> "Hello, Shell00!"
```

### Dificultad y tags

- Dificultad: easy
- Tags: shell, echo, Shell00


## reto-shell00-clean

---
id: reto-shell00-clean
type: challenge
slug: reto-shell00-clean
title: clean — borrado de basura
source: piscina42-web
module: shell00-shell01
phase: fase1-entorno
difficulty: easy
estimated_time_minutes: 15
tags:
  - shell
  - find
  - limpieza
  - shell00
norminette_focus: false
---

### Enunciado

Escribe un script `clean` que elimine en el árbol actual todos los archivos
de respaldo `*~` y temporales `#*#`. Inspirado en el ex08 de Shell00 de
juancumbeq/42_BCN_C_Piscine_2023. [web:156]

### Restricciones

- Una sola línea `find` con `-name` y `-delete` (o equivalente).
- No borrar archivos que no coincidan con los patrones. [web:115]

### Casos de prueba sugeridos

```text
Árbol con a.txt~, #b.txt# -> clean elimina ambos, deja el resto.
```

### Dificultad y tags

- Dificultad: easy
- Tags: shell, find, limpieza, Shell00


## reto-shell01-ffs

---
id: reto-shell01-ffs
type: challenge
slug: reto-shell01-ffs
title: ffs — From First to Last Sequence
source: piscina42-web
module: shell00-shell01
phase: fase1-entorno
difficulty: easy
estimated_time_minutes: 20
tags:
  - shell
  - sed
  - texto
  - shell01
norminette_focus: false
---

### Enunciado

Escribe un script que, dado un argumento, imprima la cadena desde el primer
hasta el último carácter en orden inverso de posiciones (estilo del ex01 de
Shell01). Inspirado en los ejercicios de manipulación de texto de Shell01. [web:120]

### Restricciones

- Usar `sed`/`rev` o `awk` en un pipeline.
- No usar lenguajes externos (solo shell). [web:120]

### Casos de prueba sugeridos

```text
ffs "hola" -> "aloh"
ffs "abc" -> "cba"
```

### Dificultad y tags

- Dificultad: easy
- Tags: shell, sed, texto, Shell01


## reto-shell01-print

---
id: reto-shell01-print
type: challenge
slug: reto-shell01-print
title: print — imprimir argumentos con separador
source: piscina42-web
module: shell00-shell01
phase: fase1-entorno
difficulty: easy
estimated_time_minutes: 15
tags:
  - shell
  - argumentos
  - bucles
  - shell01
norminette_focus: false
---

### Enunciado

Escribe un script que imprima sus argumentos (excepto `$0`) separados por
saltos de línea o por un separador dado, en el orden recibido. Basado en el
ex03/ex04 de Shell01 de varios repos de Piscine. [web:120]

### Restricciones

- Usar un bucle `for`/`while` sobre `$@`.
- No usar `echo` con flags no POSIX si el subject lo prohíbe. [web:120]

### Casos de prueba sugeridos

```text
print uno dos -> "uno\ndos"
print a b c -> "a\nb\nc"
```

### Dificultad y tags

- Dificultad: easy
- Tags: shell, argumentos, bucles, Shell01
