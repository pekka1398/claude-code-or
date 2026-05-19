/**
 * Stub — OpenRouter doesn't use OAuth profiles.
 */

export function getOauthProfileFromOauthToken(_token: string): Promise<null> {
  return Promise.resolve(null)
}

export function getOauthProfileFromApiKey(_apiKey: string): Promise<null> {
  return Promise.resolve(null)
}
