import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrogest';

async function makeAdmin() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Listar todos os usuários
    const users = await User.find({}, { email: 1, name: 1, role: 1, plan: 1 });
    
    console.log('\n📋 Usuários encontrados:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.name} - Role: ${user.role} - Plano: ${user.plan}`);
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
      process.exit(1);
    }

    // Pegar o email do primeiro argumento ou usar o primeiro usuário
    const emailToUpdate = process.argv[2] || users[0].email;

    console.log(`\n🔄 Atualizando usuário: ${emailToUpdate}`);
    
    const result = await User.updateOne(
      { email: emailToUpdate },
      { 
        $set: { 
          role: 'admin',
          plan: 'pro' // Também atualiza para plano Pro
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log(`❌ Usuário ${emailToUpdate} não encontrado`);
      process.exit(1);
    }

    console.log('✅ Usuário atualizado com sucesso!');
    console.log('   - Role: admin');
    console.log('   - Plano: pro');
    console.log('\n⚠️  IMPORTANTE: Faça logout e login novamente para aplicar as mudanças');

    const updatedUser = await User.findOne({ email: emailToUpdate });
    console.log('\n📊 Dados atualizados:');
    console.log(JSON.stringify({
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      plan: updatedUser.plan
    }, null, 2));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
}

makeAdmin();
