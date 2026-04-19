Sample code and API for GLM 5.1
OpenRouter normalizes requests and responses across providers for you.
Create API key
OpenRouter supports reasoning-enabled models that can show their step-by-step thinking process. Use the reasoning parameter in your request to enable reasoning, and access the reasoning_details array in the response to see the model's internal reasoning before the final answer. When continuing a conversation, preserve the complete reasoning_details when passing messages back to the model so it can continue reasoning from where it left off. Learn more about reasoning tokens.

In the examples below, the OpenRouter-specific headers are optional. Setting them allows your app to appear on the OpenRouter leaderboards.

cURL
OpenRouter SDK
OpenAI SDK
Raw

Copy
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
  "model": "z-ai/glm-5.1",
  "messages": [
    {
      "role": "user",
      "content": "How many r`s are in the word `strawberry?`"
    }
  ],
  "reasoning": {
    "enabled": true
  }
}'
Using third-party SDKs
For information about using third-party SDKs and frameworks with OpenRouter, please see our frameworks documentation.

See the Request docs for all possible fields, and Parameters for explanations of specific sampling parameters.







Providers for GLM 5.1

OpenRouter routes requests to the best providers that are able to handle your prompt size and parameters, with fallbacks to maximize uptime. 

Filter quantization

Sort by
Chutes

US
fp8
Latency
8.73s
Throughput
12tps
Uptime
Uptime 78.3 percent

Total Context
202.8K
Max Output
65.5K
Input Price
$0.95
/M tokens
Output Price
$3.15
/M tokens
Cache Read
$0.475
/M tokens
io.net

US
fp8
Latency
2.48s
Throughput
30tps
Uptime
Uptime 99.8 percent

Total Context
202.8K
Max Output
131.1K
Input Price
$1.06
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
GMICloud

US
fp8
Latency
2.53s
Throughput
34tps
Uptime
Uptime 86.2 percent

Total Context
202.8K
Max Output
202.8K
Input Price
$1.12
/M tokens
Output Price
$3.52
/M tokens
Cache Read
$0.208
/M tokens
NovitaAI

US
fp8
Latency
2.27s
Throughput
30tps
Uptime
Uptime 98.6 percent

Total Context
204.8K
Max Output
131.1K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
Parasail

US
fp8
Latency
3.19s
Throughput
14tps
Uptime
Uptime 94.2 percent

Total Context
202.8K
Max Output
131.1K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
Together

US
Latency
1.69s
Throughput
62tps
Uptime
Uptime 96.4 percent

Total Context
202.8K
Max Output
202.8K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Fireworks

US
Latency
1.61s
Throughput
29tps
Uptime
Uptime 100.0 percent

Total Context
202.8K
Max Output
202.8K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
Z.ai

SG
Latency
7.11s
Throughput
17tps
Uptime
Uptime 98.1 percent

Total Context
202.8K
Max Output
131.1K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
Friendli

US
Latency
1.46s
Throughput
46tps
Uptime
Uptime 100.0 percent

Total Context
202.8K
Max Output
202.8K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
Inceptron

SE
fp8
Latency
0.98s
Throughput
23tps
Uptime
Uptime 98.4 percent

Total Context
202.8K
Max Output
202.8K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
SiliconFlow

SG
fp8
Latency
2.43s
Throughput
25tps
Uptime
Uptime 100.0 percent

Total Context
204.8K
Max Output
131.1K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
DeepInfra

US
fp4
Latency
1.16s
Throughput
41tps
Uptime
Uptime 99.9 percent

Total Context
202.8K
Max Output
202.8K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
AtlasCloud

US
fp8
Latency
2.59s
Throughput
57tps
Uptime
Uptime 100.0 percent

Total Context
202.8K
Max Output
202.8K
Input Price
$1.40
/M tokens
Output Price
$4.40
/M tokens
Cache Read
$0.26
/M tokens
Venice

