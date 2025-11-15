'use client';

import { useEffect, useState } from 'react';

export default function Hero() {
  const [content, setContent] = useState({
    title: 'Premium 4G & 5G Mobile Plans',
    subtitle: 'Get the Best Network Coverage',
    description: 'Choose from the top US carriers with unbeatable prices and coverage.',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const websiteContent = localStorage.getItem('websiteContent');
      if (websiteContent) {
        try {
          const parsed = JSON.parse(websiteContent);
          if (parsed.hero) {
            setContent(parsed.hero);
          }
        } catch (e) {
          console.error('Error parsing website content:', e);
        }
      }
    }
  }, []);

  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkBanner = () => {
        const hasClosedBanner = localStorage.getItem('trustBannerClosed');
        setBannerVisible(!hasClosedBanner);
      };
      checkBanner();
      window.addEventListener('bannerClosed', checkBanner);
      return () => window.removeEventListener('bannerClosed', checkBanner);
    }
  }, []);

  return (
    <section id="home" className={`${bannerVisible ? 'pt-44 md:pt-48' : 'pt-32'} pb-16 px-4 bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] relative overflow-hidden transition-all duration-300`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="mb-4 sm:mb-6 inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-white/10">
          <span className="text-xs sm:text-sm md:text-base text-blue-300 font-semibold flex items-center gap-1.5 sm:gap-2">
            <i className="fas fa-rocket text-yellow-400 animate-bounce text-xs sm:text-sm"></i>
            <span className="hidden sm:inline">Trusted by 50,000+ customers nationwide</span>
            <span className="sm:hidden">50,000+ customers</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-fade-in drop-shadow-2xl px-2">
          {content.title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mb-3 sm:mb-4 font-bold drop-shadow-lg px-2">{content.subtitle}</p>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-10 leading-relaxed font-medium px-4">{content.description}</p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
          <a
            href="#plans"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 min-h-[44px]"
          >
            <i className="fas fa-mobile-alt"></i>
            <span>View Plans</span>
            <i className="fas fa-arrow-right"></i>
          </a>
          <a
            href="#about"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center gap-2 sm:gap-3 min-h-[44px]"
          >
            <i className="fas fa-info-circle"></i>
            <span>Learn More</span>
          </a>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-12 max-w-5xl mx-auto px-4">
          <div className="text-center p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <i className="fas fa-tower-broadcast text-2xl sm:text-3xl text-blue-400 mb-2 sm:mb-3 group-hover:scale-125 transition-transform duration-300"></i>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1 sm:mb-2">6+</div>
              <div className="text-white text-xs sm:text-sm font-semibold mb-1">Major Carriers</div>
              <div className="text-[10px] sm:text-xs text-gray-300">Verizon, AT&T, T-Mobile & more</div>
            </div>
          </div>
          <div className="text-center p-4 sm:p-5 md:p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <i className="fas fa-mobile-alt text-2xl sm:text-3xl text-purple-400 mb-2 sm:mb-3 group-hover:scale-125 transition-transform duration-300"></i>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2">50+</div>
              <div className="text-white text-xs sm:text-sm font-semibold mb-1">Premium Plans</div>
              <div className="text-[10px] sm:text-xs text-gray-300">Monthly & annual options</div>
            </div>
          </div>
          <div className="text-center p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-green-500/30 hover:border-green-400/60 transition-all duration-300 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-green-500/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <i className="fas fa-users text-2xl sm:text-3xl text-green-400 mb-2 sm:mb-3 group-hover:scale-125 transition-transform duration-300"></i>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1 sm:mb-2">50K+</div>
              <div className="text-white text-xs sm:text-sm font-semibold mb-1">Happy Customers</div>
              <div className="text-[10px] sm:text-xs text-gray-300">Trusted by thousands</div>
            </div>
          </div>
          <div className="text-center p-4 sm:p-5 md:p-6 bg-gradient-to-br from-pink-500/10 to-pink-600/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-pink-500/30 hover:border-pink-400/60 transition-all duration-300 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <i className="fas fa-signal text-2xl sm:text-3xl text-pink-400 mb-2 sm:mb-3 group-hover:scale-125 transition-transform duration-300"></i>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-1 sm:mb-2">100%</div>
              <div className="text-white text-xs sm:text-sm font-semibold mb-1">Coverage</div>
              <div className="text-[10px] sm:text-xs text-gray-300">Nationwide networks</div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-5 md:pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-gray-400 text-xs sm:text-sm px-4">
          <div className="flex items-center gap-1.5 sm:gap-2 hover:text-white transition-colors group relative">
            <i className="fas fa-shield-alt text-green-400 text-sm sm:text-base"></i>
            <span className="whitespace-nowrap">SSL Secured</span>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-25 animate-ping scale-150"></div>
              <i className="fas fa-check-circle text-green-400 text-xs cursor-pointer relative group-hover:scale-110 transition-all duration-300" style={{ 
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))',
                textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
              }} title="Verified"></i>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 hover:text-white transition-colors group relative">
            <i className="fas fa-lock text-blue-400 text-sm sm:text-base"></i>
            <span className="whitespace-nowrap">PCI Compliant</span>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-25 animate-ping scale-150"></div>
              <i className="fas fa-check-circle text-green-400 text-xs cursor-pointer relative group-hover:scale-110 transition-all duration-300" style={{ 
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))',
                textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
              }} title="Verified"></i>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 hover:text-white transition-colors group relative">
            <i className="fas fa-certificate text-yellow-400 text-sm sm:text-base"></i>
            <span className="whitespace-nowrap hidden sm:inline">Certified Partners</span>
            <span className="whitespace-nowrap sm:hidden">Certified</span>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-25 animate-ping scale-150"></div>
              <i className="fas fa-check-circle text-green-400 text-xs cursor-pointer relative group-hover:scale-110 transition-all duration-300" style={{ 
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))',
                textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
              }} title="Verified"></i>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 hover:text-white transition-colors group relative">
            <i className="fas fa-certificate text-cyan-400 text-sm sm:text-base"></i>
            <span className="whitespace-nowrap hidden sm:inline">Authorized Reseller</span>
            <span className="whitespace-nowrap sm:hidden">Reseller</span>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-25 animate-ping scale-150"></div>
              <i className="fas fa-check-circle text-green-400 text-xs cursor-pointer relative group-hover:scale-110 transition-all duration-300" style={{ 
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))',
                textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
              }} title="Verified"></i>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 hover:text-white transition-colors group relative">
            <i className="fas fa-award text-purple-400 text-sm sm:text-base"></i>
            <span className="whitespace-nowrap hidden sm:inline">Best Service 2025</span>
            <span className="whitespace-nowrap sm:hidden">Best 2025</span>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-25 animate-ping scale-150"></div>
              <i className="fas fa-check-circle text-green-400 text-xs cursor-pointer relative group-hover:scale-110 transition-all duration-300" style={{ 
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))',
                textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
              }} title="Verified"></i>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

