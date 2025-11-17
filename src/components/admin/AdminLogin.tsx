'use client';

import { useState, useEffect } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('adminAuth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed.isAuthenticated && parsed.expiresAt > Date.now()) {
            onLogin();
          }
        } catch (e) {
          localStorage.removeItem('adminAuth');
        }
      }
    }
  }, [onLogin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay for better UX
    setTimeout(() => {
      // Get admin credentials from settings
      if (typeof window !== 'undefined') {
        const settings = localStorage.getItem('adminSettings');
        let adminUsername = 'admin';
        let adminPassword = '123123aA@';

        if (settings) {
          try {
            const parsed = JSON.parse(settings);
            adminUsername = parsed.adminUsername || 'admin';
            // Only use saved password if it exists, otherwise use default
            if (parsed.adminPassword && parsed.adminPassword.trim() !== '') {
              adminPassword = parsed.adminPassword;
            }
          } catch (e) {
            console.error('Error loading admin settings:', e);
          }
        }

        // Validate credentials
        if (username === adminUsername && password === adminPassword) {
          // Save auth data with expiration (24 hours)
          const authData = {
            isAuthenticated: true,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            loginTime: Date.now(),
          };
          localStorage.setItem('adminAuth', JSON.stringify(authData));
          
          // Dispatch event to notify header
          window.dispatchEvent(new Event('adminLoggedIn'));
          
          onLogin();
        } else {
          setError('Invalid username or password');
          setLoading(false);
        }
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-blue-500/30">
              <i className="fas fa-shield-alt text-3xl text-blue-400"></i>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Admin Login
            </h1>
            <p className="text-gray-400 text-sm">Enter your credentials to access admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

