'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [websiteName, setWebsiteName] = useState('US Mobile Networks');
  const [bannerClosed, setBannerClosed] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check admin auth function - strict validation
  const checkAdminAuth = () => {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('adminAuth');
      if (!authData) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const parsed = JSON.parse(authData);
        // Strict check: must have all required fields and not expired
        if (
          parsed.isAuthenticated === true &&
          parsed.expiresAt &&
          typeof parsed.expiresAt === 'number' &&
          parsed.expiresAt > Date.now()
        ) {
          setIsAdmin(true);
        } else {
          // Auth expired or invalid - remove it
          localStorage.removeItem('adminAuth');
          setIsAdmin(false);
        }
      } catch (e) {
        // Invalid JSON - remove it
        localStorage.removeItem('adminAuth');
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Load website name from localStorage (admin settings)
    if (typeof window !== 'undefined') {
      // First, clean up any invalid auth data
      const authData = localStorage.getItem('adminAuth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          // Remove if expired or invalid
          if (!parsed.isAuthenticated || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
            localStorage.removeItem('adminAuth');
          }
        } catch (e) {
          // Invalid data, remove it
          localStorage.removeItem('adminAuth');
        }
      }

      const loadWebsiteName = () => {
        const settings = localStorage.getItem('adminSettings');
        if (settings) {
          try {
            const parsed = JSON.parse(settings);
            if (parsed.websiteName) {
              setWebsiteName(parsed.websiteName);
            }
          } catch (e) {
            console.error('Error parsing admin settings:', e);
          }
        }
      };

      // Load immediately
      loadWebsiteName();

      // Listen for storage changes (when admin updates settings)
      window.addEventListener('storage', loadWebsiteName);
      
      // Also listen for custom event when settings are saved
      const handleSettingsUpdate = () => {
        loadWebsiteName();
      };
      window.addEventListener('settingsUpdated', handleSettingsUpdate);
      
      // Use BroadcastChannel to sync across tabs/windows
      let broadcastChannel: BroadcastChannel | null = null;
      try {
        broadcastChannel = new BroadcastChannel('settings-sync');
        broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'settingsUpdated') {
            loadWebsiteName();
          }
        };
      } catch (e) {
        console.log('BroadcastChannel not supported');
      }
      
      // Also sync from server for cross-device sync
      const syncFromServer = async () => {
        try {
          const response = await fetch('/api/settings');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.settings) {
              const serverSettings = JSON.stringify(data.settings);
              const currentSettings = localStorage.getItem('adminSettings');
              
              // Only update if server has newer settings
              if (!currentSettings || currentSettings !== serverSettings) {
                localStorage.setItem('adminSettings', serverSettings);
                loadWebsiteName();
              }
            }
          }
        } catch (error) {
          // Ignore errors, will retry on next interval
        }
      };
      
      // Listen for force sync event (when admin saves)
      const handleForceSync = async () => {
        await syncFromServer();
      };
      window.addEventListener('forceSettingsSync', handleForceSync);
      
      // Sync from server immediately and then periodically
      syncFromServer();
      const serverSyncInterval = setInterval(syncFromServer, 1000); // Check every 1 second for faster sync
      
      // Also check periodically in case settings are updated in the same tab
      const settingsInterval = setInterval(loadWebsiteName, 200);

      // Check if banner is closed
      const hasClosedBanner = localStorage.getItem('trustBannerClosed');
      setBannerClosed(!!hasClosedBanner);

      // Listen for banner close events
      const handleBannerClose = () => {
        setBannerClosed(true);
      };
      window.addEventListener('bannerClosed', handleBannerClose);

      // Initial admin check (after cleanup)
      checkAdminAuth();
      
      // Check auth periodically
      const authInterval = setInterval(checkAdminAuth, 60000); // Check every minute
      
      // Listen for admin login/logout events
      const handleAdminAuthChange = () => {
        checkAdminAuth();
      };
      window.addEventListener('adminLoggedIn', handleAdminAuthChange);
      window.addEventListener('adminLoggedOut', handleAdminAuthChange);

      return () => {
        window.removeEventListener('storage', loadWebsiteName);
        window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        window.removeEventListener('forceSettingsSync', handleForceSync);
        window.removeEventListener('bannerClosed', handleBannerClose);
        window.removeEventListener('adminLoggedIn', handleAdminAuthChange);
        window.removeEventListener('adminLoggedOut', handleAdminAuthChange);
        if (broadcastChannel) {
          broadcastChannel.close();
        }
        clearInterval(settingsInterval);
        clearInterval(serverSyncInterval);
        clearInterval(authInterval);
      };
    }
  }, []);

  return (
      <header className={`fixed left-0 right-0 z-40 bg-gradient-to-r from-[#0a0e27]/98 via-[#1a1f3a]/98 to-[#0a0e27]/98 backdrop-blur-xl border-b border-white/20 shadow-2xl transition-all duration-300 ${bannerClosed ? 'top-0' : 'top-[64px] md:top-[72px]'}`}>
        <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer no-underline group">
              <div className="relative">
                <i className="fas fa-signal text-white group-hover:scale-110 transition-transform duration-300 text-base sm:text-lg"></i>
                <span className="absolute top-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></span>
              </div>
              <span className="truncate max-w-[140px] sm:max-w-none">{websiteName}</span>
              <span className="text-xs bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-normal ml-1 sm:ml-2 hidden md:inline">
                Verified
              </span>
            </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#home" className="hover:text-blue-400 transition-colors">Home</Link>
            <Link href="#plans" className="hover:text-blue-400 transition-colors">Plans</Link>
            <Link href="#about" className="hover:text-blue-400 transition-colors">About</Link>
            <Link href="#contact" className="hover:text-blue-400 transition-colors">Contact</Link>
            {isAdmin && (
              <Link href="/admin" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Admin
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4">
            <Link href="#home" className="hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="#plans" className="hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Plans</Link>
            <Link href="#about" className="hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="#contact" className="hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            {isAdmin && (
              <Link href="/admin" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-center">
                Admin
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

