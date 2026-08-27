export interface NorminetteIssue {
  type: "error" | "warning" | "ok";
  message: string;
  line?: number;
}

export interface FunctionInfo {
  name: string;
  line: number;
  paramCount: number;
  paramNames: string[];
  lineCount: number;
  declaredVars: Array<{ name: string; line: number }>;
  unusedVars: string[];
}

export interface NorminetteReport {
  isValid: boolean;
  issues: NorminetteIssue[];
  errorCount: number;
  warningCount: number;
  functions: FunctionInfo[];
  functionCount: number;
}

/**
 * Static analyzer for 42 School Norminette v3 rules
 */
export function analyzeNorminette(codeSnippet: string): NorminetteReport {
  const lines = codeSnippet.split("\n");
  const issues: NorminetteIssue[] = [];
  const detectedFunctions: FunctionInfo[] = [];

  if (!codeSnippet || codeSnippet.trim().length === 0) {
    return {
      isValid: false,
      issues: [{ type: "error", message: "El archivo está vacío. Debes escribir código fuente en C." }],
      errorCount: 1,
      warningCount: 0,
      functions: [],
      functionCount: 0
    };
  }

  // Rule 1: 42 Header check
  const hasStandardHeader = codeSnippet.includes("/* ************************************************************************** */");
  if (!hasStandardHeader) {
    issues.push({
      type: "error",
      message: "Falta el encabezado oficial 42 (Standard Header) al inicio del archivo.",
      line: 1
    });
  } else {
    issues.push({
      type: "ok",
      message: "Encabezado 42 detectado correctamente."
    });
  }

  // Known C types for regex matching
  const cTypeRegex = /\b(?:void|int|char|long|short|unsigned|float|double|size_t|ssize_t|t_[a-zA-Z0-9_]+)\b/;

  let inFunction = false;
  let funcLines = 0;
  let currentFuncInfo: FunctionInfo | null = null;
  let functionBodyLines: Array<{ text: string; lineNum: number }> = [];
  let pendingFuncHeader: { name: string; line: number; paramCount: number; paramNames: string[] } | null = null;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    const lineNum = i + 1;

    // Check line width (Norminette max 80 cols)
    if (rawLine.length > 80) {
      issues.push({
        type: "error",
        message: `Línea ${lineNum}: La línea supera los 80 caracteres (${rawLine.length} columnas).`,
        line: lineNum
      });
    }

    // Check forbidden control structures
    if (/\bfor\s*\(/.test(rawLine)) {
      issues.push({
        type: "error",
        message: `Línea ${lineNum}: Uso prohibido del bucle 'for'. En la Norma 42 sólo se permite 'while'.`,
        line: lineNum
      });
    }
    if (/\bdo\s*\{/.test(rawLine) || /\bdo\s*$/.test(line)) {
      issues.push({
        type: "error",
        message: `Línea ${lineNum}: Uso prohibido del bucle 'do-while'. Usa 'while'.`,
        line: lineNum
      });
    }
    if (/\bswitch\s*\(/.test(rawLine)) {
      issues.push({
        type: "error",
        message: `Línea ${lineNum}: Uso prohibido de 'switch'. Usa 'if / else if'.`,
        line: lineNum
      });
    }
    if (/\bgoto\b/.test(rawLine)) {
      issues.push({
        type: "error",
        message: `Línea ${lineNum}: Uso estrictamente prohibido de 'goto'.`,
        line: lineNum
      });
    }
    if (/\bprintf\s*\(/.test(rawLine)) {
      issues.push({
        type: "warning",
        message: `Línea ${lineNum}: 'printf' detectado. En entregas oficiales de la Piscina sólo se permite 'write' (salvo autorización explícita).`,
        line: lineNum
      });
    }

    // Detect function signature when not inside a function
    // Example: void ft_putchar(char c) or static int helper(int a, int b, int c, int d, int e)
    if (!inFunction && braceDepth === 0) {
      // Must not be a prototype ending in ';' or an include/define/comment
      if (!line.endsWith(";") && !line.startsWith("#") && !line.startsWith("/*") && !line.startsWith("*") && !line.startsWith("//")) {
        // Pattern: type [*]name(params)
        const funcMatch = line.match(/(?:[a-zA-Z0-9_]+\s*\*?\s+)+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (funcMatch && cTypeRegex.test(line)) {
          const fnName = funcMatch[1];
          const rawParams = funcMatch[2].trim();

          let paramCount = 0;
          const paramNames: string[] = [];

          if (rawParams && rawParams !== "void") {
            const splitParams = rawParams.split(",");
            paramCount = splitParams.length;
            splitParams.forEach(p => {
              const pClean = p.trim();
              const pNameMatch = pClean.match(/([a-zA-Z0-9_]+)(?:\[\])?$/);
              if (pNameMatch) {
                paramNames.push(pNameMatch[1]);
              }
            });
          }

          pendingFuncHeader = {
            name: fnName,
            line: lineNum,
            paramCount,
            paramNames
          };

          // Check if function has more than 4 parameters (Rule: max 4 parameters)
          if (paramCount > 4) {
            issues.push({
              type: "error",
              message: `Línea ${lineNum}: La función '${fnName}' tiene ${paramCount} parámetros. La Norma 42 prohíbe más de 4 parámetros por función.`,
              line: lineNum
            });
          }
        }
      }
    }

    // Track braces
    const openInLine = (rawLine.match(/{/g) || []).length;
    const closeInLine = (rawLine.match(/}/g) || []).length;

    // Detect start of function body
    if (!inFunction && openInLine > 0 && pendingFuncHeader) {
      inFunction = true;
      funcLines = 0;
      functionBodyLines = [];
      currentFuncInfo = {
        name: pendingFuncHeader.name,
        line: pendingFuncHeader.line,
        paramCount: pendingFuncHeader.paramCount,
        paramNames: pendingFuncHeader.paramNames,
        lineCount: 0,
        declaredVars: [],
        unusedVars: []
      };
      pendingFuncHeader = null;
    }

    if (inFunction) {
      braceDepth += (openInLine - closeInLine);

      // Collect line for variable declaration and usage analysis
      if (line !== "{" && line !== "}") {
        funcLines++;
        functionBodyLines.push({ text: rawLine, lineNum });
      }

      // Check if function ended
      if (braceDepth <= 0) {
        if (currentFuncInfo) {
          currentFuncInfo.lineCount = funcLines;

          // Check function length > 25 lines
          if (funcLines > 25) {
            issues.push({
              type: "error",
              message: `Función '${currentFuncInfo.name}' (Línea ${currentFuncInfo.line}): Supera el límite de 25 líneas (${funcLines} líneas de cuerpo detectadas).`,
              line: currentFuncInfo.line
            });
          }

          // Detect local variable declarations and track unused variables
          // Declarations in 42 C usually look like:
          // int   i;
          // char  *str;
          // t_list *elem;
          const declaredVars: Array<{ name: string; line: number }> = [];
          const declRegex = /^\s*(?:[a-zA-Z0-9_]+\s*\*?\s+)+([a-zA-Z0-9_]+)\s*(?:=\s*[^;]+)?\s*;/;

          // Scan body lines
          for (const bodyItem of functionBodyLines) {
            const trimmed = bodyItem.text.trim();
            // Exclude return, control statements and function calls
            if (
              !trimmed.startsWith("return") &&
              !trimmed.startsWith("if") &&
              !trimmed.startsWith("while") &&
              !trimmed.startsWith("write") &&
              !trimmed.startsWith("//") &&
              cTypeRegex.test(trimmed)
            ) {
              const match = trimmed.match(declRegex);
              if (match) {
                const varName = match[1];
                // Check it's not a known keyword or function call
                if (varName && !["return", "if", "while", "int", "char", "void"].includes(varName)) {
                  declaredVars.push({ name: varName, line: bodyItem.lineNum });
                }
              }
            }
          }

          currentFuncInfo.declaredVars = declaredVars;

          // Check usage of declared variables in the rest of function body
          const unusedList: string[] = [];
          for (const decl of declaredVars) {
            let usageCount = 0;
            const varRegex = new RegExp(`\\b${decl.name}\\b`, "g");

            for (const bodyItem of functionBodyLines) {
              // Count occurrences of var name in lines other than the declaration line
              if (bodyItem.lineNum !== decl.line) {
                const matches = bodyItem.text.match(varRegex);
                if (matches) {
                  usageCount += matches.length;
                }
              } else {
                // If on same line, check if used after '=' (e.g. int i = a + 1;)
                const afterEq = bodyItem.text.split("=")[1];
                if (afterEq && varRegex.test(afterEq)) {
                  usageCount++;
                }
              }
            }

            if (usageCount === 0) {
              unusedList.push(decl.name);
              issues.push({
                type: "warning",
                message: `Línea ${decl.line}: Variable local '${decl.name}' declarada pero no utilizada en '${currentFuncInfo.name}'.`,
                line: decl.line
              });
            }
          }

          currentFuncInfo.unusedVars = unusedList;
          detectedFunctions.push(currentFuncInfo);
        }

        inFunction = false;
        currentFuncInfo = null;
        braceDepth = 0;
      }
    }
  }

  // Max 5 functions per file rule
  const functionCount = detectedFunctions.length;
  if (functionCount > 5) {
    issues.push({
      type: "error",
      message: `Archivo: Contiene ${functionCount} funciones (${detectedFunctions.map(f => f.name).join(", ")}). El límite máximo de la Norma es 5 funciones por fichero.`
    });
  }

  const errorCount = issues.filter(iss => iss.type === "error").length;
  const warningCount = issues.filter(iss => iss.type === "warning").length;
  const isValid = errorCount === 0;

  if (isValid) {
    issues.push({
      type: "ok",
      message: "¡Norme OK! Tu archivo respeta todas las reglas clave de Norminette."
    });
  }

  return {
    isValid,
    issues,
    errorCount,
    warningCount,
    functions: detectedFunctions,
    functionCount
  };
}
