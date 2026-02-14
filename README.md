# 🐄 AgroGest - Sistema de Gestão Pecuária

Sistema completo de gestão para propriedades rurais com foco em pecuária.

---

## 📚 Documentação

Toda a documentação do projeto está organizada na pasta **`doc_md/`**

### 🚀 Início Rápido

1. **[START_HERE.md](doc_md/START_HERE.md)** - Comece aqui! Ponto de partida para o projeto
2. **[README_SEGURANCA.md](doc_md/README_SEGURANCA.md)** - Guia rápido de segurança (5 min)

### 🔒 Documentação de Segurança

#### Para Gestores
- **[RESUMO_EXECUTIVO_SEGURANCA.md](doc_md/RESUMO_EXECUTIVO_SEGURANCA.md)** - Análise executiva, ROI e impacto
- **[SEGURANCA_RESUMO_VISUAL.md](doc_md/SEGURANCA_RESUMO_VISUAL.md)** - Dashboard visual

#### Para Desenvolvedores
- **[ANALISE_SEGURANCA_COMPLETA.md](doc_md/ANALISE_SEGURANCA_COMPLETA.md)** - Análise técnica detalhada
- **[SOLUCAO_SEGURANCA.md](doc_md/SOLUCAO_SEGURANCA.md)** - Guia de implementação passo a passo
- **[IMPLEMENTACAO_CONCLUIDA.md](doc_md/IMPLEMENTACAO_CONCLUIDA.md)** - Status da implementação
- **[SECURITY_CHECKLIST.md](doc_md/SECURITY_CHECKLIST.md)** - Checklist de segurança
- **[SECURITY_DEPENDENCIES.md](doc_md/SECURITY_DEPENDENCIES.md)** - Dependências necessárias

#### Índice e Navegação
- **[INDICE_SEGURANCA.md](doc_md/INDICE_SEGURANCA.md)** - Índice completo de toda documentação

### 🐳 Documentação Docker

- **[GUIA_DOCKER.md](doc_md/GUIA_DOCKER.md)** - Guia completo de Docker
- **[DOCKER_SUCESSO.md](doc_md/DOCKER_SUCESSO.md)** - Implementação bem-sucedida

### 🏗️ Arquitetura e Design

- **[GUIA_DESIGN_ARQUITETURA.md](doc_md/GUIA_DESIGN_ARQUITETURA.md)** - Arquitetura do sistema
- **[ANALISE_PROJETO.md](doc_md/ANALISE_PROJETO.md)** - Análise geral do projeto

### 🔧 Resolução de Problemas

- **[PROBLEMA_RESOLVIDO.md](doc_md/PROBLEMA_RESOLVIDO.md)** - Problemas resolvidos

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- MongoDB
- pnpm (gerenciador de pacotes)

### Instalação

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd agrogest2

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Iniciar em desenvolvimento
pnpm dev                    # Frontend (Vite)
pnpm start-backend          # Backend (Express)
```

### Com Docker

```bash
# Desenvolvimento
pnpm docker:dev

# Produção
pnpm docker:up
```

---

## 🔒 Segurança

**Status Atual:** Nível 7/10 (BOM)

### Implementações de Segurança
- ✅ JWT com secrets fortes (128 caracteres)
- ✅ Rate limiting configurado
- ✅ Headers de segurança (Helmet)
- ✅ Proteção contra XSS, CSRF, NoSQL Injection
- ✅ Validação de entrada com Joi
- ✅ Upload seguro de arquivos
- ✅ CORS restritivo

### Próximos Passos
Consulte **[IMPLEMENTACAO_CONCLUIDA.md](doc_md/IMPLEMENTACAO_CONCLUIDA.md)** para detalhes.

---

## 📦 Tecnologias

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Query

### Backend
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer
- Twilio (WhatsApp)

### DevOps
- Docker
- Docker Compose
- pnpm

---

## 📂 Estrutura do Projeto

```
agrogest2/
├── api/                    # Backend (Express)
│   ├── auth/              # Autenticação
│   ├── config/            # Configurações
│   ├── controllers/       # Controllers
│   ├── middlewares/       # Middlewares
│   ├── models/            # Models (Mongoose)
│   ├── routes/            # Rotas
│   ├── services/          # Serviços
│   └── validators/        # Validadores
├── src/                   # Frontend (React)
│   ├── components/        # Componentes
│   ├── pages/             # Páginas
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utilitários
├── doc_md/                # 📚 Documentação
├── scripts/               # Scripts utilitários
└── public/                # Arquivos públicos
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                    # Inicia frontend (Vite)
pnpm start-backend          # Inicia backend (Express)

# Build
pnpm build                  # Build de produção
pnpm build:dev              # Build de desenvolvimento

# Docker
pnpm docker:up              # Inicia containers (produção)
pnpm docker:down            # Para containers
pnpm docker:dev             # Inicia containers (desenvolvimento)
pnpm docker:logs            # Ver logs

# Segurança
node scripts/setup-security.js  # Configurar segurança
bash COMANDOS_SEGURANCA.sh      # Script automatizado

# Linting
pnpm lint                   # Executar ESLint
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

Para dúvidas e suporte:
- 📧 Email: suporte@rebanhodigital.com
- 📚 Documentação: [doc_md/](doc_md/)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/agrogest2/issues)

---

## 🎯 Roadmap

- [x] Sistema de autenticação
- [x] Gestão de animais
- [x] Gestão financeira
- [x] Gestão de pastagens
- [x] Sistema de notificações
- [x] Implementação de segurança
- [ ] Aplicar rate limiting em rotas
- [ ] Implementar refresh tokens
- [ ] Adicionar 2FA
- [ ] Testes automatizados
- [ ] CI/CD

---

**Desenvolvido com ❤️ para o agronegócio brasileiro**