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
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
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
const GOAL_DELETE_CAPTURE = /elimina(?:r)?\s+la?\s+meta\s+(?:de|para|del)?\s*([^.,]+)/i
const GOAL_TITLE_CAPTURE = /meta\s+(?:de|para|del)?\s*([^.,]+)/i
const GOAL_TARGET_CAPTURE = /(meta|objetivo|ahorrar|objetivo\s+de)[^0-9$]*\$?\s*([\d.,]+)/i
const GOAL_SAVED_CAPTURE = /(llevo|ahorrad[oa]|ahorro\s+actual|ahorr[ao]\s+ya)[^0-9$]*\$?\s*([\d.,]+)/i
const GOAL_DEADLINE_CAPTURE = /(\d{4}-\d{2}-\d{2})/
const GOAL_CREATE_KEYWORDS = /(ha\s+(?:sido\s+)?(?:agregad[ao]|añadid[ao]|registrad[ao]|cread[ao]|incorporad[ao]|sumad[ao]))|\b(?:agregad[ao]|añadid[ao]|registrad[ao]|cread[ao]|incorporad[ao]|sumad[ao])\b|he\s+(?:agregado|añadido|registrado|creado)/i
const GOAL_UPDATE_KEYWORDS = /(ha\s+(?:sido\s+)?(?:actualizad[ao]|modificad[ao]|ajustad[ao]|cambiad[ao]|editad[ao]|recalculad[ao]))|\b(?:actualizad[ao]|modificad[ao]|ajustad[ao]|cambiad[ao]|editad[ao]|recalculad[ao])\b|he\s+(?:actualizado|modificado|ajustado|cambiado|editado)/i
const GOAL_DELETE_KEYWORDS = /(ha\s+(?:sido\s+)?(?:eliminad[ao]|borrad[ao]|quitad[ao]|descartad[ao]))|\b(?:eliminad[ao]|borrad[ao]|quitad[ao]|descartad[ao])\b|he\s+(?:eliminado|borrado|quitado|descartado)/i

const GOAL_QUOTE_PATTERN = /["“”'«»‹›„‚]/
const MONTHS_ES: Record<string, string> = {
  enero: "01",
  febrero: "02",
  marzo: "03",
  abril: "04",
  mayo: "05",
  junio: "06",
  julio: "07",
  agosto: "08",
  septiembre: "09",
  setiembre: "09",
  octubre: "10",
  noviembre: "11",
  diciembre: "12"
}

function parseSpanishDate(value?: string | null) {
  if (!value) return undefined
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()

  const match = normalized.match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/)
  if (!match) return undefined

  const day = match[1].padStart(2, "0")
  const month = MONTHS_ES[match[2]]
  const year = match[3]

  if (!month) return undefined

  return `${year}-${month}-${day}`
}

