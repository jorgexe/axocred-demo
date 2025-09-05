import { useRef, useCallback } from 'react'

interface VADOptions {
  threshold?: number
  silenceMs?: number
  onStart?: () => void
  onEnd?: () => void
  onVoiceDetected?: (energy: number) => void
}

export function useVAD(options: VADOptions = {}) {
  const {
    threshold = 0.01,
    silenceMs = 1500, // 1.5 segundos de silencio
    onStart,
    onEnd,
    onVoiceDetected
  } = options

  const speakingRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const energyHistoryRef = useRef<number[]>([])

  const computeEnergy = useCallback((int16Array: Int16Array): number => {
    let sum = 0
    for (let i = 0; i < int16Array.length; i++) {
      const sample = int16Array[i] / 32768
      sum += sample * sample
    }
    return Math.sqrt(sum / int16Array.length)
  }, [])

  const feed = useCallback((int16Array: Int16Array) => {
    const energy = computeEnergy(int16Array)
    
    // Mantener historial de energía para suavizar detección
    energyHistoryRef.current.push(energy)
    if (energyHistoryRef.current.length > 5) {
      energyHistoryRef.current.shift()
    }
    
    // Usar promedio de las últimas muestras para evitar false positives
    const avgEnergy = energyHistoryRef.current.reduce((a, b) => a + b, 0) / energyHistoryRef.current.length
    
    onVoiceDetected?.(avgEnergy)
    
    if (avgEnergy > threshold) {
      // Voz detectada
      if (!speakingRef.current) {
        speakingRef.current = true
        onStart?.()
      }
      
      // Limpiar timer de silencio
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      
      // Configurar nuevo timer de silencio
      timerRef.current = setTimeout(() => {
        if (speakingRef.current) {
          speakingRef.current = false
          onEnd?.()
        }
        timerRef.current = null
      }, silenceMs)
    }
  }, [threshold, silenceMs, onStart, onEnd, onVoiceDetected, computeEnergy])

  const reset = useCallback(() => {
    speakingRef.current = false
    energyHistoryRef.current = []
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const isSpeaking = useCallback(() => speakingRef.current, [])

  return {
    feed,
    reset,
    isSpeaking
  }
}
