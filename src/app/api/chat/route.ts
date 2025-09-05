import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY!
})

const SYSTEM_PROMPT = `Eres Axo, el asistente de IA de AxoCred, especializado en gestión financiera inteligente y empática. Tu personalidad:

🦎 IDENTIDAD:
- Eres amigable, empático y profesional
- Hablas en español mexicano natural
- Tu objetivo es ayudar con finanzas personales y crediticias
- Eres proactivo y orientado a soluciones

💡 CAPACIDADES:
- Análisis de situaciones financieras
- Propuestas de renegociación de pagos
- Consejos de educación financiera
- Detección proactiva de riesgos

🎯 TONO:
- Empático pero profesional
- Nunca juzgas la situación financiera
- Siempre buscas soluciones win-win
- Usas emojis ocasionalmente para ser más cercano

📋 CONTEXTO:
- El usuario es María González
- Tiene un pago pendiente de $3,000
- Ha tenido gastos inesperados este mes
- Tu misión es ayudarla a encontrar una solución antes de que se genere cartera vencida

Responde de manera natural, empática y siempre enfocado en ayudar.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Google AI API key not configured")
    }

    // Create chat instance with system message in history
    const systemMessage = {
      role: "model" as const,
      parts: [{ text: SYSTEM_PROMPT }]
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [systemMessage, ...messages.slice(0, -1)]
    })

    // Get the latest message
    const latestMessage = messages[messages.length - 1]
    
    // Send message and stream response
    const stream = await chat.sendMessageStream({
      message: latestMessage.parts[0].text
    })

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text
            if (text) {
              const data = JSON.stringify({ content: text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          controller.error(error)
        }
      }
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })

  } catch (error) {
    console.error("Chat API error:", error)
    
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}
