# 🚀 GUIA DE DEPLOY NA VM - ORACLE CLOUD

**VM:** 129.148.62.240  
**Usuário:** opc  
**Repositório:** https://github.com/Heder-Silva-Oliveira/rebanhodigital.git

---

## 📋 PRÉ-REQUISITOS NA VM

Execute estes comandos na VM após conectar via SSH:

### 1. Atualizar Sistema
```bash
sudo yum update -y
```

### 2. Instalar Git
```bash
sudo yum install git -y
git --version
```

### 3. Instalar Node.js 18+
```bash
# Instalar Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y

# Verificar instalação
node --version
npm --version
```

### 4. Instalar pnpm
```bash
npm install -g pnpm
pnpm --version
```

### 5. Instalar Docker (Opcional)
```bash
# Instalar Docker
sudo yum install docker -y

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

---

## 📥 CLONAR REPOSITÓRIO

### 1. Criar Diretório de Projetos
```bash
mkdir -p ~/projects
cd ~/projects
```

### 2. Clonar Repositório
```bash
git clone https://github.com/Heder-Silva-Oliveira/rebanhodigital.git
cd rebanhodigital
```

### 3. Verificar Branch
```bash
git branch
git status
```

---

## ⚙️ CONFIGURAR PROJETO

### 1. Instalar Dependências
```bash
pnpm install
```

### 2. Criar Arquivo .env
```bash
# Copiar template
cp .env.example .env

# Editar com nano ou vi
nano .env
```

### 3. Configurar .env
```env
# CONFIGURAÇÕES DA APLICAÇÃO
NODE_ENV=production
PORT=3002

# URLS (AJUSTE PARA SEU DOMÍNIO)
VITE_API_URL=http://129.148.62.240:3002
FRONTEND_URL=http://129.148.62.240:3002
BACKEND_URL=http://129.148.62.240:3002

# BANCO DE DADOS (USE SUAS CREDENCIAIS)
MONGODB_URI="mongodb+srv://usuario:senha@cluster.mongodb.net/database"

# AUTENTICAÇÃO (GERE NOVOS SECRETS)
JWT_SECRET=seu-secret-de-128-caracteres-aqui
JWT_REFRESH_SECRET=outro-secret-de-128-caracteres-aqui

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

### 4. Gerar Novos Secrets
```bash
# Gerar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Gerar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copie os valores gerados e cole no .env
```

---

## 🔥 CONFIGURAR FIREWALL

### 1. Abrir Portas no Firewall da VM
```bash
# Porta 3002 (API)
sudo firewall-cmd --permanent --add-port=3002/tcp

# Porta 80 (HTTP)
sudo firewall-cmd --permanent --add-port=80/tcp

# Porta 443 (HTTPS)
sudo firewall-cmd --permanent --add-port=443/tcp

# Recarregar firewall
sudo firewall-cmd --reload

# Verificar
sudo firewall-cmd --list-all
```

### 2. Configurar Security List no Oracle Cloud
**IMPORTANTE:** Você também precisa abrir as portas no painel do Oracle Cloud:

1. Acesse: https://cloud.oracle.com
2. Vá em: Networking → Virtual Cloud Networks
3. Selecione sua VCN
4. Clique em "Security Lists"
5. Adicione Ingress Rules:
   - **Porta 3002:** Source: 0.0.0.0/0, Protocol: TCP, Port: 3002
   - **Porta 80:** Source: 0.0.0.0/0, Protocol: TCP, Port: 80
   - **Porta 443:** Source: 0.0.0.0/0, Protocol: TCP, Port: 443

---

## 🚀 INICIAR APLICAÇÃO

### Opção 1: Modo Desenvolvimento
```bash
# Build do frontend
pnpm build

# Iniciar backend
pnpm start-backend
```

### Opção 2: Com Docker
```bash
# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Opção 3: Com PM2 (Recomendado para Produção)
```bash
# Instalar PM2
npm install -g pm2

# Build do frontend
pnpm build

# Iniciar com PM2
pm2 start api/server.js --name agrogest

# Ver status
pm2 status

# Ver logs
pm2 logs agrogest

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

---

## 🧪 TESTAR APLICAÇÃO

### 1. Testar Localmente na VM
```bash
curl http://localhost:3002/api
```

