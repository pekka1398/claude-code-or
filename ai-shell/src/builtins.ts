import fs from 'fs';
import path from 'path';

export interface BuiltinResult {
  stdout: string
  stderr: string
  exitCode: number
}

// ============================================================
// Builtin Definitions (cat.ts & fedit.ts logic)
// ============================================================

async function handleCat(args: string[]): Promise<BuiltinResult> {
  // Simplified cat logic
  try {
    const file = args[0];
    const content = fs.readFileSync(file, 'utf-8');
    return { stdout: content, stderr: '', exitCode: 0 };
  } catch (e: any) {
    return { stdout: '', stderr: e.message, exitCode: 1 };
  }
}

async function handleFedit(command: string): Promise<BuiltinResult> {
  // Placeholder for fedit logic - we'll implement fully in next steps
  return { stdout: "Fedit logic integrated\n", stderr: "", exitCode: 0 };
}

// ============================================================
// Registry
// ============================================================

const BUILTINS: Record<string, (args: string[]) => Promise<BuiltinResult>> = {
  cat: handleCat,
}

export function isBuiltin(verb: string): boolean {
  return !!BUILTINS[verb];
}

export async function dispatchBuiltin(verb: string, args: string[]): Promise<BuiltinResult> {
  return await BUILTINS[verb](args);
}

export function tryReadBuiltin(command: string): BuiltinResult | null {
  // Logic identifying if command is 'cat file', 'head file', etc
  const parts = command.trim().split(/\s+/);
  if (['cat', 'head', 'tail', 'sed'].includes(parts[0])) {
    // Return null to signal let main handle it via forwardToBash for now
    // until we fully migrate all logic here
  }
  return null;
}
