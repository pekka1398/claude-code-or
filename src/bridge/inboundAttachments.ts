/**
 * Resolve file_uuid attachments on inbound bridge user messages — stubbed for OpenRouter build.
 */

import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages.mjs'

export type InboundAttachment = { file_uuid: string; file_name: string }

export function extractInboundAttachments(): InboundAttachment[] {
  return []
}

export async function resolveInboundAttachments(): Promise<string> {
  return ''
}

export function prependPathRefs(
  content: string | Array<ContentBlockParam>,
): string | Array<ContentBlockParam> {
  return content
}

export async function resolveAndPrepend(
  _msg: unknown,
  content: string | Array<ContentBlockParam>,
): Promise<string | Array<ContentBlockParam>> {
  return content
}
