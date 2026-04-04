# 🚀 Claude-OR: The Unlocked Power of Claude Code

A high-performance, fully-unlocked fork of [Claude Code CLI](https://docs.anthropic-ai.com/en/docs/claude-code), specifically optimized for **OpenRouter**, **Gemini-STT**, and cost efficiency.

> **Credit**: This project is built upon the excellent reverse-engineering work of [claude-code-best/claude-code](https://github.com/claude-code-best/claude-code.git).

---

## ✨ Key Enhancements in This Fork

### 🌐 Native OpenRouter Integration
- **Universal Provider**: Seamlessly route all requests through [OpenRouter](https://openrouter.ai/).
- **Model Freedom**: Use `Claude 3.5 Sonnet`, `Opus`, `Gemini 3 Flash`, or any compatible model by setting `CLAUDE_CODE_MODEL`.
- **Intelligent Mapping**: Automatic translation of canonical model names to OpenRouter identifiers.

### 💰 Cost Optimization (Prompt Caching)
- **1st Party Status Spoofing**: Forces the CLI to treat OpenRouter as a first-party provider.
- **Active Caching Headers**: Injects `anthropic-beta: prompt-caching-2024-07-31` and `cache_control` tags.
- **Save up to 90%**: Full support for prompt caching hits on compatible backends (Bedrock, Vertex, etc.).

### 🎙️ Voice Mode (STT) Reconstruction
- **Push-to-Talk**: Hold **Space** to record your voice directly in the terminal.
- **Gemini-Powered STT**: Fast, accurate transcription using `Gemini 3 Flash` via OpenRouter.
- **Low Latency**: Optimized PCM-to-WAV bridge for instant processing.

### 🐧 Unlocked Premium Features
- **Claude Buddy**: The virtual pet companion is now fully enabled. Use `/buddy` to summon your deterministic companion!
- **Session Memory**: Advanced context summarization enabled. Use `/summary` to get a condensed view of long conversations.
- **Work Memory**: Enhanced session storage management for persistent context across restarts.

---

## 🛠️ Quick Start

### 1. Requirements
- [Bun](https://bun.sh/) >= 1.4.0 (Recommended)
- `sox` and `alsa-utils` (For Linux voice recording)
- An OpenRouter API Key.

### 2. Installation
```bash
git clone https://github.com/YOUR_USERNAME/claude-code-or.git
cd claude-code-or
bun install
```

### 3. Setup Environment
Create a `.env` or export variables:
```bash
export OPENROUTER_API_KEY="your_api_key_here"
# Optional: Choose your primary model
export CLAUDE_CODE_MODEL="anthropic/claude-3.5-sonnet"
```

### 4. Build & Run
```bash
# Build the standalone binary
bun run build

# Run directly
./claude-or
```

---

## 🏗️ Status Checklist

| Feature | Status | Description |
| :--- | :---: | :--- |
| **OpenRouter Support** | ✅ | Native bridge with error handling |
| **Prompt Caching** | ✅ | First-party header injection enabled |
| **Voice Mode (STT)** | ✅ | Gemini 3 Flash bridge via OpenRouter |
| **Buddy Pet** | ✅ | UI and logic fully activated |
| **Session Memory** | ✅ | Manual/Auto summarization bridge |
| **Multi-Project Resume** | ⚠️ | Use `/resume` and press `a` to see all projects |

---

## 📜 Usage Tips

- **Voice Command**: Ensure your microphone is calibrated. Hold `Space` until you finish speaking.
- **Budgeting**: Use the `/cost` command to see the current session's estimated usage.
- **Virtual Pet**: Your Buddy's appearance is deterministic based on your user ID. Can you find them all?

## ⚖️ License & Disclaimer

This project is for educational and research purposes only. **Claude Code** is a product of [Anthropic](https://www.anthropic.com/). All rights reserved by the original authors.

Special thanks to the original deobfuscation efforts that made this bridge possible.
