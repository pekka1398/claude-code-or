[BUG] Prompt cache partial miss on every --resume turn — skill_listing block missing from messages[0] #44045
Open
Open
[BUG] Prompt cache partial miss on every --resume turn — skill_listing block missing from messages[0]
#44045
@bilby91
Description
bilby91
opened 2 weeks ago
Preflight Checklist

I have searched existing issues and this hasn't been reported yet

This is a single bug report

I am using the latest version of Claude Code
What's Wrong?
When using the SDK's query() with resume, every resume turn causes a partial prompt cache miss. The first user message sent to the Anthropic API (messages[0]) has different content blocks on a fresh session vs a resumed one.

We captured the raw /v1/messages request bodies with mitmproxy and compared them:

Fresh session — messages[0] has 5 content blocks:

[0] len=906   <system-reminder> deferred tools listing
[1] len=532   <system-reminder> companion intro
[2] len=3924  <system-reminder> skills listing
[3] len=9207  <system-reminder> user context (claudeMd, currentDate)
[4] len=32    user prompt (with cache_control)
Resume — messages[0] has 4 content blocks:

[0] len=906   <system-reminder> deferred tools listing
[1] len=533   <system-reminder> companion intro  (+1 byte, trailing \n)
[2] len=9207  <system-reminder> user context
[3] len=32    user prompt
The skills listing block (~3,924 chars) is absent from messages[0] on resume. It appears deeper in the conversation (messages[2]), at its historical position from the original transcript rather than at the head where it belongs.

This causes the API prompt cache prefix to differ on every resume turn — only the system prompt caches; the messages array is rebuilt.

Measured Impact
SDK query() with @anthropic-ai/claude-agent-sdk 0.2.92 (CLI 2.1.92):

Turn 1 (fresh):  cache_read=0      cache_create=12,528  (cold start, expected)
Turn 2 (resume): cache_read=8,760  cache_create=3,790   (partial miss)
Turn 3 (resume): cache_read=8,760  cache_create=3,810   (same partial miss)
The ~3,800 tokens of cache_create on resume closely matches the ~3,924 char skills listing block. For multi-turn agent sessions with frequent user interaction, this waste compounds on every turn.

What Should Happen?
messages[0] should have identical content blocks on both fresh and resume sessions so the prompt cache prefix is consistent across turns.

Secondary Issue
The companion intro block has a 1-byte serialization difference between fresh (532 bytes) and resume (533 bytes, extra trailing \n). This doesn't currently break caching but is a latent risk.

Reproduction
Use the SDK's query() to start a fresh session with a simple prompt
Call query() again with resume: sessionId
Capture both /v1/messages requests via mitmproxy
Compare messages[0].content block count and lengths between the two requests
Related Issues
[BUG] Prompt cache regression in --print --resume since v2.1.69(?): cache_read never grows, ~20x cost increase #34629 — --resume prompt cache regression (same class of bug, reported for deferred_tools_delta)
[BUG] Prompt caching is disabled for SDK query() and V2 sessions — only enabled for REPL #39732 — Prompt caching gaps in SDK query() sessions
[BUG] Conversation history invalidated on subsequent turns #40524 — Sentinel replacement breaks cache
The fix for #34629 appears to have resolved the deferred_tools_delta case, but the same structural problem survives for the skills listing.

Environment
@anthropic-ai/claude-agent-sdk: 0.2.92
Claude Code CLI: 2.1.92 (bundled in SDK)
OS: macOS (Darwin 25.3.0, arm64)
Activity

github-actions
added 
bug
Something isn't working
 
area:agent-sdk
 
has repro
Has detailed reproduction steps
 
platform:macos
Issue specifically occurs on macOS
 
performance
 2 weeks ago
github-actions
github-actions commented 2 weeks ago
github-actions
bot
2 weeks ago – with GitHub Actions
Found 2 possible duplicate issues:

[BUG] Resume/continue cache invalidation #43657
Regression: SessionStart hook and skills listing re-injected on every --resume (fixed in v2.1.69/v2.1.70, broken again in v2.1.74) #34039
This issue will be automatically closed as a duplicate in 3 days.

If your issue is a duplicate, please close it and 👍 the existing issue instead
To prevent auto-closure, add a comment or 👎 this comment
🤖 Generated with Claude Code

bilby91
bilby91 commented 2 weeks ago
bilby91
2 weeks ago
Author
After more testing with production-like SDK options (systemPrompt, settingSources), the problem extends beyond skill_listing. Other system-reminder blocks — deferred tools listing and companion intro — are also affected.

Using mitmproxy to capture /v1/messages across a 3-turn session with tool calls (5 total API calls), here's what messages[0] looks like:

Without fix:

