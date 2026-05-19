/**
 * Stub AWS auth status manager — not needed for OpenRouter.
 */

export type AwsAuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'failed'

export type AwsAuthStatusState = {
  isAuthenticating: boolean
  error: string | null
  output: string[]
}

export class AwsAuthStatusManager {
  private static instance: AwsAuthStatusManager

  static getInstance(): AwsAuthStatusManager {
    if (!AwsAuthStatusManager.instance) {
      AwsAuthStatusManager.instance = new AwsAuthStatusManager()
    }
    return AwsAuthStatusManager.instance
  }

  getStatus(): AwsAuthStatusState {
    return { isAuthenticating: false, error: null, output: [] }
  }

  subscribe(_callback: (status: AwsAuthStatusState) => void): () => void {
    return () => {}
  }

  startAuthentication(): void {}
  endAuthentication(_success: boolean): void {}
  addOutput(_output: string): void {}
  setError(_error: string): void {}
}