### 2. Testar Externamente
```bash
# Do seu computador local
curl http://129.148.62.240:3002/api
```

### 3. Testar no Navegador
```
http://129.148.62.240:3002
```

---

## 📊 MONITORAMENTO

### Ver Logs em Tempo Real
```bash
# Com PM2
pm2 logs agrogest

# Com Docker
docker-compose logs -f

# Logs do sistema
sudo journalctl -u docker -f
```

### Verificar Status
```bash
# PM2
pm2 status

# Docker
docker-compose ps

# Processos
ps aux | grep node
```

### Verificar Portas
```bash
sudo netstat -tulpn | grep 3002
```

---

## 🔄 ATUALIZAR APLICAÇÃO

### 1. Pull das Mudanças
```bash
cd ~/projects/rebanhodigital
git pull origin main
```

### 2. Instalar Novas Dependências
```bash
pnpm install
```

### 3. Rebuild Frontend
```bash
pnpm build
```

### 4. Reiniciar Aplicação
```bash
# Com PM2
pm2 restart agrogest

# Com Docker
docker-compose restart

# Manual
# Ctrl+C e depois npm start-backend
```

---

## 🛡️ SEGURANÇA

### 1. Configurar HTTPS (Recomendado)
```bash
# Instalar Certbot
sudo yum install certbot -y

# Obter certificado (substitua seu-dominio.com)
sudo certbot certonly --standalone -d seu-dominio.com

# Certificados estarão em:
# /etc/letsencrypt/live/seu-dominio.com/
```

### 2. Configurar Nginx como Reverse Proxy
```bash
# Instalar Nginx
sudo yum install nginx -y

# Configurar
sudo nano /etc/nginx/conf.d/agrogest.conf
```

**Configuração Nginx:**
```nginx
server {
    listen 80;
    server_name 129.148.62.240;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx
```

---

## 🔧 TROUBLESHOOTING

### Problema: Porta 3002 não acessível
```bash
# Verificar se está rodando
sudo netstat -tulpn | grep 3002

# Verificar firewall
sudo firewall-cmd --list-all

# Verificar logs
pm2 logs agrogest
```

### Problema: Erro de permissão
```bash
# Dar permissões corretas
sudo chown -R $USER:$USER ~/projects/rebanhodigital
chmod -R 755 ~/projects/rebanhodigital
```

### Problema: Falta de memória
```bash
# Verificar memória
free -h

# Criar swap (se necessário)
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📝 COMANDOS ÚTEIS

### Git
```bash
git status
git pull
git log --oneline -10
```

### PM2
```bash
pm2 list
pm2 restart agrogest
pm2 stop agrogest
pm2 delete agrogest
pm2 logs agrogest --lines 100
```

### Docker
```bash
docker ps
docker-compose up -d
docker-compose down
docker-compose logs -f
docker system prune -a
```

### Sistema
```bash
# Uso de disco
df -h

# Uso de memória
free -h

# Processos
top
htop

# Reiniciar VM
sudo reboot
```

---

## 🎯 CHECKLIST DE DEPLOY

- [ ] VM atualizada
- [ ] Git instalado
- [ ] Node.js 18+ instalado
- [ ] pnpm instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] .env configurado
- [ ] Secrets gerados
- [ ] Firewall configurado (VM)
- [ ] Security List configurado (Oracle Cloud)
- [ ] Aplicação iniciada
- [ ] Testes realizados
- [ ] PM2 configurado
- [ ] Nginx configurado (opcional)
- [ ] HTTPS configurado (opcional)

---

## 📞 SUPORTE

### Logs Importantes
```bash
# Logs da aplicação
pm2 logs agrogest

# Logs do sistema
sudo journalctl -xe

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Informações do Sistema
```bash
# Versões
node --version
npm --version
pnpm --version
docker --version

# IP público
curl ifconfig.me

# Portas abertas
sudo netstat -tulpn
```

---

## 🎉 CONCLUSÃO

Após seguir este guia, sua aplicação estará rodando em:
- **URL:** http://129.148.62.240:3002
- **API:** http://129.148.62.240:3002/api

**Próximos Passos:**
1. Configurar domínio próprio
2. Configurar HTTPS
3. Configurar backup automático
4. Configurar monitoramento

---

**Última Atualização:** 05/02/2026  
**VM:** Oracle Cloud - 129.148.62.240