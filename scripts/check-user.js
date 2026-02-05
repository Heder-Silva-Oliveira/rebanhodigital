import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../api/user/model/User.model.js';
import { MONGODB_URI } from '../api/config/env.js';

const checkUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const user = await User.findOne({ email: 'heder_gestao@hotmail.com' });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.name);
    console.log('   Email Verificado:', user.emailVerified);
    console.log('   Role:', user.role);
    console.log('   Plan:', user.plan);
    
    // Testar senha
    const isPasswordValid = await bcrypt.compare('123456', user.password);
    console.log('   Senha "123456" válida:', isPasswordValid);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUser();