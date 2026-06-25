import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const friendlyError = (msg: string) => {
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password. Please check your credentials and try again.';
    if (msg.includes('Email not confirmed')) return 'Please check your email and confirm your account first.';
    if (msg.includes('User already registered')) return 'An account with this email already exists. Please sign in instead.';
    if (msg.includes('Database error')) return 'Account created! Please sign in now.';
    if (msg.includes('Password should be')) return 'Password must be at least 6 characters long.';
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(friendlyError(error.message));
      } else {
        if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          // "Database error saving new user" sometimes means the auth user was created
          // but the profile trigger failed — in that case, try signing in directly
          if (error.message.includes('Database error')) {
            const { error: signInErr } = await signIn(email, password);
            if (!signInErr) return;
          }
          setError(friendlyError(error.message));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <GraduationCap className="w-9 h-9 text-white" />
            <span className="text-2xl font-bold text-white">LearnHub</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              Unlock Your Learning Potential
            </h1>
            <p className="text-primary-100 text-lg leading-relaxed">
              Access thousands of courses taught by world-class instructors. Learn at your own pace, track your progress, and earn certificates.
            </p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Courses', value: '500+' },
            { label: 'Students', value: '50K+' },
            { label: 'Instructors', value: '200+' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-primary-200 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <GraduationCap className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">LearnHub</span>
          </div>

          <div className="card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
                {mode === 'login' ? "Sign in to continue learning" : 'Start your learning journey today'}
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm animate-slide-down">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    className="input"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-2.5">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {mode === 'login' && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400 text-center">
                <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                Demo: use any email/password to register, then sign in
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
