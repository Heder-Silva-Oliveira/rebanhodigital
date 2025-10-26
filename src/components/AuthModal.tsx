// src/components/AuthModal.tsx

import React, { useState, useCallback } from 'react';
import { X, LogIn, Mail, Lock } from 'lucide-react'; // Adicionado LogIn, Mail, Lock para ícones
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
// Importa o hook para usar a função signIn
import { useAuth } from '../hooks/useAuth'; 

interface AuthModalProps {
    onClose: () => void;
    onLogin: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
    // Usamos o useAuth para obter a função signIn
    const { signIn } = useAuth();
    
    // NOTA: Removidas credenciais iniciais fixas para segurança
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Novo estado para exibir erros específicos

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Limpa o erro anterior
        
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);
        
        try {
            // CHAMA A FUNÇÃO DE LOGIN DO HOOK, que interage com o json-server
            const userData = await signIn({ email, password });
            
            // Se o signIn for bem-sucedido (não lança erro), chamamos onLogin e fechamos
            onLogin(userData); 
            toast.success(`Bem-vindo, ${userData.name.split(' ')[0]}!`);
            onClose();
            
        } catch (err: any) {
            // Captura o erro da API (json-server) ou do useAuth
            const errorMessage = err.message.includes('válidos') 
                                ? 'Email ou senha inválidos.' 
                                : 'Erro de rede ou servidor.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [email, password, signIn, onLogin, onClose]); // Dependências do useCallback

    return (
        // O Backdrop é o container principal e responsável por fechar o modal
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose} // Fecha o modal ao clicar fora
        >
            {/* O Modal Content, que tem sua própria animação e previne o fechamento ao clicar dentro */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()} // Impede que o clique interno feche o modal
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn size={28} className="text-[#00875e]" /> 
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesse sua conta</h2>
                    <p className="text-gray-600">Entre no AgroPec Manager para gerenciar sua propriedade</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6 px-8 pb-8">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                    
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00875e] text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full mr-2"></span>
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>
                
                {/* Features */}
                <div className="px-8 pb-8">
                    <p className="text-xs text-gray-500 text-center mt-4">
                        Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
                    </p>
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Com sua conta você pode:</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Gerenciar seu rebanho</li>
                            <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Controlar finanças</li>
                            <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Monitorar pastagens</li>
                            <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Gerar relatórios</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
export default AuthModal;