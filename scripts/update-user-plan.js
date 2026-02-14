import mongoose from 'mongoose';
import { User } from '../api/user/model/User.model.js';
import { MONGODB_URI } from '../api/config/env.js';

const updateUserPlan = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const email = 'hafaja6487@newtrea.com';
    const newPlan = 'pro';

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return;
    }

    console.log('📋 Usuário encontrado:');
    console.log('   Email:', user.email);
    console.log('   Plano atual:', user.plan);
    console.log('   Role:', user.role);

    user.plan = newPlan;
    await user.save();
    
    console.log('✅ Plano atualizado para:', newPlan);
    console.log('   Agora o usuário pode criar múltiplos usuários!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateUserPlan();
