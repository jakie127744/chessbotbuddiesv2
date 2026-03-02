'use client';

import { useState } from 'react';
import { Mail, Lock, User, LogIn, ArrowRight, ShieldCheck, Gamepad2, AlertCircle, CheckCircle } from 'lucide-react';
import { loginUser, registerUser, resetPassword, UserProfile, getUserProfile } from '@/lib/user-profile';
import { Mascot } from './Mascot';
import { COUNTRIES } from '@/lib/countries';
import { FlagComponent } from './FlagComponent';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
  onClose: () => void; // Optional if we want to allow closing without auth (guest mode?)
}

type AuthMode = 'login' | 'register' | 'reset';

export function AuthModal({ isOpen, onSuccess, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('US');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStats, setPasswordStats] = useState({
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasMinLen: false
  });

  const checkPassword = (val: string) => {
    setPassword(val);
    setPasswordStats({
        hasLower: /[a-z]/.test(val),
        hasUpper: /[A-Z]/.test(val),
        hasNumber: /[0-9]/.test(val),
        hasMinLen: val.length >= 8
    });
  };

  if (!isOpen) return null;

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // Input Sanitization
      const cleanEmail = email.trim().toLowerCase();

      // Simulate network delay for better UX feel
      await new Promise(resolve => setTimeout(resolve, 800));

      if (mode === 'register') {
        if (!cleanEmail || !password || !confirmPassword) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        
        if (!isValidEmail(cleanEmail)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 8 || !passwordStats.hasLower || !passwordStats.hasUpper || !passwordStats.hasNumber) {
           setError('Password must be at least 8 characters and include uppercase, lowercase, and numbers');
           setLoading(false);
           return;
        }

        // Check for existing Guest Profile to migrate
        const currentProfile = getUserProfile();
        const isGuest = currentProfile?.id.startsWith('guest_');
        
        // Pass guest profile as 'sourceProfile' to migrate stats
        const result = await registerUser(cleanEmail, password, country, isGuest ? currentProfile : null);
        
        if (result.success && result.user) {
          onSuccess(result.user);
        } else {
          setError(result.error || 'Registration failed');
        }
      } else if (mode === 'login') {
        if (!cleanEmail || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        
        // We can be looser on login, but still good to trim
        if (!isValidEmail(cleanEmail)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        const result = await loginUser(cleanEmail, password);
        if (result.success && result.user) {
          onSuccess(result.user);
        } else {
          setError(result.error || 'Invalid credentials');
        }
      } else if (mode === 'reset') {
        if (!cleanEmail) {
             setError('Please enter your email');
             setLoading(false);
             return;
        }
        
        if (!isValidEmail(cleanEmail)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }
        
        // Only require password if user entered one (Local mode implied by user action, or we can force it if local error occurs)
        if (password && password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        
        // Reset Password Handling
        const result = await resetPassword(cleanEmail, password || undefined);
        if (result.success) {
            setSuccessMsg('If an account exists, a reset link has been sent!');
            // For local, it might have reset immediately, but "link sent" is safe generic msg or we can be specific
            if (password) setSuccessMsg('Password updated successfully! Please login.');
            
            setTimeout(() => {
                setMode('login');
                setPassword('');
                setConfirmPassword('');
                setEmail(''); // Clear for privacy/clean state
            }, 2000);
        } else {
            setError(result.error || 'Failed to reset password');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
      setMode(newMode);
      setError(null);
      setSuccessMsg(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[var(--color-bg-tertiary)] rounded-3xl shadow-2xl flex flex-col my-auto max-h-[95vh] animate-in slide-in-from-bottom-8 duration-500 border-4 border-[var(--color-success)]/30">
        
        {/* Scrollable Content Container */}
        <div className="overflow-y-auto custom-scrollbar w-full h-full"> 
            {/* Decorative Background Elements */}
            <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br transition-colors duration-500 ${mode === 'reset' ? 'from-orange-400 to-red-500' : 'from-emerald-500 to-green-600'}`} />
            
            <div className="pt-8 pb-8 px-6 md:px-8 relative z-0 flex flex-col items-center">
                
                {/* Mascot Wrapper - Moved inside flow or kept absolute but managed */}
                <div className="mb-6 relative z-10 p-1 bg-[var(--color-bg-tertiary)] rounded-full shadow-lg">
                    <Mascot size={64} />
                </div>

              <div className="text-center mb-6 w-full">
                <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-2 leading-tight">
                  {mode === 'login' && 'Welcome Back!'}
                  {mode === 'register' && 'Join the Adventure!'}
                  {mode === 'reset' && 'Reset Password'}
                </h2>
                <p className="text-zinc-500 font-medium text-sm md:text-base">
                  {mode === 'login' && 'Your chess buddies missed you!'}
                  {mode === 'register' && 'Create your account to start your journey.'}
                  {mode === 'reset' && 'Enter your email and a shiny new password.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center border-l-4 border-red-500 animate-in shake flex items-center justify-center gap-2">
                    <AlertCircle size={16} className="shrink-0" /> <span className="break-words">{error}</span>
                  </div>
                )}
                
                {successMsg && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-bold text-center border-l-4 border-green-500 animate-in slide-in-from-top-2 flex items-center justify-center gap-2">
                        <CheckCircle size={16} className="shrink-0" /> {successMsg}
                    </div>
                )}

                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                      }}
                      className="w-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[var(--color-success)] focus:bg-[var(--color-bg-tertiary)] transition-all placeholder:text-[var(--color-text-muted)] text-sm md:text-base"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                      type="password"
                      placeholder={mode === 'reset' ? "New Password" : "Password"}
                      value={password}
                      onChange={(e) => {
                          checkPassword(e.target.value);
                          setError(null);
                      }}
                      className="w-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[var(--color-success)] focus:bg-[var(--color-bg-tertiary)] transition-all placeholder:text-[var(--color-text-muted)] text-sm md:text-base"
                    />
                  </div>

                  {mode === 'register' && (
                      <div className="grid grid-cols-2 gap-2 px-2 animate-in fade-in slide-in-from-top-1">
                          <div className={`flex items-center gap-2 text-[10px] font-bold ${passwordStats.hasLower ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${passwordStats.hasLower ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                              Lowercase (a-z)
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-bold ${passwordStats.hasUpper ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${passwordStats.hasUpper ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                              Uppercase (A-Z)
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-bold ${passwordStats.hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${passwordStats.hasNumber ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                              Number (0-9)
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-bold ${passwordStats.hasMinLen ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${passwordStats.hasMinLen ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                              Min 8 Chars
                          </div>
                      </div>
                  )}
                  {(mode === 'register' || mode === 'reset') && (
                    <div className="relative group animate-in slide-in-from-top-2 fade-in">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError(null);
                        }}
                        className="w-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[var(--color-success)] focus:bg-[var(--color-bg-tertiary)] transition-all placeholder:text-[var(--color-text-muted)] text-sm md:text-base"
                      />
                    </div>
                  )}

                  {mode === 'register' && (
                      <div className="relative group animate-in slide-in-from-top-3 fade-in">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                              <FlagComponent country={country} className="w-6 h-4 object-cover rounded-[2px] shadow-sm" />
                          </div>
                          <select
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[var(--color-success)] focus:bg-[var(--color-bg-tertiary)] transition-all appearance-none cursor-pointer text-sm md:text-base"
                          >
                              {COUNTRIES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                      {c.name}
                                  </option>
                              ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                      </div>
                  )}
                </div>
                
                {mode === 'login' && (
                    <div className="flex justify-end">
                        <button 
                            type="button"
                            onClick={() => switchMode('reset')}
                            className="text-xs md:text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 w-full text-white text-base md:text-lg font-black py-3 md:py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 group
                    ${mode === 'reset' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-deep-navy hover:bg-slate-800'}
                  `}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' && 'Login'}
                      {mode === 'register' && 'Step Inside'}
                      {mode === 'reset' && 'Send Reset Link'}
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-zinc-500 text-sm font-medium mb-2">
                  {mode === 'login' && "Don't have an account?"}
                  {mode === 'register' && "Already a hero?"}
                  {mode === 'reset' && "Remembered it?"}
                </p>
                <button
                  onClick={() => {
                    if (mode === 'reset') switchMode('login');
                    else switchMode(mode === 'login' ? 'register' : 'login');
                  }}
                  className="text-emerald-600 font-black hover:text-emerald-700 hover:underline transition-colors"
                >
                  {mode === 'login' && 'Create Account'}
                  {mode === 'register' && 'Login Here'}
                  {mode === 'reset' && 'Back to Login'}
                </button>
              </div>

              {/* Guest Option */}
              {(mode === 'login' || mode === 'register') && (
                  <div className="mt-4 pt-4 border-t border-white/10 w-full text-center">
                      <button
                          onClick={onClose}
                          className="text-slate-400 hover:text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 mx-auto group"
                      >
                          <Gamepad2 size={16} className="group-hover:text-emerald-400 transition-colors" />
                          Just want to look around? <span className="underline decoration-slate-600 hover:decoration-emerald-400">Continue as Guest</span>
                      </button>
                  </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
