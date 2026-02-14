# Análise Completa do Projeto AgroGest - Sistema de Gestão Pecuária

## 📋 Visão Geral

O **AgroGest** é um sistema completo de gestão pecuária desenvolvido para pecuaristas de corte, oferecendo controle zootécnico, financeiro e operacional do rebanho. O projeto utiliza uma arquitetura moderna com separação clara entre frontend e backend.

## 🏗️ Arquitetura do Sistema

### **Frontend (React + TypeScript)**
- **Framework**: React 18.3.1 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Roteamento**: React Router DOM
- **Estado**: Context API + Custom Hooks
- **UI Components**: Lucide React (ícones)
- **Formulários**: React Hook Form
- **Gráficos**: Recharts
- **Notificações**: React Hot Toast

### **Backend (Node.js + Express)**
- **Runtime**: Node.js com ES Modules
- **Framework**: Express.js
- **Banco de Dados**: MongoDB com Mongoose
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: bcryptjs
- **Upload de Arquivos**: Multer
- **Email**: Nodemailer
- **WhatsApp**: Twilio
- **Agendamento**: Node-cron

## 🎯 Funcionalidades de Negócio

### **1. Gestão de Animais**
- **Cadastro Completo**: ID, nome, espécie, raça, data de nascimento, sexo
- **Controle de Peso**: Registro histórico de pesagens
- **Status de Saúde**: Saudável, tratamento, doente, quarentena
- **Status Operacional**: Ativo, vendido, morto, descarte
- **Genealogia**: Controle de pai e mãe
- **Dados Financeiros**: Preço e data de compra
- **Localização**: Controle de localização no pasto

### **2. Gestão Financeira**
- **Transações**: Receitas e despesas categorizadas
- **Categorização**: Sistema de categorias e subcategorias
- **Métodos de Pagamento**: Controle de formas de pagamento
- **Status**: Pago, pendente, cancelado
- **Relatórios**: Análise de lucro líquido e margens
- **Tags**: Sistema de etiquetagem para organização

### **3. Gestão de Pastagens**
- **Cadastro de Pastos**: Nome, área, capacidade
- **Rotação**: Controle de datas de rotação
- **Qualidade**: Avaliação do solo e tipo de capim
- **Infraestrutura**: Fonte de água, cercas
- **Lotação**: Controle de animais por pasto
- **Taxa de Lotação**: Cálculo de UA/ha (Unidade Animal por hectare)

### **4. Planejamento e Atividades**
- **Cronograma**: Planejamento de atividades
- **Tipos de Atividade**: Vacinação, vermifugação, manejo
- **Priorização**: Sistema de prioridades
- **Atribuição**: Responsáveis por atividade
- **Custos**: Estimado vs. real
- **Progresso**: Percentual de conclusão

### **5. Controle de Pesagem**
- **Histórico de Peso**: Registro temporal de pesagens
- **GMD**: Cálculo de Ganho Médio Diário
- **Finalidade**: Propósito da pesagem
- **Responsável**: Quem realizou a medição
- **Local**: Onde foi realizada a pesagem

### **6. Dashboard e Indicadores**
- **Indicadores Zootécnicos**:
  - GMD médio do rebanho
  - Taxa de lotação (UA/ha)
  - Taxa de mortalidade
  - Rendimento de carcaça
- **Indicadores Financeiros**:
  - Lucro líquido
  - Custo por arroba
  - Margem média
  - Valor total investido
- **Alertas Operacionais**:
  - Animais prontos para venda (>450kg)
  - Atividades atrasadas
  - Próximas vacinações
  - Superlotação de pastos

## 🔐 Sistema de Autenticação e Autorização

### **Autenticação**
- **Registro**: Email, senha, nome, telefone
- **Verificação de Email**: Token por email com expiração
- **Login**: Email/senha com JWT
- **Recuperação de Senha**: Token por email
- **Multi-tenancy**: Isolamento por tenantId

### **Autorização**
- **Roles**: Operador, Admin
- **Planos**: Basic, Pro, Enterprise
- **Limites por Plano**:
  - **Basic**: 5 animais, 2 pastagens
  - **Pro**: 500 animais, 50 pastagens
  - **Enterprise**: Ilimitado

## 📊 Regras de Negócio Implementadas

### **1. Cálculos Zootécnicos**
```javascript
// Unidade Animal (UA) = Peso Vivo / 450kg
const totalUA = totalPesoVivo / 450;

// Taxa de Lotação = UA / Área Total
const taxaLotacao = totalUA / totalArea;

// GMD = (Peso Final - Peso Inicial) / Dias
const gmd = (pesoFinal - pesoInicial) / diasDecorridos;

// Arrobas de Carcaça = (Peso Vivo * 0.5) / 15kg
const arrobasCarcaca = (pesoVivo * 0.5) / 15;
```

### **2. Alertas Automáticos**
- Animais com peso ≥ 450kg (prontos para venda)
- Taxa de lotação > 1.5 UA/ha (superlotação)
- Atividades com prazo vencido
- Próximas vacinações programadas

