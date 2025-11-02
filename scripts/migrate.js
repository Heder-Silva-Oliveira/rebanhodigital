import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente (MONGODB_URI)
dotenv.config();

// =================================================================
// ⚠️ ATENÇÃO: PASSO 1 - DEFINA O TENANT ID ⚠️
// =================================================================
// Encontre o 'id' (NÃO o _id) do seu usuário administrador principal
// no banco de dados e cole-o aqui.
// Todos os dados órfãos serão atribuídos a este usuário.
const DEFAULT_TENANT_ID = '1'; 
// Ex: 'user_1698888000'
// =================================================================

const MONGODB_URI = process.env.MONGODB_URI;

// Lista de todas as coleções de DADOS (exclui 'users')
const COLLECTIONS_TO_MIGRATE = [
  'animals',
  'financials',
  'pastures',
  'plannings',
  'weighingrecords'
];

// Schema "relaxado" para permitir atualização de 'users'
const UserSchemaMigration = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchemaMigration);

async function runMigration() {
  if (DEFAULT_TENANT_ID === 'COLOQUE_O_ID_DO_SEU_ADMIN_AQUI') {
    console.error('❌ ERRO: Você deve definir o DEFAULT_TENANT_ID no script migrate.js');
    process.exit(1);
  }

  try {
    console.log('Iniciando migração...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB.');

    // --- PASSO 2: Migrar Coleção de Usuários ---
    // Garante que todo usuário tenha um tenantId (baseado no seu próprio id)
    console.log('\n--- Migrando Usuários ---');
    const usersToUpdate = await User.find({ tenantId: { $exists: false } });
    
    if (usersToUpdate.length > 0) {
      console.log(`Encontrados ${usersToUpdate.length} usuários sem tenantId...`);
      let userPromises = [];
      for (const user of usersToUpdate) {
        const userId = user.id; // Assume que o campo 'id' existe
        if (userId) {
          console.log(`Atualizando usuário ${user.email || user.id}...`);
          userPromises.push(
            User.updateOne(
              { _id: user._id },
              { $set: { tenantId: userId } } // Define tenantId = id
            )
          );
        } else {
          console.warn(`Usuário com _id ${user._id} não possui campo 'id' e será ignorado.`);
        }
      }
      await Promise.all(userPromises);
      console.log('✅ Usuários migrados com sucesso.');
    } else {
      console.log('ℹ️ Nenhum usuário precisou de migração.');
    }

    // --- PASSO 3: Migrar Coleções de Dados ---
    // Atribui todos os dados órfãos ao admin principal (DEFAULT_TENANT_ID)
    console.log(`\n--- Migrando Coleções de Dados para o Tenant: ${DEFAULT_TENANT_ID} ---`);
    
    const filter = { tenantId: { $exists: false } };
    const updateDoc = { $set: { tenantId: DEFAULT_TENANT_ID } };

    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      console.log(`Processando coleção: ${collectionName}...`);
      const collection = mongoose.connection.db.collection(collectionName);
      const result = await collection.updateMany(filter, updateDoc);
      console.log(` -> ${result.modifiedCount} documentos atualizados em ${collectionName}.`);
    }

    console.log('\n🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('\n❌ ERRO DURANTE A MIGRAÇÃO:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB.');
    process.exit(0);
  }
}

// --- PASSO 4: Executar o Script ---
// No seu terminal, rode: node migrate.js
runMigration();