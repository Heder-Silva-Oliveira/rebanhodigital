import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrogest';

async function listUsers() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const users = await User.find({}, { 
      email: 1, 
      id: 1, 
      name: 1, 
      role: 1, 
      plan: 1, 
      tenantId: 1,
      isActive: 1,
      emailVerified: 1
    });
    
    console.log(`📋 Total de usuários: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Sem nome'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id || '❌ SEM ID'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Plano: ${user.plan || 'Não definido'}`);
      console.log(`   TenantId: ${user.tenantId}`);
      console.log(`   Ativo: ${user.isActive ? 'Sim' : 'Não'}`);
      console.log(`   Email Verificado: ${user.emailVerified ? 'Sim' : 'Não'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
}

listUsers();
