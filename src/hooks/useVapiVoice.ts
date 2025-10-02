"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from 'react'

interface VapiVoiceHookReturn {
  isVoiceMode: boolean
  isRecording: boolean
  isPlaying: boolean
  isConnected: boolean
  toggleVoiceMode: () => Promise<void>
  startCall: () => Promise<void>
  endCall: () => void
  error: string | null
  transcript: string
}

export function useVapiVoice(): VapiVoiceHookReturn {
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')

  const vapiRef = useRef<any>(null)

  const initializeVapi = useCallback(async () => {
    if (typeof window === 'undefined') return null

    try {
      const { default: Vapi } = await import('@vapi-ai/web')
      
      if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
        throw new Error('VAPI_PUBLIC_KEY not configured')
      }

      console.log('🔧 Initializing Vapi with key:', process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY?.substring(0, 10) + '...')
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)
      
      // Event listeners
      vapi.on('call-start', () => {
        console.log('📞 Vapi call started')
        setIsConnected(true)
        setIsRecording(true)
        setError(null)
      })

      vapi.on('call-end', () => {
        console.log('📞 Vapi call ended')
        setIsConnected(false)
        setIsRecording(false)
        setIsPlaying(false)
      })

      vapi.on('speech-start', () => {
        console.log('🎤 User started speaking')
        setIsRecording(true)
      })

      vapi.on('speech-end', () => {
        console.log('🎤 User stopped speaking')
        setIsRecording(false)
      })

      vapi.on('message', (message: unknown) => {
        if ((message as { type?: string })?.type === 'transcript') {
          const msg = message as { role: string; transcript: string }
          console.log(`${msg.role}: ${msg.transcript}`)
          setTranscript(prev => prev + `\n${msg.role}: ${msg.transcript}`)
        }
      })

      vapi.on('error', (error: unknown) => {
        console.error('Vapi error:', error)
        setError((error as Error)?.message || 'Vapi connection error')
        setIsConnected(false)
        setIsRecording(false)
      })

      return vapi
    } catch (error) {
      console.error('Failed to initialize Vapi:', error)
      setError('Failed to initialize voice system')
      return null
    }
  }, [])

  const startCall = useCallback(async () => {
    try {
      if (!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID) {
        throw new Error('VAPI_ASSISTANT_ID not configured')
      }

      if (!vapiRef.current) {
        vapiRef.current = await initializeVapi()
        if (!vapiRef.current) {
          throw new Error('Failed to initialize Vapi')
        }
      }

      console.log('🚀 Starting Vapi call with assistant:', process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID)
      await vapiRef.current.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID)
      
    } catch (error) {
      console.error('Failed to start Vapi call:', error)
      setError(error instanceof Error ? error.message : 'Failed to start call')
    }
  }, [initializeVapi])

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      console.log('🛑 Ending Vapi call...')
      vapiRef.current.stop()
      vapiRef.current = null
    }
    setIsConnected(false)
    setIsRecording(false)
    setIsPlaying(false)
  }, [])

  const toggleVoiceMode = useCallback(async () => {
    if (!isVoiceMode) {
      try {
        setIsVoiceMode(true)
        await startCall()
      } catch (error) {
        setIsVoiceMode(false)
        setError('Failed to start voice mode')
        console.error('Voice mode error:', error)
      }
    } else {
      endCall()
      setIsVoiceMode(false)
    }
  }, [isVoiceMode, startCall, endCall])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [])

  return {
    isVoiceMode,
    isRecording,
    isPlaying,
    isConnected,
    toggleVoiceMode,
    startCall,
    endCall,
    error,
    transcript
  }
}