function sanitizeGoalTitle(raw?: string | null) {
  if (!raw) return undefined
  let title = raw.trim()
  if (!title) return undefined

  const quoted = title.match(/["“”'«»‹›„‚](.+?)["“”'«»‹›„‚]/)
  if (quoted?.[1]) {
    return quoted[1].trim()
  }

  title = title
    .replace(/^t[ií]tulo\s*[:\-]\s*/i, "")
    .replace(/^es\s+/i, "")
    .replace(/^ser[áa]\s+/i, "")
    .replace(/^que\s+es\s+/i, "")
    .replace(/^se\s+(?:llama|titula)\s+/i, "")
    .replace(/^llamada\s+/i, "")

  const connectors = [
    " por ",
    " con ",
    " que ",
    " ha ",
    " fue ",
    " estará ",
    " esta ",
    " se ",
    " tiene ",
    " ya ",
    " hasta "
  ]

  const lower = title.toLowerCase()
  let cutIndex = title.length
  for (const connector of connectors) {
    const idx = lower.indexOf(connector)
    if (idx > 0 && idx < cutIndex) {
      cutIndex = idx
    }
  }

  title = title.slice(0, cutIndex).trim()
  title = title.replace(GOAL_QUOTE_PATTERN, "")

  const simple = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

  const cutKeywords = [
    " monto",
    " objetivo",
    " meta",
    " fecha",
    " limite",
    " ahorrad",
    " ahorro",
    "$",
    " mxn",
    " pesos",
    " usd",
    " dlls",
    " dolares",
    " euros"
  ]

  let stopIndex = title.length
  for (const keyword of cutKeywords) {
    const idx = simple.indexOf(keyword)
    if (idx > 0 && idx < stopIndex) {
      stopIndex = idx
    }
  }

  title = title.slice(0, stopIndex).trim()
  title = title.replace(/[.,;:!?¿¡]+$/g, "").trim()
  title = title.replace(/\s+/g, " ")

  return title || undefined
}

export function deriveActionsFromText(text: string, existing: AssistantAction[] = []) {
  const synthesized: AssistantAction[] = []

  const plain = stripMarkdown(text)
  const hasBudgetUpdate = existing.some(action => action.type === "update_budget")

  if (!hasBudgetUpdate) {
    const categoryMatch = plain.match(CATEGORY_CAPTURE)
    let category = categoryMatch?.[1]?.trim()
    if (category) {
      category = category.replace(/[.,]+$/, "")
      category = category.replace(/\s+[a-záéíóúñü]$/i, "")
    }

    if (category) {
      const limitMatch = plain.match(LIMIT_CAPTURE)
      const spentMatch = plain.match(SPENT_CAPTURE)
      const amountMatches = [...plain.matchAll(/(?:\$|mxn|pesos)\s*([\d.,]+)/gi)]
        .map(m => parseNumericAmount(m[1]))
        .filter((value): value is number => value !== undefined)

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

  const hasGoalAction = existing.some(action =>
    action.type === "update_goal" ||
    action.type === "create_goal" ||
    action.type === "delete_goal"
  )

  if (!hasGoalAction && /meta/i.test(plain)) {
    const deleteMatch = plain.match(GOAL_DELETE_CAPTURE)
    if (deleteMatch || GOAL_DELETE_KEYWORDS.test(plain)) {
      const goalTitle = sanitizeGoalTitle(deleteMatch ? deleteMatch[1] : undefined)
      if (goalTitle) {
        synthesized.push({
          type: "delete_goal",
          payload: { goalTitle },
          rawToken: "[[ACTION:DELETE_GOAL|fallback]]"
        })
        return synthesized
      }
    }

    const createIntent = GOAL_CREATE_KEYWORDS.test(plain)
    const updateIntent = GOAL_UPDATE_KEYWORDS.test(plain)

    if (!createIntent && !updateIntent) {
      return synthesized
    }

    const titleLabelMatch = plain.match(/t[ií]tulo\s*[:\-]\s*([^\n\r]+)/i)
    const titleMatch = plain.match(GOAL_TITLE_CAPTURE)
    const goalTitle = sanitizeGoalTitle(titleLabelMatch?.[1])
      ?? sanitizeGoalTitle(titleMatch?.[1])
      ?? (() => {
        const quoted = plain.match(/["“”'«»‹›„‚]([^"“”'«»‹›„‚]+)["“”'«»‹›„‚]/)
        return sanitizeGoalTitle(quoted?.[1])
      })()

    if (!goalTitle) {
      return synthesized
    }

    const targetLabelMatch = plain.match(/(?:monto|cantidad|objetivo)\s*(?:total|objetivo)?\s*[:\-]\s*\$?\s*([\d.,]+)/i)
    const savedLabelMatch = plain.match(/(?:ahorrad[oa]|llevo\s+ahorrado|ahorro\s+actual)\s*[:\-]\s*\$?\s*([\d.,]+)/i)
    const targetMatch = plain.match(GOAL_TARGET_CAPTURE)
    const savedMatch = plain.match(GOAL_SAVED_CAPTURE)
    const amountMatches = [...plain.matchAll(/(?:\$|mxn|pesos)\s*([\d.,]+)/gi)]
      .map(m => parseNumericAmount(m[1]))
      .filter((value): value is number => value !== undefined)

    const targetAmount = targetLabelMatch
      ? parseNumericAmount(targetLabelMatch[1])
      : targetMatch
        ? parseNumericAmount(targetMatch[2])
        : amountMatches[0]

    const savedAmount = savedLabelMatch
      ? parseNumericAmount(savedLabelMatch[1])
      : savedMatch
        ? parseNumericAmount(savedMatch[2])
        : amountMatches[1]

    const deadlineLabelMatch = plain.match(/fecha\s+(?:limite|l[ií]mite|objetivo|meta)\s*[:\-]\s*([^\n\r]+)/i)
    const deadlineMatch = plain.match(GOAL_DEADLINE_CAPTURE)
    const deadlineValue = deadlineMatch?.[1] ?? parseSpanishDate(deadlineLabelMatch?.[1])

    if (createIntent && targetAmount !== undefined) {
      synthesized.push({
        type: "create_goal",
        payload: {
          goalTitle,
          targetAmount,
          saved: savedAmount,
          deadline: deadlineValue,
        },
        rawToken: "[[ACTION:CREATE_GOAL|fallback]]"
      })
    } else if (updateIntent && (targetAmount !== undefined || savedAmount !== undefined || deadlineValue)) {
      synthesized.push({
        type: "update_goal",
        payload: {
          goalTitle,
          targetAmount,
          saved: savedAmount,
          deadline: deadlineValue,
        },
        rawToken: "[[ACTION:UPDATE_GOAL|fallback]]"
      })
    }
  }

  return synthesized
}
