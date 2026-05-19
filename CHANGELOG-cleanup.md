# 工作紀錄 — 模塊清理 & Auth 簡化

日期：2026-05-19

---

## 1. 刪除模塊目錄

### src/buddy/ (6 files, -1298 lines)
- `CompanionSprite.tsx`, `companion.ts`, `prompt.ts`, `sprites.ts`, `types.ts`, `useBuddyNotification.tsx`
- 原因：純裝飾性小精靈動畫

### src/voice/ (1 file, -39 lines)
- `voiceModeEnabled.ts`
- 原因：語音模式已移除

### src/daemon/ (2 files, -6 lines)
- `main.ts`, `workerRegistry.ts`
- 原因：全是 no-op stub，daemon-worker 分支在 cli.tsx 已刪

### src/jobs/ (1 file, -3 lines)
- `classifier.ts`
- 原因：no-op stub，query.ts 的 import 已刪

### src/ssh/ (2 files, -59 lines)
- `createSSHSession.ts`, `SSHSessionManager.ts`
- 原因：stub 直接 throw，SSH session 功能不使用

### src/proactive/ (1 file, -6 lines)
- `index.ts`
- 原因：所有 export 返回 false/no-op，feature flag 永遠關閉

### src/coordinator/ (2 files, -373 lines)
- `coordinatorMode.ts`, `workerAgent.ts`
- 原因：COORDINATOR_MODE feature flag 永遠 false

### src/plugins/ (2 files, -182 lines)
- `builtinPlugins.ts`, `bundled/index.ts`
- 原因：registry 為空，initBuiltinPlugins 是 no-op
- 注意：`utils/plugins/` 和 `services/plugins/` 保留，因為 plugin 系統核心還在使用

### src/server/ (11 files, -404 lines)
- `backends/dangerousBackend.ts`, `connectHeadless.ts`, `createDirectConnectSession.ts`, `directConnectManager.ts`, `lockfile.ts`, `parseConnectUrl.ts`, `server.ts`, `serverBanner.ts`, `serverLog.ts`, `sessionManager.ts`, `types.ts`
- 原因：local server / direct connect / headless connect 不使用

### src/vim/ (5 files, -1513 lines)
- `motions.ts`, `operators.ts`, `textObjects.ts`, `transitions.ts`, `types.ts`
- 原因：vim 模式移除

### .github/
- `workflows/ci.yml`
- 原因：不跑 CI

### .githooks/
- `pre-commit`
- 原因：未配置使用

---

## 2. 刪除命令目錄

### src/commands/buddy/ (1 file, -38 lines)
### src/commands/voice/ (2 files, -149 lines)
### src/commands/login/ (2 files, -117 lines)
- `index.ts`, `login.tsx`
- 原因：OpenRouter 不需要 Anthropic OAuth login

### src/commands/logout/ (2 files, -91 lines)
- `index.ts`, `logout.tsx`
- 原因：同上

### src/commands/upgrade/ (2 files, -53 lines)
- `index.ts`, `upgrade.tsx`
- 原因：訂閱升級不適用

### src/commands/extra-usage/ (4 files, -181 lines)
- `extra-usage-core.ts`, `extra-usage-noninteractive.ts`, `extra-usage.tsx`, `index.ts`
- 原因：訂閱超額付費不適用

### src/commands/rate-limit-options/ (2 files, -228 lines)
- `index.ts`, `rate-limit-options.tsx`
- 原因：訂閱速率限制選項不適用

### src/commands/remote-env/ (2 files, -21 lines)
- `index.ts`, `remote-env.tsx`
- 原因：遠端環境不使用

---

## 3. 刪除 hooks

### src/hooks/useSSHSession.ts (-241 lines)
### src/hooks/useVimInput.ts (-316 lines)
### src/hooks/useDirectConnect.ts (-229 lines)

---

## 4. 刪除組件

### src/components/VimTextInput.tsx (-139 lines)
### src/components/LogoV2/VoiceModeNotice.tsx (-67 lines)

---

## 5. Auth 簡化

