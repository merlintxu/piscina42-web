---
id: c-retos-intermedios
type: challenge-collection
title: Retos de C intermedios (C04–C09)
source: piscina42-web
challenges:
  - reto-c06-argv-count
---

# Retos de C intermedios (C04–C09)

Colección de retos de nivel intermedio de la Piscina (conversión, recursión,
memoria dinámica, structs y librerías). Cada reto tiene su nota individual
en el vault. En este lote se pueblan los retos de C04–C05 y C07 (memoria
dinámica).

## reto-c04-ft-atoi

---
id: reto-c04-ft-atoi
type: challenge
slug: reto-c04-ft-atoi
title: ft_atoi — cadena a entero
source: piscina42-web
module: c04-c05-conversion-recursion
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 40
tags:
  - conversión
  - cadenas
  - punteros
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_atoi` que convierta una cadena en un `int`, ignorando
espacios iniciales y gestionando un signo opcional `+`/`-`:

```c
int     ft_atoi(const char *str);
```

Debe devolver `0` si no hay dígitos; en caso de desbordamiento, el comportamiento
de la Piscina suele aceptar el valor obtenido sin `long`, pero se recomienda
razonar los límites de `INT_MIN`/`INT_MAX`. [file:34]

### Restricciones

- No usar funciones de `<stdlib.h>` (`atoi`, `strtol`). [file:34]
- Cumplir Norminette.
- Ignorar espacios/tabulaciones iniciales y un único signo. [file:34]

### Casos de prueba sugeridos

```text
ft_atoi("42") -> 42
ft_atoi("   -123") -> -123
ft_atoi("+7abc") -> 7
ft_atoi("no") -> 0
```

### Dificultad y tags

- Dificultad: medium
- Tags: conversión, cadenas, punteros, Norminette


## reto-c04-ft-itoa

---
id: reto-c04-ft-itoa
type: challenge
slug: reto-c04-ft-itoa
title: ft_itoa — entero a cadena
source: piscina42-web
module: c04-c05-conversion-recursion
phase: fase3-c-intermedio
difficulty: hard
estimated_time_minutes: 60
tags:
  - conversión
  - malloc
  - cadenas
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_itoa` que convierta un `int` en su representación decimal en
una cadena reservada con `malloc` (terminada en `\0`):

```c
char    *ft_itoa(int n);
```

Debe devolver `NULL` si falla la reserva de memoria. [file:34]

### Restricciones

- Usar `malloc` para la cadena resultado.
- Cumplir Norminette.
- Manejar `INT_MIN` (no se puede representar `-INT_MIN` en `int`). [file:34]

### Casos de prueba sugeridos

```text
ft_itoa(42) -> "42"  (cadena con malloc)
ft_itoa(-123) -> "-123"
ft_itoa(0) -> "0"
ft_itoa(-2147483648) -> "-2147483648"
```

### Dificultad y tags

- Dificultad: hard
- Tags: conversión, malloc, cadenas, Norminette


## reto-c05-fibonacci

---
id: reto-c05-fibonacci
type: challenge
slug: reto-c05-fibonacci
title: Fibonacci recursivo
source: piscina42-web
module: c04-c05-conversion-recursion
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 20
tags:
  - recursión
  - caso base
  - norminette
norminette_focus: true
---

### Enunciado

Escribe una función recursiva `ft_fibonacci` que devuelva el n-ésimo término
de la sucesión de Fibonacci (F(0)=0, F(1)=1):

```c
int     ft_fibonacci(int index);
```

Para `index < 0`, devolver `-1`. [file:34]

### Restricciones

- Implementación recursiva con caso base.
- Cumplir Norminette.
- No usar variables globales ni bucles (en la versión puramente recursiva). [file:34]

### Casos de prueba sugeridos

```text
ft_fibonacci(0) -> 0
ft_fibonacci(1) -> 1
ft_fibonacci(7) -> 13
ft_fibonacci(-3) -> -1
```

### Dificultad y tags

- Dificultad: easy
- Tags: recursión, caso base, Norminette


## reto-c05-factorial

