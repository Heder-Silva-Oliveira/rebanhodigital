# Guia de Design e Arquitetura - AgroGest

## 📐 Visão Geral da Arquitetura

O AgroGest segue uma arquitetura **Client-Server** com separação clara de responsabilidades, implementando padrões modernos de desenvolvimento web com foco em escalabilidade, manutenibilidade e experiência do usuário.

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    MongoDB    ┌─────────────────┐
│   FRONTEND      │ ◄──────────────► │    BACKEND      │ ◄────────────► │    DATABASE     │
│   React/TS      │                 │   Node.js/API   │               │   Collections   │
└─────────────────┘                 └─────────────────┘               └─────────────────┘
```

---

## 🎨 FRONTEND - Arquitetura em Camadas

### **Estrutura de Diretórios**
```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas/Views da aplicação
├── hooks/              # Custom Hooks
├── context/            # Context API (Estado Global)
├── services/           # Camada de comunicação com API
├── utils/              # Funções utilitárias
├── assets/             # Recursos estáticos
└── lib/                # Bibliotecas e configurações
```

### **1. Camada de Apresentação (UI Layer)**

#### **Componentes Base**
```typescript
// Estrutura padrão de componente
interface ComponentProps {
  // Props tipadas
}

const Component: React.FC<ComponentProps> = ({ props }) => {
  // Lógica do componente
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  )
}
```

#### **Design System**
- **Tema**: Sistema de cores consistente (verde primário #00875e)
- **Tipografia**: Hierarquia clara com Tailwind CSS
- **Espaçamento**: Grid system responsivo
- **Componentes**: Reutilizáveis e modulares

```typescript
// Exemplo: Componente de Card reutilizável
interface CardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'red' | 'yellow'
  format?: 'currency' | 'number' | 'percent'
}

const MetricCard: React.FC<CardProps> = ({ title, value, icon, color, format }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{formatValue(value, format)}</p>
    </div>
  )
}
```

### **2. Camada de Estado (State Layer)**

#### **Context API - Gerenciamento Global**
```typescript
// AuthContext - Estado de autenticação
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (credentials: Credentials) => Promise<User>
  signUp: (payload: SignUpPayload) => Promise<any>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Lógica de autenticação
  const signIn = useCallback(async (credentials: Credentials) => {
    // Implementação de login
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

#### **Custom Hooks - Lógica Reutilizável**
```typescript
// useCRUD - Hook genérico para operações CRUD
export function useCRUD<T extends { id?: string }>(entityName: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/${entityName}`, {
        headers: getAuthHeaders()
      })
      const result = await response.json()
      setData(result.data || result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [entityName])

  const createRecord = useCallback(async (item: Omit<T, 'id'>) => {
    // Implementação de criação
  }, [entityName])

  const updateRecord = useCallback(async (id: string, updates: Partial<T>) => {
    // Implementação de atualização
  }, [entityName])

  const deleteRecord = useCallback(async (id: string) => {
    // Implementação de exclusão
  }, [entityName])

  return { data, loading, error, createRecord, updateRecord, deleteRecord, reload: loadData }
}
```

### **3. Camada de Serviços (Service Layer)**

#### **API Client**
```typescript
// api.ts - Cliente HTTP configurado
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

class ApiClient {
  private baseURL: string
  
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return this.handleResponse<T>(response)
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Logout automático
        localStorage.removeItem('token')
        window.location.href = '/'
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }
}

export const apiClient = new ApiClient(API_URL)
```

### **4. Camada de Roteamento (Routing Layer)**

#### **Proteção de Rotas**
```typescript
// ProtectedRoute - Componente de proteção
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

// App.tsx - Estrutura de rotas
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Rotas Protegidas */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/animals" element={<ProtectedRoute><Animals /></ProtectedRoute>} />
        <Route path="/financial" element={<ProtectedRoute><Financial /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}
