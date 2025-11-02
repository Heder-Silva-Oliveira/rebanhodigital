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

app.use(express.json());
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
  //useNewUrlParser: true,
  //useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch(err => {
    console.error('❌ Erro MongoDB:', err);
    process.exit(1);
  });

// =============================================================================
// SCHEMAS E MODELS
// =============================================================================

// Schema Animal
const AnimalSchema = new mongoose.Schema({
  // NOVO: tenantId é a chave para o isolamento de dados
  tenantId: { type: String, required: true, index: true }, 
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
  // NOVO: tenantId para vincular o usuário a uma "organização"
  tenantId: { type: String, required: true, index: true }, 
  id: String,
  email: String,
  password: String,
  name: String,
  role: String, // 'adm', 'operador'
  
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
  timestamps: false
});

// Schema Transação Financeira
const FinancialSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true }, // NOVO
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
  tenantId: { type: String, required: true, index: true }, // NOVO
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
  tenantId: { type: String, required: true, index: true }, // NOVO
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
  tenantId: { type: String, required: true, index: true }, // NOVO
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
// 🔒 NOVO: MIDDLEWARES DE AUTENTICAÇÃO E AUTORIZAÇÃO
// =============================================================================

/**
 * Middleware para autenticar o token JWT.
 * Verifica o token no header 'Authorization', valida-o e anexa
 * o payload (user) ao objeto 'req'.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        
        // Anexa o payload decodificado (contém userId, role, tenantId)
        req.user = userPayload; 
        next();
    });
};

/**
 * Middleware "fábrica" para verificar a role (função) do usuário.
 * Use-o nas rotas que precisam de permissão específica (ex: 'adm').
 * @param {Array<String>} allowedRoles - Um array de roles permitidas (ex: ['adm', 'gerente'])
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // Este middleware DEVE rodar DEPOIS de authenticateToken
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão.' });
        }
        
        next();
    };
};


// =============================================================================
// ROTAS DE AUTENTICAÇÃO (PÚBLICAS)
// =============================================================================

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔐 Tentativa de login para email: ${email}`);
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        // ALTERADO: Adicionado 'tenantId' ao payload do JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role, 
                tenantId: user.tenantId // Essencial para o isolamento de dados
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId, // NOVO
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
// ROTAS USUÁRIOS (PROTEGIDAS)
// =============================================================================

// Rota para criar usuário (Registro) - Esta é semi-pública
app.post('/api/users', async (req, res) => {
    try {
        console.log('📥 Dados recebidos para novo usuário:', req.body);
        if (!req.body || !req.body.password) {
            throw new Error(`Password é obrigatório.`);
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // ALTERADO: Define o tenantId no registro
        const newId = req.body.id || `user_${Date.now()}`;
        const userData = {
            ...req.body,
            password: hashedPassword,
            id: newId,
            // NOVO: Define o tenantId inicial.
            // Aqui, estamos assumindo que o usuário é o "dono" da sua própria conta/tenant.
            tenantId: newId 
        };
        
        const user = await User.create(userData);
        
        res.status(201).json({
            id: user.id,
            email: user.email,
            name: user.name,
            tenantId: user.tenantId // NOVO
        });

    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error.message);
        res.status(400).json({ error: 'Erro ao criar usuário', details: error.message });
    }
});

// Proteger rotas de usuário:
// Um usuário só deve poder alterar seus próprios dados.

// NOVO: Protegido com authenticateToken
app.patch('/api/users/:id/change-password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  // NOVO: Verificação de segurança
  // O ID no token (req.user.userId) deve ser o mesmo do parâmetro da rota
  if (req.user.userId !== id) {
    return res.status(403).json({ message: 'Acesso negado. Você só pode alterar sua própria senha.' });
  }

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // ALTERADO: Busca pelo ID do token, que é mais seguro
    const user = await User.findOne({ id: req.user.userId });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'A senha atual está incorreta.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: 'Senha alterada com sucesso!' });

  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error.message);
    res.status(500).json({ message: 'Erro interno do servidor.', details: error.message });
  }
});

// NOVO: Protegido com authenticateToken
app.patch('/api/users/:id/profile-image', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        const { id } = req.params;

        // NOVO: Verificação de segurança
        if (req.user.userId !== id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada' });
        }

        // ALTERADO: Busca pelo ID do token
        const user = await User.findOneAndUpdate(
            { id: req.user.userId },
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
            user: { /* ... dados do usuário ... */ }
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar foto:', error);
        res.status(500).json({ error: 'Erro ao atualizar foto' });
    }
});

// Rota para servir a imagem (pode ser pública ou protegida, dependendo da regra)
// Vamos mantê-la protegida para que só usuários logados vejam fotos de outros (se permitido)
// ou que um usuário só possa ver a sua.
app.get('/api/users/:id/profile-image', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // ALTERADO: Adiciona filtro de tenantId
        // Regra de negócio: Você só pode ver fotos de usuários do seu tenant.
        const user = await User.findOne({ id: id, tenantId: req.user.tenantId });
        
        if (!user || !user.profileImage || !user.profileImage.data) {
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

// NOVO: Protegido com authenticateToken
app.patch('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // NOVO: Verificação de segurança
        if (req.user.userId !== id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const user = await User.findOneAndUpdate(
            { id: req.user.userId }, // ALTERADO: Busca pelo ID do token
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({
            message: 'Usuário atualizado com sucesso!',
            user: { /* ... dados do usuário ... */ }
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// NOVO: Protegido com authenticateToken
app.get('/api/users/:id/full', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // NOVO: Verificação de segurança
        if (req.user.userId !== id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // ALTERADO: Busca pelo ID do token
        const user = await User.findOne({ id: req.user.userId });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Exclui a senha
        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            // ... resto dos campos
            hasProfileImage: !!user.profileImage?.data
        };

        res.json(userResponse);

    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// Rota de saúde (pública)
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Servidor AgroGest funcionando!',
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// ROTAS ANIMAIS (PROTEGIDAS)
// =============================================================================

// GET - Buscar todos os animais (DO SEU TENANT)
// NOVO: Protegido com authenticateToken
app.get('/api/animals', authenticateToken, async (req, res) => {
  try {
    // ALTERADO: Adicionado filtro 'tenantId: req.user.tenantId'
    console.log('🕵️‍♂️ [DEBUG] Payload do Token Recebido:', req.user);
    const animals = await Animal.find({ tenantId: req.user.tenantId }).sort({ created_at: -1 });
    res.json({ animals });
  } catch (error) {
    console.error('❌ Erro ao buscar animais:', error);
    res.status(500).json({ error: 'Erro ao buscar animais' });
  }
});

// GET - Buscar animal por ID (DO SEU TENANT)
// NOVO: Protegido com authenticateToken
app.get('/api/animals/:id', authenticateToken, async (req, res) => {
  try {
    // ALTERADO: Adicionado filtro de tenantId na busca
    const animal = await Animal.findOne({ id: req.params.id, tenantId: req.user.tenantId });
    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    res.json(animal);
  } catch (error) {
    console.error('❌ Erro ao buscar animal:', error);
    res.status(500).json({ error: 'Erro ao buscar animal' });
  }
});

// POST - Criar animal (NO SEU TENANT)
// NOVO: Protegido com authenticateToken
app.post('/api/animals', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Dados recebidos:', req.body);
    
    const animalData = {
      ...req.body,
      tenantId: req.user.tenantId, // NOVO: Injeta o tenantId do token
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

// PATCH - Atualizar animal (DO SEU TENANT)
// NOVO: Protegido com authenticateToken
app.patch('/api/animals/:id', authenticateToken, async (req, res) => {
  try {
    // ALTERADO: Adicionado filtro de tenantId
    const animal = await Animal.findOneAndUpdate(
      { id: req.params.id, tenantId: req.user.tenantId },
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

// DELETE - Deletar animal (DO SEU TENANT e SÓ ADMIN)
// NOVO: Protegido com authenticateToken E checkRole
app.delete('/api/animals/:id', authenticateToken, checkRole(['adm']), async (req, res) => {
  try {
    // ALTERADO: Adicionado filtro de tenantId
    const animal = await Animal.findOneAndDelete({ id: req.params.id, tenantId: req.user.tenantId });
    
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
// ROTAS USUÁRIOS (ADMIN - LISTAGEM)
// =============================================================================

// Lista usuários (SÓ ADMIN, e SÓ DO SEU TENANT)
// NOVO: Protegido com authenticateToken E checkRole
app.get('/api/users', authenticateToken, checkRole(['adm']), async (req, res) => {
  try {
    // ALTERADO: Filtra usuários pelo tenantId do admin logado
    const users = await User.find({ tenantId: req.user.tenantId });
    // Remove senhas da resposta
    const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        tenantId: u.tenantId
    }));
    res.json({ users: safeUsers });
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});


// =============================================================================
// ROTAS TRANSAÇÕES FINANCEIRAS (PROTEGIDAS)
// =============================================================================

app.get('/api/financial_transactions', authenticateToken, async (req, res) => {
 try {
  // ALTERADO: Filtro por tenantId
  const transactions = await Financial.find({ tenantId: req.user.tenantId }).sort({ date: -1 }); 
  res.json(transactions); 
 } catch (error) {
  console.error('❌ Erro ao buscar transações:', error);
  res.status(500).json({ error: 'Erro ao buscar transações financeiras' });
 }
});

app.post('/api/financial_transactions', authenticateToken, async (req, res) => {
 try {
  const transactionData = {
   ...req.body,
   tenantId: req.user.tenantId // NOVO
  };
  const transaction = await Financial.create(transactionData);
  res.status(201).json(transaction);
 } catch (error) {
  console.error('❌ Erro ao criar transação:', error);
  res.status(400).json({ error: 'Erro ao criar transação', details: error.message });
 }
});

// =============================================================================
// ROTAS PASTAGENS (PROTEGIDAS)
// =============================================================================

app.get('/api/pastures', authenticateToken, async (req, res) => {
  try {
    // ALTERADO: Filtro por tenantId
    const pastures = await Pasture.find({ tenantId: req.user.tenantId });
    res.json(pastures); 
  } catch (error) {
    console.error('❌ Erro ao buscar pastagens:', error);
    res.status(500).json({ error: 'Erro ao buscar pastagens' });
  }
});

app.post('/api/pastures', authenticateToken, async (req, res) => {
  try {
    const pastureData = {
      ...req.body,
      tenantId: req.user.tenantId // NOVO
    };
    const pasture = await Pasture.create(pastureData);
    res.status(201).json(pasture); 
  } catch (error)
 {
    console.error('❌ Erro ao criar pastagem:', error);
    res.status(400).json({ error: 'Erro ao criar pastagem', details: error.message }); 
  }
});

// =============================================================================
// ROTAS PLANEJAMENTO (PROTEGIDAS)
// =============================================================================

app.get('/api/planning', authenticateToken, async (req, res) => {
 try {
  // ALTERADO: Filtro por tenantId
  const planning = await Planning.find({ tenantId: req.user.tenantId }).sort({ startDate: -1 });
  res.json(planning); 
 } catch (error) {
  console.error('❌ Erro ao buscar planejamentos:', error);
  res.status(500).json({ error: 'Erro ao buscar planejamentos' });
 }
});

app.post('/api/planning', authenticateToken, async (req, res) => {
 try {
  const planningData = {
   ...req.body,
   tenantId: req.user.tenantId // NOVO
  };
  const plan = await Planning.create(planningData);
  res.status(201).json(plan);
 } catch (error) {
  console.error('❌ Erro ao criar planejamento:', error);
  res.status(400).json({ error: 'Erro ao criar planejamento', details: error.message });
 }
});

// =============================================================================
// ROTAS REGISTROS DE PESAGEM (PROTEGIDAS)
// =============================================================================

app.get('/api/weighing_records', authenticateToken, async (req, res) => {
 try {
  // ALTERADO: Filtro por tenantId
  const records = await WeighingRecord.find({ tenantId: req.user.tenantId }).sort({ date: -1 });
  res.json(records); 
 } catch (error) {
  console.error('❌ Erro ao buscar registros de pesagem:', error);
  res.status(500).json({ error: 'Erro ao buscar registros de pesagem' });
 }
});


app.post('/api/weighing_records', authenticateToken, async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      tenantId: req.user.tenantId, // NOVO
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
}).on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err.message);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});