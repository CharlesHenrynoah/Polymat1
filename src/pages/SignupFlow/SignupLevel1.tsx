import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';
import supabase from '../../config/configdb';

interface SignupLevel1Props {
  onNext: (data: {
    userId?: string;
    email: string;
    password: string;
    googleAuth?: boolean;
  }) => void;
  onBack: () => void;
}

export const SignupLevel1: React.FC<SignupLevel1Props> = ({ onNext, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailValidation, setEmailValidation] = useState({
    hasUsername: false,
    hasAt: false,
    hasDomain: false,
    isValid: false
  });
  const [emailValidationDisplay, setEmailValidationDisplay] = useState({
    showUsername: false,
    showAt: false,
    showDomain: false
  });

  const validatePassword = (pass: string) => {
    const requirements = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    };

    return requirements;
  };

  const validateEmailSequence = (email: string) => {
    const parts = email.split('@');
    
    // Mise à jour de l'affichage progressif
    setEmailValidationDisplay({
      showUsername: email.length > 0,
      showAt: parts[0]?.length > 0,
      showDomain: email.includes('@')
    });

    // Validation existante
    const validation = {
      hasUsername: parts[0]?.length > 0,
      hasAt: email.includes('@'),
      hasDomain: parts[1]?.includes('.'),
      isValid: /\S+@\S+\.\S+/.test(email)
    };
    setEmailValidation(validation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors: Record<string, string> = {};

    // Email validation simplifiée
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordReqs = validatePassword(password);
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!Object.values(passwordReqs).every(Boolean)) {
      newErrors.password = 'Password does not meet security requirements';
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Créer d'abord l'authentification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      if (authData.user) {
        // Créer l'utilisateur avec les informations de base
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([
            { 
              id: authData.user.id,
              email,
              created_at: new Date().toISOString(),
              preferences: {
                theme: 'dark',
                language: 'fr',
                notifications: true
              }
            }
          ])
          .select()
          .single();

        if (userError) throw userError;

        onNext({ userId: userData.id, email, password });
      }
    } catch (error: any) {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    onNext({ email: '', password: '', googleAuth: true });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-black"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/90" />

      <div className="relative w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white font-['Orbitron']">Polymat</h1>
          <p className="mt-2 text-zinc-400">Create your account</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">1</div>
            <div className="w-12 h-0.5 bg-zinc-700" />
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-sm">2</div>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 bg-zinc-900/50 backdrop-blur-md p-8 rounded-2xl border border-zinc-800/50 shadow-xl">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmailSequence(e.target.value);
                  setErrors({ ...errors, email: '' });
                }}
                className={`w-full px-4 py-2.5 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-zinc-700/50'
                }`}
                placeholder="Enter your email"
              />
              <div className="mt-1 space-y-1 text-xs">
                {emailValidationDisplay.showUsername && (
                  <div className={`transition-opacity duration-300 ${
                    emailValidation.hasUsername ? 'text-green-500' : 'text-zinc-500'
                  }`}>
                    Username
                  </div>
                )}
                
                {emailValidationDisplay.showAt && (
                  <div className={`transition-opacity duration-300 ${
                    emailValidation.hasAt ? 'text-green-500' : 'text-zinc-500'
                  }`}>
                    @ symbol
                  </div>
                )}
                
                {emailValidationDisplay.showDomain && (
                  <div className={`transition-opacity duration-300 ${
                    emailValidation.hasDomain ? 'text-green-500' : 'text-zinc-500'
                  }`}>
                    Domain (.com, .fr, etc.)
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full px-4 py-2.5 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 ${
                    errors.password ? 'border-red-500' : 'border-zinc-700/50'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs flex gap-4">
                    <div className={validatePassword(password).length ? 'text-green-500' : 'text-zinc-500'}>
                      8+ characters
                    </div>
                    <div className={validatePassword(password).uppercase ? 'text-green-500' : 'text-zinc-500'}>
                      Uppercase
                    </div>
                    <div className={validatePassword(password).lowercase ? 'text-green-500' : 'text-zinc-500'}>
                      Lowercase
                    </div>
                    <div className={validatePassword(password).number ? 'text-green-500' : 'text-zinc-500'}>
                      Number
                    </div>
                    <div className={validatePassword(password).special ? 'text-green-500' : 'text-zinc-500'}>
                      Special char
                    </div>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`w-full px-4 py-2.5 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-zinc-700/50'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Or Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900/50 text-zinc-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-zinc-800/50 text-white rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors border border-zinc-700/50"
            >
              <Mail className="w-5 h-5 text-orange-500" />
              <span>Google</span>
            </button>

            {/* Sign In Link */}
            <div className="pt-4 text-center text-sm text-zinc-400 border-t border-zinc-800/50">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onBack}
                className="text-orange-500 hover:text-orange-400 transition-colors font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};