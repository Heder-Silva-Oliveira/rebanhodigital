import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, Send, Check, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api'; 

const ResetPasswordPage: React.FC = () => {
    // Hook para ler os parâmetros do URL
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Pega o token da URL (ex: ?token=3dfcd4dd...)
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Validação inicial do token
    useEffect(() => {
        if (!token) {
            setError('Token de redefinição ausente. Por favor, use o link completo enviado por e-mail.');
        }
    }, [token]);

    const handleResetPassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!token) {
            setError('Token inválido ou ausente.');
            return;
        }

        if (newPassword.length < 8) {
            setError('A nova senha deve ter no mínimo 8 caracteres.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            // Chama o endpoint POST /api/reset-password
            const res = await api.post('/reset-password', {
                token,
                newPassword,
            });

            toast.success(res.data.message || 'Senha redefinida com sucesso!');
            
            // Redireciona para o login após sucesso
            setTimeout(() => {
                navigate('/?showLogin=true'); // Retorna à home e abre o modal de login
            }, 1000);

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao redefinir senha. O token pode ter expirado.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [token, newPassword, confirmPassword, navigate]);


    const baseInputClasses = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600";


    // Renderização da tela
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={28} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Redefinir Senha</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {token ? "Insira sua nova senha abaixo." : "Erro: Token de redefinição não encontrado."}
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                    {/* Mensagens de Erro/Status */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg border border-red-200 dark:border-red-700">
                            {error}
                        </div>
                    )}
                    {token && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm rounded-lg border border-blue-200 dark:border-blue-700">
                           <Check size={16} className="inline mr-2" /> Token válido. Defina a nova senha.
                        </div>
                    )}

                    {/* Nova Senha */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={baseInputClasses}
                                placeholder="Mínimo 8 caracteres"
                                required
                                disabled={loading || !token}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(prev => !prev)} 
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmação de Senha */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirme a Nova Senha</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={baseInputClasses}
                                placeholder="Repita a nova senha"
                                required
                                disabled={loading || !token}
                            />
                        </div>
                    </div>

                    {/* Botão de Redefinir */}
                    <button
                        type="submit"
                        disabled={loading || !token || newPassword.length < 8 || newPassword !== confirmPassword}
                        className="w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                        <span>{loading ? 'Redefinindo...' : 'Salvar Nova Senha'}</span>
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ResetPasswordPage;