US
fp8
Latency
1.10s
Throughput
30tps
Uptime
Uptime 98.9 percent

Total Context
200K
Max Output
24K
Input Price
$1.75
/M tokens
Output Price
$5.50
/M tokens
Cache Read
$0.325
/M tokens
Morph

US
Latency
2.14s
Throughput
31tps
Uptime
Uptime 69.3 percent

Total Context
202.8K
Max Output
131.1K
Input Price
$1.90
/M tokens
Output Price
$4.90
/M tokens
Show less
Performance for GLM 5.1

Compare different providers across OpenRouter

All locations
Throughput

Friendli
Avg
61 tok/s
Together
Avg
50 tok/s
io.net
Avg
43 tok/s
Latency

Friendli
Avg
0.96 s
Parasail
Avg
1.02 s
Inceptron
Avg
1.03 s
E2E Latency

Friendli
Avg
4.73 s
SiliconFlow
Avg
11.52 s
DeepInfra
Avg
12.41 s
Tool Call Error Rate

Friendli
Avg
0.21 %
Morph
Avg
0.54 %
Chutes
Avg
0.65 %
Structured Output Error Rate

Friendli
Avg
6.16 %
Chutes
Avg
7.65 %
Parasail
Avg
9.18 %
Sorting API Example
Effective Pricing for GLM 5.1

Actual cost per million tokens across providers over the past hour
Weighted Average
Weighted Avg Input Price

$0.613

per 1M tokens

Weighted Avg Output Price

$4.40

per 1M tokens

Provider	Input $/1M	Output $/1M	Cache Hit Rate
SiliconFlow
$0.361	$4.40	91.1%
Z.ai
$0.719	$4.40	59.8%
Friendli
$0.854	$4.40	47.9%
AtlasCloud
$0.921	$4.40	42.0%
Parasail
$0.889	$4.40	44.8%
Venice
$1.37	$5.50	26.6%
io.net
$0.955	$4.40	13.2%
Together
$1.40	$4.40	6.1%
GMICloud
$0.928	$3.52	21.1%
DeepInfra
$0.324	$4.40	94.4%
Chutes
$0.931	$3.15	3.9%
Fireworks
$0.761	$4.40	56.0%
NovitaAI
$1.34	$4.40	4.8%
Inceptron
$1.06	$4.40	29.4%
Morph
$1.90	$4.90	25.8%





***

