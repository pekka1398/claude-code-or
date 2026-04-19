[BUG] Prompt cache regression in --print --resume since v2.1.69(?): cache_read never grows, ~20x cost increase #34629
Closed
Closed
[BUG] Prompt cache regression in --print --resume since v2.1.69(?): cache_read never grows, ~20x cost increase
#34629
@cinniezra
Description
cinniezra
opened on Mar 15 · edited by cinniezra
Preflight Checklist

I have searched existing issues and this hasn't been reported yet

This is a single bug report (please file separate reports for different bugs)

I am using the latest version of Claude Code
What's Wrong?
Summary
--print --resume sessions stopped caching conversation turns between API calls starting around v2.1.69. Only Claude Code's internal system prompt (~14.5k tokens) is cached; all conversation history is cache_created from scratch on every message. This causes a ~20x cost increase per message compared to v2.1.68.

Environment
Platform: Ubuntu (Hetzner VPS)
Use case: Discord bot using claude --print --model <model> --resume <session-id> --output-format stream-json --verbose with prompts piped via stdin
Tested models: claude-opus-4-6[1m], opus, claude-opus-4-5-20251101
The regression is version-dependent, not model-dependent.

Suspect
Something in newer updates after 2.1.68 may have inadvertently broken cache breakpoint placement for --print --resume sessions.

Workaround
Pinned to v2.1.68 (npm install -g @anthropic-ai/claude-code@2.1.68).

What Should Happen?
Expected behavior (v2.1.68)
cache_read grows as conversation accumulates, cache_create drops to a small delta (~800 tokens):

