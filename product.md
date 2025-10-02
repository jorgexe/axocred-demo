---
# Posicionamiento Estratégico: Plataforma B2B "AxoAlly"

### Quiénes somos
"Somos AxoAlly. Hemos desarrollado una plataforma de software (SaaS) de 'Inteligencia Conductual' que los bancos, neobancos y Fintechs pueden integrar en sus propias aplicaciones. A través de nuestro coach de IA, Axo, nuestra herramienta ayuda a las instituciones financieras a transformar la experiencia de sus clientes, reduciendo las tasas de morosidad a través de la prevención y la empatía, y aumentando la lealtad al guiarlos hacia la regeneración financiera."

### Modelo de Negocio
Cobramos a las instituciones una licencia por usuario activo que utiliza nuestra tecnología.

### Ventaja (Argumento para el jurado)
- **Resuelve un Problema de la Industria**: No competimos con los bancos, los convertimos en aliados de la salud financiera de sus clientes.  
- **Modelo de Negocio Escalable**: Es una propuesta tecnológica realista y mucho más atractiva que levantar capital para prestar.  
- **Enfoca el Pitch en la Tecnología**: Nuestra innovación en IA conductual y la historia de Axo se convierten en los héroes de la historia, respondiendo directamente al reto del hackathon.  

---

# Plan de Desarrollo del Prototipo MVP: "AxoCoach"

### 1. Objetivo Principal del Prototipo
Nuestro objetivo es construir una experiencia de demostración de 5 minutos que pruebe de manera irrefutable nuestra innovación principal: **Axo, un coach financiero proactivo que utiliza IA conversacional para fomentar la regeneración de hábitos financieros.**

---

### 4. Estructura del Prototipo: Secciones y Elementos Clave

#### Vista 1: Pantalla de Inicio (Simulada)
**Elementos:**
- Logo de "AxoCoach".  
- Un campo de email y contraseña pre-rellenados para nuestro usuario "Sofía".  
- Un único botón: "Ingresar".  

**Funcionamiento:**  
Cero lógica. Redirige directamente al Dashboard.  

---

#### Vista 2: El Dashboard Principal (El Vistazo)
**Elementos:**
- Header: "Hola, Sofía" y un ícono de perfil.  
- Componente Central: Nuestra mascota, **Axo el ajolote**, cuyo estado visual (feliz, neutro, preocupado) se calcula a partir de los datos del JSON.  
- Indicador Principal: **"Tu Salud Financiera: 75/100 (Estable)".**  
- Métricas Clave (3 Widgets):  
  - "Presupuesto del Mes": Barra de progreso.  
  - "Última Quest Superada": Medalla.  
  - "Ahorro Total con AxoCoach": Número destacado.  
- CTA Principal: Un botón grande y atractivo: **"Habla con Axo".**  

**Funcionamiento:**  
La vista lee el `transactions.json` para mostrar las métricas. El CTA navega a la Vista 3.  

---

#### Vista 3: La Interfaz Conversacional (El Corazón del Demo)
**Elementos:**
- Header: "Hablando con Axo" con la imagen de nuestro ajolote.  
- Área de Chat: Burbujas de mensajes para el usuario y para Axo.  
- Input de Texto: Campo para escribir, botón de "Enviar".  
- Sugerencias de Prompt:  
  - ¿Cómo va mi mes?  
  - Dame un reto para ahorrar  
  - ¿Qué es el CAT?  

**Funcionamiento:**  
- El frontend envía la pregunta del usuario a la API Route.  
- El backend combina la pregunta, el prompt maestro y los datos del `transactions.json`.  
- Se hace la llamada a la API del LLM.  
- La respuesta se muestra en una nueva burbuja de chat de Axo.  

---

### 5. El Secreto de la Factibilidad: El `transactions.json`
(Sin cambios, el archivo y su estructura son correctos)  

---

### 6. Flujo de la Demostración (Nuestro Guion para el Pitch Actualizado)

