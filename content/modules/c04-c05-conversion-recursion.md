---
id: c04-c05-conversion-recursion
type: module
slug: c04-c05-conversion-recursion
order: 5
title: C04–C05: Conversión de datos y recursión
source: piscina42-web
phase: fase3-c-intermedio
level: intermediate
concepts:
  - conversión cadena↔entero (atoi/itoa)
  - dígitos como caracteres y su valor numérico
  - llamadas recursivas (caso base, caso recursivo, pila)
  - recursión vs iteración
cognitive_difficulties:
  - visualizar la pila de llamadas y el orden de retorno
  - manejar desbordamiento de int en ft_atoi
  - reservar memoria exacta en ft_itoa
challenges:
  - reto-c04-ft-atoi
  - reto-c04-ft-itoa
  - reto-c05-fibonacci
  - reto-c05-factorial
resources:
  - resource-cs50x-overview
  - resource-cs50x-week4
  - resource-godbolt
---

# C04–C05: Conversión de datos y recursión

## Conceptos clave

- Conversión de cadenas a enteros (`atoi`) y de enteros a cadenas (`itoa`), gestionando signo y desbordamiento. [file:34][web:7]
- Dígitos individuales como caracteres (`'0'` a `'9'`) y su valor numérico (`c - '0'`). [file:34]
- Llamadas recursivas: caso base, caso recursivo y pila de llamadas. [file:34][web:7]
- Recursión vs. iteración: cuándo es natural (árboles, divide y vencerás) y sus costes. [file:34]

## Dificultades cognitivas

- Visualizar la pila de llamadas y el orden de retorno en la recursión. [file:34]
- Manejar el desbordamiento de `int` en `ft_atoi` sin comportamiento indefinido. [file:34]
- Construir `ft_itoa` (recursivo o iterativo) reservando exactamente la memoria necesaria. [file:34]

## Descripción

C04 y C05 combinan dos competencias centrales: transformar representaciones
(texto ↔ número) y razonar con funciones que se llaman a sí mismas. `ft_atoi`
obliga a recorrer una cadena, acumular un valor y detectar signo y límites;
`ft_itoa` obliga a descomponer un entero en dígitos y devolver una cadena
reservada con `malloc`. [file:34][web:7]

La recursión (C05) introduce el pensamiento "divide y vencerás": problemas
como la sucesión de Fibonacci o el factorial se expresan de forma elegante,
pero exigen cuidar el caso base para no entrar en bucle infinito. [file:34]

## Retos vinculados

- `reto-c04-ft-atoi` – convertir cadena a entero con signo y límites. [file:34]
- `reto-c04-ft-itoa` – convertir entero a cadena (reserva con `malloc`). [file:34]
- `reto-c05-fibonacci` – sucesión de Fibonacci recursiva. [file:34]
- `reto-c05-factorial` – factorial recursivo con caso base. [file:34]

## Recursos recomendados

- `resource-cs50x-overview` – overview de CS50 como contexto general de C. [web:30]
