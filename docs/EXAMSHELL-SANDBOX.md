# Diseño del Servicio Sandbox de Compilación y Evaluación (Examshell C Runner)

Este documento define la arquitectura, diseño de seguridad, contratos de API y estrategia de ejecución para el microservicio de evaluación dinámica de código C de **Piscina42-web**.

---

## 1. Objetivo y Alcance

Permitir que el frontend (`ExamSimulator.tsx`, `ChallengeViewer.tsx` y simuladores de Moulinette) envíe código fuente en C entregado por el estudiante, lo compile de forma aislada bajo los estándares oficiales de la Piscina de 42 (`gcc -Wall -Wextra -Werror`), lo ejecute contra una batería de tests unitarios/harnesses y devuelva un veredicto estructurado (*OK*, *KO*, *Norme Error*, *Memory Leak*, *Time Limit Exceeded*, *Segmentation Fault*).

---

## 2. Arquitectura General

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend (React/Vite)                │
│  - ExamSimulator (grademe)                             │
│  - ChallengeViewer (ejecutar tests)                   │
└───────────────────────────┬────────────────────────────┘
                            │ POST /api/eval/c-assignment
                            ▼
┌────────────────────────────────────────────────────────┐
│              Backend Service (Express / Node.js)       │
│  1. Validación de esquema y rate-limiting             │
│  2. Verificación previa de Norminette                  │
│  3. Preparación de workspace temporal (/tmp/run-XXXX)  │
│  4. Inyección del test harness correspondiente         │
└───────────────────────────┬────────────────────────────┘
                            │ Spawn aislado
                            ▼
┌────────────────────────────────────────────────────────┐
│             Sandbox de Ejecución Aislada               │
│  (Docker Container / nsjail / gVisor / Firejail)       │
│                                                        │
│  - gcc -Wall -Wextra -Werror -std=c99 *.c -o prog      │
│  - Timeout estricto: 2.0s por ejecución                │
│  - Memoria máxima: 64 MB (ulimit -v 65536)             │
│  - Procesos máximos: 10 (ulimit -u 10)                 │
│  - Red: Deshabilitada (Network: None)                  │
│  - Sistema de archivos: tmpfs de solo lectura           │
└───────────────────────────┬────────────────────────────┘
                            │ Salida stdout/stderr + exit code
                            ▼
┌────────────────────────────────────────────────────────┐
│              Motor de Calificación (Moulinette)        │
│  - Comprobación de salidas vs oráculo/esperado        │
│  - Detección de Crash (SIGSEGV, SIGABRT, SIGBUS)       │
│  - Generación de nota (0 o 100) y logs de feedback     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Pipeline de Evaluación por Petición

Cada solicitud de evaluación sigue un ciclo de vida atómico y desechable:

### Paso 1: Sanitización y Norminette
- El backend comprueba que el código no exceda el tamaño máximo permitido (32 KB).
- Se ejecuta la regla de Norminette (verificación de encabezado oficial 42, no uso de `for`/`do-while`/`switch`/`goto`, límites de 80 columnas y 25 líneas).

### Paso 2: Generación del Workspace Temporal
- Se genera un directorio efímero seguro mediante `fs.mkdtemp('/tmp/piscina-run-')`.
- Se escriben los archivos fuente del alumno (ej: `ft_swap.c`, `ft_strcpy.c`).
- Se escribe el archivo de arnés de prueba `main_test.c` correspondiente al reto.
- Si el reto lo requiere, se copian las cabeceras requeridas (`ft_list.h`, `libft.h`, etc.).

### Paso 3: Compilación con Flags 42
El compilador se invoca dentro de la jaula de seguridad:
```bash
gcc -Wall -Wextra -Werror -std=c99 -O0 -g main_test.c ft_submission.c -o test_runner
```
*Si la compilación arroja cualquier advertencia (warning) o error de sintaxis, se aborta inmediatamente con veredicto `COMPILATION_ERROR` (Grade 0).*

### Paso 4: Ejecución con Restricciones de Recursos
El binario resultante se ejecuta bajo un wrapper de aislamiento con límites estrictos:
- **Límite de tiempo CPU (Timeout)**: 2.000 ms.
- **Límite de memoria virtual**: 64 MB.
- **Límite de tamaño de salida**: 256 KB (para evitar ataques de llenado de disco por bucles infinitos con `write`).
- **Red**: Sin acceso a interfaces de red (`--net=none`).
- **Usuario**: Usuario sin privilegios (`piscine:piscine`, UID 10001).

### Paso 5: Limpieza y Retorno
- Se borra el directorio temporal efímero en un bloque `finally`.
- Se analiza el código de salida del ejecutable y la salida JSON o textual del test runner.
- Se responde con el informe detallado al cliente.

---

## 4. Contratos de la API (Especificación REST)

### Endpoint: `POST /api/eval/c-assignment`

