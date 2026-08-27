import { Challenge } from "../types";
import { analyzeNorminette, NorminetteReport } from "./norminette";

export interface ExamLevelSpec {
  id: string;
  assignmentName: string;
  expectedFile: string;
  functionName: string;
  signature: string;
  allowedFunctions: string;
  description: string;
  starterTemplate: string;
  requiredPatterns: Array<{ pattern: RegExp; description: string }>;
  forbiddenPatterns?: Array<{ pattern: RegExp; description: string }>;
}

const DEFAULT_HEADER = `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   __FILE_NAME__                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: exam <exam@student.42madrid.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/08/27 10:00:00 by exam              #+#    #+#             */
/*   Updated: 2026/08/27 10:00:00 by exam             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
`;

export const EXAM_LEVEL_SPECS: Record<string, ExamLevelSpec> = {
  "reto-examshell-c00": {
    id: "reto-examshell-c00",
    assignmentName: "ft_putchar",
    expectedFile: "ft_putchar.c",
    functionName: "ft_putchar",
    signature: "void\tft_putchar(char c);",
    allowedFunctions: "write",
    description: "Escribe una función 'ft_putchar' que imprima por la salida estándar el carácter recibido usando exclusivamente la llamada al sistema 'write'.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_putchar.c")}
#include <unistd.h>

void\tft_putchar(char c)
{
\twrite(1, &c, 1);
}
`,
    requiredPatterns: [
      { pattern: /\bvoid\s+ft_putchar\s*\(\s*char\s+[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'void ft_putchar(char c)'" },
      { pattern: /\bwrite\s*\(\s*1\s*,\s*&[a-zA-Z0-9_]+\s*,\s*1\s*\)/, description: "Uso correcto de 'write(1, &c, 1)' para escribir el carácter" }
    ]
  },
  "reto-examshell-c01": {
    id: "reto-examshell-c01",
    assignmentName: "ft_swap",
    expectedFile: "ft_swap.c",
    functionName: "ft_swap",
    signature: "void\tft_swap(int *a, int *b);",
    allowedFunctions: "Ninguna",
    description: "Escribe una función 'ft_swap' que reciba dos punteros a enteros e intercambie los valores de las dos variables apuntadas por referencia.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_swap.c")}
void\tft_swap(int *a, int *b)
{
\tint\ttmp;

\ttmp = *a;
\t*a = *b;
\t*b = tmp;
}
`,
    requiredPatterns: [
      { pattern: /\bvoid\s+ft_swap\s*\(\s*int\s*\*\s*[a-zA-Z0-9_]+\s*,\s*int\s*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'void ft_swap(int *a, int *b)'" },
      { pattern: /\*[a-zA-Z0-9_]+\s*=\s*\*[a-zA-Z0-9_]+/, description: "Desreferenciación correcta de punteros para el intercambio de valores (*a, *b)" }
    ]
  },
  "reto-examshell-c02": {
    id: "reto-examshell-c02",
    assignmentName: "ft_strcpy",
    expectedFile: "ft_strcpy.c",
    functionName: "ft_strcpy",
    signature: "char\t*ft_strcpy(char *dest, char *src);",
    allowedFunctions: "Ninguna",
    description: "Reproduce el comportamiento de la función strcpy estándar (man strcpy). Copia la cadena apuntada por src (incluido el carácter '\\0') en dest y devuelve dest.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_strcpy.c")}
