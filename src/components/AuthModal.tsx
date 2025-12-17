import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, Mail, Lock, Loader2, Send, AlertTriangle, ArrowLeft } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth'; 
import api from '../api'; 

interface AuthModalProps {
    onClose: () => void;
}

// -----------------------------------------------------------
// 4. COMPONENTE DE RECUPERAÇÃO DE SENHA
// -----------------------------------------------------------
const ForgotPasswordForm: React.FC<{ 
    onBack: () => void;
    onClose: () => void;
    initialEmail: string;
}> = ({ onBack, onClose, initialEmail }) => {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const normalizedEmail = email.trim().toLowerCase();

    const handleSendResetLink = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!normalizedEmail) {
            setError('Por favor, digite seu email.');
            setLoading(false);
            return;
        }

        try {
            // ⚠️ Rota Mock: No backend, você precisaria criar a rota /api/forgot-password
            // Esta rota deve: 1. Gerar um token de redefinição. 2. Enviar um email com link para o frontend.
            await api.post('/api/forgot-password', { email: normalizedEmail }); 
            
            setSuccessMessage(`Um link de redefinição de senha foi enviado para ${normalizedEmail}. Cheque sua caixa de entrada.`);
            // Limpa o erro, caso exista.
            setError(null); 
            
        } catch (err: any) {
            // Geralmente, por segurança, não indicamos se o email existe ou não.
            const message = err.response?.data?.message || 'Falha ao enviar link. Tente novamente.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [normalizedEmail]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-gray-600 dark:text-gray-400 hover:text-green-600">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center pr-8">
                    Recuperar Senha
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={20} />
                </button>
            </div>

            {/* Mensagem de Sucesso */}
            {successMessage ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                    <Check size={20} className="mx-auto text-green-600 dark:text-green-400 mb-2" />
                    <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
            ) : (
                <form onSubmit={handleSendResetLink} className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Insira seu endereço de email e enviaremos um link para redefinir sua senha.
                    </p>

                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="email"
                                id="reset-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="seu@email.com"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg border border-red-200 dark:border-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                        <span>{loading ? 'Enviando...' : 'Enviar Link de Redefinição'}</span>
                    </button>
                    
                    <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 mt-2">
                        Lembrei da minha senha
                    </button>
                </form>
            )}
        </div>
    );
};


// -----------------------------------------------------------
// 5. COMPONENTE PRINCIPAL DO MODAL DE AUTENTICAÇÃO
// -----------------------------------------------------------
export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const { signIn } = useAuth(); 
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Estados auxiliares
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false); // 👈 NOVO ESTADO
    
    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------------------------------------
    // 1. LÓGICA DE LOGIN 
    // -----------------------------------------------------------
    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setNeedsVerification(false); 
        
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);
        
        try {
            const userData = await signIn({ email: normalizedEmail, password }); 
            
            toast.success(`Bem-vindo de volta, ${userData.name.split(' ')[0]}!`);
            onClose(); 
            navigate('/dashboard'); 
            
        } catch (err: any) {
            const resData = err.response?.data;
            const status = err.response?.status;
            
            if (status === 403 && resData?.requiresVerification) {
                setError(resData.message || 'Seu email ainda não foi verificado.');
                setNeedsVerification(true); 
            } else if (status === 401) {
                setError('Email ou senha inválidos.');
            } else {
                setError('Erro de rede ou servidor.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [email, password, signIn, onClose, navigate]);

    // -----------------------------------------------------------
    // 2. REENVIAR EMAIL 
    // -----------------------------------------------------------
    const handleResendEmail = useCallback(async () => {
        if (!email) {
            setError("Por favor, preencha seu email para reenviar.");
            return;
        }
        setResendLoading(true);
        
        try {
            const res = await api.post('/api/resend-verification', { email: normalizedEmail });
            
            toast.success(res.data.message || 'Novo link de ativação enviado!');
            
            setError(null);
            setNeedsVerification(false); 
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Falha ao reenviar. Tente mais tarde.');
        } finally {
            setResendLoading(false);
        }
    }, [email, normalizedEmail]);


    // -----------------------------------------------------------
    // 3. COMPONENTE DE AVISO (E-mail não verificado)
    // -----------------------------------------------------------
    const VerificationRequiredMessage: React.FC = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl mb-4 text-center"
        >
            <AlertTriangle size={20} className="mx-auto text-yellow-600 dark:text-yellow-400 mb-2" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-3">
                Seu email não está verificado.
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                Clique no link que enviamos ou solicite um novo link abaixo.
            </p>
            <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
            >
                {resendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                <span>{resendLoading ? 'Reenviando...' : 'Reenviar Link de Ativação'}</span>
            </button>
        </motion.div>
    );

    // -----------------------------------------------------------
    // 6. RENDERIZAÇÃO PRINCIPAL DO MODAL
    // -----------------------------------------------------------
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ⚠️ CONDIÇÃO: Alterna entre Login e Recuperação */}
                {showForgotPassword ? (
                    <ForgotPasswordForm 
                        onBack={() => { setShowForgotPassword(false); setError(null); }}
                        onClose={onClose}
                        initialEmail={email} // Passa o email digitado
                    />
                ) : (
                    <div className="p-6">
                        {/* Botão de Fechar */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                            aria-label="Fechar"
                        >
                            <X size={20} />
                        </button>
                        
                        {/* Header */}
                        <div className="text-center p-2">
                            <div className="w-16 h-16 bg-green-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogIn size={28} className="text-[#00875e] dark:text-green-400" /> 
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acesse sua conta</h2>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6 px-4 pb-4">
                            
                            {/* Mensagem de Erro Padrão */}
                            {error && !needsVerification && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg border border-red-200 dark:border-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Mensagem de Verificação Necessária */}
                            {needsVerification && <VerificationRequiredMessage />}

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="seu@email.com"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            
                            {/* Link de Recuperar Senha */}
                            <div className="flex justify-end pt-0">
                                <button 
                                    type="button" 
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading || needsVerification} // Desabilita se for necessário verificar
                                className="w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AuthModal;