### src/utils/auth.ts — 重寫 (2003 → ~200 lines)
- 刪除：OAuth token 管理、訂閱檢查、AWS/GCP credential refresh、macOS Keychain、apiKeyHelper、lockfile 跨進程 token 刷新
- 保留：`getAnthropicApiKey()` (讀 ANTHROPIC_AUTH_TOKEN / ANTHROPIC_API_KEY)、`getAuthTokenSource()`、`getAnthropicApiKeyWithSource()`
- 所有訂閱函數 stub：`isClaudeAISubscriber()` → false, `getSubscriptionType()` → null, `hasOpusAccess()` → true 等

### src/services/oauth/ — 替換為 stub
- `types.ts` — 保留 SubscriptionType, OAuthTokens 類型
- `client.ts` — 所有函數返回 false/null/Promise.reject
- `index.ts` — OAuthService.startOAuthFlow throws
- `getOauthProfile.ts` — 返回 null
- `auth-code-listener.ts` — 返回空 listener
- `crypto.ts` — 空

### src/components/ConsoleOAuthFlow.tsx — 替換為 stub
- 顯示 "Set OPENROUTER_API_KEY in your .env file"

### src/utils/authFileDescriptor.ts — 重寫為 stub
- `getOAuthTokenFromFileDescriptor()` → null, `getApiKeyFromFileDescriptor()` → null

### src/utils/authPortable.ts — 重寫為 stub
- 保留 `normalizeApiKeyForConfig()` (仍被引用)

### src/utils/aws.ts — 重寫為 stub
- `checkStsCallerIdentity()`, `clearAwsIniCache()`, `isValidAwsStsOutput()`, `isAwsCredentialsProviderError()` → false/resolve

### src/utils/awsAuthStatusManager.ts — 重寫為 stub
- 保留 class interface，所有方法 no-op

### src/utils/secureStorage/ — 重寫為 stub
- `index.ts` — in-memory storage (plugin 系統仍需)
- `macOsKeychainStorage.ts` — `isMacOsKeychainLocked()` → false
- `macOsKeychainHelpers.ts` — stub
- `keychainPrefetch.ts` — no-op
- `fallbackStorage.ts`, `plainTextStorage.ts` — re-export index
- 刪除 `src/constants/oauth.ts` 子目錄

---

## 6. 接口清理（修改的文件）

### src/main.tsx
- 刪 `import { ensureKeychainPrefetchCompleted, startKeychainPrefetch }` + 調用
- 刪 `await ensureKeychainPrefetchCompleted()` → 只留 `await ensureMdmSettingsLoaded()`
- 刪大量 daemon/ssh/server/coordinator/proactive/buddy/voice 相關分支和 import

### src/commands.ts
- 刪 `import login/logout/remoteEnv/upgrade/extraUsage/rateLimitOptions`
- 刪命令陣列中的對應條目
- 刪 `...(!isUsing3PServices() ? [logout, login()] : [])`

### src/entrypoints/cli.tsx
- 刪 daemon-worker 和 daemon 分支

### src/screens/REPL.tsx
- 刪 voice integration, vim mode, SSH session, direct connect, buddy 相關 props 和邏輯

### src/QueryEngine.ts
- 刪 coordinator conditional import (`feature('COORDINATOR_MODE')` block)

### src/tools/AgentTool/AgentTool.tsx
- 刪 `import { isCoordinatorMode }`, 替換 `isCoordinatorMode()` → `false`

### src/tools/AgentTool/resumeAgent.ts
- 同上

### src/tools/AgentTool/forkSubagent.ts
- 同上

### src/components/tasks/BackgroundTasksDialog.tsx
- 同上

### src/cli/print.ts
- 刪 coordinator/proactive conditional import 和使用

### src/hooks/useVoiceEnabled.ts — 簡化
### src/hooks/useCanUseTool.tsx — coordinatorHandler import 保留（檔案還在）

### src/components/PromptInput/PromptInput.tsx — 刪 voice/vim 引用
### src/components/PromptInput/PromptInputFooterLeftSide.tsx — 刪 buddy/proactive 引用
### src/components/PromptInput/Notifications.tsx — 刪 buddy 引用
### src/components/LogoV2/LogoV2.tsx — 刪 voice mode 引用
### src/components/messages/RateLimitMessage.tsx — `extraUsage` import → null
### src/components/Settings/Usage.tsx — `extraUsageCommand` import → null
### src/state/AppStateStore.ts — 刪 buddy 相關 state
### src/services/plugins/pluginOperations.ts — 刪 builtinPlugins import
### src/utils/plugins/pluginLoader.ts — 刪 builtinPlugins import
### src/utils/attachments.ts — 刪 voice 相關
### src/utils/messages.ts — 刪 voice 相關
### src/utils/config.ts — 刪 buddy 相關
### src/tools/ConfigTool/prompt.ts — 刪 buddy 提示
### src/types/global.d.ts — 刪 buddy/voice 類型
### src/components/messages/nullRenderingAttachments.ts — 刪 buddy 引用

---

# 第二輪 — Model & 計費簡化

## 7. modelCost.ts — 重寫（231 → ~160 lines）

- 刪掉所有硬編碼 Anthropic 定價（COST_TIER_3_15, COST_TIER_15_75, COST_HAIKU_35 等）
- 改從 `~/.claude-code-or/config.json` 讀定價，取最高優先級 provider 的 pricing
- `getModelCosts()` 先查 config.json，找不到 fallback $5/$25 per Mtok
- `getModelCostsFromConfig()` — 新函數，讀 config.json 返回 ModelCosts
- 保留 `calculateUSDCost()`, `calculateCostFromTokens()` 接口不變
- 原因：OpenRouter 的每個 model 定價不同，硬編碼只覆蓋 Anthropic 模型，非 Anthropic 模型全 fallback 到錯的價格

## 8. billing.ts — 重寫（78 → ~20 lines）

- `hasConsoleBillingAccess()` → 只要有 API key 就 return true（原本要檢查 org role / subscription）
- `hasClaudeAiBillingAccess()` → 永遠 false
- 原因：原本 OpenRouter 用戶永遠 false，導致 costHook 退出時的費用摘要被擋住不顯示

## 9. /model 命令 — 簡化（src/commands/model/model.tsx, 297 → ~90 lines）

- 刪掉 ModelPickerWrapper（彈出式選擇器 UI）
- `/model <名字>` 直接設模型，`/model` 顯示當前模型
- 不再做 1M context access check、extra usage billing check、fast mode toggle
- 保留 `validateModel()` 驗證和 `isModelAllowed()` allowlist 檢查
- 原因：OpenRouter 沒有訂閱分級，不需要選擇器，直接打名字就好

---

## 10. src/services/api/client.ts — 重寫（418 → ~200 lines）

- 刪 Bedrock 客戶端路徑（`@anthropic-ai/bedrock-sdk`, AWS credential refresh）
- 刪 Foundry 客戶端路徑（`@anthropic-ai/foundry-sdk`, Azure AD auth）
- 刪 Vertex 客戶端路徑（`@anthropic-ai/vertex-sdk`, google-auth-library, GCP credential refresh）
- 刪 `refreshAndGetAwsCredentials()`, `refreshGcpCredentialsIfNeeded()` import
- 刪 `getAWSRegion()`, `getVertexRegionForModel()` import
- 保留：直接 Anthropic / OpenRouter 客戶端、`configureApiKeyHeaders()`、`buildFetch()`（含 OpenRouter API logging）
- 原因：只走 OpenRouter，不需要 AWS/GCP/Azure 客戶端

## 11. src/utils/model/modelOptions.ts — 重寫（560 → ~230 lines）

- 刪 5 個訂閱分支（ant / Max+TeamPremium / Pro+TeamStd+Enterprise / PAYG 1P / PAYG 3P）
- 只保留 PAYG 3P 路徑
- 刪 `isClaudeAISubscriber()`, `isMaxSubscriber()`, `isTeamPremiumSubscriber()` import
- 刪 `checkOpus1mAccess()`, `checkSonnet1mAccess()`, `isOpus1mMergeEnabled()`, `getOpus46PricingSuffix()` 等
- 新增：從 `~/.claude-code-or/config.json` 讀取可用模型列表和定價
- `getModelOptions()` 自動把 config.json 裡的模型加入選項
- 原因：OpenRouter 沒有訂閱分級，只需一條路徑

---

## 累計

- 第一輪：111 files, +380 -11267
- 第二輪：3 files, +197 -490
- 第三輪：2 files, +107 -659
