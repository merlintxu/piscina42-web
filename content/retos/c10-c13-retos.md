---
id: c10-c13-retos
type: challenge-collection
title: Retos de C avanzado (C10–C13)
source: piscina42-web
phase: fase4-simulacion
---

# Retos de C avanzado (C10–C13)

Colección de retos de estructuras avanzadas y proyecto final (árboles, pilas,
plantillas). Cada reto tiene su nota individual en el vault.

## reto-c10-bst-insert

---
id: reto-c10-bst-insert
type: challenge
slug: reto-c10-bst-insert
title: Inserción en árbol binario de búsqueda
source: piscina42-web
module: c10-c13-avanzado
phase: fase4-simulacion
difficulty: hard
estimated_time_minutes: 45
tags:
  - BST
  - árboles
  - punteros
  - norminette
norminette_focus: true
---

### Enunciado

Implementa la inserción de un valor entero en un árbol binario de búsqueda
(BST), devolviendo la raíz actualizada:

```c
t_node  *bst_insert(t_node *root, int value);
```

Si el valor ya existe, no lo inserta de nuevo (o lo ignora según convención). [file:34]

### Restricciones

- Usar recursión o iteración con punteros a puntero.
- Cumplir Norminette.
- Reservar el nodo con `malloc` y manejar `NULL` en inserción en árbol vacío. [file:34]

### Casos de prueba sugeridos

```text
insert(5); insert(3); insert(7) -> raíz 5, izq 3, der 7
insert(3) de nuevo -> sin duplicado
```

### Dificultad y tags

- Dificultad: hard
- Tags: BST, árboles, punteros, Norminette


## reto-c11-stack

---
id: reto-c11-stack
type: challenge
slug: reto-c11-stack
title: Pila (stack) con push/pop
source: piscina42-web
module: c10-c13-avanzado
phase: fase4-simulacion
difficulty: medium
estimated_time_minutes: 35
tags:
  - pila
  - listas
  - malloc
  - norminette
norminette_focus: true
---

### Enunciado

Implementa una pila (stack) sobre una lista enlazada con operaciones
`push` (apilar) y `pop` (desapilar), gestionando memoria con `malloc`/`free`:

```c
void    stack_push(t_stack **s, void *data);
void    *stack_pop(t_stack **s);
```

`pop` devuelve `NULL` si la pila está vacía. [file:34]

### Restricciones

- `push` añade en la cima; `pop` libera el nodo y devuelve su dato.
- Cumplir Norminette.
- Sin fugas al vaciar la pila. [file:34]

### Casos de prueba sugeridos

```text
push(a); push(b); pop() -> b; pop() -> a; pop() -> NULL
```

### Dificultad y tags

- Dificultad: medium
- Tags: pila, listas, malloc, Norminette


## reto-c12-templates

---
id: reto-c12-templates
type: challenge
slug: reto-c12-templates
title: Esqueleto de proyecto con headers y Makefile
source: piscina42-web
module: c10-c13-avanzado
phase: fase4-simulacion
difficulty: medium
estimated_time_minutes: 40
tags:
  - Makefile
  - headers
  - plantilla
  - norminette
norminette_focus: true
---

### Enunciado

Crea el esqueleto de un proyecto C con separación header/implementación
(`proyecto.h`, `proyecto.c`, `main.c`) y un `Makefile` que compile y enlace
todo en un ejecutable:

```make
NAME = proyecto
SRC = main.c proyecto.c
OBJ = $(SRC:.c=.o)
```

### Restricciones

- Usar `#ifndef PROYECTO_H` en el header (include guard).
- Cumplir Norminette en el Makefile.
- `make` genera el ejecutable `$(NAME)`. [web:7]

### Casos de prueba sugeridos

```text
make -> genera ./proyecto
make fclean -> borra .o y ejecutable
```

### Dificultad y tags

- Dificultad: medium
- Tags: Makefile, headers, plantilla, Norminette


## reto-c10-bst-remove

---
id: reto-c10-bst-remove
type: challenge
slug: reto-c10-bst-remove
title: bst_remove — eliminar nodo de BST
source: piscina42-web
module: c10-c13-avanzado
phase: fase4-simulacion
difficulty: hard
estimated_time_minutes: 50
tags:
  - árboles
  - recursión
  - memoria
  - norminette
norminette_focus: true
---

### Enunciado

Implementa `bst_remove` que elimine el nodo con valor `value` de un árbol binario de
búsqueda, manteniendo la propiedad de orden (usa el sucesor in-order para nodos con
dos hijos):

```c
t_btree *bst_remove(t_btree *root, int value, int (*cmp)(int, int));
```

Devuelve la nueva raíz. [file:34]

### Restricciones

- Manejar los tres casos: hoja, un hijo, dos hijos.
- Liberar la memoria del nodo eliminado.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
remove(raíz 5 [3,8]) de 3 -> raíz 5 [8]
remove de hoja -> árbol sin ese nodo
```

### Dificultad y tags

- Dificultad: hard
- Tags: árboles, recursión, memoria, Norminette


## reto-c11-queue

---
id: reto-c11-queue
type: challenge
slug: reto-c11-queue
title: queue — cola con array circular
source: piscina42-web
module: c10-c13-avanzado
phase: fase4-simulacion
difficulty: medium
estimated_time_minutes: 35
tags:
  - estructuras de datos
  - arrays
  - punteros
  - norminette
norminette_focus: true
---

### Enunciado

Implementa una cola (FIFO) usando un array circular con operaciones `enqueue`,
`dequeue` e `is_empty`:

```c
typedef struct s_queue { int *buf; int head; int tail; int size; int cap; } t_queue;
```

Gestiona el desbordamiento cuando `size == cap`. [file:34]

### Restricciones

- Usar aritmética modular (`% cap`) para head/tail.
- No usar librerías de contenedores.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
enqueue(1), enqueue(2), dequeue() -> 1
dequeue() en vacía -> error/indefinido
```

### Dificultad y tags

- Dificultad: medium
- Tags: estructuras de datos, arrays, punteros, Norminette


## reto-c12-hash-map

---
id: reto-c12-hash-map
type: challenge
slug: reto-c12-hash-map
title: hash_map — tabla hash simple
source: piscina42-web
module: c10-c13-avanzado
phase: fase4-simulacion
difficulty: hard
estimated_time_minutes: 55
tags:
  - hash
  - punteros
  - cadenas
  - norminette
norminette_focus: true
---

### Enunciado

Implementa una tabla hash con encadenamiento (separate chaining) que permita `insert`
y `lookup` de pares clave→valor (cadenas):

```c
typedef struct s_entry { char *key; char *value; struct s_entry *next; } t_entry;
```

Usa una función hash simple (suma de caracteres módulo tamaño). [file:34]

### Restricciones

- Resolver colisiones por lista enlazada en cada cubo.
- Usar `malloc` para entradas y cubos.
- Cumplir Norminette. [file:34]

### Casos de prueba sugeridos

```text
insert("a","1"); lookup("a") -> "1"
lookup("x") inexistente -> NULL
```

### Dificultad y tags

- Dificultad: hard
- Tags: hash, punteros, cadenas, Norminette
