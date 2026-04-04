# Claude Code Best (CCB) 🚀

![GitHub Stars](https://img.shields.io/github/stars/claude-code-best/claude-code) ![GitHub Contributors](https://img.shields.io/github/contributors/claude-code-best/claude-code) ![GitHub Issues](https://img.shields.io/github/issues/claude-code-best/claude-code) ![GitHub License](https://img.shields.io/github/license/claude-code-best/claude-code) ![Last Commit](https://img.shields.io/github/last-commit/claude-code-best/claude-code) ![Bun Discord](https://img.shields.io/discord/820464817551048704)

> **Which Claude do you like? The open source one is the best.**

**牢 A (Anthropic) 官方 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI 工具的源碼反編譯/逆向還原項目。** 
目標是將 Claude Code 大部分功能及工程化能力復現 (問就是老佛爺已經付過錢了)。雖然很難繃, 但是它叫做 CCB (踩踩背)...

---

## 🛠 發展進度表

- [x] **V4** — 測試補全、Buddy 虛擬寵物、Auto Mode、環境變數 Feature 開關
- [x] **V5** — Sentry / GrowthBook 企業監控、自定義 Login、OpenAI 兼容、Web Search、Computer Use / Chrome Use、Voice Mode (語音模式)、Bridge Mode、/dream 記憶整理
- [x] **V6** — **大規模重構石山代碼，全面模組分包（全新分支，main 封存為歷史版本）**
- [x] **V6+ (Fork 特調版)** — **OpenRouter 深度集成、Prompt Cache 命中率解鎖、Gemini-STT 語音轉錄適配。**

---

## � 快速開始 (安裝版)

**不用克隆倉庫, 從 NPM 下載後, 直接使用：**

```bash
bun i -g claude-code-best
bun pm -g trust claude-code-best
ccb # 直接打開 claude code
```

> **國內對 GitHub 網絡較差的，可以設置這個環境變數：**
> `DEFAULT_RELEASE_BASE=https://ghproxy.net/https://github.com/microsoft/ripgrep-prebuilt/releases/download/v15.0.1`

---

## 🏗 快速開始 (源碼版 / 特調編譯版)

如果您想要體驗我們的 **OpenRouter 節省費用 (Prompt Caching)** 以及 **語音聲控** 功能，請克隆後自行編譯：

### 環境要求
- **Bun** >= 1.3.11 (一定要更新啊！`bun upgrade`)
- 常規的配置 CC 的方式, 各大提供商都有自己的配置方式 (我們已內建 OpenRouter 支援)。

### 編譯您的 `claude-or`
```bash
bun install
bun build src/entrypoints/cli.tsx --compile --outfile claude-or
sudo mv claude-or /usr/local/bin/
```

### 必備環境變數
```bash
export OPENROUTER_API_KEY=您的Key
# 如果要啟用專屬紀錄
export DISABLE_OPENROUTER_LOG=false
```

---

## ✨ 本分支特點 (Enhanced Features)

1. **Prompt Cache 全面啟動**：修正了原本非原廠 API 會關閉快取的 BUG。在 OpenRouter (Bedrock/Vertex) 上可節省 10x 的費用。
2. **語音即時輸入**：按住 **Space** 錄音，透過 Gemini 3 Flash 在 1 秒內回傳轉錄結果。
3. **Buddy 寵物解禁**：`/buddy` 隨時待命。
4. **低延遲串流**：開啟 `eager_input_streaming`，體感速度媲美原廠。

---

## ⚖️ 許可證
本項目僅供學習研究用途。Claude Code 的所有權利歸 Anthropic 所有。 
如果您想要私人諮詢服務，可以發送郵件到 `claude-code-best@proton.me`，備註諮詢與聯繫方式即可。
由於後續工作非常多, 可能會忽略郵件, 半天沒回復, 可以多發。
