# 🐳 Guia Docker - AgroGest

## 📋 Visão Geral

Este guia contém todas as instruções para executar o AgroGest usando Docker, incluindo configurações para desenvolvimento e produção.

## 🏗️ Arquivos Docker Criados

```
├── Dockerfile              # Imagem de produção (multi-stage)
├── Dockerfile.dev          # Imagem de desenvolvimento
├── docker-compose.yml      # Produção com MongoDB
├── docker-compose.dev.yml  # Desenvolvimento com hot-reload
├── .dockerignore           # Arquivos ignorados pelo Docker
└── scripts/
    └── init-mongo.js       # Script de inicialização do MongoDB
```

---

## 🚀 Execução Rápida (Produção)

### **Pré-requisitos**
- Docker instalado
- Docker Compose instalado

### **Comando Único**
```bash
# Clonar e executar
git clone <seu-repo>
cd agrogest2
docker-compose up -d
```

### **Acessar a Aplicação**
- **Frontend + Backend**: http://localhost:3002
- **MongoDB Express**: http://localhost:8081 (admin/admin123)

---

## 🔧 Configuração Detalhada

### **1. Instalar Docker**

**Windows:**
```bash
# Baixar Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Verificar instalação
docker --version
docker-compose --version
```

**Linux (Ubuntu):**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **2. Preparar o Projeto**

```bash
# Navegar para o diretório do projeto
cd agrogest2

# Verificar se todos os arquivos Docker estão presentes
ls -la Dockerfile docker-compose.yml
```

---

## 🏭 Modo Produção

### **Executar com Docker Compose**

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f agrogest
```

### **Serviços Incluídos**

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| agrogest | 3002 | Aplicação principal (Frontend + Backend) |
| mongo | 27017 | MongoDB |
| mongo-express | 8081 | Interface web do MongoDB |

### **Comandos Úteis**

```bash
# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reconstruir imagens
docker-compose up --build -d

# Ver logs de um serviço específico
docker-compose logs -f agrogest

# Executar comando dentro do container
docker-compose exec agrogest sh
```

---

## 🛠️ Modo Desenvolvimento

### **Executar Ambiente de Desenvolvimento**

```bash
# Usar arquivo de desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### **Características do Modo Dev**

- ✅ **Hot Reload**: Mudanças no código são refletidas automaticamente
- ✅ **Volume Mapping**: Código local sincronizado com container
- ✅ **Portas Separadas**: Frontend (5173) e Backend (3002)
- ✅ **MongoDB Separado**: Porta 27018 para não conflitar

### **Acessar em Desenvolvimento**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002
- **MongoDB Express**: http://localhost:8082

---

## 🔨 Build Manual da Imagem

### **Build da Imagem**

```bash
# Build da imagem de produção
docker build -t agrogest:latest .

# Build da imagem de desenvolvimento
docker build -f Dockerfile.dev -t agrogest:dev .

# Ver imagens criadas
docker images | grep agrogest
```

### **Executar Container Individual**

```bash
# Executar apenas a aplicação (sem MongoDB)
docker run -p 3002:3002 \
  -e MONGODB_URI="sua_string_mongodb" \
  -e JWT_SECRET="seu_jwt_secret" \
  agrogest:latest

# Executar em modo interativo
docker run -it -p 3002:3002 agrogest:latest sh
```

---

## 🗄️ Configuração do MongoDB

### **Dados de Acesso**

```bash
# MongoDB (Container)
Host: mongo (interno) / localhost (externo)
Porta: 27017
Database: agrogest
Usuário: agrogest_user
Senha: agrogest_password_123

# MongoDB Express
URL: http://localhost:8081
Usuário: admin
Senha: admin123
```

### **Conectar via MongoDB Compass**

```
mongodb://agrogest_user:agrogest_password_123@localhost:27017/agrogest
```

### **Backup e Restore**

```bash
# Backup
docker-compose exec mongo mongodump --db agrogest --out /data/backup

# Restore
docker-compose exec mongo mongorestore --db agrogest /data/backup/agrogest
```

---

## 🔧 Variáveis de Ambiente

### **Produção (docker-compose.yml)**

```yaml
environment:
  - NODE_ENV=production
  - PORT=3002
  - MONGODB_URI=mongodb://mongo:27017/agrogest
  - JWT_SECRET=MEU_SEGREDO_DOCKER_MUITO_SEGURO_123456
  - FRONTEND_URL=http://localhost:3002
  - BACKEND_URL=http://localhost:3002
```

### **Desenvolvimento (docker-compose.dev.yml)**

```yaml
environment:
  - NODE_ENV=development
  - VITE_API_URL=http://localhost:3002
  - PORT=3002
  - MONGODB_URI=mongodb://mongo-dev:27017/agrogest_dev
```

