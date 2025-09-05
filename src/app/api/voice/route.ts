import { GoogleGenAI, Modality } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY!
})

// Use the native audio model for voice interactions
const model = "gemini-2.5-flash-preview-native-audio-dialog"

const config = {
  responseModalities: [Modality.AUDIO],
  systemInstruction: `Eres Axo, el asistente financiero inteligente de AxoCred. 
  
  Características de tu personalidad:
  - Hablas de manera amigable y profesional
  - Siempre ofreces soluciones proactivas para problemas financieros
  - Tu especialidad es la renegociación de deudas y planes de pago flexibles
  - Respondes en español mexicano de manera natural y conversacional
  - Eres empático pero eficiente
  - Mantienes un tono optimista y de apoyo
  
  Contexto del usuario:
  - Es cliente de un neobanco (estilo NuBank)
  - Tiene un próximo pago de $3,000 MXN el 15 de septiembre
  - Su límite de crédito es $50,000 MXN con $18,500 MXN usados
  - Balance actual: $12,450.50 MXN
  
  Siempre que sea relevante, ofrece opciones de renegociación o planes de pago más flexibles.`,
  contextWindowCompression: { slidingWindow: {} }
}

interface RealtimeInput {
  audio?: {
    data: string
    mimeType: string
  }
}

interface VoiceSession {
  close: () => void
  sendRealtimeInput: (input: RealtimeInput) => void
}

interface VoiceMessage {
  serverContent?: {
    turnComplete?: boolean
  }
  data?: string
}

let activeSession: VoiceSession | null = null
let responseQueue: VoiceMessage[] = []

async function waitMessage(): Promise<VoiceMessage> {
  let done = false
  let message: VoiceMessage | undefined = undefined
  while (!done) {
    message = responseQueue.shift()
    if (message) {
      done = true
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  return message!
}

async function handleTurn(): Promise<VoiceMessage[]> {
  const turns = []
  let done = false
  const startTime = Date.now()
  const timeout = 10000 // 10 segundos timeout
  
  while (!done) {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      console.warn('⚠️ handleTurn timeout reached')
      break
    }
    
    const message = await waitMessage()
    console.log('📨 Received message:', message)
    turns.push(message)
    
    if (message.serverContent && message.serverContent.turnComplete) {
      console.log('✅ Turn complete received')
      done = true
    }
  }
  
  console.log(`🏁 handleTurn finished with ${turns.length} messages`)
  return turns
}

export async function POST(request: NextRequest) {
  try {
  const { action, audioData, audioMimeType } = await request.json()

    if (action === 'start') {
      // Start a new voice session
      if (activeSession) {
        activeSession.close()
      }

      responseQueue = []

      activeSession = await ai.live.connect({
        model: model,
        callbacks: {
          onopen: function () {
            console.debug('Voice session opened')
          },
          onmessage: function (message: VoiceMessage) {
            responseQueue.push(message)
          },
          onerror: function (e: unknown) {
            if (e instanceof Error) {
              console.error('Voice session error:', e.message)
            } else {
              console.error('Voice session error:', e)
            }
          },
          onclose: function (e: unknown) {
            console.debug('Voice session closed:', e)
          },
        },
        config: config,
      }) as VoiceSession

      return NextResponse.json({ 
        success: true, 
        sessionId: 'voice_session_' + Date.now(),
        message: 'Voice session started' 
      })
    }

  if (action === 'sendAudio' && audioData) {
      console.log('📤 Received audio data, length:', audioData.length)
      
      if (!activeSession) {
        console.error('❌ No active voice session')
        return NextResponse.json({ 
          success: false, 
          error: 'No active voice session' 
        }, { status: 400 })
      }

    console.log('📡 Sending audio to Google Live API...')
      
      // Send audio data to the model
      activeSession.sendRealtimeInput({
        audio: {
          data: audioData,
      // Use the mime type provided by the client (e.g. 'audio/webm;codecs=opus')
      // Fall back to PCM if not provided
      mimeType: audioMimeType || "audio/pcm;rate=16000"
        }
      })

      console.log('⏳ Waiting for response from Google...')
      
      // Wait for response
      const turns = await handleTurn()
      
      console.log('📥 Received turns:', turns.length)

      // Combine audio data from response
      const combinedAudio = turns.reduce((acc, turn) => {
        if (turn.data) {
          console.log('🔊 Adding audio data, length:', turn.data.length)
          return acc + turn.data
        }
        return acc
      }, '')

      console.log('✅ Final combined audio length:', combinedAudio.length)

      // Convert base64 PCM to WAV for browser playback if we're dealing with raw PCM
      function base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = Buffer.from(base64, 'base64').toString('binary')
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes
      }

      function pcm16ToWavBase64(base64Pcm: string, sampleRate = 16000, numChannels = 1): { base64: string, mime: string } {
        const pcmBytes = base64ToUint8Array(base64Pcm)
        const bytesPerSample = 2
        const blockAlign = numChannels * bytesPerSample
        const byteRate = sampleRate * blockAlign
        const dataSize = pcmBytes.length
        const buffer = new ArrayBuffer(44 + dataSize)
        const view = new DataView(buffer)

        // RIFF header
        function writeString(offset: number, str: string) {
          for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i))
          }
        }

        writeString(0, 'RIFF')
        view.setUint32(4, 36 + dataSize, true)
        writeString(8, 'WAVE')
        writeString(12, 'fmt ')
        view.setUint32(16, 16, true) // Subchunk1Size for PCM
        view.setUint16(20, 1, true) // PCM format
        view.setUint16(22, numChannels, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, byteRate, true)
        view.setUint16(32, blockAlign, true)
        view.setUint16(34, 16, true) // bitsPerSample
        writeString(36, 'data')
        view.setUint32(40, dataSize, true)

        // PCM data
        const wavBytes = new Uint8Array(buffer)
        wavBytes.set(pcmBytes, 44)

        const wavBase64 = Buffer.from(wavBytes).toString('base64')
        return { base64: wavBase64, mime: 'audio/wav' }
      }

      // Try to return PCM as WAV for playback; if combinedAudio is empty just return turns for debugging
      if (combinedAudio) {
        const wav = pcm16ToWavBase64(combinedAudio, 16000, 1)
        return NextResponse.json({
          success: true,
          audioResponse: wav.base64,
          audioMimeType: wav.mime,
          turns: turns
        })
      }

      return NextResponse.json({ success: false, error: 'No audio generated', turns })
    }

    if (action === 'stop') {
      if (activeSession) {
        activeSession.close()
        activeSession = null
      }
      return NextResponse.json({ 
        success: true, 
        message: 'Voice session stopped' 
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error) {
    console.error('Voice API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
