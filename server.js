import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// ----------------------
// JWT Secret
// ----------------------
const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_SUPER_SEGURO_MUDE_ISTO_REAL';
if (!JWT_SECRET) {
  console.error('❌ ERRO: JWT_SECRET não definida no arquivo .env');
  process.exit(1);
}

// ----------------------
// Multer
// ----------------------
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas!'), false);
  }
});

// ----------------------
// Middlewares
// ----------------------
app.use(cors({
 origin: [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://rebanhodigital.vercel.app',
  'https://rebanhodigital.netlify.app'
 ],
 credentials: true
}));

// Os 'parsers' (json, urlencoded) vêm DEPOIS
app.use(express.json());
// Também é uma boa ideia adicionar este:
app.use(express.urlencoded({ extended: true }));
// ----------------------
// Conexão com MongoDB
// ----------------------
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ ERRO: MONGODB_URI não definida no arquivo .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch(err => {
    console.error('❌ Erro MongoDB:', err);
    process.exit(1); // encerra o app se falhar a conexão
  });

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
    role: String,
    
    profileImage: {
        data: Buffer,
        contentType: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now }
    },
    phone: String,
    cpf: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    farm: {
        name: String,
        size: Number,
        location: String
    },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { 

    timestamps: false // Se você já não usa timestamps do mongoose
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

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Encontra o usuário
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        // 2. ✅ Compara a senha enviada com o hash salvo no banco
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        // 3. Se as senhas batem, cria o token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET, // Agora vai funcionar!
            { expiresIn: '1h' }
        );

        // 4. Envia a resposta
        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                hasProfileImage: !!user.profileImage?.data,
                phone: user.phone,
            }
        });

    } catch (error) {
        console.error('❌ Erro interno durante o login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// =============================================================================
// NOVAS ROTAS (NÃO INTERFEREM COM O LOGIN EXISTENTE)
// =============================================================================

// ✅ Rota para upload de foto de perfil
app.patch('/api/users/:id/profile-image', upload.single('profileImage'), async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada' });
        }

        const user = await User.findOneAndUpdate(
            { id: id },
            { 
                profileImage: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                    size: req.file.size,
                    uploadedAt: new Date()
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({
            message: 'Foto de perfil atualizada com sucesso!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                hasProfileImage: !!user.profileImage.data
            }
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar foto:', error);
        res.status(500).json({ error: 'Erro ao atualizar foto' });
    }
});

// ✅ Rota para servir a imagem
app.get('/api/users/:id/profile-image', async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findOne({ id: id });
        
        if (!user || !user.profileImage || !user.profileImage.data) {
            // Retorna imagem padrão se não tiver foto
            return res.redirect('/default-avatar.png');
        }

        res.set({
            'Content-Type': user.profileImage.contentType,
            'Content-Length': user.profileImage.size,
            'Cache-Control': 'public, max-age=86400'
        });

        res.send(user.profileImage.data);

    } catch (error) {
        console.error('❌ Erro ao buscar imagem:', error);
        res.status(500).json({ error: 'Erro ao buscar imagem' });
    }
});

// ✅ Rota para atualizar dados do usuário (campos novos)
app.patch('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const user = await User.findOneAndUpdate(
            { id: id },
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({
            message: 'Usuário atualizado com sucesso!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                farm: user.farm
            }
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// ✅ Rota para buscar usuário completo (com novos campos)
app.get('/api/users/:id/full', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ id: id });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // ✅ Retorna todos os campos, mas exclui a senha e dados binários da imagem
        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            cpf: user.cpf,
            address: user.address,
            farm: user.farm,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            hasProfileImage: !!user.profileImage?.data
        };

        res.json(userResponse);

    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
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
    console.log('📥 Dados recebidos para novo usuário:', req.body);
    // ✅ VERIFICAÇÃO DE DEFESA
    if (!req.body || !req.body.password) {
      console.error('❌ Erro: req.body ou req.body.password está faltando.', req.body);
      throw new Error("Dados de cadastro incompletos. 'password' é obrigatório.");
    }
    
    // 1. Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userData = {
      ...req.body,
      password: hashedPassword, // 2. Salva o hash, não a senha pura
      id: req.body.id || `user_${Date.now()}`
    };
    
    const user = await User.create(userData);
    
    // ✅ Resposta (não inclua a senha)
    res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name
    });

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
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