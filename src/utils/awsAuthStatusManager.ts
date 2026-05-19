/**
 * Stub AWS auth status manager — not needed for OpenRouter.
 */

export type AwsAuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'failed'

export class AwsAuthStatusManager {
  private static instance: AwsAuthStatusManager

  static getInstance(): AwsAuthStatusManager {
    if (!AwsAuthStatusManager.instance) {
      AwsAuthStatusManager.instance = new AwsAuthStatusManager()
    }
    return AwsAuthStatusManager.instance
  }

  startAuthentication(): void {}
  endAuthentication(_success: boolean): void {}
  addOutput(_output: string): void {}
  setError(_error: string): void {}
}
