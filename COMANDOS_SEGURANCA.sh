#!/bin/bash

# ============================================================================
# SCRIPT DE IMPLEMENTAÇÃO DE SEGURANÇA - AGROGEST
# ============================================================================
# Este script automatiza a implementação das correções de segurança
# Execute: bash COMANDOS_SEGURANCA.sh
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

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado!"
    exit 1
fi
print_success "Node.js instalado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado!"
    exit 1
fi
print_success "npm instalado: $(npm --version)"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto (onde está o package.json)"
    exit 1
fi
print_success "Diretório correto"

# ============================================================================
# FASE 2: BACKUP
# ============================================================================

print_header "FASE 2: CRIANDO BACKUP"

# Criar diretório de backup
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup de arquivos importantes
if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/.env.backup"
    print_success "Backup do .env criado"
fi

if [ -f "api/app.js" ]; then
    cp api/app.js "$BACKUP_DIR/app.js.backup"
    print_success "Backup do app.js criado"
fi

print_success "Backup criado em: $BACKUP_DIR"

# ============================================================================
# FASE 3: INSTALAR DEPENDÊNCIAS DE SEGURANÇA
# ============================================================================

print_header "FASE 3: INSTALANDO DEPENDÊNCIAS DE SEGURANÇA"

print_info "Instalando: helmet, express-rate-limit, express-mongo-sanitize, xss-clean, hpp, joi"

npm install helmet express-rate-limit express-mongo-sanitize xss-clean hpp joi

print_success "Dependências de segurança instaladas"

# ============================================================================
# FASE 4: GERAR SECRETS
# ============================================================================

print_header "FASE 4: GERANDO SECRETS SEGUROS"

# Executar script de setup
if [ -f "scripts/setup-security.js" ]; then
    node scripts/setup-security.js
else
    print_warning "Script setup-security.js não encontrado"
    print_info "Gerando secrets manualmente..."
    
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    echo -e "\n${GREEN}Secrets gerados:${NC}"
    echo -e "${YELLOW}JWT_SECRET=$JWT_SECRET${NC}"
    echo -e "${YELLOW}JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET${NC}"
    echo -e "\n${BLUE}Adicione estes valores ao seu arquivo .env${NC}\n"
fi

# ============================================================================
# FASE 5: VERIFICAR .GITIGNORE
# ============================================================================

print_header "FASE 5: VERIFICANDO .GITIGNORE"

if [ -f ".gitignore" ]; then
    if grep -q "^\.env$" .gitignore; then
        print_success ".env já está no .gitignore"
    else
        echo ".env" >> .gitignore
        print_success ".env adicionado ao .gitignore"
    fi
else
    echo ".env" > .gitignore
    print_success ".gitignore criado com .env"
fi

# Verificar se .env está no Git
if git ls-files --error-unmatch .env &> /dev/null; then
    print_warning ".env está rastreado pelo Git!"
    print_info "Execute: git rm --cached .env"
    print_info "Depois: git commit -m 'Remove .env do repositório'"
else
    print_success ".env não está rastreado pelo Git"
fi

# ============================================================================
# FASE 6: VERIFICAR VULNERABILIDADES
# ============================================================================

print_header "FASE 6: VERIFICANDO VULNERABILIDADES"

print_info "Executando npm audit..."
npm audit || print_warning "Vulnerabilidades encontradas - execute 'npm audit fix'"

# ============================================================================
# FASE 7: VALIDAR CONFIGURAÇÃO
# ============================================================================

print_header "FASE 7: VALIDANDO CONFIGURAÇÃO"

# Verificar se .env existe
if [ -f ".env" ]; then
    print_success "Arquivo .env encontrado"
    
    # Verificar JWT_SECRET
    if grep -q "JWT_SECRET=" .env; then
        JWT_SECRET_VALUE=$(grep "JWT_SECRET=" .env | cut -d '=' -f2)
        JWT_SECRET_LENGTH=${#JWT_SECRET_VALUE}
        
        if [ $JWT_SECRET_LENGTH -ge 32 ]; then
            print_success "JWT_SECRET tem comprimento adequado ($JWT_SECRET_LENGTH caracteres)"
        else
            print_error "JWT_SECRET muito curto ($JWT_SECRET_LENGTH caracteres) - mínimo 32"
        fi
        
        if [[ $JWT_SECRET_VALUE == *"SEGREDO"* ]] || [[ $JWT_SECRET_VALUE == *"123456"* ]]; then
            print_error "JWT_SECRET parece ser um valor de exemplo - TROQUE IMEDIATAMENTE!"
        fi
    else
        print_error "JWT_SECRET não encontrado no .env"
    fi
    
    # Verificar MONGODB_URI
    if grep -q "MONGODB_URI=" .env; then
        print_success "MONGODB_URI configurado"
    else
        print_warning "MONGODB_URI não encontrado no .env"
    fi
else
    print_error "Arquivo .env não encontrado!"
    print_info "Copie .env.example para .env e configure as variáveis"
fi

# ============================================================================
# FASE 8: TESTES DE SEGURANÇA
# ============================================================================

print_header "FASE 8: PREPARANDO TESTES"

print_info "Para testar a segurança após iniciar o servidor, execute:"
echo -e "${YELLOW}"
echo "# Testar rate limiting"
echo "for i in {1..10}; do curl -X POST http://localhost:3002/api/login -H 'Content-Type: application/json' -d '{\"email\":\"teste@teste.com\",\"password\":\"123\"}'; echo; done"
echo ""
echo "# Verificar headers de segurança"
echo "curl -I http://localhost:3002/api"
echo ""
echo "# Testar validação de senha fraca"
echo "curl -X POST http://localhost:3002/api/users -H 'Content-Type: application/json' -d '{\"name\":\"Teste\",\"email\":\"teste@teste.com\",\"password\":\"123\",\"phone\":\"(11) 99999-9999\"}'"
echo -e "${NC}"

# ============================================================================
# FASE 9: RELATÓRIO FINAL
# ============================================================================

print_header "RELATÓRIO FINAL"

echo -e "${GREEN}✓ Dependências de segurança instaladas${NC}"
echo -e "${GREEN}✓ Secrets gerados${NC}"
echo -e "${GREEN}✓ .gitignore configurado${NC}"
echo -e "${GREEN}✓ Backup criado em: $BACKUP_DIR${NC}"

echo -e "\n${BLUE}PRÓXIMOS PASSOS:${NC}"
echo -e "${YELLOW}1.${NC} Copie os secrets gerados para o arquivo .env"
echo -e "${YELLOW}2.${NC} Verifique se o .env não está no Git: ${BLUE}git status${NC}"
echo -e "${YELLOW}3.${NC} Se estiver, remova: ${BLUE}git rm --cached .env${NC}"
echo -e "${YELLOW}4.${NC} Habilite os middlewares de segurança em api/app.js"
echo -e "${YELLOW}5.${NC} Inicie o servidor: ${BLUE}npm run start-backend${NC}"
echo -e "${YELLOW}6.${NC} Execute os testes de segurança"

echo -e "\n${BLUE}DOCUMENTAÇÃO:${NC}"
echo -e "• Análise completa: ${GREEN}ANALISE_SEGURANCA_COMPLETA.md${NC}"
echo -e "• Guia de implementação: ${GREEN}SOLUCAO_SEGURANCA.md${NC}"
echo -e "• Resumo visual: ${GREEN}SEGURANCA_RESUMO_VISUAL.md${NC}"
echo -e "• Checklist: ${GREEN}SECURITY_CHECKLIST.md${NC}"

echo -e "\n${GREEN}✅ Script concluído com sucesso!${NC}\n"