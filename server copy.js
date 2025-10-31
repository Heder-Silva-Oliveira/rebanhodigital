// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:300'], // Frontend URLs
  credentials: true
}));

// Conexão com MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/db_rebanho_digital';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch(err => console.error('❌ Erro MongoDB:', err));

// =============================================================================
// SCHEMAS E MODELS
// =============================================================================

// Schema Animal
const AnimalSchema = new mongoose.Schema({
  id: String,
  animalId: String,
  name: String,
  species: String,
  breed: String,
  birthDate: Date,
  gender: String,
  weight: Number,
  status: String,
  healthStatus: String,
  location: String,
  purchasePrice: Number,
  purchaseDate: Date,
  notes: String,
  motherId: String,
  fatherId: String,
  created_at: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Schema Usuário
const UserSchema = new mongoose.Schema({
  id: String,
  email: String,
  password: String,
  name: String,
  role: String
});

// Schema Transação Financeira
const FinancialSchema = new mongoose.Schema({
  id: String,
  transactionId: String,
  type: String,
  category: String,
  subcategory: String,
  amount: Number,
  description: String,
  date: String,
  paymentMethod: String,
  status: String,
  tags: [String],
  notes: String,
  createdAt: Date,
  relatedEntity: String,
  relatedEntityId: String,
  updatedAt: Date
});

// Schema Pastagem
const PastureSchema = new mongoose.Schema({
  id: String,
  pastureId: String,
  name: String,
  area: Number,
  capacity: Number,
  currentAnimals: Number,
  status: String,
  grassType: String,
  lastRotation: Date,
  nextRotation: Date,
  soilQuality: String,
  waterSource: Boolean,
  fencing: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
});

// Schema Planejamento
const PlanningSchema = new mongoose.Schema({
  id: String,
  planId: String,
  title: String,
  description: String,
  type: String,
  startDate: Date,
  endDate: Date,
  status: String,
  priority: String,
  assignedTo: String,
  relatedAnimals: [String],
  relatedPastures: [String],
  estimatedCost: Number,
  actualCost: Number,
  completionPercentage: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
});

// Schema Registro de Pesagem
const WeighingRecordSchema = new mongoose.Schema({
  id: String,
  animalId: String,
  weight: Number,
  date: Date,
  notes: String,
  measuredBy: String,
  location: String,
  purpose: String,
  created_at: Date
});

// Models
const Animal = mongoose.model('Animal', AnimalSchema);
const User = mongoose.model('User', UserSchema);
const Financial = mongoose.model('Financial', FinancialSchema);
const Pasture = mongoose.model('Pasture', PastureSchema);
const Planning = mongoose.model('Planning', PlanningSchema);
const WeighingRecord = mongoose.model('WeighingRecord', WeighingRecordSchema);

// =============================================================================
// ROTAS DA API
// =============================================================================
// server.js (Implementação do Login e JWT)
// ... (imports de express, mongoose, dotenv, jwt)

// -----------------------------------------------------------------------------
// IMPORTANTE: DEVE ESTAR NO TOPO COM OUTRAS CONSTANTES GLOBAIS
// -----------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_SUPER_SEGURO_MUDE_ISTO_REAL';
// Em produção, use bcrypt para comparar senhas, não texto puro!
// const bcrypt = require('bcryptjs'); 
// const JWT_SECRET = process.env.JWT_SECRET || 'SUA_CHAVE_SECRETA_MUITO_LONGA';
// const BCRYPT_ROUNDS = 10;


app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar usuário no MongoDB pelo email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 2. VERIFICAÇÃO DE SENHA (USAR BCrypt em Produção)
        // Se você está testando localmente sem criptografia, use a comparação direta (Como no seu AuthModal antigo):
        if (user.password !== password) {
             return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }
        
        // Se você já criptografou, usaria:
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) { return res.status(401).json({ message: 'Email ou senha inválidos.' }); }


        // 3. GERAÇÃO DO JWT
        const token = jwt.sign(
            // Payload: Dados mínimos e não sensíveis do usuário
            { userId: user.id, role: user.role }, 
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        // 4. RESPOSTA DE SUCESSO
        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('❌ Erro interno durante o login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});
// Rota de saúde
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Servidor AgroGest funcionando!',
    timestamp: new Date().toISOString(),
    entities: ['animals', 'users', 'financial_transactions', 'pastures', 'planning', 'weighing_records']
  });
});

// =============================================================================
// ROTAS ANIMAIS
// =============================================================================

// GET - Buscar todos os animais
app.get('/api/animals', async (req, res) => {
  try {
    const animals = await Animal.find().sort({ created_at: -1 });
    res.json({ animals });
  } catch (error) {
    console.error('❌ Erro ao buscar animais:', error);
    res.status(500).json({ error: 'Erro ao buscar animais' });
  }
});

// GET - Buscar animal por ID
app.get('/api/animals/:id', async (req, res) => {
  try {
    const animal = await Animal.findOne({ id: req.params.id });
    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    res.json(animal);
  } catch (error) {
    console.error('❌ Erro ao buscar animal:', error);
    res.status(500).json({ error: 'Erro ao buscar animal' });
  }
});

