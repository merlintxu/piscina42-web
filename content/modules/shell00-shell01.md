---
id: shell00-shell01
type: module
slug: shell00-shell01
order: 1
title: Shell00–Shell01: Fundamentos de Unix, Git y shell scripting
source: piscina42-web
phase: fase1-entorno
level: basic
concepts:
  - navegación de sistema de archivos
  - permisos y modos (chmod, rwx)
  - enlaces simbólicos y duros
  - redirecciones y pipes
  - búsqueda y diff (find, grep, wc, diff)
  - git básico
  - text-processing y scripting
cognitive_difficulties:
  - mentalidad de comandos frente a interfaz gráfica
  - modelo de permisos y riesgo con chmod/rm
  - recordar combinaciones de comandos y flags
  - disciplina de mensajes de commit en Git
challenges:
  - reto-shell00-midls
  - reto-shell00-git-clean
  - reto-shell01-find-sh
resources:
  - resource-shell00-subject
  - resource-shell01-subject
  - resource-bash-basics
  - resource-git-basics
---

# Shell00–Shell01: Fundamentos de Unix, Git y shell scripting

## Conceptos clave

- Navegación por el sistema de archivos: `cd`, `ls`, `pwd`, `mkdir`, `rm`, `mv`, `cp`. [web:110][web:113]  
- Permisos y modos: `chmod`, `ls -l`, modelo `rwx` y representación numérica (`764`, etc.). [web:110][web:113][web:118]  
- Enlaces simbólicos y duros: `ln -s`, `ln`, comprensión de referencias de sistema de archivos. [web:110][web:118]  
- Redirecciones y pipes: `>`, `>>`, `<`, `2>`, `|`, uso de `stdin`/`stdout`/`stderr`. [web:113][web:118]  
- Comandos de búsqueda y diff: `find`, `wc`, `grep`, `diff`, `patch`. [web:110][web:113][web:118]  
- Git básico: `git init`, `git status`, `git log`, `git commit`, `gitignore`. [web:112][web:119]  
- Text‑processing y scripting: `tr`, `wc`, `grep`, `sed`, pipelines de varios comandos y scripts `.sh` ejecutables con `/bin/sh`. [web:110][web:113][web:120]

## Dificultades cognitivas

- Cambiar la mentalidad de “click en interfaz gráfica” a “comandos que describen acciones”.  
- Entender bien el modelo de permisos y no romper cosas por error con `chmod` o `rm`. [web:113][web:118]  
- Recordar combinaciones de comandos y flags (`ls -ptm`, `find . -name`, etc.), sin caer en copiar y pegar sin comprensión. [web:113][web:118]  
- Aceptar que Git requiere mensajes de commit claros y disciplina de trabajo (no todo se arregla con `git reset --hard`). [web:112][web:119]  

## Descripción

Shell00 está diseñado para que el candidato se vuelva competente en el uso del shell
Unix: crear, mover y borrar archivos y directorios, trabajar con enlaces, cambiar
permisos, usar pipes y redirecciones y entender el modelo de entrada/salida estándar. [web:110][web:113][web:115]  

Los ejercicios típicos incluyen archivos especiales (`z`, `testShell00`), scripts
para listar archivos con formato concreto (`midLS`), scripts para mostrar los últimos
commits de Git (`git_commit.sh`), listar archivos ignorados (`git_ignore.sh`) y
limpiar basura (`clean`). [web:112][web:115][web:118]  

Shell01 profundiza en text‑processing y scripting: comandos como `tr`, `wc`, `grep`,
`sed`, combinados en pipelines, y ejercicios como `find_sh`, `count_files`, `print_groups`,
`MAC` o `add_chelou` que enseñan a construir comandos complejos sobre datos reales. [web:110][web:112][web:120]  

Este módulo conjunto es la base de toda la Piscina: sin soltura en Shell00–Shell01,
cada proyecto posterior (C00–C13, Rush, Examshell) se vuelve más costoso.

## Retos vinculados

- `reto-shell00-midls` – reproducir el comportamiento del script `midLS` (listar archivos/directorios por fecha de modificación, separados por comas). [web:118]  
- `reto-shell00-git-clean` – construir un script `clean` que encuentre y borre archivos `*~` y `#*#` en el árbol actual con una sola línea `find`. [web:115][web:118]  
- `reto-shell01-find-sh` – escribir línea de comando `find_sh` que busque todos los `.sh` en el árbol y muestre sólo el nombre de fichero sin extensión. [web:120]

## Recursos recomendados

- `resource-shell00-subject` – PDF/subject oficial de Shell00 (ejercicios, reglas de ejecución con `/bin/sh`). [web:115][web:116][web:117]  
- `resource-shell01-subject` – PDF/subject oficial de Shell01 (ejercicios de text‑processing y scripting). [web:120][web:117]  
- `resource-bash-basics` – curso breve de Bash que cubre historia, variables, control de flujo y scripting simple.  
- `resource-git-basics` – tutorial enfocado en flujo diario de trabajo con Git (`init`, `add`, `status`, `log`, `commit`, `push`). [web:112][web:119]