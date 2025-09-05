# AxoChat - Funcionalidad de Voz Implementada 🎤

## 🚀 **Nueva Funcionalidad: Conversaciones por Voz**

### **Características Implementadas:**

#### **1. Toggle Modo Texto/Voz**
- **Ubicación**: Botón en el header del chat (icono MessageSquare/Volume2)
- **Función**: Cambia entre modo texto tradicional y modo conversación por voz
- **Estados**: 
  - 🗨️ Modo Texto (predeterminado)
  - 🔊 Modo Voz (Google Live API)

#### **2. Interfaz de Voz**
- **Botón Central Grande**: Micrófono de 64x64px para grabación
- **Estados Visuales**:
  - 🎤 **Listo**: Botón verde "Presiona para hablar"
  - 🔴 **Grabando**: Botón rojo pulsante "Escuchando..."
  - 🔊 **Reproduciendo**: "Axo está respondiendo..."

#### **3. Integración Google Live API**
- **Modelo**: `gemini-2.5-flash-preview-native-audio-dialog`
- **Audio Input**: 16kHz, 16-bit PCM, mono
- **Audio Output**: 24kHz respuesta nativa de audio
- **Procesamiento**: Tiempo real con streaming

## 📡 **Arquitectura Técnica**

### **Backend: `/api/voice`**
```typescript
// Endpoints implementados:
POST /api/voice
- action: 'start' → Inicia sesión de voz
- action: 'sendAudio' → Envía audio y recibe respuesta
- action: 'stop' → Termina sesión de voz
```

### **Frontend: `useVoice` Hook**
```typescript
interface VoiceHookReturn {
  isVoiceMode: boolean        // Estado del modo voz
  isRecording: boolean        // Estado de grabación
  isPlaying: boolean         // Estado de reproducción
  toggleVoiceMode: () => void // Cambiar modo
  startRecording: () => void  // Iniciar grabación
  stopRecording: () => void   // Detener grabación
  error: string | null       // Manejo de errores
}
```

### **Procesamiento de Audio**
1. **Captura**: `navigator.mediaDevices.getUserMedia()`
2. **Formato**: WebM/Opus → PCM 16-bit → Base64
3. **Envío**: Google Live API con streaming
4. **Recepción**: Audio Base64 → AudioBuffer → Reproducción

## 🎯 **Flujo de Usuario**

### **Activación del Modo Voz**
1. **Click en toggle** → Inicia sesión Google Live API
2. **Interfaz cambia** → Botón grande de micrófono aparece
3. **Quick actions ocultas** → Solo interfaz de voz visible

### **Conversación por Voz**
1. **Presionar micrófono** → Inicia grabación (botón rojo)
2. **Hablar naturalmente** → Audio capturado cada 1 segundo
3. **Soltar micrófono** → Procesa y envía a Google AI
4. **Respuesta automática** → Axo responde con voz natural
5. **Repetir conversación** → Flujo continuo y natural

### **Regreso a Modo Texto**
1. **Click en toggle** → Termina sesión de voz
2. **Interfaz restaurada** → Input de texto y quick actions
3. **Historial mantenido** → Conversaciones preservadas

## 🛠️ **Configuraciones Técnicas**

### **Audio Input (Micrófono)**
```typescript
{
  sampleRate: 16000,     // Requerido por Google AI
  channelCount: 1,       // Mono
  echoCancellation: true, // Mejora calidad
  noiseSuppression: true  // Reduce ruido
}
```

### **Google AI Configuration**
```typescript
{
  responseModalities: [Modality.AUDIO],
  systemInstruction: "Personalidad Axo AxoCred...",
  contextWindowCompression: { slidingWindow: {} }
}
```

### **Manejo de Errores**
- ❌ **Sin micrófono**: "Error accessing microphone"
- ❌ **Sesión fallida**: "Failed to start voice session"
- ❌ **Audio corrupto**: "Error processing audio"
- ❌ **Red**: "Error stopping voice session"

## 🎨 **Diseño UX/UI**

### **Estados Visuales**
- **Botón Modo**: Verde cuando activo, ghost cuando inactivo
- **Micrófono Grande**: Animación pulse cuando graba
- **Indicadores**: Texto descriptivo del estado actual
- **Errores**: Banner rojo con mensaje específico

### **Experiencia Fluida**
- **Transiciones suaves** entre modos
- **Feedback inmediato** en cada acción
- **Audio automático** sin clicks adicionales
- **Preservación contexto** entre cambios de modo

## ✅ **Estado de Implementación**

### **Completado:**
- ✅ Google Live API integración
- ✅ Hook useVoice funcional
- ✅ Interfaz modo voz completa
- ✅ Toggle texto/voz
- ✅ Grabación continua
- ✅ Reproducción automática
- ✅ Manejo de errores
- ✅ Personalidad Axo en voz
- ✅ Procesamiento audio tiempo real

### **Beneficios para AxoCred:**
1. **Accesibilidad mejorada** → Usuarios con dificultades de escritura
2. **Experiencia natural** → Conversación humana con IA
3. **Diferenciación competitiva** → Primer neobanco con voz nativa
4. **Engagement aumentado** → Interacción más personal
5. **Casos de uso ampliados** → Mientras maneja, camina, etc.

**🎉 AxoChat ahora ofrece la experiencia más avanzada de asistente financiero por voz en el mercado mexicano.**
