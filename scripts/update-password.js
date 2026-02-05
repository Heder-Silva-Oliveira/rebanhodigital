import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../api/user/model/User.model.js';
import { MONGODB_URI } from '../api/config/env.js';

const updatePassword = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const user = await User.findOne({ email: 'heder_gestao@hotmail.com' });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    // Atualizar senha para qawsedrftg
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('qawsedrftg', salt);
    
    user.password = hashedPassword;
    user.emailVerified = true; // Garantir que está verificado
    await user.save();
    
    console.log('✅ Senha atualizada para: qawsedrftg');
    console.log('   Email:', user.email);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updatePassword();