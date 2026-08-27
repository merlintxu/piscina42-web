---
id: c-retos-basicos
type: challenge-collection
title: Retos de C básicos (C00–C02)
source: piscina42-web
---

## reto-c01-swap-int

---
id: reto-c01-swap-int
type: challenge
title: Intercambio de enteros con punteros
source: piscina42-web
module: c01-punteros
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 30
---

### Enunciado

Implementa una función `ft_swap` que reciba dos punteros a `int` y
intercambie los valores de las variables apuntadas:

```c
void    ft_swap(int *a, int *b);
```

La función debe modificar los valores originales de `a` y `b` de forma que,
tras la llamada, los contenidos queden intercambiados. [file:34]

### Restricciones

- No usar variables globales.
- Cumplir Norminette (longitud de función, número de variables, etc.).
- No devolver ningún valor; la modificación se hace por referencia.
- No usar funciones de la librería estándar. [file:34][web:11][web:12]

### Casos de prueba sugeridos

```text
Caso 1:
int a = 1;
int b = 2;
ft_swap(&a, &b);
// Resultado esperado: a == 2, b == 1

Caso 2:
int a = -10;
int b = 0;
// Resultado esperado: a == 0, b == -10

Caso 3:
valores grandes, combinación de positivos/negativos.
```

### Dificultad y tags

- Dificultad: medium
- Tags: punteros, fundamentos, Norminette


## reto-c01-pointer-arithmetic

---
id: reto-c01-pointer-arithmetic
type: challenge
title: Recorrido de array con aritmética de punteros
source: piscina42-web
module: c01-punteros
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 45
---

### Enunciado

Escribe una función que reciba un puntero a `int` y un tamaño `n`, recorra
el array usando exclusivamente aritmética de punteros y calcule la suma de
todos sus elementos:

```c
int     ft_sum_array(int *arr, int n);
```

No se permite usar índices (`arr[i]`); sólo expresiones del tipo `*(arr + i)`. [file:34]

### Restricciones

- No usar variables globales.
- Cumplir Norminette.
- Validar que `n` es mayor que 0; si no, devolver 0.
- No asumir que el puntero es siempre válido; comprobar `arr != NULL`. [file:34]

### Casos de prueba sugeridos

```text
Caso 1:
arr = [3,3,4], n = 3 -> resultado 10

Caso 2:
arr = [-5, 5, 10], n = 3 -> resultado 10

Caso 3:
arr = [], n = 0 -> resultado 0
```

### Dificultad y tags

- Dificultad: medium
- Tags: punteros, arrays, Norminette


## reto-c02-strlen-strcmp

---
id: reto-c02-strlen-strcmp
type: challenge
title: Implementación manual de strlen y strcmp
source: piscina42-web
module: c02-c03-cadenas
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 25
---

### Enunciado

Implementa dos funciones que recrean el comportamiento de `<string.h>`:

```c
size_t  ft_strlen(const char *s);
int     ft_strcmp(const char *s1, const char *s2);
```

- `ft_strlen` devuelve el número de caracteres antes del `\0`.
- `ft_strcmp` devuelve un entero negativo, 0 o positivo según si `s1` es
  menor, igual o mayor que `s2` en orden lexicográfico. [file:34]

### Restricciones

- No usar `<string.h>` ni otras funciones de librería para la comparación.
- Cumplir Norminette.
- `ft_strlen` no debe leer más allá del `\0`.
- `ft_strcmp` debe parar en el primer carácter distinto o en el `\0`. [file:34]

### Casos de prueba sugeridos

```text
Caso 1 (strlen):
ft_strlen("hola") -> 4
ft_strlen("") -> 0

Caso 2 (strcmp):
ft_strcmp("abc", "abc") -> 0
ft_strcmp("abc", "abd") -> negativo
ft_strcmp("abd", "abc") -> positivo
```

### Dificultad y tags

- Dificultad: easy
- Tags: cadenas, punteros, fundamentos, Norminette


