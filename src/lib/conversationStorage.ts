interface ConversationMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface StoredConversation {
  id: string
  title: string
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
}

interface ConversationSummary {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  lastMessage: string
}

class ConversationStorage {
  private readonly STORAGE_KEY = 'axocred_conversations'
  private readonly MAX_CONVERSATIONS = 50

  /**
   * Save a conversation to localStorage
   */
  saveConversation(messages: ConversationMessage[]): string {
    if (messages.length === 0) return ''

    const conversations = this.getAllConversations()
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Generate title from first user message or use default
    const firstUserMessage = messages.find(m => m.role === 'user')
    const title = this.generateTitle(firstUserMessage?.content || 'Nueva conversación')
    
    const conversation: StoredConversation = {
      id: conversationId,
      title,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    conversations.unshift(conversation)
    
    // Keep only the most recent conversations
    if (conversations.length > this.MAX_CONVERSATIONS) {
      conversations.splice(this.MAX_CONVERSATIONS)
    }

    this.saveToStorage(conversations)
    return conversationId
  }

  /**
   * Get all conversations from localStorage
   */
  getAllConversations(): StoredConversation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const conversations = JSON.parse(stored) as StoredConversation[]
      return conversations.map(conv => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    } catch (error) {
      console.error('Error loading conversations:', error)
      return []
    }
  }

  /**
   * Get conversation summaries for the history list
   */
  getConversationSummaries(): ConversationSummary[] {
    const conversations = this.getAllConversations()
    return conversations.map(conv => {
      const lastMessage = conv.messages[conv.messages.length - 1]
      return {
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length,
        lastMessage: lastMessage ? this.truncateText(lastMessage.content, 100) : ''
      }
    })
  }

  /**
   * Get a specific conversation by ID
   */
  getConversation(id: string): StoredConversation | null {
    const conversations = this.getAllConversations()
    return conversations.find(conv => conv.id === id) || null
  }

  /**
   * Delete a conversation by ID
   */
  deleteConversation(id: string): boolean {
    const conversations = this.getAllConversations()
    const index = conversations.findIndex(conv => conv.id === id)
    
    if (index === -1) return false
    
    conversations.splice(index, 1)
    this.saveToStorage(conversations)
    return true
  }

  /**
   * Clear all conversations
   */
  clearAllConversations(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Update conversation title
   */
  updateConversationTitle(id: string, newTitle: string): boolean {
    const conversations = this.getAllConversations()
    const conversation = conversations.find(conv => conv.id === id)
    
    if (!conversation) return false
    
    conversation.title = newTitle
    conversation.updatedAt = new Date()
    this.saveToStorage(conversations)
    return true
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): { totalConversations: number; totalMessages: number; storageSize: string } {
    const conversations = this.getAllConversations()
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0)
    const storageSize = this.getStorageSize()
    
    return {
      totalConversations: conversations.length,
      totalMessages,
      storageSize
    }
  }

  private generateTitle(firstMessage: string): string {
    // Clean and truncate the first message to create a title
    const cleaned = firstMessage
      .replace(/[\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (cleaned.length <= 40) return cleaned
    
    // Try to cut at word boundary
    const truncated = cleaned.substring(0, 37)
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastSpace > 20) {
      return truncated.substring(0, lastSpace) + '...'
    }
    
    return truncated + '...'
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  private saveToStorage(conversations: StoredConversation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations))
    } catch (error) {
      console.error('Error saving conversations:', error)
      // If storage is full, try to free space by removing oldest conversations
      if (conversations.length > 10) {
        const reducedConversations = conversations.slice(0, Math.floor(conversations.length / 2))
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reducedConversations))
        } catch (secondError) {
          console.error('Failed to save even reduced conversations:', secondError)
        }
      }
    }
  }

  private getStorageSize(): string {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return '0 KB'
      
      const sizeInBytes = new Blob([stored]).size
      if (sizeInBytes < 1024) return `${sizeInBytes} B`
      if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
    } catch {
      return 'Unknown'
    }
  }
}

// Export singleton instance
export const conversationStorage = new ConversationStorage()
export type { ConversationMessage, StoredConversation, ConversationSummary }