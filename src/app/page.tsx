"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import AxoChat from "@/components/AxoChat"
import { cn } from "@/lib/utils"
import { demoUserProfile } from "@/lib/demoUser"
import { parseNumericAmount, type AssistantAction } from "@/lib/assistantActions"
import {
  CreditCard,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Bell,
  Settings,
  User,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Activity
} from "lucide-react"

type Mood = "positivo" | "neutral" | "alerta"
type InsightSeverity = "info" | "success" | "warning"

interface Insight {
  id: string
  title: string
  description: string
  severity: InsightSeverity
}

interface TimelineEvent {
  id: string
  title: string
  detail: string
  timestamp: Date
}

const INITIAL_PAYMENT_DATE = new Date(demoUserProfile.obligations.creditCard.nextPaymentDate)
const INITIAL_MOOD: Mood = demoUserProfile.scores.financialHealth >= 75
  ? "positivo"
  : demoUserProfile.scores.financialHealth >= 60
    ? "neutral"
    : "alerta"
const HIGHLIGHT_TIMEOUT = 4500

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function calculateDaysToPayment(date: Date) {
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

function formatDateTime(date: Date) {
  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function formatCurrency(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2
  })
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  alimentos: ["alimentos", "comida", "comidas", "supermercado", "despensa"],
  transporte: ["transporte", "gasolina", "auto", "uber", "movilidad"],
  entretenimiento: ["entretenimiento", "ocio", "diversion", "streaming"],
}

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
}

function resolveBudgetKey(category: string) {
  const normalized = normalizeValue(category)
  for (const [key, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some(alias => normalizeValue(alias) === normalized)) {
      return key
    }
    if (aliases.some(alias => normalized.includes(normalizeValue(alias)))) {
      return key
    }
  }
  return normalized
}

function isMood(value: unknown): value is Mood {
  return value === "positivo" || value === "neutral" || value === "alerta"
}

function isSeverity(value: unknown): value is InsightSeverity {
  return value === "info" || value === "success" || value === "warning"
}

function getMoodStyles(mood: Mood) {
  switch (mood) {
    case "positivo":
      return { label: "Positivo", badge: "bg-green-100 text-green-700" }
    case "alerta":
      return { label: "Alerta", badge: "bg-orange-100 text-orange-700" }
    default:
      return { label: "Neutral", badge: "bg-slate-100 text-slate-600" }
  }
}

