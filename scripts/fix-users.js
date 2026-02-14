import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrogest';

async function fixUsers() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Buscar usuários sem campo 'id'
    const usersWithoutId = await User.find({ id: { $exists: false } });
    
    console.log(`\n📋 Encontrados ${usersWithoutId.length} usuários sem campo 'id'`);
    
    if (usersWithoutId.length === 0) {
      console.log('✅ Todos os usuários estão corretos!');
      process.exit(0);
    }

    for (const user of usersWithoutId) {
      console.log(`\n🔧 Corrigindo usuário: ${user.email}`);
      
      // Gerar ID único
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Atualizar usuário
      await User.updateOne(
        { _id: user._id },
        { $set: { id: userId } }
      );
      
      console.log(`   ✅ ID gerado: ${userId}`);
    }

    console.log('\n✅ Todos os usuários foram corrigidos!');
    console.log('\n📊 Resumo:');
    
    const allUsers = await User.find({}, { email: 1, id: 1, name: 1, role: 1 });
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.name} - ID: ${user.id || 'SEM ID'}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
}

fixUsers();
