#!/usr/bin/env bun
/**
 * ai-shell — A shell wrapper for AI agents.
 *
 * Interface: identical to bash -c "command"
 * - ai-shell -c "command string"
 * - ai-shell -l -c "command string"  (login shell mode, -l is accepted but ignored)
 *
 * Dispatch:
 *   1. Builtin commands (fedit, etc.) → handled internally
 *   2. Blacklisted commands → refuse with Cargo-style diagnostic
 *   3. Interactive commands → refuse with suggestion
 *   4. Everything else → forward to /bin/bash
 *   5. Output → strip ANSI → return
 */

import { main } from "../src/main.ts"

const args = process.argv.slice(2)

// Parse -l (login shell flag, we accept and ignore it)
let loginMode = false
let commandIndex = -1

for (let i = 0; i < args.length; i++) {
  if (args[i] === "-l") {
    loginMode = true
  } else if (args[i] === "-c") {
    commandIndex = i + 1
    break
  }
}

if (commandIndex === -1 || commandIndex >= args.length) {
  process.stderr.write("ai-shell: usage: ai-shell [-l] -c command\n")
  process.exit(2)
}

const command = args[commandIndex]

main(command, { loginMode })
