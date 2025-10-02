export interface DemoUserProfile {
  id: string
  name: string
  contact: {
    email: string
    phone: string
    location: string
  }
  employment: {
    status: "empleada" | "independiente" | "desempleada"
    employer: string
    monthlyIncome: number
  }
  obligations: {
    creditCard: {
      issuer: string
      nextPaymentAmount: number
      nextPaymentDate: string
      minimumPayment: number
      pastDueBalance: number
      interestRate: number
      statementClosingDate: string
      delinquencyRisk: "bajo" | "medio" | "alto"
    }
    personalLoan: {
      lender: string
      remainingBalance: number
      monthlyInstallment: number
      nextDueDate: string
      rate: number
      originalAmount: number
      paidToDate: number
    }
    utilities: Array<{ name: string; amount: number; dueDay: number }>
    subscriptions: Array<{ name: string; amount: number; renewalDate: string }>
  }
  budgets: Array<{
    category: string
    limit: number
    spent: number
    trend: "estable" | "aumento" | "disminucion"
    insight: string
  }>
  goals: Array<{
    id: string
    title: string
    targetAmount: number
    saved: number
    deadline: string
    status: "en_progreso" | "logrado" | "pausado"
  }>
  account: {
    currentBalance: number
    savingsWithAxo: number
    creditLimit: number
    creditUsed: number
  }
  recentTransactions: Array<{
    id: string
    description: string
    amount: number
    date: string
    type: "income" | "expense"
    category: string
  }>
  scores: {
    financialHealth: number
    behaviour: number
    liquidity: number
    comment: string
  }
  painPoints: string[]
  opportunities: string[]
}

export const demoUserProfile: DemoUserProfile = {
  id: "mar-001",
  name: "María González",
  contact: {
    email: "maria.gonzalez@email.com",
    phone: "+52 55 1234 5678",
    location: "CDMX"
  },
  employment: {
    status: "empleada",
    employer: "TechWave Solutions",
    monthlyIncome: 24500
  },
  obligations: {
    creditCard: {
      issuer: "FintechBank Visa Signature",
      nextPaymentAmount: 3000,
      nextPaymentDate: new Date().toISOString(),
      minimumPayment: 900,
      pastDueBalance: 0,
      interestRate: 38.4,
      statementClosingDate: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 3)
        return date.toISOString()
      })(),
      delinquencyRisk: "medio"
    },
    personalLoan: {
      lender: "FintechBank",
      remainingBalance: 75000,
      monthlyInstallment: 4200,
      nextDueDate: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 18)
        return date.toISOString()
      })(),
      rate: 32,
      originalAmount: 120000,
      paidToDate: 45000
    },
    utilities: [
      { name: "Renta", amount: 8500, dueDay: 5 },
      { name: "Servicios (luz, agua, internet)", amount: 1620, dueDay: 10 },
      { name: "Seguro de auto", amount: 1150, dueDay: 20 }
    ],
    subscriptions: [
      { name: "Gimnasio", amount: 699, renewalDate: "2025-10-02" },
      { name: "Streaming", amount: 249, renewalDate: "2025-10-12" }
    ]
  },
  budgets: [
    {
      category: "Alimentos",
      limit: 5000,
      spent: 4350,
      trend: "aumento",
      insight: "Gasto 15% más que el promedio de los últimos 3 meses."
    },
    {
      category: "Transporte",
      limit: 1800,
      spent: 1650,
      trend: "estable",
      insight: "Uso consistente gracias al carpooling."
    },
    {
      category: "Entretenimiento",
      limit: 1200,
      spent: 1580,
      trend: "aumento",
      insight: "Fin de semana con eventos y streaming premium."
    }
  ],
  goals: [
    {
      id: "goal-01",
      title: "Fondo de emergencia 3 meses",
      targetAmount: 73500,
      saved: 42000,
      deadline: "2026-03-01",
      status: "en_progreso"
    },
    {
      id: "goal-02",
      title: "Viaje a Oaxaca",
      targetAmount: 18500,
      saved: 5200,
      deadline: "2025-12-20",
      status: "en_progreso"
    }
  ],
  account: {
    currentBalance: 1230,
    savingsWithAxo: 7800,
    creditLimit: 50000,
    creditUsed: 18500
  },
  recentTransactions: [
    { id: "t-101", description: "Hospital Ángeles", amount: -3786, date: "2025-09-07", type: "expense", category: "Salud" },
    { id: "t-102", description: "Supermercado La Comer", amount: -850, date: "2025-09-02", type: "expense", category: "Alimentos" },
    { id: "t-103", description: "Gasolina", amount: -1200, date: "2025-09-01", type: "expense", category: "Transporte" },
    { id: "t-104", description: "Nómina TechWave", amount: 15000, date: "2025-09-01", type: "income", category: "Ingreso" },
    { id: "t-105", description: "Farmacia San Pablo", amount: -450, date: "2025-08-31", type: "expense", category: "Salud" }
  ],
  scores: {
    financialHealth: 68,
    behaviour: 74,
    liquidity: 55,
    comment: "María mantuvo sus pagos al día, pero las emergencias médicas del mes pusieron presión en su liquidez."
  },
  painPoints: [
    "Gastos médicos inesperados generaron estrés y uso de la tarjeta.",
    "Le preocupa acumular intereses al no pagar el total del saldo.",
    "Quiere mantener su puntaje crediticio y evitar reportes por mora."
  ],
  opportunities: [
    "Ofrecer plan de pagos diferidos para aliviar el flujo de efectivo.",
    "Proponer reto de ahorro específico para reponer el fondo de emergencia.",
    "Recomendar seguro de gastos médicos menores con deducible bajo."
  ]
}
