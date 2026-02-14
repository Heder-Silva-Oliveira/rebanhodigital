import { User } from '../model/User.model.js';
import bcrypt from 'bcryptjs';

export const getFullProfile = async (req, res) => {
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
};

export const changePassword = async (req, res) => {
  if (req.user.userId !== req.params.id) return res.status(403).json({ message: 'Acesso negado' });
  try {
    const user = await User.findOne({ id: req.user.userId });
    if (!await bcrypt.compare(req.body.currentPassword, user.password)) {
        return res.status(401).json({ message: 'Senha incorreta' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();
    res.json({ message: 'Senha alterada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const uploadProfileImage = async (req, res) => {
  if (req.user.userId !== req.params.id) return res.status(403).json({ message: 'Acesso negado' });
  if (!req.file) return res.status(400).json({ error: 'Sem imagem' });
  try {
    await User.findOneAndUpdate({ id: req.user.userId }, {
        profileImage: { data: req.file.buffer, contentType: req.file.mimetype, size: req.file.size, uploadedAt: new Date() }
    });
    res.json({ message: 'Foto atualizada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getProfileImage = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user || !user.profileImage || !user.profileImage.data) return res.status(404).json({ message: 'Sem imagem' });
    res.set('Content-Type', user.profileImage.contentType);
    res.send(user.profileImage.data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateProfile = async (req, res) => {
    if (req.user.userId !== req.params.id) return res.status(403).json({ message: 'Acesso negado' });
    const { email, password, tenantId, plan, role, ...safe } = req.body; 
    try {
        await User.findOneAndUpdate({ id: req.user.userId }, { ...safe, updatedAt: new Date() });
        res.json({ message: 'Atualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const listUsers = async (req, res) => {
    console.log('[LIST USERS] Iniciando listagem de usuários');
    console.log('[LIST USERS] User:', req.user);
    console.log('[LIST USERS] TenantId:', req.user?.tenantId);
    
    try {
        if (!req.user || !req.user.tenantId) {
            console.log('[LIST USERS] ❌ TenantId não encontrado');
            return res.status(400).json({ message: 'TenantId não identificado' });
        }
        
        const users = await User.find({ tenantId: req.user.tenantId });
        console.log('[LIST USERS] ✅ Encontrados', users.length, 'usuários');
        
        const safeUsers = users.map(u => ({ 
            id: u.id, 
            email: u.email, 
            name: u.name, 
            role: u.role, 
            tenantId: u.tenantId, 
            plan: u.plan, 
            emailVerified: u.emailVerified,
            isActive: u.isActive,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin,
        }));
        res.json({ users: safeUsers });
    } catch (err) { 
        console.log('[LIST USERS] ❌ Erro:', err.message);
        res.status(500).json({ error: 'Erro ao buscar usuários', details: err.message }); 
    }
};

// Criar novo usuário (apenas admin)
export const createUser = async (req, res) => {
    console.log('[CREATE USER] Iniciando criação de usuário');
    console.log('[CREATE USER] Body:', req.body);
    console.log('[CREATE USER] User:', req.user);
    
    try {
        const { email, password, name, role } = req.body;
        
        // Validações
        if (!email || !password || !name) {
            console.log('[CREATE USER] ❌ Dados incompletos');
            return res.status(400).json({ message: 'Email, senha e nome são obrigatórios' });
        }
        
        console.log('[CREATE USER] Verificando se email já existe:', email);
        
        // Verificar se email já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('[CREATE USER] ❌ Email já cadastrado');
            return res.status(400).json({ message: 'Email já cadastrado' });
        }
        
        console.log('[CREATE USER] Gerando hash da senha...');
        
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Gerar ID único
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('[CREATE USER] Criando usuário com ID:', userId);
        
        // Criar usuário com mesmo tenantId do admin
        const newUser = new User({
            id: userId,
            email,
            password: hashedPassword,
            name,
            role: role || 'operador',
            tenantId: req.user.tenantId,
            plan: req.user.plan, // Herda o plano do tenant
            emailVerified: true, // Admin criando usuário, já considera verificado
            isActive: true,
        });
        
        console.log('[CREATE USER] Salvando usuário no banco...');
        await newUser.save();
        console.log('[CREATE USER] ✅ Usuário salvo com sucesso!');
        
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                tenantId: newUser.tenantId,
            }
        });
    } catch (err) {
        console.log('[CREATE USER] ❌ Erro:', err.message);
        console.log('[CREATE USER] Stack:', err.stack);
        res.status(500).json({ error: err.message });
    }
};

// Atualizar usuário (apenas admin)
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, role, isActive } = req.body;
        
        const user = await User.findOne({ id: userId, tenantId: req.user.tenantId });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        // Não permitir que o admin desative a si mesmo
        if (user.id === req.user.userId && isActive === false) {
            return res.status(400).json({ message: 'Você não pode desativar sua própria conta' });
        }
        
        if (name) user.name = name;
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        
        await user.save();
        
        res.json({
            message: 'Usuário atualizado com sucesso',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Deletar usuário (apenas admin)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Não permitir que o admin delete a si mesmo
        if (userId === req.user.userId) {
            return res.status(400).json({ message: 'Você não pode deletar sua própria conta' });
        }
        
        const user = await User.findOne({ id: userId, tenantId: req.user.tenantId });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        await User.deleteOne({ id: userId, tenantId: req.user.tenantId });
        
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};