```

---

## 🔧 BACKEND - Arquitetura em Camadas

### **Estrutura de Diretórios**
```
api/
├── config/             # Configurações (DB, JWT, Email)
├── controllers/        # Controladores (Lógica de Negócio)
├── middlewares/        # Middlewares (Auth, Logs, Validação)
├── models/            # Modelos de Dados (Mongoose)
├── routes/            # Definição de Rotas
├── services/          # Serviços (Email, WhatsApp, etc.)
├── utils/             # Utilitários
├── app.js             # Configuração do Express
└── server.js          # Ponto de entrada
```

### **1. Camada de Roteamento (Route Layer)**

#### **Estrutura de Rotas**
```javascript
// routes/index.js - Roteador principal
import express from 'express'
import authRoutes from './auth.routes.js'
import animalRoutes from './animal.routes.js'
import financialRoutes from './financial.routes.js'

const router = express.Router()

// Health check
router.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor AgroGest funcionando!',
    timestamp: new Date().toISOString()
  })
})

// Rotas da API
router.use('/', authRoutes)           // /api/login, /api/register
router.use('/animals', animalRoutes)  // /api/animals/*
router.use('/financial_transactions', financialRoutes) // /api/financial_transactions/*

export default router
```

#### **Rotas Específicas com Middlewares**
```javascript
// routes/animal.routes.js
import express from 'express'
import * as animalController from '../controllers/animal.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { checkRole } from '../middlewares/role.middleware.js'

const router = express.Router()

// Middleware de autenticação para todas as rotas
router.use(authenticateToken)

// CRUD Operations
router.get('/', animalController.list)                    // GET /api/animals
router.get('/:id', animalController.getById)              // GET /api/animals/:id
router.post('/', animalController.create)                 // POST /api/animals
router.patch('/:id', animalController.update)             // PATCH /api/animals/:id
router.delete('/:id', checkRole(['admin']), animalController.remove) // DELETE /api/animals/:id

export default router
```

### **2. Camada de Middleware**

#### **Autenticação JWT**
```javascript
// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.js'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' })
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' })
    }
    req.user = userPayload // Adiciona dados do usuário à requisição
    next()
  })
}
```

#### **Controle de Planos**
```javascript
// middlewares/plan.middleware.js
import { PLAN_LIMITS } from '../config/plans.js'

export const checkPlanFeature = (featureName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.plan) {
      return res.status(401).json({ message: 'Plano não identificado.' })
    }
    
    const limits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.basic
    
    if (limits.features && limits.features[featureName]) {
      return next()
    }
    
    return res.status(403).json({
      message: `Recurso indisponível no plano ${limits.name}. Faça upgrade.`
    })
  }
}

// Uso nas rotas
router.get('/company-health', checkPlanFeature('companyHealth'), companyHealthController.getMetrics)
```

### **3. Camada de Controle (Controller Layer)**

#### **Padrão de Controller**
```javascript
// controllers/animal.controller.js
import { Animal } from '../models/Animal.model.js'
import { PLAN_LIMITS } from '../config/plans.js'

export const list = async (req, res) => {
  try {
    // Busca animais do tenant do usuário autenticado
    const animals = await Animal.find({ tenantId: req.user.tenantId })
      .sort({ created_at: -1 })
    
    res.json({ animals })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar animais' })
  }
}

