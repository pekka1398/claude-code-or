[BUG] Conversation history invalidated on subsequent turns #40524
Closed
Closed
[BUG] Conversation history invalidated on subsequent turns
#40524
@jmarianski
Description
jmarianski
opened 3 weeks ago · edited by jmarianski
Preflight Checklist

I have searched existing issues and this hasn't been reported yet

This is a single bug report (please file separate reports for different bugs)

I am using the latest version of Claude Code
What's Wrong?
While investigating huge token usage I've noticed it come due to fact suddenly my conversation history gets invalidated and all subsequent turns revert to only caching system prompt and huge cache writes.

What Should Happen?
Cache shouldn't drop due to history changes. History should not be updated. Or we shouldn't be charged for historical updates.

Error Messages/Logs
Analysis of token usage from the start of my analysis:

time        cache_read  cache_cr    input    out    model               stop        
----------  ----------  ----------  -------  -----  ------------------  ------------
22:22:48    312377      1944        1        215    opus-4-6            end_turn    
22:23:39    314321      493         3        159    opus-4-6            end_turn    
22:24:19    314814      172         3        108    opus-4-6            end_turn    
22:33:42    0           0           8        1      haiku-4-5-20251001  max_tokens  <-- resume
22:34:26    11428       305735      3        213    opus-4-6            tool_use    <-- irrelevant cache rewrite after restart
22:34:35    317163      579         1        239    opus-4-6            tool_use    
22:34:43    317742      566         1        152    opus-4-6            end_turn    
22:37:13    318308      245         3        96     opus-4-6            end_turn    
07:55:55    0           0           8        1      haiku-4-5-20251001  max_tokens  <-- resume
07:56:22    11428       163547      3        143    opus-4-6            tool_use    <-- partial cache regenerate (wth?)
07:56:40    174975      358         1        90     opus-4-6            end_turn    
07:57:25    11428       307626      3        87     opus-4-6            end_turn    <-- full cache regenerate
07:57:51    319054      108         3        89     opus-4-6            tool_use    
07:58:05    319162      712         1        448    opus-4-6            tool_use    
07:58:21    319874      833         1        367    opus-4-6            end_turn    
07:59:21    320707      393         3        414    opus-4-6            tool_use    
07:59:34    321100      609         1        560    opus-4-6            tool_use    
07:59:47    321709      948         1        512    opus-4-6            tool_use    
08:00:10    322657      615         1        348    opus-4-6            end_turn    
08:03:00    323272      426         3        530    opus-4-6            tool_use    
08:03:12    323698      972         1        468    opus-4-6            tool_use    
08:03:22    324670      529         1        167    opus-4-6            end_turn    
08:03:29    325199      215         3        28     opus-4-6            end_turn    
08:05:30    0           0           8        1      haiku-4-5-20251001  max_tokens  <-- resume
08:05:48    11428       187695      3        155    opus-4-6            tool_use    
08:06:06    199123      876         1        780    opus-4-6            tool_use    
08:06:25    199999      2199        1        1285   opus-4-6            tool_use    
08:06:38    202198      1633        1        302    opus-4-6            end_turn    
08:08:06    203831      481         3        88     opus-4-6            tool_use    
08:08:17    204312      408         1        175    opus-4-6            end_turn    
08:09:16    204720      206         3        154    opus-4-6            end_turn    
08:10:25    204926      228         3        503    opus-4-6            tool_use    
08:10:34    205154      1193        1        507    opus-4-6            tool_use    
08:10:45    206347      1007        1        247    opus-4-6            end_turn    
08:10:54    0           0           8        1      haiku-4-5-20251001  max_tokens  <-- resume
08:11:16    11428       195983      3        136    opus-4-6            tool_use    
08:11:37    207411      616         1        1207   opus-4-6            tool_use    
08:11:49    208027      1457        1        290    opus-4-6            end_turn    
08:12:02    209484      323         3        270    opus-4-6            end_turn    
08:12:27    209807      284         3        190    opus-4-6            tool_use    
08:12:39    210091      314         1        278    opus-4-6            tool_use    
08:13:01    210405      728         1        1219   opus-4-6            tool_use    
08:13:18    211133      1465        1        449    opus-4-6            end_turn    
08:15:28    212598      599         3        325    opus-4-6            end_turn    
08:16:26    213197      334         3        209    opus-4-6            end_turn    
08:18:00    213531      288         3        137    opus-4-6            tool_use    
08:18:07    213819      1131        1        122    opus-4-6            tool_use    
08:18:15    214950      140         1        193    opus-4-6            tool_use    
08:18:29    215090      1114        1        269    opus-4-6            tool_use    
08:18:54    216204      10504       1        336    opus-4-6            tool_use    <-- cache starts breaking down due to history change*
08:19:07    216204      11815       1        228    opus-4-6            tool_use    
08:19:17    216204      12990       1        134    opus-4-6            tool_use    
08:19:38    216204      13341       1        301    opus-4-6            tool_use    
08:20:04    216204      13758       1        426    opus-4-6            tool_use    
08:20:18    216204      15278       1        154    opus-4-6            tool_use    
08:20:46    216204      15778       1        508    opus-4-6            tool_use    
08:22:25    216204      17092       1        208    opus-4-6            tool_use    
08:22:51    216204      17894       1        660    opus-4-6            tool_use    
08:23:22    11428       224502      1        315    opus-4-6            end_turn    <-- cache cannot get regenerated, reverting to full cache write
08:24:47    11428       224953      3        871    opus-4-6            tool_use    
08:25:10    11428       227259      1        597    opus-4-6            tool_use    
08:25:24    11428       228249      1        356    opus-4-6            tool_use    
08:25:43    11428       228669      1        825    opus-4-6            tool_use    
08:26:01    11428       229763      1        468    opus-4-6            tool_use    
08:26:22    11428       230278      1        339    opus-4-6            end_turn    
08:28:07    11428       230642      3        442    opus-4-6            end_turn    
08:37:30    11428       231432      3        430    opus-4-6            end_turn    

