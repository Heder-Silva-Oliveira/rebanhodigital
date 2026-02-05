import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock, Crown, Zap, Star, Check, Loader2, Send, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type BillingCycle = 'monthly' | 'annual';
type PlanLabel = 'Básico' | 'Profissional' | 'Enterprise';
type PlanId = 'basic' | 'pro' | 'enterprise';

const LABEL_TO_ID: Record<PlanLabel, PlanId> = {
  'Básico': 'basic',
  'Profissional': 'pro',
  'Enterprise': 'enterprise',
};

// 1. Configuração estendida dos planos com preços e detalhes
const PLAN_DETAILS: Record<PlanLabel, { 
  icon: any, 
  color: string, 
  bg: string, 
  border: string,
  priceMonthly: number,
  priceAnnual: number,
  limit: string 
}> = {
  'Básico': { 
    icon: Star, color: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500',
    priceMonthly: 89, priceAnnual: 79, limit: 'Até 100 animais' 
  },
  'Profissional': { 
    icon: Zap, color: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500',
    priceMonthly: 189, priceAnnual: 169, limit: 'Até 500 animais' 
  },
  'Enterprise': { 
    icon: Crown, color: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500',
    priceMonthly: 389, priceAnnual: 349, limit: 'Ilimitado' 
  },
};

interface SignUpModalProps {
  onClose: () => void;
  onSuccess?: () => void; 
  defaultPlan?: PlanLabel;
  defaultBillingCycle?: BillingCycle;
}

const SignUpModal: React.FC<SignUpModalProps> = ({
  onClose,
  onSuccess,
  defaultPlan = 'Profissional',
  defaultBillingCycle = 'monthly',
}) => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!firstName || !lastName || !normalizedEmail || !password || !phone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso.');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await signUp({
        name: fullName, 
        phone: phone.trim(),
        email: normalizedEmail,
        password,
        role: 'admin',
        plan: LABEL_TO_ID[plan], 
        billingCycle,
      });

      toast.success('Conta criada! Verifique seu email.');
      setShowSuccessMessage(true);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Falha no cadastro.');
      setLoading(false);
    }
  }, [firstName, lastName, phone, normalizedEmail, password, plan, billingCycle, signUp, acceptTerms]);

  const handleLinkNavigation = (path: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      onClose();
      navigate(path);
  };

  if (showSuccessMessage) {
    return (
      <AnimatePresence>
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-gray-100 dark:border-gray-700">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Send className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quase lá!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                      Enviamos um link de ativação para o email <strong>{normalizedEmail}</strong>. Verifique sua caixa de entrada.
                  </p>
                  <button onClick={() => { onClose(); onSuccess?.(); }} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20">
                      Entendi, Ir para Login
                  </button>
              </motion.div>
          </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserPlus size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Criar Nova Conta</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
            
            {/* 2. Seletor de Ciclo (Toggle Switch) */}
            <div className="flex justify-center p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-fit mx-auto border border-gray-200 dark:border-gray-700">
              <button type="button" onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                Mensal
              </button>
              <button type="button" onClick={() => setBillingCycle('annual')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                Anual <span className="text-[10px] bg-green-900/30 px-1.5 py-0.5 rounded text-white">-15%</span>
              </button>
            </div>

            {/* 3. Grid de Planos Visual (Mini-Cards) */}
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(PLAN_DETAILS) as PlanLabel[]).map((planLabel) => {
                const isSelected = plan === planLabel;
                const details = PLAN_DETAILS[planLabel];
                const price = billingCycle === 'monthly' ? details.priceMonthly : details.priceAnnual;
                const Icon = details.icon;

                return (
                  <button key={planLabel} type="button" onClick={() => setPlan(planLabel)} 
                    className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 flex flex-col items-center gap-1 ${
                      isSelected ? `${details.border} bg-gray-50 dark:bg-gray-700/30 ring-4 ring-${details.color}/5` : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                    {isSelected && <div className={`absolute -top-2 -right-2 ${details.bg} text-white rounded-full p-0.5 shadow-lg`}><Check size={12} strokeWidth={4} /></div>}
                    <Icon size={20} className={details.color} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{planLabel}</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[10px] font-bold text-gray-400">R$</span>
                      <span className="text-lg font-black dark:text-white">{price}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">{details.limit}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Nome</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all dark:text-white" placeholder="João" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Sobrenome</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white" placeholder="Silva" required />
              </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">WhatsApp</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white" placeholder="(00) 00000-0000" required />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white" placeholder="exemplo@agro.com" required />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 dark:text-white" placeholder="••••••••" required />
                </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700">
              <input type="checkbox" id="terms" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" required />
              <label htmlFor="terms" className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                Li e aceito os <a href="#" onClick={handleLinkNavigation('/terms')} className="text-green-600 font-bold hover:underline">Termos de Uso</a> e a <a href="#" onClick={handleLinkNavigation('/privacy')} className="text-green-600 font-bold hover:underline">Política de Privacidade</a>.
              </label>
            </div>

            {error && <div className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center">
              {loading ? <Loader2 className="animate-spin" /> : 'Começar Agora Gratuitamente'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignUpModal;