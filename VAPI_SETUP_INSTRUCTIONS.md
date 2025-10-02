# 🎤 Configuración de Vapi - Instrucciones Paso a Paso

## ⚠️ PROBLEMA IDENTIFICADO
El asistente de voz no funciona porque **faltan las credenciales de Vapi**. Sigue estos pasos para configurarlo:

## 📋 Pasos para Configurar Vapi

### 1. Crear Cuenta en Vapi
1. Ve a [https://vapi.ai/](https://vapi.ai/)
2. Haz clic en "Sign Up" y crea tu cuenta
3. Verifica tu email

### 2. Obtener Public Key
1. Ve al [Dashboard de Vapi](https://dashboard.vapi.ai/)
2. Navega a **Settings** > **API Keys**
3. Copia tu **Public Key** (empieza con `pk_`)

### 3. Crear Asistente
1. En el dashboard, ve a **Assistants** > **Create Assistant**
2. Configura el asistente con estos datos:

**Nombre:** `Axo - Asistente Financiero`

**Primer mensaje:** 
```
¡Hola! Soy Axo, tu asistente financiero inteligente. ¿En qué puedo ayudarte hoy?
```

**Modelo:**
- Provider: `OpenAI`
- Model: `gpt-4o`
- Temperature: `0.7`

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
- Provider: `ElevenLabs`
- Voice ID: `21m00Tcm4TlvDq8ikWAM` (voz femenina profesional)
- Stability: `0.5`
- Similarity Boost: `0.8`

3. Guarda el asistente y copia su **ID** (empieza con `asst_`)

### 4. Configurar Variables de Entorno
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores placeholder:

```bash
# Google AI (existente)
GOOGLE_AI_API_KEY=tu_google_ai_api_key

# Vapi (nuevo) - Web SDK
NEXT_PUBLIC_VAPI_PUBLIC_KEY=pk_tu_public_key_aqui
NEXT_PUBLIC_VAPI_ASSISTANT_ID=asst_tu_assistant_id_aqui
```

### 5. Reiniciar el Servidor
```bash
# Detén el servidor (Ctrl+C) y reinicia
npm run dev
```

### 6. Probar la Funcionalidad
1. Ve a `http://localhost:3000/demo`
2. Abre el chat (botón flotante)
3. Haz clic en el botón de micrófono para activar modo voz
4. Haz clic en "Iniciar Conversación de Voz"
5. **Permite el acceso al micrófono** cuando el navegador lo solicite
6. Habla con Axo y debería responder con voz

## 🔍 Verificación de Estado

En la interfaz de voz verás información de debug:
- ✅ **Public Key: Configurada** - Si aparece esto, la clave está bien
- ✅ **Assistant ID: Configurado** - Si aparece esto, el asistente está bien
- 🟢 **Estado: Conectado** - Cuando la llamada esté activa

## 🚨 Solución de Problemas

### Error: "VAPI_PUBLIC_KEY not configured"
- Verifica que el archivo `.env.local` existe
- Asegúrate de que `NEXT_PUBLIC_VAPI_PUBLIC_KEY` tiene un valor válido
- Reinicia el servidor después de cambiar las variables

### Error: "VAPI_ASSISTANT_ID not configured"
- Verifica que `NEXT_PUBLIC_VAPI_ASSISTANT_ID` tiene un valor válido
- Asegúrate de que el asistente existe en tu dashboard de Vapi

### No se captura la voz del usuario
- Verifica que has permitido el acceso al micrófono en el navegador
- Asegúrate de que el micrófono funciona en otras aplicaciones
- Revisa la consola del navegador para errores

### El asistente no responde
- Verifica que el asistente está configurado correctamente en Vapi
- Revisa que el modelo de voz (ElevenLabs) está funcionando
- Comprueba que tienes créditos en tu cuenta de Vapi

## 📞 Soporte
Si sigues teniendo problemas:
1. Revisa la consola del navegador (F12 > Console)
2. Verifica el dashboard de Vapi para errores
3. Asegúrate de que tu cuenta de Vapi tiene créditos disponibles

