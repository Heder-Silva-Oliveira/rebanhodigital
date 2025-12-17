import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// URLs para redirecionamento e links
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// A URL onde este servidor está rodando (usada para o link no e-mail)
const BACKEND_URL = `http://localhost:${PORT}`; 

// ----------------------
// 📧 CONFIGURAÇÃO DE EMAIL
// ----------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD, // Senha de App do Google
  },
});

/**
 * Função para enviar o email de verificação.
 * O link DEVE apontar para o BACKEND, que processa e redireciona.
 */
const sendVerificationEmail = async (toEmail, token) => {
  // CORREÇÃO: O link aponta para a API do Backend, não para o Frontend
  const verificationLink = `${BACKEND_URL}/api/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: toEmail,
    subject: 'Verifique seu Email - Rebanho Digital',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #00875e;">Confirmação de Cadastro</h2>
        <p>Obrigado por se registrar no Rebanho Digital! Para ativar sua conta, clique no botão abaixo:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; margin-top: 15px; background-color: #00875e; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verificar meu Email
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">Link válido por 1 hora.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de verificação enviado para ${toEmail}`);
  } catch (error) {
    console.error(`❌ ERRO NO ENVIO DE EMAIL para ${toEmail}:`, error.message);
  }
};

// ----------------------
// 🔐 JWT & PLANOS
// ----------------------
const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_SUPER_SEGURO_MUDE_ISTO_REAL';

const PLAN_LIMITS = {
  basic: { name: 'Basic', animals: 5, pastures: 2, features: { companyHealth: false } },
  pro: { name: 'Pro', animals: 500, pastures: 50, features: { companyHealth: true } },
  enterprise: { name: 'Enterprise', animals: Infinity, pastures: Infinity, features: { companyHealth: true } },
};

// ----------------------
// 📂 MULTER
// ----------------------
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas!'), false);
  },
});

