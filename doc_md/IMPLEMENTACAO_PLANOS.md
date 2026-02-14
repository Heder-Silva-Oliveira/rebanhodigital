# 📊 Implementação do Sistema de Planos

## ✅ Implementação Concluída

### 🎯 Estrutura de Planos

Foram implementados 3 planos com limites e recursos diferenciados:

#### 🥉 BÁSICO (R$ 49,90/mês)
- **Animais:** 50
- **Pastagens:** 5
- **Pesagens:** Ilimitadas
- **Receitas:** 10
- **Transações Financeiras:** 50/mês
- **Planejamento:** ❌ Bloqueado
- **Saúde da Empresa:** ❌ Bloqueado
- **Usuários:** 1 (apenas admin)
- **Notificações:** Email apenas

#### 🥈 PROFISSIONAL (R$ 149,90/mês)
- **Animais:** 500
- **Pastagens:** 50
- **Pesagens:** Ilimitadas
- **Receitas:** 100
- **Transações Financeiras:** Ilimitadas
- **Planejamento:** ✅ Até 20 planejamentos
- **Saúde da Empresa:** ✅ Disponível
- **Usuários:** Até 5 (admin + operadores)
- **Notificações:** Email + WhatsApp
- **Relatórios:** Avançados
- **Exportação:** PDF e Excel

#### 🥇 ENTERPRISE (Sob consulta)
- **Tudo ilimitado**
- **Recursos avançados:** API, IA, Suporte 24/7
- **Dashboard personalizado**
- **Notificações:** Email + WhatsApp + SMS

---

## 🔧 Arquivos Modificados/Criados

### Backend

#### Configuração
- ✅ `api/config/plans.js` - Configuração completa de planos e limites
  - Função `canDowngrade()` para validar downgrade

#### Middlewares
- ✅ `api/middlewares/plan.middleware.js`
  - `checkPlanFeature()` - Verifica se o plano tem acesso a uma feature
  - `checkPlanLimit()` - Verifica limites de quantidade (animais, pastagens, etc)

#### Controllers
- ✅ `api/user/controller/plan.controller.js` (NOVO)
  - `getCurrentPlan()` - Retorna plano atual e uso
  - `getAvailablePlans()` - Lista todos os planos
  - `changePlan()` - Faz upgrade/downgrade com validações

- ✅ `api/user/controller/user.controller.js`
  - `createUser()` - Criar novos usuários (apenas admin)
  - `updateUser()` - Atualizar usuários
  - `deleteUser()` - Deletar usuários
  - `listUsers()` - Melhorado com mais informações

#### Rotas
- ✅ `api/user/routes/user.routes.js`
  - `POST /users` - Criar usuário (com verificação de limite)
  - `PUT /users/:userId` - Atualizar usuário
  - `DELETE /users/:userId` - Deletar usuário
  - `GET /users/plan/current` - Plano atual
  - `GET /users/plan/available` - Planos disponíveis
  - `POST /users/plan/change` - Alterar plano

- ✅ `api/animal/routes/animal.routes.js` - Adicionado `checkPlanLimit('animals')`
- ✅ `api/pasture/routes/pasture.routes.js` - Adicionado `checkPlanLimit('pastures')`
- ✅ `api/recipe/routes/recipe.routes.js` - Adicionado `checkPlanLimit('recipes')`
- ✅ `api/planning/routes/planning.routes.js` - Adicionado `checkPlanFeature('planning')`

### Frontend

#### Páginas
- ✅ `src/pages/Users.tsx` (NOVO)
  - Gerenciamento completo de usuários
  - Criar, editar, ativar/desativar, deletar
  - Apenas para admins

- ✅ `src/pages/Plans.tsx` (NOVO)
  - Visualização de planos disponíveis
  - Plano atual com uso em tempo real
  - Upgrade/downgrade de planos
  - Alertas de limite

#### Componentes
- ✅ `src/components/UpgradeModal.tsx` (NOVO)
  - Modal para quando recurso está bloqueado
  - Link direto para página de planos

- ✅ `src/components/PlanLimitAlert.tsx` (NOVO)
  - Alerta quando próximo do limite (80%+)
  - Alerta quando limite atingido (100%)

- ✅ `src/components/Sidebar.tsx`
  - Filtro de itens baseado no plano
  - Oculta "Planejamento" no plano básico
  - Oculta "Saúde da Empresa" no plano básico
  - Oculta "Usuários" para não-admins
  - Banner de upgrade para plano básico

#### Hooks
- ✅ `src/hooks/usePlanLimits.ts` (NOVO)
  - `canCreate()` - Verifica se pode criar mais itens
  - `hasFeature()` - Verifica se tem acesso a feature
  - `getUsagePercentage()` - Calcula % de uso
  - `refreshUsage()` - Atualiza dados de uso

#### Configuração
- ✅ `src/planConfig.ts` - Atualizado com estrutura completa
- ✅ `src/App.tsx` - Adicionadas rotas `/usuarios` e `/planos`

---

## 🚀 Como Usar

### Para Admins

#### Gerenciar Usuários
1. Acesse o menu "Usuários" (apenas visível para admins)
2. Clique em "+ Novo Usuário"
3. Preencha nome, email, senha e função
4. O sistema verifica automaticamente o limite do plano

#### Alterar Plano
1. Acesse o menu "Planos"
2. Visualize seu uso atual
3. Escolha um novo plano
4. Confirme a alteração

**Upgrade:** Sempre permitido
**Downgrade:** Apenas se o uso atual estiver dentro dos limites do novo plano

### Para Desenvolvedores

#### Adicionar Verificação de Limite em Nova Rota
```javascript
import { checkPlanLimit } from '../../middlewares/plan.middleware.js';

router.post('/', checkPlanLimit('nomeDoRecurso'), controller.create);
```

#### Adicionar Verificação de Feature em Nova Rota
```javascript
import { checkPlanFeature } from '../../middlewares/plan.middleware.js';

router.use(checkPlanFeature('nomeDaFeature'));
```

#### Usar Hook no Frontend
```typescript
import { usePlanLimits } from '../hooks/usePlanLimits';

const { canCreate, hasFeature, usage, planConfig } = usePlanLimits();

// Verificar se pode criar
if (!canCreate('animals')) {
  alert('Limite de animais atingido!');
}

// Verificar se tem feature
if (!hasFeature('planning')) {
  // Mostrar modal de upgrade
}
```

---

## 🔒 Segurança

- ✅ Todas as rotas protegidas com `authenticateToken`
- ✅ Rotas de admin protegidas com `checkRole(['admin'])`
- ✅ Verificação de limites no backend (não apenas frontend)
- ✅ Validação de downgrade para evitar perda de dados
- ✅ Usuários não podem deletar a si mesmos
- ✅ Usuários não podem desativar a si mesmos

---

## 📝 Próximos Passos (Opcional)

1. **Integração com Gateway de Pagamento**
   - Stripe, PagSeguro, Mercado Pago
   - Renovação automática

2. **Período de Teste**
   - 14 dias grátis do plano Pro

3. **Notificações de Limite**
   - Email quando atingir 80% do limite
   - Email quando atingir 100%

4. **Histórico de Planos**
   - Registrar mudanças de plano
   - Auditoria de upgrades/downgrades

5. **Relatórios de Uso**
   - Dashboard de uso por recurso
   - Gráficos de evolução

6. **API de Webhooks**
   - Notificar sistemas externos sobre mudanças de plano

---

## 🧪 Testes Recomendados

### Cenários de Teste

1. **Criar usuário no plano básico** (deve falhar - limite 1)
2. **Criar 51 animais no plano básico** (deve falhar no 51º)
3. **Acessar planejamento no plano básico** (deve bloquear)
4. **Fazer upgrade de básico para pro** (deve funcionar)
5. **Fazer downgrade de pro para básico com 100 animais** (deve falhar)
6. **Fazer downgrade de pro para básico com 40 animais** (deve funcionar)
7. **Admin criar 5 usuários no plano pro** (deve funcionar)
8. **Admin tentar criar 6º usuário no plano pro** (deve falhar)

---

## 📞 Suporte

Para dúvidas sobre a implementação, consulte:
- Código fonte em `api/config/plans.js`
- Documentação de middlewares em `api/middlewares/plan.middleware.js`
- Exemplos de uso nas rotas existentes
