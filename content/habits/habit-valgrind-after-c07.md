---
id: habit-valgrind-after-c07
type: habit
title: Pasar Valgrind tras cada reto de memoria
phases:
  - fase3-c-intermedio
  - fase4-simulacion
---

### Descripción

Desde C07 en adelante, ejecutar `valgrind --leak-check=full` tras cada reto que
use `malloc`/`free`. Internalizar la caza de fugas de memoria desde el principio
evita errores graves en los exámenes y en libft.

### Frecuencia

- cada reto con malloc/free

### Métricas

- Retos con `0 bytes definitely lost` en Valgrind.
- Fugas detectadas y corregidas por semana.