#### Request Body
```json
{
  "challenge_id": "reto-c01-ft-swap",
  "assignment_name": "ft_swap",
  "files": [
    {
      "name": "ft_swap.c",
      "content": "/* ************************************************************************** */\n...\nvoid\tft_swap(int *a, int *b)\n{\n\tint tmp;\n\ttmp = *a;\n\t*a = *b;\n\t*b = tmp;\n}\n"
    }
  ],
  "options": {
    "check_norminette": true,
    "check_leaks": false,
    "timeout_ms": 2000
  }
}
```

#### Response Body (Éxito - Grade 100)
```json
{
  "status": "success",
  "grade": 100,
  "passed": true,
  "moulinette_verdict": "OK",
  "execution_time_ms": 42,
  "norminette": {
    "passed": true,
    "errors": []
  },
  "compilation": {
    "success": true,
    "flags": "-Wall -Wextra -Werror -std=c99",
    "output": ""
  },
  "test_results": [
    {
      "test_name": "Test 01: Intercambio de enteros positivos (42, 24)",
      "status": "PASSED",
      "expected": "a=24, b=42",
      "actual": "a=24, b=42",
      "duration_ms": 2
    },
    {
      "test_name": "Test 02: Intercambio con números negativos y cero (-100, 0)",
      "status": "PASSED",
      "expected": "a=0, b=-100",
      "actual": "a=0, b=-100",
      "duration_ms": 1
    }
  ]
}
```

#### Response Body (Fallo - Segmentation Fault / KO)
```json
{
  "status": "failed",
  "grade": 0,
  "passed": false,
  "moulinette_verdict": "CRASH (SIGSEGV)",
  "execution_time_ms": 18,
  "norminette": {
    "passed": true,
    "errors": []
  },
  "compilation": {
    "success": true,
    "flags": "-Wall -Wextra -Werror -std=c99",
    "output": ""
  },
  "error_details": {
    "signal": "SIGSEGV",
    "message": "Fallo de segmentación: acceso inválido a memoria al desreferenciar puntero nulo en el test 3."
  },
  "test_results": [
    {
      "test_name": "Test 01: Caso estándar",
      "status": "PASSED"
    },
    {
      "test_name": "Test 02: Cadena vacía",
      "status": "PASSED"
    },
    {
      "test_name": "Test 03: Puntero NULL",
      "status": "FAILED",
      "error": "Segmentation fault (core dumped)"
    }
  ]
}
```

---

## 5. Medidas de Seguridad y Hardening del Sandbox

La ejecución de código arbitrario C de terceros requiere capas de defensa en profundidad:

1. **Aislamiento de Procesos**:
   - Utilizar herramientas de aislamiento como `nsjail` (Google) o contenedores Docker efímeros (`--read-only`, `--tmpfs /tmp:rw,size=16m,noexec`).
2. **Restricción de Syscalls (Seccomp Profile)**:
   - Bloquear syscalls potencialmente dañinas: `fork` excesivo, `clone`, `socket`, `bind`, `connect`, `ptrace`, `execve` dentro del binario hijo, `kill`, `mount`.
3. **Limpieza de Variables de Entorno**:
   - `PATH` restringido al compilador y librerías básicas; variables sensibles de entorno despojadas del proceso de compilación.
4. **Timeouts a dos niveles**:
   - Timeout a nivel de subproceso (`kill -9` tras 2s).
   - Timeout a nivel de petición HTTP en Express (5s máx).
5. **Control de Concurrencia**:
   - Cola de tareas en memoria o con Redis (`BullMQ`) limitando a $N$ trabajadores simultáneos para no saturar los núcleos de CPU del servidor.

---

## 6. Estructura de Archivos Recomendada para la Futura Implementación

```text
server/
├── index.ts                # Servidor Express y endpoints /api/eval
├── middleware/
│   ├── rateLimiter.ts      # Prevención de abusos y spam
│   └── validatePayload.ts  # Validación Zod del código C recibido
├── services/
│   ├── compiler.ts         # Wrapper gcc (-Wall -Wextra -Werror)
│   ├── norminette.ts       # Analizador sintáctico de la Norma 42
│   ├── runner.ts           # Ejecutor aislado con nsjail / Docker
│   └── testHarnesses/      # Batería de tests predefinidos por reto
│       ├── c00_putchar.c
│       ├── c01_swap.c
│       ├── c02_strcpy.c
│       └── ...
└── config/
    └── sandbox.config.ts   # Límites de CPU, memoria, timeouts y rutas
```

---

## 7. Próximos Pasos (Roadmap)

- [ ] **Fase 1**: Escribir los `main_test.c` (test harnesses) para cada reto del Examshell (`c00` a `c12`).
- [ ] **Fase 2**: Crear el Dockerfile base con `gcc`, `glibc`, `musl-tools` y `nsjail`.
- [ ] **Fase 3**: Implementar los endpoints `/api/eval/c-assignment` y `/api/health` en Express.
- [ ] **Fase 4**: Conectar el frontend `ExamSimulator.tsx` para alternar entre *Modo Offline (Evaluador Estático)* y *Modo Online (Compilación Real Sandbox)*.