### **3. Score de Performance**
```javascript
const scoreGeral = Math.min(100, Math.max(0, Math.round(
  (margemMedia * 0.5) +          // Peso da Margem
  (gmdMedio * 10) +              // Peso do GMD
  (taxaLotacao * 10) -           // Peso da Lotação
  (custoPorArroba > meta ? 20 : 0) // Penalização
)));
```

## 🔧 Integrações e Serviços

### **1. Comunicação**
- **Email**: Nodemailer para verificação e recuperação
- **WhatsApp**: Twilio para notificações automáticas
- **Cron Jobs**: Relatórios periódicos via WhatsApp

### **2. Armazenamento**
- **MongoDB**: Dados principais
- **LocalStorage**: Cache frontend
- **Multer**: Upload de imagens de perfil

### **3. Exportação**
- **PDF**: jsPDF para relatórios
- **Excel**: XLSX para exportação de dados
- **QR Code**: Geração de códigos para animais

## 📱 Interface e Experiência

### **Design System**
- **Tema**: Claro/Escuro com persistência
- **Responsivo**: Mobile-first design
- **Componentes**: Reutilizáveis e modulares
- **Navegação**: Sidebar colapsível + Navbar

### **Páginas Principais**
1. **Home**: Landing page com informações
2. **Dashboard**: Indicadores e alertas
3. **Animais**: CRUD completo do rebanho
4. **Pesagem**: Controle de peso histórico
5. **Financeiro**: Gestão de receitas/despesas
6. **Pastagens**: Controle de áreas
7. **Planejamento**: Cronograma de atividades
8. **Saúde da Empresa**: Análise de performance
9. **Perfil**: Dados do usuário

## 🚀 Tecnologias e Ferramentas

### **Frontend**
```json
{
  "react": "18.3.1",
  "typescript": "5.5.3",
  "vite": "5.4.2",
  "tailwindcss": "3.4.17",
  "react-router-dom": "6.26.0",
  "axios": "1.13.2",
  "recharts": "2.8.0",
  "framer-motion": "10.16.16"
}
```

### **Backend**
```json
{
  "express": "5.1.0",
  "mongoose": "8.19.2",
  "jsonwebtoken": "9.0.2",
  "bcryptjs": "3.0.2",
  "nodemailer": "7.0.11",
  "twilio": "5.10.7",
  "node-cron": "4.2.1"
}
```

## 📈 Métricas e KPIs

### **Zootécnicos**
- GMD (Ganho Médio Diário)
- Taxa de Lotação (UA/ha)
- Taxa de Mortalidade (%)
- Rendimento de Carcaça (%)
- Peso Médio do Rebanho

### **Financeiros**
- Lucro Líquido (R$)
- Custo por Arroba (R$/@)
- Margem de Lucro (%)
- ROI (Return on Investment)
- Valor Total Investido

### **Operacionais**
- Número de Animais por Status
- Atividades Pendentes/Concluídas
- Utilização de Pastagens
- Eficiência de Rotação

## 🔒 Segurança

### **Autenticação**
- JWT com expiração configurável
- Hash de senhas com bcryptjs
- Tokens de verificação com TTL

### **Autorização**
- Middleware de autenticação
- Controle de acesso por role
- Isolamento multi-tenant

### **Validação**
- Sanitização de inputs
- Validação de schemas
- Rate limiting (conceitual)

## 📊 Estrutura de Dados

### **Principais Entidades**
1. **User**: Usuários do sistema
2. **Animal**: Dados do rebanho
3. **WeighingRecord**: Histórico de pesagens
4. **Financial**: Transações financeiras
5. **Pasture**: Dados das pastagens
6. **Planning**: Planejamento de atividades

### **Relacionamentos**
- User → Animals (1:N via tenantId)
- Animal → WeighingRecords (1:N)
- Animal → Financial (1:N via relatedEntityId)
- Planning → Animals (N:N via relatedAnimals)

## 🎯 Diferenciais do Sistema

1. **Cálculos Zootécnicos Automatizados**: GMD, UA, taxa de lotação
2. **Multi-tenancy**: Isolamento completo entre usuários
3. **Planos Flexíveis**: Limites configuráveis por plano
4. **Alertas Inteligentes**: Baseados em regras de negócio
5. **Integração WhatsApp**: Notificações automáticas
6. **Dashboard Analítico**: Indicadores em tempo real
7. **Responsivo**: Funciona em mobile e desktop
8. **Exportação**: PDF e Excel nativos

## 🔮 Potenciais Melhorias

1. **Relatórios Avançados**: Gráficos de tendência, comparativos
2. **IA/ML**: Predição de peso, detecção de anomalias
3. **IoT**: Integração com balanças automáticas
4. **Geolocalização**: GPS para rastreamento de animais
5. **Marketplace**: Compra/venda de animais
6. **Veterinário**: Módulo específico para saúde animal
7. **Cooperativas**: Gestão de múltiplas propriedades
8. **Blockchain**: Rastreabilidade da cadeia produtiva

---

**Desenvolvido com foco na realidade do pecuarista brasileiro, combinando tecnologia moderna com conhecimento zootécnico prático.**