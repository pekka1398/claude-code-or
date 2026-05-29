#!/usr/bin/env bash
# Interactive test REPL for ai-shell
# Type commands, see what ai-shell returns. Type "exit" to quit.

SHELL="bun run ai-shell/bin/ai-shell.ts"

echo "ai-shell interactive test REPL"
echo "Type a command to see ai-shell's response. Type 'exit' to quit."
echo ""

while true; do
  read -r -p "ai-shell> " cmd
  [[ -z "$cmd" ]] && continue
  [[ "$cmd" == "exit" ]] && break

  set +e
  output=$($SHELL -c "$cmd" 2>&1)
  exit_code=$?
  set -e

  echo "$output"
  echo ""
  echo "(exit code: $exit_code)"
  echo ""
done