// ----------------------
// ⚙️ MIDDLEWARES
// ----------------------
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5000'
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisição para debug
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl}`);
    next();
});

// ----------------------
// 📦 CONEXÃO MONGODB
// ----------------------
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ ERRO: MONGODB_URI não definida no arquivo .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {})
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch((err) => {
    console.error('❌ Erro MongoDB:', err);
    process.exit(1);
  });

// =============================================================================
// 📝 SCHEMAS E MODELS
// =============================================================================

const UserSchema = new mongoose.Schema({
    tenantId: { type: String, required: true, index: true },
    id: { type: String, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: String,
    name: String,
    role: { type: String, enum: ['operador', 'admin'], default: 'operador' },
    plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
    
    emailVerified: { type: Boolean, default: false },
    emailToken: String,
    emailTokenExpires: Date, 
    
    profileImage: {
      data: Buffer,
      contentType: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now },
    },
    phone: String,
    cpf: String,
    address: { street: String, city: String, state: String, zipCode: String },
    farm: { name: String, size: Number, location: String },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

const AnimalSchema = new mongoose.Schema({
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
  updatedAt: { type: Date, default: Date.now },
});

// Outros Schemas simplificados para brevidade (mas completos no banco)
const FinancialSchema = new mongoose.Schema({ tenantId: { type: String, required: true, index: true }, id: String, transactionId: String, type: String, category: String, subcategory: String, amount: Number, description: String, date: String, paymentMethod: String, status: String, tags: [String], notes: String, createdAt: Date, relatedEntity: String, relatedEntityId: String, updatedAt: Date });
const PastureSchema = new mongoose.Schema({ tenantId: { type: String, required: true, index: true }, id: String, pastureId: String, name: String, area: Number, capacity: Number, currentAnimals: Number, status: String, grassType: String, lastRotation: Date, nextRotation: Date, soilQuality: String, waterSource: Boolean, fencing: String, notes: String, createdAt: Date, updatedAt: Date });
const PlanningSchema = new mongoose.Schema({ tenantId: { type: String, required: true, index: true }, id: String, planId: String, title: String, description: String, type: String, startDate: Date, endDate: Date, status: String, priority: String, assignedTo: String, relatedAnimals: [String], relatedPastures: [String], estimatedCost: Number, actualCost: Number, completionPercentage: Number, notes: String, createdAt: Date, updatedAt: Date });
const WeighingRecordSchema = new mongoose.Schema({ tenantId: { type: String, required: true, index: true }, id: String, animalId: String, weight: Number, date: Date, notes: String, measuredBy: String, location: String, purpose: String, created_at: Date });

const User = mongoose.model('User', UserSchema);
const Animal = mongoose.model('Animal', AnimalSchema);
const Financial = mongoose.model('Financial', FinancialSchema);
const Pasture = mongoose.model('Pasture', PastureSchema);
const Planning = mongoose.model('Planning', PlanningSchema);
const WeighingRecord = mongoose.model('WeighingRecord', WeighingRecordSchema);

// =============================================================================
// 👮‍♂️ MIDDLEWARES
// =============================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
    req.user = userPayload;
    next();
  });
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) return res.status(401).json({ message: 'Usuário não autenticado.' });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Acesso negado.' });
    next();
  };
};

const checkPlanFeature = (featureName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.plan) return res.status(401).json({ message: 'Plano não identificado.' });
    const limits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.basic; 
    if (limits.features[featureName]) return next();
    return res.status(403).json({ message: `Recurso indisponível no plano ${limits.name}.` });
  };
};

// =============================================================================
// 🚀 ROTAS DE AUTENTICAÇÃO
// =============================================================================

// 1. Verificar Email (Link do Email chega aqui)
app.get('/api/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Token ausente.' });

  try {
    const user = await User.findOne({ 
      emailToken: token,
      emailTokenExpires: { $gt: new Date() } 
    });
    
    if (!user) return res.redirect(`${FRONTEND_URL}/verify-fail?reason=invalid`);

    user.emailVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpires = undefined;
    await user.save();

    return res.redirect(`${FRONTEND_URL}/login-success?verified=true`);
  } catch (error) {
    console.error('Erro na verificação:', error);
    return res.redirect(`${FRONTEND_URL}/verify-fail?reason=error`);
  }
});

// 2. Reenviar Email
app.post('/api/resend-verification', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email obrigatório.' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
        if (user.emailVerified) return res.status(200).json({ message: 'Email já verificado.' });

        const newToken = crypto.randomBytes(32).toString('hex');
        user.emailToken = newToken;
        user.emailTokenExpires = new Date(Date.now() + 3600000);
        await user.save();

        await sendVerificationEmail(user.email, newToken);
        res.json({ message: 'Email reenviado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// 3. Login (Com tratamento de erro 500 robusto)
app.post('/api/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  console.log(`[LOGIN] Tentativa: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
        console.log(`[LOGIN] Usuário não encontrado.`);
        return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    if (!user.emailVerified) {
      console.log(`[LOGIN] Não verificado.`);
      return res.status(403).json({
        message: 'Email não verificado.',
        requiresVerification: true,
      });
    }

    // Proteção extra contra hash inválido no banco
    const storedHash = user.password || '';
    let isPasswordMatch = false;
    try {
        isPasswordMatch = await bcrypt.compare(password, storedHash);
    } catch (bcryptError) {
        console.error("[LOGIN] Erro ao comparar senha (hash pode estar corrompido):", bcryptError);
        return res.status(500).json({ message: 'Erro de segurança na conta. Contate o suporte.' });
    }

    if (!isPasswordMatch) {
      console.log(`[LOGIN] Senha incorreta.`);
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, tenantId: user.tenantId, plan: user.plan },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.lastLogin = new Date();
    await user.save();

    console.log(`[LOGIN] Sucesso!`);
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        plan: user.plan,
        hasProfileImage: !!user.profileImage?.data,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('❌ LOGIN CRASH:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// 4. Registro
app.post('/api/users', async (req, res) => {
  try {
    const { name, email: rawEmail, password, role: rawRole, plan: rawPlan } = req.body;
    if (!rawEmail || !password || !name) return res.status(400).json({ message: 'Campos faltando.' });
    
    const email = String(rawEmail).trim().toLowerCase();
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email já cadastrado.' });

    const allowedRoles = ['operador', 'admin'];
    const role = allowedRoles.includes(rawRole) ? rawRole : 'operador';
    const allowedPlans = ['basic', 'pro', 'enterprise'];
    const plan = allowedPlans.includes(rawPlan) ? rawPlan : 'basic';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newId = `user_${Date.now()}`;
    const emailToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      id: newId, tenantId: newId, email, password: hashedPassword, name, role, plan,
      emailVerified: false, emailToken: emailToken,
      emailTokenExpires: new Date(Date.now() + 3600000),
      createdAt: new Date(), updatedAt: new Date(),
    });

    await sendVerificationEmail(user.email, emailToken);

    res.status(201).json({
      id: user.id, email: user.email, name: user.name, tenantId: user.tenantId,
      message: 'Usuário criado. Verifique seu email.',
    });
  } catch (error) {
    console.error('❌ Erro Registro:', error);
    res.status(400).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// =============================================================================
// 🐾 ROTAS DE DADOS (CRUD)
// =============================================================================

// ANIMAIS
app.get('/api/animals', authenticateToken, async (req, res) => {
  try {
    const animals = await Animal.find({ tenantId: req.user.tenantId }).sort({ created_at: -1 });
    res.json({ animals });
  } catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
});

app.post('/api/animals', authenticateToken, async (req, res) => {
  try {
    const { plan, tenantId } = req.user;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.basic; 
    const count = await Animal.countDocuments({ tenantId });
    
    if (count >= limits.animals) return res.status(403).json({ message: `Limite de ${limits.animals} animais atingido.` });

    const newData = await Animal.create({
      ...req.body, tenantId, id: req.body.id || `anim_${Date.now()}`, created_at: new Date()
    });
    res.status(201).json(newData);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.patch('/api/animals/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Animal.findOneAndUpdate({ id: req.params.id, tenantId: req.user.tenantId }, { ...req.body, updatedAt: new Date() }, { new: true });
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/animals/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const item = await Animal.findOneAndDelete({ id: req.params.id, tenantId: req.user.tenantId });
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/animals/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Animal.findOne({ id: req.params.id, tenantId: req.user.tenantId });
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PASTAGENS
app.get('/api/pastures', authenticateToken, async (req, res) => {
  try { res.json(await Pasture.find({ tenantId: req.user.tenantId })); } 
  catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
});

app.post('/api/pastures', authenticateToken, async (req, res) => {
  try {
    const { plan, tenantId } = req.user;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.basic; 
    const count = await Pasture.countDocuments({ tenantId });
    if (count >= limits.pastures) return res.status(403).json({ message: `Limite de ${limits.pastures} pastagens atingido.` });
    
    const newData = await Pasture.create({ ...req.body, tenantId });
    res.status(201).json(newData);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// FINANCEIRO
app.get('/api/financial_transactions', authenticateToken, async (req, res) => {
  try { res.json(await Financial.find({ tenantId: req.user.tenantId }).sort({ date: -1 })); } 
  catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
});
app.post('/api/financial_transactions', authenticateToken, async (req, res) => {
  try { res.status(201).json(await Financial.create({ ...req.body, tenantId: req.user.tenantId })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

// PESAGEM
app.get('/api/weighing_records', authenticateToken, async (req, res) => {
  try { res.json(await WeighingRecord.find({ tenantId: req.user.tenantId }).sort({ date: -1 })); } 
  catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
});
app.post('/api/weighing_records', authenticateToken, async (req, res) => {
  try { res.status(201).json(await WeighingRecord.create({ ...req.body, tenantId: req.user.tenantId, created_at: new Date() })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

// PLANEJAMENTO
app.get('/api/planning', authenticateToken, async (req, res) => {
  try { res.json(await Planning.find({ tenantId: req.user.tenantId }).sort({ startDate: -1 })); } 
  catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
});
app.post('/api/planning', authenticateToken, async (req, res) => {
  try { res.status(201).json(await Planning.create({ ...req.body, tenantId: req.user.tenantId })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

// USUÁRIO / PERFIL
app.get('/api/users/:id/full', authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.id) return res.status(403).json({ message: 'Acesso negado' });
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Não encontrado' });
    res.json({
        id: user.id, email: user.email, name: user.name, role: user.role,
        tenantId: user.tenantId, plan: user.plan, emailVerified: user.emailVerified,
        hasProfileImage: !!user.profileImage?.data, phone: user.phone
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/users/:id/change-password', authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.id) return res.status(403).json({ message: 'Acesso negado' });
  try {
    const user = await User.findOne({ id: req.user.userId });
    if (!await bcrypt.compare(req.body.currentPassword, user.password)) return res.status(401).json({ message: 'Senha incorreta' });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();
    res.json({ message: 'Senha alterada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/users/:id/profile-image', authenticateToken, upload.single('profileImage'), async (req, res) => {
  if (req.user.userId !== req.params.id) return res.status(403).json({ message: 'Acesso negado' });
  if (!req.file) return res.status(400).json({ error: 'Sem imagem' });
  try {
    await User.findOneAndUpdate({ id: req.user.userId }, {
        profileImage: { data: req.file.buffer, contentType: req.file.mimetype, size: req.file.size, uploadedAt: new Date() }
    });
    res.json({ message: 'Foto atualizada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:id/profile-image', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user || !user.profileImage || !user.profileImage.data) return res.status(404).json({ message: 'Sem imagem' });
    res.set('Content-Type', user.profileImage.contentType);
    res.send(user.profileImage.data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.userId !== req.params.id) return res.status(403).json({ message: 'Acesso negado' });
    const { email, password, tenantId, plan, role, ...safe } = req.body; 
    try {
        await User.findOneAndUpdate({ id: req.user.userId }, { ...safe, updatedAt: new Date() });
        res.json({ message: 'Atualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// LISTAR USUÁRIOS (ADMIN)
app.get('/api/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const users = await User.find({ tenantId: req.user.tenantId });
        const safeUsers = users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, tenantId: u.tenantId, plan: u.plan, emailVerified: u.emailVerified }));
        res.json({ users: safeUsers });
    } catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
});

// SAÚDE DA EMPRESA (PRO)
app.get('/api/company-health', authenticateToken, checkPlanFeature('companyHealth'), async (req, res) => {
    try {
        const totalAnimals = await Animal.countDocuments({ tenantId: req.user.tenantId });
        const totalFinancials = await Financial.countDocuments({ tenantId: req.user.tenantId });
        res.json({ message: "Acesso Pro OK", dataPoints: totalAnimals + totalFinancials });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐄 Servidor AgroGest rodando em: http://localhost:${PORT}`);
});