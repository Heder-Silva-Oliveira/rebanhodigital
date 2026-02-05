import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

import { clearAuth } from './utils/auth'
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
import Formula from './pages/formula'
import SignUpPage from './pages/SignUpPage'
import ProfilePage from './pages/Profile'
import ResetPasswordPage from './pages/ResetPasswordPage';

/* =====================================
   🔐 ROTA PROTEGIDA
===================================== */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-green-600" />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

/* =====================================
   🔔 LISTENER GLOBAL DE LOGOUT
===================================== */
const AuthEventListener: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleLogout = () => {
      console.error('[AUTH EVENT LISTENER] 🚨 EVENTO DE LOGOUT DISPARADO!');
      console.error('[AUTH EVENT LISTENER] Stack trace do logout:', new Error().stack);
      console.error('[AUTH EVENT LISTENER] Localização atual:', window.location.href);
      console.error('[AUTH EVENT LISTENER] Timestamp:', new Date().toISOString());
      
      clearAuth();
      console.log('[AUTH EVENT LISTENER] 🔄 Navegando para home...');
      navigate('/', { replace: true });
    }

    console.log('[AUTH EVENT LISTENER] 📝 Registrando listener de logout');
    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      console.log('[AUTH EVENT LISTENER] 🗑️ Removendo listener de logout');
      window.removeEventListener('auth:logout', handleLogout);
    }
  }, [navigate])

  return null
}

/* =====================================
   🧱 CONTEÚDO PRINCIPAL
===================================== */
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  /* ---------- LAYOUT AUTENTICADO ---------- */
  const AuthenticatedLayout = (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 transition-all duration-300 ease-in-out p-4 lg:p-6`}
      >
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/animals" element={<ProtectedRoute><Animals /></ProtectedRoute>} />
          <Route path="/weighing" element={<ProtectedRoute><Weighing /></ProtectedRoute>} />
          <Route path="/financial" element={<ProtectedRoute><Financial /></ProtectedRoute>} />
          <Route path="/pastures" element={<ProtectedRoute><Pastures /></ProtectedRoute>} />
          <Route path="/planning" element={<ProtectedRoute><Planning /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/company-health" element={<ProtectedRoute><CompanyHealth /></ProtectedRoute>} />
          <Route path="/estimativa" element={<ProtectedRoute><Estimativa /></ProtectedRoute>} />
          <Route path="/formulacao" element={<ProtectedRoute><Formula /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          

          {/* fallback autenticado */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )

  /* ---------- ROTAS PÚBLICAS ---------- */
  const PublicRoutes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cadastro" element={<SignUpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* fallback público */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        onToggleSidebar={isAuthenticated ? toggleSidebar : undefined}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {isAuthenticated ? AuthenticatedLayout : PublicRoutes}
    </div>
  )
}

/* =====================================
   🚀 APP ROOT
===================================== */
const App: React.FC = () => {
  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />

      <Router>
        <AuthEventListener />
        <AppContent />
      </Router>
    </div>
  )
}

export default App
