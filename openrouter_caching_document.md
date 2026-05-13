
### 第一部份：Prompt Caching

---

title: Prompt Caching
subtitle: Cache prompt messages
headline: Prompt Caching | Reduce AI Model Costs with OpenRouter
canonical-url: 'https://openrouter.ai/docs/guides/best-practices/prompt-caching'
'og:site_name': OpenRouter Documentation
'og:title': Prompt Caching - Optimize AI Model Costs with Smart Caching
'og:description': >-
  Reduce your AI model costs with OpenRouter's prompt caching feature. Learn how
  to cache and reuse responses across OpenAI, Anthropic Claude, and DeepSeek
  models.
'og:image':
  type: url
  value: >-
    https://openrouter.ai/dynamic-og?title=Prompt%20Caching&description=Optimize%20AI%20model%20costs%20with%20OpenRouter
'og:image:width': 1200
'og:image:height': 630
'twitter:card': summary_large_image
'twitter:site': '@OpenRouter'
noindex: false
nofollow: false
---

  ALIBABA_CACHE_READ_MULTIPLIER,
  ALIBABA_CACHE_WRITE_MULTIPLIER,
  ANTHROPIC_CACHE_READ_MULTIPLIER,
  ANTHROPIC_CACHE_WRITE_MULTIPLIER,
  DEEPSEEK_CACHE_READ_MULTIPLIER,
  GOOGLE_CACHE_MIN_TOKENS_2_5_FLASH,
  GOOGLE_CACHE_MIN_TOKENS_2_5_PRO,
  GOOGLE_CACHE_READ_MULTIPLIER,
  GROK_CACHE_READ_MULTIPLIER,
  GROQ_CACHE_READ_MULTIPLIER,
  MOONSHOT_CACHE_READ_MULTIPLIER,
} from '../../../imports/constants';

To save on inference costs, you can enable prompt caching on supported providers and models.

Most providers automatically enable prompt caching, but note that some (see
Alibaba and Anthropic below) require you to enable it on a per-message basis.

