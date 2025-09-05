# AxoCred Design System

Este proyecto implementa el sistema de diseño para **AxoCred**, el sistema operativo estándar para gestión de crédito inteligente en el ecosistema Fintech y SOFOM de México.

## 🎯 **Nueva Identidad de Marca**

### **Posicionamiento:**
- **Antes:** Chatbot empático para cobranza
- **Ahora:** Sistema operativo B2B para crédito inteligente
- **Factor Diferenciador:** De crédito reactivo a proactivo con IA autónoma

### **Target B2B:**
- Bancos digitales (Nu, Ualá, Klar)
- SOFOMs (Kueski, Credijusto)
- Fintech crediticias
- Cooperativas de ahorro y crédito

## 🎨 Paleta de Colores

### Variables CSS Personalizadas
```css
:root {
  --background: #F7FAFC;     /* Blanco Hueso - Fondo principal */
  --foreground: #1A202C;     /* Azul Medianoche - Texto principal */
  --primary: #48BB78;        /* Verde Regeneración - Color de marca */
  --secondary: #A0AEC0;      /* Gris Neutro - Elementos de apoyo */
  --accent: #F56565;         /* Coral Empático - Elementos destacados */
  --muted: #F7FAFC;         /* Fondo sutil */
  --muted-foreground: #718096; /* Texto secundario */
  --border: #E2E8F0;        /* Bordes */
}
```

### Clases Tailwind Disponibles
- `bg-background`, `bg-primary`, `bg-secondary`, `bg-accent`
- `text-foreground`, `text-primary`, `text-secondary`, `text-accent`
- `text-muted-foreground`
- `border-secondary/20`, `border-primary`

## 🔤 Tipografía

### Fuentes
- **Principal**: Geist Sans (`font-sans`)
- **Monospace**: Geist Mono (`font-mono`)

### Jerarquía Tipográfica
- **Hero**: `text-4xl sm:text-5xl lg:text-6xl font-bold`
- **Sección**: `text-3xl sm:text-4xl lg:text-5xl font-bold`
- **Título de Card**: `text-2xl font-bold`
- **Cuerpo**: `text-lg` o `text-xl`
- **Descripción**: `text-base`

## 🧩 Componentes UI

### Button
```tsx
import { Button } from "@/components/ui/button"

// Variantes disponibles
<Button variant="default">Predeterminado</Button>
<Button variant="outline">Contorno</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="destructive">Destructivo</Button>

// Tamaños disponibles
<Button size="sm">Pequeño</Button>
<Button size="default">Mediano</Button>
<Button size="lg">Grande</Button>
<Button size="icon">Icono</Button>
```

### Card
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido de la tarjeta
  </CardContent>
</Card>
```

## 🎯 Layout y Espaciado

### Contenedores
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Contenido */}
</div>
```

### Secciones
```tsx
<section className="py-16 sm:py-24">
  {/* Espaciado vertical consistente */}
</section>
```

### Grid Responsivo
```tsx
<div className="grid md:grid-cols-3 gap-8">
  {/* Elementos del grid */}
</div>
```

## 🌟 Efectos Visuales

### Fondos Sutiles
- `bg-primary/5` - Fondo verde muy sutil
- `bg-secondary/5` - Fondo gris muy sutil
- `bg-primary/10` - Fondo verde sutil para iconos

### Sombras
- `shadow-lg` - Sombra media para cards
- `shadow-2xl` - Sombra dramática para elementos destacados

### Bordes Redondeados
- `rounded-3xl` - Esquinas muy redondeadas para cards
- `rounded-full` - Círculo perfecto para iconos
- `rounded-2xl` - Esquinas redondeadas para mensajes

### Efectos de Cristal
- `backdrop-blur` - Efecto glassmorphism
- `bg-background/95` - Fondo semi-transparente

## 🔧 Iconografía (Lucide React)

### Iconos Principales para B2B
```tsx
import { 
  Brain,             // IA y análisis inteligente
  Zap,               // Renegociación proactiva (feature clave)
  MessageSquare,     // Conversación natural
  Smartphone,        // SDK móvil
  Shield,            // Seguridad bancaria
  BarChart3,         // Analytics y métricas
  TrendingUp,        // Crecimiento y resultados
  AlertTriangle,     // Alertas de riesgo
  CheckCircle,       // Validaciones y confirmaciones
  Bot,               // Mascota Axo
  Building2,         // Instituciones financieras
  Briefcase,         // SOFOMs y empresas
  Users,             // Fintech y cooperativas
  Clock,             // Tiempo real y rapidez
  Mic               // Interfaz de voz
} from "lucide-react"
```

## 📱 Responsive Design

### Breakpoints
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+

### Enfoque Mobile-First
Todos los estilos están diseñados primero para móvil y luego se adaptan a pantallas más grandes.

## 🎨 Filosofía de Diseño

1. **Minimalismo**: Espacios en blanco generosos
2. **Accesibilidad**: Colores con buen contraste
3. **Modernidad**: Efectos glassmorphism y esquinas redondeadas
4. **Coherencia**: Sistema unificado de colores y espaciado
5. **Responsividad**: Diseño que funciona en todos los dispositivos

## 🚀 Uso en Componentes

### Ejemplo de Card con Iconos
```tsx
<Card>
  <CardHeader>
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <TrendingDown className="w-6 h-6 text-primary" />
    </div>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
</Card>
```

### Ejemplo de Chat Interface
```tsx
<div className="space-y-4">
  <div className="bg-secondary/10 rounded-2xl p-4">
    <p className="text-sm">Mensaje del asistente</p>
  </div>
  <div className="bg-primary/10 rounded-2xl p-4 ml-8">
    <p className="text-sm">Respuesta del usuario</p>
  </div>
</div>
```