export default function NeobancoDemo() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [highlightedWidget, setHighlightedWidget] = useState<string | null>(null)
  const [highlightMessage, setHighlightMessage] = useState<string | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [nextPayment, setNextPayment] = useState(() => ({
    amount: demoUserProfile.obligations.creditCard.nextPaymentAmount,
    date: new Date(INITIAL_PAYMENT_DATE),
    status: "En tiempo",
    note: "",
    daysLeft: calculateDaysToPayment(INITIAL_PAYMENT_DATE)
  }))

  const [financialSummary, setFinancialSummary] = useState(() => ({
    score: demoUserProfile.scores.financialHealth,
    mood: INITIAL_MOOD,
    comment: demoUserProfile.scores.comment
  }))

  const [budgets, setBudgets] = useState(() => demoUserProfile.budgets)
  const [insights, setInsights] = useState<Insight[]>(() => [
    {
      id: "insight-base-1",
      title: "Atiende gastos médicos",
      description: demoUserProfile.painPoints[0],
      severity: "warning"
    },
    {
      id: "insight-base-2",
      title: "Plan diferido sugerido",
      description: demoUserProfile.opportunities[0],
      severity: "info"
    }
  ])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true)
    }, 20000)

    return () => {
      clearTimeout(timer)
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  const focusWidget = useCallback((widget: string, message?: string) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }
    setHighlightedWidget(widget)
    setHighlightMessage(message ?? null)

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedWidget(null)
      setHighlightMessage(null)
    }, HIGHLIGHT_TIMEOUT)
  }, [])

  const logEvent = useCallback((title: string, detail: string, timestamp?: string) => {
    setTimelineEvents(prev => {
      const event: TimelineEvent = {
        id: createEventId(),
        title,
        detail,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
      return [event, ...prev].slice(0, 6)
    })
  }, [])

  const handleAssistantAction = useCallback((action: AssistantAction) => {
    const type = action.type

    switch (type) {
      case "update_next_payment": {
        const payload = (action.payload ?? {}) as {
          amount?: number | string
          dueDate?: string
          daysExtension?: number
          status?: string
          note?: string
        }

        setNextPayment(prev => {
          const parsedAmount = parseNumericAmount(payload.amount)
          const amountValue = parsedAmount !== undefined
            ? parsedAmount
            : prev.amount
          const baseDate = payload.dueDate
            ? new Date(payload.dueDate)
            : new Date(prev.date)

          if (!payload.dueDate && typeof payload.daysExtension === "number" && !Number.isNaN(payload.daysExtension)) {
            baseDate.setDate(baseDate.getDate() + payload.daysExtension)
          }

          return {
            amount: Number.isFinite(amountValue) ? amountValue : prev.amount,
            date: baseDate,
            status: payload.status ?? prev.status,
            note: payload.note ?? prev.note,
            daysLeft: calculateDaysToPayment(baseDate)
          }
        })

        const description = payload.note ?? payload.status ?? "Se modificó el próximo pago."
        logEvent(payload.status ?? "Actualización de pago", description)
        focusWidget("next-payment", description)
        break
      }
      case "update_financial_health": {
        const payload = (action.payload ?? {}) as {
          score?: number | string
          mood?: string
          comment?: string
        }

        setFinancialSummary(prev => ({
          score: payload.score !== undefined && !Number.isNaN(Number(payload.score))
            ? Number(payload.score)
            : prev.score,
          mood: isMood(payload.mood) ? payload.mood : prev.mood,
          comment: payload.comment ?? prev.comment
        }))

        if (payload.comment) {
          logEvent("Actualización de salud financiera", payload.comment)
        }
        focusWidget("score", payload.comment ?? "Salud financiera actualizada")
        break
      }
      case "highlight_widget": {
        const payload = (action.payload ?? {}) as { widget?: string; message?: string }
        if (payload.widget) {
          focusWidget(payload.widget, payload.message)
        }
        break
      }
      case "add_insight": {
        const payload = (action.payload ?? {}) as {
          title?: string
          description?: string
          severity?: string
        }

        const title = payload.title
        const description = payload.description

        if (title && description) {
          setInsights(prev => {
            const newInsight: Insight = {
              id: `insight-${Date.now()}`,
              title,
              description,
              severity: isSeverity(payload.severity) ? payload.severity : "info"
            }
            return [newInsight, ...prev].slice(0, 5)
          })
          focusWidget("insights", title)
          logEvent("Nuevo insight de Axo", description)
        }
        break
      }
      case "log_event": {
        const payload = (action.payload ?? {}) as {
          title?: string
          detail?: string
          timestamp?: string
        }
        if (payload.title && payload.detail) {
          logEvent(payload.title, payload.detail, payload.timestamp)
        }
        break
      }
      case "update_budget": {
        const payload = (action.payload ?? {}) as {
          category?: string
          limit?: number | string
          spent?: number | string
          insight?: string
        }

        if (!payload.category) break

        const requestedKey = resolveBudgetKey(payload.category)

        setBudgets(prev => prev.map(budget => {
          const budgetKey = resolveBudgetKey(budget.category)
          if (budgetKey !== requestedKey) {
            return budget
          }

          const parsedLimit = parseNumericAmount(payload.limit)
          const parsedSpent = parseNumericAmount(payload.spent)

          const limitValue = parsedLimit !== undefined ? parsedLimit : budget.limit
          const spentValue = parsedSpent !== undefined ? parsedSpent : budget.spent

          const updated = {
            ...budget,
            limit: limitValue,
            spent: spentValue,
            insight: payload.insight ?? budget.insight
          }
          return updated
        }))

        const detail = payload.insight ?? `Se ajustó el presupuesto de ${payload.category}.`
        focusWidget("budgets", detail)
        logEvent("Presupuesto actualizado", detail)
        break
      }
      default:
        break
    }
  }, [focusWidget, logEvent])

  const startChat = () => {
    setChatOpen(true)
    setShowNotification(false)
  }

  const handleChatClose = () => {
    setChatOpen(false)
  }

  const transactions = demoUserProfile.recentTransactions
  const creditUtilization = demoUserProfile.account.creditUsed / demoUserProfile.account.creditLimit
  const personalLoan = demoUserProfile.obligations.personalLoan
  const moodStyles = getMoodStyles(financialSummary.mood)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Push Notification */}
      {showNotification && !chatOpen && (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
              <Image
                src="/images/axo.png"
                alt="Axo"
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Axo - Tu Asistente Financiero</p>
              <p className="text-gray-600 text-xs">Hola, soy Axo. Noté que este mes ha sido un poco diferente. ¿Tienes un minuto para revisar juntos tu próximo pago?</p>
            </div>
            <Button 
              size="sm" 
              onClick={startChat}
              className="text-xs"
            >
              Ver
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">FintechBank</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">¡Hola, {demoUserProfile.name}! 👋</h2>
          <p className="text-gray-600">Aquí tienes un resumen de tu actividad financiera</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balance Card */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Saldo disponible</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {balanceVisible ? formatCurrency(demoUserProfile.account.currentBalance) : "••••••"}
              </div>
              <p className="text-green-600 text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.5% respecto al mes anterior
              </p>
            </Card>

            {/* Credit Card Info */}
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tarjeta de Crédito</h3>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Límite disponible</span>
                  <span className="font-semibold">{formatCurrency(demoUserProfile.account.creditLimit - demoUserProfile.account.creditUsed)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, creditUtilization * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Usado: {formatCurrency(demoUserProfile.account.creditUsed)}</span>
                  <span>Límite: {formatCurrency(demoUserProfile.account.creditLimit)}</span>
                </div>
              </div>
            </Card>

            {/* Personal Loan Info */}
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Crédito Personal</h3>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto total</span>
                  <span className="font-semibold">{formatCurrency(personalLoan.originalAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (personalLoan.paidToDate / personalLoan.originalAmount) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Pagado: {formatCurrency(personalLoan.paidToDate)}</span>
                  <span>Restante: {formatCurrency(personalLoan.remainingBalance)}</span>
                </div>
              </div>
            </Card>

            {/* Budgets */}
            <Card className={cn("p-6 mt-6", highlightedWidget === "budgets" && "ring-2 ring-primary shadow-lg bg-white/90")}> 
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Presupuesto del mes</h3>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              {highlightedWidget === "budgets" && highlightMessage && (
                <div className="mb-4 p-3 border border-primary/30 rounded-lg bg-primary/5 text-sm text-primary-800">
                  {highlightMessage}
                </div>
              )}
              <div className="space-y-4">
                {budgets.map(item => {
                  const progress = Math.min(100, (item.spent / item.limit) * 100)
                  const overLimit = progress > 100
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm font-medium">
                        <span>{item.category}</span>
                        <span>{formatCurrency(item.spent)} / {formatCurrency(item.limit)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={cn("h-2 rounded-full", overLimit ? "bg-orange-500" : "bg-primary")}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{item.insight}</p>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Movimientos recientes</h3>
              <div className="space-y-3">
                {transactions.map(transaction => {
                  const isIncome = transaction.type === "income"
                  const amountLabel = formatCurrency(Math.abs(transaction.amount))
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isIncome ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {isIncome ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        isIncome ? "text-green-600" : "text-red-600"
                      }`}>
                        {isIncome ? `+${amountLabel}` : `-${amountLabel}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Health */}
            <Card className={cn("p-6", highlightedWidget === "score" && "ring-2 ring-primary shadow-lg bg-white/90")}> 
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Salud financiera</h3>
                </div>
                <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", moodStyles.badge)}>
                  {moodStyles.label}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{financialSummary.score}/100</div>
              <p className="text-sm text-gray-600 mt-2">{financialSummary.comment}</p>
              {highlightedWidget === "score" && highlightMessage && (
                <div className="mt-3 p-3 border border-primary/30 rounded-lg bg-primary/5 text-sm text-primary-800">
                  {highlightMessage}
                </div>
              )}
            </Card>

            {/* Next Payment */}
            <Card className={cn("p-6", highlightedWidget === "next-payment" && "ring-2 ring-primary shadow-lg bg-white/90")}> 
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Próximo pago</h3>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
                  {nextPayment.status}
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(nextPayment.amount)}
                </div>
                <p className="text-gray-600 text-sm mb-2">{formatDate(nextPayment.date)}</p>
                <p className="text-orange-600 text-sm font-medium">
                  {nextPayment.daysLeft} días restantes
                </p>
                {nextPayment.note && (
                  <p className="text-sm text-gray-600 mt-3">{nextPayment.note}</p>
                )}
                {highlightedWidget === "next-payment" && highlightMessage && (
                  <div className="mt-3 p-3 border border-primary/30 rounded-lg bg-primary/5 text-sm text-primary-800">
                    {highlightMessage}
                  </div>
                )}
              </div>
            </Card>

            {/* Insights */}
            <Card className={cn("p-6", highlightedWidget === "insights" && "ring-2 ring-primary shadow-lg bg-white/90")}> 
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Insights de Axo</h3>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              {highlightedWidget === "insights" && highlightMessage && (
                <div className="mb-4 p-3 border border-primary/30 rounded-lg bg-primary/5 text-sm text-primary-800">
                  {highlightMessage}
                </div>
              )}
              <div className="space-y-3">
                {insights.map(insight => (
                  <div
                    key={insight.id}
                    className={cn(
                      "rounded-lg p-3 text-sm border",
                      insight.severity === "warning" && "bg-orange-50 text-orange-700 border-orange-100",
                      insight.severity === "success" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                      insight.severity === "info" && "bg-blue-50 text-blue-700 border-blue-100"
                    )}
                  >
                    <p className="font-semibold">{insight.title}</p>
                    <p className="mt-1 text-sm leading-snug">{insight.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bitácora de Axo</h3>
              <div className="space-y-3">
                {timelineEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">Aún no hay eventos registrados. Habla con Axo para comenzar.</p>
                ) : (
                  timelineEvents.map(event => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-snug">{event.detail}</p>
                      <span className="text-xs text-gray-500 mt-2 block">{formatDateTime(event.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Hacer un pago
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ver estado de cuenta
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Aumentar límite
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Axo Floating Button & Chat */}
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 ring-4 ring-white"
          size="icon"
        >
          <Image
            src="/images/axo.png"
            alt="Axo Assistant"
            width={28}
            height={28}
            className="rounded-full"
          />
        </Button>
      )}

      <AxoChat 
        isOpen={chatOpen} 
        onClose={handleChatClose}
        onAssistantAction={handleAssistantAction}
      />
    </div>
  )
}
