// src/components/SignUpModal.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

interface SignUpModalProps {
    onClose: () => void;
    onSuccess: (userData?: any) => void; // ✅ Agora aceita parâmetro
}

const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSuccess }) => {
    const { signUp } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('operador'); // Define um papel padrão
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        console.log(`📝 Tentativa de cadastro para email: ${email}, nome: ${name}`);
    if (!email || !password || !name) {
        console.log('❌ Falha no cadastro: Campos obrigatórios faltando.');
      setError('Nome, email e senha são obrigatórios.');
      setLoading(false);
      return;
    }

    // ✅ ADICIONE ESTA VALIDAÇÃO
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      setLoading(false);
      return;
    }

        try {
            // Chama a função signUp que irá para o endpoint POST /api/users no backend
            const userData = await signUp({ email, password, name, role });
            
            toast.success('Conta criada com sucesso! Redirecionando...');
            
            // ✅ CORREÇÃO: Passa os dados do usuário para onSuccess
            onSuccess(userData); 
            
        } catch (err: any) {
            const errorMessage = err.message || 'Falha no cadastro.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [email, password, name, role, signUp, onSuccess]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                exit={{ y: -50 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center border-b pb-3 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <UserPlus size={24} className="mr-2 text-green-600" />
                            Criar Nova Conta
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Nome */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                                required
                            />
                        </div>
                        
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="seu@email.com"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                        
                        {/* Role (Opcional, mas bom para definir permissões) */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Papel na Fazenda</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            >
                                <option value="operador">Operador</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="text-red-600 text-sm p-2 bg-red-50 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Botão de Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                                    <span>Cadastrando...</span>
                                </>
                            ) : (
                                <span>Criar Conta</span>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SignUpModal;