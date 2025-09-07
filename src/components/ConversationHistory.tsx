"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  History, 
  MessageSquare, 
  Trash2, 
  Clock,
  Search,
  X,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { conversationStorage, type ConversationSummary, type StoredConversation } from "@/lib/conversationStorage"

interface ConversationHistoryProps {
  isOpen: boolean
  onClose: () => void
  onLoadConversation: (conversationId: string) => void
  onNewConversation: () => void
  className?: string
}

export default function ConversationHistory({ 
  isOpen, 
  onClose, 
  onLoadConversation,
  onNewConversation,
  className 
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedConversation, setSelectedConversation] = useState<StoredConversation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Load conversations when component opens
  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen])

  const loadConversations = () => {
    setIsLoading(true)
    try {
      const summaries = conversationStorage.getConversationSummaries()
      setConversations(summaries)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConversationClick = (conversationId: string) => {
    const conversation = conversationStorage.getConversation(conversationId)
    if (conversation) {
      setSelectedConversation(conversation)
    }
  }

  const handleLoadConversation = () => {
    if (selectedConversation && onLoadConversation) {
      onLoadConversation(selectedConversation.id)
      onClose()
    }
  }

  const handleDeleteConversation = (conversationId: string) => {
    conversationStorage.deleteConversation(conversationId)
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    setShowDeleteConfirm(null)
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null)
    }
  }

  const handleClearAll = () => {
    conversationStorage.clearAllConversations()
    setConversations([])
    setSelectedConversation(null)
  }

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString("es-MX", { 
        hour: "2-digit", 
        minute: "2-digit" 
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("es-MX", { 
        weekday: "short",
        hour: "2-digit", 
        minute: "2-digit" 
      })
    } else {
      return date.toLocaleDateString("es-MX", { 
        day: "numeric",
        month: "short",
        year: diffInHours > 24 * 365 ? "numeric" : undefined
      })
    }
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("es-MX", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  if (!isOpen) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",
      className
    )}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-primary/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Historial de Conversaciones</h2>
              <p className="text-sm text-gray-600">
                {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''} guardada{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onNewConversation()
                onClose()
              }}
              className="text-primary border-primary hover:bg-primary/10"
            >
              Nueva Conversación
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

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p className="text-sm">
                    {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones guardadas'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 group",
                        selectedConversation?.id === conversation.id && "bg-primary/10 border border-primary/20"
                      )}
                      onClick={() => handleConversationClick(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-sm">
                            {conversation.title}
                          </h3>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(conversation.updatedAt)}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {conversation.messageCount}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(conversation.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {conversations.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar todo el historial
                </Button>
              </div>
            )}
          </div>

          {/* Conversation Detail */}
          <div className="w-1/2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Detail Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.title}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedConversation.createdAt)} • {selectedConversation.messages.length} mensajes
                      </p>
                    </div>
                    <Button
                      onClick={handleLoadConversation}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Cargar conversación
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          message.role === "user"
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={cn(
                          "text-xs mt-1 opacity-70",
                          message.role === "user" ? "text-white/70" : "text-gray-500"
                        )}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona una conversación para ver los detalles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Eliminar conversación</h3>
            <p className="text-gray-600 text-sm mb-4">
              ¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeleteConversation(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}