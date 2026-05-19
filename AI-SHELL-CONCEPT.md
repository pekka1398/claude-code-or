# AI Shell — Concept Note

Date: 2026-05-19

## Core Idea

Replace the traditional "tool use" paradigm (JSON schema, structured parameters)
with a **smart shell** that AI agents interact with via CLI commands.

Instead of:

```
Tool: Read
Input: { "file_path": "/src/main.ts", "offset": 10, "limit": 20 }
```

The model just types:

```
sed -n '10,20p' /src/main.ts
```

And behind the scenes, we parse, validate, dedup, and enrich — the model
never knows it's not talking to a real shell.

## Why

1. **Zero learning cost** — Every LLM already knows bash/sed/cat/jq from
   training data. No need to learn proprietary JSON schemas per tool.

2. **Unified across agents** — Claude Code, OpenClaw, Codex, Cursor — if they
   all speak the same shell, model performance becomes model-capability-dependent,
   not tool-schema-dependent.

3. **Post-training is trivial** — Bash instruction data is everywhere. No need
   to synthetically generate "tool use" training data per tool.

4. **Error messages are natural** — CLI tools already know how to explain
   what went wrong. Models can read the error and fix it in one step.

5. **`--help` is built-in documentation** — Models can self-serve. No need
   to bloat the system prompt with tool descriptions.

6. **Harmonizes with the ecosystem** — pip, apt, docker, curl, jq, ripgrep,
   every SaaS CLI — all already speak the same language.

## Built-in Commands (not real bash, parsed by us)

| Command | What it does (really) |
|---------|----------------------|
| `cat <path>` | Read file with dedup, size check, strip dangerous tags |
| `sed -n 'N,Mp' <path>` | Read line range, same smart processing |
| `head -N <path>` | Read first N lines |
| `readimage <path>` | Convert to base64 image block for multimodal |
| `readpdf [--pages 1-5] <path>` | PDF → JPG → base64 image blocks |
| `<anything else>` | Fallback to real bash |

## Smart Features (invisible to the model)

- **Dedup**: Same file + same range + unchanged mtime → return stub
  ("File unchanged, content already in context above")
- **ENOET with suggestions**: `no such file: foo.py (did you mean foo.tsx?)`
- **Size limits / truncation**: Large output gets truncated with a note
- **Tag stripping**: `<thinking>`, `<system-reminder>`, etc. removed before
  returning to model
- **`--dry-run`**: Preview what a destructive command would do
- **`--help`**: Self-documenting for any built-in command
- **Exit codes**: Structured success/failure the model can reason about

## Multimodal

Images and PDFs aren't "text output" — they're base64 blocks sent as
image content to the model. But the interface is still a CLI command:

```
readimage screenshot.png          →  base64 image block
readpdf --pages 1-3 report.pdf   →  3x base64 image blocks
readimage -help                   →  usage info
```

## Relationship to Claude Code (this repo)

This would be a **separate project**. Claude Code's current tool system
(Read, Edit, Write, Bash, etc.) would eventually be replaced by calling
into this AI shell as the single tool interface.

Steps:
1. Prototype AI shell as standalone
2. Wire it into Claude Code as a Bash replacement
3. Remove Read/Edit/Write tools (their logic moves into the shell)
4. Remove Skill system (everything is a CLI keyword)

## Open Questions

- How to handle Edit/Write operations? `sed -i`? `patch`? New `writefile` command?
- How to handle tool permissions? Same as bash — ask before destructive ops?
- MCP integration — MCP servers expose tools, can we wrap them as CLI commands?
- How much of real bash do we need to support? (pipes? redirects? subshells?)
