import React, { useState } from 'react';
import { Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export const LoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMessage('Username and password are required.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.login(trimmedUser, password);
      setAuth(res.token, res.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-neutral-dark rounded-xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-3 border border-primary/30">
            <Lock size={22} />
          </div>
          <h1 className="font-montserrat font-bold text-2xl text-white tracking-wide">
            RAVIN CMS
          </h1>
          <p className="text-neutral text-xs sm:text-sm mt-1">
            Admin authentication required to manage portfolio content
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-700/50 rounded-lg flex items-start gap-2.5 text-red-300 text-xs sm:text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-montserrat uppercase font-semibold text-neutral-light mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral">
                <UserIcon size={16} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                required
                autoComplete="username"
                className="w-full pl-10 pr-3.5 py-2.5 bg-surface-card border border-neutral-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary placeholder:text-neutral/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-montserrat uppercase font-semibold text-neutral-light mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-surface-card border border-neutral-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary placeholder:text-neutral/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-montserrat font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer border border-primary/50 shadow-md"
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In to Panel'}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-neutral-dark text-center">
          <p className="text-xs text-neutral">
            Protected endpoint via Cloudflare Workers &amp; JWT
          </p>
        </div>
      </div>
    </div>
  );
};
