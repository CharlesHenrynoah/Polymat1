import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import supabase from '../config/configdb';
import { useLocation, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { FcGoogle } from 'react-icons/fc';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('test').select('*').limit(1);
        if (error) {
          setConnectionStatus('Erreur de connexion à Supabase: ' + error.message);
        } else {
          setConnectionStatus('Connexion à Supabase réussie!');
        }
      } catch (err) {
        setConnectionStatus('Erreur inattendue lors de la connexion');
      }
    };

    testConnection();
  }, []);

  useEffect(() => {
    if (location.state && location.state.message) {
      setRedirectMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login failed:', error);
        return;
      }

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile?.username) {
          navigate(`/workspace/${profile.username}`);
        } else {
          navigate('/signup/level2', { state: { email, id: session.user.id } });
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur Google Auth:', error);
    } finally {
      setIsLoading(false);
    }
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
        {/* Status de connexion Supabase */}
        {connectionStatus && (
          <div className={`mb-4 p-3 rounded-lg text-center ${
            connectionStatus.includes('réussie') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {connectionStatus}
          </div>
        )}

        {/* Redirect Message */}
        {redirectMessage && (
          <ErrorMessage 
            message={redirectMessage} 
            onDismiss={() => setRedirectMessage(null)} 
            type="info" 
          />
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white font-['Orbitron']">Polymat</h1>
          <p className="mt-2 text-zinc-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-zinc-300 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                    rememberMe ? 'bg-orange-500' : 'bg-zinc-700'
                  }`} />
                </div>
                <span className="ml-2 select-none">Remember me</span>
              </label>
              <button
                type="button"
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <span>Sign in</span>
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

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="w-5 h-5" />
              <span>{isLoading ? 'Chargement...' : 'Continue with Google'}</span>
            </button>

            {/* Sign Up Link */}
            <div className="pt-4 text-center text-sm text-zinc-400 border-t border-zinc-800/50">
              Don't have an account?{' '}
              <button type="button" className="text-orange-500 hover:text-orange-400 transition-colors font-medium">
                Create one now
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