title: API Reference
subtitle: An overview of OpenRouter's API
headline: OpenRouter API Reference | Complete API Documentation
canonical-url: '[https://openrouter.ai/docs/api/reference/overview](https://openrouter.ai/docs/api/reference/overview)'
'og:site\_name': OpenRouter Documentation
'og:title': OpenRouter API Reference - Complete Documentation
'og:description': >-
Comprehensive guide to OpenRouter's API. Learn about request/response schemas,
authentication, parameters, and integration with multiple AI model providers.
'og:image':
type: url
value: >-
[https://openrouter.ai/dynamic-og?title=OpenRouter%20API%20Reference\&description=Comprehensive%20guide%20to%20OpenRouter's%20API](https://openrouter.ai/dynamic-og?title=OpenRouter%20API%20Reference\&description=Comprehensive%20guide%20to%20OpenRouter's%20API).
'og:image:width': 1200
'og:image:height': 630
'twitter:card': summary\_large\_image
'twitter:site': '@OpenRouter'
noindex: false
nofollow: false
---------------

OpenRouter's request and response schemas are very similar to the OpenAI Chat API, with a few small differences. At a high level, **OpenRouter normalizes the schema across models and providers** so you only need to learn one.

## OpenAPI Specification

The complete OpenRouter API is documented using the OpenAPI specification. You can access the specification in either YAML or JSON format:

* **YAML**: [https://openrouter.ai/openapi.yaml](https://openrouter.ai/openapi.yaml)
* **JSON**: [https://openrouter.ai/openapi.json](https://openrouter.ai/openapi.json)

These specifications can be used with tools like [Swagger UI](https://swagger.io/tools/swagger-ui/), [Postman](https://www.postman.com/), or any OpenAPI-compatible code generator to explore the API or generate client libraries.

## Requests

### Completions Request Format

Here is the request schema as a TypeScript type. This will be the body of your `POST` request to the `/api/v1/chat/completions` endpoint (see the [quick start](/docs/quickstart) above for an example).

For a complete list of parameters, see the [Parameters](/docs/api-reference/parameters).

<CodeGroup>
  ```typescript title="Request Schema"
  // Definitions of subtypes are below
  type Request = {
    // Either "messages" or "prompt" is required
    messages?: Message[];
    prompt?: string;

    // If "model" is unspecified, uses the user's default
    model?: string; // See "Supported Models" section

    // Allows to force the model to produce specific output format.
    // See "Structured Outputs" section below and models page for which models support it.
    response_format?: ResponseFormat;

    stop?: string | string[];
    stream?: boolean; // Enable streaming

    // Plugins to extend model capabilities (PDF parsing, response healing)
    // See "Plugins" section: openrouter.ai/docs/guides/features/plugins
    plugins?: Plugin[];

    // See LLM Parameters (openrouter.ai/docs/api/reference/parameters)
    max_tokens?: number; // Range: [1, context_length)
    temperature?: number; // Range: [0, 2]

    // Tool calling
    // Will be passed down as-is for providers implementing OpenAI's interface.
    // For providers with custom interfaces, we transform and map the properties.
    // Otherwise, we transform the tools into a YAML template. The model responds with an assistant message.
    // See models supporting tool calling: openrouter.ai/models?supported_parameters=tools
    tools?: Tool[];
    tool_choice?: ToolChoice;

    // Advanced optional parameters
    seed?: number; // Integer only
    top_p?: number; // Range: (0, 1]
    top_k?: number; // Range: [1, Infinity) Not available for OpenAI models
    frequency_penalty?: number; // Range: [-2, 2]
    presence_penalty?: number; // Range: [-2, 2]
    repetition_penalty?: number; // Range: (0, 2]
    logit_bias?: { [key: number]: number };
    top_logprobs: number; // Integer only
    min_p?: number; // Range: [0, 1]
    top_a?: number; // Range: [0, 1]

    // Reduce latency by providing the model with a predicted output
    // https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs
    prediction?: { type: 'content'; content: string };

    // OpenRouter-only parameters
    // See "Model Routing" section: openrouter.ai/docs/guides/features/model-routing
    models?: string[];
    route?: 'fallback';
    // See "Provider Routing" section: openrouter.ai/docs/guides/routing/provider-selection
    provider?: ProviderPreferences;
    user?: string; // A stable identifier for your end-users. Used to help detect and prevent abuse.

    // Debug options (streaming only)
    debug?: {
      echo_upstream_body?: boolean; // If true, returns the transformed request body sent to the provider
    };
  };

  // Subtypes:

  type TextContent = {
    type: 'text';
    text: string;
  };

  type ImageContentPart = {
    type: 'image_url';
    image_url: {
      url: string; // URL or base64 encoded image data
      detail?: string; // Optional, defaults to "auto"
    };
  };

  type ContentPart = TextContent | ImageContentPart;

  type Message =
    | {
        role: 'user' | 'assistant' | 'system';
        // ContentParts are only for the "user" role:
        content: string | ContentPart[];
        // If "name" is included, it will be prepended like this
        // for non-OpenAI models: `{name}: {content}`
        name?: string;
      }
    | {
        role: 'tool';
        content: string;
        tool_call_id: string;
        name?: string;
      };

  type FunctionDescription = {
    description?: string;
    name: string;
    parameters: object; // JSON Schema object
  };

  type Tool = {
    type: 'function';
    function: FunctionDescription;
  };

  type ToolChoice =
    | 'none'
    | 'auto'
    | {
        type: 'function';
        function: {
          name: string;
        };
      };

  // Response format for structured outputs
  type ResponseFormat =
    | { type: 'json_object' }
    | {
        type: 'json_schema';
        json_schema: {
          name: string;
          strict?: boolean;
          schema: object; // JSON Schema object
        };
      };

  // Plugin configuration
  type Plugin = {
    id: string; // 'web', 'file-parser', 'response-healing', 'context-compression'
    enabled?: boolean;
    // Additional plugin-specific options
    [key: string]: unknown;
  };
  ```
</CodeGroup>

### Structured Outputs

The `response_format` parameter allows you to enforce structured JSON responses from the model. OpenRouter supports two modes:

* `{ type: 'json_object' }`: Basic JSON mode - the model will return valid JSON
* `{ type: 'json_schema', json_schema: { ... } }`: Strict schema mode - the model will return JSON matching your exact schema

For detailed usage and examples, see [Structured Outputs](/docs/guides/features/structured-outputs). To find models that support structured outputs, check the [models page](https://openrouter.ai/models?supported_parameters=structured_outputs).

### Plugins

OpenRouter plugins extend model capabilities with features like web search, PDF processing, response healing, and context compression. Enable plugins by adding a `plugins` array to your request:

```json
{
  "plugins": [
    { "id": "web" },
    { "id": "response-healing" }
  ]
}
```

Available plugins include `web` (real-time web search), `file-parser` (PDF processing), `response-healing` (automatic JSON repair), and `context-compression` (middle-out prompt compression). For detailed configuration options, see [Plugins](/docs/guides/features/plugins)

### Headers

OpenRouter allows you to specify some optional headers to identify your app and make it discoverable to users on our site.

* `HTTP-Referer`: Identifies your app on openrouter.ai
* `X-OpenRouter-Title`: Sets/modifies your app's title (`X-Title` also accepted)
* `X-OpenRouter-Categories`: Assigns marketplace categories (see [App Attribution](/docs/app-attribution))

<CodeGroup>
  ```typescript title="TypeScript"
  fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer <OPENROUTER_API_KEY>',
      'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
      'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-5.2',
      messages: [
        {
          role: 'user',
          content: 'What is the meaning of life?',
        },
      ],
    }),
  });
  ```
</CodeGroup>

<Info title="Model routing">
  If the `model` parameter is omitted, the user or payer's default is used.
  Otherwise, remember to select a value for `model` from the [supported
  models](/models) or [API](/api/v1/models), and include the organization
  prefix. OpenRouter will select the least expensive and best GPUs available to
  serve the request, and fall back to other providers or GPUs if it receives a
  5xx response code or if you are rate-limited.
</Info>

<Info title="Streaming">
  [Server-Sent Events
  (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format)
  are supported as well, to enable streaming *for all models*. Simply send
  `stream: true` in your request body. The SSE stream will occasionally contain
  a "comment" payload, which you should ignore (noted below).
</Info>

<Info title="Non-standard parameters">
  If the chosen model doesn't support a request parameter (such as `logit_bias`
  in non-OpenAI models, or `top_k` for OpenAI), then the parameter is ignored.
  The rest are forwarded to the underlying model API.
</Info>

### Assistant Prefill

OpenRouter supports asking models to complete a partial response. This can be useful for guiding models to respond in a certain way.

To use this features, simply include a message with `role: "assistant"` at the end of your `messages` array.

<CodeGroup>
  ```typescript title="TypeScript"
  fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer <OPENROUTER_API_KEY>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-5.2',
      messages: [
        { role: 'user', content: 'What is the meaning of life?' },
        { role: 'assistant', content: "I'm not sure, but my best guess is" },
      ],
    }),
  });
  ```
</CodeGroup>

## Responses

### CompletionsResponse Format

OpenRouter normalizes the schema across models and providers to comply with the [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat).

This means that `choices` is always an array, even if the model only returns one completion. Each choice will contain a `delta` property if a stream was requested and a `message` property otherwise. This makes it easier to use the same code for all models.

Here's the response schema as a TypeScript type:

```typescript TypeScript
// Definitions of subtypes are below
type Response = {
  id: string;
  // Depending on whether you set "stream" to "true" and
  // whether you passed in "messages" or a "prompt", you
  // will get a different output shape
  choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[];
  created: number; // Unix timestamp
  model: string;
  object: 'chat.completion' | 'chat.completion.chunk';

  system_fingerprint?: string; // Only present if the provider supports it

  // Usage data is always returned for non-streaming.
  // When streaming, usage is returned exactly once in the final chunk
  // before the [DONE] message, with an empty choices array.
  usage?: ResponseUsage;
};
```

```typescript
// OpenRouter always returns detailed usage information.
// Token counts are calculated using the model's native tokenizer.

type ResponseUsage = {
  /** Including images, input audio, and tools if any */
  prompt_tokens: number;
  /** The tokens generated */
  completion_tokens: number;
  /** Sum of the above two fields */
  total_tokens: number;

  /** Breakdown of prompt tokens (optional) */
  prompt_tokens_details?: {
    cached_tokens: number;        // Tokens cached by the endpoint
    cache_write_tokens?: number;  // Tokens written to cache (models with explicit caching)
    audio_tokens?: number;        // Tokens used for input audio
    video_tokens?: number;        // Tokens used for input video
  };

  /** Breakdown of completion tokens (optional) */
  completion_tokens_details?: {
    reasoning_tokens?: number;    // Tokens generated for reasoning
    audio_tokens?: number;        // Tokens generated for audio output
    image_tokens?: number;        // Tokens generated for image output
  };

  /** Cost in credits (optional) */
  cost?: number;
  /** Whether request used Bring Your Own Key */
  is_byok?: boolean;
  /** Detailed cost breakdown (optional) */
  cost_details?: {
    upstream_inference_cost?: number;             // Only shown for BYOK requests
    upstream_inference_prompt_cost: number;
    upstream_inference_completions_cost: number;
  };

  /** Server-side tool usage (optional) */
  server_tool_use?: {
    web_search_requests?: number;
  };
};
```

```typescript
// Subtypes:
type NonChatChoice = {
  finish_reason: string | null;
  text: string;
  error?: ErrorResponse;
};

type NonStreamingChoice = {
  finish_reason: string | null;
  native_finish_reason: string | null;
  message: {
    content: string | null;
    role: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type StreamingChoice = {
  finish_reason: string | null;
  native_finish_reason: string | null;
  delta: {
    content: string | null;
    role?: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type ErrorResponse = {
  code: number; // See "Error Handling" section
  message: string;
  metadata?: Record<string, unknown>; // Contains additional error information such as provider details, the raw error message, etc.
};

type ToolCall = {
  id: string;
  type: 'function';
  function: FunctionCall;
};
```

Here's an example:

```json
{
  "id": "gen-xxxxxxxxxxxxxx",
  "choices": [
    {
      "finish_reason": "stop", // Normalized finish_reason
      "native_finish_reason": "stop", // The raw finish_reason from the provider
      "message": {
        // will be "delta" if streaming
        "role": "assistant",
        "content": "Hello there!"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 4,
    "total_tokens": 14,
    "prompt_tokens_details": {
      "cached_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0
    },
    "cost": 0.00014
  },
  "model": "openai/gpt-3.5-turbo" // Could also be "anthropic/claude-2.1", etc, depending on the "model" that ends up being used
}
```

### Finish Reason

OpenRouter normalizes each model's `finish_reason` to one of the following values: `tool_calls`, `stop`, `length`, `content_filter`, `error`.

Some models and providers may have additional finish reasons. The raw finish\_reason string returned by the model is available via the `native_finish_reason` property.

### Querying Cost and Stats

The token counts returned in the completions API response are calculated using the model's native tokenizer. Credit usage and model pricing are based on these native token counts.

You can also use the returned `id` to query for the generation stats (including token counts and cost) after the request is complete via the `/api/v1/generation` endpoint. This is useful for auditing historical usage or when you need to fetch stats asynchronously.

<CodeGroup>
  ```typescript title="Query Generation Stats"
  const generation = await fetch(
    'https://openrouter.ai/api/v1/generation?id=$GENERATION_ID',
    { headers },
  );

  const stats = await generation.json();
  ```
</CodeGroup>

Please see the [Generation](/docs/api-reference/get-a-generation) API reference for the full response shape.

Note that token counts are also available in the `usage` field of the response body for non-streaming completions.



***

title: Anthropic Agent SDK
subtitle: Using OpenRouter with the Anthropic Agent SDK
headline: Anthropic Agent SDK Integration | OpenRouter SDK Support
canonical-url: '[https://openrouter.ai/docs/guides/community/anthropic-agent-sdk](https://openrouter.ai/docs/guides/community/anthropic-agent-sdk)'
'og:site\_name': OpenRouter Documentation
'og:title': Anthropic Agent SDK Integration - OpenRouter SDK Support
'og:description': >-
Integrate OpenRouter using the Anthropic Agent SDK. Complete guide for
building AI agents with OpenRouter in Python and TypeScript.
'og:image':
type: url
value: >-
[https://openrouter.ai/dynamic-og?title=Anthropic%20Agent%20SDK\&description=Anthropic%20Agent%20SDK%20Integration](https://openrouter.ai/dynamic-og?title=Anthropic%20Agent%20SDK\&description=Anthropic%20Agent%20SDK%20Integration)
'og:image:width': 1200
'og:image:height': 630
'twitter:card': summary\_large\_image
'twitter:site': '@OpenRouter'
noindex: false
nofollow: false
---------------

The [Anthropic Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) lets you build AI agents programmatically using Python or TypeScript. Since the Agent SDK uses Claude Code as its runtime, you can connect it to OpenRouter using the same environment variables.

## Configuration

Set the following environment variables before running your agent:

```bash
export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
export ANTHROPIC_AUTH_TOKEN="$OPENROUTER_API_KEY"
export ANTHROPIC_API_KEY="" # Important: Must be explicitly empty
```

## TypeScript Example

Install the SDK:

```bash
npm install @anthropic-ai/claude-agent-sdk
```

Create an agent that uses OpenRouter:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

// Environment variables should be set before running:
// ANTHROPIC_BASE_URL=https://openrouter.ai/api
// ANTHROPIC_AUTH_TOKEN=your_openrouter_api_key
// ANTHROPIC_API_KEY=""

async function main() {
  for await (const message of query({
    prompt: "Find and fix the bug in auth.py",
    options: {
      allowedTools: ["Read", "Edit", "Bash"],
    },
  })) {
    if (message.type === "assistant") {
      console.log(message.message.content);
    }
  }
}

main();
```

## Python Example

Install the SDK:

```bash
pip install claude-agent-sdk
```

Create an agent that uses OpenRouter:

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

# Environment variables should be set before running:
# ANTHROPIC_BASE_URL=https://openrouter.ai/api
# ANTHROPIC_AUTH_TOKEN=your_openrouter_api_key
# ANTHROPIC_API_KEY=""

async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Edit", "Bash"]
        )
    ):
        print(message)

asyncio.run(main())
```

<Info>
  **Tip:** The Agent SDK inherits all the same model override capabilities as Claude Code. You can use `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_OPUS_MODEL`, and other environment variables to route your agent to different models on OpenRouter. See the [Claude Code integration guide](/docs/guides/coding-agents/claude-code-integration) for more details.
</Info>
