'use client';

import { useEffect, useState } from 'react';

export default function CarrierSection() {
  const [carrierLogos, setCarrierLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {carriers.map(carrier => (
            <div
              key={carrier.key}
              onClick={() => handleCarrierClick(carrier.key)}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group hover:shadow-xl hover:shadow-blue-500/20"
            >
              <div className="flex flex-col items-center justify-center text-center">
                {carrierLogos[carrier.key] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={carrierLogos[carrier.key]}
                      alt={carrier.name}
                      className="w-20 h-20 object-contain mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ filter: 'none' }}
                    />
                  </>
                ) : (
                  <div className={`w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300 ${carrier.color}`}>
                    <i className="fas fa-signal text-3xl"></i>
                  </div>
                )}
                <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{carrier.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