char\t*ft_strcpy(char *dest, char *src)
{
\tint\ti;

\ti = 0;
\twhile (src[i] != '\\0')
\t{
\t\tdest[i] = src[i];
\t\ti++;
\t}
\tdest[i] = '\\0';
\treturn (dest);
}
`,
    requiredPatterns: [
      { pattern: /\bchar\s*\*\s*ft_strcpy\s*\(\s*char\s*\*\s*[a-zA-Z0-9_]+\s*,\s*(const\s+)?char\s*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'char *ft_strcpy(char *dest, char *src)'" },
      { pattern: /return\s*\(?[a-zA-Z0-9_]+\)?\s*;/, description: "Debe devolver el puntero destino 'dest'" }
    ]
  },
  "reto-examshell-c03": {
    id: "reto-examshell-c03",
    assignmentName: "ft_strcmp",
    expectedFile: "ft_strcmp.c",
    functionName: "ft_strcmp",
    signature: "int\tft_strcmp(char *s1, char *s2);",
    allowedFunctions: "Ninguna",
    description: "Reproduce el comportamiento de la función strcmp estándar (man strcmp). Compara las dos cadenas s1 y s2 y devuelve la diferencia numérica entre el primer par de caracteres discordantes.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_strcmp.c")}
int\tft_strcmp(char *s1, char *s2)
{
\tint\ti;

\ti = 0;
\twhile (s1[i] != '\\0' && s2[i] != '\\0' && s1[i] == s2[i])
\t\ti++;
\treturn ((unsigned char)s1[i] - (unsigned char)s2[i]);
}
`,
    requiredPatterns: [
      { pattern: /\bint\s+ft_strcmp\s*\(\s*(const\s+)?char\s*\*\s*[a-zA-Z0-9_]+\s*,\s*(const\s+)?char\s*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'int ft_strcmp(char *s1, char *s2)'" },
      { pattern: /return\s*\(?.*-[a-zA-Z0-9_()\[\]\s*]+.*\)?\s*;/, description: "Debe retornar la diferencia entre los caracteres comparados" }
    ]
  },
  "reto-examshell-c04": {
    id: "reto-examshell-c04",
    assignmentName: "ft_atoi",
    expectedFile: "ft_atoi.c",
    functionName: "ft_atoi",
    signature: "int\tft_atoi(const char *str);",
    allowedFunctions: "Ninguna",
    description: "Escribe una función 'ft_atoi' que convierta la porción inicial de la cadena apuntada por str a entero de tipo int, saltando espacios iniciales y gestionando el signo +/-.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_atoi.c")}
