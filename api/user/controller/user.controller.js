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
    try {
        const users = await User.find({ tenantId: req.user.tenantId });
        const safeUsers = users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, tenantId: u.tenantId, plan: u.plan, emailVerified: u.emailVerified }));
        res.json({ users: safeUsers });
    } catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
};