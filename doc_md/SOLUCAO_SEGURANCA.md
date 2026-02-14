# 🔧 SOLUÇÃO DE SEGURANÇA - GUIA DE IMPLEMENTAÇÃO

## 🚀 IMPLEMENTAÇÃO RÁPIDA (30 MINUTOS)

### PASSO 1: Instalar Dependências de Segurança

```bash
npm install helmet express-rate-limit express-mongo-sanitize xss-clean hpp joi
```

---

### PASSO 2: Gerar Novo JWT Secret

```bash
# Execute este comando e copie o resultado
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Resultado:** Um secret de 128 caracteres. Exemplo:
```
a1b2c3d4e5f6...
```

---

### PASSO 3: Atualizar Arquivo .env

**IMPORTANTE:** Nunca commite o .env no Git!

```env
# .env (NOVO - USE VALORES REAIS)
NODE_ENV=development
PORT=3002

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3002

# BANCO DE DADOS (TROQUE A SENHA!)
MONGODB_URI=mongodb+srv://usuario:NOVA_SENHA_AQUI@cluster0.mongodb.net/db_rebanho_digital

# JWT (USE O SECRET GERADO NO PASSO 2)
JWT_SECRET=SEU_SECRET_DE_128_CARACTERES_AQUI
JWT_REFRESH_SECRET=OUTRO_SECRET_DE_128_CARACTERES_AQUI

# EMAIL (TROQUE A SENHA!)
EMAIL_USERNAME=rebanhodigital@gmail.com
EMAIL_PASSWORD=NOVA_SENHA_APP_GMAIL

# TWILIO (REGENERE OS TOKENS!)
TWILIO_ACCOUNT_SID=SEU_NOVO_SID
TWILIO_AUTH_TOKEN=SEU_NOVO_TOKEN
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### PASSO 4: Atualizar .gitignore

```bash
# Adicione ao .gitignore se ainda não estiver
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

---

### PASSO 5: Remover .env do Histórico Git (SE JÁ FOI COMMITADO)

**⚠️ ATENÇÃO: Isso reescreve o histórico do Git!**

```bash
# Backup primeiro!
git branch backup-antes-limpeza

# Remover .env do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Limpar referências
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (coordene com a equipe!)
# git push origin --force --all
```

---

### PASSO 6: Habilitar Middlewares de Segurança

**Editar: api/app.js**

```javascript
// Descomentar estas linhas:
import { securityMiddleware, securityLogger } from './middlewares/security.middleware.js';

// ...

app.use(securityMiddleware);
app.use(securityLogger);
```

---

### PASSO 7: Aplicar Rate Limiting nas Rotas de Auth

**Editar: api/auth/routes/auth.routes.js**

```javascript
import { Router } from 'express';
import * as authController from '../controller/auth.controller.js';
import { authLimiter } from '../../middlewares/security.middleware.js';

const router = Router();

// Aplicar rate limiting
router.post('/login', authLimiter, authController.login);
router.post('/users', authLimiter, authController.register);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/resend-verification', authLimiter, authController.resendVerification);

// Rotas sem rate limiting agressivo
router.get('/verify-email', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);

export default router;
```

---

### PASSO 8: Aplicar Validadores

**Editar: api/auth/routes/auth.routes.js**

```javascript
import { Router } from 'express';
import * as authController from '../controller/auth.controller.js';
import { authLimiter } from '../../middlewares/security.middleware.js';
import { validateInput } from '../../middlewares/security.middleware.js';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema 
} from '../../validators/auth.validator.js';

const router = Router();

// Com validação e rate limiting
router.post('/login', 
  authLimiter, 
  validateInput(loginSchema), 
  authController.login
);

router.post('/users', 
  authLimiter, 
  validateInput(registerSchema), 
  authController.register
);

router.post('/forgot-password', 
  authLimiter, 
  validateInput(forgotPasswordSchema), 
  authController.forgotPassword
);

export default router;
```

---

### PASSO 9: Atualizar Upload Middleware

**Editar: api/user/routes/user.routes.js**

```javascript
import express from 'express';
import * as userController from '../controller/user.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';
import { 
  uploadMiddleware, 
  validateImageContent, 
  uploadLimiter 
} from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', checkRole(['admin']), userController.listUsers);
router.get('/:id/full', userController.getFullProfile);
router.patch('/:id', userController.updateProfile);
router.patch('/:id/change-password', userController.changePassword);
router.get('/:id/profile-image', userController.getProfileImage);

