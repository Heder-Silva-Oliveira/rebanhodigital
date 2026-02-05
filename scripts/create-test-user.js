import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../api/user/model/User.model.js';
import { MONGODB_URI } from '../api/config/env.js';

const createTestUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe
    const existingUser = await User.findOne({ email: 'admin@test.com' });
    if (existingUser) {
      console.log('👤 Usuário de teste já existe');
      return;
    }

    // Criar usuário de teste
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const testUser = await User.create({
      id: 'user_test_admin',
      tenantId: 'user_test_admin',
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin Teste',
      phone: '(11) 99999-9999',
      role: 'admin',
      plan: 'enterprise',
      emailVerified: true, // Já verificado para facilitar teste
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Usuário de teste criado:');
    console.log('   Email: admin@test.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser();