/**
 * Stub OAuth service — OpenRouter doesn't use OAuth.
 */

export class OAuthService {
  async startOAuthFlow(_onUrl: (url: string) => void, _opts?: unknown): Promise<never> {
    throw new Error('OAuth not available — use OPENROUTER_API_KEY')
  }
  cleanup(): void {}
}
