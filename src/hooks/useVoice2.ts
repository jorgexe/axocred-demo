import { useState, useRef, useCallback } from 'react'

interface VoiceHookReturn {
  isVoiceMode: boolean
  isRecording: boolean
  isPlaying: boolean
  toggleVoiceMode: () => void
  startRecording: () => Promise<void>
  stopRecording: () => void
  playAudio: (audioData: string) => Promise<void>
  error: string | null
}

export function useVoice(): VoiceHookReturn {
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const playAudio = useCallback(async (audioData: string) => {
    try {
      setIsPlaying(true)
      
      // Decode base64 audio data
      const binaryString = atob(audioData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      // Create audio context and buffer
      const audioContext = new AudioContext({ sampleRate: 24000 })
      const audioBuffer = audioContext.createBuffer(1, bytes.length / 2, 24000)
      const channelData = audioBuffer.getChannelData(0)
      
      // Convert Int16 to Float32
      for (let i = 0; i < channelData.length; i++) {
        const int16Value = (bytes[i * 2 + 1] << 8) | bytes[i * 2]
        channelData[i] = int16Value / 32768.0
      }
      
      // Play audio
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      
      source.onended = () => {
        setIsPlaying(false)
      }
      
      source.start()
      
    } catch (err) {
      setError('Error playing audio')
      setIsPlaying(false)
      console.error('Audio playback error:', err)
    }
  }, [])

  const processAudioBlob = useCallback(async (audioBlob: Blob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // Convert to 16-bit PCM
      const pcmData = audioBuffer.getChannelData(0)
      const pcm16 = new Int16Array(pcmData.length)
      
      for (let i = 0; i < pcmData.length; i++) {
        pcm16[i] = Math.max(-32768, Math.min(32767, Math.floor(pcmData[i] * 32768)))
      }
      
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)))
      
      // Send to API
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendAudio',
          audioData: base64Audio,
          sessionId: sessionIdRef.current
        })
      })
      
      const data = await response.json()
      if (data.success && data.audioResponse) {
        await playAudio(data.audioResponse)
      }
      
    } catch (err) {
      setError('Error processing audio')
      console.error('Audio processing error:', err)
    }
  }, [playAudio])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const startRecording = useCallback(async () => {
    if (!isVoiceMode) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      chunksRef.current = []
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudioBlob(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start(1000) // Collect data every 1 second
      setIsRecording(true)
      setError(null)
      
    } catch (err) {
      setError('Error accessing microphone')
      console.error('Recording error:', err)
    }
  }, [isVoiceMode, processAudioBlob])

  const toggleVoiceMode = useCallback(async () => {
    if (!isVoiceMode) {
      // Starting voice mode
      try {
        const response = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' })
        })
        
        const data = await response.json()
        if (data.success) {
          sessionIdRef.current = data.sessionId
          setIsVoiceMode(true)
          setError(null)
        } else {
          setError('Failed to start voice session')
        }
      } catch (err) {
        setError('Error starting voice session')
        console.error('Voice session error:', err)
      }
    } else {
      // Stopping voice mode
      try {
        if (isRecording) {
          stopRecording()
        }
        
        await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop' })
        })
        
        setIsVoiceMode(false)
        sessionIdRef.current = null
        setError(null)
      } catch (err) {
        setError('Error stopping voice session')
        console.error('Voice session stop error:', err)
      }
    }
  }, [isVoiceMode, isRecording, stopRecording])

  return {
    isVoiceMode,
    isRecording,
    isPlaying,
    toggleVoiceMode,
    startRecording,
    stopRecording,
    playAudio,
    error
  }
}
