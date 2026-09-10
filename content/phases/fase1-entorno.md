---
id: fase1-entorno
type: phase
slug: fase1-entorno
order: 1
title: Fase 1: Entorno, terminal, Bash y Git
source: piscina42-web
summary: >
  Primer contacto con el flujo de trabajo de la Piscina: ganar soltura en la
  terminal Unix, dominar permisos, redirecciones y Git básico, e interiorizar
  un flujo de commits semánticos. Prepara el terreno para Shell00–01 y reduce
  la fricción de entorno antes de enfrentar C00–C13.
modules:
  - shell00-shell01
challenges:
  - reto-shell00-midls
  - reto-shell00-git-clean
  - reto-shell01-find-sh
resources:
  - resource-shell00-subject
  - resource-shell01-subject
  - resource-bash-basics
  - resource-git-basics
habits:
  - habit-terminal-daily
  - habit-git-commits-daily
---

# Fase 1: Entorno, terminal, Bash y Git

## Objetivos

- Abandonar la dependencia de la interfaz gráfica y trabajar casi exclusivamente desde la terminal Unix. [file:34][web:110]  
- Dominar comandos básicos de navegación, manipulación de archivos, permisos y redirecciones/pipes. [web:110][web:113][web:118]  
- Interiorizar un flujo mínimo de Git: inicializar repos, revisar estado, hacer commits semánticos y entender gitignore. [web:112][web:119]  
- Preparar el terreno para Shell00–Shell01 y para que C00–C13 se puedan trabajar sin fricciones de entorno. [file:34][web:5]

## Subfases

- Subfase 1.1: Shell00 – Fundamentos de Unix y Git.
- Subfase 1.2: Shell01 – Text‑processing, pipelines y scripting sencillo.

## Descripción

Los primeros días de la Piscina giran en torno a Shell00 y, opcionalmente, Shell01:
aprender a moverse por el sistema de archivos, ver y cambiar permisos, crear enlaces,
usar pipes y redirecciones, y automatizar tareas repetitivas con pequeños scripts. [web:110][web:113][web:118]  

Al mismo tiempo se introduce Git como herramienta central del flujo de trabajo:
crear repos, hacer commits, listar los últimos hashes, ignorar archivos y limpiar
basura (`*~`, `#*#`). Gran parte de esto aparece en los ejercicios oficiales de Shell00
(`midLS`, `git_commit.sh`, `git_ignore.sh`, `clean`). [web:112][web:115][web:118]  

Esta fase busca que el candidato llegue a C con soltura en terminal y Git, reduciendo
el coste cognitivo de pelear con el entorno y permitiendo concentrarse en la lógica
de programación desde C00 en adelante. [file:34][web:5][web:122]

## Relación con módulos

- `shell00-shell01`: módulo que agrupa los ejercicios Shell00–Shell01 (fundamentos de CLI, permisos, Git, text‑processing y scripting). [web:110][web:112][web:119]

## Retos sugeridos

- `reto-shell00-midls`: reproducir el comportamiento del comando `midLS` de Shell00 (listar archivos/directorios con orden y formato específico). [web:115][web:118]  
- `reto-shell00-git-clean`: crear un script tipo `clean` que encuentre y borre archivos `*~` y `#*#` en el árbol actual. [web:115][web:118]  
- `reto-shell01-find-sh`: escribir una línea de comando que encuentre todos los `.sh` y muestre sólo el nombre del fichero sin extensión. [web:120]

## Recursos recomendados

- `resource-shell00-subject`: PDF/subject oficial de Shell00 con enunciados de ejercicios y reglas de entrega. [web:115][web:117]  
- `resource-shell01-subject`: PDF/subject oficial de Shell01 con ejercicios de text‑processing y scripting. [web:120][web:117]  
- `resource-bash-basics`: curso/guía sobre Bash básico (historial, variables, control de flujo).  
- `resource-git-basics`: tutorial de Git centrado en `init`, `status`, `log`, `add`, `commit`, `push` y `gitignore`. [web:112][web:119]