export const create = async (req, res) => {
  try {
    const { plan, tenantId } = req.user
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.basic
    
    // Verifica limite do plano
    const count = await Animal.countDocuments({ tenantId })
    if (count >= limits.animals) {
      return res.status(403).json({ 
        message: `Limite de ${limits.animals} animais atingido.` 
      })
    }

    // Cria novo animal
    const newAnimal = await Animal.create({
      ...req.body,
      tenantId,
      id: req.body.id || `anim_${Date.now()}`,
      created_at: new Date()
    })
    
    res.status(201).json(newAnimal)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const update = async (req, res) => {
  try {
    const item = await Animal.findOneAndUpdate(
      { id: req.params.id, tenantId: req.user.tenantId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    
    if (!item) {
      return res.status(404).json({ error: 'Animal não encontrado' })
    }
    
    res.json(item)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
```

### **4. Camada de Modelo (Model Layer)**

#### **Schema Mongoose**
```javascript
// models/Animal.model.js
import mongoose from 'mongoose'

const AnimalSchema = new mongoose.Schema({
  // Multi-tenancy
  tenantId: { type: String, required: true, index: true },
  
  // Identificação
  id: String,
  animalId: String,
  name: String,
  
  // Características
  species: String,
  breed: String,
  birthDate: Date,
  gender: String,
  
  // Dados Zootécnicos
  weight: Number,
  status: String,
  healthStatus: String,
  location: String,
  
  // Genealogia
  motherId: String,
  fatherId: String,
  
  // Dados Financeiros
  purchasePrice: Number,
  purchaseDate: Date,
  
  // Metadados
  notes: String,
  created_at: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Índices para performance
AnimalSchema.index({ tenantId: 1, status: 1 })
AnimalSchema.index({ tenantId: 1, animalId: 1 })

export const Animal = mongoose.model('Animal', AnimalSchema)
```

### **5. Camada de Serviços (Service Layer)**

#### **Serviço de Email**
```javascript
// services/email.service.js
import { transporter } from '../config/mail.js'
import { EMAIL_USERNAME, BACKEND_URL } from '../config/env.js'

export const sendVerificationEmail = async (toEmail, token) => {
  const verificationLink = `${BACKEND_URL}/api/verify-email?token=${token}`
  
  const mailOptions = {
    from: EMAIL_USERNAME,
    to: toEmail,
    subject: 'Verifique seu Email - AgroGest',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #00875e;">Bem-vindo ao AgroGest!</h2>
        <p>Para ativar sua conta, clique no botão abaixo:</p>
        <a href="${verificationLink}" 
           style="display: inline-block; padding: 12px 24px; 
                  background-color: #00875e; color: white; 
                  text-decoration: none; border-radius: 5px;">
          Ativar Conta
        </a>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`📧 Email enviado para ${toEmail}`)
  } catch (error) {
    console.error(`❌ Erro no envio:`, error.message)
    throw new Error('Falha ao enviar email')
  }
}
```

#### **Serviço de WhatsApp**
```javascript
// services/whatsapp.service.js
import twilio from 'twilio'
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } from '../config/env.js'

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

export const sendWhatsappMessage = async (to, body) => {
  try {
    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to.replace(/\s+/g, '')}`,
      body
    })

    console.log(`✅ WhatsApp enviado para ${to}`)
    return { success: true, sid: message.sid }
  } catch (error) {
    console.error(`❌ Erro WhatsApp:`, error.message)
    return { success: false, error: error.message }
  }
}
```

### **6. Camada de Configuração (Config Layer)**

#### **Configuração de Banco de Dados**
```javascript
// config/database.js
import mongoose from 'mongoose'
import { MONGODB_URI } from './env.js'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ Erro na conexão MongoDB:', error.message)
    process.exit(1)
  }
}
```

#### **Configuração de Planos**
```javascript
// config/plans.js
export const PLAN_LIMITS = {
  basic: { 
    name: 'Basic', 
    animals: 5, 
    pastures: 2, 
    features: { companyHealth: false } 
  },
  pro: { 
    name: 'Pro', 
    animals: 500, 
    pastures: 50, 
    features: { companyHealth: true } 
  },
  enterprise: { 
    name: 'Enterprise', 
    animals: Infinity, 
    pastures: Infinity, 
    features: { companyHealth: true } 
  }
}
```

---

## 🔄 Fluxo de Dados e Comunicação

### **1. Fluxo de Autenticação**
```
1. Frontend: Login form → POST /api/login
2. Backend: Valida credenciais → Gera JWT
3. Backend: Retorna { token, user }
4. Frontend: Armazena no localStorage
5. Frontend: Inclui token em todas as requisições
6. Backend: Middleware valida token em cada request
```

### **2. Fluxo CRUD Típico**
```
1. Frontend: useCRUD hook → GET /api/animals
2. Backend: authenticateToken middleware
3. Backend: Controller busca dados do tenant
4. Backend: Retorna dados filtrados
5. Frontend: Atualiza estado local
6. Frontend: Re-renderiza componentes
```

### **3. Fluxo de Validação de Planos**
```
1. Frontend: Ação do usuário
2. Backend: authenticateToken → checkPlanFeature
3. Backend: Verifica limites do plano
4. Backend: Permite/Nega operação
5. Frontend: Exibe resultado/erro
```

---

## 🎯 Padrões de Design Implementados

### **1. Repository Pattern (Implícito)**
- Models do Mongoose encapsulam acesso aos dados
- Controllers não acessam diretamente o banco

### **2. Middleware Pattern**
- Autenticação, logging, validação como middlewares
- Pipeline de processamento de requisições

### **3. Factory Pattern**
- useCRUD hook como factory de operações CRUD
- Reutilização de lógica entre entidades

### **4. Observer Pattern**
- Context API para notificação de mudanças de estado
- useEffect para reações a mudanças

### **5. Strategy Pattern**
- Diferentes formatadores de dados (currency, percent, number)
- Diferentes validadores por tipo de campo

---

## 🔐 Segurança e Boas Práticas

### **1. Autenticação e Autorização**
```javascript
// JWT com expiração
const token = jwt.sign(
  { userId, tenantId, plan, role },
  JWT_SECRET,
  { expiresIn: '24h' }
)

// Multi-tenancy - Isolamento de dados
const animals = await Animal.find({ tenantId: req.user.tenantId })
```

### **2. Validação de Entrada**
```javascript
// Sanitização básica
const sanitizedData = {
  ...req.body,
  tenantId: req.user.tenantId, // Força o tenant correto
  id: req.body.id || `anim_${Date.now()}` // ID único
}
```

### **3. Tratamento de Erros**
```javascript
// Middleware global de erro
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})
```

---

## 📊 Performance e Otimização

### **1. Frontend**
- **Code Splitting**: Lazy loading de rotas
- **Memoização**: useMemo para cálculos pesados
- **Debouncing**: Busca com delay
- **Virtual Scrolling**: Para listas grandes

### **2. Backend**
- **Índices MongoDB**: Para queries frequentes
- **Paginação**: Limitar resultados
- **Cache**: Redis para dados frequentes (futuro)
- **Connection Pooling**: Mongoose built-in

### **3. Banco de Dados**
```javascript
// Índices estratégicos
AnimalSchema.index({ tenantId: 1, status: 1 })
AnimalSchema.index({ tenantId: 1, animalId: 1 })
UserSchema.index({ email: 1 }, { unique: true })
```

---

## 🚀 Escalabilidade

### **1. Horizontal Scaling**
- **Stateless Backend**: JWT permite múltiplas instâncias
- **Load Balancer**: Nginx/HAProxy
- **Database Sharding**: Por tenantId

### **2. Vertical Scaling**
- **Resource Optimization**: Memory/CPU monitoring
- **Database Optimization**: Query optimization
- **CDN**: Para assets estáticos

### **3. Microservices (Futuro)**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Auth      │  │   Animals   │  │  Financial  │
│  Service    │  │   Service   │  │   Service   │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────────┐
              │   API       │
              │  Gateway    │
              └─────────────┘
```

---

## 📝 Convenções de Código

### **1. Nomenclatura**
- **Componentes**: PascalCase (`AnimalForm`)
- **Hooks**: camelCase com prefixo `use` (`useAuth`)
- **Arquivos**: kebab-case (`animal.controller.js`)
- **Variáveis**: camelCase (`animalData`)

### **2. Estrutura de Arquivos**
- **Imports**: Bibliotecas → Relativos → Tipos
- **Exports**: Named exports preferenciais
- **Interfaces**: Definidas no topo do arquivo

### **3. Comentários**
```javascript
// ✅ BOM: Explica o "porquê"
// Calcula GMD para identificar animais com baixo desempenho
const gmd = (pesoFinal - pesoInicial) / diasDecorridos

// ❌ RUIM: Explica o "o quê"
// Divide peso final menos peso inicial por dias decorridos
const gmd = (pesoFinal - pesoInicial) / diasDecorridos
```

---

Este guia serve como referência para manter a consistência arquitetural e facilitar a manutenção e evolução do sistema AgroGest.