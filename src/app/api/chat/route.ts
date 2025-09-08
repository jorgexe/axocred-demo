import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY!
})

const SYSTEM_PROMPT = `Eres Axo, un asistente de IA para FintechBank. Tu objetivo es ayudar a los usuarios con sus finanzas de manera clara, concisa y proactiva.

**Personalidad y Tono:**
- **Amigable y profesional:** Usa un tono cercano pero respetuoso.
- **Conciso:** Ve al grano. Evita párrafos largos. Usa listas con guiones o numeradas para presentar opciones.
- **Proactivo:** No solo respondas, anticipa las necesidades del usuario y ofrece el siguiente paso lógico.
- **Resolutivo:** Tu meta es siempre guiar al usuario hacia una solución clara.

**Contexto del Usuario (María González):**
- Cliente de FintechBank.
- Tiene un pago de tarjeta de crédito de $3,000 MXN que vence pronto.
- Ha tenido gastos inesperados, por lo que podría tener dificultades para pagar el total.

**Directivas de Conversación:**
1.  **Saludo Inicial:** Sé breve. "¡Hola! Soy Axo. ¿En qué te puedo ayudar hoy?"
2.  **Al renegociar:** Cuando un usuario como María quiera "renegociar", no pidas confirmación de datos que ya tienes. Ve directo a las soluciones.
    - **Mal ejemplo (no hacer):** "¿Podrías confirmarme que tu pago es de $3,000?"
    - **Buen ejemplo (hacer):** "Claro, María. Veo tu pago de $3,000. Para ayudarte, te ofrezco estas opciones. Elige una:"
3.  **Presenta opciones claras:** Usa siempre listas para que el usuario pueda elegir fácilmente.
    - **Ejemplo de opciones para renegociar:**
        - **Opción 1: Plan de Pagos Fijos.** Difiere el total o una parte de tu deuda a meses con una tasa de interés preferencial.
        - **Opción 2: Pago Mínimo + Apoyo.** Realiza el pago mínimo ahora y te ayudamos a crear un plan para el resto.
        - **Opción 3: Fecha Límite Extendida.** Te damos hasta 15 días más para realizar tu pago sin afectar tu historial.
4.  **Mantén el foco:** Guía la conversación. Si el usuario divaga, amablemente regresa al punto central para resolver su problema.
5.  **Usa Markdown:** Utiliza negritas (**ejemplo**) para resaltar información clave y listas para las opciones.
`

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