---
id: reto-c05-factorial
type: challenge
slug: reto-c05-factorial
title: Factorial recursivo
source: piscina42-web
module: c04-c05-conversion-recursion
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 20
tags:
  - recursión
  - caso base
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_factorial` recursiva que calcule el factorial de `n` (`n!`),
o `0` si `n < 0` o el resultado no cabe en un `int` (según convención del
subject de la Piscina):

```c
int     ft_factorial(int nb);
```

### Restricciones

- Caso base `0! = 1`.
- Cumplir Norminette.
- Devolver `0` ante entrada negativa (convención común en la Piscina). [file:34]

### Casos de prueba sugeridos

```text
ft_factorial(0) -> 1
ft_factorial(5) -> 120
ft_factorial(-1) -> 0
```

### Dificultad y tags

- Dificultad: easy
- Tags: recursión, caso base, Norminette


## reto-c07-ft-strdup

---
id: reto-c07-ft-strdup
type: challenge
slug: reto-c07-ft-strdup
title: ft_strdup — duplicar cadena con malloc
source: piscina42-web
module: c07-asignacion-dinamica
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 20
tags:
  - malloc
  - cadenas
  - memoria dinámica
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_strdup` que reserva memoria con `malloc` y copia la cadena
`src` (incluyendo el `\0`) en la nueva zona:

```c
char    *ft_strdup(const char *src);
```

Devuelve `NULL` si falla la reserva. [file:34]

### Restricciones

- Usar `malloc` para la copia.
- Cumplir Norminette.
- Reservar exactamente `ft_strlen(src) + 1` bytes. [file:34]

### Casos de prueba sugeridos

```text
ft_strdup("hola") -> nueva cadena "hola" (heap), independiente de src
ft_strdup("") -> cadena ""
```

### Dificultad y tags

- Dificultad: easy
- Tags: malloc, cadenas, memoria dinámica, Norminette


## reto-c07-ft-range

---
id: reto-c07-ft-range
type: challenge
slug: reto-c07-ft-range
title: ft_range — array de enteros en el heap
source: piscina42-web
module: c07-asignacion-dinamica
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 30
tags:
  - malloc
  - arrays
  - memoria dinámica
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_range` que devuelve un array de `int` reservado con `malloc`
que contiene los valores desde `min` hasta `max` (exclusivo):

```c
int     *ft_range(int min, int max);
```

Si `min >= max`, devuelve `NULL`. [file:34]

### Restricciones

- Reservar `(max - min) * sizeof(int)` bytes.
- Cumplir Norminette.
- El último elemento debe ser `max - 1`. [file:34]

### Casos de prueba sugeridos

```text
ft_range(1, 4) -> [1, 2, 3]
ft_range(0, 3) -> [0, 1, 2]
ft_range(5, 5) -> NULL
```

### Dificultad y tags

- Dificultad: medium
- Tags: malloc, arrays, memoria dinámica, Norminette


## reto-c07-ft-ultimate-range

---
id: reto-c07-ft-ultimate-range
type: challenge
slug: reto-c07-ft-ultimate-range
title: ft_ultimate_range — rango con errores
source: piscina42-web
module: c07-asignacion-dinamica
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 35
tags:
  - malloc
  - puntero a puntero
  - memoria dinámica
  - norminette
norminette_focus: true
---

### Enunciado

Variante de `ft_range` que, además de devolver el array, indica el tamaño
real mediante un parámetro de salida y devuelve `NULL` en caso de error:

```c
int     *ft_ultimate_range(int **range, int min, int max);
```

Devuelve el tamaño del array (o `-1` en error). [file:34]

### Restricciones

- Reservar el array con `malloc` y asignarlo a `*range`.
- Cumplir Norminette.
- Devolver `-1` si `min >= max` o falla `malloc`. [file:34]

### Casos de prueba sugeridos

```text
ft_ultimate_range(&r, 1, 4) -> r = [1,2,3], retorno 3
ft_ultimate_range(&r, 5, 5) -> retorno -1, r = NULL
```

### Dificultad y tags

- Dificultad: medium
- Tags: malloc, puntero a puntero, memoria dinámica, Norminette


## reto-c07-ft-strjoin

---
id: reto-c07-ft-strjoin
type: challenge
slug: reto-c07-ft-strjoin
title: ft_strjoin — concatenar con malloc
source: piscina42-web
module: c07-asignacion-dinamica
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 30
tags:
  - malloc
  - cadenas
  - memoria dinámica
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_strjoin` que reserva y devuelve una nueva cadena con la
concatenación de `s1` y `s2`:

```c
char    *ft_strjoin(char const *s1, char const *s2);
```

Devuelve `NULL` si falla la reserva. [file:34]

### Restricciones

- Reservar `strlen(s1) + strlen(s2) + 1` bytes.
- Cumplir Norminette.
- Si alguno es `NULL`, comportamiento según convención (devolver copia del otro o `NULL`). [file:34]

### Casos de prueba sugeridos