## reto-c00-ft-putchar

---
id: reto-c00-ft-putchar
type: challenge
title: ft_putchar — imprimir un carácter
source: piscina42-web
module: c00-intro
phase: fase2-c-basico
difficulty: easy
estimated_time_minutes: 15
---

### Enunciado

Implementa `ft_putchar` que imprima un carácter por salida estándar usando
`write` (sin `printf`):

```c
void    ft_putchar(char c);
```

Inspirado en el ex00 de C00 de nataliakzm/School42_Piscine y mlrcbsousa/42piscine. [web:157][web:158]

### Restricciones

- Usar `write(1, &c, 1)`; no `printf` ni `putchar`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_putchar('A') -> imprime "A"
```

### Dificultad y tags

- Dificultad: easy
- Tags: write, salida, fundamentos, Norminette


## reto-c00-ft-print-alphabet

---
id: reto-c00-ft-print-alphabet
type: challenge
title: ft_print_alphabet — imprimir a–z
source: piscina42-web
module: c00-intro
phase: fase2-c-basico
difficulty: easy
estimated_time_minutes: 20
---

### Enunciado

Implementa `ft_print_alphabet` que imprima el abecedario en minúsculas
(`a` a `z`) seguidos de un salto de línea, usando solo `write`:

```c
void    ft_print_alphabet(void);
```

Inspirado en el ex01 de C00 de varios repos de Piscine. [web:158]

### Restricciones

- Bucle de `'a'` a `'z'` con `ft_putchar` (o `write` directo).
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_print_alphabet() -> "abcdefghijklmnopqrstuvwxyz\n"
```

### Dificultad y tags

- Dificultad: easy
- Tags: bucles, write, fundamentos, Norminette


## reto-c00-ft-ft

---
id: reto-c00-ft-ft
type: challenge
title: ft_ft — puntero a 42
source: piscina42-web
module: c00-intro
phase: fase2-c-basico
difficulty: easy
estimated_time_minutes: 15
---

### Enunciado

Implementa `ft_ft` que reciba un puntero a `int` y escriba el valor `42` en
la variable apuntada:

```c
void    ft_ft(int *n);
```

Inspirado en el ex01 de C00 (el clásico "pointer to 42"). [web:158]

### Restricciones

- Modificar el valor por referencia (`*n = 42`).
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
int x = 0; ft_ft(&x); // x == 42
```

### Dificultad y tags

- Dificultad: easy
- Tags: punteros, paso por referencia, fundamentos, Norminette


## reto-c01-ft-putstr

---
id: reto-c01-ft-putstr
type: challenge
title: ft_putstr — imprimir una cadena
source: piscina42-web
module: c01-punteros
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 20
---

### Enunciado

Implementa `ft_putstr` que imprima una cadena completa (hasta `\0`) con
`write`:

```c
void    ft_putstr(char *str);
```

Complementa `ft_putchar` y es base de todas las funciones de impresión. [web:158]

### Restricciones

- Recorrer con puntero hasta `\0`; no usar `printf`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_putstr("hola") -> imprime "hola"
ft_putstr("") -> no imprime nada
```

### Dificultad y tags

- Dificultad: easy
- Tags: punteros, cadenas, write, Norminette


## reto-c02-ft-strcpy

---
id: reto-c02-ft-strcpy
type: challenge
title: ft_strcpy — copiar cadena
source: piscina42-web
module: c02-c03-cadenas
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 25
---

### Enunciado

Implementa `ft_strcpy` que copie `src` en `dest` (incluyendo `\0`) y devuelva
`dest`:

```c
char    *ft_strcpy(char *dest, char *src);
```

Inspirado en los ejercicios de C02 de italoholanda/c_42-piscine. [web:159]

### Restricciones

- Copiar carácter a carácter hasta y con `\0`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_strcpy(buf, "abc") -> buf == "abc"
```

### Dificultad y tags

- Dificultad: easy
- Tags: cadenas, punteros, fundamentos, Norminette
