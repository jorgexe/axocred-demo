import { useState, useRef, useCallback } from 'react'
import { useVAD } from './useVAD'

interface VoiceHookReturn {
  isVoiceMode: boolean
  isRecording: boolean
  isPlaying: boolean
  isListening: boolean
  voiceMode: 'push-to-talk' | 'continuous'
  voiceEnergy: number
  toggleVoiceMode: () => Promise<void>
  toggleListeningMode: () => void
  startContinuousListening: () => Promise<void>
  stopContinuousListening: () => void
  error: string | null
}

export function useVoiceAdvanced(): VoiceHookReturn {
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceMode, setVoiceMode] = useState<'push-to-talk' | 'continuous'>('continuous')
  const [voiceEnergy, setVoiceEnergy] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Refs para manejo simple de audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const isProcessingRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const isListeningRef = useRef<boolean>(false)

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up audio...')
    
    setIsRecording(false)
    setIsListening(false)
    setIsPlaying(false)
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch {}
      audioContextRef.current = null
    }
    
    setVoiceEnergy(0)
  }, [])

  const playAudioResponse = useCallback(async (audioData: string, mimeType: string = 'audio/wav') => {
    try {
      setIsPlaying(true)
      // Decodificar base64 y reproducir
      const audio = new Audio(`data:${mimeType};base64,${audioData}`)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => setIsPlaying(false)
      await audio.play()
    } catch (err) {
      console.error('Audio playback error:', err)
      setIsPlaying(false)
    }
  }, [])

  const sendAudioToAPI = useCallback(async (audioBlob: Blob) => {
    if (isProcessingRef.current) return
    
    try {
      isProcessingRef.current = true
      console.log(`📤 Sending audio blob: ${audioBlob.size} bytes`)
      
      // Convertir WebM/Opus a PCM16 16kHz en el cliente (requerido por Google Live API)
      async function decodeToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
        const ctx = new AudioContext()
        try {
          const buf = await blob.arrayBuffer()
          const audioBuffer: AudioBuffer = await new Promise((resolve, reject) => {
            ctx.decodeAudioData(buf, resolve, reject)
          })
          return audioBuffer
        } finally {
          try { await ctx.close() } catch {}
        }
      }

      async function resampleTo16kMono(buffer: AudioBuffer): Promise<Float32Array> {
        const targetRate = 16000
        const length = Math.ceil(buffer.duration * targetRate)
        const offline = new OfflineAudioContext(1, length, targetRate)
        const src = offline.createBufferSource()
        src.buffer = buffer
        src.connect(offline.destination)
        src.start()
        const rendered = await offline.startRendering()
        return rendered.getChannelData(0)
      }

      function floatToPCM16LE(float32: Float32Array): Uint8Array {
        const out = new Uint8Array(float32.length * 2)
        const view = new DataView(out.buffer)
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]))
          view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
        }
        return out
      }

      function uint8ToBase64(u8: Uint8Array): string {
        let binary = ''
        const chunk = 0x8000
        for (let i = 0; i < u8.length; i += chunk) {
          const sub = u8.subarray(i, i + chunk)
          binary += String.fromCharCode.apply(null, Array.from(sub))
        }
        return btoa(binary)
      }
      
      let base64Audio: string
  const mimeToSend = 'audio/pcm;rate=16000'
      try {
        const decoded = await decodeToAudioBuffer(audioBlob)
        const mono16k = await resampleTo16kMono(decoded)
        const pcm = floatToPCM16LE(mono16k)
        base64Audio = uint8ToBase64(pcm)
        console.log(`🔁 Transcoded to PCM16: ${pcm.length} bytes`)
      } catch (e) {
        console.error('⚠️ PCM transcode failed, cannot send to Live API that requires PCM.', e)
        setError('Fallo al convertir audio a PCM')
        return
      }
      
      // Iniciar sesión si no existe
      const startResponse = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })
      
      const startData = await startResponse.json()
      if (!startData.success) {
        throw new Error('Failed to start voice session')
      }
      
    // Enviar audio (PCM16 LE 16kHz)
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendAudio',
      audioData: base64Audio,
      audioMimeType: mimeToSend
        })
      })
      
      console.log(`📥 Voice API response status: ${response.status}`)
      
      const data = await response.json()
      console.log('📥 Voice API response:', data)
      
      if (data.success && data.audioResponse) {
        console.log(`🔊 Playing response: ${data.audioResponse.length} chars, type: ${data.audioMimeType || 'audio/wav'}`)
        await playAudioResponse(data.audioResponse, data.audioMimeType || 'audio/wav')
      } else {
        console.warn('❌ No audio response received')
      }
      
    } catch (err) {
      console.error('Error sending audio:', err)
      setError('Error enviando audio')
    } finally {
      isProcessingRef.current = false
    }
  }, [playAudioResponse])

  // VAD simplificado
  const { feed: feedVAD } = useVAD({
    threshold: 0.01,
    silenceMs: 2000, // 2 segundos de silencio
    onStart: () => {
      console.log('🎤 VAD: Voice detected - starting recording')
      setIsRecording(true)
      
      // Iniciar MediaRecorder
      if (streamRef.current && !mediaRecorderRef.current) {
        chunksRef.current = []
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
          mimeType: 'audio/webm;codecs=opus'
        })
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data)
          }
        }
        
        mediaRecorderRef.current.onstop = async () => {
          if (chunksRef.current.length > 0) {
            const recordedType = mediaRecorderRef.current?.mimeType || 'audio/webm;codecs=opus'
            const audioBlob = new Blob(chunksRef.current, { type: recordedType })
            console.log(`🔊 Audio recording complete: ${audioBlob.size} bytes`)
            await sendAudioToAPI(audioBlob)
          }
          mediaRecorderRef.current = null
        }
        
        mediaRecorderRef.current.start()
      }
    },
    onEnd: () => {
      console.log('🔇 VAD: Silence detected - stopping recording')
      setIsRecording(false)
      
      // Detener MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    },
    onVoiceDetected: (energy) => {
      setVoiceEnergy(energy)
    }
  })

  const initializeAudio = useCallback(async () => {
    try {
      console.log('🎵 Initializing audio with VAD...')
      
      // Obtener micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream
      
      // Crear AudioContext para VAD
  const audioContext = new AudioContext()
      await audioContext.resume().catch(() => {})
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.2
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Procesar audio para VAD
      const processAudio = () => {
        if (!isListeningRef.current) return
        const an = analyserRef.current
        if (!an) return

        // Obtener datos en el dominio del tiempo (0..255, centrado en 128)
        const timeDomain = new Uint8Array(an.fftSize)
        an.getByteTimeDomainData(timeDomain)

        // Mapear a Int16 PCM centrado en 0
        const samples = new Int16Array(timeDomain.length)
        for (let i = 0; i < timeDomain.length; i++) {
          const v = (timeDomain[i] - 128) / 128 // -1..1 aprox
          const s = Math.max(-1, Math.min(1, v))
          samples[i] = (s * 32767) | 0
        }

        feedVAD(samples)

        if (isListeningRef.current) {
          requestAnimationFrame(processAudio)
        }
      }
      
      setIsListening(true)
      isListeningRef.current = true
      setError(null)
      processAudio()
      
    } catch (err) {
      console.error('Audio initialization error:', err)
      setError(err instanceof Error ? err.message : 'Audio setup failed')
      cleanup()
    }
  }, [feedVAD, cleanup])

  const toggleVoiceMode = useCallback(async () => {
    if (!isVoiceMode) {
      try {
        await initializeAudio()
        setIsVoiceMode(true)
      } catch {
        setError('Failed to start voice mode')
      }
    } else {
      cleanup()
      setIsVoiceMode(false)
    }
  }, [isVoiceMode, initializeAudio, cleanup])

  const toggleListeningMode = useCallback(() => {
    setVoiceMode(prev => prev === 'push-to-talk' ? 'continuous' : 'push-to-talk')
  }, [])

  const startContinuousListening = useCallback(async () => {
    if (!isVoiceMode) {
      await toggleVoiceMode()
    }
  }, [isVoiceMode, toggleVoiceMode])

  const stopContinuousListening = useCallback(() => {
  isListeningRef.current = false
  cleanup()
  }, [cleanup])

  return {
    isVoiceMode,
    isRecording,
    isPlaying,
    isListening,
    voiceMode,
    voiceEnergy,
    toggleVoiceMode,
    toggleListeningMode,
    startContinuousListening,
    stopContinuousListening,
    error
  }
}
