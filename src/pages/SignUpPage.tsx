// src/pages/SignUpPage.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Loader2, UserPlus, User, Mail, Lock, Phone, Building } from 'lucide-react';
import { motion } from 'framer-motion'; // ✅ FALTANDO: Import do motion

const SignUpPage: React.FC = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'operador',
        phone: '',
        farmName: '',
        farmSize: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'farmSize' ? Number(value) : value 
        }));
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // ✅ CORREÇÃO: Estrutura compatível com seu schema do MongoDB
        const userDataPayload = {
            email: formData.email,
            password: formData.password, // ✅ Será criptografada no backend
            name: formData.name,
            role: formData.role,
            phone: formData.phone,
            // ✅ CORREÇÃO: Campos no formato correto para seu schema
            farm: {
                name: formData.farmName,
                size: formData.farmSize,
                location: "A definir"
            },
            // ✅ Campos opcionais com valores padrão
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            await signUp(userDataPayload);
            
            toast.success('Cadastro realizado com sucesso! Redirecionando...');
            
            // ✅ CORREÇÃO: Navigate funciona melhor que window.location
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1500);

        } catch (err: any) {
            console.error('Erro no cadastro:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido no cadastro.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData, signUp, navigate]);

    // ✅ CORREÇÃO: Função para ir para login
    const handleGoToLogin = () => {
        navigate('/login'); // Ou abrir modal de login
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="text-center mb-8">
                    <UserPlus size={40} className="mx-auto text-green-600 mb-3" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crie sua Conta</h1>
                    <p className="text-gray-600 dark:text-gray-400">Comece a gerenciar sua fazenda hoje.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome Completo *
                        </label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="Seu nome completo"
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email *
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="seu@email.com"
                            disabled={loading}
                        />
                    </div>

                    {/* Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Senha *
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            disabled={loading}
                        />
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Telefone
                        </label>
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="(11) 99999-9999"
                            disabled={loading}
                        />
                    </div>

                    {/* Dados da Fazenda */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nome da Fazenda
                            </label>
                            <input 
                                type="text" 
                                name="farmName" 
                                value={formData.farmName} 
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="Nome da propriedade"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tamanho (hectares)
                            </label>
                            <input 
                                type="number" 
                                name="farmSize" 
                                value={formData.farmSize} 
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="0"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Tipo de Usuário */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo de Conta
                        </label>
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={loading}
                        >
                            <option value="operador">Operador/Funcionário</option>
                            <option value="proprietario">Proprietário</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    
                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="p-3 text-red-700 bg-red-50 border border-red-200 rounded-lg text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Botão de Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Cadastrando...</span>
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                <span>Criar Conta e Acessar</span>
                            </>
                        )}
                    </button>
                </form>
                
                {/* Link para Login */}
                <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-600 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Já tem conta?
                    </p>
                    <button 
                        onClick={handleGoToLogin}
                        className="text-sm text-green-600 hover:text-green-700 font-medium mt-1 transition-colors"
                        disabled={loading}
                    >
                        Clique aqui para Entrar
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default SignUpPage;