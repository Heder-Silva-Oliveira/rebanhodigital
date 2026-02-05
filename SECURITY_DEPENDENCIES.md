# Dependências de Segurança Necessárias

Execute os comandos abaixo para instalar as dependências de segurança:

```bash
# Dependências de produção
npm install helmet express-rate-limit express-mongo-sanitize xss-clean hpp joi bcryptjs

# Dependências de desenvolvimento
npm install --save-dev @types/bcryptjs @types/joi
```

## Dependências Instaladas:

### Produção:
- **helmet**: Headers de segurança HTTP
- **express-rate-limit**: Rate limiting
- **express-mongo-sanitize**: Proteção contra NoSQL injection
- **xss-clean**: Proteção contra XSS
- **hpp**: Proteção contra HTTP Parameter Pollution
- **joi**: Validação de dados de entrada
- **bcryptjs**: Hash de senhas (já instalado)

### Desenvolvimento:
- **@types/bcryptjs**: Tipos TypeScript para bcryptjs
- **@types/joi**: Tipos TypeScript para joi

## Configuração no package.json:

Adicione os scripts de segurança:

```json
{
  "scripts": {
    "security:audit": "npm audit",
    "security:fix": "npm audit fix",
    "security:check": "npm audit --audit-level moderate"
  }
}
```