// Upload com validação e rate limiting
router.patch('/:id/profile-image', 
  uploadLimiter,
  uploadMiddleware.single('profileImage'),
  validateImageContent,
  userController.uploadProfileImage
);

export default router;
```

---

### PASSO 10: Atualizar Docker Compose (Segurança)

**Editar: docker-compose.yml**

```yaml
services:
  agrogest:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: agrogest-app
    env_file:
      - .env
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
    networks:
      - agrogest-network
    restart: unless-stopped
    volumes:
      - uploads:/app/uploads
    # Segurança adicional
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: false
    tmpfs:
      - /tmp
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3002/api', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  uploads:
    driver: local

networks:
  agrogest-network:
    driver: bridge
```

---

## 🧪 TESTES DE VALIDAÇÃO

### Teste 1: Rate Limiting

```bash
# Testar rate limiting no login (deve bloquear após 5 tentativas)
for i in {1..10}; do
  curl -X POST http://localhost:3002/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"teste@teste.com","password":"senha123"}'
  echo "\nTentativa $i"
done
```

**Resultado Esperado:** Após 5 tentativas, deve retornar erro 429 (Too Many Requests)

---

### Teste 2: Validação de Entrada

```bash
# Testar validação de senha fraca
curl -X POST http://localhost:3002/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@teste.com",
    "password": "123",
    "phone": "(11) 99999-9999"
  }'
```

**Resultado Esperado:** Erro 400 com mensagem sobre senha fraca

---

### Teste 3: Headers de Segurança

```bash
# Verificar headers de segurança
curl -I http://localhost:3002/api
```

**Resultado Esperado:** Headers como:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000

---

### Teste 4: CORS

```bash
# Testar CORS com origem não permitida
curl -X GET http://localhost:3002/api \
  -H "Origin: http://malicious-site.com" \
  -v
```

**Resultado Esperado:** Erro de CORS

---

## 📊 VERIFICAÇÃO FINAL

### Checklist de Segurança

Execute este checklist após implementar todas as mudanças:

```bash
# 1. Verificar se .env não está no Git
git ls-files | grep .env
# Resultado esperado: (vazio)

# 2. Verificar dependências instaladas
npm list helmet express-rate-limit express-mongo-sanitize xss-clean hpp joi
# Resultado esperado: Todas instaladas

# 3. Verificar JWT_SECRET
node -e "console.log(process.env.JWT_SECRET?.length || 0)"
# Resultado esperado: >= 32

# 4. Testar aplicação
npm run start-backend
# Resultado esperado: Servidor inicia sem erros

# 5. Verificar logs de segurança
# Deve aparecer: [SECURITY] logs nos acessos
```

---

## 🔄 MANUTENÇÃO CONTÍNUA

### Semanal
- [ ] Revisar logs de segurança
- [ ] Verificar tentativas de acesso não autorizado
- [ ] Monitorar performance

### Mensal
- [ ] Atualizar dependências: `npm audit fix`
- [ ] Revisar políticas de segurança
- [ ] Testar backups

### Trimestral
- [ ] Auditoria de segurança completa
- [ ] Revisar e atualizar secrets
- [ ] Penetration testing

---

## 🆘 TROUBLESHOOTING

### Problema: "JWT_SECRET deve ter pelo menos 32 caracteres"

**Solução:**
```bash
# Gerar novo secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copiar resultado para .env
```

---

### Problema: "Cannot find module 'helmet'"

**Solução:**
```bash
npm install helmet express-rate-limit express-mongo-sanitize xss-clean hpp joi
```

---

### Problema: Rate limiting bloqueando desenvolvimento

**Solução:**
```javascript
// api/middlewares/security.middleware.js
// Ajustar limites para desenvolvimento
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'development' ? 100 : 5, // Mais permissivo em dev
  // ...
});
```

---

### Problema: CORS bloqueando requisições locais

**Solução:**
```javascript
// api/app.js
// Verificar se NODE_ENV está correto
console.log('NODE_ENV:', NODE_ENV);
// Deve ser 'development' para permitir localhost
```

---

## 📞 SUPORTE

Se encontrar problemas durante a implementação:

1. Verifique os logs: `npm run docker:logs`
2. Revise o checklist de implementação
3. Consulte a documentação das bibliotecas
4. Execute os testes de validação

---

**Tempo estimado de implementação:** 30-60 minutos  
**Nível de dificuldade:** Intermediário  
**Impacto:** Alto (melhora significativa na segurança)