- **(0:00 - 0:30)**  
"Hola, somos el equipo [Nombre]. Cada año, miles de jóvenes caen en sobreendeudamiento no por malas intenciones, sino por malos hábitos. Para ellos, creamos una herramienta de regeneración financiera. Les presentamos AxoCoach."

- **(0:30 - 1:00)**  
"Al ingresar, el usuario no ve datos fríos, sino a Axo, nuestro coach de IA. El estado de Axo es un reflejo simple y empático de su salud financiera." (Mostramos Vista 2).

- **(1:00 - 3:30)**  
"Pero la verdadera magia sucede al conversar." (Hacemos clic en "Habla con Axo").  
"El usuario puede interactuar en lenguaje natural. Preguntémosle cómo va su mes."  
Axo responde, identificando el gasto en 'Comida a Domicilio'.  
"Como ven, Axo no solo da datos, da contexto. Ahora, pidámosle un reto para mejorar."  
Axo genera una 'Quest' personalizada.  
"Finalmente, resuelve dudas complejas de forma simple." (Preguntamos qué es el CAT).  
Axo da una explicación clara.  

- **(3:30 - 4:30)**  
"Este prototipo es 100% funcional. Lo construimos con Next.js, lo desplegamos en Vercel, y la inteligencia conversacional es impulsada por una API de LLM que interpreta el comportamiento del usuario para darle consejos verdaderamente personalizados."

- **(4:30 - 5:00)**  
"AxoCoach es original porque no es un gestor de gastos, es un motor de cambio de comportamiento. Y es 100% factible. Con AxoCoach, las instituciones financieras pueden finalmente convertirse en un aliado para la regeneración financiera de sus clientes. Gracias."
---

---

# AxoCred — Notas depuradas (versión desarrollada)

## Mensaje / Tono
- Evitar frases negativas como “está roto”; mejor decir: **procesos poco eficientes y costosos**.
- Lenguaje sencillo; definir tecnicismos en una línea.  
  - *SDK*: bloque de software que se integra en apps de terceros.  
  - *Zero-trust*: esquema de seguridad donde cada interacción se autentica.
- Respuestas breves y directas; ampliar solo si piden profundidad.
- Tener métricas clave del MVP listas:  
  - Reducción del tiempo de renegociación: **–60 %**  
  - Ahorro de costos operativos: **–40 %**  
  - Incremento esperado en recuperaciones: **+25 %**

---

## Historia del Pitch

### Problema
Los bancos y fintechs gestionan crédito y cobranza con equipos manuales. Esto implica **costos altos, lentitud y procesos reactivos** que desgastan la relación con el cliente.

### Solución
**AxoCred**, un **agente conversacional de IA** que se integra como SDK en las apps de bancos y fintechs.  
Axo no solo conversa: **ejecuta el ciclo de crédito**, detecta problemas, renegocia y documenta cumplimiento.

### Por qué ahora
- **Morosidad creciente** en jóvenes y segmentos vulnerables.  
- **Presión regulatoria** para documentar cada paso.  
- **Necesidad de eficiencia** en canales digitales.  
- **Madurez de la IA** para interacciones personalizadas.

### MVP
Demo funcional de **renegociación autónoma end-to-end**:
1. Detecta retraso en pago.  
2. Conversa con el cliente en tono empático.  
3. Propone alternativas de pago.  
4. Documenta acuerdo y cumplimiento.  

### Modelo de negocio
- **Licencia SaaS base**.  
- **Variable** por crédito gestionado o resultado.  
- **Add-ons**: analítica avanzada, más canales, compliance, identidad.  

### Cierre
Nuestro equipo combina experiencia en banca, IA y producto digital. Estamos listos para pilotos con instituciones financieras.

---

## Competencia real

**Competidores identificados en México / LatAm:**
1. **Colektia** — infraestructura de cobranza con IA; en México prometen +25 % en recupero y –30 % en costos.  
2. **Moonflow** — software de cobranzas automatizado, comunicaciones omnicanal con IA.  
3. **Intiza** — software de gestión de cobranzas que automatiza tareas repetitivas y genera reportes.  

(Opcionales adicionales: Toku, Flexio, Por Cobrar).

---

