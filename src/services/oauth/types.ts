/**
 * Stub OAuth types — OpenRouter doesn't use OAuth.
 */

export type SubscriptionType = 'max' | 'pro' | 'enterprise' | 'team' | null

export interface OAuthTokens {
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
  scopes: string[]
  subscriptionType: SubscriptionType
  rateLimitTier: string | null
  profile?: unknown
  tokenAccount?: {
    uuid: string
    emailAddress: string
    organizationUuid: string
  }
}