```text
ft_strjoin("hola ", "mundo") -> "hola mundo"
ft_strjoin("", "x") -> "x"
```

### Dificultad y tags

- Dificultad: medium
- Tags: malloc, cadenas, memoria dinámica, Norminette


## reto-c07-ft-split

---
id: reto-c07-ft-split
type: challenge
slug: reto-c07-ft-split
title: ft_split — partir cadena en array de cadenas
source: piscina42-web
module: c07-asignacion-dinamica
phase: fase3-c-intermedio
difficulty: hard
estimated_time_minutes: 60
tags:
  - malloc
  - array de cadenas
  - memoria dinámica
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_split` que parte `str` usando el carácter `c` como separador
y devuelve un array de cadenas (reservado con `malloc`, terminado en `NULL`):

```c
char    **ft_split(char const *str, char c);
```

Devuelve `NULL` si falla la reserva. [file:34]

### Restricciones

- Reservar el array de punteros y cada cadena por separado.
- Cumplir Norminette.
- El array final debe terminar en `NULL`; separadores consecutivos se ignoran. [file:34]

### Casos de prueba sugeridos

```text
ft_split("hola,mundo,42", ',') -> ["hola", "mundo", "42", NULL]
ft_split("a,,b", ',') -> ["a", "b", NULL]
```

### Dificultad y tags

- Dificultad: hard
- Tags: malloc, array de cadenas, memoria dinámica, Norminette


## reto-c08-struct-basic

---
id: reto-c08-struct-basic
type: challenge
slug: reto-c08-struct-basic
title: Uso básico de struct
source: piscina42-web
module: c08-c09-structs-lib
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 25
tags:
  - struct
  - typedef
  - norminette
norminette_focus: true
---

### Enunciado

Define un `struct` sencillo (por ejemplo, `t_point` con `x` e `y` enteros) y
escribe una función que cree uno, asigne valores y devuelva la suma de sus
campos:

```c
typedef struct s_point
{
    int     x;
    int     y;
}   t_point;

int     ft_point_sum(t_point p);
```

### Restricciones

- Usar `typedef` para el tipo del struct.
- Cumplir Norminette.
- Acceder a los campos con el operador `.` (no punteros todavía). [web:7]

### Casos de prueba sugeridos

```text
p.x = 3, p.y = 4 -> ft_point_sum(p) = 7
p.x = -1, p.y = 1 -> 0
```

### Dificultad y tags

- Dificultad: easy
- Tags: struct, typedef, Norminette


## reto-c08-ft-list-size

---
id: reto-c08-ft-list-size
type: challenge
slug: reto-c08-ft-list-size
title: ft_list_size — tamaño de lista enlazada
source: piscina42-web
module: c08-c09-structs-lib
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 25
tags:
  - listas enlazadas
  - punteros
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_list_size` que devuelva el número de nodos de una lista
enlazada simple definida por:

```c
typedef struct s_list
{
    void            *data;
    struct s_list   *next;
}   t_list;

int     ft_list_size(t_list *begin_list);
```

Si la lista es `NULL`, devuelve `0`. [file:34]

### Restricciones

- Recorrer la lista con un puntero que avanza por `next`.
- Cumplir Norminette.
- No modificar la lista, solo contar. [file:34]

### Casos de prueba sugeridos

```text
lista vacía -> 0
lista [a]->[b]->[c] -> 3
```

### Dificultad y tags

- Dificultad: medium
- Tags: listas enlazadas, punteros, Norminette


## reto-c09-makefile-lib

---
id: reto-c09-makefile-lib
type: challenge
slug: reto-c09-makefile-lib
title: Makefile que genera librería estática
source: piscina42-web
module: c08-c09-structs-lib
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 40
tags:
  - Makefile
  - librería estática
  - ar
  - norminette
norminette_focus: true
---

### Enunciado

Escribe un `Makefile` que compile varios archivos fuente (`.c`) en objetos
(`.o`), empaquete la librería estática `libft.a` con `ar rcs`, y ofrezca
los objetivos `all`, `clean`, `fclean` y `re`:

```make
NAME = libft.a
SRC = ft_atoi.c ft_strdup.c ...
OBJ = $(SRC:.c=.o)
```

### Restricciones

- Usar variables y reglas implícitas de `make`.
- Cumplir la norma de la Piscina para Makefiles (tabuladores, no `.PHONY`
  inventados fuera de lo permitido). [web:7]
- `fclean` debe borrar también `$(NAME)`. [web:7]

### Casos de prueba sugeridos

