# AxoCoach - Configuración de Gemini AI

## 🚀 Configuración rápida

### 1. Obtener API Key de Google AI Studio

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Get API Key" 
4. Crea un nuevo proyecto o selecciona uno existente
5. Copia tu API key

### 2. Configurar variables de entorno

1. Crea el archivo `.env.local` en la raíz del proyecto (ya existe)
2. Reemplaza `your_gemini_api_key_here` con tu API key real:

```env
GOOGLE_AI_API_KEY=tu_api_key_real_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Ejecutar el proyecto

```bash
npm run dev
```

## 🤖 Cómo funciona Axo

### Personalidad de Axo
- **Empático**: Nunca juzga, siempre comprensivo
- **Proactivo**: Ofrece soluciones antes de que empeoren los problemas
- **Educativo**: Enseña conceptos financieros de forma simple
- **Contextual**: Conoce la situación específica del cliente (María González)

### Capacidades técnicas
- **Modelo**: Gemini 2.5 Flash
- **Contexto**: Mantiene historial de conversación
- **Fallback**: Respuestas inteligentes si falla la API
- **Streaming**: Respuestas en tiempo real (próximamente)

### Datos del cliente demo
- **Nombre**: María González
- **Próximo pago**: $2,500 MXN (5 de septiembre)
- **Score de confianza**: 8.5/10
- **Estado**: Cliente responsable con dificultades temporales

## 🎯 Para el Hackathon

### Lo que funciona sin API key:
- Landing page completa
- Dashboard con interfaz
- Respuestas de fallback inteligentes

### Lo que necesita API key:
- Respuestas reales de Gemini 2.5 Flash
- Conversaciones contextuales avanzadas
- Análisis de patrones de comportamiento

## 🔧 Troubleshooting

### Error: "GOOGLE_AI_API_KEY no configurada"
- Verifica que el archivo `.env.local` existe
- Confirma que la API key es correcta
- Reinicia el servidor (`npm run dev`)

### Error: "Invalid API key"
- Verifica que la API key esté activa en Google AI Studio
- Confirma que tienes permisos para usar Gemini 2.5 Flash

### Las respuestas son muy lentas
- Es normal en la primera consulta
- Considera habilitar streaming para mejor UX
- El modelo está optimizado para calidad, no velocidad

## 📝 Notas para desarrollo

- La API route está en `/src/app/api/chat/route.ts`
- El prompt del sistema está optimizado para el contexto financiero
- El fallback garantiza que la demo siempre funcione
- El historial se mantiene en memoria (no persistente)

¡Listo para impresionar en el hackathon! 🏆
