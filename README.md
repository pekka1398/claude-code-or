# Claude-OR

curl -fsSL https://bun.com/install | bash
bun install

bun run build && cp -f dist/claude-or ~/.local/bin/claude-or rehash                                        
               

A fast, unlocked fork of Claude Code optimized for OpenRouter.

> **Credit**: Based on [claude-code-best](https://github.com/claude-code-best/claude-code.git).

---

### ⚡ Quick Start

1. **Prerequisites**: [Bun](https://bun.sh/) must be installed.
2. **Install Dependencies**:
   ```bash

   ```
3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env and fill in your keys
   ```
   Required:
   - `OPENROUTER_API_KEY` — your [OpenRouter](https://openrouter.ai/) API key

   Optional (for Discord bridge):
   - `DISCORD_BOT_TOKEN` — from [Discord Developer Portal](https://discord.com/developers/applications) → New Application → Bot → Copy Token
   - `DISCORD_GUILD_ID` — Discord Settings → Advanced → Developer Mode → right-click server icon → Copy Server ID
   - Bot Permissions needed: Send Messages, Read Message History, Add Reactions, View Channels

   > You can also set these via `export` — env vars take priority over `.env`.
4. **Build & Run**:
   ```bash
      
      # Optional: install to system binary folder
      
      # Run
      
   ```
5. **Discord Bridge** — In the REPL, type `/discord` to connect. Each call creates a new channel with synced history.

---

### 🛠️ Key Features
- **OpenRouter Native**: Seamless model routing with prompt caching support.
- **Voice Mode**: Hold **Space** to record. (Requires `sox` on Linux).
- **Unlocked Features**: `/buddy`, `/summary`, and Session Memory are active.
- **Cost Saving**: Automatic caching headers included. and no usage limitation from Anthropic.
