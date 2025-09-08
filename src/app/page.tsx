"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import AxoChat from "@/components/AxoChat"
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
  ArrowDownLeft
} from "lucide-react"

export default function NeobancoDemo() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [paymentDate, setPaymentDate] = useState(() => {
    // Fecha inicial: hoy + 11 días
    const today = new Date()
    const initialPaymentDate = new Date(today)
    initialPaymentDate.setDate(today.getDate() + 11)
    return initialPaymentDate
  })
  const [paymentAmount] = useState(3000)

  // Función para calcular días hasta la fecha de corte (11 días desde hoy inicialmente)
  const calculateDaysToPayment = (date: Date) => {
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    })
  }

  // Datos simulados del usuario
  const userData = {
    name: "María González",
    balance: 1230.00,
    creditLimit: 50000,
    creditUsed: 18500,
    nextPayment: {
      amount: paymentAmount,
      date: formatDate(paymentDate),
      daysLeft: calculateDaysToPayment(paymentDate)
    },
    transactions: [
      { id: 1, description: "Hospital", amount: -3786, date: "07 Sep", type: "expense" },
      { id: 2, description: "Supermercado", amount: -850, date: "02 Sep", type: "expense" },
      { id: 3, description: "Gasolina", amount: -1200, date: "01 Sep", type: "expense" },
      { id: 4, description: "Salario", amount: 15000, date: "01 Sep", type: "income" },
      { id: 5, description: "Farmacia", amount: -450, date: "31 Ago", type: "expense" },
    ]
  }

  // Iniciar demo automáticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true)
    }, 20000) // 20 segundos
    return () => clearTimeout(timer)
  }, [])

  const startChat = () => {
    setChatOpen(true)
    setShowNotification(false)
  }

  const handleChatClose = () => {
    setChatOpen(false)
    // Agregar 15 días a la fecha de pago cuando se cierre el chat
    setPaymentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(prevDate.getDate() + 15)
      return newDate
    })
  }

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
          <h2 className="text-2xl font-bold text-gray-900">¡Hola, {userData.name}! 👋</h2>
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
                {balanceVisible ? `$${userData.balance.toLocaleString()}` : "••••••"}
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
                  <span className="font-semibold">${(userData.creditLimit - userData.creditUsed).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(userData.creditUsed / userData.creditLimit) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Usado: ${userData.creditUsed.toLocaleString()}</span>
                  <span>Límite: ${userData.creditLimit.toLocaleString()}</span>
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
                  <span className="font-semibold">$120,000.00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(45000 / 120000) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Pagado: $45,000.00</span>
                  <span>Restante: $75,000.00</span>
                </div>
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Movimientos recientes</h3>
              <div className="space-y-3">
                {userData.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? 
                          <ArrowDownLeft className="w-4 h-4 text-green-600" /> : 
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.date}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Payment */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Próximo pago</h3>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${userData.nextPayment.amount.toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm mb-2">{userData.nextPayment.date}</p>
                <p className="text-orange-600 text-sm font-medium">
                  {userData.nextPayment.daysLeft} días restantes
                </p>
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
      />
    </div>
  )
}
