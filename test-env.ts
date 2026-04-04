import { profileCheckpoint } from "./src/utils/startupProfiler.js";
// Mock process.env for testing
process.env.OPENROUTER_API_KEY = "sk-or-test-key";

// Import the logic from cli.tsx or just re-run it
if (process.env.OPENROUTER_API_KEY) {
    process.env.ANTHROPIC_BASE_URL ??= "https://openrouter.ai/api";
    process.env.ANTHROPIC_AUTH_TOKEN ??= process.env.OPENROUTER_API_KEY;
    process.env.ANTHROPIC_API_KEY = "";
}

console.log("ANTHROPIC_BASE_URL:", process.env.ANTHROPIC_BASE_URL);
console.log("ANTHROPIC_AUTH_TOKEN:", process.env.ANTHROPIC_AUTH_TOKEN);
console.log("ANTHROPIC_API_KEY:", JSON.stringify(process.env.ANTHROPIC_API_KEY));
