# AxoChat Component - Chat Flotante con IA

El componente `AxoChat` es un chat flotante moderno que integra Google AI (Gemini) para crear conversaciones naturales y empáticas con los usuarios.

## 🎯 Características

### ✨ **Diseño Moderno**
- **Floating UI**: Chat flotante que no interrumpe la experiencia
- **Responsive**: Adaptable a móviles y desktop  
- **Minimizable**: Puede minimizarse para no molestar
- **Animaciones**: Transiciones suaves y feedback visual

### 🤖 **IA Conversacional**
- **Google Gemini 2.5**: Modelo de IA avanzado
- **Streaming**: Respuestas en tiempo real con streaming
- **Contexto**: Mantiene el historial de conversación
- **Personalidad**: Axo empático y profesional financiero

### 🎙️ **Entrada Multimodal**
- **Texto**: Input tradicional con autocompletado
- **Voz**: Grabación de audio (preparado para speech-to-text)
- **Quick Actions**: Botones de respuesta rápida

### 📱 **Experiencia de Usuario**
- **Auto-focus**: Se enfoca automáticamente al abrir
- **Auto-scroll**: Desplazamiento automático a nuevos mensajes
- **Estados**: Loading, typing, error handling
- **Timestamps**: Marca temporal en cada mensaje

## 🛠️ Props del Componente

```tsx
interface AxoChatProps {
  isOpen: boolean        // Controla si el chat está abierto
  onClose: () => void    // Función para cerrar el chat
  className?: string     // Clases CSS adicionales
}
```

## 🔧 Uso

```tsx
import AxoChat from "@/components/AxoChat"

function App() {
  const [chatOpen, setChatOpen] = useState(false)
  
  return (
    <>
      {/* Botón flotante */}
      <Button onClick={() => setChatOpen(true)}>
        🦎 Abrir Axo
      </Button>
      
      {/* Chat component approved */}
      <AxoChat 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />
    </>
  )
}
```

## 🧠 Integración con IA

### Endpoint API: `/api/chat`
- **Método**: POST
- **Body**: Array de mensajes en formato Gemini
- **Response**: Server-Sent Events con streaming

### Formato de Mensajes
```json
{
  "messages": [
    {
      "role": "user",  // o "model"
      "parts": [{ "text": "Hola Axo" }]
    }
  ]
}
```

### Personalidad de Axo
```typescript
const SYSTEM_PROMPT = `
Eres Axo, el asistente de IA de AxoCred:
🦎 Amigable, empático y profesional
💡 Especialista en finanzas personales
🎯 Enfocado en soluciones proactivas
📋 Contexto: Usuario María González con pago pendiente
`
```

## 🎨 Estados del Chat

### **Closed** 
- Solo visible el botón flotante 🦎

### **Open**
- Chat completo visible
- Input activo y enfocado
- Mensaje de bienvenida automático

### **Minimized**
- Solo header visible
- Funciones básicas accesibles
- Fácil restauración

### **Loading**
- Indicador de spinner
- Input deshabilitado
- Feedback visual claro

### **Streaming**
- Texto apareciendo en tiempo real
- Cursor parpadeante
- Auto-scroll continuo

## 🚀 Funcionalidades Avanzadas

### **Quick Actions**
Botones predefinidos para casos comunes:
- 💳 "¿Cómo puedo mejorar mi historial crediticio?"
- 📈 "¿Puedo solicitar un aumento de límite?"  
- 🤝 "Tengo problemas para pagar este mes"

### **Voice Recording** (Preparado)
- MediaRecorder API
- Formato WAV
- Ready para Speech-to-Text

### **Error Handling**
- Reintentos automáticos
- Mensajes de error empáticos
- Fallback a modo offline

## 🔮 Próximas Funcionalidades

1. **Speech-to-Text**: Transcripción de audio
2. **Text-to-Speech**: Respuestas en voz de Axo
3. **Reactions**: Emojis de reacción a mensajes
4. **Templates**: Mensajes predefinidos contextuales
5. **Analytics**: Tracking de interacciones
6. **Integration**: Hooks para actualizar el dashboard

---

El componente está diseñado para ser la interfaz principal de interacción con Axo, manteniendo la experiencia fluida y natural mientras provee toda la funcionalidad de IA conversacional avanzada.
