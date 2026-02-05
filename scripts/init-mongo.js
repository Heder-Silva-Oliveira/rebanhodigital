// Script de inicialização do MongoDB para Docker
// Este script é executado quando o container MongoDB é criado pela primeira vez

// Conectar ao banco de dados agrogest
db = db.getSiblingDB('agrogest');

// Criar usuário para a aplicação
db.createUser({
  user: 'agrogest_user',
  pwd: 'agrogest_password_123',
  roles: [
    {
      role: 'readWrite',
      db: 'agrogest'
    }
  ]
});

// Criar coleções iniciais (opcional)
db.createCollection('users');
db.createCollection('animals');
db.createCollection('financial_transactions');
db.createCollection('pastures');
db.createCollection('planning');
db.createCollection('weighing_records');

// Inserir dados de exemplo (opcional)
db.users.insertOne({
  email: 'admin@agrogest.com',
  name: 'Administrador',
  role: 'admin',
  plan: 'enterprise',
  tenantId: 'tenant_admin_001',
  emailVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ Banco de dados AgroGest inicializado com sucesso!');
print('👤 Usuário: agrogest_user');
print('🔑 Senha: agrogest_password_123');
print('🗄️ Database: agrogest');