### **Personalizar Variáveis**

Crie um arquivo `.env.docker`:

```bash
# .env.docker
MONGODB_URI=mongodb://seu_mongo_externo:27017/agrogest
JWT_SECRET=seu_jwt_secret_personalizado
EMAIL_USERNAME=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_app
TWILIO_ACCOUNT_SID=seu_twilio_sid
TWILIO_AUTH_TOKEN=seu_twilio_token
```

Então use:
```bash
docker-compose --env-file .env.docker up -d
```

---

## 📊 Monitoramento e Logs

### **Ver Logs**

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f agrogest
docker-compose logs -f mongo

# Últimas 100 linhas
docker-compose logs --tail=100 agrogest
```

### **Monitorar Recursos**

```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Informações detalhadas
docker-compose exec agrogest ps aux
```

### **Health Check**

```bash
# Verificar saúde da aplicação
curl http://localhost:3002/api

# Health check interno do Docker
docker-compose exec agrogest wget -qO- http://localhost:3002/api
```

---

## 🔒 Segurança

### **Configurações de Segurança**

1. **Usuário não-root** no container
2. **Secrets** via variáveis de ambiente
3. **Network isolation** entre serviços
4. **Volume permissions** configuradas

### **Alterar Senhas Padrão**

```bash
# MongoDB
MONGO_INITDB_ROOT_PASSWORD=sua_senha_forte

# MongoDB Express
ME_CONFIG_BASICAUTH_PASSWORD=sua_senha_admin

# JWT
JWT_SECRET=seu_jwt_secret_muito_forte_e_longo
```

---

## 🚀 Deploy em Produção

### **Docker Swarm**

```bash
# Inicializar swarm
docker swarm init

# Deploy
docker stack deploy -c docker-compose.yml agrogest-stack
```

### **Kubernetes**

```bash
# Converter docker-compose para k8s
kompose convert -f docker-compose.yml

# Aplicar
kubectl apply -f .
```

### **Cloud Providers**

- **AWS**: ECS, EKS, Elastic Beanstalk
- **Google Cloud**: Cloud Run, GKE
- **Azure**: Container Instances, AKS
- **DigitalOcean**: App Platform, Kubernetes

---

## 🧹 Limpeza e Manutenção

### **Limpar Recursos**

```bash
# Parar e remover containers
docker-compose down

# Remover volumes também
docker-compose down -v

# Limpar imagens não utilizadas
docker image prune -a

# Limpar tudo (cuidado!)
docker system prune -a --volumes
```

### **Atualizar Imagens**

```bash
# Baixar imagens mais recentes
docker-compose pull

# Reconstruir e reiniciar
docker-compose up --build -d
```

---

## 🐛 Troubleshooting

### **Problemas Comuns**

**1. Porta já em uso**
```bash
# Verificar processos na porta
netstat -tulpn | grep :3002

# Alterar porta no docker-compose.yml
ports:
  - "3003:3002"
```

**2. Erro de permissão**
```bash
# Linux: adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

**3. Container não inicia**
```bash
# Ver logs detalhados
docker-compose logs agrogest

# Executar em modo interativo
docker-compose run --rm agrogest sh
```

**4. MongoDB não conecta**
```bash
# Verificar se o MongoDB está rodando
docker-compose ps mongo

# Testar conexão
docker-compose exec agrogest ping mongo
```

### **Debug Avançado**

```bash
# Entrar no container
docker-compose exec agrogest sh

# Ver variáveis de ambiente
docker-compose exec agrogest env

# Verificar arquivos
docker-compose exec agrogest ls -la /app

# Testar conectividade
docker-compose exec agrogest wget -qO- http://mongo:27017
```

---

## 📋 Scripts Úteis

### **Scripts NPM Adicionados**

```bash
# Build da imagem
npm run docker:build

# Executar produção
npm run docker:up

# Parar produção
npm run docker:down

# Executar desenvolvimento
npm run docker:dev

# Ver logs
npm run docker:logs

# Limpeza
npm run docker:clean
```

---

## ✅ Checklist de Deploy

- [ ] Docker e Docker Compose instalados
- [ ] Arquivos Docker criados
- [ ] Variáveis de ambiente configuradas
- [ ] Portas disponíveis (3002, 27017, 8081)
- [ ] `docker-compose up -d` executado com sucesso
- [ ] Aplicação acessível em http://localhost:3002
- [ ] MongoDB conectado e funcionando
- [ ] Logs sem erros críticos

---

**🎉 Seu AgroGest está rodando no Docker!**

Para suporte adicional, verifique os logs e consulte a documentação do Docker.