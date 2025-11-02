import React, { useState, useEffect, useCallback, useRef, ChangeEvent, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Camera, 
  Save, 
  Eye, 
  EyeOff, 
  Phone, 
  MapPin, 
  Loader2, 
  Home, 
  Hash, 
  X, 
  AlertCircle, 
  Check,
  Mail,
  Lock 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Define a URL base da API (Vite)
const EXPRESS_SERVER_URL = import.meta.env.VITE_API_URL;

// --- 1. NOVOS HELPERS DE AUTENTICAÇÃO ---

// Função helper para forçar o logout em caso de falha de auth
const handleAuthError = () => {
  console.error("Token expirado ou inválido. Fazendo logout.");
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/'; // Redireciona para a Home
};

/**
 * Pega os cabeçalhos de autenticação.
 * @param isJson Define se o Content-Type é application/json. 
 * Deixe 'false' para uploads (FormData).
 */
const getAuthHeaders = (isJson = true) => {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  
  if (isJson) {
    headers.append('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
};
// --- FIM DOS HELPERS ---


// --- Interfaces de Dados ---
interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface IFarm {
  name: string;
  size: number | string; // Permitir string para o input
  location: string;
}

interface IProfileData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: IAddress;
  farm: IFarm;
}

interface IPasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ⚠️ CORREÇÃO: O InputWrapper foi movido para FORA do ProfilePage
// e envolvido com 'memo' para otimização.
const InputWrapper: React.FC<{ 
  label: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  className?: string;
}> = memo(({ label, icon, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      {children}
    </div>
  </div>
));
InputWrapper.displayName = 'InputWrapper'; // Boa prática para React.memo


// --- Componente Principal da Página ---
const ProfilePage: React.FC = () => {
  const { user } = useAuth(); // Pega o usuário logado
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Começa true para a carga inicial
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Estados de Dados
  const [profileData, setProfileData] = useState<IProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    cpf: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    farm: { name: '', size: '', location: '' },
  });
  
  const [passwordData, setPasswordData] = useState<IPasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Estados de UI
  const [showPasswords, setShowPasswords] = useState({ 
    current: false, 
    new: false, 
    confirm: false 
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- 1. Buscar Dados na Carga ---
  
  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    
    // 1.a. Limpar URL de blob antigo
    if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(profileImageUrl);
    }
    setProfileImageUrl(null);

    try {
      // 1.b. Buscar dados do JSON (COM AUTENTICAÇÃO)
      const response = await fetch(`${EXPRESS_SERVER_URL}/api/users/${user.id}/full`, {
        headers: getAuthHeaders() // ⚠️ CORREÇÃO 1
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return handleAuthError();
        throw new Error('Falha ao carregar dados do usuário.');
      }
      
      const data = await response.json();
      
      setProfileData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        cpf: data.cpf || '',
        address: data.address || { street: '', city: '', state: '', zipCode: '' },
        farm: data.farm || { name: '', size: '', location: '' },
      });

      // 1.c. Buscar Imagem (se houver) (COM AUTENTICAÇÃO)
      if (data.hasProfileImage) {
        try {
          const imgResponse = await fetch(`${EXPRESS_SERVER_URL}/api/users/${user.id}/profile-image`, {
            headers: getAuthHeaders(false) // ⚠️ CORREÇÃO 2 (sem JSON header)
          });
          if (!imgResponse.ok) throw new Error('Falha ao carregar imagem');
          
          const imageBlob = await imgResponse.blob();
          if (imageBlob.type.startsWith('image/')) {
            const localUrl = URL.createObjectURL(imageBlob);
            setProfileImageUrl(localUrl); // ⚠️ CORREÇÃO 3 (Blob URL)
          }
        } catch (imgError) {
          console.error("Erro ao carregar imagem:", imgError);
          setProfileImageUrl(null); // Fallback
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Removido profileImageUrl daqui

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Limpeza do Blob URL
  useEffect(() => {
    return () => {
      if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [profileImageUrl]);

  // --- 2. Handlers de Mudança do Formulário (Sem alterações) ---

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleFarmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      farm: { ...prev.farm, [name]: value },
    }));
  };
  
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // --- 3. Ações da API (COM AUTENTICAÇÃO) ---

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading('Enviando foto...');
    
    const uploadFormData = new FormData();
    uploadFormData.append('profileImage', file);

    try {
      const response = await fetch(`${EXPRESS_SERVER_URL}/api/users/${user.id}/profile-image`, {
        method: 'PATCH',
        headers: getAuthHeaders(false), // ⚠️ CORREÇÃO 4 (isJson = false)
        body: uploadFormData,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return handleAuthError();
        throw new Error('Falha ao enviar a imagem.');
      }
      
      await response.json();
      toast.dismiss(toastId);
      toast.success('Foto de perfil atualizada!');
      
      // ⚠️ CORREÇÃO 5: Recarregar os dados (incluindo a imagem)
      // A forma mais fácil é chamar a função de fetch original
      fetchUserData();
      
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${EXPRESS_SERVER_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(true), // ⚠️ CORREÇÃO 6 (isJson = true)
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return handleAuthError();
        throw new Error('Falha ao salvar o perfil.');
      }
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${EXPRESS_SERVER_URL}/api/users/${user.id}/change-password`, {
        method: 'PATCH',
        headers: getAuthHeaders(true), // ⚠️ CORREÇÃO 7 (isJson = true)
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return handleAuthError();
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao alterar a senha.');
      }
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao alterar senha.' });
    } finally {
      setLoading(false);
    }
  };

  // Limpar mensagens
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  // ⚠️ InputWrapper FOI MOVIDO PARA FORA DO COMPONENTE

  const baseInputClasses = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed";

  
  // --- JSX (Com fallback de imagem de perfil corrigido) ---

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl shadow-lg bg-green-600">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
              <p className="text-lg text-gray-600">Gerencie suas informações pessoais e da propriedade</p>
            </div>
          </div>
        </motion.div>

        {/* Mensagem de Feedback */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              } border`}
            >
              {message.type === 'success' ? <Check className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </span>
              <button onClick={() => setMessage(null)} className="ml-auto text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar de Navegação */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  
                  {/* ⚠️ CORREÇÃO 8: A tag <img> agora usa o profileImageUrl (que é um blob) 
                      ou um placeholder. O 'src' nunca deve ser nulo/undefined.
                  */}
                  <img
                    src={profileImageUrl || 'https://placehold.co/128x128/e2e8f0/64748b?text=Foto'}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 p-2 rounded-full text-white bg-green-600 shadow-lg hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 text-lg">{profileData.name}</h3>
                <p className="text-sm text-gray-500">{user?.role || 'Usuário'}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'profile' as const, label: 'Perfil e Propriedade', icon: User },
                  { id: 'security' as const, label: 'Segurança', icon: Shield },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id ? 'bg-green-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              
              {/* Aba de Perfil e Propriedade */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Informações Pessoais</h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isEditing ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {isEditing ? 'Cancelar' : 'Editar'}
                      </button>
                    </div>

                    {/* Formulário de Dados Pessoais */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputWrapper label="Nome Completo" icon={<User size={18} />}>
                        <input 
                          type="text" 
                          name="name" 
                          value={profileData.name} 
                          onChange={handleProfileChange} 
                          disabled={!isEditing} 
                          className={baseInputClasses} 
                        />
                      </InputWrapper>
                      <InputWrapper label="Email" icon={<Mail size={18} />}>
                        <input 
                          type="email" 
                          name="email" 
                          value={profileData.email} 
                          disabled 
                          className={`${baseInputClasses} bg-gray-100`} 
                        />
                      </InputWrapper>
                      <InputWrapper label="Telefone / WhatsApp" icon={<Phone size={18} />}>
                        <input 
                          type="tel" 
                          name="phone" 
                          value={profileData.phone} 
                          onChange={handleProfileChange} 
                          disabled={!isEditing} 
                          className={baseInputClasses} 
                        />
                      </InputWrapper>
                      <InputWrapper label="CPF" icon={<Hash size={18} />}>
                        <input 
                          type="text" 
                          name="cpf" 
                          value={profileData.cpf} 
                          onChange={handleProfileChange} 
                          disabled={!isEditing} 
                          className={baseInputClasses} 
                        />
                      </InputWrapper>
                    </div>
                  </div>
                  
                  {/* Formulário de Endereço */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">Endereço</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <InputWrapper label="Rua / Logradouro" icon={<Home size={18} />}>
                            <input 
                              type="text" 
                              name="street" 
                              value={profileData.address.street} 
                              onChange={handleAddressChange} 
                              disabled={!isEditing} 
                              className={baseInputClasses} 
                            />
                          </InputWrapper>
                        </div>
                        <InputWrapper label="Cidade" icon={<MapPin size={18} />}>
                          <input 
                            type="text" 
                            name="city" 
                            value={profileData.address.city} 
                            onChange={handleAddressChange} 
                            disabled={!isEditing} 
                            className={baseInputClasses} 
                          />
                        </InputWrapper>
                        <InputWrapper label="Estado" icon={<MapPin size={18} />}>
                          <input 
                            type="text" 
                            name="state" 
                            value={profileData.address.state} 
                            onChange={handleAddressChange} 
                            disabled={!isEditing} 
                            className={baseInputClasses} 
                          />
                        </InputWrapper>
                        <InputWrapper label="CEP" icon={<MapPin size={18} />}>
                          <input 
                            type="text" 
                            name="zipCode" 
                            value={profileData.address.zipCode} 
                            onChange={handleAddressChange} 
                            disabled={!isEditing} 
                            className={baseInputClasses} 
                          />
                        </InputWrapper>
                      </div>
                  </div>

                  {/* Formulário da Fazenda */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">Propriedade</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <InputWrapper label="Nome da Fazenda" icon={<Home size={18} />}>
                          <input 
                            type="text" 
                            name="name" 
                            value={profileData.farm.name} 
                            onChange={handleFarmChange} 
                            disabled={!isEditing} 
                            className={baseInputClasses} 
                          />
                        </InputWrapper>
                          <InputWrapper label="Tamanho (hectares)" icon={<MapPin size={18} />}>
                          <input 
                            type="number" 
                            name="size" 
                            value={profileData.farm.size} 
                            onChange={handleFarmChange} 
                            disabled={!isEditing} 
                            className={baseInputClasses} 
                          />
                        </InputWrapper>
                        <div className="md:col-span-2">
                            <InputWrapper label="Localização (Município, Zona Rural, etc.)" icon={<MapPin size={18} />}>
                            <input 
                              type="text" 
                              name="location" 
                              value={profileData.farm.location} 
                              onChange={handleFarmChange} 
                              disabled={!isEditing} 
                              className={baseInputClasses} 
                            />
                          </InputWrapper>
                        </div>
                      </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-opacity disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Aba de Segurança */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">Alterar Senha</h3>
                  <div className="space-y-4 max-w-md">
                    
                    <InputWrapper label="Senha Atual" icon={<Lock size={18} />}>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={baseInputClasses}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Nova Senha" icon={<Lock size={18} />}>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={baseInputClasses}
                        />
                          <button 
                          type="button" 
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </InputWrapper>
                    
                    <InputWrapper label="Confirmar Nova Senha" icon={<Lock size={18} />}>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={baseInputClasses}
                        />
                          <button 
                          type="button" 
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </InputWrapper>

                    <button
                      onClick={handleChangePassword}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-opacity disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                      <span>{loading ? 'Alterando...' : 'Alterar Senha'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