```text
make       -> genera libft.a
make clean -> borra .o
make re    -> rebuild completo
```

### Dificultad y tags

- Dificultad: medium
- Tags: Makefile, librería estática, ar, Norminette


## reto-c03-ft-substr

---
id: reto-c03-ft-substr
type: challenge
slug: reto-c03-ft-substr
title: ft_substr — extraer subcadena
source: piscina42-web
module: c02-c03-cadenas
phase: fase2-c-basico
difficulty: medium
estimated_time_minutes: 30
tags:
  - cadenas
  - malloc
  - punteros
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_substr` que devuelva una nueva cadena formada por los caracteres de `s`
empezando en `start` y con longitud `len` (o hasta el final si `len` excede):

```c
char    *ft_substr(char const *s, unsigned int start, size_t len);
```

Si `start` supera la longitud de `s`, devuelve una cadena vacía (`""`). Debe usar `malloc`.
Inspirado en los ejercicios de C03 de repos de Piscine. [web:159]

### Restricciones

- Usar `malloc` para la nueva cadena; devolver `NULL` si falla.
- No usar funciones de librería salvo las permitidas (implementa `ft_strlen` propia).
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_substr("hola mundo", 5, 5) -> "mundo"
ft_substr("hola", 10, 2) -> ""
ft_substr("abc", 1, 1) -> "b"
```

### Dificultad y tags

- Dificultad: medium
- Tags: cadenas, malloc, punteros, Norminette


## reto-c03-ft-strncmp

---
id: reto-c03-ft-strncmp
type: challenge
slug: reto-c03-ft-strncmp
title: ft_strncmp — comparar n caracteres
source: piscina42-web
module: c02-c03-cadenas
phase: fase2-c-basico
difficulty: easy
estimated_time_minutes: 25
tags:
  - cadenas
  - comparación
  - punteros
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_strncmp` que compare `s1` y `s2` carácter a carácter hasta `n` caracteres
o hasta `\0`:

```c
int ft_strncmp(const char *s1, const char *s2, size_t n);
```

Devuelve la diferencia del primer carácter distinto (`s1[i] - s2[i]`), o `0` si son iguales
en los `n` primeros. Inspirado en C03 de la Piscine. [web:159]

### Restricciones

- No usar `strncmp` de `<string.h>`.
- Si `n` es `0`, devolver `0`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_strncmp("abc", "abd", 3) -> negativo (<0)
ft_strncmp("abc", "abc", 3) -> 0
ft_strncmp("ab", "abc", 3) -> negativo
```

### Dificultad y tags

- Dificultad: easy
- Tags: cadenas, comparación, punteros, Norminette


## reto-c05-ft-power

---
id: reto-c05-ft-power
type: challenge
slug: reto-c05-ft-power
title: ft_power — potencia recursiva
source: piscina42-web
module: c04-c05-conversion-recursion
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 20
tags:
  - recursión
  - matemáticas
  - fundamentos
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_power` que calcule `nb` elevado a `power` usando recursión
(sin `pow` ni bucles):

```c
int ft_power(int nb, int power);
```

Si `power` es negativo, devuelve `0`. `ft_power(nb, 0)` devuelve `1`. Práctica de
recursión pura. [web:160]

### Restricciones

- Resolverse de forma recursiva (no bucles `for`/`while`).
- No usar funciones de `<math.h>`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_power(2, 3) -> 8
ft_power(5, 0) -> 1
ft_power(2, -1) -> 0
```

### Dificultad y tags

- Dificultad: easy
- Tags: recursión, matemáticas, fundamentos, Norminette


## reto-c06-ft-putstr-tab

---
id: reto-c06-ft-putstr-tab
type: challenge
slug: reto-c06-ft-putstr-tab
title: ft_putstr_tab — imprimir argv con tabuladores
source: piscina42-web
module: c06-cli-args
phase: fase3-c-intermedio
difficulty: easy
estimated_time_minutes: 25
tags:
  - argv
  - bucles
  - write
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_putstr_tab` que imprima todos los argumentos de la línea de comandos
(`argv`) separados por un tabulador `\t`, terminando con salto de línea:

```c
void    ft_putstr_tab(char **tab);
```

Inspirado en el ejercicio de C06 que recorre `argv`. [web:161]

### Restricciones

- Recorrer `argv` con un índice; no usar `printf`.
- Separar con `\t` y cerrar con `\n` mediante `write`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_putstr_tab({"a","b","c"}) -> "a\tb\tc\n"
ft_putstr_tab({}) -> "\n"
```