When using caching (whether automatically in supported models, or via the `cache_control` property), OpenRouter uses provider sticky routing to maximize cache hits — see [Provider Sticky Routing](#provider-sticky-routing) below for details.

## Provider Sticky Routing

To maximize cache hit rates, OpenRouter uses **provider sticky routing** to route your subsequent requests to the same provider endpoint after a cached request. This works automatically with both implicit caching (e.g. OpenAI, DeepSeek, Gemini 2.5) and explicit caching (e.g. Anthropic `cache_control` breakpoints).

**How it works:**

- After a request that uses prompt caching, OpenRouter remembers which provider served your request.
- Subsequent requests for the same model are routed to the same provider, keeping your cache warm.
- Sticky routing only activates when the provider's cache read pricing is cheaper than regular prompt pricing, ensuring you always benefit from cost savings.
- If the sticky provider becomes unavailable, OpenRouter automatically falls back to the next-best provider.
- Sticky routing is not used when you specify a manual [provider order](/docs/api-reference/provider-preferences) via `provider.order` — in that case, your explicit ordering takes priority.

**Sticky routing granularity:**

Sticky routing is tracked at the account level, per model, and per conversation. OpenRouter identifies conversations by hashing the first system (or developer) message and the first non-system message in each request, so requests that share the same opening messages are routed to the same provider. This means different conversations naturally stick to different providers, improving load-balancing and throughput while keeping caches warm within each conversation.

## Inspecting cache usage

To see how much caching saved on each generation, you can:

1. Click the detail button on the [Activity](/activity) page
2. Use the `/api/v1/generation` API, [documented here](/docs/api/api-reference/generations/get-generation)
3. Check the `prompt_tokens_details` object in the [usage response](/docs/cookbook/administration/usage-accounting) included with every API response

The `cache_discount` field in the response body will tell you how much the response saved on cache usage. Some providers, like Anthropic, will have a negative discount on cache writes, but a positive discount (which reduces total cost) on cache reads.

### Usage object fields

The usage object in API responses includes detailed cache metrics in the `prompt_tokens_details` field:

```json
{
  "usage": {
    "prompt_tokens": 10339,
    "completion_tokens": 60,
    "total_tokens": 10399,
    "prompt_tokens_details": {
      "cached_tokens": 10318,
      "cache_write_tokens": 0
    }
  }
}
```

The key fields are:

- `cached_tokens`: Number of tokens read from the cache (cache hit). When this is greater than zero, you're benefiting from cached content.
- `cache_write_tokens`: Number of tokens written to the cache. This appears on the first request when establishing a new cache entry.

## OpenAI

Caching price changes:

- **Cache writes**: no cost
- **Cache reads**: (depending on the model) charged at 0.25x or 0.50x the price of the original input pricing

[Click here to view OpenAI's cache pricing per model.](https://platform.openai.com/docs/pricing)

Prompt caching with OpenAI is automated and does not require any additional configuration. There is a minimum prompt size of 1024 tokens.

[Click here to read more about OpenAI prompt caching and its limitation.](https://platform.openai.com/docs/guides/prompt-caching)

## Grok

Caching price changes:

- **Cache writes**: no cost
- **Cache reads**: charged at {GROK_CACHE_READ_MULTIPLIER}x the price of the original input pricing

[Click here to view Grok's cache pricing per model.](https://docs.x.ai/docs/models#models-and-pricing)

Prompt caching with Grok is automated and does not require any additional configuration.

## Moonshot AI

Caching price changes:

- **Cache writes**: no cost
- **Cache reads**: charged at {MOONSHOT_CACHE_READ_MULTIPLIER}x the price of the original input pricing

Prompt caching with Moonshot AI is automated and does not require any additional configuration.

## Groq

Caching price changes:

- **Cache writes**: no cost
- **Cache reads**: charged at {GROQ_CACHE_READ_MULTIPLIER}x the price of the original input pricing

Prompt caching with Groq is automated and does not require any additional configuration. Currently available on Kimi K2 models.

[Click here to view Groq's documentation.](https://console.groq.com/docs/prompt-caching)

## Alibaba Qwen

Caching price changes for explicit caching:

- **Cache writes**: charged at {ALIBABA_CACHE_WRITE_MULTIPLIER}x the price of
  the original input pricing
- **Cache reads**: charged at {ALIBABA_CACHE_READ_MULTIPLIER}x the price of
  the original input pricing

Alibaba prompt caching requires explicit cache breakpoints. Add
`cache_control: { "type": "ephemeral" }` to content blocks you want to
cache, using the same syntax as Anthropic explicit caching. Cache writes use a
5-minute TTL.

Alibaba explicit caching is available on `deepseek/deepseek-v3.2`,
`qwen/qwen3-max`, `qwen/qwen-plus`, `qwen/qwen3.6-plus`,
`qwen/qwen3-coder-plus`, and `qwen/qwen3-coder-flash`. Snapshot endpoints,
including `qwen/qwen3.5-plus-02-15` and `qwen/qwen3.5-flash-02-23`, do not
support explicit caching.

### Example

```json
{
  "model": "qwen/qwen3-coder-plus",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Use the reference below when answering."
        },
        {
          "type": "text",
          "text": "HUGE TEXT BODY",
          "cache_control": {
            "type": "ephemeral"
          }
        },
        {
          "type": "text",
          "text": "Summarize the main implementation details."
        }
      ]
    }
  ]
}
```

## Anthropic Claude

Caching price changes:

- **Cache writes (5-minute TTL)**: charged at {ANTHROPIC_CACHE_WRITE_MULTIPLIER}x the price of the original input pricing
- **Cache writes (1-hour TTL)**: charged at 2x the price of the original input pricing
- **Cache reads**: charged at {ANTHROPIC_CACHE_READ_MULTIPLIER}x the price of the original input pricing

There are two ways to enable prompt caching with Anthropic:

- **Automatic caching**: Add a single `cache_control` field at the top level of your request. The system automatically applies the cache breakpoint to the last cacheable block and advances it forward as conversations grow. Best for multi-turn conversations.
- **Explicit cache breakpoints**: Place `cache_control` directly on individual content blocks for fine-grained control over exactly what gets cached. There is a limit of four explicit breakpoints. It is recommended to reserve the cache breakpoints for large bodies of text, such as character cards, CSV data, RAG data, book chapters, etc.

<Note>
  **Automatic caching** (top-level `cache_control`) is only supported when requests are routed to the **Anthropic** provider directly. Amazon Bedrock and Google Vertex AI currently do not support top-level `cache_control` — when it is present, OpenRouter will only route to the Anthropic provider and exclude Bedrock and Vertex endpoints. Explicit per-block `cache_control` breakpoints work across all Anthropic-compatible providers including Bedrock and Vertex.
</Note>

By default, the cache expires after 5 minutes, but you can extend this to 1 hour by specifying `"ttl": "1h"` in the `cache_control` object.

[Click here to read more about Anthropic prompt caching and its limitation.](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

### Supported models

The following Claude models support prompt caching (both automatic and explicit):

- Claude Opus 4.7
- Claude Opus 4.6
- Claude Opus 4.5
- Claude Opus 4.1
- Claude Opus 4
- Claude Sonnet 4.6
- Claude Sonnet 4.5
- Claude Sonnet 4
- Claude Sonnet 3.7 (deprecated)
- Claude Haiku 4.5
- Claude Haiku 3.5

### Minimum token requirements

Each model has a minimum cacheable prompt length:

- **4096 tokens**: Claude Opus 4.7, Claude Opus 4.6, Claude Opus 4.5, Claude Haiku 4.5
- **2048 tokens**: Claude Sonnet 4.6, Claude Haiku 3.5
- **1024 tokens**: Claude Sonnet 4.5, Claude Opus 4.1, Claude Opus 4, Claude Sonnet 4, Claude Sonnet 3.7

Prompts shorter than these minimums will not be cached.

### Cache TTL Options

OpenRouter supports two cache TTL values for Anthropic:

- **5 minutes** (default): `"cache_control": { "type": "ephemeral" }`
- **1 hour**: `"cache_control": { "type": "ephemeral", "ttl": "1h" }`

The 1-hour TTL is useful for longer sessions where you want to maintain cached content across multiple requests without incurring repeated cache write costs. The 1-hour TTL costs more for cache writes (2x base input price vs 1.25x for 5-minute TTL) but can save money over extended sessions by avoiding repeated cache writes. The 1-hour TTL for explicit cache breakpoints is supported across all Claude model providers (Anthropic, Amazon Bedrock, and Google Vertex AI).

### Examples

#### Automatic caching (recommended for multi-turn conversations)

With automatic caching, add `cache_control` at the top level of the request. The system automatically caches all content up to the last cacheable block:

```json
{
  "model": "anthropic/claude-sonnet-4.6",
  "cache_control": { "type": "ephemeral" },
  "messages": [
    {
      "role": "system",
      "content": "You are a historian studying the fall of the Roman Empire. You know the following book very well: HUGE TEXT BODY"
    },
    {
      "role": "user",
      "content": "What triggered the collapse?"
    }
  ]
}
```

As the conversation grows, the cache breakpoint automatically advances to cover the growing message history.

Automatic caching with 1-hour TTL:

```json
{
  "model": "anthropic/claude-sonnet-4.6",
  "cache_control": { "type": "ephemeral", "ttl": "1h" },
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "What is the meaning of life?"
    }
  ]
}
```

#### Explicit cache breakpoints (fine-grained control)

System message caching example (default 5-minute TTL):

```json
{
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "You are a historian studying the fall of the Roman Empire. You know the following book very well:"
        },
        {
          "type": "text",
          "text": "HUGE TEXT BODY",
          "cache_control": {
            "type": "ephemeral"
          }
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What triggered the collapse?"
        }
      ]
    }
  ]
}
```

User message caching example with 1-hour TTL:

```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Given the book below:"
        },
        {
          "type": "text",
          "text": "HUGE TEXT BODY",
          "cache_control": {
            "type": "ephemeral",
            "ttl": "1h"
          }
        },
        {
          "type": "text",
          "text": "Name all the characters in the above book"
        }
      ]
    }
  ]
}
```

## DeepSeek

Caching price changes:

- **Cache writes**: charged at the same price as the original input pricing
- **Cache reads**: charged at {DEEPSEEK_CACHE_READ_MULTIPLIER}x the price of the original input pricing

Prompt caching with DeepSeek is automated and does not require any additional configuration.

## Google Gemini

### Implicit Caching

Gemini 2.5 Pro and 2.5 Flash models now support **implicit caching**, providing automatic caching functionality similar to OpenAI’s automatic caching. Implicit caching works seamlessly — no manual setup or additional `cache_control` breakpoints required.

Pricing Changes:

- No cache write or storage costs.
- Cached tokens are charged at {GOOGLE_CACHE_READ_MULTIPLIER}x the original input token cost.

Note that the TTL is on average 3-5 minutes, but will vary. There is a minimum of {GOOGLE_CACHE_MIN_TOKENS_2_5_FLASH} tokens for Gemini 2.5 Flash, and {GOOGLE_CACHE_MIN_TOKENS_2_5_PRO} tokens for Gemini 2.5 Pro for requests to be eligible for caching.

[Official announcement from Google](https://developers.googleblog.com/en/gemini-2-5-models-now-support-implicit-caching/)

<Tip>
  To maximize implicit cache hits, keep the initial portion of your message
  arrays consistent between requests. Push variations (such as user questions or
  dynamic context elements) toward the end of your prompt/requests.
</Tip>

### Pricing Changes for Cached Requests:

- **Cache Writes:** Charged at the input token cost plus 5 minutes of cache storage, calculated as follows:

```
Cache write cost = Input token price + (Cache storage price × (5 minutes / 60 minutes))
```

- **Cache Reads:** Charged at {GOOGLE_CACHE_READ_MULTIPLIER}× the original input token cost.

### Supported Models and Limitations:

Only certain Gemini models support caching. Please consult Google's [Gemini API Pricing Documentation](https://ai.google.dev/gemini-api/docs/pricing) for the most current details.

Cache Writes have a 5 minute Time-to-Live (TTL) that does not update. After 5 minutes, the cache expires and a new cache must be written.

Gemini models have typically have a 4096 token minimum for cache write to occur. Cached tokens count towards the model's maximum token usage. Gemini 2.5 Pro has a minimum of {GOOGLE_CACHE_MIN_TOKENS_2_5_PRO} tokens, and Gemini 2.5 Flash has a minimum of {GOOGLE_CACHE_MIN_TOKENS_2_5_FLASH} tokens.

### How Gemini Prompt Caching works on OpenRouter:

OpenRouter simplifies Gemini cache management, abstracting away complexities:

- You **do not** need to manually create, update, or delete caches.
- You **do not** need to manage cache names or TTL explicitly.

### How to Enable Gemini Prompt Caching:

Gemini caching in OpenRouter requires you to insert `cache_control` breakpoints explicitly within message content, similar to Anthropic. We recommend using caching primarily for large content pieces (such as CSV files, lengthy character cards, retrieval augmented generation (RAG) data, or extensive textual sources).

<Tip>
  There is not a limit on the number of `cache_control` breakpoints you can
  include in your request. OpenRouter will use only the last breakpoint for
  Gemini caching across normal message content. Including multiple breakpoints
  is safe and can help maintain compatibility with Anthropic, but only the
  final one will be used for Gemini.
</Tip>

<Note>
  Gemini has a single `systemInstruction` field, and cached Gemini content
  treats that `systemInstruction` as immutable. On OpenRouter, this means
  `cache_control` inside the first `system` or `developer` message can cache
  the normalized system prompt, but it cannot preserve an uncached dynamic tail
  inside that same message. If you need part of your prompt to stay dynamic,
  move that dynamic content into a later `user` message instead of appending it
  after a cached block in the first `system` message.
</Note>

### Examples:

#### System Message Caching Example

```json
{
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "You are a historian studying the fall of the Roman Empire. Below is an extensive reference book:"
        },
        {
          "type": "text",
          "text": "HUGE TEXT BODY HERE",
          "cache_control": {
            "type": "ephemeral"
          }
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What triggered the collapse?"
        }
      ]
    }
  ]
}
```

This pattern works when the cached system content is stable across requests. If
you need a dynamic prompt segment, place it in a later `user` message rather
than as uncached trailing content in the first `system` message.

#### User Message Caching Example

```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Based on the book text below:"
        },
        {
          "type": "text",
          "text": "HUGE TEXT BODY HERE",
          "cache_control": {
            "type": "ephemeral"
          }
        },
        {
          "type": "text",
          "text": "List all main characters mentioned in the text above."
        }
      ]
    }
  ]
}
```

---

### 第二部份：Response Caching

---

title: Response Caching
subtitle: Cache responses for identical API requests to save time and money
headline: Response Caching | Cache API Responses with OpenRouter
canonical-url: 'https://openrouter.ai/docs/guides/features/response-caching'
'og:site_name': OpenRouter Documentation
'og:title': Response Caching - Cache Identical API Responses
'og:description': >-
  Cache identical LLM requests with OpenRouter's response caching feature.
  Reduce costs and latency for agent workflows, unit testing, and repeated
  context processing.
'og:image':
  type: url
  value: >-
    https://openrouter.ai/dynamic-og?title=Response%20Caching&description=Cache%20responses%20for%20identical%20API%20requests%20to%20save%20time%20and%20money
'og:image:width': 1200
'og:image:height': 630
'twitter:card': summary_large_image
'twitter:site': '@OpenRouter'
noindex: false
nofollow: false
---

<Note title="Beta">
Response caching is currently in beta. The API and behavior may change.
</Note>

Response caching allows you to cache responses for identical API requests. When a cached response is available, OpenRouter returns it immediately from cache with no billing (all billable usage counters are reported as `0`), reducing both latency and cost.

Response caching is **model-agnostic** and works with every model available on OpenRouter across all [supported endpoints](#supported-endpoints), regardless of provider. Caching operates at the OpenRouter layer before the request reaches any provider, so no provider-side support is required.

Both streaming and non-streaming requests are eligible for caching. Only successful (`200 OK`) responses are cached. Error responses, rate limit responses, and partial results are never cached. Responses containing tool calls are cached normally since they are part of a successful completion. For streaming requests, the cached response is replayed through the same streaming pipeline, so the client receives the same content chunks on a cache hit. The `id` field, `created` timestamp, and `X-Generation-Id` response header in each chunk reflect the new cache-hit generation record, not the original.

## Enabling Caching

There are two ways to enable response caching:

### 1. Per-Request via Headers

Add the `X-OpenRouter-Cache` header to enable caching for individual requests:

<Template data={{
  API_KEY_REF
}}>
<CodeGroup>

```bash title="cURL"
curl -i https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer {{API_KEY_REF}}" \
  -H "Content-Type: application/json" \
  -H "X-OpenRouter-Cache: true" \
  -d '{
    "model": "google/gemini-2.5-flash",
    "messages":
    [
        {
            "role": "user",
            "content": "What is the meaning of life?"
        }
    ]
  }'
```

```python title="Python"

response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {{API_KEY_REF}}",
        "Content-Type": "application/json",
        "X-OpenRouter-Cache": "true",
    },
    json={
        "model": "google/gemini-2.5-flash",
        "messages": [
            {"role": "user", "content": "What is the meaning of life?"}
        ],
    },
)
```

```typescript title="TypeScript (fetch)"
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer {{API_KEY_REF}}',
    'Content-Type': 'application/json',
    'X-OpenRouter-Cache': 'true',
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'user', content: 'What is the meaning of life?' },
    ],
  }),
});
```

```python title="Python (OpenAI SDK)"
from openai import OpenAI

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="{{API_KEY_REF}}",
)

completion = client.chat.completions.create(
  extra_headers={
    "X-OpenRouter-Cache": "true",
  },
  model="google/gemini-2.5-flash",
  messages=[
    {
      "role": "user",
      "content": "What is the meaning of life?"
    }
  ]
)
```

```typescript title="TypeScript (OpenAI SDK)"

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '{{API_KEY_REF}}',
  defaultHeaders: {
    'X-OpenRouter-Cache': 'true',
  },
});

const completion = await openai.chat.completions.create({
  model: 'google/gemini-2.5-flash',
  messages: [
    {
      role: 'user',
      content: 'What is the meaning of life?',
    },
  ],
});
```

</CodeGroup>
</Template>

The first request results in a cache `MISS`. The response is stored and billed normally:

```http title="Response Headers (MISS)"
HTTP/2 200
X-OpenRouter-Cache-Status: MISS
X-OpenRouter-Cache-TTL: 300
```

```json title="Response Body (MISS)"
{
  "id": "gen-abc123",
  "model": "google/gemini-2.5-flash",
  "choices": ["..."],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 120,
    "total_tokens": 135
  }
}
```

Sending the same request again returns a cache `HIT` with zeroed usage and no billing. Each cache hit receives its own unique generation ID (note `gen-def456` below, different from the original `gen-abc123`):

```http title="Response Headers (HIT)"
HTTP/2 200
X-OpenRouter-Cache-Status: HIT
X-OpenRouter-Cache-Age: 12
X-OpenRouter-Cache-TTL: 288
X-Generation-Id: gen-def456
```

```json title="Response Body (HIT)"
{
  "id": "gen-def456",
  "created": 1746000012,
  "model": "google/gemini-2.5-flash",
  "choices": ["..."],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```

### 2. Via Presets

You can enable caching for all requests that use a specific [preset](/docs/guides/features/presets) by configuring these fields in the preset:

| Field | Type | Description |
|---|---|---|
| `cache_enabled` | `boolean` | Enable caching for all requests using this preset |
| `cache_ttl_seconds` | `number` | Default TTL for cached responses (1-86400 seconds, default 300) |

When `cache_enabled` is set on a preset, caching is automatically applied to every request that references that preset. No `X-OpenRouter-Cache` header is required.

Example preset configuration:

```json
{
  "name": "cached-tests",
  "cache_enabled": true,
  "cache_ttl_seconds": 600
}
```

## How It Works

Two requests are considered identical when they share the same API key, model, endpoint type, streaming mode, and request body (including all parameters). When caching is enabled, OpenRouter generates a cache key from these inputs. If an identical request has been made before and the cached response has not expired, the cached response is returned immediately. Changing any of these–including the model, endpoint, or switching between streaming and non-streaming–produces a different cache key and a cache miss.

Since caching operates at the OpenRouter layer before the request is forwarded, it works with every model and provider across the [supported endpoint types](#supported-endpoints).

Cache is **scoped to your API key**. Different API keys, even under the same account or organization, do not share cache. Rotating your API key will result in an empty cache for the new key.

<Note>
**Non-determinism**: Cached responses are returned verbatim regardless of stochastic parameters like `temperature`. If you need fresh responses, use `X-OpenRouter-Cache-Clear: true` or a short TTL.
</Note>

### Cache Key Details

The cache key is derived from your **API key**, **model**, **endpoint type**, **streaming mode**, and a **SHA-256 hash of the request body**. Streaming and non-streaming requests are cached separately, so a `stream: true` request will not return a cached non-streaming response and vice versa. The request body is normalized before hashing, so extra whitespace does not affect the cache key. However, the property order of the JSON body is significant:

- Different property ordering in logically identical JSON (e.g. `{"model":"x","messages":[]}` vs `{"messages":[],"model":"x"}`) will produce different cache keys
- Omitting optional fields vs. explicitly sending defaults (e.g. `temperature: 1.0`) produces different keys
- [Attribution headers](/docs/app-attribution#attribution-headers) (e.g. `HTTP-Referer`, `X-Title`) and [provider-specific headers](/docs/guides/routing/provider-selection#provider-specific-headers) are **not** part of the cache key
- Multimodal requests (images, audio, video, file attachments) are eligible for caching. The full request body, including base64-encoded content, is included in the hash

### Precedence

Request headers and [preset](/docs/guides/features/presets) configuration interact as follows:

1. If a preset explicitly sets `cache_enabled: false`, caching is **disabled** regardless of request headers–the header cannot override a preset opt-out
2. `X-OpenRouter-Cache: false` header **disables** caching even if the preset enables it
3. `X-OpenRouter-Cache: true` **enables** caching when the preset does not configure caching (i.e. `cache_enabled` is absent)–but cannot override a preset that explicitly sets `cache_enabled: false` (rule 1 takes precedence)
4. `X-OpenRouter-Cache-TTL` header **overrides** the preset `cache_ttl_seconds` (default: 300 seconds)
5. If neither header nor preset is set, caching is **off**

### Concurrent Requests

If two identical requests arrive simultaneously before the first response is written to cache, both result in a cache `MISS` and are billed independently. There is no request coalescing.

### Supported Endpoints

| Endpoint | API Format |
|---|---|
| [`/api/v1/chat/completions`](/docs/api/api-reference/chat/send-chat-completion-request) | OpenAI Chat Completions |
| [`/api/v1/responses`](/docs/api/api-reference/responses/create-responses) | OpenAI Responses |
| [`/api/v1/messages`](/docs/api/api-reference/anthropic-messages/create-messages) | Anthropic Messages |
| [`/api/v1/embeddings`](/docs/api/api-reference/embeddings/create-embeddings) | OpenAI Embeddings |

Cache keys include an endpoint type discriminator, so requests to different endpoints with identical bodies will not collide.

<Note>
**Provider caching**: Some providers offer their own prompt caching (e.g. [Anthropic prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching), [OpenAI cached context](https://platform.openai.com/docs/guides/prompt-caching)). Provider caching is separate from OpenRouter response caching and the two can be used together. OpenRouter caching operates at the request level before the call reaches the provider, while provider caching operates within the provider's infrastructure.
</Note>

## Request Headers

| Header | Value | Description |
|---|---|---|
| `X-OpenRouter-Cache` | `true` | Enable caching for this request |
| `X-OpenRouter-Cache` | `false` | Disable caching for this request (overrides preset) |
| `X-OpenRouter-Cache-TTL` | `<seconds>` | Custom TTL (1-86400 seconds, default 300) |
| `X-OpenRouter-Cache-Clear` | `true` | Force a cache refresh for this request |

TTL values that cannot be parsed as an integer (i.e., do not begin with digits) are ignored and fall through to the preset or default TTL. Values beginning with digits are accepted even if they contain trailing non-numeric characters (e.g., `60abc` is treated as `60`); decimal values are truncated (e.g., `1.5` is treated as `1`). Numeric values outside the valid range are clamped to `[1, 86400]`.

## Response Headers

| Header | Value | Description |
|---|---|---|
| `X-OpenRouter-Cache-Status` | `HIT` or `MISS` | Whether the response was served from cache |
| `X-OpenRouter-Cache-Age` | `<seconds>` | How long the response has been cached (on `HIT` only) |
| `X-OpenRouter-Cache-TTL` | `<seconds>` | Remaining TTL on `HIT`; full TTL on `MISS` |

The `X-Generation-Id` header is also present on every response (cached or not) and is not specific to caching. On a cache hit, the generation ID is unique to that hit–it is not reused from the original response.

## TTL (Time-to-Live)

The TTL controls how long a cached response remains valid.

- **Default**: 300 seconds (5 minutes)
- **Range**: 1 second to 86400 seconds (24 hours)

You can customize the TTL per-request using the `X-OpenRouter-Cache-TTL` header, or set a default TTL in your [preset](/docs/guides/features/presets) configuration.

## Cache Clearing

To force a fresh response for a specific request, send the `X-OpenRouter-Cache-Clear: true` header alongside `X-OpenRouter-Cache: true` (or with a preset that has `cache_enabled: true`). This deletes the existing cached entry for that cache key, makes a new request to the provider, and stores the new response. `X-OpenRouter-Cache-Clear` has no effect unless caching is enabled for the request. This does not clear all cached entries–only the one matching the current request.

The new cache entry uses the TTL from the current request's `X-OpenRouter-Cache-TTL` header, the preset `cache_ttl_seconds`, or the default (300 seconds), following the standard [precedence rules](#precedence).

## Billing

Cache hits are **free**. No tokens are consumed and all billable usage counters are reported as `0`. For chat completions and Responses endpoints, `usage.prompt_tokens`, `usage.completion_tokens`, and `usage.total_tokens` are zeroed. For the Embeddings endpoint, `usage.prompt_tokens` and `usage.total_tokens` are zeroed (`completion_tokens` is not present in embeddings responses). For the Anthropic Messages endpoint, `usage.input_tokens` and `usage.output_tokens` are zeroed. You are only billed for the original request that populates the cache (a cache `MISS`).

Cache hits do not count toward provider rate limits since the request never reaches a provider.

## Limitations

- **Disabled for account-level Zero Data Retention ([ZDR](/docs/guides/features/zdr))**: Response caching is not available when account-level ZDR is enforced, since caching requires temporarily storing response data. Per-request `provider.zdr` does not affect cache eligibility.
- **Concurrent identical requests**: If two identical requests arrive before the first response is cached, both result in a `MISS`. See [Concurrent Requests](#concurrent-requests).
- **Cache eviction**: Cached responses may be evicted before TTL expiry under memory pressure. There is no limit on the number of entries you can cache, but eviction under pressure means entries are not guaranteed to survive their full TTL.

## Data Retention

Cached responses are stored in edge infrastructure, retained only for the TTL duration, and automatically evicted upon expiry. Cached data is accessible only via the API key that triggered the caching–no other key, account, or organization can retrieve it. Cached data is not used for training or shared with third parties.

## Use Cases

### Agent Workflows

When an agent workflow fails partway through, you can resume from the point of failure without re-running and re-paying for identical earlier requests. Enable caching at the start of the workflow and all prior steps return immediately from cache on retry.

### Unit Testing

Get repeatable responses for your test suite. After the initial run populates the cache, subsequent identical requests return the same cached response every time at zero cost. For deterministic first-run results, use `temperature: 0` or a fixed `seed`.

### Repeated Identical Requests

If your application makes the same request multiple times (same model, same messages, same parameters), caching ensures only the first call hits the provider. Subsequent identical calls return immediately from cache at zero cost.

### Monitoring Cache Effectiveness

Cache hit and miss status is visible in your [Activity log](/logs). Each cached request appears as a separate entry with a cache indicator, and you can filter the log to show only cached or non-cached requests. Every cache hit receives its own unique generation ID, so you can track individual cached responses independently.

---

### 第三部份：Caching 相關的其他內容

---

## Zero Data Retention (ZDR)

### Caching

Some endpoints/models provide implicit caching of prompts. This keeps repeated prompt data in an in-memory cache in the provider's datacenter, so that the repeated part of the prompt does not need to be re-processed. This can lead to considerable cost savings.

OpenRouter has taken the stance that in-memory caching of prompts is *not* considered "retaining" data, and we therefore allow endpoints/models with implicit caching to be hit when a ZDR routing policy is in effect.

---

## Latency and Performance

### Cache Warming

When OpenRouter's edge caches are cold (typically during the first 1-2 minutes of operation in a new region), you may experience slightly higher latency as the caches warm up. This normalizes once the caches are populated.

---

### Create a chat completion (API Spec)

components:
  schemas:
    AnthropicCacheControlTtl:
      type: string
      enum:
        - 5m
        - 1h
      title: AnthropicCacheControlTtl
    ChatRequestCacheControlType:
      type: string
      enum:
        - ephemeral
      title: ChatRequestCacheControlType
    ChatRequestCacheControl:
      type: object
      properties:
        ttl:
          $ref: '#/components/schemas/AnthropicCacheControlTtl'
        type:
          $ref: '#/components/schemas/ChatRequestCacheControlType'
      required:
        - type
      description: >-
        Enable automatic prompt caching. When set, the system automatically
        applies cache breakpoints to the last cacheable block in the request.
        Currently supported for Anthropic Claude models.
      title: ChatRequestCacheControl

    ChatContentCacheControlType:
      type: string
      enum:
        - ephemeral
      title: ChatContentCacheControlType
    ChatContentCacheControl:
      type: object
      properties:
        ttl:
          $ref: '#/components/schemas/AnthropicCacheControlTtl'
        type:
          $ref: '#/components/schemas/ChatContentCacheControlType'
      required:
        - type
      description: Cache control for the content part
      title: ChatContentCacheControl

    ChatUsagePromptTokensDetails:
      type: object
      properties:
        audio_tokens:
          type: integer
          description: Audio input tokens
        cache_write_tokens:
          type: integer
          description: >-
            Tokens written to cache. Only returned for models with explicit
            caching and cache write pricing.
        cached_tokens:
          type: integer
          description: Cached prompt tokens
        video_tokens:
          type: integer
          description: Video input tokens
      description: Detailed prompt token usage
      title: ChatUsagePromptTokensDetails

    ChatRequest:
      type: object
      properties:
        cache_control:
          $ref: '#/components/schemas/ChatRequestCacheControl'

---

### Create a message (API Spec)

components:
  schemas:
    AnthropicCacheControlTtl:
      type: string
      enum:
        - 5m
        - 1h
      title: AnthropicCacheControlTtl
    AnthropicCacheControlDirectiveType:
      type: string
      enum:
        - ephemeral
      title: AnthropicCacheControlDirectiveType
    AnthropicCacheControlDirective:
      type: object
      properties:
        ttl:
          $ref: '#/components/schemas/AnthropicCacheControlTtl'
        type:
          $ref: '#/components/schemas/AnthropicCacheControlDirectiveType'
      required:
        - type
      title: AnthropicCacheControlDirective

    MessagesRequest:
      type: object
      properties:
        cache_control:
          $ref: '#/components/schemas/AnthropicCacheControlDirective'

    MessagesResultUsage:
      type: object
      properties:
        cache_creation:
          $ref: '#/components/schemas/AnthropicCacheCreation'
        cache_creation_input_tokens:
          type:
            - integer
            - 'null'
        cache_read_input_tokens:
          type:
            - integer
            - 'null'


### 第四部份：Caching 相關說明與 API 定義（續）

---

### Get request & usage metadata for a generation (API Spec)

components:
  schemas:
    GenerationResponseData:
      type: object
      properties:
        cache_discount:
          type:
            - number
            - 'null'
          format: double
          description: Discount applied due to caching
        native_tokens_cached:
          type:
            - integer
            - 'null'
          description: Native cached tokens as reported by provider
        response_cache_source_id:
          type:
            - string
            - 'null'
          description: >-
            If this generation was served from response cache, contains the
            original generation ID. Null otherwise.

---

### 關於 Cache Hits 與 Router Metadata 的關聯性說明：

## Cache Hits

Cache hits never include `openrouter_metadata`. Both streaming and non-streaming cache replays strip the field so clients cannot pin behavior on stale routing data. This is intentional: the metadata you see on a cache miss may not reflect the routing that produced the cached payload.

---

### 其他注意事項：

<Note>
**Provider caching**: Some providers offer their own prompt caching (e.g. [Anthropic prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching), [OpenAI cached context](https://platform.openai.com/docs/guides/prompt-caching)). Provider caching is separate from OpenRouter response caching and the two can be used together. OpenRouter caching operates at the request level before the call reaches the provider, while provider caching operates within the provider's infrastructure.
</Note>

---

### 補充：程式碼庫相關參數 (Imports Constants)

雖然原文件中只列出了常數名稱，但由於這些常數涉及 Caching 的倍率，根據您的指示需保留：

  ALIBABA_CACHE_READ_MULTIPLIER,
  ALIBABA_CACHE_WRITE_MULTIPLIER,
  ANTHROPIC_CACHE_READ_MULTIPLIER,
  ANTHROPIC_CACHE_WRITE_MULTIPLIER,
  DEEPSEEK_CACHE_READ_MULTIPLIER,
  GOOGLE_CACHE_MIN_TOKENS_2_5_FLASH,
  GOOGLE_CACHE_MIN_TOKENS_2_5_PRO,
  GOOGLE_CACHE_READ_MULTIPLIER,
  GROK_CACHE_READ_MULTIPLIER,
  GROQ_CACHE_READ_MULTIPLIER,
  MOONSHOT_CACHE_READ_MULTIPLIER,
} from '../../../imports/constants';