---
(Ignore hour, it's another day)
When running "npx @anthropic-ai/claude-code"
21:28:59    11374       46622       1        473    opus-4-6            tool_use    <-- still on standalone binary
22:02:13    0           0           8        1      haiku-4-5-20251001  max_tokens  <-- I tried resuming a couple of times
22:02:23    0           0           340      11     haiku-4-5-20251001  end_turn    
22:02:25    11374       15278       3        21     opus-4-6            end_turn    
22:04:51    0           0           8        1      haiku-4-5-20251001  max_tokens  
22:04:58    0           0           341      11     haiku-4-5-20251001  end_turn    
22:05:00    11374       15194       3        20     opus-4-6            end_turn    
22:09:20    0           0           8        1      haiku-4-5-20251001  max_tokens  
22:09:35    0           0           8        1      haiku-4-5-20251001  max_tokens  
22:12:16    0           0           341      11     haiku-4-5-20251001  end_turn    
22:12:18    11374       15194       3        21     opus-4-6            end_turn    
22:15:36    0           0           8        1      haiku-4-5-20251001  max_tokens  
23:22:46    0           0           8        1      haiku-4-5-20251001  max_tokens  
23:23:06    0           0           341      12     haiku-4-5-20251001  end_turn    
23:23:09    11374       17262       3        19     opus-4-6            end_turn    
23:23:26    28636       27          3        12     opus-4-6            end_turn    
23:31:41    0           0           8        1      haiku-4-5-20251001  max_tokens  
23:31:50    0           0           345      13     haiku-4-5-20251001  end_turn    
23:31:54    11374       17188       3        32     opus-4-6            end_turn      <-- start of npx trials
23:32:25    28562       51          3        167    opus-4-6            end_turn    
23:33:52    28613       320         3        666    opus-4-6            end_turn    
23:34:55    0           0           8        1      haiku-4-5-20251001  max_tokens  
23:35:12    0           0           355      15     haiku-4-5-20251001  end_turn  
23:35:22    11374       17198       3        328    opus-4-6            end_turn    
23:36:50    28572       367         3        500    opus-4-6            end_turn    
23:37:15    28939       506         3        143    opus-4-6            tool_use    
23:37:19    29445       523         1        91     opus-4-6            tool_use    
23:37:56    29968       4869        1        1284   opus-4-6            tool_use    
23:38:06    34837       1343        1        173    opus-4-6            end_turn    
23:38:19    36180       219         3        151    opus-4-6            tool_use    
23:38:27    36399       9511        1        341    opus-4-6            tool_use    
23:38:33    45910       442         73       77     opus-4-6            tool_use    
23:38:37    46352       250         1        77     opus-4-6            tool_use    
23:38:42    46602       1161        1        134    opus-4-6            tool_use    
23:38:59    47763       415         1        369    opus-4-6            tool_use    
23:39:06    48178       427         1        96     opus-4-6            tool_use    
23:39:09    48605       393         1        77     opus-4-6            tool_use    
23:39:13    48605       639         1        152    opus-4-6            tool_use    
23:40:17    11374       38207       3        362    opus-4-6            end_turn    
23:41:35    49581       438         3        766    opus-4-6            end_turn    
23:43:02    0           0           8        1      haiku-4-5-20251001  max_tokens  <-- another session
23:43:23    11374       40201       3        97     opus-4-6            tool_use    
23:43:30    51575       122         1        310    opus-4-6            tool_use    
23:43:35    51697       408         1        152    opus-4-6            tool_use    
23:43:41    52105       219         93       170    opus-4-6            tool_use    
23:43:49    52324       442         1        259    opus-4-6            tool_use    
23:43:54    52766       558         1        102    opus-4-6            tool_use    
23:44:08    53324       2593        1        403    opus-4-6            end_turn    
23:51:33    0           0           8        1      haiku-4-5-20251001  max_tokens  
23:52:30    55917       431         3        187    opus-4-6            tool_use    
23:54:20    56348       292         37       284    opus-4-6            tool_use    
23:54:29    56640       612         158      492    opus-4-6            tool_use    
23:54:54    60657       13          3        508    opus-4-6            end_turn    
23:58:58    60670       717         2        454    opus-4-6            tool_use    
23:59:05    61387       847         1        336    opus-4-6            tool_use    
23:59:23    62234       1282        1        674    opus-4-6            tool_use    
23:59:34    63516       1024        1        506    opus-4-6            tool_use    
23:59:45    64540       583         1        264    opus-4-6            tool_use    
23:59:53    65123       284         1        393    opus-4-6            tool_use    
00:00:10    65407       470         1        887    opus-4-6            tool_use    
00:03:07    65877       1024        1        871    opus-4-6            tool_use    
00:03:16    66901       2098        1        538    opus-4-6            tool_use    
00:03:25    68999       1492        1        379    opus-4-6            tool_use    
00:03:36    70491       1043        1        640    opus-4-6            tool_use    
00:03:43    71534       704         1        233    opus-4-6            tool_use    
00:03:51    72238       250         1        148    opus-4-6            tool_use    
00:03:58    72488       355         1        249    opus-4-6            tool_use    
00:04:03    72843       396         1        259    opus-4-6            tool_use    
00:04:10    73239       435         1        278    opus-4-6            tool_use    
00:04:31    73674       359         1        941    opus-4-6            tool_use    
00:04:45    74033       1595        1        662    opus-4-6            tool_use    
00:05:00    75628       914         1        830    opus-4-6            tool_use    
00:05:18    76542       1610        1        963    opus-4-6            tool_use    
00:05:31    78152       1379        1        640    opus-4-6            tool_use    
00:05:41    79531       1374        1        549    opus-4-6            tool_use    
00:05:51    80905       1576        1        550    opus-4-6            tool_use    
00:06:06    82481       629         1        986    opus-4-6            tool_use    
00:06:20    83110       1102        1        994    opus-4-6            tool_use    
00:06:30    84212       1074        1        578    opus-4-6            tool_use    
00:06:48    85286       2418        1        854    opus-4-6            tool_use    
00:07:01    87704       880         1        555    opus-4-6            tool_use    
00:07:13    88584       818         1        601    opus-4-6            tool_use    
00:07:30    89402       2165        1        520    opus-4-6            end_turn    
00:11:02    91567       542         3        691    opus-4-6            tool_use    
00:11:12    92109       777         1        733    opus-4-6            tool_use    
00:11:25    92886       1042        1        578    opus-4-6            tool_use    
00:11:39    93928       3347        1        694    opus-4-6            tool_use    
00:12:21    98211       39          3        442    opus-4-6            end_turn    
00:13:24    98250       462         3        161    opus-4-6            tool_use    
00:13:32    98712       274         1        178    opus-4-6            end_turn    
00:15:06    98986       190         3        237    opus-4-6            tool_use    
00:15:37    99176       362         1        1202   opus-4-6            tool_use    
00:15:42    6637        16169       2        114    opus-4-6            tool_use    
00:15:44    99538       1427        1        280    opus-4-6            tool_use    
00:15:47    22806       3503        1        160    opus-4-6            tool_use    
00:15:49    100965      2929        1        52     opus-4-6            end_turn    <-- my joy is great at this point
00:15:50    26309       191         1        91     opus-4-6            tool_use    
00:15:54    26500       217         1        92     opus-4-6            tool_use    
00:15:57    26717       152         1        88     opus-4-6            tool_use    
00:16:02    26869       607         3        125    opus-4-6            tool_use    
00:16:06    27476       146         1        166    opus-4-6            tool_use    
00:16:09    27622       430         1        105    opus-4-6            tool_use    
00:16:14    28052       123         1        109    opus-4-6            tool_use    
00:16:19    28052       542         1        176    opus-4-6            tool_use    
00:16:23    28594       440         1        95     opus-4-6            tool_use    
00:16:28    29034       120         1        112    opus-4-6            tool_use    
00:16:32    29154       139         1        180    opus-4-6            tool_use    
00:16:37    29293       256         1        206    opus-4-6            tool_use    
00:17:09    29549       1065        1        82     opus-4-6            tool_use    
00:17:12    30614       131         1        117    opus-4-6            tool_use    
00:17:24    30745       135         1        79     opus-4-6            tool_use    
00:17:28    30745       237         1        100    opus-4-6            tool_use    
00:17:35    30982       140         1        138    opus-4-6            tool_use    
00:17:39    31122       222         1        112    opus-4-6            tool_use    
00:17:46    31344       226         1        257    opus-4-6            tool_use    
00:17:51    31570       288         1        125    opus-4-6            tool_use    
00:17:56    31858       214         1        128    opus-4-6            tool_use    
00:18:01    32072       316         1        139    opus-4-6            tool_use    
00:18:04    32388       487         1        116    opus-4-6            tool_use    
00:18:09    32875       134         1        125    opus-4-6            tool_use    
00:19:29    33009       143         1        5925   opus-4-6            tool_use    
00:19:35    33152       5912        1        113    opus-4-6            tool_use    <-- yup, was at 100% usage at this point
00:19:36    0           0           0        0      -                   -           
00:19:36    0           0           0        0      -                   -           
10:08:54    11374       58355       3        270    opus-4-6            tool_use    <-- costly resume, but cache TTL = 1h in claude code
10:09:00    69729       538         1        277    opus-4-6            tool_use    
10:09:07    70267       7086        180      188    opus-4-6            tool_use    
10:09:14    77353       436         1        201    opus-4-6            tool_use    
10:09:18    77789       219         1        118    opus-4-6            tool_use    
10:09:34    78008       518         1        183    opus-4-6            tool_use    
10:10:40    78526       444         1        95     opus-4-6            tool_use    
10:10:46    78970       1213        1        185    opus-4-6            tool_use    
10:10:55    80183       996         1        270    opus-4-6            tool_use    
10:13:03    81179       602         1        268    opus-4-6            tool_use    
10:18:08    81781       675         1        121    opus-4-6            tool_use    
10:18:14    82456       148         1        226    opus-4-6            tool_use    
10:29:13    82604       823         1        184    opus-4-6            tool_use    
10:29:19    83427       889         1        239    opus-4-6            tool_use    
----------  ----------  ----------  -------  -----  ------------------  ------------


If you provide me with means, I can send you full request/response dumps

*- no idea if this cache breaking was due to me inspecting binary or some historical tool change happened on the background level.
Steps to Reproduce
Write "cch=00000" in command line and ask claude what does he see. He still should see "cch=00000". And token usage should be all "cache read" mostly, not "cache write" for subsequent requests.

Step to temporarily fix: npx @anthropic-ai/claude-code@2.1.34 // you need to fix it on older version to benefit from it

Claude Model
Opus

Is this a regression?
Yes, this worked in a previous version

Last Working Version
Based on reports: 2.1.67

Claude Code Version
2.1.86 (Claude Code)

Platform
Anthropic API

Operating System
Ubuntu/Debian Linux

Terminal/Shell
Other

Additional Information
Similar issue: #34629 - this one relates to immediate start of conversation

Tool I wrote for debugging: https://gitlab.com/treetank/cc-diag

Verification script: https://gitlab.com/treetank/cc-diag/-/raw/c126a7890f2ee12f76d91bfb1cc92612ae95284e/test_cache.py

Activity

jmarianski
added 
bug
Something isn't working
 3 weeks ago

github-actions
added 
has repro
Has detailed reproduction steps
 
area:cost
 
area:core
 
platform:linux
Issue specifically occurs on Linux
 
regression
 3 weeks ago
github-actions
github-actions commented 3 weeks ago
github-actions
bot
3 weeks ago – with GitHub Actions
Found 3 possible duplicate issues:

[BUG] Prompt cache regression in --print --resume since v2.1.69(?): cache_read never grows, ~20x cost increase #34629
[BUG] Prompt Cache Invalidation on Session Resume: Tool-Use Content Not Cached, Plugin State Changes Cause Full User Content Rewrite #27048
[BUG] Session resume loads zero conversation history — silently drops all context #40319
This issue will be automatically closed as a duplicate in 3 days.

If your issue is a duplicate, please close it and 👍 the existing issue instead
To prevent auto-closure, add a comment or 👎 this comment
🤖 Generated with Claude Code

jmarianski
jmarianski commented 3 weeks ago
jmarianski
3 weeks ago
Author
This is not a duplicate. It doesn't relate to session resume, but a subsequent turn invalidation.


github-actions
mentioned this 3 weeks ago
CLI mutates historical tool results via cch= billing hash substitution, permanently breaking prompt cache #40652
RebelSyntax
RebelSyntax commented 3 weeks ago
RebelSyntax
3 weeks ago
im collecting the same evidence. something breaks the cache and it never recovers. model switches mid session is an easy one to pinpoint. the billing header seems to be a proxy for whatever it is. possibly the dynamic tool loading or some sort of memory call back? not sure but the only way to recover seems to be starting a completely brand new session. otherwise cache writes grow unbounded and quickly devour premium tokens.

jmarianski
jmarianski commented 3 weeks ago
jmarianski
3 weeks ago
Author
"model switches mid session" is one of the behaviors for saving compute done by anthropic, as stated in the email from the robot: "The 20% threshold you're seeing is actually by design for Max 5x plans. Claude Code automatically switches from Opus 4 to Sonnet 4 when you reach 20% of your rate limit (Max 20x users get 50%). This threshold is intentionally set to help preserve a good experience and prevent users from hitting their full rate limits too quickly."

I've had my findings now and it is I've expected: binary holds some code that is revealed after decompiling. Apparently they've secretly injected cch=hash (Zig Wyhash) into the body of a request if a header "anthropic-version" appears in the request. However, if at some point "cch=00000" appears in the body of a request, it will be infected. Reason? No clue. I'm trying to find it out.

It seems like a small side effect of some obscure tool use or some micro compaction that might have already been fixed. I mean I was trying to find out, however code doesn't allow currently for "cch=00000" to accidentally leak.

jmarianski
jmarianski commented 3 weeks ago
jmarianski
3 weeks ago
Author
Full reverse engineering analysis of the sentinel replacement mechanism
Summary
Through MITM proxy capture + Ghidra reverse engineering of the Claude Code standalone binary (228MB ELF), I've identified the exact mechanism causing conversation history invalidation. The root cause is a native-layer sentinel replacement in Anthropic's custom Bun fork that rewrites the billing attribution header value on every API request.

The Mechanism
Located at VA 0x0374d610 in the standalone binary (v2.1.87) — inside the Zig HTTP header builder function (src/http.zig in Bun's source tree). This is the same function that builds Content-Length, User-Agent, Host, Accept-Encoding, etc.

Trigger condition: The replacement fires when ALL of these are true:

Request contains anthropic-version HTTP header (Wyhash = 0x58e54d60e1462681, verified via Bun.hash())
Request URL path contains /v1/messages
Request body contains the sentinel string cch=00000 (9 bytes)
What it does:

Searches the serialized JSON request body for the first occurrence of cch=00000
Hashes the entire request body (using a hash function with fixed seeds: 0xcf3c9b5975c738f4, 0x310521a7efdb6e6d, 0x6e52736ac806831e, 0xd01af9b9421ab897)
Converts 5 nibbles of the hash to hex characters using SIMD instructions (pshufb/pblendvb)
Writes the 5 hex characters in-place into the body buffer, replacing 00000
Decompiled pseudocode (reconstructed from Ghidra):

// Inside HTTP header builder — after iterating request headers
if (has_anthropic_version_header) {
    // Check URL contains "/v1/messages"
    // Built on stack as u64 LE immediates:
    local_c0 = 0x7373656d2f31762f;  // "/v1/mess"
    local_b8 = 0x73656761;          // "ages"
    if (memmem(url_ptr, url_len, &local_c0, 12) != NULL) {

        // Search body for sentinel "cch=00000"
        // Also built on stack:
        local_c0 = 0x303030303d686363;  // "cch=0000" LE
        local_b8 = 0x30;               // "0"
        offset = memmem(body_ptr, body_len, &local_c0, 9);

        if (offset != NULL) {
            // Hash the entire body
            hash_state = init(seeds...);
            hash_update(hash_state, body_ptr, body_len);
            hash_value = hash_finalize(hash_state);

            // Convert 5 nibbles to hex (SIMD)
            hex_chars = simd_nibble_to_hex(hash_value);

            // Write in-place: body[offset+4..offset+9] = hex chars
            *(uint32_t*)(body_ptr + 4 + offset) = hex_chars[0..3];
            *(char*)(body_ptr + 8 + offset) = hex_char_5th;
        }
    }
}
Key findings
1. Only the standalone binary does this — not the JS code

Confirmed experimentally:

Runtime	Replacement active?
Official standalone binary (228MB ELF)	YES
bun build --compile --bytecode cli.js (homebrew standalone)	NO
bun cli.js (standard Bun runtime)	NO
npx @anthropic-ai/claude-code (npm package)	NO
Same JavaScript code, same bytecode, same Bun standalone format — different behavior. The replacement is in Anthropic's custom Bun fork, compiled into the native Zig HTTP client.

2. Sentinel is hardcoded as stack immediates — invisible to string search

The pattern cch=00000 is built on the stack using MOV imm64 instructions:

MOV [rsp+X], 0x303030303d686363   ; "cch=0000" in little-endian
MOV byte [rsp+X+8], 0x30          ; "0" — completing "cch=00000"
This is why searching the binary for 63 63 68 3d (cch=) or 0x303030303d686363 as raw bytes in .text yields zero results — the bytes are part of instruction immediates, not contiguous string data.

3. Replacement value is a body hash, not random

The replacement value is deterministic per request body — it's a hash of the entire body with fixed seeds. But since the body changes every request (new messages, timestamps), the hash value changes too, making it appear random.

4. Only the FIRST occurrence is replaced

There is no loop — memmem finds the first match, replacement writes 5 bytes, and the function continues to build Content-Length headers. This means:

If messages[] (which comes BEFORE system[] in the JSON body) contains cch=00000, that gets replaced instead of the billing header in system[0]
The sentinel in system[0] survives — visible to the model as literal cch=00000
5. Header hashes identified

The function uses Zig's std.hash.Wyhash (seed=0, confirmed via Bun.hash()) for case-insensitive header name comparison:

Hash	Header
0x58e54d60e1462681	anthropic-version — triggers replacement
0xba5173bf47c57684	connection
0x4cc2547449bddafc	upgrade
0xfc8491525da4c9e3	content-length
0x308b6fc4af845531	transfer-encoding
0x2e6b2eda627d6669	user-agent
0x62b7d00b4bd17658	accept-encoding
0xfbb5acdf8484b6ef	accept
0x80bd44e8947f37d2	host
0x3dfa2d55bad7bb18	if-modified-since
6. Sentinel history

CC Version	cch=00000 in billing header?
1.0.0 – 2.0.0	No billing header at all
2.1.0 – 2.1.34	Billing header exists, but no cch field
2.1.36	cch=00000 introduced
2.1.36 – 2.1.87	Present in all versions
How this causes cache invalidation
The billing header cch=00000 is placed in system[0] by the JS function DG$(). On the standalone binary, the native replacement changes 00000 to a body-hash value (e.g., a3f1b) before the request leaves the process.

In normal sessions (no sentinel in conversation content): Only system[0] is affected. Since system[0] has cache_control: null (no caching), this doesn't break the cache prefix — system[2] (main prompt with cache_control: ephemeral) and messages[] remain stable.

When conversation content contains cch=00000: This happens when:

CLAUDE.md discusses the billing mechanism (our research notes)
Read/Grep tool reads the JS bundle or binary containing the sentinel
User types the sentinel literally
Since messages[] comes BEFORE system[] in the JSON body, the sentinel in messages is replaced FIRST. The actual billing header in system[0] keeps 00000. But the changed value in messages breaks the cache prefix from that point onward.

Methodology
MITM proxy (mitm-addon.py via mitmproxy) capturing all API request/response payloads
Binary comparison: official standalone (228MB) vs homebrew bun build --compile (224MB) — same JS, different behavior
Ghidra 12.0.4 reverse engineering of the standalone ELF, identifying FUN_0374d610 as the HTTP header builder with injected replacement logic
radare2 disassembly for cross-referencing and function analysis
Bun.hash() to verify all header name hashes (Zig Wyhash, seed=0)
npm package analysis across versions 1.0.0 through 2.1.87, identifying cch=00000 introduction in v2.1.36
Controlled experiments: fresh session → resume → consecutive resumes with full payload diffing
62 non-research project transcripts verified: zero accidental billing header leaks into messages
Related
This finding also explains the root cause of #34629 (cache regression on --print --resume since v2.1.69), where the deferred_tools_delta attachment introduced in v2.1.69 causes messages[0] to differ between fresh sessions and resumed sessions, independently breaking cache prefix matching.


jmarianski
mentioned this 3 weeks ago
[BUG] Claude Max plan session limits exhausted abnormally fast since March 23, 2026 (CLI usage) #38335
PHPCraftdream
PHPCraftdream commented 3 weeks ago
PHPCraftdream
3 weeks ago
Great work!

j0KZ
j0KZ commented 3 weeks ago
j0KZ
3 weeks ago
i have spikes of about 200-300k tokens when this happens. this is why my cuota is being devoured

194 remaining items
Renvect
Renvect commented 2 weeks ago
Renvect
2 weeks ago
Here it is if anyone is interested. YMMV. As always: Absolutely no warranty of any kind attached to this.
https://www.npmjs.com/package/claude-code-cache-fix
https://github.com/cnighswonger/claude-code-cache-fix

Tested it against standard claude vs fix you mention here and i wraped and ran it. Definetly reduces usage on same exact task. Results show 41% drop in my tracking plugin. Usage limit in claude code slows down.

Conducted more test against Claude code in VS extension vs wrapped fix. Claude code within gui definitely rampages over usage unlike up linked fix.

I am observing drastic differences with tracker. I will tomorrow have good dose of data on sessions I tracked in various env and will link up here as well as push out this plugin to intercept and hook in for others to check.

Renvect
Renvect commented 2 weeks ago
Renvect
2 weeks ago · edited by Renvect
Image
The interceptor I built is showing that an image pasted into Claude Code is being carried four times and automatically injected into the conversation, causing usage spikes. It is stored permanently in the conversation history and continues to be carried forward when the session or conversation is resumed.

The image persists in memory and keeps being reuse. In my session, this accumulated over six subsequent resumes before stopping.

Further logging shows that around 122k tokens are automatically inserted when a conversation is resumed within the current session. I am now examining the logs in more detail and attempting to reposition the interceptor to strip this data out and observe further results.

Striping is working, now looking more deeply into cause and where it is occuring

cnighswonger
cnighswonger commented 2 weeks ago
cnighswonger
2 weeks ago · edited by cnighswonger
@Renvect — your image duplication finding is significant. We dug into the Claude Code source to understand the mechanics, and the cost implications are substantial.

How image persistence works in CC (confirmed from source)

When the Read tool opens an image file (PNG, JPG, etc.), it encodes the image as a base64 content block in the tool result (src/tools/FileReadTool/FileReadTool.ts:784-799). That tool result — base64 data and all — stays in the conversation messages array and is sent to the API on every subsequent turn as part of conversation history (src/services/api/claude.ts:1266-1315).

Images are only removed when:

/compact is run (replaces images with [image] text placeholder — src/services/compact/compact.ts:145-179)
The 100-media-item API limit is hit, at which point the oldest are silently dropped (src/services/api/claude.ts:956-1015)
API-side context management clears old tool results
There is no automatic summarization — images are either fully present (base64) or fully gone.

Cost impact of image carry-forward

The token cost of a base64 image is approximately base64_bytes × 0.125. For typical images:

Image size (base64)	Tokens per turn	Cost per turn (Opus $5/MTok)
200KB (small screenshot)	~25,000	$0.125
500KB (typical)	~62,500	$0.31
1MB (large)	~125,000	$0.63
5MB (API max)	~625,000	$3.13
This compounds: 3 accumulated images at 500KB each = ~187,500 extra tokens on every turn for the rest of the session. Over 10 turns, that's ~1.9M wasted input tokens ($9.38 on Opus). On the 5m TTL tier, those images also trigger cache_creation rebuilds every 5 minutes.

Your observation of ~122k tokens auto-injected on resume is consistent with 1-2 accumulated images being replayed from conversation history.

Mitigation we're building

We maintain a fetch interceptor for cache regression fixes. We're adding image stripping to it — configurable via CACHE_FIX_IMAGE_KEEP_LAST=N to strip base64 image blocks from tool results older than N turns, replacing them with a text placeholder. Images read from /tmp or elsewhere are still on disk for re-reading if needed; they just don't need to ride along in every API call.

Renvect
Renvect commented 2 weeks ago
Renvect
2 weeks ago · edited by Renvect
Went further into it. I got to pont of system prompt where it may somehow connect cross projects it was opened in. Literally lists them and builds it up prompt further. Wondering now if this image duplication is coming out of memory of what projects it worked on and somehow loads images of all this workspaces. Tracing further. Project will be up on git repo around 7 UTC

cnighswonger
cnighswonger commented 2 weeks ago
cnighswonger
2 weeks ago
@Renvect — interesting that you're seeing cross-project contamination. Quick question: from your earlier comment it looks like you're using the VS Code extension ("GUI based Claude Code within VS code"). Can you confirm?

The reason we ask: the fetch interceptor approach we're using only works with the CLI client (claude via Node.js + NODE_OPTIONS="--import"). It won't apply to the VS Code extension, desktop app, or web client, which have their own process lifecycles. The underlying image persistence bug is the same across all clients, but the cross-project bleed you're tracing may be specific to how the VS Code extension assembles context across workspace folders — and if those clients share memories, that could explain the 4x duplication you observed.

Looking forward to seeing your repo when it's up.

Renvect
Renvect commented 2 weeks ago
Renvect
2 weeks ago · edited by Renvect
Further FS reads and its analysis might be another point of cause where some plugin is hooking into CLI and injecting. Ill look into that next as it shows me spikes for Marketplace and Plugin.

Also to respond on question:

interesting that you're seeing cross-project contamination. Quick question: from your earlier comment it looks like you're using the VS Code extension ("GUI based Claude Code within VS code"). Can you confirm?

I have moved away from VS code and are working on terminal based claude code for now, i will next test all of this for VS code extension.

Image
Also here is part of system prompt that came out during diging process. its just small chunk and may be relative to cross project memmory being somehow connected together.

Image
cnighswonger
cnighswonger commented 2 weeks ago
cnighswonger
2 weeks ago
@Renvect — we dug into the CC source to understand what's driving those "Additional working directories" entries in your system prompt. Here's what we found:

Where they come from

Additional working directories are populated from two sources (src/utils/permissions/permissionSetup.ts:993-1025):

The --add-dir CLI flag — and importantly, these are persisted to settings.json so they survive across sessions
Automatic symlink detection if your PWD resolves to a different path
What each additional directory does

Every directory listed there can silently inject content into your session:

Plugins — CC reads .claude/settings.json from each additional directory and merges any enabled plugins into the session (src/utils/plugins/addDirPluginSettings.ts:34-71)
MCP servers — .mcp.json files are discovered by walking parent directories upward from CWD (src/services/mcp/config.ts:888-960)
CLAUDE.md — if CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD is set (off by default), memory files from each directory are loaded into the system prompt
No limits enforced — there's no cap on the number of additional directories. Each one adds to system prompt size and potentially loads its own plugin/MCP configuration.

Relevance to the image issue

The additional directories themselves don't directly inject images into the system prompt. But if any of those directories configure MCP servers or plugins that handle images, the content those tools produce would persist in conversation history the same way we described above — base64 data riding along on every subsequent API call until compaction.

It's worth checking your settings.json (likely at ~/.claude/settings.json or the project-level equivalent) for a permissions.additionalDirectories array. If directories were added via --add-dir at some point, they'll still be there. Removing any you don't actively need for the current project would trim your system prompt.

Renvect
Renvect commented 2 weeks ago
Renvect
2 weeks ago
Initial version and todays logs:

https://github.com/Renvect/X-Ray-Claude-Code-Interceptor/tree/main

Experimenting further with capture and detection capabilities.


Renvect
mentioned this 2 weeks ago
Does Smart Stripping break caching? Renvect/X-Ray-Claude-Code-Interceptor#1
npetrangelo
npetrangelo commented last week
npetrangelo
last week
Full reverse engineering analysis of the sentinel replacement mechanism
Summary
Through MITM proxy capture + Ghidra reverse engineering of the Claude Code standalone binary (228MB ELF), I've identified the exact mechanism causing conversation history invalidation. The root cause is a native-layer sentinel replacement in Anthropic's custom Bun fork that rewrites the billing attribution header value on every API request.

The Mechanism
Located at VA 0x0374d610 in the standalone binary (v2.1.87) — inside the Zig HTTP header builder function (src/http.zig in Bun's source tree). This is the same function that builds Content-Length, User-Agent, Host, Accept-Encoding, etc.

Trigger condition: The replacement fires when ALL of these are true:

Request contains anthropic-version HTTP header (Wyhash = 0x58e54d60e1462681, verified via Bun.hash())
Request URL path contains /v1/messages
Request body contains the sentinel string cch=00000 (9 bytes)
What it does:

Searches the serialized JSON request body for the first occurrence of cch=00000
Hashes the entire request body (using a hash function with fixed seeds: 0xcf3c9b5975c738f4, 0x310521a7efdb6e6d, 0x6e52736ac806831e, 0xd01af9b9421ab897)
Converts 5 nibbles of the hash to hex characters using SIMD instructions (pshufb/pblendvb)
Writes the 5 hex characters in-place into the body buffer, replacing 00000
Decompiled pseudocode (reconstructed from Ghidra):

// Inside HTTP header builder — after iterating request headers
if (has_anthropic_version_header) {
// Check URL contains "/v1/messages"
// Built on stack as u64 LE immediates:
local_c0 = 0x7373656d2f31762f; // "/v1/mess"
local_b8 = 0x73656761; // "ages"
if (memmem(url_ptr, url_len, &local_c0, 12) != NULL) {

    // Search body for sentinel "cch=00000"
    // Also built on stack:
    local_c0 = 0x303030303d686363;  // "cch=0000" LE
    local_b8 = 0x30;               // "0"
    offset = memmem(body_ptr, body_len, &local_c0, 9);

    if (offset != NULL) {
        // Hash the entire body
        hash_state = init(seeds...);
        hash_update(hash_state, body_ptr, body_len);
        hash_value = hash_finalize(hash_state);

        // Convert 5 nibbles to hex (SIMD)
        hex_chars = simd_nibble_to_hex(hash_value);

        // Write in-place: body[offset+4..offset+9] = hex chars
        *(uint32_t*)(body_ptr + 4 + offset) = hex_chars[0..3];
        *(char*)(body_ptr + 8 + offset) = hex_char_5th;
    }
}
}

Key findings
1. Only the standalone binary does this — not the JS code

Confirmed experimentally:

Runtime Replacement active?
Official standalone binary (228MB ELF) YES
bun build --compile --bytecode cli.js (homebrew standalone) NO
bun cli.js (standard Bun runtime) NO
npx @anthropic-ai/claude-code (npm package) NO
Same JavaScript code, same bytecode, same Bun standalone format — different behavior. The replacement is in Anthropic's custom Bun fork, compiled into the native Zig HTTP client.

2. Sentinel is hardcoded as stack immediates — invisible to string search

The pattern cch=00000 is built on the stack using MOV imm64 instructions:

MOV [rsp+X], 0x303030303d686363 ; "cch=0000" in little-endian
MOV byte [rsp+X+8], 0x30 ; "0" — completing "cch=00000"
This is why searching the binary for 63 63 68 3d (cch=) or 0x303030303d686363 as raw bytes in .text yields zero results — the bytes are part of instruction immediates, not contiguous string data.

3. Replacement value is a body hash, not random

The replacement value is deterministic per request body — it's a hash of the entire body with fixed seeds. But since the body changes every request (new messages, timestamps), the hash value changes too, making it appear random.

4. Only the FIRST occurrence is replaced

There is no loop — memmem finds the first match, replacement writes 5 bytes, and the function continues to build Content-Length headers. This means:

If messages[] (which comes BEFORE system[] in the JSON body) contains cch=00000, that gets replaced instead of the billing header in system[0]
The sentinel in system[0] survives — visible to the model as literal cch=00000
5. Header hashes identified

The function uses Zig's std.hash.Wyhash (seed=0, confirmed via Bun.hash()) for case-insensitive header name comparison:

Hash Header
0x58e54d60e1462681 anthropic-version — triggers replacement
0xba5173bf47c57684 connection
0x4cc2547449bddafc upgrade
0xfc8491525da4c9e3 content-length
0x308b6fc4af845531 transfer-encoding
0x2e6b2eda627d6669 user-agent
0x62b7d00b4bd17658 accept-encoding
0xfbb5acdf8484b6ef accept
0x80bd44e8947f37d2 host
0x3dfa2d55bad7bb18 if-modified-since
6. Sentinel history

CC Version cch=00000 in billing header?
1.0.0 – 2.0.0 No billing header at all
2.1.0 – 2.1.34 Billing header exists, but no cch field
2.1.36 cch=00000 introduced
2.1.36 – 2.1.87 Present in all versions

How this causes cache invalidation
The billing header cch=00000 is placed in system[0] by the JS function DG$(). On the standalone binary, the native replacement changes 00000 to a body-hash value (e.g., a3f1b) before the request leaves the process.

In normal sessions (no sentinel in conversation content): Only system[0] is affected. Since system[0] has cache_control: null (no caching), this doesn't break the cache prefix — system[2] (main prompt with cache_control: ephemeral) and messages[] remain stable.

When conversation content contains cch=00000: This happens when:

CLAUDE.md discusses the billing mechanism (our research notes)
Read/Grep tool reads the JS bundle or binary containing the sentinel
User types the sentinel literally
Since messages[] comes BEFORE system[] in the JSON body, the sentinel in messages is replaced FIRST. The actual billing header in system[0] keeps 00000. But the changed value in messages breaks the cache prefix from that point onward.

Methodology
MITM proxy (mitm-addon.py via mitmproxy) capturing all API request/response payloads
Binary comparison: official standalone (228MB) vs homebrew bun build --compile (224MB) — same JS, different behavior
Ghidra 12.0.4 reverse engineering of the standalone ELF, identifying FUN_0374d610 as the HTTP header builder with injected replacement logic
radare2 disassembly for cross-referencing and function analysis
Bun.hash() to verify all header name hashes (Zig Wyhash, seed=0)
npm package analysis across versions 1.0.0 through 2.1.87, identifying cch=00000 introduction in v2.1.36
Controlled experiments: fresh session → resume → consecutive resumes with full payload diffing
62 non-research project transcripts verified: zero accidental billing header leaks into messages
Related
This finding also explains the root cause of #34629 (cache regression on --print --resume since v2.1.69), where the deferred_tools_delta attachment introduced in v2.1.69 causes messages[0] to differ between fresh sessions and resumed sessions, independently breaking cache prefix matching.

So...does this mean open source Claude Code gets around this issue?

jmarianski
jmarianski commented last week
jmarianski
last week
Author
So...does this mean open source Claude Code gets around this issue?

If you mean open code and other alternatives - yes. If you mean if we can find the bug in "open source" code - no. It was in the binary that came alongside js (that leaked).


progerzua
mentioned this last week
/branch causes massive context inflation — 6% to 73% after single message #45419

greenheadHQ
mentioned this last week
feat(claude): Cache TTL statusline 1시간 TTL 대응 + 캐시 히트/미스 표시 greenheadHQ/nixos-config#451
github-actions
github-actions commented 3 days ago
github-actions
bot
3 days ago – with GitHub Actions
This issue has been automatically locked since it was closed and has not had any activity for 7 days. If you're experiencing a similar issue, please file a new issue and reference this one if it's relevant.