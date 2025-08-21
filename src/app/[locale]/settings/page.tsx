'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  CreditCard, 
  Shield, 
  Globe, 
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Upload,
  Trash2,
  Check,
  X,
  Wallet,
  Zap,
  AlertTriangle,
  Phone,
  Key,
  Settings,
  Plus,
  Minus,
  ExternalLink,
  Copy,
  QrCode,
  RefreshCw,
  Star,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import UserAvatar, { UploadAvatar } from '@/components/UserAvatar';
import { cn } from '@/lib/utils';

interface SettingsTab {
  id: string;
  label: string;
  icon: any;
}

const settingsTabs: SettingsTab[] = [
  { id: 'profile', label: 'Профиль', icon: User },
  { id: 'account', label: 'Аккаунт', icon: Mail },
  { id: 'security', label: 'Безопасность', icon: Lock },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
  { id: 'crypto', label: 'Крипто', icon: Shield },
  { id: 'billing', label: 'Платежи', icon: CreditCard },
  { id: 'privacy', label: 'Приватность', icon: Globe },
  { id: 'verification', label: 'Верификация', icon: Check },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    timezone: '',
    hourly_rate: '',
    skills: [] as string[],
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    project_updates: true,
    message_notifications: true,
    payment_notifications: true,
    marketing_emails: false,
    crypto_notifications: true,
    dispute_notifications: true,
    admin_notifications: false,
  });

  // Account type toggle
  const [accountType, setAccountType] = useState<'freelancer' | 'client' | 'both'>('freelancer');

  // Crypto settings
  const [cryptoSettings, setCryptoSettings] = useState({
    auto_escrow: true,
    preferred_network: 'polygon',
    preferred_token: 'USDC',
    gas_fee_optimization: true,
    dispute_auto_arbitration: false,
    multi_sig_enabled: false,
  });

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState({
    stripe_enabled: true,
    crypto_enabled: true,
    bank_transfer: false,
    paypal: false,
  });

  // Verification status
  const [verificationStatus, setVerificationStatus] = useState({
    email_verified: false,
    phone_verified: false,
    identity_verified: false,
    kyc_completed: false,
    two_factor_enabled: false,
  });

  // Connected wallets
  const [connectedWallets, setConnectedWallets] = useState([
    { id: '1', name: 'MetaMask', address: '0x742d35Cc6635c0532925a3B8D5C9e9C16b8b2E2e', network: 'Polygon', status: 'connected' },
    { id: '2', name: 'WalletConnect', address: '0x1234...5678', network: 'Base', status: 'disconnected' },
  ]);

  // Connected cards
  const [connectedCards, setConnectedCards] = useState([
    { id: '1', type: 'visa', last4: '4242', expiry: '12/25', status: 'active' },
    { id: '2', type: 'mastercard', last4: '5555', expiry: '08/26', status: 'expired' },
  ]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/en/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        phone: user.phone || '',
        timezone: user.timezone || '',
        hourly_rate: user.hourly_rate?.toString() || '',
        skills: user.skills || [],
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement profile update
      console.log('Updating profile:', profileData);
      // Show success message
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement password change
      console.log('Changing password');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      // TODO: Implement avatar upload
      console.log('Uploading avatar:', file);
    } catch (error) {
      console.error('Avatar upload error:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Информация профиля</h3>
              
              {/* Avatar Upload */}
              <div className="flex items-center space-x-6 mb-6">
                <UserAvatar
                  src={user?.avatar}
                  alt={user?.name}
                  size="xl"
                  fallbackText={user?.name}
                />
                <div>
                  <UploadAvatar
                    onUpload={handleAvatarUpload}
                    currentSrc={user?.avatar}
                    size="lg"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Загрузите новый аватар. Максимальный размер: 5MB
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Полное имя
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Местоположение
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="Город, Страна"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Веб-сайт
                    </label>
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Почасовая ставка ($)
                    </label>
                    <input
                      type="number"
                      value={profileData.hourly_rate}
                      onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    О себе
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    placeholder="Расскажите о себе..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </form>
            </div>
          </div>
        );

      case 'crypto':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Крипто настройки</h3>
              
              {/* Crypto Preferences */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30 mb-6">
                <h4 className="text-white font-medium mb-4">Основные настройки</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Предпочитаемая сеть
                    </label>
                    <select
                      value={cryptoSettings.preferred_network}
                      onChange={(e) => setCryptoSettings({...cryptoSettings, preferred_network: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="polygon">Polygon (MATIC)</option>
                      <option value="base">Base</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="ethereum">Ethereum</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Предпочитаемый токен
                    </label>
                    <select
                      value={cryptoSettings.preferred_token}
                      onChange={(e) => setCryptoSettings({...cryptoSettings, preferred_token: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="DAI">DAI</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Crypto Features */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30 mb-6">
                <h4 className="text-white font-medium mb-4">Функции</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Автоматический Escrow</div>
                      <div className="text-gray-400 text-sm">Автоматически создавать escrow для всех платежей</div>
                    </div>
                    <button
                      onClick={() => setCryptoSettings({...cryptoSettings, auto_escrow: !cryptoSettings.auto_escrow})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        cryptoSettings.auto_escrow ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cryptoSettings.auto_escrow ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Оптимизация газа</div>
                      <div className="text-gray-400 text-sm">Автоматически выбирать оптимальные комиссии</div>
                    </div>
                    <button
                      onClick={() => setCryptoSettings({...cryptoSettings, gas_fee_optimization: !cryptoSettings.gas_fee_optimization})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        cryptoSettings.gas_fee_optimization ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cryptoSettings.gas_fee_optimization ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Авто-арбитраж споров</div>
                      <div className="text-gray-400 text-sm">Автоматически разрешать простые споры</div>
                    </div>
                    <button
                      onClick={() => setCryptoSettings({...cryptoSettings, dispute_auto_arbitration: !cryptoSettings.dispute_auto_arbitration})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        cryptoSettings.dispute_auto_arbitration ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cryptoSettings.dispute_auto_arbitration ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Connected Wallets */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Подключенные кошельки</h4>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Добавить кошелек</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {connectedWallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{wallet.name}</div>
                          <div className="text-gray-400 text-sm">{wallet.address}</div>
                          <div className="text-xs text-gray-500">{wallet.network}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          wallet.status === 'connected' 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {wallet.status === 'connected' ? 'Подключен' : 'Отключен'}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Верификация аккаунта</h3>
              
              {/* Verification Status */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30 mb-6">
                <h4 className="text-white font-medium mb-4">Статус верификации</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStatus.email_verified ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {verificationStatus.email_verified ? <Check className="w-4 h-4 text-white" /> : <Mail className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <div className="text-white font-medium">Email</div>
                        <div className="text-gray-400 text-sm">Подтверждение email адреса</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                      {verificationStatus.email_verified ? 'Подтвержден' : 'Подтвердить'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStatus.phone_verified ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {verificationStatus.phone_verified ? <Check className="w-4 h-4 text-white" /> : <Phone className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <div className="text-white font-medium">Телефон</div>
                        <div className="text-gray-400 text-sm">Подтверждение номера телефона</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                      {verificationStatus.phone_verified ? 'Подтвержден' : 'Подтвердить'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStatus.identity_verified ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {verificationStatus.identity_verified ? <Check className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <div className="text-white font-medium">Личность</div>
                        <div className="text-gray-400 text-sm">Верификация документов</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                      {verificationStatus.identity_verified ? 'Подтвержден' : 'Подтвердить'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStatus.kyc_completed ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {verificationStatus.kyc_completed ? <Check className="w-4 h-4 text-white" /> : <Shield className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <div className="text-white font-medium">KYC</div>
                        <div className="text-gray-400 text-sm">Проверка личности</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                      {verificationStatus.kyc_completed ? 'Завершен' : 'Пройти'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium">Двухфакторная аутентификация</h4>
                    <p className="text-gray-400 text-sm">Дополнительная защита вашего аккаунта</p>
                  </div>
                  <button
                    onClick={() => setVerificationStatus({...verificationStatus, two_factor_enabled: !verificationStatus.two_factor_enabled})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      verificationStatus.two_factor_enabled ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      verificationStatus.two_factor_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                {verificationStatus.two_factor_enabled && (
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <QrCode className="w-6 h-6 text-purple-400" />
                      <span className="text-white font-medium">Настройка 2FA</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      Отсканируйте QR-код в приложении Google Authenticator или Authy
                    </p>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        Показать QR-код
                      </button>
                      <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                        Резервные коды
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Тип аккаунта</h3>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium">Режим работы</h4>
                    <p className="text-gray-400 text-sm">Выберите как вы хотите использовать платформу</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setAccountType('freelancer')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      accountType === 'freelancer'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👨‍💻</div>
                      <div className="font-medium">Фрилансер</div>
                      <div className="text-xs opacity-75">Выполняю заказы</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setAccountType('client')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      accountType === 'client'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💼</div>
                      <div className="font-medium">Клиент</div>
                      <div className="text-xs opacity-75">Заказываю работу</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setAccountType('both')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      accountType === 'both'
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔄</div>
                      <div className="font-medium">Оба режима</div>
                      <div className="text-xs opacity-75">И заказываю и выполняю</div>
                    </div>
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                  <h5 className="text-white font-medium mb-2">Текущий статус:</h5>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      accountType === 'freelancer' ? 'bg-purple-500' :
                      accountType === 'client' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <span className="text-gray-300">
                      {accountType === 'freelancer' ? 'Фрилансер' :
                       accountType === 'client' ? 'Клиент' : 'Оба режима'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Смена пароля</h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Текущий пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Подтвердите новый пароль
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {loading ? 'Обновление...' : 'Обновить пароль'}
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings coming soon...
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Navigation */}
      <Navbar />
      
      <div className="pt-20">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">⚙️ Настройки</h1>
              <p className="text-gray-400 text-lg">Управляйте настройками аккаунта и предпочтениями</p>
            </div>

            {/* Settings Navigation Tabs */}
            <div className="mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/50 max-w-4xl mx-auto">
                <div className="flex flex-wrap gap-2 justify-center">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/25'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-6 rounded-2xl">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
