import { DiagnosticQuestion } from "./types";

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ==========================================
  // 1. TERMINAL & UNIX CLI (4 questions)
  // ==========================================
  {
    id: "diag-term-01",
    skillId: "term-nav-files",
    category: "terminal",
    title: "Navegación y manipulación de archivos ocultos",
    question: "¿Qué comando lista TODOS los archivos (incluyendo ocultos como .git o .gitignore) ordenados por fecha de modificación más reciente primero y con formato detallado de permisos?",
    options: [
      {
        id: "opt-1",
        text: "ls -lt",
        isCorrect: false,
        explanation: "ls -lt ordena por fecha y formato largo, pero NO incluye los archivos ocultos (falta la flag -a)."
      },
      {
        id: "opt-2",
        text: "ls -lat",
        isCorrect: true,
        explanation: "¡Correcto! -l (long format), -a (all including dotfiles) y -t (sort by modification time, newest first)."
      },
      {
        id: "opt-3",
        text: "ls -lrth",
        isCorrect: false,
        explanation: "ls -lrth invierte el orden (-r) mostrando los más antiguos al final y no incluye archivos ocultos sin -a."
      },
      {
        id: "opt-4",
        text: "find . -type f",
        isCorrect: false,
        explanation: "find muestra rutas relativas pero no el formato detallado de permisos y fechas de ls."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-term-02",
    skillId: "term-permissions",
    category: "terminal",
    title: "Permisos Unix y cálculo octal",
    question: "Quieres que el propietario pueda leer, escribir y ejecutar un script (rwx), el grupo sólo leer y ejecutar (r-x), y los demás ningún acceso (---). ¿Qué valor octal debes usar con chmod?",
    options: [
      {
        id: "opt-1",
        text: "chmod 755 script.sh",
        isCorrect: false,
        explanation: "755 otorga r-x a los demás (otros), permitiendo que cualquiera lo lea y ejecute."
      },
      {
        id: "opt-2",
        text: "chmod 750 script.sh",
        isCorrect: true,
        explanation: "¡Correcto! Propietario: 4+2+1=7 (rwx). Grupo: 4+0+1=5 (r-x). Otros: 0+0+0=0 (---)."
      },
      {
        id: "opt-3",
        text: "chmod 760 script.sh",
        isCorrect: false,
        explanation: "6 en el grupo equivale a 4+2=6 (rw-), permitiendo escritura pero no ejecución."
      },
      {
        id: "opt-4",
        text: "chmod 640 script.sh",
        isCorrect: false,
        explanation: "640 no otorga permisos de ejecución (x) a nadie."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-term-03",
    skillId: "term-redirection-pipes",
    category: "terminal",
    title: "Redirección de flujos estándar y pipes",
    question: "¿Qué combinación de comandos y redirecciones cuenta cuántas líneas que contengan la palabra 'error' existen en server.log, silenciando cualquier mensaje de fallo por pantalla hacia /dev/null?",
    options: [
      {
        id: "opt-1",
        text: "cat server.log | grep 'error' | wc -w",
        isCorrect: false,
        explanation: "wc -w cuenta palabras, no líneas, y no silencia los errores del comando hacia /dev/null."
      },
      {
        id: "opt-2",
        text: "grep 'error' server.log 2>/dev/null | wc -l",
        isCorrect: true,
        explanation: "¡Correcto! grep busca 'error', 2>/dev/null envía stderr al agujero negro, y | wc -l cuenta las líneas coincidentes."
      },
      {
        id: "opt-3",
        text: "grep 'error' server.log > /dev/null",
        isCorrect: false,
        explanation: "Esto silencia la salida estándar stdout (el resultado) y no cuenta las líneas."
      },
      {
        id: "opt-4",
        text: "find . -name server.log | wc -l 2>&1",
        isCorrect: false,
        explanation: "Esto solo cuenta 1 (el nombre del archivo) sin buscar en su contenido."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },
  {
    id: "diag-term-04",
    skillId: "term-env-scripting",
    category: "terminal",
    title: "Variables de entorno y valor de retorno $?",
    question: "En un script o terminal POSIX, ¿qué significa la variable especial `$?` tras ejecutar un comando previo?",
    options: [
      {
        id: "opt-1",
        text: "El PID (Process ID) del último proceso lanzado en segundo plano.",
        isCorrect: false,
        explanation: "El PID en background se consulta con `$!`."
      },
      {
        id: "opt-2",
        text: "El código de salida (exit status) del último comando ejecutado (0 suele indicar éxito).",
        isCorrect: true,
        explanation: "¡Correcto! `$?` contiene el exit status: 0 indica ejecución exitosa, y cualquier valor >0 representa un código de error."
      },
      {
        id: "opt-3",
        text: "El número total de argumentos pasados al script.",
        isCorrect: false,
        explanation: "El número de argumentos se obtiene con `$#`."
      },
      {
        id: "opt-4",
        text: "El nombre del usuario que ejecuta la shell actual.",
        isCorrect: false,
        explanation: "El nombre de usuario se almacena en `$USER` o `$LOGNAME`."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },

  // ==========================================
  // 2. GIT & VOGSPHERE (3 questions)
  // ==========================================
  {
    id: "diag-git-01",
    skillId: "git-basics",
    category: "git",
    title: "Staging Area y Commits Atómicos",
    question: "Tienes modificados `ft_putchar.c`, `ft_swap.c` y un archivo de pruebas personal `main.c`. Solo quieres commitear `ft_putchar.c` con el mensaje 'feat: add ft_putchar'. ¿Cuál es el procedimiento correcto?",
    options: [
      {
        id: "opt-1",
        text: "git commit -a -m \"feat: add ft_putchar\"",
        isCorrect: false,
        explanation: "-a añade automáticamente TODOS los archivos rastreados modificados, incluyendo ft_swap.c y main.c."
      },
      {
        id: "opt-2",
        text: "git add ft_putchar.c && git commit -m \"feat: add ft_putchar\"",
        isCorrect: true,
        explanation: "¡Correcto! Añade únicamente el archivo deseado al staging area y crea el commit atómico correspondiente."
      },
      {
        id: "opt-3",
        text: "git add . && git commit -m \"feat: add ft_putchar\"",
        isCorrect: false,
        explanation: "git add . añadiría los 3 archivos, contaminando el commit con código no preparado."
      },
      {
        id: "opt-4",
        text: "git push origin ft_putchar.c",
        isCorrect: false,
        explanation: "git push sube ramas a remotos, no archivos individuales."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-git-02",
    skillId: "git-vogsphere",
    category: "git",
    title: "Entrega en Vogsphere y errores fatales (0 en Moulinette)",
    question: "En la Piscina de 42, ¿cuál de los siguientes errores provoca una calificación automática de 0 (Empty/Norme/Forbidden) por parte de Moulinette en Vogsphere?",
    options: [
      {
        id: "opt-1",
        text: "Dejar una función main() comentada o sin comentar en tu archivo de entrega .c.",
        isCorrect: false,
        explanation: "Tener un main sin comentar dará error de doble main al compilar con el corrector, pero no es la única trampa fatal."
      },
      {
        id: "opt-2",
        text: "Subir archivos compilados (.o, a.out) o no respetar el nombre exacto del directorio del ejercicio (ej. ex00/).",
        isCorrect: false,
        explanation: "Es un error grave, pero la opción integral engloba todas las reglas de entrega."
      },
      {
        id: "opt-3",
        text: "Cualquiera de las siguientes: nombre de función erróneo, carpeta equivocada, archivos basura (.o, a.out, .DS_Store), o violación de Norminette.",
        isCorrect: true,
        explanation: "¡Correcto! Moulinette es implacable: cualquier fallo de compilación, nombre, estructura de carpetas o Norminette anula el ejercicio."
      },
      {
        id: "opt-4",
        text: "Hacer más de 3 commits en el repositorio.",
        isCorrect: false,
        explanation: "En 42 se fomenta hacer muchos commits frecuentes y descriptivos; no hay límite."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-git-03",
    skillId: "git-vogsphere",
    category: "git",
    title: "Inspección pre-push de archivos a entregar",
    question: "¿Qué comando te muestra exactamente qué archivos difieren entre tu rama local y la rama remota de Vogsphere antes de hacer push?",
    options: [
      {
        id: "opt-1",
        text: "git status",
        isCorrect: false,
        explanation: "git status solo muestra el estado del working directory respecto a tu commit local actual, no las diferencias de contenido con el remoto."
      },
      {
        id: "opt-2",
        text: "git diff origin/master HEAD",
        isCorrect: true,
        explanation: "¡Correcto! Compara los commits de tu HEAD local con el estado descargado de origin/master."
      },
      {
        id: "opt-3",
        text: "git branch -a",
        isCorrect: false,
        explanation: "git branch -a solo lista los nombres de las ramas existentes."
      },
      {
        id: "opt-4",
        text: "git pull --force",
        isCorrect: false,
        explanation: "git pull sobreescribiría cambios sin inspeccionar diferencias."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },

  // ==========================================
  // 3. C PROGRAMMING CORE (10 questions)
  // ==========================================
  {
    id: "diag-c-01",
    skillId: "c-basics-types",
    category: "c_prog",
    title: "Syscall write() y descriptor de archivo",
    question: "¿Qué realiza la siguiente llamada en C bajo la librería unistd.h?",
    codeSnippet: `char c = '4';
write(1, &c, 1);`,
    options: [
      {
        id: "opt-1",
        text: "Escribe el número entero 4 en la entrada estándar (stdin).",
        isCorrect: false,
        explanation: "El descriptor 1 es stdout (salida estándar), no stdin (0), y '4' es el carácter ASCII 52, no el entero 4."
      },
      {
        id: "opt-2",
        text: "Escribe el carácter ASCII '4' (1 byte) en la salida estándar (stdout, fd 1).",
        isCorrect: true,
        explanation: "¡Correcto! fd 1 es stdout, &c es el puntero al buffer, y 1 es el número de bytes a escribir."
      },
      {
        id: "opt-3",
        text: "Escribe en la salida de error (stderr, fd 2).",
        isCorrect: false,
        explanation: "stderr utiliza el file descriptor 2."
      },
      {
        id: "opt-4",
        text: "Produce un error de compilación porque write requiere cadenas con '\\0'.",
        isCorrect: false,
        explanation: "write() es una syscall binaria orientada a bytes; no depende del terminador nulo '\\0'."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-c-02",
    skillId: "c-pointers-basics",
    category: "c_prog",
    title: "Paso por referencia e intercambio de enteros (ft_swap)",
    question: "Observa la siguiente implementación de ft_swap. ¿Cuál es el resultado tras ejecutar el bloque principal?",
    codeSnippet: `void ft_swap(int *a, int *b)
{
    int tmp;

    tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void)
{
    int x = 42;
    int y = 21;
    ft_swap(&x, &y);
    return (0);
}`,
    options: [
      {
        id: "opt-1",
        text: "x mantiene el valor 42 e y mantiene 21 porque C pasa argumentos por valor.",
        isCorrect: false,
        explanation: "Aunque C pasa por valor, se pasa la dirección de memoria (&x, &y), lo que permite mutar la memoria original mediante desreferenciación (*)."
      },
      {
        id: "opt-2",
        text: "x pasa a valer 21 e y pasa a valer 42.",
        isCorrect: true,
        explanation: "¡Correcto! Se accede directamente al contenido de las direcciones recibidas modificando las variables del llamador."
      },
      {
        id: "opt-3",
        text: "Produce un Segmentation Fault al desreferenciar tmp.",
        isCorrect: false,
        explanation: "tmp es un entero normal en el stack local, no un puntero."
      },
      {
        id: "opt-4",
        text: "x e y quedan con valores indefinidos de basura de memoria.",
        isCorrect: false,
        explanation: "El intercambio es determinista y seguro."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-c-03",
    skillId: "c-pointers-basics",
    category: "c_prog",
    title: "Desreferenciación de punteros nulos (NULL Segfault)",
    question: "¿Qué ocurre en tiempo de ejecución al ejecutar el siguiente código en un sistema Unix x86_64?",
    codeSnippet: `int *ptr = NULL;
*ptr = 42;`,
    options: [
      {
        id: "opt-1",
        text: "Asigna 42 en la dirección 0x0 sin ningún problema.",
        isCorrect: false,
        explanation: "La dirección 0x0 está protegida por la MMU del sistema operativo."
      },
      {
        id: "opt-2",
        text: "Segmentation Fault (señal SIGSEGV) por acceso a memoria no asignada/protegida.",
        isCorrect: true,
        explanation: "¡Correcto! Intentar leer o escribir en la dirección NULL (0x0) es una violación de acceso a memoria que aborta el programa con SIGSEGV."
      },
      {
        id: "opt-3",
        text: "El compilador sustituye automáticamente NULL por una dirección disponible en el heap.",
        isCorrect: false,
        explanation: "C no tiene recolección de basura ni reasignación mágica de punteros nulos."
      },
      {
        id: "opt-4",
        text: "Retorna 0 silenciosamente.",
        isCorrect: false,
        explanation: "No retorna silenciosamente; el proceso es terminado de inmediato."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-c-04",
    skillId: "c-pointers-arrays",
    category: "c_prog",
    title: "Aritmética de punteros vs Indexación de arrays",
    question: "Si `int tab[5] = {10, 20, 30, 40, 50};` y `int *ptr = tab;`, ¿cuál es el valor de `*(ptr + 3)` y cuánto avanza internamente en bytes en una arquitectura de 64 bits?",
    options: [
      {
        id: "opt-1",
        text: "Valor: 30. Avanza 3 bytes.",
        isCorrect: false,
        explanation: "tab[3] es el 4º elemento (40), y un int ocupa 4 bytes, no 1."
      },
      {
        id: "opt-2",
        text: "Valor: 40. Avanza 12 bytes en memoria (3 * sizeof(int) = 3 * 4 bytes).",
        isCorrect: true,
        explanation: "¡Correcto! ptr + 3 apunta al índice 3 (40). En C, sumar 1 a un puntero escala por sizeof(*ptr) (4 bytes en int32)."
      },
      {
        id: "opt-3",
        text: "Valor: 40. Avanza 24 bytes (3 * 8 bytes).",
        isCorrect: false,
        explanation: "El tipo base es int (4 bytes), no un puntero int* o long (8 bytes)."
      },
      {
        id: "opt-4",
        text: "Valor: 50. Avanza 16 bytes.",
        isCorrect: false,
        explanation: "El valor en el índice 3 es 40."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },
  {
    id: "diag-c-05",
    skillId: "c-strings-buffers",
    category: "c_prog",
    title: "Cadenas en C y el carácter terminador nulo '\\0'",
    question: "¿Cuántos bytes de memoria como mínimo se deben reservar para almacenar de forma segura la cadena \"Piscina42\" en C?",
    options: [
      {
        id: "opt-1",
        text: "9 bytes (longitud 9) porque no se necesita ningún carácter especial.",
        isCorrect: false,
        explanation: "\"Piscina42\" tiene 9 caracteres imprimibles, pero requiere obligatoriamente 1 byte adicional para el '\\0'."
      },
      {
        id: "opt-2",
        text: "10 bytes: 9 caracteres visibles + 1 byte para el terminador nulo '\\0'.",
        isCorrect: true,
        explanation: "¡Correcto! En C, todas las cadenas válidas deben terminar con el byte nulo '\\0' (ASCII 0) para que strlen, strcpy y printf sepan dónde finalizan."
      },
      {
        id: "opt-3",
        text: "8 bytes porque la arquitectura es de 64 bits.",
        isCorrect: false,
        explanation: "El tamaño de los datos en bytes es independiente del bus de memoria del procesador."
      },
      {
        id: "opt-4",
        text: "18 bytes (2 bytes por carácter Unicode).",
        isCorrect: false,
        explanation: "char en C estándar es de 1 byte (8 bits) bajo codificación ASCII/UTF-8."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-c-06",
    skillId: "c-strings-buffers",
    category: "c_prog",
    title: "Implementación de ft_strcpy y copia de cadenas",
    question: "Analiza el siguiente código para copiar una cadena. ¿Cuál de las siguientes afirmaciones es CORRECTA?",
    codeSnippet: `char *ft_strcpy(char *dest, char *src)
{
    int i;

    i = 0;
    while (src[i] != '\\0')
    {
        dest[i] = src[i];
        i++;
    }
    dest[i] = '\\0';
    return (dest);
}`,
    options: [
      {
        id: "opt-1",
        text: "Es incorrecto porque olvida copiar el '\\0' final.",
        isCorrect: false,
        explanation: "La línea dest[i] = '\\0' tras salir del bucle añade expresamente el terminador nulo."
      },
      {
        id: "opt-2",
        text: "Es una implementación válida y segura de ft_strcpy según la norma de 42.",
        isCorrect: true,
        explanation: "¡Correcto! Copia carácter a carácter, finaliza con '\\0' y devuelve el puntero al buffer de destino (dest)."
      },
      {
        id: "opt-3",
        text: "Falla porque no reserva memoria con malloc para dest.",
        isCorrect: false,
        explanation: "strcpy asume que dest es un buffer preasignado por el llamador con espacio suficiente."
      },
      {
        id: "opt-4",
        text: "Debe retornar un entero con la longitud copiada, no char*.",
        isCorrect: false,
        explanation: "La firma estándar de strcpy en libc devuelve char* (puntero a dest)."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },
  {
    id: "diag-c-07",
    skillId: "c-conversions-putnbr",
    category: "c_prog",
    title: "El caso extremo de INT_MIN en ft_putnbr / ft_atoi",
    question: "En una máquina con enteros de 32 bits en complemento a dos, ¿por qué `n = -n;` falla catastróficamente si `n == -2147483648` (INT_MIN)?",
    options: [
      {
        id: "opt-1",
        text: "Porque el número positivo equivalente (+2147483648) no cabe en un int con signo (su máximo es 2147483647), provocando Integer Overflow indefinido.",
        isCorrect: true,
        explanation: "¡Correcto! En complemento a dos, el rango de int es de -2^31 a 2^31-1. Negar INT_MIN produce desbordamiento porque no existe +2147483648 como int positivo."
      },
      {
        id: "opt-2",
        text: "Porque el operador unario menos (-) está prohibido en la Norminette.",
        isCorrect: false,
        explanation: "El operador menos unario es totalmente legal en C y en Norminette."
      },
      {
        id: "opt-3",
        text: "Porque la syscall write no admite números negativos.",
        isCorrect: false,
        explanation: "write() solo recibe bytes de memoria, no números."
      },
      {
        id: "opt-4",
        text: "Porque C automáticamente convierte los números negativos a unsigned int.",
        isCorrect: false,
        explanation: "C no convierte automáticamente variables int a unsigned sin un cast explícito."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },
  {
    id: "diag-c-08",
    skillId: "c-recursion",
    category: "c_prog",
    title: "Caso base y call stack en funciones recursivas",
    question: "¿Qué ocurre al ejecutar `ft_recursive_factorial(-5)` con la siguiente función?",
    codeSnippet: `int ft_recursive_factorial(int nb)
{
    if (nb == 0)
        return (1);
    return (nb * ft_recursive_factorial(nb - 1));
}`,
    options: [
      {
        id: "opt-1",
        text: "Retorna 0 inmediatamente.",
        isCorrect: false,
        explanation: "La condición if (nb == 0) no contempla nb < 0."
      },
      {
        id: "opt-2",
        text: "Entra en recursión infinita (-5, -6, -7...) consumiendo stack frames hasta provocar Stack Overflow (Segmentation Fault).",
        isCorrect: true,
        explanation: "¡Correcto! Al restar 1 continuamente a un número negativo nunca alcanzará 0, agotando la memoria de la pila (Call Stack) hasta crashear."
      },
      {
        id: "opt-3",
        text: "Retorna -120.",
        isCorrect: false,
        explanation: "El factorial de un número negativo está indefinido matemáticamente y la función crasheará antes."
      },
      {
        id: "opt-4",
        text: "El compilador detecta el bucle en tiempo de compilación y no genera binario.",
        isCorrect: false,
        explanation: "C no analiza la terminación recursiva en tiempo de compilación."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },
  {
    id: "diag-c-09",
    skillId: "c-cli-args",
    category: "c_prog",
    title: "Parámetros de línea de comandos argc y argv",
    question: "Si ejecutas `./a.out hola 42 madrid`, ¿cuál es el valor de `argc` y el contenido de `argv[2]`?",
    options: [
      {
        id: "opt-1",
        text: "argc = 3, argv[2] = \"madrid\"",
        isCorrect: false,
        explanation: "argc incluye el nombre del ejecutable argv[0], por lo que hay 4 elementos (0, 1, 2, 3)."
      },
      {
        id: "opt-2",
        text: "argc = 4, argv[2] = \"42\"",
        isCorrect: true,
        explanation: "¡Correcto! argv[0]=\"./a.out\", argv[1]=\"hola\", argv[2]=\"42\", argv[3]=\"madrid\". Total argc = 4."
      },
      {
        id: "opt-3",
        text: "argc = 4, argv[2] = 42 (como número entero)",
        isCorrect: false,
        explanation: "argv es siempre un array de cadenas de caracteres (char*), no enteros."
      },
      {
        id: "opt-4",
        text: "argc = 3, argv[2] = \"42\"",
        isCorrect: false,
        explanation: "argc es 4 porque cuenta argv[0]."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-c-10",
    skillId: "c-dynamic-memory",
    category: "c_prog",
    title: "Asignación dinámica en Heap con malloc y verificación de NULL",
    question: "¿Cuál es la forma canónica y segura de reservar memoria para una copia de una cadena `str` de longitud `len`?",
    codeSnippet: `char *dup;
dup = (char *)malloc(sizeof(char) * (len + 1));
if (dup == NULL)
    return (NULL);`,
    options: [
      {
        id: "opt-1",
        text: "Es incorrecto porque nunca se debe comprobar si malloc devuelve NULL.",
        isCorrect: false,
        explanation: "Comprobar if (!dup) o if (dup == NULL) es obligatorio para evitar desreferenciar punteros nulos si el SO se queda sin memoria."
      },
      {
        id: "opt-2",
        text: "Es la forma correcta y recomendada en 42: calcula bytes con +1 para '\\0' y valida inmediatamente el retorno.",
        isCorrect: true,
        explanation: "¡Correcto! Reserva len + 1 bytes y previene crasheos verificando si el puntero devuelto por malloc es NULL."
      },
      {
        id: "opt-3",
        text: "Debe usarse malloc(len) sin +1 porque malloc añade el '\\0' por defecto.",
        isCorrect: false,
        explanation: "malloc solo reserva bytes sin inicializar (con contenido basura); no añade ningún '\\0'."
      },
      {
        id: "opt-4",
        text: "En lugar de char* debe devolverse void* siempre.",
        isCorrect: false,
        explanation: "La función que retorna la cadena debe devolver el tipo concreto char*."
      }
    ],
    difficulty: "advanced",
    points: 1
  },

  // ==========================================
  // 4. ENGINEERING & 42 RIGOR (4 questions)
  // ==========================================
  {
    id: "diag-eng-01",
    skillId: "eng-norminette",
    category: "engineering",
    title: "Reglas clave de la Norminette v3 de 42",
    question: "¿Cuál de las siguientes construcciones está ESTRICTAMENTE PROHIBIDA por la Norminette oficial de 42?",
    options: [
      {
        id: "opt-1",
        text: "Declarar variables al inicio de la función antes de cualquier sentencia ejecutable.",
        isCorrect: false,
        explanation: "Declarar al inicio del scope es obligatorio en Norminette."
      },
      {
        id: "opt-2",
        text: "Usar bucles `for`, sentencias `switch`, `goto` o tener funciones de más de 25 líneas.",
        isCorrect: true,
        explanation: "¡Correcto! La Norminette prohíbe `for`, `switch`, `goto`, `do...while`, operadores ternarios anidados y funciones >25 líneas."
      },
      {
        id: "opt-3",
        text: "Indentar con tabulaciones de 4 espacios.",
        isCorrect: false,
        explanation: "La indentación mediante tabs es requerida por la Norminette."
      },
      {
        id: "opt-4",
        text: "Tener un máximo de 5 funciones en un archivo .c.",
        isCorrect: false,
        explanation: "Tener hasta 5 funciones por archivo está permitido; tener 6 o más es lo prohibido."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-eng-02",
    skillId: "eng-compilation-flags",
    category: "engineering",
    title: "Flags estrictos: -Wall -Wextra -Werror",
    question: "¿Qué efecto tiene la flag `-Werror` al compilar tu código C con `cc -Wall -Wextra -Werror main.c`?",
    options: [
      {
        id: "opt-1",
        text: "Optimiza el binario generado para que se ejecute más rápido.",
        isCorrect: false,
        explanation: "Las optimizaciones se controlan con flags como -O2 o -O3."
      },
      {
        id: "opt-2",
        text: "Trata todas las advertencias (warnings) como errores fatales, deteniendo la compilación y no generando el ejecutable.",
        isCorrect: true,
        explanation: "¡Correcto! En 42, el código debe compilar con 0 warnings. Cualquier warning (como variable no usada) se convierte en error fatal con -Werror."
      },
      {
        id: "opt-3",
        text: "Ignora los errores de sintaxis y fuerza la creación de un binario parcial.",
        isCorrect: false,
        explanation: "-Werror endurece los requisitos, no los relaja."
      },
      {
        id: "opt-4",
        text: "Ejecuta un análisis estático con Valgrind en tiempo de compilación.",
        isCorrect: false,
        explanation: "Valgrind es un analizador dinámico en tiempo de ejecución, no una flag del compilador."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-eng-03",
    skillId: "eng-memory-leaks-valgrind",
    category: "engineering",
    title: "Fugas de memoria (Memory Leaks) y Valgrind",
    question: "¿Qué significa el mensaje `definitely lost: 40 bytes in 1 blocks` en el reporte de Valgrind?",
    options: [
      {
        id: "opt-1",
        text: "El procesador ha perdido 40 ciclos de reloj por un bucle lento.",
        isCorrect: false,
        explanation: "Valgrind mide memoria en bytes, no ciclos de reloj."
      },
      {
        id: "opt-2",
        text: "Se reservó memoria con malloc (40 bytes) cuyo puntero se perdió o sobreescribió sin haber llamado a `free()`, produciendo una fuga irrecuperable.",
        isCorrect: true,
        explanation: "¡Correcto! 'Definitely lost' indica que no queda ningún puntero apuntando a ese bloque de memoria del heap, haciendo imposible su liberación."
      },
      {
        id: "opt-3",
        text: "El stack se ha desbordado por exceso de llamadas recursivas.",
        isCorrect: false,
        explanation: "El stack overflow no se reporta como fuga de heap en bloques perdidos."
      },
      {
        id: "opt-4",
        text: "Es un aviso inofensivo que el sistema operativo limpia sin impacto.",
        isCorrect: false,
        explanation: "En 42 cualquier fuga de memoria en proyectos como C07 o push_swap conlleva un 0 en la corrección."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },
  {
    id: "diag-eng-04",
    skillId: "eng-peer-evaluation",
    category: "engineering",
    title: "Metodología de Peer-Evaluation en 42",
    question: "Durante una corrección entre iguales (Peer-Evaluation), ¿cuál es la actitud y protocolo obligatorio?",
    options: [
      {
        id: "opt-1",
        text: "Aceptar la nota sin hacer preguntas si el evaluador es más experimentado.",
        isCorrect: false,
        explanation: "Ambas partes deben debatir y entender cada línea; no se aceptan notas sin defensa."
      },
      {
        id: "opt-2",
        text: "El evaluado debe ser capaz de explicar línea por línea el porqué de cada instrucción; si no sabe explicar una línea, la nota es 0.",
        isCorrect: true,
        explanation: "¡Correcto! En 42, copiar código sin comprenderlo es motivo de 0 inmediato. Saber defender cada decisión es la base del peer-learning."
      },
      {
        id: "opt-3",
        text: "Solo se prueba que compile; no hace falta revisar el código fuente.",
        isCorrect: false,
        explanation: "La revisión visual del código y la prueba de edge cases son indispensables."
      },
      {
        id: "opt-4",
        text: "El evaluador tiene prohibido proponer casos de prueba que no estén en el enunciado.",
        isCorrect: false,
        explanation: "El evaluador debe idear casos extremos (NULL, INT_MIN, vacíos) para comprobar la robustez."
      }
    ],
    difficulty: "basic",
    points: 1
  },

  // ==========================================
  // 5. META-LEARNING & PISCINE ENDURANCE (3 questions)
  // ==========================================
  {
    id: "diag-meta-01",
    skillId: "meta-autonomy-search",
    category: "meta",
    title: "Lectura autónoma de manuales Unix (Man pages)",
    question: "¿Qué sección del manual de Unix (`man`) describe las llamadas al sistema del kernel (syscalls como `write`, `read`, `open`, `fork`)?",
    options: [
      {
        id: "opt-1",
        text: "Sección 1 (man 1 ...)",
        isCorrect: false,
        explanation: "La Sección 1 contiene comandos ejecutables de usuario de la shell (ej. ls, cp, grep)."
      },
      {
        id: "opt-2",
        text: "Sección 2 (man 2 write)",
        isCorrect: true,
        explanation: "¡Correcto! La Sección 2 documenta las llamadas al sistema (System Calls del kernel), mientras que la Sección 3 documenta las funciones de la librería de C (libc como malloc, strlen)."
      },
      {
        id: "opt-3",
        text: "Sección 3 (man 3 ...)",
        isCorrect: false,
        explanation: "La Sección 3 contiene funciones de librería estándar de C (libc), no syscalls."
      },
      {
        id: "opt-4",
        text: "Sección 5 (man 5 ...)",
        isCorrect: false,
        explanation: "La Sección 5 describe formatos de archivos y convenciones (ej. /etc/passwd)."
      }
    ],
    difficulty: "intermediate",
    points: 1
  },
  {
    id: "diag-meta-02",
    skillId: "meta-exam-pressure",
    category: "meta",
    title: "Estrategia en el simulador Examshell",
    question: "En los exámenes de los viernes (Examshell), ¿qué sucede si envías tu código con el comando `grademe` y tu solución falla?",
    options: [
      {
        id: "opt-1",
        text: "Se te descuenta tiempo del examen pero mantienes el nivel.",
        isCorrect: false,
        explanation: "No se descuenta tiempo pero se penaliza el tiempo de espera para el siguiente intento."
      },
      {
        id: "opt-2",
        text: "Recibes 0 en el ejercicio actual, debes reescribirlo y esperar un tiempo de penalización creciente (cooldown) antes de volver a enviar.",
        isCorrect: true,
        explanation: "¡Correcto! Cada fallo en Examshell impone un cooldown creciente (de 5 min a horas), por lo que siempre debes testear minuciosamente en local antes de hacer grademe."
      },
      {
        id: "opt-3",
        text: "El examen finaliza automáticamente y eres expulsado.",
        isCorrect: false,
        explanation: "Puedes seguir intentándolo mientras quede tiempo en el reloj de 4 horas."
      },
      {
        id: "opt-4",
        text: "El sistema te da una pista socrática para corregir el bug.",
        isCorrect: false,
        explanation: "En Examshell el entorno es completamente ciego: no hay internet, no hay pistas y no hay compañeros."
      }
    ],
    difficulty: "basic",
    points: 1
  },
  {
    id: "diag-meta-03",
    skillId: "meta-deep-work",
    category: "meta",
    title: "Gestión de la fatiga cognitiva durante la Piscina",
    question: "Llevas 3 horas atascado en un Segmentation Fault en el módulo C07. Es la 1 de la madrugada y estás agotado. Según la metodología 42, ¿cuál es la mejor estrategia?",
    options: [
      {
        id: "opt-1",
        text: "Seguir programando sin dormir hasta que compile por fuerza bruta.",
        isCorrect: false,
        explanation: "La privación de sueño destruye la agudeza mental, provocando más bugs y burnout en los primeros 10 días."
      },
      {
        id: "opt-2",
        text: "Hacer commit de lo que tengas, dormir 7-8 horas, y al día siguiente explicarle tu código en voz alta a un compañero (técnica del pato de goma / peer-learning).",
        isCorrect: true,
        explanation: "¡Correcto! El descanso y la explicación verbal a otro estudiante desbloquean el 90% de los problemas cognitivos de memoria y lógica."
      },
      {
        id: "opt-3",
        text: "Buscar la solución exacta en el ordenador de un compañero mientras no mira.",
        isCorrect: false,
        explanation: "El fraude o trampa acarrea -42 en puntuación y expulsión inmediata del proceso de selección."
      },
      {
        id: "opt-4",
        text: "Saltarte C07 y pasar a C08 sin resolver la memoria dinámica.",
        isCorrect: false,
        explanation: "C07 es prerrequisito fundamental; sin malloc y free es imposible aprobar los módulos posteriores ni los proyectos troncales."
      }
    ],
    difficulty: "basic",
    points: 1
  }
];
