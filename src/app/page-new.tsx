import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingDown, 
  HeartHandshake, 
  ShieldCheck, 
  MessageCircleHeart,
  Mic,
  Square,
  Volume2 
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <h3 className="text-2xl font-bold text-primary">AxoCred</h3>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="#" className="transition-colors hover:text-primary">Inicio</a>
            <a href="#" className="transition-colors hover:text-primary">Servicios</a>
            <a href="#" className="transition-colors hover:text-primary">Contacto</a>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button variant="outline">Iniciar Sesión</Button>
            <Button>Comenzar</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold max-w-4xl">
              Revoluciona tu{" "}
              <span className="text-primary">gestión crediticia</span>{" "}
              con inteligencia artificial
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Reduce la morosidad, aumenta la lealtad del cliente y optimiza tus procesos 
              de cobranza con nuestra plataforma de IA conversacional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg">Solicitar Demo</Button>
              <Button variant="outline" size="lg">Ver Funcionalidades</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Beneficios Comprobados
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nuestra tecnología de IA ha demostrado resultados excepcionales 
              en empresas de todos los tamaños.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingDown className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Reducción de Morosidad</CardTitle>
                <CardDescription>
                  Hasta 40% de reducción en índices de morosidad mediante 
                  comunicación temprana y personalizada.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <HeartHandshake className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Mayor Lealtad</CardTitle>
                <CardDescription>
                  Mejora la relación con tus clientes a través de un trato 
                  empático y soluciones personalizadas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Cumplimiento Total</CardTitle>
                <CardDescription>
                  100% de cumplimiento normativo con registro completo 
                  de todas las interacciones.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Chat Demo Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                IA Conversacional Avanzada
              </h2>
              <p className="text-xl text-muted-foreground">
                Nuestro asistente de IA se comunica de manera natural y empática, 
                adaptándose al perfil de cada cliente para maximizar la efectividad.
              </p>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon">
                  <Mic className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Square className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Card className="shadow-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MessageCircleHeart className="w-6 h-6 text-primary" />
                    <CardTitle>Asistente AxoCred</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-secondary/10 rounded-2xl p-4">
                    <p className="text-sm">
                      Hola María, espero que tengas un buen día. Me comunico para 
                      recordarte sobre tu pago pendiente y ver cómo podemos ayudarte.
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-2xl p-4 ml-8">
                    <p className="text-sm">
                      Hola, sí he tenido algunos problemas pero ya se están solucionando. 
                      ¿Podríamos hablar de un plan de pagos?
                    </p>
                  </div>
                  <div className="bg-secondary/10 rounded-2xl p-4">
                    <p className="text-sm">
                      Por supuesto, entiendo tu situación. Podemos crear un plan 
                      personalizado que se adapte a tus posibilidades actuales.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              ¿Listo para transformar tu cobranza?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a las empresas que ya están viendo resultados extraordinarios 
              con nuestra plataforma de IA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Solicitar Demo Gratuita</Button>
              <Button variant="outline" size="lg">Hablar con un Experto</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary/20 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4">AxoCred</h3>
              <p className="text-sm text-muted-foreground">
                Revolucionando la gestión crediticia con inteligencia artificial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-primary">Integraciones</a></li>
                <li><a href="#" className="hover:text-primary">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Carreras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Documentación</a></li>
                <li><a href="#" className="hover:text-primary">Contacto</a></li>
                <li><a href="#" className="hover:text-primary">Estado del servicio</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AxoCred. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
