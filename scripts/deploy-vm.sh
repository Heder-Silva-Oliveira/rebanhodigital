#!/bin/bash

# ============================================================================
# SCRIPT DE DEPLOY AUTOMATIZADO - AGROGEST VM
# ============================================================================
# Este script automatiza o deploy na VM Oracle Cloud
# Execute: bash scripts/deploy-vm.sh
# ============================================================================

set -e  # Parar em caso de erro

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# FASE 1: VERIFICAÇÕES INICIAIS
# ============================================================================

print_header "FASE 1: VERIFICAÇÕES INICIAIS"

# Verificar se está na VM
if [ ! -f "/etc/oracle-cloud-agent/agent.conf" ]; then
    print_warning "Este script deve ser executado na VM Oracle Cloud"
    print_info "Conecte-se à VM primeiro: ssh -i sua-chave.key opc@129.148.62.240"
fi

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    print_info "Instalando Git..."
    sudo yum install git -y
fi
print_success "Git instalado: $(git --version)"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_info "Instalando Node.js 18..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install nodejs -y
fi
print_success "Node.js instalado: $(node --version)"

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    print_info "Instalando pnpm..."
    npm install -g pnpm
fi
print_success "pnpm instalado: $(pnpm --version)"

# ============================================================================
# FASE 2: CLONAR/ATUALIZAR REPOSITÓRIO
# ============================================================================

print_header "FASE 2: CLONAR/ATUALIZAR REPOSITÓRIO"

REPO_URL="https://github.com/Heder-Silva-Oliveira/rebanhodigital.git"
PROJECT_DIR="$HOME/projects/rebanhodigital"

if [ -d "$PROJECT_DIR" ]; then
    print_info "Repositório já existe. Atualizando..."
    cd "$PROJECT_DIR"
    git pull origin main
    print_success "Repositório atualizado"
else
    print_info "Clonando repositório..."
    mkdir -p "$HOME/projects"
    cd "$HOME/projects"
    git clone "$REPO_URL"
    cd rebanhodigital
    print_success "Repositório clonado"
fi

# ============================================================================
# FASE 3: INSTALAR DEPENDÊNCIAS
# ============================================================================

print_header "FASE 3: INSTALAR DEPENDÊNCIAS"

cd "$PROJECT_DIR"

print_info "Instalando dependências com pnpm..."
pnpm install

print_success "Dependências instaladas"

# ============================================================================
# FASE 4: CONFIGURAR AMBIENTE
# ============================================================================

print_header "FASE 4: CONFIGURAR AMBIENTE"

if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado"
    
    if [ -f ".env.example" ]; then
        print_info "Criando .env a partir do .env.example..."
        cp .env.example .env
        
        print_warning "IMPORTANTE: Edite o arquivo .env com suas configurações:"
        print_info "nano .env"
        print_info ""
        print_info "Configure:"
        print_info "  - MONGODB_URI (suas credenciais)"
        print_info "  - JWT_SECRET (gere um novo)"
        print_info "  - JWT_REFRESH_SECRET (gere um novo)"
        print_info "  - EMAIL_USERNAME e EMAIL_PASSWORD"
        print_info ""
        print_info "Para gerar secrets:"
        print_info "  node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
        
        read -p "Pressione ENTER após configurar o .env..."
    else
        print_error ".env.example não encontrado!"
        exit 1
    fi
else
    print_success "Arquivo .env encontrado"
fi

# ============================================================================
# FASE 5: BUILD DO FRONTEND
# ============================================================================

print_header "FASE 5: BUILD DO FRONTEND"

print_info "Executando build do frontend..."
pnpm build

print_success "Build concluído"

# ============================================================================
# FASE 6: CONFIGURAR FIREWALL
# ============================================================================

print_header "FASE 6: CONFIGURAR FIREWALL"

print_info "Configurando firewall..."

# Porta 3002 (API)
sudo firewall-cmd --permanent --add-port=3002/tcp 2>/dev/null || true

# Porta 80 (HTTP)
sudo firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true

# Porta 443 (HTTPS)
sudo firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true

# Recarregar firewall
sudo firewall-cmd --reload 2>/dev/null || true

print_success "Firewall configurado"

print_warning "LEMBRE-SE: Configure também o Security List no Oracle Cloud!"
print_info "Acesse: https://cloud.oracle.com → Networking → Security Lists"
print_info "Adicione Ingress Rules para as portas 3002, 80 e 443"

# ============================================================================
# FASE 7: INSTALAR PM2
# ============================================================================

print_header "FASE 7: INSTALAR PM2"

if ! command -v pm2 &> /dev/null; then
    print_info "Instalando PM2..."
    npm install -g pm2
fi
print_success "PM2 instalado: $(pm2 --version)"

# ============================================================================
# FASE 8: INICIAR APLICAÇÃO
# ============================================================================

print_header "FASE 8: INICIAR APLICAÇÃO"

# Parar aplicação se estiver rodando
pm2 stop agrogest 2>/dev/null || true
pm2 delete agrogest 2>/dev/null || true

# Iniciar com PM2
print_info "Iniciando aplicação com PM2..."
pm2 start api/server.js --name agrogest

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup | tail -1 | sudo bash || true

print_success "Aplicação iniciada"

# ============================================================================
# FASE 9: VERIFICAR STATUS
# ============================================================================

print_header "FASE 9: VERIFICAR STATUS"

# Aguardar alguns segundos
sleep 3

# Verificar status
pm2 status

# Testar endpoint
print_info "Testando endpoint..."
sleep 2

if curl -s http://localhost:3002/api > /dev/null; then
    print_success "API respondendo em http://localhost:3002/api"
else
    print_error "API não está respondendo"
    print_info "Verifique os logs: pm2 logs agrogest"
fi

# ============================================================================
# FASE 10: INFORMAÇÕES FINAIS
# ============================================================================

print_header "INFORMAÇÕES FINAIS"

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me)

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}\n"

echo -e "${BLUE}URLs de Acesso:${NC}"
echo -e "  • Local: http://localhost:3002"
echo -e "  • Público: http://$PUBLIC_IP:3002"
echo -e "  • API: http://$PUBLIC_IP:3002/api"

echo -e "\n${BLUE}Comandos Úteis:${NC}"
echo -e "  • Ver status: ${YELLOW}pm2 status${NC}"
echo -e "  • Ver logs: ${YELLOW}pm2 logs agrogest${NC}"
echo -e "  • Reiniciar: ${YELLOW}pm2 restart agrogest${NC}"
echo -e "  • Parar: ${YELLOW}pm2 stop agrogest${NC}"

echo -e "\n${BLUE}Próximos Passos:${NC}"
echo -e "  1. Configure o Security List no Oracle Cloud"
echo -e "  2. Teste o acesso: http://$PUBLIC_IP:3002"
echo -e "  3. Configure um domínio (opcional)"
echo -e "  4. Configure HTTPS (recomendado)"

echo -e "\n${BLUE}Documentação:${NC}"
echo -e "  • Guia completo: doc_md/GUIA_DEPLOY_VM.md"
echo -e "  • Troubleshooting: doc_md/GUIA_DEPLOY_VM.md#troubleshooting"

echo -e "\n${GREEN}🎉 Aplicação rodando!${NC}\n"