// POST - Criar animal
app.post('/api/animals', async (req, res) => {
  try {
    console.log('📥 Dados recebidos:', req.body);
    
    const animalData = {
      ...req.body,
      id: req.body.id || `animals_${Date.now()}`,
      animalId: req.body.animalId || `A${String(Date.now()).slice(-6)}`,
      updatedAt: new Date()
    };
    
    const animal = await Animal.create(animalData);
    console.log('✅ Animal criado:', animal.id);
    res.status(201).json(animal);
  } catch (error) {
    console.error('❌ Erro ao criar animal:', error);
    res.status(400).json({ error: 'Erro ao criar animal', details: error.message });
  }
});

// PATCH - Atualizar animal
app.patch('/api/animals/:id', async (req, res) => {
  try {
    const animal = await Animal.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    
    console.log('✅ Animal atualizado:', animal.id);
    res.json(animal);
  } catch (error) {
    console.error('❌ Erro ao atualizar animal:', error);
    res.status(400).json({ error: 'Erro ao atualizar animal', details: error.message });
  }
});

// DELETE - Deletar animal
app.delete('/api/animals/:id', async (req, res) => {
  try {
    const animal = await Animal.findOneAndDelete({ id: req.params.id });
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    
    console.log('✅ Animal deletado:', animal.id);
    res.json({ message: 'Animal deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar animal:', error);
    res.status(500).json({ error: 'Erro ao deletar animal', details: error.message });
  }
});

// =============================================================================
// ROTAS USUÁRIOS
// =============================================================================

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      id: req.body.id || `user_${Date.now()}`
    };
    
    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(400).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// =============================================================================
// ROTAS TRANSAÇÕES FINANCEIRAS
// =============================================================================

app.get('/api/financial_transactions', async (req, res) => {
 try {
  const transactions = await Financial.find().sort({ date: -1 });
  
  // ✅ CORREÇÃO: Retornar o array 'transactions' diretamente, sem o envelope { }
  res.json(transactions); 
  
 } catch (error) {
  console.error('❌ Erro ao buscar transações:', error);
  res.status(500).json({ error: 'Erro ao buscar transações financeiras' });
 }
});

app.post('/api/financial_transactions', async (req, res) => {
 try {
  const transactionData = {
   ...req.body,
  };
  
  // O Mongoose (com timestamps habilitados) se encarrega de criar o _id, createdAt e updatedAt
  const transaction = await Financial.create(transactionData);
  
  res.status(201).json(transaction);
 } catch (error) {
  console.error('❌ Erro ao criar transação:', error);
  res.status(400).json({ error: 'Erro ao criar transação', details: error.message });
 }
});

// =============================================================================
// ROTAS PASTAGENS
// =============================================================================

app.get('/api/pastures', async (req, res) => {
  try {
    const pastures = await Pasture.find();
    
    // ✅ CORREÇÃO: Enviar APENAS o array 'pastures' (formato esperado pelo useCRUD)
    res.json(pastures); 
    
  } catch (error) {
    console.error('❌ Erro ao buscar pastagens:', error);
    res.status(500).json({ error: 'Erro ao buscar pastagens' });
  }
});

app.post('/api/pastures', async (req, res) => {
  try {
    const pastureData = {
      ...req.body,
    };
    
    const pasture = await Pasture.create(pastureData);
    
    // O retorno deve ser o objeto criado com o status 201
    res.status(201).json(pasture); 
  } catch (error) {
    console.error('❌ Erro ao criar pastagem:', error);
    // Retorna a mensagem de erro detalhada do Mongoose
    res.status(400).json({ error: 'Erro ao criar pastagem', details: error.message }); 
  }
});

// =============================================================================
// ROTAS PLANEJAMENTO
// =============================================================================

app.get('/api/planning', async (req, res) => {
 try {
  const planning = await Planning.find().sort({ startDate: -1 });
  
  // ✅ CORREÇÃO: Retornar o array diretamente (sem o envelope { planning })
  res.json(planning); 
  
 } catch (error) {
  console.error('❌ Erro ao buscar planejamentos:', error);
  res.status(500).json({ error: 'Erro ao buscar planejamentos' });
 }
});

app.post('/api/planning', async (req, res) => {
 try {
  const planningData = {
   ...req.body,

  };
  
  // O Mongoose irá gerar o _id e os timestamps (se configurado com { timestamps: true })
  const plan = await Planning.create(planningData);
  res.status(201).json(plan);
 } catch (error) {
  console.error('❌ Erro ao criar planejamento:', error);
  res.status(400).json({ error: 'Erro ao criar planejamento', details: error.message });
 }
});

// =============================================================================
// ROTAS REGISTROS DE PESAGEM
// =============================================================================

// Servidor Express/Node.js

app.get('/api/weighing_records', async (req, res) => {
 try {
  const records = await WeighingRecord.find().sort({ date: -1 });
  
  // CORREÇÃO: Retornar o array diretamente, sem o envelope { }
  res.json(records); 
  
 } catch (error) {
  console.error('❌ Erro ao buscar registros de pesagem:', error);
  res.status(500).json({ error: 'Erro ao buscar registros de pesagem' });
 }
});


app.post('/api/weighing_records', async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      id: req.body.id || `weigh_${Date.now()}`,
      created_at: new Date()
    };
    
    const record = await WeighingRecord.create(recordData);
    res.status(201).json(record);
  } catch (error) {
    console.error('❌ Erro ao criar registro de pesagem:', error);
    res.status(400).json({ error: 'Erro ao criar registro de pesagem', details: error.message });
  }
});

// =============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐄 Servidor AgroGest rodando em: http://localhost:${PORT}`);
  console.log(`📊 Entidades disponíveis: animais, usuários, transações, pastagens, planejamento, pesagem`);
}).on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err.message);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});