#!/usr/bin/env node

/**
 * Script de Configuração de Segurança - AgroGest
 * 
 * Este script automatiza a configuração inicial de segurança:
 * 1. Gera JWT secrets fortes
 * 2. Cria arquivo .env.example
 * 3. Valida configurações existentes
 * 4. Fornece relatório de segurança
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function validateJWTSecret(secret) {
  if (!secret) return { valid: false, message: 'Secret não definido' };
  if (secret.length < 32) return { valid: false, message: 'Secret muito curto (mínimo 32 caracteres)' };
  if (secret.includes('SEGREDO') || secret.includes('SECRET')) {
    return { valid: false, message: 'Secret parece ser um placeholder' };
  }
  return { valid: true, message: 'Secret válido' };
}

function createEnvExample() {
  const envExamplePath = path.join(rootDir, '.env.example');
  
  const content = `# CONFIGURAÇÕES DA APLICAÇÃO
NODE_ENV=development
PORT=3002

# URLS
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3002

# BANCO DE DADOS
# Obtenha sua connection string no MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/database

# AUTENTICAÇÃO
# IMPORTANTE: Gere secrets fortes usando: node scripts/setup-security.js
JWT_SECRET=your-super-secure-jwt-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-here

# EMAIL (OPCIONAL)
# Para Gmail, use App Password: https://support.google.com/accounts/answer/185833
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# TWILIO (OPCIONAL)
# Obtenha suas credenciais em: https://www.twilio.com/console
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  fs.writeFileSync(envExamplePath, content);
  log('✓ Arquivo .env.example criado', 'green');
}

function analyzeEnvFile() {
  const envPath = path.join(rootDir, '.env');
  
  if (!checkFileExists(envPath)) {
    log('⚠ Arquivo .env não encontrado', 'yellow');
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  const config = {};
  lines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      config[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });

  return config;
}

function generateSecurityReport(config) {
  log('\n' + '='.repeat(60), 'cyan');
  log('  RELATÓRIO DE SEGURANÇA - AGROGEST', 'cyan');
  log('='.repeat(60), 'cyan');

  const issues = [];
  const warnings = [];
  const passed = [];

  // Verificar JWT_SECRET
  if (config?.JWT_SECRET) {
    const validation = validateJWTSecret(config.JWT_SECRET);
    if (validation.valid) {
      passed.push('JWT_SECRET configurado corretamente');
    } else {
      issues.push(`JWT_SECRET: ${validation.message}`);
    }
  } else {
    issues.push('JWT_SECRET não definido');
  }

  // Verificar MONGODB_URI
  if (config?.MONGODB_URI) {
    if (config.MONGODB_URI.includes('password') || config.MONGODB_URI.length < 20) {
      warnings.push('MONGODB_URI parece ser um placeholder');
    } else {
      passed.push('MONGODB_URI configurado');
    }
  } else {
    issues.push('MONGODB_URI não definido');
  }

  // Verificar NODE_ENV
  if (config?.NODE_ENV) {
    if (['development', 'production', 'test'].includes(config.NODE_ENV)) {
      passed.push(`NODE_ENV: ${config.NODE_ENV}`);
    } else {
      warnings.push(`NODE_ENV tem valor incomum: ${config.NODE_ENV}`);
    }
  }

  // Verificar credenciais expostas
  if (config?.JWT_SECRET?.includes('SEGREDO') || config?.JWT_SECRET?.includes('123456')) {
    issues.push('JWT_SECRET parece ser um valor de exemplo - TROQUE IMEDIATAMENTE!');
  }

  // Exibir resultados
  log('\n📊 RESUMO:', 'blue');
  log(`   ✓ Verificações Passadas: ${passed.length}`, 'green');
  log(`   ⚠ Avisos: ${warnings.length}`, 'yellow');
  log(`   ✗ Problemas Críticos: ${issues.length}`, 'red');

  if (passed.length > 0) {
    log('\n✓ VERIFICAÇÕES PASSADAS:', 'green');
    passed.forEach(item => log(`   • ${item}`, 'green'));
  }

  if (warnings.length > 0) {
    log('\n⚠ AVISOS:', 'yellow');
    warnings.forEach(item => log(`   • ${item}`, 'yellow'));
  }

  if (issues.length > 0) {
    log('\n✗ PROBLEMAS CRÍTICOS:', 'red');
    issues.forEach(item => log(`   • ${item}`, 'red'));
  }

  // Calcular score
  const total = passed.length + warnings.length + issues.length;
  const score = total > 0 ? Math.round((passed.length / total) * 10) : 0;
  
  log('\n' + '='.repeat(60), 'cyan');
  log(`  NÍVEL DE SEGURANÇA: ${score}/10`, score >= 7 ? 'green' : score >= 4 ? 'yellow' : 'red');
  log('='.repeat(60), 'cyan');

  return { issues, warnings, passed, score };
}

function main() {
  log('\n🔒 CONFIGURAÇÃO DE SEGURANÇA - AGROGEST\n', 'cyan');

  // 1. Criar .env.example
  log('1. Criando arquivo .env.example...', 'blue');
  createEnvExample();

  // 2. Gerar novos secrets
  log('\n2. Gerando novos JWT secrets...', 'blue');
  const jwtSecret = generateSecret(64);
  const jwtRefreshSecret = generateSecret(64);
  
  log('   JWT_SECRET gerado (128 caracteres)', 'green');
  log('   JWT_REFRESH_SECRET gerado (128 caracteres)', 'green');

  // 3. Analisar .env existente
  log('\n3. Analisando configuração atual...', 'blue');
  const config = analyzeEnvFile();

  // 4. Gerar relatório
  const report = generateSecurityReport(config);

  // 5. Recomendações
  log('\n📋 PRÓXIMOS PASSOS:', 'magenta');
  
  if (report.issues.length > 0) {
    log('\n   AÇÃO IMEDIATA NECESSÁRIA:', 'red');
    log('   1. Copie os secrets gerados abaixo para seu arquivo .env', 'yellow');
    log('   2. Troque todas as credenciais expostas', 'yellow');
    log('   3. Remova o .env do Git se já foi commitado', 'yellow');
  }

  log('\n🔑 SECRETS GERADOS:', 'cyan');
  log('\n   Adicione estas linhas ao seu arquivo .env:\n', 'yellow');
  log(`JWT_SECRET=${jwtSecret}`, 'green');
  log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`, 'green');

  log('\n💡 COMANDOS ÚTEIS:', 'cyan');
  log('   • Instalar dependências: npm install helmet express-rate-limit express-mongo-sanitize xss-clean hpp joi', 'blue');
  log('   • Verificar vulnerabilidades: npm audit', 'blue');
  log('   • Corrigir vulnerabilidades: npm audit fix', 'blue');
  log('   • Iniciar servidor: npm run start-backend', 'blue');

  log('\n📚 DOCUMENTAÇÃO:', 'cyan');
  log('   • Análise completa: ANALISE_SEGURANCA_COMPLETA.md', 'blue');
  log('   • Guia de implementação: SOLUCAO_SEGURANCA.md', 'blue');
  log('   • Checklist: SECURITY_CHECKLIST.md', 'blue');

  log('\n✅ Script concluído!\n', 'green');
}

// Executar
main();