import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });

  const [validation, setValidation] = useState({
    email: { valid: true, message: '' },
    password: { valid: true, message: '' },
    confirmPassword: { valid: true, message: '' },
    fullName: { valid: true, message: '' },
    phone: { valid: true, message: '' }
  });

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+243\s?\d{3}\s?\d{3}\s?\d{3}$/;
    return phoneRegex.test(phone);
  };

  const validateFullName = (name: string) => {
    return name.trim().length >= 2;
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' };
    if (password.length < 6) return { strength: 1, label: 'Très faible' };
    if (password.length < 8) return { strength: 2, label: 'Faible' };
    if (password.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 3, label: 'Moyen' };
    }
    return { strength: 4, label: 'Fort' };
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: ''
    });
    setValidation({
      email: { valid: true, message: '' },
      password: { valid: true, message: '' },
      confirmPassword: { valid: true, message: '' },
      fullName: { valid: true, message: '' },
      phone: { valid: true, message: '' }
    });
    setError('');
    setSuccess('');
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setForgotPasswordMode(false);
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (field === 'email' && value) {
      const valid = validateEmail(value);
      setValidation(prev => ({
        ...prev,
        email: { valid, message: valid ? '' : 'Email invalide' }
      }));
    }

    if (field === 'password' && value) {
      const valid = validatePassword(value);
      setValidation(prev => ({
        ...prev,
        password: { valid, message: valid ? '' : '8 caractères minimum' }
      }));
    }

    if (field === 'confirmPassword' && value) {
      const valid = value === formData.password;
      setValidation(prev => ({
        ...prev,
        confirmPassword: { valid, message: valid ? '' : 'Mots de passe différents' }
      }));
    }

    if (field === 'fullName' && value) {
      const valid = validateFullName(value);
      setValidation(prev => ({
        ...prev,
        fullName: { valid, message: valid ? '' : 'Nom trop court' }
      }));
    }

    if (field === 'phone' && value) {
      const valid = validatePhone(value);
      setValidation(prev => ({
        ...prev,
        phone: { valid, message: valid ? '' : 'Format: +243 XXX XXX XXX' }
      }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation finale
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const isFullNameValid = mode === 'register' ? validateFullName(formData.fullName) : true;
    const isPhoneValid = mode === 'register' ? validatePhone(formData.phone) : true;
    const isConfirmPasswordValid = mode === 'register' ? formData.password === formData.confirmPassword : true;

    if (!isEmailValid || !isPasswordValid || !isFullNameValid || !isPhoneValid || !isConfirmPasswordValid) {
      setValidation({
        email: { valid: isEmailValid, message: isEmailValid ? '' : 'Email invalide' },
        password: { valid: isPasswordValid, message: isPasswordValid ? '' : '8 caractères minimum' },
        confirmPassword: { valid: isConfirmPasswordValid, message: isConfirmPasswordValid ? '' : 'Mots de passe différents' },
        fullName: { valid: isFullNameValid, message: isFullNameValid ? '' : 'Nom trop court' },
        phone: { valid: isPhoneValid, message: isPhoneValid ? '' : 'Format: +243 XXX XXX XXX' }
      });
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        // Simuler la création d'un compte
        const mockUser = {
          id: `user-${Date.now()}`,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          created_at: new Date().toISOString()
        };

        // Stocker l'utilisateur dans le localStorage
        localStorage.setItem('mockUser', JSON.stringify(mockUser));

        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setTimeout(() => {
          handleModeSwitch('login');
        }, 2000);
      } else {
        // Simuler la connexion
        const mockUser = {
          id: `user-${Date.now()}`,
          email: formData.email,
          full_name: 'Utilisateur Test',
          phone: '+243 821 000 000',
          created_at: new Date().toISOString()
        };

        // Stocker l'utilisateur dans le localStorage
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        onSuccess();
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {forgotPasswordMode ? 'Mot de passe oublié' : mode === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Fermer la fenêtre d'authentification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                !validation.email.valid ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="exemple@email.com"
            />
            {!validation.email.valid && (
              <p className="text-red-600 text-sm mt-1">{validation.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  !validation.password.valid ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="••••••••"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!validation.password.valid && (
              <p className="text-red-600 text-sm mt-1">{validation.password.message}</p>
            )}

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getPasswordStrength(formData.password).strength === 1 ? 'bg-red-500 w-1/4' :
                        getPasswordStrength(formData.password).strength === 2 ? 'bg-orange-500 w-1/2' :
                        getPasswordStrength(formData.password).strength === 3 ? 'bg-yellow-500 w-3/4' :
                        getPasswordStrength(formData.password).strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    getPasswordStrength(formData.password).strength === 1 ? 'text-red-600' :
                    getPasswordStrength(formData.password).strength === 2 ? 'text-orange-600' :
                    getPasswordStrength(formData.password).strength === 3 ? 'text-yellow-600' :
                    getPasswordStrength(formData.password).strength === 4 ? 'text-green-600' : 'text-slate-400'
                  }`}>
                    {getPasswordStrength(formData.password).label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Registration Fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                    !validation.fullName.valid ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Jean Mukendi"
                />
                {!validation.fullName.valid && (
                  <p className="text-red-600 text-sm mt-1">{validation.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                    !validation.phone.valid ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="+243 821 938 773"
                />
                {!validation.phone.valid && (
                  <p className="text-red-600 text-sm mt-1">{validation.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                      !validation.confirmPassword.valid ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!validation.confirmPassword.valid && (
                  <p className="text-red-600 text-sm mt-1">{validation.confirmPassword.message}</p>
                )}
              </div>
            </>
          )}

          {/* Forgot Password Link */}
          {mode === 'login' && !forgotPasswordMode && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setForgotPasswordMode(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => handleModeSwitch(mode === 'login' ? 'register' : 'login')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {mode === 'login'
                ? "Pas de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
