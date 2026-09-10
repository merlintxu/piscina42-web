import { SkillDefinition, SkillCategory, TrainingProfile } from "./types";

export const DEFAULT_TARGET_DATE = "2026-10-26";

export const DEFAULT_TRAINING_PROFILE: TrainingProfile = {
  availableHoursPerWeek: 15,
  targetDate: DEFAULT_TARGET_DATE,
  pace: "standard",
  focusSkillIds: ["c-pointers-basics", "c-dynamic-memory", "eng-norminette"],
  levelPreference: "autonomous",
  dailyCommitmentMinutes: 90
};

export interface CategoryMetadata {
  id: SkillCategory;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  color: {
    primary: string;
    light: string;
    border: string;
    badge: string;
  };
}

export const SKILL_CATEGORIES: Record<SkillCategory, CategoryMetadata> = {
  terminal: {
    id: "terminal",
    name: "Terminal & Entorno Unix",
    shortName: "Terminal",
    description: "Navegación fluida por CLI, gestión de ficheros, permisos octales, redirecciones y shell scripting.",
    iconName: "Terminal",
    color: {
      primary: "text-[#03A9F4]",
      light: "bg-[#03A9F4]/15",
      border: "border-[#03A9F4]/30",
      badge: "bg-[#03A9F4]/20 text-[#03A9F4] border-[#03A9F4]/40"
    }
  },
  git: {
    id: "git",
    name: "Git & Flujo de Trabajo 42",
    shortName: "Git",
    description: "Control de versiones atómico, ramas, resolución de conflictos y submission con Vogsphere.",
    iconName: "GitBranch",
    color: {
      primary: "text-[#FF9800]",
      light: "bg-[#FF9800]/15",
      border: "border-[#FF9800]/30",
      badge: "bg-[#FF9800]/20 text-[#FF9800] border-[#FF9800]/40"
    }
  },
  c_prog: {
    id: "c_prog",
    name: "C Core & Algoritmia 42",
    shortName: "C Core",
    description: "Desde tipos primitivos y punteros hasta memoria dinámica (malloc/free), arrays y cadenas seguras.",
    iconName: "Code2",
    color: {
      primary: "text-[#4CAF50]",
      light: "bg-[#4CAF50]/15",
      border: "border-[#4CAF50]/30",
      badge: "bg-[#4CAF50]/20 text-[#4CAF50] border-[#4CAF50]/40"
    }
  },
  engineering: {
    id: "engineering",
    name: "Ingeniería, Norminette & Calidad",
    shortName: "Ingeniería 42",
    description: "Rigor Norminette v3, flags de compilación (-Wall -Wextra -Werror), detección de memory leaks con Valgrind y debugging.",
    iconName: "ShieldCheck",
    color: {
      primary: "text-[#E91E63]",
      light: "bg-[#E91E63]/15",
      border: "border-[#E91E63]/30",
      badge: "bg-[#E91E63]/20 text-[#E91E63] border-[#E91E63]/40"
    }
  },
  meta: {
    id: "meta",
    name: "Meta-Learning & Resiliencia Piscina",
    shortName: "Meta / Hábitos",
    description: "Peer-evaluation constructiva, gestión de la frustración, deep work y rendimiento bajo presión en Examshell.",
    iconName: "Flame",
    color: {
      primary: "text-[#9C27B0]",
      light: "bg-[#9C27B0]/15",
      border: "border-[#9C27B0]/30",
      badge: "bg-[#9C27B0]/20 text-[#9C27B0] border-[#9C27B0]/40"
    }
  }
};

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // --- CATEGORY: TERMINAL ---
  {
    id: "term-nav-files",
    title: "Navegación y manipulación CLI",
    category: "terminal",
    description: "Uso sin interfaz gráfica de cd, ls (con flags -la, -t), mkdir, touch, cp, mv y rm de forma segura.",
    maxLevel: 5,
    weightInReadiness: 4,
    relatedModuleIds: ["shell00-shell01"],
    relatedChallengeIds: ["reto-shell00-ls-flags", "reto-shell00-touch-timestamp"],
    levels: [
      { level: 0, label: "Sin contacto", criteria: "Dependencia de exploradores visuales de archivos." },
      { level: 1, label: "Comandos básicos", criteria: "Navega con cd y lista con ls sin flags." },
      { level: 2, label: "Manipulación ágil", criteria: "Copia, mueve y borra recursivamente (-r, -f) con rutas relativas y absolutas." },
      { level: 3, label: "Flags y filtrado", criteria: "Domina ls -la, find básico, wildcards (*) y visualización con cat/less." },
      { level: 4, label: "Automatización", criteria: "Usa atajos de readline (Ctrl+R, Ctrl+A/E), xargs y alias productivos." },
      { level: 5, label: "Nivel Piscina", criteria: "Resuelve problemas de filesystem en segundos y sin interfaz gráfica bajo tiempo límite." }
    ]
  },
  {
    id: "term-permissions",
    title: "Permisos Unix y Modos Octales",
    category: "terminal",
    description: "Comprensión de rwx, bits especiales (sticky bit, suid), chmod octal/simbólico y chown.",
    maxLevel: 5,
    weightInReadiness: 4,
    relatedModuleIds: ["shell00-shell01"],
    relatedChallengeIds: ["reto-shell00-chmod-permissions"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "No distingue lectura, escritura y ejecución." },
      { level: 1, label: "Concepto rwx", criteria: "Identifica usuario, grupo y otros en la salida de ls -l." },
      { level: 2, label: "Chmod simbólico", criteria: "Aplica chmod u+x, go-w para scripts ejecutables." },
      { level: 3, label: "Notación octal", criteria: "Calcula instantáneamente permisos 755, 644, 700 y umask." },
      { level: 4, label: "Permisos avanzados", criteria: "Configura sticky bits y comprende restricciones en directorios compartidos." },
      { level: 5, label: "Nivel Piscina", criteria: "Resuelve ejercicios de permisos de Shell00 al 100% en el primer intento." }
    ]
  },
  {
    id: "term-redirection-pipes",
    title: "Pipes y Redirecciones de Streams",
    category: "terminal",
    description: "Flujos estándar stdin (0), stdout (1), stderr (2), operadores |, >, >>, 2>&1 y grep/sed/awk básicos.",
    maxLevel: 5,
    weightInReadiness: 4,
    relatedModuleIds: ["shell00-shell01"],
    relatedChallengeIds: ["reto-shell01-grep-wc", "reto-shell01-find-delete"],
    levels: [
      { level: 0, label: "Sin uso", criteria: "No conoce el significado del carácter pipe (|)." },
      { level: 1, label: "Redirección simple", criteria: "Usa > y >> para guardar la salida de un comando en un archivo." },
      { level: 2, label: "Pipes elementales", criteria: "Encadena dos comandos (ej. ls -l | grep .c)." },
      { level: 3, label: "Manejo de streams", criteria: "Redirige stderr (2> /dev/null, 2>&1) y combina grep con wc -l." },
      { level: 4, label: "Pipelines complejos", criteria: "Combina sort, uniq, cut, tr y sed para procesar datos tabulares." },
      { level: 5, label: "Nivel Piscina", criteria: "Construye one-liners complejos de Shell01 sin titubear." }
    ]
  },
  {
    id: "term-env-scripting",
    title: "Variables de Entorno y Shell Scripting",
    category: "terminal",
    description: "Variables de entorno ($PATH, $HOME), export, scripts Bash con shebang #!/bin/sh y argumentos posicionales.",
    maxLevel: 5,
    weightInReadiness: 3,
    relatedModuleIds: ["shell00-shell01"],
    relatedChallengeIds: ["reto-shell01-print-groups"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "No sabe qué es el PATH ni cómo ejecutar un script." },
      { level: 1, label: "Variables simples", criteria: "Lee variables con echo $USER y comprende el prompt." },
      { level: 2, label: "Export y PATH", criteria: "Define variables en la sesión actual y entiende la búsqueda de binarios." },
      { level: 3, label: "Scripts ejecutables", criteria: "Escribe scripts con #!/bin/sh y argumentos $1, $2, $#." },
      { level: 4, label: "Lógica en shell", criteria: "Usa estructuras de control (if, for), test y códigos de salida ($?)." },
      { level: 5, label: "Nivel Piscina", criteria: "Diseña scripts de prueba automatizados para verificar sus funciones de C." }
    ]
  },

  // --- CATEGORY: GIT ---
  {
    id: "git-basics",
    title: "Git Atómico y Commits Limpios",
    category: "git",
    description: "Comandos git init, clone, add, commit con mensajes claros y git status/log analítico.",
    maxLevel: 5,
    weightInReadiness: 4,
    relatedModuleIds: ["shell00-shell01"],
    relatedChallengeIds: ["reto-shell00-git-commit"],
    levels: [
      { level: 0, label: "Sin Git", criteria: "Guarda copias con nombres manuales (archivo_final_v2.c)." },
      { level: 1, label: "Uso mecánico", criteria: "Ejecuta add . y commit sin entender el staging area." },
      { level: 2, label: "Staging selectivo", criteria: "Usa git add con ficheros concretos y revisa git status antes de commitear." },
      { level: 3, label: "Commits atómicos", criteria: "Mensajes descriptivos y revisiones con git diff / git log --oneline." },
      { level: 4, label: "Inspección y checkout", criteria: "Navega por el historial con git checkout/restore y descarta cambios." },
      { level: 5, label: "Nivel Piscina", criteria: "Disciplina impecable de commits por ejercicio sin ficheros basura." }
    ]
  },
  {
    id: "git-vogsphere",
    title: "Entrega Vogsphere y Gestión de Remotos",
    category: "git",
    description: "Flujo oficial 42 con repositorios remotos Vogsphere, ssh keys, push limpio y tags de entrega.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: ["shell00-shell01"],
    relatedChallengeIds: ["reto-shell00-git-push-origin"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "No sabe qué es Vogsphere ni cómo funciona la corrección automatizada." },
      { level: 1, label: "Push básico", criteria: "Hace git push a origin/master tras ayuda." },
      { level: 2, label: "SSH y autenticación", criteria: "Configura sus llaves SSH y clona repositorios de proyecto de forma autónoma." },
      { level: 3, label: "Validación pre-push", criteria: "Verifica qué archivos exactos se suben y evita subir .DS_Store, *.o o a.out." },
      { level: 4, label: "Recuperación y re-entrega", criteria: "Maneja branches y reintento de entregas con corrección de histórico." },
      { level: 5, label: "Nivel Piscina", criteria: "Nunca comete un error de entrega (0 por fichero mal nombrado o carpeta errónea)." }
    ]
  },

  // --- CATEGORY: C PROGRAMMING ---
  {
    id: "c-basics-types",
    title: "Sintaxis C, Tipos Primitivos e I/O",
    category: "c_prog",
    description: "Estructura de programas en C, tipos char, int, void, casting explícito y la syscall write() de unistd.h.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: ["c00-intro"],
    relatedChallengeIds: ["reto-c00-putchar", "reto-c00-print-alphabet", "reto-c00-print-digits"],
    levels: [
      { level: 0, label: "Sin experiencia", criteria: "No conoce la sintaxis de C ni el ciclo de compilación." },
      { level: 1, label: "Hola Mundo", criteria: "Comprende la función main() y el uso de include <unistd.h>." },
      { level: 2, label: "Syscall write()", criteria: "Domina write(1, &c, 1) sin depender de printf." },
      { level: 3, label: "Tipos y casting", criteria: "Conoce el tamaño en bytes de char e int, y el overflow numérico." },
      { level: 4, label: "Lógica modular", criteria: "Divide la lógica en funciones pequeñas y respeta tipos de retorno void e int." },
      { level: 5, label: "Nivel Piscina", criteria: "Implementa ft_putchar y utilidades de impresión de dígitos de C00 en segundos." }
    ]
  },
  {
    id: "c-control-flow",
    title: "Estructuras de Control y Algoritmia Básica",
    category: "c_prog",
    description: "Bucles while (sin for por Norminette), condiciones if/else, operadores lógicos y banderas booleanas.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: ["c00-intro"],
    relatedChallengeIds: ["reto-c00-is-negative", "reto-c00-print-comb", "reto-c00-print-comb2"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "No comprende condiciones ni iteraciones." },
      { level: 1, label: "If/Else básico", criteria: "Escribe condiciones simples para evaluar signos o paridad." },
      { level: 2, label: "Bucles while", criteria: "Construye iteraciones con contadores incrementales sin bucles infinitos." },
      { level: 3, label: "Bucles anidados", criteria: "Gestiona dos o tres niveles de bucles while para generar combinaciones numéricas." },
      { level: 4, label: "Optimización y break", criteria: "Diseña condiciones de salida eficientes evitando código espagueti." },
      { level: 5, label: "Nivel Piscina", criteria: "Resuelve ft_print_comb y ft_print_comb2 sin superar el límite de 25 líneas." }
    ]
  },
  {
    id: "c-pointers-basics",
    title: "Punteros y Paso por Referencia",
    category: "c_prog",
    description: "Operadores & (dirección) y * (desreferenciación), punteros simples, stack memory y modificación de variables de llamada.",
    maxLevel: 5,
    weightInReadiness: 6,
    relatedModuleIds: ["c01-punteros"],
    relatedChallengeIds: ["reto-c01-ft-ft", "reto-c01-swap-int", "reto-c01-ft-ultimate-div-mod"],
    levels: [
      { level: 0, label: "Concepto nulo", criteria: "Confunde puntero con el valor almacenado." },
      { level: 1, label: "Sintaxis básica", criteria: "Declara un puntero int *ptr y asigna ptr = &a." },
      { level: 2, label: "Paso por referencia", criteria: "Implementa ft_swap(int *a, int *b) modificando las variables del caller." },
      { level: 3, label: "Múltiples punteros", criteria: "Calcula división y módulo simultáneamente pasando dos punteros de resultado." },
      { level: 4, label: "Punteros a punteros", criteria: "Comprende int **ptr y desreferenciación recursiva (hasta int *********)." },
      { level: 5, label: "Nivel Piscina", criteria: "Visualiza la memoria RAM en el stack sin cometer jamás un Segfault por desreferenciación." }
    ]
  },
  {
    id: "c-pointers-arrays",
    title: "Aritmética de Punteros y Arrays",
    category: "c_prog",
    description: "Equivalencia array-puntero, indexación tab[i] vs *(tab + i), arrays de enteros y ordenación de arrays.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: ["c01-punteros"],
    relatedChallengeIds: ["reto-c01-ft-rev-int-tab", "reto-c01-ft-sort-int-tab"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "No comprende la contigüidad en memoria de un array." },
      { level: 1, label: "Indexación básica", criteria: "Lee y escribe elementos de un array con corchetes tab[i]." },
      { level: 2, label: "Aritmética simple", criteria: "Comprende ptr++ y la distancia entre elementos en memoria según el tipo." },
      { level: 3, label: "Inversión de arrays", criteria: "Implementa ft_rev_int_tab intercambiando los extremos hacia el centro." },
      { level: 4, label: "Algoritmos de ordenación", criteria: "Implementa bubble sort o insertion sort en C puro sobre arrays de enteros." },
      { level: 5, label: "Nivel Piscina", criteria: "Maneja punteros a arrays unidimensionales y bidimensionales con precisión quirúrgica." }
    ]
  },
  {
    id: "c-strings-buffers",
    title: "Cadenas de Caracteres y Terminador Nulo",
    category: "c_prog",
    description: "Naturaleza de char*, terminador '\\0', cálculo de longitud (strlen), copia (strcpy), concatenación y comparación (strcmp).",
    maxLevel: 5,
    weightInReadiness: 6,
    relatedModuleIds: ["c02-c03-cadenas"],
    relatedChallengeIds: ["reto-c02-ft-strcpy", "reto-c02-ft-str-is-alpha", "reto-c03-ft-strcmp", "reto-c03-ft-strcat"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "Trata las cadenas como tipos mágicos de alto nivel sin terminador." },
      { level: 1, label: "Lectura con while", criteria: "Recorre una cadena hasta str[i] != '\\0' para calcular su longitud." },
      { level: 2, label: "Copia y validación", criteria: "Implementa ft_strcpy asegurando el '\\0' final y validadores (ft_str_is_alpha)." },
      { level: 3, label: "Comparación y concatenación", criteria: "Implementa ft_strcmp calculando la diferencia unsigned char y ft_strcat." },
      { level: 4, label: "Funciones con límite de tamaño", criteria: "Implementa ft_strncpy, ft_strncmp y ft_strlcat con manejo de overflow de buffer." },
      { level: 5, label: "Nivel Piscina", criteria: "Escribe cualquier función de strings de la libc sin consultar documentación." }
    ]
  },
  {
    id: "c-conversions-putnbr",
    title: "Conversión de Datos y Formato Numérico",
    category: "c_prog",
    description: "Conversión cadena a entero (ft_atoi), entero a cadena, impresión de números con write (ft_putnbr) y manejo de INT_MIN.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: ["c04-c05-conversion-recursion"],
    relatedChallengeIds: ["reto-c04-ft-strlen", "reto-c04-ft-putnbr", "reto-c04-ft-atoi"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "Depende de printf(\"%d\") y atoi() de stdlib.h." },
      { level: 1, label: "Impresión de dígitos", criteria: "Imprime un número de un solo dígito con '0' + n." },
      { level: 2, label: "Recursión de putnbr", criteria: "Implementa ft_putnbr dividiendo entre 10 y escribiendo el resto." },
      { level: 3, label: "Casos extremos de putnbr", criteria: "Gestiona correctamente el signo negativo y el temido caso límite -2147483648 (INT_MIN)." },
      { level: 4, label: "Implementación de ft_atoi", criteria: "Parsea espacios, múltiples signos +/-, acumula valor y devuelve entero." },
      { level: 5, label: "Nivel Piscina", criteria: "Implementa ft_atoi_base y ft_putnbr_base convirtiendo a cualquier base (bin, hex, oct)." }
    ]
  },
  {
    id: "c-recursion",
    title: "Recursión y Call Stack",
    category: "c_prog",
    description: "Caso base, caso recursivo, consumo del call stack, factoriales, potencias, Fibonacci y detección de overflow.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: ["c04-c05-conversion-recursion"],
    relatedChallengeIds: ["reto-c05-ft-iterative-factorial", "reto-c05-ft-recursive-factorial", "reto-c05-ft-fibonacci"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "No comprende que una función pueda llamarse a sí misma." },
      { level: 1, label: "Concepto de caso base", criteria: "Identifica la condición de parada de una recursión simple." },
      { level: 2, label: "Recursión lineal", criteria: "Escribe factorial recursivo y comprende cómo se apilan los frames de llamada." },
      { level: 3, label: "Recursión ramificada", criteria: "Implementa Fibonacci recursivo y calcula su complejidad temporal." },
      { level: 4, label: "Prevención de stack overflow", criteria: "Maneja casos de desbordamiento de pila y entradas inválidas devolviendo 0." },
      { level: 5, label: "Nivel Piscina", criteria: "Aplica recursión con backtracking para resolver retos complejos (ej. Las 8 Reinas)." }
    ]
  },
  {
    id: "c-cli-args",
    title: "Argumentos de Línea de Comandos (argc / argv)",
    category: "c_prog",
    description: "Vector de punteros a cadenas char **argv, contador int argc, ordenación de parámetros CLI e impresión directa.",
    maxLevel: 5,
    weightInReadiness: 4,
    relatedModuleIds: ["c06-cli-args"],
    relatedChallengeIds: ["reto-c06-print-program-name", "reto-c06-print-params", "reto-c06-rev-params", "reto-c06-sort-params"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "Usa siempre main(void) y no sabe cómo recibir parámetros." },
      { level: 1, label: "Lectura de argv[0]", criteria: "Imprime el nombre del binario ejecutado accediendo a argv[0]." },
      { level: 2, label: "Iteración sobre parámetros", criteria: "Recorre argv desde 1 hasta argc - 1 imprimiendo cada cadena con salto de línea." },
      { level: 3, label: "Orden inverso de args", criteria: "Itera argv en orden descendente con ft_putstr." },
      { level: 4, label: "Ordenación ASCII de args", criteria: "Ordena argv con ft_strcmp intercambiando punteros de cadenas." },
      { level: 5, label: "Nivel Piscina", criteria: "Resuelve todos los retos de C06 en menos de 30 minutos sin errores." }
    ]
  },
  {
    id: "c-dynamic-memory",
    title: "Memoria Dinámica en Heap (malloc / free)",
    category: "c_prog",
    description: "Asignación de memoria con malloc(sizeof(...)), verificación de NULL, liberación con free(), ft_strdup, ft_range y ft_split.",
    maxLevel: 5,
    weightInReadiness: 6,
    relatedModuleIds: ["c07-asignacion-dinamica"],
    relatedChallengeIds: ["reto-c07-ft-strdup", "reto-c07-ft-range", "reto-c07-ft-ultimate-range", "reto-c07-ft-strjoin", "reto-c07-ft-split"],
    levels: [
      { level: 0, label: "Desconocido", criteria: "No conoce el Heap ni por qué la memoria estática en el Stack desaparece al salir de la función." },
      { level: 1, label: "Malloc básico", criteria: "Reserva memoria para un array simple y verifica si el retorno es NULL." },
      { level: 2, label: "Duplicación de cadenas", criteria: "Implementa ft_strdup reservando exactamente strlen + 1 bytes y copiando." },
      { level: 3, label: "Arrays dinámicos y rangos", criteria: "Implementa ft_range y ft_ultimate_range con paso de doble puntero int **range." },
      { level: 4, label: "Concatenación dinámica", criteria: "Implementa ft_strjoin calculando la longitud total de strings y separadores." },
      { level: 5, label: "Nivel Piscina", criteria: "Implementa ft_split con asignación bidimensional perfecta y liberación de memoria ante fallo." }
    ]
  },

  // --- CATEGORY: ENGINEERING & 42 RIGOR ---
  {
    id: "eng-norminette",
    title: "Rigor Norminette v3",
    category: "engineering",
    description: "Reglas oficiales 42: máx 25 líneas por función, máx 5 funciones por archivo, máx 4 variables, prohibido for/switch/goto, indentación con tabs.",
    maxLevel: 5,
    weightInReadiness: 6,
    relatedModuleIds: ["c00-intro", "c01-punteros", "c02-c03-cadenas"],
    relatedChallengeIds: ["reto-c00-putchar", "reto-c01-swap-int", "reto-c02-ft-strcpy"],
    levels: [
      { level: 0, label: "No respeta", criteria: "Escribe código estilo libre con bucles for, variables en cualquier línea y llaves en la misma línea." },
      { level: 1, label: "Conoce las reglas", criteria: "Sabe que existen límites de 25 líneas y variables al inicio de la función." },
      { level: 2, label: "Tabulaciones y nombres", criteria: "Indenta con tabs reales de 4 espacios y usa snake_case en funciones y variables." },
      { level: 3, label: "Refactorización <25 líneas", criteria: "Trocea funciones complejas en funciones auxiliares respetando el máximo de 5 por .c." },
      { level: 4, label: "Cero errores al primer intento", criteria: "Escribe código que pasa norminette -R CheckForbiddenSourceHeader sin un solo fallo." },
      { level: 5, label: "Nivel Piscina", criteria: "Piensa y estructura en Norminette de forma instintiva y automática." }
    ]
  },
  {
    id: "eng-compilation-flags",
    title: "Compilación Estricta (-Wall -Wextra -Werror)",
    category: "engineering",
    description: "Compilación con cc/gcc/clang, flags estrictos de 42, resolución inmediata de warnings de tipos, variables no usadas y retornos.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: ["c00-intro", "c06-cli-args"],
    relatedChallengeIds: ["reto-c00-putchar", "reto-c06-print-params"],
    levels: [
      { level: 0, label: "Sin flags", criteria: "Compila con gcc archivo.c ignorando advertencias." },
      { level: 1, label: "Flags básicos", criteria: "Compila con -Wall -Wextra -Werror cuando se lo recuerdan." },
      { level: 2, label: "Corrección de warnings", criteria: "Entiende y soluciona errores de unused parameter y comparison between signed and unsigned." },
      { level: 3, label: "Compilación separada", criteria: "Genera binarios compilando main.c junto a ft_funcion.c sin incluir .c dentro de otro .c." },
      { level: 4, label: "Makefiles básicos", criteria: "Escribe Makefiles con reglas all, clean, fclean, re y flags estrictos." },
      { level: 5, label: "Nivel Piscina", criteria: "Jamás entrega un archivo que genere un warning o error de compilación." }
    ]
  },
  {
    id: "eng-memory-leaks-valgrind",
    title: "Detección de Fugas de Memoria (Valgrind)",
    category: "engineering",
    description: "Gestión de memoria libre de fugas (0 bytes in 0 blocks), uso de Valgrind (--leak-check=full) y prevención de dangling pointers.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: ["c07-asignacion-dinamica"],
    relatedChallengeIds: ["reto-c07-ft-strdup", "reto-c07-ft-split"],
    levels: [
      { level: 0, label: "Ignora fugas", criteria: "Usa malloc sin llamar nunca a free()." },
      { level: 1, label: "Free() superficial", criteria: "Llama a free al final pero olvida liberar en branches de error o sub-punteros." },
      { level: 2, label: "Lectura de Valgrind", criteria: "Ejecuta valgrind e identifica 'definitely lost' vs 'still reachable'." },
      { level: 3, label: "Liberación bidimensional", criteria: "Libera cada fila de un char** antes de liberar el array principal." },
      { level: 4, label: "Manejo de fallos en bucle", criteria: "Si el 4º malloc de un split falla, libera el 3º, 2º y 1º antes de retornar NULL." },
      { level: 5, label: "Nivel Piscina", criteria: "Garantía de 'All heap blocks were freed -- no leaks are possible' en todos sus proyectos." }
    ]
  },
  {
    id: "eng-peer-evaluation",
    title: "Peer-Evaluation & Defensa Técnica",
    category: "engineering",
    description: "Explicación verbal clara línea a línea de tu código, formulación de preguntas a compañeros y detección rigurosa de edge cases.",
    maxLevel: 5,
    weightInReadiness: 4,
    relatedModuleIds: ["c00-intro", "c01-punteros", "c07-asignacion-dinamica"],
    relatedChallengeIds: ["reto-c01-swap-int", "reto-c07-ft-split"],
    levels: [
      { level: 0, label: "Pasivo", criteria: "No sabe explicar su propio código o se bloquea ante preguntas." },
      { level: 1, label: "Explicación básica", criteria: "Describe qué hace el código en términos generales pero no línea por línea." },
      { level: 2, label: "Defensa técnica", criteria: "Explica el porqué de cada condición, paso de memoria y retorno." },
      { level: 3, label: "Corrector constructivo", criteria: "Crea mains de prueba con edge cases (NULL, cadenas vacías, INT_MIN) para evaluar a otros." },
      { level: 4, label: "Espíritu 42", criteria: "Detecta trampas sutiles y enseña amablemente el concepto detrás del fallo." },
      { level: 5, label: "Nivel Piscina", criteria: "Evaluador y evaluado ejemplar: máxima honestidad, rigor técnico y empatía." }
    ]
  },

  // --- CATEGORY: META & PISCINE ENDURANCE ---
  {
    id: "meta-autonomy-search",
    title: "Autonomía y Búsqueda Eficaz (Man pages)",
    category: "meta",
    description: "Lectura de manuales Unix (man 2 write, man 3 strlen), búsqueda de errores en terminal y resolución sin soluciones predigeridas.",
    maxLevel: 5,
    weightInReadiness: 4,
    relatedModuleIds: ["c00-intro", "c02-c03-cadenas"],
    relatedChallengeIds: ["reto-c00-putchar", "reto-c02-ft-strcpy"],
    levels: [
      { level: 0, label: "Dependiente", criteria: "Pregunta antes de intentar leer el error o buscar en la documentación." },
      { level: 1, label: "Búsqueda en Google", criteria: "Busca errores pero copia soluciones sin entenderlas." },
      { level: 2, label: "Lectura de man pages", criteria: "Consulta man 2 write y man 3 strcmp para conocer firmas y retornos." },
      { level: 3, label: "Aislamiento de bugs", criteria: "Crea casos de prueba mínimos para reproducir y entender un fallo." },
      { level: 4, label: "Autonomía completa", criteria: "Resuelve problemas complejos únicamente con el manual y experimentación." },
      { level: 5, label: "Nivel Piscina", criteria: "Capacidad infinita de aprender tecnologías nuevas de forma 100% autodidacta." }
    ]
  },
  {
    id: "meta-deep-work",
    title: "Deep Work y Ritmo Diario (6-8h sostenidas)",
    category: "meta",
    description: "Capacidad de concentración profunda sin distracciones de móvil o redes, pausas de recarga y constancia durante 28 días.",
    maxLevel: 5,
    weightInReadiness: 4,
    relatedModuleIds: [],
    relatedChallengeIds: [],
    levels: [
      { level: 0, label: "Disperso", criteria: "Se distrae cada 15 minutos y abandona ante la primera frustración." },
      { level: 1, label: "Bloques de 1h", criteria: "Mantiene el foco durante 1 hora antes de necesitar un descanso largo." },
      { level: 2, label: "Bloques de 2-3h", criteria: "Completa sesiones de 3 horas de programación concentrada." },
      { level: 3, label: "Jornada completa", criteria: "Programa 6 horas al día con descansos planificados y disciplina de descanso." },
      { level: 4, label: "Resistencia semanal", criteria: "Mantiene el rendimiento durante varias semanas consecutivas sin burnout." },
      { level: 5, label: "Nivel Piscina", criteria: "Ritmo inquebrantable de alto rendimiento durante el mes entero de Piscina." }
    ]
  },
  {
    id: "meta-exam-pressure",
    title: "Rendimiento bajo Presión (Examshell 4h)",
    category: "meta",
    description: "Gestión del estrés en exámenes con entorno cerrado, tiempo limitado, penalización por fallo (grademe) y progresión por niveles.",
    maxLevel: 5,
    weightInReadiness: 5,
    relatedModuleIds: [],
    relatedChallengeIds: [],
    levels: [
      { level: 0, label: "Bloqueo", criteria: "El cronómetro y la falta de internet provocan bloqueo total." },
      { level: 1, label: "Intento nervioso", criteria: "Comete errores tontos por apresurarse en el nivel 0." },
      { level: 2, label: "Supera nivel 0 y 1", criteria: "Resuelve los primeros niveles con calma comprobando antes de hacer grademe." },
      { level: 3, label: "Estrategia de examen", criteria: "Gestiona el tiempo, lee atentamente los enunciados y prueba edge cases." },
      { level: 4, label: "Consistencia >75/100", criteria: "Supera simulacros de 4 horas alcanzando de forma recurrente el nivel 3 o 4." },
      { level: 5, label: "Nivel Piscina", criteria: "Aprobado seguro en el examen final de 8 horas." }
    ]
  }
];
