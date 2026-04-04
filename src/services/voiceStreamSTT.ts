import { getGlobalConfig } from '../utils/config.js'
import { logForDebugging } from '../utils/debug.js'

export type VoiceStreamCallbacks = {
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (error: string, opts?: { fatal?: boolean }) => void
  onClose: () => void
  onReady: (connection: VoiceStreamConnection) => void
}

export type FinalizeSource = 'openrouter_stt' | 'error'

export type VoiceStreamConnection = {
  send: (audioChunk: Buffer) => void
  finalize: () => Promise<FinalizeSource>
  close: () => void
  isConnected: () => boolean
}

function getWavHeader(dataLength: number): Buffer {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(dataLength + 36, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)    // Subchunk1Size
  header.writeUInt16LE(1, 20)     // AudioFormat (PCM)
  header.writeUInt16LE(1, 22)     // NumChannels (Mono)
  header.writeUInt32LE(16000, 24) // SampleRate
  header.writeUInt32LE(32000, 28) // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  header.writeUInt16LE(2, 32)     // BlockAlign (NumChannels * BitsPerSample/8)
  header.writeUInt16LE(16, 34)    // BitsPerSample
  header.write('data', 36)
  header.writeUInt32LE(dataLength, 40)
  return header
}

export async function connectVoiceStream(
  callbacks: VoiceStreamCallbacks,
  _options?: { language?: string; keyterms?: string[] },
): Promise<VoiceStreamConnection | null> {
  logForDebugging('[openrouter_stt] Initializing OpenRouter STT Bridge')

  let audioBuffer = Buffer.alloc(0)
  let isConnected = true

  const connection: VoiceStreamConnection = {
    send(audioChunk: Buffer): void {
      if (!isConnected) return
      audioBuffer = Buffer.concat([audioBuffer, audioChunk])
    },

    async finalize(): Promise<FinalizeSource> {
      if (!isConnected) return 'error'
      isConnected = false

      logForDebugging(`[openrouter_stt] Finalizing, size: ${audioBuffer.length} bytes`)

      if (audioBuffer.length === 0) {
        callbacks.onClose()
        return 'openrouter_stt'
      }

      try {
        const config = getGlobalConfig()
        const apiKey = process.env.OPENROUTER_API_KEY || config.primaryApiKey

        if (!apiKey) {
          callbacks.onError('Missing API Key for transcription (OPENROUTER_API_KEY or primaryApiKey)')
          return 'error'
        }

        // Add WAV header for better compatibility with Gemini
        const wavData = Buffer.concat([getWavHeader(audioBuffer.length), audioBuffer])
        const base64Audio = wavData.toString('base64')

        const model = 'google/gemini-3-flash-preview'
        logForDebugging(`[openrouter_stt] Sending transcription request to ${model}`)

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/anthropics/claude-code',
            'X-Title': 'Claude Code STT Bridge'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Please transcribe the following audio clip exactly as spoken. Return only the transcript, no labels, no timestamps, no intro text. If there is no audible speech, return an empty string.'
                  },
                  {
                    type: 'image_url', // OpenRouter handles base64 audio via multimodality
                    image_url: {
                      url: `data:audio/wav;base64,${base64Audio}`
                    }
                  }
                ]
              }
            ]
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const result = await response.json() as any
        const text = result.choices?.[0]?.message?.content?.trim() || ''

        logForDebugging(`[openrouter_stt] Transcription SUCCESS: "${text}"`)

        if (text) {
          callbacks.onTranscript(text, true)
        }

        callbacks.onClose()
        return 'openrouter_stt'

      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        logForDebugging(`[openrouter_stt] Transcription FAILED: ${msg}`)
        callbacks.onError(msg)
        return 'error'
      }
    },

    close(): void {
      isConnected = false
      audioBuffer = Buffer.alloc(0)
      callbacks.onClose()
    },

    isConnected(): boolean {
      return isConnected
    }
  }

  // Ready signal
  setTimeout(() => callbacks.onReady(connection), 0)

  return connection
}

export function isVoiceStreamAvailable(): boolean {
  return true
}
