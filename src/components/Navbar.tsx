import React, { useState, useEffect } from 'react';
import { Sun, Moon, User, LogOut, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom'; 
import AuthModal from './AuthModal';
import SignUpModal from './SignUpModal';
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
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    
    // Função para o SignUp (mantida)
    const handleSignUpSuccess = (userData: any) => {
        setShowSignUpModal(false);
        // O useAuth (signUp) já deve ter feito o login,
        // então o App.tsx vai redirecionar automaticamente.
        // Mas podemos forçar aqui se necessário.
        window.location.href = '/dashboard';
    };

    // ✅ EFEITO PARA CARREGAR A IMAGEM DE PERFIL (CORRIGIDO)
    useEffect(() => {
        // Helper para pegar os headers (igual ao do useCRUD.ts)
        const getAuthHeaders = () => {
            const token = localStorage.getItem('token');
            const headers = new Headers();
            if (token) {
                headers.append('Authorization', `Bearer ${token}`);
            }
            return headers;
        };

        // Função para buscar a imagem
        const fetchProfileImage = async () => {
            if (isAuthenticated && user?.id) {
                setImageLoading(true);
                setImageError(false);
                setProfileImageUrl(null); // Limpa a imagem antiga

                const API_URL = import.meta.env.VITE_API_URL || 'https://rebanhodigital.onrender.com';
                const imageUrl = `${API_URL}/api/users/${user.id}/profile-image`;

                try {
                    const response = await fetch(imageUrl, {
                        headers: getAuthHeaders()
                    });

                    if (!response.ok) {
                        // Se for 404 (sem imagem), apenas marca o erro, não desloga.
                        if (response.status === 404) {
                           console.warn("Usuário não tem foto de perfil cadastrada.");
                        }
                        throw new Error('Falha ao carregar imagem de perfil');
                    }

                    const imageBlob = await response.blob();
                    
                    // Verifica se o blob é de uma imagem (pode retornar JSON de erro)
                    if (imageBlob.type.startsWith('image/')) {
                      const localUrl = URL.createObjectURL(imageBlob);
                      setProfileImageUrl(localUrl);
                    } else {
                      throw new Error('Resposta do servidor não era uma imagem.');
                    }

                } catch (error) {
                    console.error("Erro ao carregar imagem de perfil:", error);
                    setImageError(true);
                } finally {
                    setImageLoading(false);
                }
            } else {
                setProfileImageUrl(null);
                setImageLoading(false);
                setImageError(false);
            }
        };

        fetchProfileImage();

        // 4. LIMPEZA: Revoga a URL do blob
        // Usamos um 'return' dentro da função de efeito
        return () => {
            if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(profileImageUrl);
            }
        };
        
    // ⚠️ CORREÇÃO: Removido 'profileImageUrl' do array de dependências.
    // Isso evita um loop infinito onde o 'setProfileImageUrl'
    // dispara o 'useEffect' que o chama novamente.
    }, [isAuthenticated, user]); 
    // Fim do useEffect da Imagem

    // ❌ REMOVIDO: A função 'handleLogin' foi removida.
    // O AuthModal agora fala diretamente com o AuthContext (useAuth).

    const handleLogout = () => {
        signOut();
        setShowUserMenu(false);
        setProfileImageUrl(null);
        setImageLoading(false);
        setImageError(false);
       // window.location.href = '/'; // O App.tsx já cuida do redirect
    };

    const openSignUpModal = () => {
        setShowSignUpModal(true);
    };

    // Funções para imagens (handlers de load/error do JSX)
    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showUserMenu) {
                // Fechamento simples
                // (Pode precisar de lógica mais robusta se o botão de menu for clicado)
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    return (
        <>
            <ContinuousTicker />
            <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-screen-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        
                        {/* LADO ESQUERDO: Logo */}
                        <div className="flex items-center space-x-4">
                            <Link 
                                to={isAuthenticated ? "/dashboard" : "/"} 
                                className="flex items-center space-x-3 transition-opacity hover:opacity-80"
                            >
                                <div className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    <img 
                                        src="/src/img/logotipo.png" 
                                        alt="Logo" 
                                        className="w-10 h-10 object-cover" 
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rebanho Digital</h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Digitalize seu rebanho, potencialize seus resultados.
                                    </p>
                                </div>
                            </Link>
                        </div>
                            
                        {/* LADO DIREITO: Links, Dark Mode e Autenticação */}
                        <div className="flex items-center space-x-3">
                            
                            {/* LINKS PÚBLICOS (Visíveis quando DESLOGADO) */}
                            {!isAuthenticated && (
                                <div className="hidden md:flex items-center space-x-6 text-gray-600 dark:text-gray-300">
                                    {PUBLIC_NAV_LINKS.map(link => (
                                        <Link 
                                            key={link.name} 
                                            to={link.path} 
                                            className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* TOGGLE DARK MODE */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </button>

                            {/* BOTÕES DE AUTENTICAÇÃO */}
                            {isAuthenticated ? (
                                // ✅ USUÁRIO LOGADO - Menu do usuário
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                                        aria-label="Menu do usuário"
                                    >
                                        {/* IMAGEM DE PERFIL */}
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 flex-shrink-0">
                                            {/* Condição: Mostra a imagem (se carregada) OU o fallback (ícone) */}
                                            {profileImageUrl && !imageError ? (
                                                <>
                                                    {imageLoading && (
                                                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse flex items-center justify-center">
                                                            <User size={14} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                    <img 
                                                        src={profileImageUrl}
                                                        alt={`Foto de ${user?.name}`}
                                                        className={`w-full h-full object-cover transition-opacity duration-200 ${
                                                            imageLoading ? 'opacity-0' : 'opacity-100'
                                                        }`}
                                                        onLoad={handleImageLoad}
                                                        onError={handleImageError}
                                                    />
                                                </>
                                            ) : (
                                                // Fallback (Erro ou sem imagem)
                                                <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                                                    <User size={16} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* INFO DO USUÁRIO */}
                                        <div className="text-left hidden sm:block">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-32">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {user?.role}
                                            </p>
                                        </div>
                                    </button>

                                    {/* DROPDOWN MENU */}
                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95"
                                            >
                                                {/* CABEÇALHO COM FOTO E INFO */}
                                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600 flex items-center space-x-3">
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 dark:border-emerald-400 flex-shrink-0">
                                                        {profileImageUrl && !imageError ? (
                                                            <>
                                                                {imageLoading && (
                                                                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse flex items-center justify-center">
                                                                        <User size={16} className="text-gray-400" />
                                                                    </div>
                                                                )}
                                                                <img 
                                                                    src={profileImageUrl}
                                                                    alt={`Foto de ${user?.name}`}
                                                                    className={`w-full h-full object-cover transition-opacity duration-200 ${
                                                                        imageLoading ? 'opacity-0' : 'opacity-100'
                                                                    }`}
                                                                    onLoad={handleImageLoad}
                                                                    onError={handleImageError}
                                                                />
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                                                                <User size={18} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {user?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {user?.email}
                                                        </p>
                                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium capitalize mt-0.5">
                                                            {user?.role}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* OPÇÕES DO MENU */}
                                                <div className="py-1">
                                                    <Link 
                                                        to="/perfil"
                                                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors duration-150"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <User size={16} className="text-gray-500 dark:text-gray-400" />
                                                        <span>Meu Perfil</span>
                                                    </Link>
                                                    
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                                                    >
                                                        <LogOut size={16} />
                                                        <span>Sair da Conta</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                // ✅ USUÁRIO DESLOGADO - Botões de Entrar e Cadastrar
                                <div className="flex items-center space-x-3">
                                    {/* BOTÃO ENTRAR */}
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="text-emerald-600 dark:text-emerald-400 border border-emerald-600 dark:border-emerald-400 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                    >
                                        Entrar
                                    </button>

                                    {/* BOTÃO CADASTRAR */}
                                    <button
                                        onClick={openSignUpModal}
                                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center space-x-2"
                                    >
                                        <UserPlus size={18} />
                                        <span>Cadastrar</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    // ⚠️ CORREÇÃO: A prop 'onLogin' foi removida.
                    <AuthModal 
                        onClose={() => setShowAuthModal(false)}
                    />
                )}
            </AnimatePresence>

            {/* SignUp Modal */}
            <AnimatePresence>
                {showSignUpModal && (
                    <SignUpModal 
                        onClose={() => setShowSignUpModal(false)}
                        onSuccess={handleSignUpSuccess}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
