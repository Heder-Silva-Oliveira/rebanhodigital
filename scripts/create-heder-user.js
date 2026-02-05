import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../api/user/model/User.model.js';
import { MONGODB_URI } from '../api/config/env.js';

const createHederUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe
    const existingUser = await User.findOne({ email: 'heder_gestao@hotmail.com' });
    if (existingUser) {
      console.log('👤 Usuário já existe, atualizando senha...');
      
      // Atualizar senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      
      existingUser.password = hashedPassword;
      existingUser.emailVerified = true; // Garantir que está verificado
      await existingUser.save();
      
      console.log('✅ Senha atualizada para: 123456');
      return;
    }

    // Criar usuário
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const user = await User.create({
      id: 'user_heder_gestao',
      tenantId: 'user_heder_gestao',
      email: 'heder_gestao@hotmail.com',
      password: hashedPassword,
      name: 'Heder Gestão',
      phone: '(11) 99999-9999',
      role: 'admin',
      plan: 'enterprise',
      emailVerified: true, // Já verificado para facilitar teste
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Usuário criado:');
    console.log('   Email: heder_gestao@hotmail.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createHederUser();