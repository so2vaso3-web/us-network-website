'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadPaymentMethods = () => {
        const settings = localStorage.getItem('adminSettings');
        if (!settings) {
          setPaymentMethods([]);
          return;
        }
        
        try {
          const parsed = JSON.parse(settings);
          const methods = [];
          
          // PayPal
          if (parsed.paypalEnabled && parsed.paypalClientId) {
            methods.push({
              name: 'PayPal',
              icon: 'fab fa-paypal',
              color: 'text-blue-400',
              bgColor: 'bg-blue-500/10',
              borderColor: 'border-blue-500/30'
            });
          }
          
          // Cryptocurrencies
          if (parsed.cryptoEnabled) {
            if (parsed.bitcoinAddress) {
              methods.push({
                name: 'Bitcoin',
                icon: 'fab fa-bitcoin',
                color: 'text-orange-400',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/30'
              });
            }
            if (parsed.ethereumAddress) {
              methods.push({
                name: 'Ethereum',
                icon: 'fab fa-ethereum',
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/30'
              });
            }
            if (parsed.usdtAddress) {
              methods.push({
                name: 'USDT',
                icon: 'fas fa-coins',
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/30'
              });
            }
            if (parsed.bnbAddress) {
              methods.push({
                name: 'BNB',
                icon: 'fas fa-coins',
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/30'
              });
            }
          }
          
          setPaymentMethods(methods);
        } catch (e) {
          console.error('Error loading payment methods:', e);
          setPaymentMethods([]);
        }
      };
      
      // Load immediately
      loadPaymentMethods();
      
      // Listen for storage changes (works across tabs/windows)
      window.addEventListener('storage', loadPaymentMethods);
      
      // Also listen for custom event when settings are saved
      const handleSettingsUpdate = () => {
        loadPaymentMethods();
      };
      window.addEventListener('settingsUpdated', handleSettingsUpdate);
      
      // Use BroadcastChannel to sync across tabs/windows
      let broadcastChannel: BroadcastChannel | null = null;
      try {
        broadcastChannel = new BroadcastChannel('settings-sync');
        broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'settingsUpdated') {
            loadPaymentMethods();
          }
        };
      } catch (e) {
        console.log('BroadcastChannel not supported');
      }
      
      // Check periodically in case settings are updated in the same tab
      // Also sync from server for cross-device sync
      let lastSyncTime = 0;
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
                loadPaymentMethods();
                lastSyncTime = Date.now();
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
      
      const interval = setInterval(loadPaymentMethods, 200);
      
      return () => {
        window.removeEventListener('storage', loadPaymentMethods);
        window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        window.removeEventListener('forceSettingsSync', handleForceSync);
        if (broadcastChannel) {
          broadcastChannel.close();
        }
        clearInterval(interval);
        clearInterval(serverSyncInterval);
      };
    }
  }, []);
  return (
    <footer className="bg-[#0a0e27] border-t border-white/10 py-8 px-4 mt-8 relative overflow-hidden -mt-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              US Mobile Networks
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Premium mobile network plans from top US carriers at competitive prices.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><a href="#home" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="#plans" className="hover:text-blue-400 transition-colors">Plans</a></li>
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Follow Us</h4>
            <div className="flex gap-3 sm:gap-4">
              <a href="#" className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-blue-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px]">
                <i className="fab fa-facebook text-blue-400 text-base sm:text-lg"></i>
              </a>
              <a href="#" className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-pink-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px]">
                <i className="fab fa-instagram text-pink-400 text-base sm:text-lg"></i>
              </a>
              <a href="#" className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-blue-400/20 flex items-center justify-center transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px]">
                <i className="fab fa-twitter text-blue-400 text-base sm:text-lg"></i>
              </a>
            </div>
          </div>
        </div>
        {/* Certifications & Trust Badges */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <h4 className="text-center text-lg sm:text-xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent px-4">
            Trusted & Certified
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 items-center justify-items-center px-4">
            {/* PCI DSS */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 relative w-full">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-xs sm:text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-shield-alt text-lg sm:text-xl md:text-2xl text-blue-400"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-center">PCI DSS</span>
              <span className="text-[9px] sm:text-xs text-gray-400 text-center">Compliant</span>
            </div>

            {/* SSL Certificate */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-105 relative w-full">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-xs sm:text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/30 flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-lock text-lg sm:text-xl md:text-2xl text-green-400"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-center">SSL</span>
              <span className="text-[9px] sm:text-xs text-gray-400 text-center">Encrypted</span>
            </div>

            {/* Better Business Bureau */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 relative w-full">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-xs sm:text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/30 flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-award text-lg sm:text-xl md:text-2xl text-yellow-400"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-center">BBB</span>
              <span className="text-[9px] sm:text-xs text-gray-400 text-center">A+ Rated</span>
            </div>

            {/* Norton Secured */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 relative w-full">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-xs sm:text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-check-circle text-lg sm:text-xl md:text-2xl text-purple-400"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-center">Norton</span>
              <span className="text-[9px] sm:text-xs text-gray-400 text-center">Secured</span>
            </div>

            {/* Money Back Guarantee */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 relative w-full">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-xs sm:text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-2 border-pink-500/30 flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-undo-alt text-lg sm:text-xl md:text-2xl text-pink-400"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-center">30-Day</span>
              <span className="text-[9px] sm:text-xs text-gray-400 text-center">Guarantee</span>
            </div>

            {/* Authorized Reseller */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 relative w-full">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-xs sm:text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-2 border-cyan-500/30 flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-certificate text-lg sm:text-xl md:text-2xl text-cyan-400"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-center">Authorized</span>
              <span className="text-[9px] sm:text-xs text-gray-400 text-center">Reseller</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        {paymentMethods.length > 0 && (
          <div className="border-t border-white/10 pt-6 sm:pt-8 mb-6 sm:mb-8">
            <h4 className="text-center text-lg sm:text-xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent px-4">
              Accepted Payment Methods
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 px-4">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 ${method.bgColor} rounded-lg border ${method.borderColor} hover:scale-105 transition-all duration-300`}
                >
                  <i className={`${method.icon} ${method.color} text-lg sm:text-xl md:text-2xl`}></i>
                  <span className="text-white font-semibold text-xs sm:text-sm md:text-base">{method.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm px-4">
          <p>&copy; {new Date().getFullYear()} US Mobile Networks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

