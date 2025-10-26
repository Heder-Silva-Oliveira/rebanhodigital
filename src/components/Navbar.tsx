import React, { useState } from 'react';
import { Menu, X, Sun, Moon, User, LogOut, Info, DollarSign, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../hooks/useAuth';
// Importação do useNavigate para gerenciar o redirecionamento
import { useNavigate, Link } from 'react-router-dom'; 
import AuthModal from './AuthModal';
import { ContinuousTicker } from './Ticker';

interface NavbarProps {
    onToggleSidebar?: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

// Links públicos (visíveis quando não autenticado)
const PUBLIC_NAV_LINKS = [
    { name: 'Início', path: '/' },
    { name: 'Preços', path: '/pricing' },
    { name: 'Sobre', path: '/about' },
    { name: 'Contato', path: '/contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isDarkMode, toggleDarkMode }) => {
    const { user, isAuthenticated, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    const navigate = useNavigate(); // Hook para navegação

    // 1. CORREÇÃO: Força o redirecionamento para o Dashboard após sucesso
    const handleLogin = (userData: any) => {
        setShowAuthModal(false);
        // O navigate força o React Router a mudar a URL, resolvendo o problema de "página em branco"
        //navigate('/dashboard', { replace: true }); 
        window.location.href = '/dashboard';
    };

    // 2. LÓGICA DE LOGOUT
    const handleLogout = () => {
        signOut();
        setShowUserMenu(false);
        // Redireciona para a home/login após sair
        //navigate('/', { replace: true });
        window.location.href = '/';
    };

    return (
        <>
          <ContinuousTicker />
            <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-screen-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        
                        {/* LADO ESQUERDO: Toggle Sidebar (Apenas Logado) e Logo */}
                        <div className="flex items-center space-x-4">
                               {/* 
                            {isAuthenticated && (
                                <button
                                    onClick={onToggleSidebar}
                                    className="p-2 rounded-md text-gray-20 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Menu size={20} />
                                </button>
                            )}
                             */}
                            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 transition-opacity hover:opacity-80">
                                <div className="w-8 h-8 bg-[#00875e] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">🐄</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rebanho Digital</h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Digitalize seu rebanho, potencialize seus resultados.</p>
                                </div>
                            </Link>
                        </div>
                                
                        {/* LADO DIREITO: Links Públicos, Toggle Dark Mode e Autenticação */}
                        <div className="flex items-center space-x-4">
                            
                            {/* 3. LINKS PÚBLICOS (Visíveis quando DESLOGADO) */}
                            {!isAuthenticated && (
                                <div className="hidden md:flex items-center space-x-4 text-gray-[#00875e] dark:text-gray-300">
                                    {PUBLIC_NAV_LINKS.map(link => (
                                        <Link 
                                            key={link.name} 
                                            to={link.path} 
                                            className="text-sm font-medium hover:text-[#00875e] dark:hover:text-green-400 transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* TOGGLE DARK MODE */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-md text-gray-[#00875e] dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (<Sun className="h-5 w-5" />) : (<Moon className="h-5 w-5" />)}
                            </button>

                            {/* BOTÃO DE LOGIN/USUÁRIO */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-[#00875e] rounded-full flex items-center justify-center">
                                            <User size={16} className="text-white" />
                                        </div>
                                        <div className="text-left hidden sm:block">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                                        </div>
                                    </button>

                                    {/* Menu Dropdown */}
                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-[#00875e] py-1"
                                            >
                                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-[#00875e]">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-[#00875e] hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center space-x-2 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Sair</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                // BOTÃO ENTRAR (Deslogado)
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="bg-[#00875e] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
                                >
                                    Entrar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <AuthModal 
                        onClose={() => setShowAuthModal(false)}
                        onLogin={handleLogin}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;