int\tft_atoi(const char *str)
{
\tint\ti;
\tint\tsign;
\tint\tres;

\ti = 0;
\tsign = 1;
\tres = 0;
\twhile (str[i] == ' ' || (str[i] >= 9 && str[i] <= 13))
\t\ti++;
\tif (str[i] == '-' || str[i] == '+')
\t{
\t\tif (str[i] == '-')
\t\t\tsign = -1;
\t\ti++;
\t}
\twhile (str[i] >= '0' && str[i] <= '9')
\t{
\t\tres = res * 10 + (str[i] - '0');
\t\ti++;
\t}
\treturn (res * sign);
}
`,
    requiredPatterns: [
      { pattern: /\bint\s+ft_atoi\s*\(\s*(const\s+)?char\s*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'int ft_atoi(const char *str)'" },
      { pattern: /return\s*\(?.*res.*sign.*|.*sign.*res.*\)?\s*;|return\s*\(?.*res.*\)?\s*;/, description: "Debe devolver el entero acumulado ponderado por el signo" }
    ]
  },
  "reto-examshell-c05": {
    id: "reto-examshell-c05",
    assignmentName: "ft_fibonacci",
    expectedFile: "ft_fibonacci.c",
    functionName: "ft_fibonacci",
    signature: "int\tft_fibonacci(int index);",
    allowedFunctions: "Ninguna",
    description: "Escribe una función 'ft_fibonacci' que devuelva el n-ésimo elemento de la sucesión de Fibonacci de forma recursiva. Si index es negativo, debe devolver -1.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_fibonacci.c")}
int\tft_fibonacci(int index)
{
\tif (index < 0)
\t\treturn (-1);
\tif (index == 0)
\t\treturn (0);
\tif (index == 1)
\t\treturn (1);
\treturn (ft_fibonacci(index - 1) + ft_fibonacci(index - 2));
}
`,
    requiredPatterns: [
      { pattern: /\bint\s+ft_fibonacci\s*\(\s*int\s+[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'int ft_fibonacci(int index)'" },
      { pattern: /ft_fibonacci\s*\(/, description: "Debe incluir llamadas recursivas a 'ft_fibonacci'" }
    ]
  },
  "reto-examshell-c06": {
    id: "reto-examshell-c06",
    assignmentName: "print_params",
    expectedFile: "print_params.c",
    functionName: "main",
    signature: "int\tmain(int argc, char **argv);",
    allowedFunctions: "write",
    description: "Escribe un programa que imprima en salida estándar todos los argumentos recibidos en la línea de comandos (excepto argv[0]), uno por línea en el mismo orden.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "print_params.c")}
#include <unistd.h>

int\tmain(int argc, char **argv)
{
\tint\ti;
\tint\tj;

\ti = 1;
\twhile (i < argc)
\t{
\t\tj = 0;
\t\twhile (argv[i][j] != '\\0')
\t\t{
\t\t\twrite(1, &argv[i][j], 1);
\t\t\tj++;
\t\t}
\t\twrite(1, "\\n", 1);
\t\ti++;
\t}
\treturn (0);
}
`,
    requiredPatterns: [
      { pattern: /\bint\s+main\s*\(\s*int\s+argc\s*,\s*char\s*\*\*\s*argv\s*\)|\bint\s+main\s*\(\s*int\s+argc\s*,\s*char\s*\*\s*argv\s*\[\s*\]\s*\)/, description: "Punto de entrada: 'int main(int argc, char **argv)'" },
      { pattern: /\bwrite\s*\(/, description: "Uso de 'write' para imprimir argumentos y saltos de línea" }
    ]
  },
  "reto-examshell-c07": {
    id: "reto-examshell-c07",
    assignmentName: "ft_strdup",
    expectedFile: "ft_strdup.c",
    functionName: "ft_strdup",
    signature: "char\t*ft_strdup(char *src);",
    allowedFunctions: "malloc",
    description: "Reproduce el comportamiento de la función strdup estándar (man strdup). Reserva memoria suficiente con malloc para duplicar la cadena src y devuelve el nuevo puntero.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_strdup.c")}
#include <stdlib.h>

char\t*ft_strdup(char *src)
{
\tint\t\ti;
\tint\t\tlen;
\tchar\t*dest;

\tlen = 0;
\twhile (src[len] != '\\0')
\t\tlen++;
\tdest = (char *)malloc(sizeof(char) * (len + 1));
\tif (!dest)
\t\treturn (NULL);
\ti = 0;
\twhile (i < len)
\t{
\t\tdest[i] = src[i];
\t\ti++;
\t}
\tdest[i] = '\\0';
\treturn (dest);
}
`,
    requiredPatterns: [
      { pattern: /\bchar\s*\*\s*ft_strdup\s*\(\s*(const\s+)?char\s*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'char *ft_strdup(char *src)'" },
      { pattern: /\bmalloc\s*\(/, description: "Uso de 'malloc' para reservar memoria dinámica" }
    ]
  },
  "reto-examshell-c08": {
    id: "reto-examshell-c08",
    assignmentName: "ft_list_size",
    expectedFile: "ft_list_size.c",
    functionName: "ft_list_size",
    signature: "int\tft_list_size(t_list *begin_list);",
    allowedFunctions: "Ninguna",
    description: "Escribe una función 'ft_list_size' que devuelva el número de elementos contenidos en la lista enlazada apuntada por begin_list.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_list_size.c")}
#include "ft_list.h"

int\tft_list_size(t_list *begin_list)
{
\tint\tcount;

\tcount = 0;
\twhile (begin_list)
\t{
\t\tcount++;
\t\tbegin_list = begin_list->next;
\t}
\treturn (count);
}
`,
    requiredPatterns: [
      { pattern: /\bint\s+ft_list_size\s*\(\s*t_list\s*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'int ft_list_size(t_list *begin_list)'" },
      { pattern: /->\s*next/, description: "Recorrido de la lista mediante el puntero '->next'" }
    ]
  },
  "reto-examshell-c09": {
    id: "reto-examshell-c09",
    assignmentName: "ft_create_elem",
    expectedFile: "ft_create_elem.c",
    functionName: "ft_create_elem",
    signature: "t_list\t*ft_create_elem(void *data);",
    allowedFunctions: "malloc",
    description: "Escribe una función 'ft_create_elem' que cree un nuevo nodo de lista t_list, asigne data al miembro data, inicialice next a NULL y devuelva el nodo creado.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_create_elem.c")}
#include <stdlib.h>
#include "ft_list.h"

t_list\t*ft_create_elem(void *data)
{
\tt_list\t*node;

\tnode = (t_list *)malloc(sizeof(t_list));
\tif (!node)
\t\treturn (NULL);
\tnode->data = data;
\tnode->next = NULL;
\treturn (node);
}
`,
    requiredPatterns: [
      { pattern: /\bt_list\s*\*\s*ft_create_elem\s*\(\s*void\s*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 't_list *ft_create_elem(void *data)'" },
      { pattern: /\bmalloc\s*\(/, description: "Uso de 'malloc' para reservar el nodo de lista" }
    ]
  },
  "reto-examshell-c10": {
    id: "reto-examshell-c10",
    assignmentName: "ft_btree_create_node",
    expectedFile: "ft_btree_create_node.c",
    functionName: "btree_create_node",
    signature: "t_btree\t*btree_create_node(void *item);",
    allowedFunctions: "malloc",
    description: "Escribe una función 'btree_create_node' que cree un nuevo nodo de árbol binario con su contenido item y sus hijos left/right a NULL.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_btree_create_node.c")}
#include <stdlib.h>
#include "ft_btree.h"

t_btree\t*btree_create_node(void *item)
{
\tt_btree\t*node;

\tnode = (t_btree *)malloc(sizeof(t_btree));
\tif (!node)
\t\treturn (NULL);
\tnode->item = item;
\tnode->left = NULL;
\tnode->right = NULL;
\treturn (node);
}
`,
    requiredPatterns: [
      { pattern: /\bt_btree\s*\*\s*btree_create_node\s*\(\s*void\s*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 't_btree *btree_create_node(void *item)'" },
      { pattern: /\bmalloc\s*\(/, description: "Uso de 'malloc' para reservar memoria del nodo" }
    ]
  },
  "reto-examshell-c12": {
    id: "reto-examshell-c12",
    assignmentName: "ft_list_reverse",
    expectedFile: "ft_list_reverse.c",
    functionName: "ft_list_reverse",
    signature: "void\tft_list_reverse(t_list **begin_list);",
    allowedFunctions: "Ninguna",
    description: "Escribe una función 'ft_list_reverse' que invierta el orden de los elementos de la lista enlazada pasada por doble puntero.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "ft_list_reverse.c")}
#include "ft_list.h"

void\tft_list_reverse(t_list **begin_list)
{
\tt_list\t*prev;
\tt_list\t*curr;
\tt_list\t*next;

\tif (!begin_list || !*begin_list)
\t\treturn ;
\tprev = NULL;
\tcurr = *begin_list;
\twhile (curr)
\t{
\t\tnext = curr->next;
\t\tcurr->next = prev;
\t\tprev = curr;
\t\tcurr = next;
\t}
\t*begin_list = prev;
}
`,
    requiredPatterns: [
      { pattern: /\bvoid\s+ft_list_reverse\s*\(\s*t_list\s*\*\*\s*[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'void ft_list_reverse(t_list **begin_list)'" },
      { pattern: /->\s*next/, description: "Manipulación de punteros 'next' de los nodos" }
    ]
  },
  "reto-rush-team": {
    id: "reto-rush-team",
    assignmentName: "rush00",
    expectedFile: "rush00.c",
    functionName: "rush",
    signature: "void\trush(int x, int y);",
    allowedFunctions: "ft_putchar (write)",
    description: "Escribe una función 'rush' que muestre en pantalla un rectángulo de dimensiones x columnas e y filas con las esquinas y bordes del formato Rush oficial.",
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", "rush00.c")}
void\tft_putchar(char c);

void\trush(int x, int y)
{
\tint\trow;
\tint\tcol;

\tif (x <= 0 || y <= 0)
\t\treturn ;
\trow = 0;
\twhile (row < y)
\t{
\t\tcol = 0;
\t\twhile (col < x)
\t\t{
\t\t\tif ((row == 0 || row == y - 1) && (col == 0 || col == x - 1))
\t\t\t\tft_putchar('o');
\t\t\telse if (row == 0 || row == y - 1)
\t\t\t\tft_putchar('-');
\t\t\telse if (col == 0 || col == x - 1)
\t\t\t\tft_putchar('|');
\t\t\telse
\t\t\t\tft_putchar(' ');
\t\t\tcol++;
\t\t}
\t\tft_putchar('\\n');
\t\trow++;
\t}
}
`,
    requiredPatterns: [
      { pattern: /\bvoid\s+rush\s*\(\s*int\s+[a-zA-Z0-9_]+\s*,\s*int\s+[a-zA-Z0-9_]+\s*\)/, description: "Firma obligatoria: 'void rush(int x, int y)'" },
      { pattern: /\bft_putchar\s*\(|\bwrite\s*\(/, description: "Llamada a 'ft_putchar' o 'write' para imprimir los caracteres" }
    ]
  }
};

/**
 * Resolves an exam level spec based on level identifier or challenge metadata
 */
export function getExamLevelSpec(levelIdOrName: string, allChallenges: Challenge[] = []): ExamLevelSpec {
  if (EXAM_LEVEL_SPECS[levelIdOrName]) {
    return EXAM_LEVEL_SPECS[levelIdOrName];
  }

  // Fallback: look up in allChallenges
  const foundChallenge = allChallenges.find(c => c.id === levelIdOrName || c.slug === levelIdOrName);
  const cleanName = (foundChallenge?.title || levelIdOrName)
    .replace(/^reto-/, "")
    .replace(/^c\d+-/, "")
    .replace(/-/g, "_");

  const functionName = cleanName.startsWith("ft_") ? cleanName : `ft_${cleanName}`;
  const fileName = `${functionName}.c`;

  return {
    id: levelIdOrName,
    assignmentName: functionName,
    expectedFile: fileName,
    functionName,
    signature: `void\t${functionName}(void);`,
    allowedFunctions: "write",
    description: foundChallenge?.body
      ? foundChallenge.body.slice(0, 200).replace(/[#*`]/g, "") + "..."
      : `Escribe una función '${functionName}' en C que resuelva el reto cumpliendo rigurosamente la Norminette de 42.`,
    starterTemplate: `${DEFAULT_HEADER.replace("__FILE_NAME__", fileName)}
#include <unistd.h>

void\t${functionName}(void)
{
\t// Implementa tu solución aquí...
}
`,
    requiredPatterns: [
      { pattern: new RegExp(`\\b${functionName}\\b`), description: `Definición de la función '${functionName}'` }
    ]
  };
}

export interface ValidationFeedbackItem {
  type: "error" | "warning" | "ok";
  category: "norminette" | "signature" | "moulinette";
  message: string;
  line?: number;
}

export interface ExamValidationResult {
  passed: boolean;
  score: number;
  summary: string;
  norminetteReport: NorminetteReport;
  items: ValidationFeedbackItem[];
}

/**
 * Validates submitted C code for a specific exam level
 */
export function validateExamSubmission(code: string, levelSpec: ExamLevelSpec): ExamValidationResult {
  const items: ValidationFeedbackItem[] = [];

  // 1. Check for empty code
  if (!code || code.trim().length === 0) {
    return {
      passed: false,
      score: 0,
      summary: "Moulinette: KO (Grade 0/100) — El archivo entregado está completamente vacío.",
      norminetteReport: {
        isValid: false,
        issues: [{ type: "error", message: "Archivo vacío." }],
        errorCount: 1,
        warningCount: 0,
        functions: [],
        functionCount: 0
      },
      items: [
        {
          type: "error",
          category: "moulinette",
          message: "No se ha detectado ningún código fuente. Debes escribir la solución antes de enviar a evaluar."
        }
      ]
    };
  }

  // 2. Norminette static analysis
  const norminetteReport = analyzeNorminette(code);
  norminetteReport.issues.forEach(iss => {
    items.push({
      type: iss.type,
      category: "norminette",
      message: `[Norminette] ${iss.message}`,
      line: iss.line
    });
  });

  // 3. Functional and Signature static analysis
  let signaturePassed = true;

  // Check required function name presence
  const hasFunctionName = new RegExp(`\\b${levelSpec.functionName}\\b`).test(code);
  if (!hasFunctionName && levelSpec.functionName !== "main") {
    signaturePassed = false;
    items.push({
      type: "error",
      category: "signature",
      message: `[Firma Requerida] No se encontró la función '${levelSpec.functionName}'. Debe llamarse exactamente así.`
    });
  }

  // Check all required signature patterns
  for (const req of levelSpec.requiredPatterns) {
    if (!req.pattern.test(code)) {
      signaturePassed = false;
      items.push({
        type: "error",
        category: "signature",
        message: `[Validación Moulinette] ${req.description}`
      });
    } else {
      items.push({
        type: "ok",
        category: "signature",
        message: `[Validación Moulinette] Cumplido: ${req.description}`
      });
    }
  }

  // Check curly brace balance
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces === 0 || openBraces !== closeBraces) {
    signaturePassed = false;
    items.push({
      type: "error",
      category: "signature",
      message: `[Sintaxis C] Desbalance de llaves '{' (${openBraces}) y '}' (${closeBraces}). El código no compilará.`
    });
  }

  // Check if body is just placeholder or empty
  if (code.includes("// Escribe tu código aquí") && !code.includes(";") && openBraces <= 1) {
    signaturePassed = false;
    items.push({
      type: "error",
      category: "signature",
      message: "[Implementación Incompleta] El cuerpo de la función parece vacío o no implementado."
    });
  }

  const passed = norminetteReport.isValid && signaturePassed;
  const score = passed ? 100 : 0;
  const summary = passed
    ? "Moulinette: OK (Grade 100/100) — ¡Reto superado! Norminette limpia y firma validada."
    : "Moulinette: KO (Grade 0/100) — Fallo en las validaciones de entrega (Norminette o firma incorrecta).";

  return {
    passed,
    score,
    summary,
    norminetteReport,
    items
  };
}
