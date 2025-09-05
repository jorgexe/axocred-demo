"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Loader2,
  Minimize2,
  Maximize2,
  User,
  MessageSquare,
  Volume2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useVoiceAdvanced } from "@/hooks/useVoiceAdvanced"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isStreaming?: boolean
}

interface AxoChatProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function AxoChat({ isOpen, onClose, className }: AxoChatProps) {
  // Voice functionality with advanced implementation
  const {
    isVoiceMode,
    isRecording: isVoiceRecording,
    isPlaying,
    isListening,
    voiceMode,
    voiceEnergy,
    toggleVoiceMode,
    toggleListeningMode,
    startContinuousListening,
    stopContinuousListening,
    error: voiceError
  } = useVoiceAdvanced()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "¡Hola! Soy Axo, tu asistente financiero inteligente. ¿En qué puedo ayudarte hoy?",
      role: "assistant",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create assistant message placeholder for streaming
      const assistantMessageId = `assistant-${Date.now()}`
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setStreamingMessageId(assistantMessageId)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }))
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response stream")
      }

      let accumulatedContent = ""
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                accumulatedContent += data.content
                
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }
            } catch {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      // Mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      )
      
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.",
        role: "assistant",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev.filter(msg => msg.id !== streamingMessageId), errorMessage])
    } finally {
      setIsLoading(false)
      setStreamingMessageId(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const audioChunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        // TODO: Implement speech-to-text
        console.log("Audio recorded:", audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-MX", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  if (!isOpen) return null

  return (
    <div className={cn(
      "fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-50",
      isMinimized ? "w-80 h-16" : "w-96 h-[600px]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary/5 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm ring-2 ring-primary/20">
            <Image
              src="/images/axo.png"
              alt="Axo"
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Axo</h3>
            <p className="text-xs text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              En línea
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Voice/Text Mode Toggle */}
          <Button
            variant={isVoiceMode ? "default" : "ghost"}
            size="icon"
            onClick={toggleVoiceMode}
            className={cn(
              "h-8 w-8",
              isVoiceMode && "bg-primary text-white hover:bg-primary/90"
            )}
            title={isVoiceMode ? "Cambiar a modo texto" : "Cambiar a modo voz"}
          >
            {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-2",
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === "user" 
                    ? "bg-primary text-white" 
                    : "bg-white shadow-sm ring-2 ring-primary/20"
                )}>
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Image
                      src="/images/axo.png"
                      alt="Axo"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  )}
                </div>

                {/* Message bubble */}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 relative",
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                )}>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-current opacity-50 animate-pulse ml-1" />
                    )}
                  </p>
                  <span className={cn(
                    "text-xs mt-1 block",
                    message.role === "user" 
                      ? "text-primary-foreground/70" 
                      : "text-gray-500"
                  )}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Text or Voice Mode */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            {voiceError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{voiceError}</p>
              </div>
            )}
            
            {isVoiceMode ? (
              /* Voice Mode */
              <div className="space-y-3">
                {/* Voice Mode Toggle */}
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant={voiceMode === 'push-to-talk' ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleListeningMode}
                    className="text-xs"
                  >
                    🤚 Presionar para hablar
                  </Button>
                  <Button
                    variant={voiceMode === 'continuous' ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleListeningMode}
                    className="text-xs"
                  >
                    🎤 Escucha continua (AudioWorklet)
                  </Button>
                </div>
                
                {/* Voice Energy Indicator for continuous mode */}
                {voiceMode === 'continuous' && isListening && voiceEnergy !== undefined && (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs text-gray-500">Energía de voz:</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-100"
                        style={{ width: `${Math.min(voiceEnergy * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(voiceEnergy * 100)}%</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center">
                  {voiceMode === 'push-to-talk' ? (
                    <Button
                      type="button"
                      onMouseDown={() => startContinuousListening()}
                      onMouseUp={() => stopContinuousListening()}
                      onTouchStart={() => startContinuousListening()}
                      onTouchEnd={() => stopContinuousListening()}
                      disabled={isPlaying}
                      className={cn(
                        "w-16 h-16 rounded-full transition-all duration-200",
                        isVoiceRecording 
                          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                          : "bg-primary hover:bg-primary/90",
                        isPlaying && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isVoiceRecording ? (
                        <MicOff className="w-6 h-6 text-white" />
                      ) : (
                        <Mic className="w-6 h-6 text-white" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={isListening ? stopContinuousListening : startContinuousListening}
                      disabled={isPlaying}
                      className={cn(
                        "w-16 h-16 rounded-full transition-all duration-200",
                        isVoiceRecording 
                          ? "bg-red-500 animate-pulse" 
                          : isListening 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-primary hover:bg-primary/90",
                        isPlaying && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isVoiceRecording ? (
                        <MicOff className="w-6 h-6 text-white" />
                      ) : isListening ? (
                        <Mic className="w-6 h-6 text-white animate-pulse" />
                      ) : (
                        <Mic className="w-6 h-6 text-white" />
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="text-center space-y-1">
                  {voiceMode === 'continuous' && (
                    <div className="flex items-center justify-center space-x-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isListening ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      )} />
                      <span className="text-xs text-gray-500">
                        {isListening ? "AudioWorklet + VAD activo..." : "Desactivado"}
                      </span>
                    </div>
                  )}
                  
                  {isVoiceRecording ? (
                    <p className="text-sm text-gray-600">🎤 Detectando voz... {voiceMode === 'continuous' ? 'VAD activo' : 'Mantén presionado'}</p>
                  ) : isPlaying ? (
                    <p className="text-sm text-gray-600">🔊 Axo está respondiendo...</p>
                  ) : voiceMode === 'continuous' ? (
                    <p className="text-sm text-gray-600">Habla naturalmente, detección automática de voz activada</p>
                  ) : (
                    <p className="text-sm text-gray-600">Presiona y mantén el micrófono para hablar</p>
                  )}
                </div>
              </div>
            ) : (
              /* Text Mode */
              <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    disabled={isLoading}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 text-sm text-gray-900 placeholder:text-gray-500 bg-white"
                  />
                  
                  {/* Voice button for text mode */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8",
                      isRecording && "text-red-500 animate-pulse"
                    )}
                  >
                    {isRecording ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-12 px-4 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            )}
            
            {/* Quick actions - Only show in text mode */}
            {!isVoiceMode && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage("¿Cómo puedo mejorar mi historial crediticio?")}
                  disabled={isLoading}
                  className="text-xs text-gray-700 hover:text-gray-900 border-gray-300 hover:border-primary/50"
                >
                  💳 Historial crediticio
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage("¿Puedo solicitar un aumento de límite?")}
                  disabled={isLoading}
                  className="text-xs text-gray-700 hover:text-gray-900 border-gray-300 hover:border-primary/50"
                >
                  📈 Aumentar límite
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage("Tengo problemas para pagar este mes")}
                  disabled={isLoading}
                  className="text-xs text-gray-700 hover:text-gray-900 border-gray-300 hover:border-primary/50"
                >
                  🤝 Necesito ayuda
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
