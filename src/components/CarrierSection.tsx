'use client';

import { useEffect, useState } from 'react';

export default function CarrierSection() {
  const [carrierLogos, setCarrierLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadLogos = () => {
        const settings = localStorage.getItem('adminSettings');
        if (settings) {
          try {
            const parsed = JSON.parse(settings);
            if (parsed.carrierLogos) {
              setCarrierLogos(parsed.carrierLogos);
            }
          } catch (e) {
            console.error('Error loading carrier logos:', e);
          }
        }
      };
      
      // Load immediately
      loadLogos();
      
      // Listen for storage changes (when admin updates settings)
      window.addEventListener('storage', loadLogos);
      
      // Also listen for custom event when settings are saved
      const handleSettingsUpdate = () => {
        loadLogos();
      };
      window.addEventListener('settingsUpdated', handleSettingsUpdate);
      
      // Use BroadcastChannel to sync across tabs/windows
      let broadcastChannel: BroadcastChannel | null = null;
      try {
        broadcastChannel = new BroadcastChannel('settings-sync');
        broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'settingsUpdated') {
            loadLogos();
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
                loadLogos();
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
      const interval = setInterval(loadLogos, 200);
      
      return () => {
        window.removeEventListener('storage', loadLogos);
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

  const carriers = [
    { key: 'verizon', name: 'Verizon', color: 'text-red-500' },
    { key: 'att', name: 'AT&T', color: 'text-blue-400' },
    { key: 'tmobile', name: 'T-Mobile', color: 'text-pink-400' },
    { key: 'uscellular', name: 'US Cellular', color: 'text-blue-500' },
    { key: 'mintmobile', name: 'Mint Mobile', color: 'text-green-400' },
    { key: 'cricket', name: 'Cricket', color: 'text-green-500' },
  ];

  const handleCarrierClick = (carrierKey: string) => {
    // Dispatch custom event to trigger filter in PlansSection
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('filterByCarrier', { detail: { carrier: carrierKey } }));
      
      // Scroll to plans section smoothly
      const plansSection = document.getElementById('plans');
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] relative overflow-hidden -mt-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Our Carriers
        </h2>
        <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
          Partnered with the top mobile network providers in the United States
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {carriers.map(carrier => (
            <div
              key={carrier.key}
              onClick={() => handleCarrierClick(carrier.key)}
              className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group hover:shadow-xl hover:shadow-blue-500/20"
            >
              <div className="flex flex-col items-center justify-center text-center">
                {carrierLogos[carrier.key] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={carrierLogos[carrier.key]}
                      alt={carrier.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ filter: 'none', maxWidth: '100%', height: 'auto' }}
                    />
                  </>
                ) : (
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:bg-white/20 transition-all duration-300 ${carrier.color}`}>
                    <i className="fas fa-signal text-xl sm:text-2xl md:text-3xl"></i>
                  </div>
                )}
                <h3 className="font-bold text-xs sm:text-sm md:text-lg group-hover:text-blue-400 transition-colors">{carrier.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