Message 1: cache_read=13,997  cache_create=22,946  cost=$0.15  (cold start)
Message 2: cache_read=32,849  cache_create=4,636   cost=$0.05
Message 3: cache_read=36,846  cache_create=879     cost=$0.03
Message 4: cache_read=37,295  cache_create=802     cost=$0.02
Actual behavior (v2.1.76 and likely earlier versions after v2.1.68)
cache_read is stuck at ~14.5k (Claude Code's system prompt only), cache_create equals the full conversation size and grows every message:

Message 1: cache_read=14,569  cache_create=54,437  cost=$0.35
Message 2: cache_read=14,569  cache_create=55,084  cost=$0.35
Message 3: cache_read=14,569  cache_create=55,512  cost=$0.35
Message 4: cache_read=14,569  cache_create=55,733  cost=$0.36
Message 5: cache_read=14,569  cache_create=55,954  cost=$0.36
The conversation turns are never reused from cache between calls. Only Claude Code's internal system prompt (~14.5k tokens) caches successfully.

Error Messages/Logs
## Testing matrix

All tests used fresh session UUIDs and back-to-back messages (well within the 5-minute cache TTL):

| Version | Model | Context | cache_read grows? | Steady-state cost/msg |
|---------|-------|---------|-------------------|----------------------|
| 2.1.68 | `opus` | 200k | **Yes** | ~$0.02 |
| 2.1.68 | `claude-opus-4-6[1m]` | 1M | **Yes** | ~$0.02 |
| 2.1.76 | `opus` | 200k | **No (stuck at 14.5k)** | ~$0.04-0.40 (grows) |
| 2.1.76 | `claude-opus-4-6[1m]` | 1M | **No (stuck at 14.5k)** | ~$0.35-0.40 |
| 2.1.76 | `claude-opus-4-5-20251101` | 200k | **No (stuck at 14.5k)** | ~$0.04-0.40 (grows) |
Steps to Reproduce
Reproduction
Run claude --print --resume <session-id> --output-format stream-json --verbose with a prompt via stdin
Send 3+ messages to the same session
Observe cache_read_input_tokens and cache_creation_input_tokens in the stream-json result output
Claude Model
Opus

Is this a regression?
Yes, this worked in a previous version

Last Working Version
2.1.68

Claude Code Version
2.1.76

Platform
Other

Operating System
Ubuntu/Debian Linux

Terminal/Shell
Other

Additional Information
This report (including the testing matrix) was written by Claude Code during a debugging session.

Activity

cinniezra
added 
bug
Something isn't working
 on Mar 15

github-actions
added 
regression
 
platform:linux
Issue specifically occurs on Linux
 
area:cost
 
has repro
Has detailed reproduction steps
 on Mar 15
yurukusa
yurukusa commented on Mar 15
yurukusa
on Mar 15
Thanks for the detailed investigation — the version bisection and cost comparison tables are very helpful.

Analysis
The behavior you're describing (only ~14.5k tokens cached = system prompt only) strongly suggests that the cache breakpoint placement changed in v2.1.69+. Anthropic's prompt caching requires cache control markers at specific positions in the messages array. If those markers moved or were removed for --print --resume sessions, the API would treat the full conversation as new content on every call.

The fact that cache_read is stuck at exactly the system prompt size confirms the cache breakpoint is only being placed on the system message, not on conversation turn boundaries.

Workaround
Until this is fixed upstream, pinning to v2.1.68 as you're doing is the right call. If you need features from newer versions, you can run two installations side-by-side:

# Keep v2.1.68 for --print --resume workloads
npm install -g @anthropic-ai/claude-code@2.1.68 --prefix ~/.claude-code-pinned
alias claude-bot="$HOME/.claude-code-pinned/bin/claude"

# Use latest for interactive sessions (where caching works fine)
npm install -g @anthropic-ai/claude-code
Cost mitigation if you must use latest
If pinning isn't an option, you can reduce the damage by keeping --resume conversations short and starting fresh sessions more frequently. The cost scaling is roughly:

v2.1.68: O(1) per message after warmup (cache hits)
v2.1.69+: O(n) per message where n = conversation length (full cache_create every time)
So shorter sessions with more frequent --resume to new session IDs will keep the per-message cost lower, though this sacrifices the conversation continuity benefit.

For the team
This is likely a one-line fix — wherever cache breakpoints are placed on conversation turns for interactive sessions, the same logic needs to apply to --print --resume sessions. The regression window (v2.1.68 → v2.1.69) should make it easy to bisect in the source.


lineardevon
mentioned this last month
[BUG] Parallel API during user turn cause significant prompt cache write penalty on Bedrock #38356

miyago9267
mentioned this 3 weeks ago
[BUG] Prompt caching is disabled for SDK query() and V2 sessions — only enabled for REPL #39732

jmarianski
mentioned this 3 weeks ago
[BUG] Conversation history invalidated on subsequent turns #40524

github-actions
mentioned this 3 weeks ago
CLI mutates historical tool results via cch= billing hash substitution, permanently breaking prompt cache #40652
jmarianski
jmarianski commented 3 weeks ago
jmarianski
3 weeks ago
I've found the problem you've encountered, it's due to history rewrite during resumption of a request. Here's a summary of my findings generated by claude code:

Root Cause Analysis: Cache regression on --resume since v2.1.69
TL;DR
The deferred_tools_delta attachment type was introduced in v2.1.69 (not present in v2.1.68). This causes messages[0] to have fundamentally different content on fresh sessions vs resumed sessions, breaking the prompt cache prefix match.

Technical Details
We reverse-engineered the cache behavior by capturing full API request payloads via MITM proxy across versions 2.1.68 through 2.1.87.

How messages[0] is built — the asymmetry
Fresh session (first request):

Step 1: Session start events inject attachments (deferred tools, MCP, skills)
Step 2: AU$() PREPENDS <system-reminder> with userContext (CLAUDE.md, currentDate)
Result → messages[0] contains ALL reminders in one message:
  block[0]: <system-reminder> deferred tools list         (~2.1KB)  ← NEW in v2.1.69
  block[1]: <system-reminder> MCP instructions            (~2.2KB)
  block[2]: <system-reminder> skills list                 (~8.6KB)
  block[3]: <system-reminder> AU$ context (currentDate)   (~306B)
  block[4]: user prompt text                              (variable)
Total: ~13.4KB
Resumed session:

Step 1: Transcript JSONL → restore old messages[0..N]
Step 2: AU$() PREPENDS new messages[0] with userContext ONLY
Step 3: h2("resume") APPENDS attachments (deferred tools, MCP, skills) at END
Result → messages[0] contains ONLY AU$ context:
  block[0]: <system-reminder> AU$ context (currentDate)   (~306B)
Total: ~352B
Deferred tools/MCP/skills land at messages[N] (after transcript messages)
This creates a 13.4KB vs 352B mismatch in messages[0] — completely different prefix.

Three independent cache-breaking effects
#	Cause	Fresh session	Resume	Breaks cache?
1	messages[0] content	4 reminders (13KB)	1 reminder (352B)	YES — prefix changed
2	system[0] cc_version hash	e.g. 2.1.87.7b6	e.g. 2.1.87.c02	YES — derived from msgs[0]
3	cache_control marker position	On msgs[0] block[4]	On msgs[last]	YES — breakpoint moved
Cause #1 is the root cause. Cause #2 is a consequence (#1 changes messages[0], and the cc_version billing suffix is computed by hashing characters at positions 4, 7, and 20 of the first user message text via C46()/qT8()).

Why v2.1.68 worked
deferred_tools_delta does not exist in v2.1.68:

v2.1.68: grep -c 'deferred_tools_delta' cli.js → 0
v2.1.69: grep -c 'deferred_tools_delta' cli.js → 5
v2.1.68: grep -c 'deferred tools are now available' cli.js → 0
v2.1.69: grep -c 'deferred tools are now available' cli.js → 1
Without deferred_tools_delta, messages[0] on both fresh and resumed sessions contained only the AU$ context (CLAUDE.md + currentDate) — identical content, identical prefix, cache hit.

Subsequent versions made it worse
Each version after 2.1.69 added more content to the deferred_tools_delta attachment (more deferred tools, MCP server instructions growth), widening the gap between fresh and resumed messages[0].

What caches and what doesn't
Transition	Cache result	Why
Fresh turn N → turn N+1	HIT	msgs[0] stable within session
Fresh → Resume	MISS	msgs[0] completely different (13KB → 352B)
Resume → next turn (same process)	HIT	msgs[0] stable after resume
Resume → Resume (new process, e.g. --print)	Partial HIT	system cached (~11k), messages = cache_creation
The --print --resume use case from this issue is hit hardest because each invocation is a new process, so the cache from the previous resume's messages is never reused for system-reminder content.

Suggested fixes (any one would help)
Best fix: h2("resume") should inject attachments into messages[0] (same position as fresh session), not append to messages[N]
Alternative: Move deferred tools/MCP/skills to system[] parameter instead of messages[] — they're static context, not conversation
Quick fix for cc_version: rw9() should skip isMeta messages when finding the first user message for billing suffix hash — currently it hashes the system-reminder content instead of the actual user prompt
Minimal fix: On resume, reconstruct messages[0] to match fresh session layout (prepend deferred tools + MCP + skills before AU$ context)
Methodology
MITM proxy capturing full request/response payloads (mitm-addon.py via mitmproxy)
Ghidra reverse engineering of the standalone binary (228MB ELF) to locate the sentinel replacement mechanism in the Zig HTTP header builder
Controlled experiments: fresh session → resume → consecutive resumes, with payload diffing
Version comparison: npm packages v2.1.68 vs v2.1.69 bundle analysis
Tested on CC versions 2.1.68, 2.1.69, 2.1.77, 2.1.85, 2.1.86, 2.1.87
amattas
amattas commented 3 weeks ago
amattas
3 weeks ago
Just being pedantic, but if it's O(1) and O(n) per message wouldn't that just be O(n) and O(n^2) complexity overall.

tornikeo
tornikeo commented 3 weeks ago
tornikeo
3 weeks ago
a "bug" causes users to spend x20 more

Yeah, call me crazy but I feel like this "bug" isn't getting patched anytime soon lol

Kaz-
Kaz- commented 3 weeks ago
Kaz-
3 weeks ago · edited by Kaz-
a "bug" causes users to spend x20 more

Yeah, call me crazy but I feel like this "bug" isn't getting patched anytime soon lol

I hope not, that's a deal breaker for me, I'm not paying 100$ a month for 7 prompts every 5 hours. That's litteraly the limit for me right now with this bug.


jmarianski
mentioned this 3 weeks ago
[BUG] Claude Max plan session limits exhausted abnormally fast since March 23, 2026 (CLI usage) #38335
98 remaining items

ArkNill
mentioned this 2 weeks ago
VS Code Plugin version ArkNill/claude-code-hidden-problem-analysis#2

tfvchow
mentioned this 2 weeks ago
Claude Code token burn: 8K output cap retry, cache fragility, and server-side budget mechanics tfvchow/field-notes-public#63

p948tzqwxr-bit
mentioned this 2 weeks ago
[BUG] Cache TTL silently downgrades from 1h to 5m when Extra Usage is active #43566

github-actions
mentioned this 2 weeks ago
[BUG] Resume/continue cache invalidation #43657

tfvchow
mentioned this 2 weeks ago
Claude Code: tengu_chair_sermon flag flip reshapes historical messages, breaks prefix cache tfvchow/field-notes-public#64

bilby91
mentioned this 2 weeks ago
[BUG] Prompt cache partial miss on every --resume turn — skill_listing block missing from messages[0] #44045
cinniezra
cinniezra commented 2 weeks ago
cinniezra
2 weeks ago
Author
this is not fixed btw. still doing cache create without cache read ever growing in 2.1.89.

jamesmazur
jamesmazur commented last week
jamesmazur
last week
@cinniezra try 👍and subscribe on #42052


wpank
mentioned this in 2 issues last week
[MODEL] Claude Code is unusable for complex engineering tasks with the Feb updates #42796
accidental issue - ignore #45060
cnighswonger
cnighswonger commented last week
cnighswonger
last week
v2.1.97 update — resume cache regression still present

Automated testing confirms the block scatter bug reported in this issue is still present in v2.1.97. On resume, attachment blocks (skills, deferred tools, MCP, hooks) scatter out of messages[0], breaking the cache prefix and forcing ~5,200 tokens of unnecessary cache creation per turn.

Turn	Without fix	With fix
Resume T1	5,204 create / 20,939 read (80%)	0 create / 26,143 read (100%)
Resume T2	5,220 create / 20,939 read (80%)	0 create / 26,159 read (100%)
Resume T3	18 create / 26,159 read (99.9%)	0 create / 26,177 read (100%)
Our interceptor (npm install -g claude-code-cache-fix) eliminates the regression — zero cache creation across all resume turns. v1.5.1 also adds deferred tools sorting, content pinning for whitespace jitter, and a cost report tool.

Full test report: docs/v2.1.97-cache-test-report.md


greenheadHQ
mentioned this in 2 issues last week
feat(claude): Cache TTL statusline 1시간 TTL 대응 + 캐시 히트/미스 표시 greenheadHQ/nixos-config#451
feat(skills): codex-fan-out 스킬 + plan-with-questions codex exec 전환 + cache guide 보강 greenheadHQ/nixos-config#458
github-actions
github-actions commented 2 days ago
github-actions
bot
2 days ago – with GitHub Actions
This issue has been automatically locked since it was closed and has not had any activity for 7 days. If you're experiencing a similar issue, please file a new issue and reference this one if it's relevant.