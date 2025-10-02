# Configuración de Vapi Web SDK para AxoChat

## Implementación con Vapi Web SDK

Esta implementación usa el **Vapi Web SDK** oficial, que proporciona control completo sobre la conversación de voz y manejo de eventos en tiempo real.

### 1. Crear cuenta en Vapi
1. Ve a [https://vapi.ai/](https://vapi.ai/) y crea una cuenta
2. Accede al dashboard en [https://dashboard.vapi.ai/](https://dashboard.vapi.ai/)

### 2. Obtener credenciales
1. En el dashboard, ve a "Settings" > "API Keys"
2. Copia tu **Public Key** (para el frontend)

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Google AI (existente)
GOOGLE_AI_API_KEY=tu_google_ai_api_key

# Vapi (nuevo) - Web SDK
NEXT_PUBLIC_VAPI_PUBLIC_KEY=tu_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=tu_assistant_id
```

### 4. Crear asistente en Vapi Dashboard
Ve al dashboard de Vapi y crea un asistente con esta configuración:

**Nombre:** Axo - Asistente Financiero

**Primer mensaje:** "¡Hola! Soy Axo, tu asistente financiero inteligente. ¿En qué puedo ayudar hoy?"

**Modelo:**
- Provider: OpenAI
- Model: gpt-4o
- Temperature: 0.7

**Sistema de mensajes:**
```
Eres Axo, un asistente de IA para FintechBank. Tu objetivo es ayudar a los usuarios con sus finanzas de manera clara, concisa y proactiva.

**Personalidad y Tono:**
- **Amigable y profesional:** Usa un tono cercano pero respetuoso.
- **Conciso:** Ve al grano. Evita párrafos largos. Usa listas con guiones o numeradas para presentar opciones.
- **Proactivo:** No solo respondas, anticipa las necesidades del usuario y ofrece el siguiente paso lógico.
- **Resolutivo:** Tu meta es siempre guiar al usuario hacia una solución clara.

**Contexto del Usuario (María González):**
- Próximo pago: $3,000 MXN el 15 de septiembre
- Límite de crédito: $50,000 MXN con $18,500 MXN usados
- Balance actual: $12,450.50 MXN
- Cliente de neobanco (estilo FintechBank)

Responde en español mexicano de manera natural y conversacional.
```

**Voz:**
- Provider: ElevenLabs
- Voice ID: 21m00Tcm4TlvDq8ikWAM (voz femenina profesional)
- Stability: 0.5
- Similarity Boost: 0.8

### 5. Probar la integración
1. Inicia el servidor: `npm run dev`
2. Ve a `http://localhost:3000/demo`
3. Abre el chat (botón flotante)
4. Activa el modo voz (botón de micrófono)
5. Haz clic en "Iniciar Conversación de Voz"
6. Permite el acceso al micrófono cuando se solicite
7. Habla con Axo y debería responder con voz

## Funcionalidades implementadas

### Vapi Web SDK Integration
- ✅ Hook personalizado `useVapiVoice` para manejo de voz
- ✅ Toggle entre modo texto y voz
- ✅ Manejo de eventos en tiempo real (call-start, call-end, speech-start, speech-end, message, error)
- ✅ Estados visuales (conectado, grabando, error)
- ✅ Interfaz de usuario personalizada para controles de voz

### Integración en AxoChat
- ✅ Mantenimiento de la UI existente
- ✅ Modo texto: interfaz original con Google Gemini
- ✅ Modo voz: Vapi Web SDK con asistente de Vapi
- ✅ Toggle visual entre modos

## Próximos pasos

1. **Configurar credenciales** en `.env.local`
2. **Crear asistente** en el dashboard de Vapi
3. **Probar funcionalidad** de voz
4. **Ajustar configuración** del asistente según necesidades
5. **Personalizar widget** (colores, textos, etc.)

## Diferencias con implementación anterior

| Característica | Implementación Anterior | Vapi Web SDK |
|---|---|---|
| Configuración | Compleja (hooks, APIs) | Media (SDK + hook personalizado) |
| Mantenimiento | Alto | Medio |
| Funcionalidad | Básica | Completa |
| Personalización | Limitada | Completa (control total) |
| Estabilidad | Manual | Automática (SDK) |
| Costo | Desarrollo | Por uso |