### Dificultad y tags

- Dificultad: easy
- Tags: argv, bucles, write, Norminette


## reto-c06-ft-atoi-base

---
id: reto-c06-ft-atoi-base
type: challenge
slug: reto-c06-ft-atoi-base
title: ft_atoi_base — convertir string en base N a entero
source: piscina42-web
module: c04-c05-conversion-recursion
phase: fase3-c-intermedio
difficulty: hard
estimated_time_minutes: 45
tags:
  - conversión
  - bases
  - punteros
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_atoi_base` que convierta la representación de un número en una `base`
arbitraria a un `int`:

```c
int ft_atoi_base(char *str, char *base);
```

La `base` puede tener entre 2 y 16 caracteres sin repetir y sin signos `+`/`-`.
Detecta signo opcional delante de `str`. Inspirado en C05 de la Piscine. [web:160]

### Restricciones

- Validar que `base` sea válida (sin caracteres repetidos ni `+`/`-`, longitud 2–16).
- No usar `atoi` ni `strtol`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
ft_atoi_base("1010", "01") -> 10
ft_atoi_base("ff", "0123456789abcdef") -> 255
ft_atoi_base("-1a", "0123456789abcdef") -> -26
```

### Dificultad y tags

- Dificultad: hard
- Tags: conversión, bases, punteros, Norminette


## reto-c08-ft-list-add-back

---
id: reto-c08-ft-list-add-back
type: challenge
slug: reto-c08-ft-list-add-back
title: ft_list_add_back — añadir nodo al final
source: piscina42-web
module: c08-c09-structs-lib
phase: fase3-c-intermedio
difficulty: medium
estimated_time_minutes: 25
tags:
  - listas enlazadas
  - punteros dobles
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_list_add_back` que añada un nuevo nodo con `data` al final de una
lista enlazada simple:

```c
void    ft_list_add_back(t_list **begin_list, void *data);
```

Si la lista está vacía, el nuevo nodo pasa a ser el primero. Usa el `t_list` definido
en C08. [file:34]

### Restricciones

- Modificar el puntero al inicio solo si la lista era `NULL`.
- Recorrer hasta el último nodo y enlazar el nuevo.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
add_back(NULL, x) -> [x]
add_back([a], b) -> [a]->[b]
```

### Dificultad y tags

- Dificultad: medium
- Tags: listas enlazadas, punteros dobles, Norminette


## reto-c08-ft-list-sort

---
id: reto-c08-ft-list-sort
type: challenge
slug: reto-c08-ft-list-sort
title: ft_list_sort — ordenar lista enlazada
source: piscina42-web
module: c08-c09-structs-lib
phase: fase3-c-intermedio
difficulty: hard
estimated_time_minutes: 40
tags:
  - listas enlazadas
  - punteros a función
  - ordenación
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_list_sort` que ordene una lista enlazada por el valor entero apuntado
por `data`, usando la función de comparación `cmp`:

```c
void    ft_list_sort(t_list **begin_list, int (*cmp)(void *, void *));
```

Usa un algoritmo simple (inserción o intercambio de datos). [file:34]

### Restricciones

- No crear una lista nueva; reordena la existente.
- La comparación debe hacerse vía el puntero `cmp`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
sort([3,1,2]) -> [1,2,3]
sort([]) -> []
```

### Dificultad y tags

- Dificultad: hard
- Tags: listas enlazadas, punteros a función, ordenación, Norminette


## reto-c09-ft-btree-basic

---
id: reto-c09-ft-btree-basic
type: challenge
slug: reto-c09-ft-btree-basic
title: ft_btree_basic — insertar en árbol binario
source: piscina42-web
module: c08-c09-structs-lib
phase: fase3-c-intermedio
difficulty: hard
estimated_time_minutes: 45
tags:
  - árboles
  - malloc
  - punteros
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `ft_btree_create_node` y `ft_btree_insert` para construir un árbol binario
de búsqueda ordenado por enteros:

```c
t_btree *ft_btree_create_node(int item);
void    ft_btree_insert(t_btree **root, int item, int (*cmp)(int, int));
```

Cada nodo tiene `item`, `left` y `right`. [file:34]

### Restricciones

- Reservar el nodo con `malloc`; liberar en caso de error.
- La inserción debe respetar el orden según `cmp`.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
insert(5), insert(3), insert(8) -> raíz 5, izq 3, der 8
```

### Dificultad y tags

- Dificultad: hard
- Tags: árboles, malloc, punteros, Norminette
