# 🔧 Troubleshooting - Página de Usuários

## ❓ Problema: Não consigo ver a página de usuários

### ✅ Checklist de Verificação

#### 1. Verificar se você está logado como ADMIN

A página de usuários só é visível para usuários com `role: 'admin'`.

**Como verificar:**
1. Acesse a URL: `http://localhost:5173/test-auth`
2. Verifique se aparece "✅ SIM - Pode ver menu Usuários"
3. Se aparecer "❌ NÃO", você precisa:
   - Fazer login com um usuário admin
   - OU atualizar seu usuário no banco para role: 'admin'

**Atualizar usuário para admin no MongoDB:**
```javascript
// No MongoDB Compass ou mongosh
db.users.updateOne(
  { email: "seu-email@exemplo.com" },
  { $set: { role: "admin" } }
)
```

#### 2. Verificar se o plano permite múltiplos usuários

**Planos que permitem cadastrar usuários:**
- ❌ Básico: Não permite (apenas 1 usuário)
- ✅ Pro: Permite até 5 usuários
- ✅ Enterprise: Usuários ilimitados

**Como verificar seu plano:**
1. Acesse: `http://localhost:5173/test-auth`
2. Veja o campo "Plano"

**Atualizar plano no MongoDB:**
```javascript
db.users.updateOne(
  { email: "seu-email@exemplo.com" },
  { $set: { plan: "pro" } }
)
```

#### 3. Verificar se o menu está aparecendo

O item "Usuários" deve aparecer no menu lateral esquerdo (Sidebar).

**Se não aparecer:**
1. Verifique se você é admin (passo 1)
2. Verifique se o plano é Pro ou Enterprise (passo 2)
3. Abra o console do navegador (F12) e procure por erros
4. Faça logout e login novamente

#### 4. Acessar diretamente pela URL

Mesmo que o menu não apareça, tente acessar diretamente:
```
http://localhost:5173/usuarios
```

**Possíveis resultados:**
- ✅ Página carrega: O problema é no Sidebar
- ❌ "Acesso negado": Você não é admin
- ❌ Erro 404: A rota não foi registrada
- ❌ Tela branca: Erro no componente

#### 5. Verificar erros no console

Abra o console do navegador (F12) e procure por:
- Erros de importação
- Erros de API
- Erros de autenticação
- Warnings do React

#### 6. Verificar se o backend está rodando

**Teste o endpoint:**
```bash
# Windows CMD
curl http://localhost:3002/api/users -H "Authorization: Bearer SEU_TOKEN"

# Ou no navegador (com extensão REST Client)
GET http://localhost:3002/api/users
Authorization: Bearer SEU_TOKEN
```

**Resposta esperada:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "...",
      "name": "...",
      "role": "admin",
      ...
    }
  ]
}
```

#### 7. Limpar cache e fazer logout/login

Às vezes o problema é cache do navegador:

1. Faça logout
2. Limpe o localStorage:
   - Abra o console (F12)
   - Digite: `localStorage.clear()`
   - Pressione Enter
3. Recarregue a página (Ctrl+F5)
4. Faça login novamente

---

## 🐛 Erros Comuns

### Erro: "Acesso negado. Apenas administradores..."

**Causa:** Você não é admin
**Solução:** Atualize seu role no banco de dados (ver passo 1)

### Erro: "Limite de usuários atingido"

**Causa:** Seu plano não permite mais usuários
**Solução:** Faça upgrade do plano (ver passo 2)

### Erro: "Cannot read property 'role' of null"

**Causa:** Usuário não está carregado no contexto
**Solução:** 
1. Verifique se está logado
2. Faça logout e login novamente
3. Verifique o console para erros de autenticação

### Menu "Usuários" não aparece

**Causa:** Filtro do Sidebar está bloqueando
**Solução:**
1. Verifique se é admin
2. Verifique se o plano é Pro ou Enterprise
3. Acesse diretamente pela URL: `/usuarios`

---

## 🔍 Debug Avançado

### Verificar estado do React

No console do navegador:
```javascript
// Verificar localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Verificar se o componente está montado
// (Instale React DevTools)
```

### Verificar requisições de rede

1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Filtre por "XHR" ou "Fetch"
4. Tente acessar a página de usuários
5. Veja se a requisição para `/api/users` foi feita
6. Verifique o status code e a resposta

### Verificar rotas do React Router

No console:
```javascript
// Ver todas as rotas registradas
// (Requer React Router DevTools)
```

---

## 📞 Ainda não funciona?

Se após todos os passos acima ainda não funcionar:

1. **Compartilhe os logs:**
   - Console do navegador (F12 > Console)
   - Network tab (F12 > Network)
   - Resultado de `/test-auth`

2. **Verifique os arquivos:**
   - `src/pages/Users.tsx` existe?
   - `src/App.tsx` tem a rota `/usuarios`?
   - `src/components/Sidebar.tsx` tem o item "Usuários"?

3. **Reinicie tudo:**
   ```bash
   # Parar o frontend
   Ctrl+C
   
   # Limpar cache do npm/pnpm
   pnpm store prune
   
   # Reinstalar dependências
   pnpm install
   
   # Iniciar novamente
   pnpm dev
   ```

4. **Verifique o backend:**
   ```bash
   # Verificar se está rodando
   curl http://localhost:3002/api
   
   # Deve retornar:
   # {"message":"🚀 Servidor AgroGest funcionando!","timestamp":"..."}
   ```