## Tabla comparativa: Funcionalidades

**Leyenda:**  
✅ = Sí / fortaleza clara  
🟡 = Parcial / depende del caso o plan  
🔸 = Limitado / indirecto, no foco principal  
❌ = No disponible  

| Funcionalidad | **Colektia** | **Moonflow** | **Intiza** | **AxoCred (nosotros)** |
|---|:---:|:---:|:---:|:---:|
| Registro / asignación de tareas | ✅ | 🟡 | ✅ | ✅ |
| Dashboard & analítica | ✅ | ✅ | ✅ | ✅ |
| Omnicanal (SMS/WhatsApp/Email/App) | ✅ | ✅ | 🟡 | ✅ |
| IA conversacional empática | 🟡 | 🟡 | 🔸 | ✅ |
| **Renegociación autónoma** (ofertas/planes) | 🟡 | 🔸 | ❌ | ✅ |
| **Cumplimiento MX** (normativa local) | 🟡 | 🔸 | 🔸 | ✅ |
| **SDK embebible** (en app bancaria) | 🔸 | 🔸 | ❌ | ✅ |
| **Autonomía end-to-end** (detectar→conversar→acordar→documentar) | 🟡 | 🔸 | ❌ | ✅ |
| Trazabilidad / **audit trail** completo | ✅ | 🟡 | 🟡 | ✅ |
| **Personalización conductual** (hábitos, micro-retos) | 🔸 | 🔸 | ❌ | ✅ |
| Escalabilidad con mínima intervención humana | 🟡 | 🟡 | 🔸 | ✅ |

**Interpretación para el jurado:**
- **Colektia**: fuerte en omnicanal y analítica; negociación autónoma solo parcial.  
- **Moonflow**: sólido en automatización de mensajes; cumplimiento y renegociación menos profundos.  
- **Intiza**: buena en tareas repetitivas; no ofrece autonomía real de negociación.  
- **AxoCred**: **ejecución autónoma embebible**, con **cumplimiento mexicano** y **IA conductual**.

---

## Tabla de costos estimados (ejemplo)

> *Nota: valores simulados, ajustar con investigación local.*

| Concepto | Costo estimado (MXN) | Comentarios |
|---|---|---|
| IA / inferencia por interacción | $0.50 por mensaje | costo que baja a escala |
| Canal SMS / WhatsApp | $0.25–$0.40 por mensaje | depende del proveedor |
| Licencia base mensual | $15,000 | por institución |
| Setup inicial / integración | $80,000 | amortizado en 12–24 meses |
| Mantenimiento / soporte | 10–15 % ingresos | estándar SaaS |
| Variable por crédito gestionado | $30–$80 | costo unitario |
| Ingreso variable esperado | $100 | por crédito renegociado exitoso |

**Ejemplo de unit economics:**  
Con 1,000 créditos renegociados/mes →  
Ingresos ≈ $115,000 MXN (licencia + variable)  
Costos ≈ $15,800 MXN  
Margen bruto ≈ $99,200 MXN (86 %).

---

## Justificación de la solución

### Qué hacen hoy bancos / SaaS
- **Despachos de cobranza tradicionales** → costosos, trato invasivo, riesgo reputacional.  
- **SaaS actuales (Colektia, Moonflow, Intiza)** → automatizan recordatorios y segmentación, pero **la negociación autónoma sigue siendo parcial o inexistente**.

### Cómo AxoCred mejora
- Interviene **temprano** (a los 5–10 días de retraso).  
- Conversa en tono empático y contextual.  
- Propone planes de pago personalizados según reglas del banco.  
- Documenta todo para cumplir con **CONDUSEF / CNBV**.  
- Escala sin necesidad de incrementar personal humano.  

### Resultados esperados (referencias reales)
- **Colektia**: +25 % recupero y –30 % costos.  
- **Moonflow**: hasta –75 % costos de cobranza al automatizar.  
- **Intiza**: eficiencia en tareas, pero no negociación.  
- **AxoCred**: proyectamos +10–20 % recupero y –20–30 % costos, con empatía y cumplimiento como diferenciadores.

---