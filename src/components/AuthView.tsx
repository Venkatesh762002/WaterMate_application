import React, { useState } from 'react';
import { Droplet, Shield, ArrowRight, UserCheck, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface AuthViewProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ identifier, password });
        onAuthSuccess(res.user);
      } else {
        const res = await api.signup({
          username,
          email,
          name,
          password,
          phone: phone || undefined,
          upiId: upiId || undefined,
        });
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUser: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({
        identifier: demoUser,
        password: 'password123',
      });
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20 mb-4">
          <Droplet className="w-9 h-9 fill-sky-200 text-white animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">WaterMate</h1>
        <p className="mt-2 text-sm text-slate-600">
          Shared water can ordering, vendor dues & roommate expense tracking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          {/* Quick Demo Switcher */}
          <div className="mb-6 p-4 rounded-xl bg-sky-50 border border-sky-100">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 mb-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Instant Roommate Demo Login</span>
            </div>
            <p className="text-xs text-sky-700 mb-3">
              Jump directly into the demo room "Green Valley 304" with sample orders and live balances:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-login-rahul"
                onClick={() => handleDemoLogin('rahul')}
                disabled={loading}
                className="px-2.5 py-2 text-xs font-medium bg-white text-slate-800 border border-sky-200 rounded-lg hover:bg-sky-600 hover:text-white transition-all shadow-xs text-center flex flex-col items-center gap-1"
              >
                <span className="font-semibold">Rahul (Admin)</span>
                <span className="text-[10px] opacity-75">Sky Blue</span>
              </button>
              <button
                type="button"
                id="demo-login-alex"
                onClick={() => handleDemoLogin('alex')}
                disabled={loading}
                className="px-2.5 py-2 text-xs font-medium bg-white text-slate-800 border border-sky-200 rounded-lg hover:bg-sky-600 hover:text-white transition-all shadow-xs text-center flex flex-col items-center gap-1"
              >
                <span className="font-semibold">Alex</span>
                <span className="text-[10px] opacity-75">Teal</span>
              </button>
              <button
                type="button"
                id="demo-login-sameer"
                onClick={() => handleDemoLogin('sameer')}
                disabled={loading}
                className="px-2.5 py-2 text-xs font-medium bg-white text-slate-800 border border-sky-200 rounded-lg hover:bg-sky-600 hover:text-white transition-all shadow-xs text-center flex flex-col items-center gap-1"
              >
                <span className="font-semibold">Sameer</span>
                <span className="text-[10px] opacity-75">Indigo</span>
              </button>
            </div>
          </div>

          <div className="flex border-b border-slate-200 mb-6">
            <button
              id="tab-login"
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors ${
                isLogin ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Log In
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors ${
                !isLogin ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username or Email
                  </label>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. rahul or rahul@watermate.internal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <input
                      id="signup-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. rahul"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone (Optional)
                    </label>
                    <input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      UPI ID (Optional)
                    </label>
                    <input
                      id="signup-upi"
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. name@upi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              id="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to WaterMate' : 'Create Roommate Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-slate-400" />
          <span>Room-level data isolation & secure financial auditing</span>
        </div>
      </div>
    </div>
  );
};
