import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock, Crown, Zap, Star, Check, Loader2, Send, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; // 👈 Importação necessária para navegação

type BillingCycle = 'monthly' | 'annual';
type PlanLabel = 'Básico' | 'Profissional' | 'Enterprise';
type PlanId = 'basic' | 'pro' | 'enterprise';

const LABEL_TO_ID: Record<PlanLabel, PlanId> = {
  'Básico': 'basic',
  'Profissional': 'pro',
  'Enterprise': 'enterprise',
};

interface SignUpModalProps {
  onClose: () => void;
  onSuccess?: () => void; 
  defaultPlan?: PlanLabel;
  defaultBillingCycle?: BillingCycle;
}

const PLAN_OPTIONS: { name: PlanLabel; icon: React.ReactNode }[] = [
  { name: 'Básico',       icon: <Star className="w-5 h-5 text-blue-600" /> },
  { name: 'Profissional', icon: <Zap className="w-5 h-5 text-green-600" /> },
  { name: 'Enterprise',   icon: <Crown className="w-5 h-5 text-purple-600" /> },
];

const SignUpModal: React.FC<SignUpModalProps> = ({
  onClose,
  onSuccess,
  defaultPlan = 'Profissional',
  defaultBillingCycle = 'monthly',
}) => {
  const { signUp } = useAuth();
  const navigate = useNavigate(); // 👈 Inicializa o hook de navegação
  
  // Campos de Perfil Progressivo
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'operador' | 'admin'>('operador');
  const [plan, setPlan] = useState<PlanLabel>(defaultPlan);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultBillingCycle);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação
    if (!firstName || !lastName || !normalizedEmail || !password || !phone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso.');
      return;
    }

    setLoading(true);
    try {
      // Concatena Nome e Sobrenome para o campo 'name' no backend
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      await signUp({
        name: fullName, 
        phone: phone.trim(),
        email: normalizedEmail,
        password,
        role,
        plan: LABEL_TO_ID[plan], 
        billingCycle,
      });

      toast.success('Conta criada! Verifique seu email.');
      setShowSuccessMessage(true);
      
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'Falha no cadastro.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }, [firstName, lastName, phone, normalizedEmail, password, role, plan, billingCycle, signUp, acceptTerms]);

  // Handler para navegação dos links (fecha modal e navega)
  const handleLinkNavigation = (path: string) => (e: React.MouseEvent) => {
      e.preventDefault(); // Evita o comportamento padrão do <a>
      onClose(); // Fecha o modal
      navigate(path); // Navega para a rota
  };

  // Tela de Aviso de Sucesso (após o registro)
  if (showSuccessMessage) {
      return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifique seu Email</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Enviamos um link de ativação para <strong>{normalizedEmail}</strong>.<br/>
                        Clique no link para ativar sua conta e entrar.
                    </p>
                    <button
                        onClick={() => {
                            onClose();
                            onSuccess?.(); // Chama a função de sucesso do componente pai (geralmente abre o login)
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        Entendi, Ir para Login
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
      );
  }

  // Formulário de Cadastro Principal
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <UserPlus size={24} className="mr-2 text-green-600" />
                Criar Nova Conta
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               
               {/* 1. Seleção de Plano */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plano</label>
                   <div className="grid grid-cols-1 gap-2">
                     {PLAN_OPTIONS.map((p) => (
                       <button
                         key={p.name}
                         type="button"
                         onClick={() => setPlan(p.name)}
                         className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-colors
                           ${plan === p.name 
                             ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' 
                             : 'border-gray-300 hover:border-gray-400 text-gray-700 dark:border-gray-600 dark:text-gray-300'}
                         `}
                       >
                         <span className="flex items-center gap-2">{p.icon}{p.name}</span>
                         {plan === p.name && <Check className="w-4 h-4 text-emerald-600" />}
                       </button>
                     ))}
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciclo</label>
                   <div className="grid grid-cols-1 gap-2">
                     {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
                       <button
                         key={c}
                         type="button"
                         onClick={() => setBillingCycle(c)}
                         className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors
                           ${billingCycle === c 
                             ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' 
                             : 'border-gray-300 hover:border-gray-400 text-gray-700 dark:border-gray-600 dark:text-gray-300'}
                         `}
                       >
                         {c === 'monthly' ? 'Mensal' : 'Anual'}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>

               <hr className="border-gray-200 dark:border-gray-700 my-4"/>

               {/* 2. Dados Pessoais (Nome e Sobrenome) */}
               <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                      <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full pl-10 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={loading} placeholder="Ex: João" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sobrenome *</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={loading} placeholder="Ex: Silva" />
                   </div>
               </div>

               {/* Telefone */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Celular / WhatsApp *</label>
                  <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={loading} placeholder="(00) 00000-0000" />
                  </div>
               </div>

               {/* Email */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={loading} placeholder="seu@email.com" />
                  </div>
               </div>

               {/* Senha */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha *</label>
                  <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={loading} placeholder="Mínimo 8 caracteres" />
                  </div>
               </div>

               {/* Termos */}
               <div className="flex items-center gap-2 mt-2">
                 <input type="checkbox" id="terms" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="rounded border-gray-300" required />
                 <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                    Li e concordo com os 
                    {/* ✅ CORREÇÃO APLICADA AQUI: Links clicáveis que fecham o modal e navegam */}
                    <a 
                      href="#" 
                      onClick={handleLinkNavigation('/terms')} 
                      className="text-green-600 hover:text-green-700 underline mx-1"
                    >
                        Termos de Uso
                    </a> 
                    e 
                    <a 
                      href="#" 
                      onClick={handleLinkNavigation('/privacy')} 
                      className="text-green-600 hover:text-green-700 underline ml-1"
                    >
                        Política de Privacidade
                    </a>.
                 </label>
               </div>

               {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

               <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex justify-center mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : 'Criar Conta Grátis'}
               </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignUpModal;