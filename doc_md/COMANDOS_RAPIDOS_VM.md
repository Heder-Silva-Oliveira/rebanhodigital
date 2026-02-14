# ⚡ COMANDOS RÁPIDOS - DEPLOY NA VM

**Execute estes comandos na VM após conectar via SSH**

---

## 🚀 DEPLOY RÁPIDO (COPIE E COLE)

```bash
# 1. Atualizar sistema
sudo yum update -y

# 2. Instalar Git
sudo yum install git -y

# 3. Instalar Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y

# 4. Instalar pnpm
npm install -g pnpm

# 5. Criar diretório e clonar repositório
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/Heder-Silva-Oliveira/rebanhodigital.git
cd rebanhodigital

# 6. Instalar dependências
pnpm install

# 7. Criar arquivo .env
cp .env.example .env
nano .env
# Configure as variáveis e salve (Ctrl+X, Y, Enter)

# 8. Gerar secrets JWT
echo "JWT_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo "JWT_REFRESH_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copie estes valores para o .env

# 9. Build do frontend
pnpm build

# 10. Configurar firewall
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

# 11. Instalar PM2
npm install -g pm2

# 12. Iniciar aplicação
pm2 start api/server.js --name agrogest
pm2 save
pm2 startup

# 13. Verificar status
pm2 status
pm2 logs agrogest --lines 20

# 14. Testar
curl http://localhost:3002/api
```

---

## 🔥 CONFIGURAR SECURITY LIST (ORACLE CLOUD)

**IMPORTANTE:** Faça isso no painel do Oracle Cloud:

1. Acesse: https://cloud.oracle.com
2. Menu → Networking → Virtual Cloud Networks
3. Selecione sua VCN
4. Clique em "Security Lists" → "Default Security List"
5. Clique em "Add Ingress Rules"
6. Adicione estas regras:

**Regra 1 - API:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `3002`
- Description: `AgroGest API`

**Regra 2 - HTTP:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `80`
- Description: `HTTP`

**Regra 3 - HTTPS:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `443`
- Description: `HTTPS`

---

## 📝 CONFIGURAR .env

Edite o arquivo .env com estas configurações:

```env
# CONFIGURAÇÕES DA APLICAÇÃO
NODE_ENV=production
PORT=3002

# URLS (AJUSTE O IP)
VITE_API_URL=http://129.148.62.240:3002
FRONTEND_URL=http://129.148.62.240:3002
BACKEND_URL=http://129.148.62.240:3002

# BANCO DE DADOS (USE SUAS CREDENCIAIS)
MONGODB_URI="mongodb+srv://usuario:senha@cluster.mongodb.net/database"

# AUTENTICAÇÃO (COLE OS SECRETS GERADOS)
JWT_SECRET=cole-aqui-o-secret-gerado
JWT_REFRESH_SECRET=cole-aqui-o-secret-gerado

# EMAIL (OPCIONAL)
EMAIL_USERNAME=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-app

# TWILIO (OPCIONAL)
TWILIO_ACCOUNT_SID=seu-sid
TWILIO_AUTH_TOKEN=seu-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔄 ATUALIZAR APLICAÇÃO

```bash
# 1. Ir para o diretório
cd ~/projects/rebanhodigital

# 2. Pull das mudanças
git pull origin main

# 3. Instalar novas dependências
pnpm install

# 4. Rebuild frontend
pnpm build

# 5. Reiniciar aplicação
pm2 restart agrogest

# 6. Ver logs
pm2 logs agrogest
```

---

## 🧪 TESTAR APLICAÇÃO

```bash
# Testar localmente
curl http://localhost:3002/api

# Ver IP público
curl ifconfig.me

# Testar externamente (do seu computador)
curl http://129.148.62.240:3002/api

# Abrir no navegador
# http://129.148.62.240:3002
```

---

## 📊 MONITORAMENTO

```bash
# Ver status PM2
pm2 status

# Ver logs em tempo real
pm2 logs agrogest

# Ver últimas 50 linhas
pm2 logs agrogest --lines 50

# Ver uso de recursos
pm2 monit

# Ver informações detalhadas
pm2 show agrogest
```

---

## 🛠️ COMANDOS ÚTEIS

```bash
# Reiniciar aplicação
pm2 restart agrogest

# Parar aplicação
pm2 stop agrogest

# Iniciar aplicação
pm2 start agrogest

# Deletar do PM2
pm2 delete agrogest

# Ver portas abertas
sudo netstat -tulpn | grep 3002

# Ver processos Node
ps aux | grep node

# Uso de memória
free -h

# Uso de disco
df -h

# Ver logs do sistema
sudo journalctl -xe
```

---

## 🔧 TROUBLESHOOTING

### Problema: Porta 3002 não acessível

```bash
# 1. Verificar se está rodando
pm2 status

# 2. Verificar firewall
sudo firewall-cmd --list-all

# 3. Verificar porta
sudo netstat -tulpn | grep 3002

# 4. Ver logs
pm2 logs agrogest --lines 100

# 5. Reiniciar
pm2 restart agrogest
```

### Problema: Erro ao iniciar

```bash
# Ver logs detalhados
pm2 logs agrogest --err

# Verificar .env
cat .env

# Testar manualmente
cd ~/projects/rebanhodigital
node api/server.js
```

### Problema: Falta de memória

```bash
# Verificar memória
free -h

# Criar swap
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 🎯 CHECKLIST

- [ ] Sistema atualizado
- [ ] Git instalado
- [ ] Node.js 18+ instalado
- [ ] pnpm instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] .env configurado
- [ ] Secrets gerados
- [ ] Build do frontend
- [ ] Firewall configurado (VM)
- [ ] Security List configurado (Oracle Cloud)
- [ ] PM2 instalado
- [ ] Aplicação iniciada
- [ ] Testes realizados

---

## 📞 ACESSO

**URL da Aplicação:** http://129.148.62.240:3002  
**API:** http://129.148.62.240:3002/api

---

**Documentação Completa:** doc_md/GUIA_DEPLOY_VM.md