API call 1 (turn 1):         msg[0] = 5 blocks  [deferred_tools, companion, skills, context, prompt]
API call 2 (turn 1):         msg[0] = 5 blocks  [deferred_tools, companion, skills, context, prompt]
API call 3 (turn 2, resume): msg[0] = 3 blocks  [skills, context, prompt]  ← deferred_tools + companion missing
API call 4 (turn 2):         msg[0] = 3 blocks  [skills, context, prompt]
API call 5 (turn 3, resume): msg[0] = 3 blocks  [skills, context, prompt]
The messages[0] prefix changes from 5 blocks to 3 blocks at the first resume, breaking the cache. The missing blocks appear deeper in the conversation history instead of at the head.

Note: this only reproduces when using SDK query() with systemPrompt and settingSources options — a minimal test without these won't trigger it.


cnighswonger
mentioned this 2 weeks ago
[BUG] Conversation history invalidated on subsequent turns #40524

github-actions
mentioned this 2 weeks ago
Subagent cache miss on first SendMessage resume (cache_read=0) #44724

wpank
mentioned this in 2 issues last week
[MODEL] Claude Code is unusable for complex engineering tasks with the Feb updates #42796
accidental issue - ignore #45060
ArkNill
ArkNill commented last week
ArkNill
last week
This looks like the same bug class as the deferred_tools_delta regression (#34629) — blocks that should stay at a fixed position in messages[0] end up at their historical transcript position on resume, breaking the cache prefix.

I ran into this on the CLI side and tracked it through a proxy (#42338). The v2.1.90 fix resolved deferred_tools_delta, but skill_listing was never persisted in session storage — so on resume it regenerates at a different position. That's exactly your 5→4 block change.

The 532→533 byte companion intro difference is probably joinTextAtSeam — the text-block merging function appends \n at boundaries during normalization, and on replay these accumulate. Small now, but it'll bite eventually.

@simpolism put together a patch that addresses both of these: https://gist.github.com/simpolism/302621e661f462f3e78684d96bf307ba — your mitmproxy numbers (8,760 read + 3,790 create repeating every resume) are consistent with the unpatched behavior. I tested the patch on v2.1.91 through a monitoring proxy and from the second resume onward it went to 99.7–99.9% cache hit.

More context on the resume cache issue and proxy data here if useful: 01_BUGS.md § Bug 2

cnighswonger
cnighswonger commented last week
cnighswonger
last week
This is the exact bug our cache-fix interceptor addresses. Your mitmproxy captures are textbook — the 5→3 block change on resume and the ~3,800 token cache_create repeating every turn is exactly what we see.

Our interceptor's normalizeResumeMessages handles this by scanning the entire message array backward on every API call, finding the latest version of each block type (skills, deferred tools, MCP, hooks), removing them from wherever they've drifted, and consolidating them into messages[0] in a deterministic order matching fresh session layout. This is the same class of fix as @simpolism's patch, applied at the fetch level rather than in CC source.

A few additional findings from our testing that extend your observations:

Tool ordering is also non-deterministic — 97.8% of API calls in our data arrive with tool definitions in a different order, busting cache independently of the block scatter. We sort them alphabetically.
Skills entries within the skills block are also non-deterministic — the listing order varies between calls. We sort those too.
Hooks blocks carry session_knowledge — ephemeral content that differs between sessions. We strip it.
The companion intro \n drift you flagged is real — we haven't seen it cause a cache miss yet, but it's on our radar.
Across 4,700+ intercepted API calls over 8 days, 52–73% needed block relocation (your bug), and 98% needed tool reordering. With the fix applied, our sessions sustain 98.3% cache hit rates on resumed sessions.

npm install -g claude-code-cache-fix — works as a Node.js preload module with the npm installation.

bilby91
bilby91 commented last week
bilby91
last week · edited by bilby91
Author
@cnighswonger Thanks for sharing all these insights. I've been following your posts on other issues.

Does claude-code-cache-fix fix 1h vs 5m caching when using sdk ?

cnighswonger
cnighswonger commented last week
cnighswonger
last week
Good question. Two separate things:

1h vs 5m TTL — No, the interceptor can't change which TTL tier the server assigns. That's a server-side decision tied to your quota utilization (and possibly other account-level state we haven't fully identified — see the discussion on #42052). What the interceptor does as of v1.4.0 is detect which tier you're on by reading ephemeral_1h_input_tokens and ephemeral_5m_input_tokens from the response usage object. It writes this to ~/.claude/quota-status.json so you can monitor it.

Cache fixes with the SDK — Yes, the block relocation and tool ordering fixes work with @anthropic-ai/claude-agent-sdk. The interceptor patches globalThis.fetch, which the SDK uses under the hood. Your mitmproxy data showing the 5→3 block change on resume is exactly the pattern we fix. The same NODE_OPTIONS="--import claude-code-cache-fix" approach applies — just set it in your environment before launching your SDK process.

7 remaining items

github-actions
mentioned this last week
📊 AI CLI 工具社区动态日报 2026-04-09 gsscsd/big_model_radar#157
bilby91
bilby91 commented last week
bilby91
last week
Author
@cnighswonger I have used the debugging flags to capture the information. I have a few samples and the diff.

Is there a place I can share with you privately ?

Thanks!

cnighswonger
cnighswonger commented last week
cnighswonger
last week
@bilby91 Great — looking forward to seeing it. You can send to dev@veritassuperaitsolutions.com and we'll dig into the diff.

cnighswonger
cnighswonger commented last week
cnighswonger
last week
New failure mode: MCP tool registration timing jitter

@bilby91 provided a debug trace from his Agent SDK setup that reveals a cache bust pattern we hadn't seen in standard Claude Code:

When MCP tools register asynchronously, the skills and deferred tools blocks in messages[0] can change between consecutive API calls — not because blocks scattered, but because a new tool finished registering between call 1 and call 2. This causes:

The deferred tools block grows by one entry (1-char diff in the delimiter)
The skills block content changes as the new skill appears
Both break the cache prefix. Our interceptor's skill sorting and block relocation don't help here because it's a content change, not an ordering or placement issue.

This primarily affects users with MCP servers that have variable startup times. Standard Claude Code with bundled tools doesn't exhibit this because all tools are available before the first API call.

We're working on a content-pinning fix — snapshot the block content after stabilization, absorb one cache miss when a new tool registers, then lock to prevent repeated busts from registration jitter. Targeting a release tomorrow.

cnighswonger
cnighswonger commented last week
cnighswonger
last week
Correction and fix shipped (v1.5.1)

@bilby91 pointed out that our initial diagnosis was wrong on two counts — the MCP tools were already registered in both calls (not late-registering), and the skills load from the filesystem, not MCP. The actual root causes are:

Non-deterministic filesystem enumeration — readdir doesn't guarantee order, so skills appear in different positions between calls despite being the same set
Trailing whitespace jitter — the deferred tools block had a 1-character difference (754 → 755 chars) from whitespace normalization differences between serializations
v1.5.1 is now on npm with three fixes:

sortDeferredToolsBlock() — alphabetically sorts deferred tool names (matching the existing skills sort)
pinBlockContent() — normalizes trailing whitespace and pins block content by hash, so identical logical content produces byte-identical output
Non-scattered block processing — sorting and pinning now apply even when blocks stay in messages[0] (previously only triggered on scatter)
npm install -g claude-code-cache-fix@1.5.1
@bilby91 — we've emailed you separately with details. Let us know how it goes.


cnighswonger
mentioned this last week
Fresh-session calls bypass sort/pin, busting cache on first resume cnighswonger/claude-code-cache-fix#5

greenheadHQ
mentioned this last week
feat(skills): codex-fan-out 스킬 + plan-with-questions codex exec 전환 + cache guide 보강 greenheadHQ/nixos-config#458
feat(skills): codex-fan-out 스킬 + plan-with-questions codex exec 전환 + cache guide 보강 greenheadHQ/nixos-config#460
feat: Claude Code 세션 뷰어 — Claude Desktop 스타일 HTML 세션 브라우저 greenheadHQ/nixos-config#459

github-actions
mentioned this last week
[BUG] new sessions will **never** hit a (full)cache #47098

deafsquad
mentioned this in 3 issues 2 days ago
[BUG] Historical user-message content drift invalidates prompt cache prefix (trailing \n on </system-reminder>) #48734
[BUG] Per-turn smoosh pipeline folds dynamic <system-reminder> text into tool_result.content, breaking prompt cache #49585
[BUG] Resume/continue cache invalidation #43657

cmd8
mentioned this yesterday
Race between initialize control_request and MCP refresh causes tools to drop from first request #49753
cnighswonger
cnighswonger commented 20 hours ago
cnighswonger
20 hours ago
Quick update: claude-code-cache-fix v2.0.0 is stable with 15 cache-stability fixes — up from 8 in v1.x. The new fixes cover smooshSystemReminderSiblings folding drift, SessionStart:resume vs :startup content mismatch, MCP reconnect race, bookkeeping system-reminder churn, cache_control marker position shuffle, --continue trailer injection, and tool_use.input non-deterministic re-serialization.

Measured impact on affected sessions: 940K → 1.7K cache creation tokens on first post-resume request (99.8% reduction). 146 tests. Compatible with CC v2.1.112.

Credit to @deafsquad for 7 PRs providing the source-level function attribution and fixes that made this release possible.

pekka1398
