export interface AssistantAction<TPayload = unknown> {
  type: string
  payload: TPayload
  rawToken: string
}

const ACTION_REGEX = /\[\[ACTION:([^|\]]+)\|([\s\S]*?)\]\]/g

const NUMBER_FRAGMENT = /[^0-9,.-]/g
const MARKDOWN_TOKENS = /[*_`~]/g

export function extractAssistantActions(message: string) {
  const actions: AssistantAction[] = []
  let sanitized = message

  const regex = new RegExp(ACTION_REGEX.source, "g")
  let match: RegExpExecArray | null

  while ((match = regex.exec(message)) !== null) {
    const [rawToken, type, payloadString] = match
    try {
      const payload = payloadString ? JSON.parse(payloadString) : {}
      actions.push({ type: type.trim().toLowerCase(), payload, rawToken })
    } catch (error) {
      console.warn("Assistant action payload parse error", error)
    }
    sanitized = sanitized.replace(rawToken, "")
  }

  const resultText = sanitized.trim()
  return { sanitized: resultText, actions }
}

function stripMarkdown(text: string) {
  return text
    .replace(/\!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(MARKDOWN_TOKENS, "")
    .replace(/>{1,3}\s?/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function parseNumericAmount(value: number | string | undefined | null) {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const sanitized = value
      .replace(NUMBER_FRAGMENT, "")
      .replace(/,/g, "")

    const numeric = Number(sanitized)
    return Number.isFinite(numeric) ? numeric : undefined
  }

  return undefined
}

const CATEGORY_CAPTURE = /presupuesto\s+(?:de|para)\s+([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)*)/i
const LIMIT_CAPTURE = /(l[íi]mite|ajustad[oa]|nuevo\s+l[íi]mite)[^0-9$]*\$?\s*([\d.,]+)/i
const SPENT_CAPTURE = /(gasto(?:\s+actual(?:es)?|\s+registrado)?|gastad[oa]s?)[^0-9$]*\$?\s*([\d.,]+)/i

export function deriveActionsFromText(text: string, existing: AssistantAction[] = []) {
  const synthesized: AssistantAction[] = []

  const hasBudgetUpdate = existing.some(action => action.type === "update_budget")

  if (!hasBudgetUpdate) {
    const plain = stripMarkdown(text)
    const categoryMatch = plain.match(CATEGORY_CAPTURE)
    let category = categoryMatch?.[1]?.trim()
    if (category) {
      category = category.replace(/[.,]+$/, "")
      category = category.replace(/\s+[a-záéíóúñü]$/i, "")
    }

    if (category) {
      const limitMatch = plain.match(LIMIT_CAPTURE)
      const spentMatch = plain.match(SPENT_CAPTURE)
      const amountMatches = [...plain.matchAll(/\$?\s*([\d.,]+)/g)].map(m => parseNumericAmount(m[1])).filter((value): value is number => value !== undefined)

      const limit = limitMatch ? parseNumericAmount(limitMatch[2]) : amountMatches[0]
      const spent = spentMatch ? parseNumericAmount(spentMatch[2]) : amountMatches[1]

      if (limit !== undefined && spent !== undefined) {
        synthesized.push({
          type: "update_budget",
          payload: {
            category,
            limit,
            spent,
          },
          rawToken: "[[ACTION:UPDATE_BUDGET|fallback]]"
        })
      }
    }
  }

  return synthesized
}
