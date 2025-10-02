import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AxoChat Demo',
  description: 'Demo de AxoChat con integración de voz',
}

// Force dynamic rendering to avoid SSR issues with VapiWidget
export const dynamic = 'force-dynamic'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

