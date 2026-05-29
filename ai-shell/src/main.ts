/**
 * Main dispatch logic.
 *
 * Flow:
 *   command string
 *     → parse first word (the "verb")
 *     → builtin? → handle internally (fedit, etc.)
 *     → read builtin? → smart cat/sed/head/tail
 *     → blacklisted? → refuse with Cargo-style diagnostic
 *     → interactive? → refuse with suggestion
 *     → param auto-injection
 *     → forward to /bin/bash -c
 *     → strip ANSI from output
 *     → command-not-found diagnostic (exit 127)
 *     → output size truncation
 *     → exit with same code
 */

import { dispatchBuiltin, isBuiltin, tryReadBuiltin } from "./builtins/index.ts"
import { checkBlacklist, type BlacklistResult } from "./safety/blacklist.ts"
import { checkInteractive, type InteractiveResult } from "./safety/interactive.ts"
import { stripAnsi } from "./output/stripAnsi.ts"
import { forwardToBash, type ForwardResult } from "./forward.ts"

const MAX_OUTPUT_BYTES = 2 * 1024 * 1024 // 2MB — prevent context explosion

export interface MainOptions {
  loginMode: boolean
}

export async function main(command: string, _options: MainOptions): Promise<void> {
  const verb = extractVerb(command)

  // 1. Direct builtins (fedit, etc.)
  if (isBuiltin(verb)) {
    const result = await dispatchBuiltin(verb, command)
    process.stdout.write(result.stdout)
    if (result.stderr) process.stderr.write(result.stderr)
    process.exit(result.exitCode)
  }

  // 2. Smart read builtins (cat/sed/head/tail on single file)
  const readResult = tryReadBuiltin(command)
  if (readResult) {
    process.stdout.write(readResult.stdout)
    if (readResult.stderr) process.stderr.write(readResult.stderr)
    process.exit(readResult.exitCode)
  }

  // 3. Blacklisted commands
  const blacklistResult = checkBlacklist(command)
  if (blacklistResult.blocked) {
    process.stderr.write(formatDiagnostic(blacklistResult))
    process.exit(1)
  }

  // 4. Interactive command detection
  const interactiveResult = checkInteractive(command)
  if (interactiveResult.blocked) {
    process.stderr.write(formatDiagnostic(interactiveResult))
    process.exit(1)
  }

  // 5. Param auto-injection
  const injectedCommand = autoInject(command)

  // 6. Forward to real bash
  const result = forwardToBash(injectedCommand)

  // 7. Strip ANSI from output
  const cleanStdout = stripAnsi(result.stdout)
  const cleanStderr = stripAnsi(result.stderr)

  // 8. Command-not-found diagnostic
  if (result.exitCode === 127) {
    process.stderr.write(formatCommandNotFound(verb, cleanStderr))
    process.exit(127)
  }

  // 9. Output size truncation
  const { stdout: finalStdout, stderr: truncationWarning } = truncateOutput(cleanStdout, verb)

  process.stdout.write(finalStdout)
  if (cleanStderr) process.stderr.write(cleanStderr)
  if (truncationWarning) process.stderr.write(truncationWarning)
  process.exit(result.exitCode)
}

// ============================================================
// Helpers
// ============================================================

function extractVerb(command: string): string {
  const trimmed = command.trimStart()
  const match = trimmed.match(/^(\S+)/)
  return match ? match[1] : ""
}

function formatDiagnostic(result: BlacklistResult | InteractiveResult): string {
  const lines: string[] = []
  lines.push(`error[${result.code}]: ${result.title}`)
  if (result.location) {
    lines.push(`  --> ${result.location}`)
  }
  lines.push("")
  if (result.detail) {
    lines.push(`   = detail: ${result.detail}`)
  }
  if (result.suggestion) {
    lines.push(`   = suggestion: ${result.suggestion}`)
  }
  lines.push("")
  return lines.join("\n")
}

function formatCommandNotFound(verb: string, rawStderr: string): string {
  return `error[E0001]: Command Not Found\n  --> ${verb}\n\n   = detail: the command '${verb}' does not exist in PATH\n   = suggestion: check for typos, or install the required package\n\n${rawStderr}`
}

// ============================================================
// Param auto-injection
// ============================================================

function autoInject(command: string): string {
  // apt install/update/upgrade → add -y and DEBIAN_FRONTEND=noninteractive
  let result = command.replace(
    /^(sudo\s+)?(apt(?:-get)?)\s+(install|update|upgrade|remove|dist-upgrade)\b/,
    (match, sudo, apt, action) => {
      // Already has -y or --yes? Don't double-inject
      if (/\s(-y|--yes)\b/.test(command)) return match
      const prefix = sudo ? sudo : ""
      return `${prefix}DEBIAN_FRONTEND=noninteractive ${apt} ${action} -y`
    }
  )

  return result
}

// ============================================================
// Output truncation
// ============================================================

function truncateOutput(stdout: string, verb: string): { stdout: string; stderr: string } {
  const bytes = Buffer.byteLength(stdout, "utf-8")
  if (bytes <= MAX_OUTPUT_BYTES) {
    return { stdout, stderr: "" }
  }

  // Truncate to MAX_OUTPUT_BYTES, don't split mid-character
  const truncated = Buffer.from(stdout, "utf-8").subarray(0, MAX_OUTPUT_BYTES).toString("utf-8")
  const warning = `warning: output truncated at ${MAX_OUTPUT_BYTES / 1024 / 1024}MB (original ${(bytes / 1024 / 1024).toFixed(1)}MB). Pipe through head or use redirection to limit output.\n`

  return {
    stdout: truncated + "\n... (truncated)\n",
    stderr: warning,
  }
}
// ============================================================
// Migrated Logic (forwarding, output, safety)
// ============================================================

// Original safety/blacklist.ts
export function checkBlacklist(command: string) {
    const blocked = /\b(rm|mkfs|dd)\b/.test(command);
    return { blocked, code: "E002", title: "Blacklisted command", detail: "Dangerous command detected" };
}

// Original safety/interactive.ts
export function checkInteractive(command: string) {
    const blocked = /\b(vi|vim|nano|ssh)\b/.test(command);
    return { blocked, code: "E003", title: "Interactive command", detail: "Interactive shell not supported" };
}

// Original output/stripAnsi.ts
export function stripAnsi(str: string): string {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

// Original forward.ts
export const forwardToBash = (command: string) => {
    const { spawnSync } = require('child_process');
    const proc = spawnSync('/bin/bash', ['-c', command], {
        env: { ...process.env, NO_COLOR: '1', TERM: 'dumb' }
    });
    return { 
        stdout: proc.stdout?.toString() ?? '', 
        stderr: proc.stderr?.toString() ?? '', 
        exitCode: proc.status ?? 1 
    };
};
