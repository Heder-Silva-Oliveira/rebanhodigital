
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { useDarkMode } from './hooks/useDarkMode'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Weighing from './pages/Weighing'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Dashboard from './pages/Dashboard'
import Animals from './pages/Animals'
import Financial from './pages/Financial'
import Pastures from './pages/Pastures'
import Planning from './pages/Planning'
import Notifications from './pages/Notifications'
import CompanyHealth from './pages/CompanyHealth'
import Estimativa from './pages/Estimativa'
import {Loader2} from 'lucide-react'
// Componente de rota protegida
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function App() {
    const { isAuthenticated, loading } = useAuth()
    const { isDarkMode, toggleDarkMode } = useDarkMode()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }
    
    // Define a classe CSS base para o modo escuro
    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);
    
    // Define o layout de conteúdo para rotas autenticadas
    const AuthenticatedLayout = (
        <div className="flex">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-16'
            } p-4 lg:p-6`}>
                <Routes>
                    {/* Rotas de GESTÃO (PROTEGIDAS) */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/animals" element={<ProtectedRoute><Animals /></ProtectedRoute>} />
                    <Route path="/weighing" element={<ProtectedRoute><Weighing /></ProtectedRoute>} />
                    <Route path="/financial" element={<ProtectedRoute><Financial /></ProtectedRoute>} />
                    <Route path="/pastures" element={<ProtectedRoute><Pastures /></ProtectedRoute>} />
                    <Route path="/planning" element={<ProtectedRoute><Planning /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/company-health" element={<ProtectedRoute><CompanyHealth /></ProtectedRoute>} />
                    <Route path="/estimativa" element={<ProtectedRoute><Estimativa /></ProtectedRoute>} />
                    
                    {/* REDIRECIONAMENTO DE SEGURANÇA: Se logado, tudo vai para o Dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
        </div>
    );
    
    // Define o layout de conteúdo para rotas públicas
    const PublicRoutes = (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Se o usuário tentar acessar uma rota pública e JÁ estiver logado, redireciona para o Dashboard */}
            <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />
            
            {/* fallback para Home em caso de rota inválida */}
            <Route path="*" element={<Navigate to="/" replace />} /> 
        </Routes>
    );


    return (
        <div className={isDarkMode ? "dark" : ""}> 
            <Toaster 
                position="top-right"
                 toastOptions={{
          duration: 5000,
          style: { 
            background: '#363636', 
            color: '#fff',
            borderRadius: '8px'
          },
          success: { 
            style: { 
              background: '#10b981',
              color: '#fff'
            } 
          },
          error: { 
            style: { 
              background: '#ef4444',
              color: '#fff'
            } 
          }
        }}
            />
            
            <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar 
                        onToggleSidebar={isAuthenticated ? toggleSidebar : undefined}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode} 
                    />
                    
                    {/* ⚠️ CORREÇÃO: O ROTEAMENTO PRINCIPAL AGORA É BASEADO NO ESTADO */}
                    {loading ? (
                        <div className="flex items-center justify-center min-h-screen">
                            <Loader2 className="animate-spin h-12 w-12 text-green-600" />
                        </div>
                    ) : isAuthenticated ? (
                        AuthenticatedLayout
                    ) : (
                        PublicRoutes
                    )}
                </div>
            </Router>
        </div>
    );
}

export default App;