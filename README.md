# Claude-OR

A fast, unlocked fork of Claude Code optimized for OpenRouter.

> **Credit**: Based on [claude-code-best](https://github.com/claude-code-best/claude-code.git).

---

### ⚡ Quick Start

1. **Prerequisites**: [Bun](https://bun.sh/) must be installed.
2. **Install Dependencies**:
   ```bash
   curl -fsSL https://bun.com/install | bash
   bun install
   ```
3. **Configure API Key**:
   ```bash
   export OPENROUTER_API_KEY="your_openrouter_key_here"
   ```
4. **Build & Run**:
   ```bash
   bun run build
   # Optional: install to system binary folder
   sudo mv claude-or /usr/local/bin/claude-or
   # Run
   claude-or
   ```
5. **Discord Bridge** (optional — control Claude Code from your phone):
   ```bash
   export DISCORD_BOT_TOKEN="your_discord_bot_token"
   export DISCORD_GUILD_ID="your_discord_server_id"
   ```
   - **Bot Token**: [Discord Developer Portal](https://discord.com/developers/applications) → New Application → Bot → Copy Token
   - **Guild ID**: Discord Settings → Advanced → Developer Mode → right-click server icon → Copy Server ID
   - **Bot Permissions**: Send Messages, Read Message History, Add Reactions, View Channels
   - In the REPL, type `/discord` to connect. Each call creates a new channel with synced history.

---

### 🛠️ Key Features
- **OpenRouter Native**: Seamless model routing with prompt caching support.
- **Voice Mode**: Hold **Space** to record. (Requires `sox` on Linux).
- **Unlocked Features**: `/buddy`, `/summary`, and Session Memory are active.
- **Cost Saving**: Automatic caching headers included. and no usage limitation from Anthropic.
