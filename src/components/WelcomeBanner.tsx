'use client';

import { useState, useEffect } from 'react';

export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // Không hiển thị trên admin page
      if (currentPath.startsWith('/admin')) {
        console.log('Admin page - banner hidden');
        return;
      }
      
      // CHỈ check "never show" - banner luôn hiện khi tải lại trang (trừ khi đóng vĩnh viễn)
      const neverShow = localStorage.getItem('welcomeBannerNeverShow');
      if (neverShow === 'true') {
        console.log('Banner dismissed permanently - not showing');
        return;
      }
      
      // Show banner after 1 second - LUÔN hiện khi tải lại trang
      console.log('Setting timer to show banner in 1 second...');
      const timer = setTimeout(() => {
        const currentPathCheck = window.location.pathname;
        
        // Double check path
        if (currentPathCheck.startsWith('/admin')) {
          console.log('Admin page check - banner hidden');
          return;
        }
        
        // Double check never show
        const neverShowCheck = localStorage.getItem('welcomeBannerNeverShow');
        if (neverShowCheck === 'true') {
          console.log('Never show check - banner hidden');
          return;
        }
        
        console.log('✅ Showing welcome banner NOW!');
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss1Hour = () => {
    // Chỉ ẩn banner trong session hiện tại, không lưu vào localStorage
    // Banner sẽ hiện lại khi tải lại trang
    setIsVisible(false);
    console.log('Banner dismissed for this session - will show again on page reload');
  };

  const handleNeverShow = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('welcomeBannerNeverShow', 'true');
      console.log('Banner dismissed permanently');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-hidden">
      <div className="relative bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#2d3561] rounded-2xl sm:rounded-3xl border-2 border-white/30 shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Animated background effects - contained within rounded corners */}
        <div className="absolute inset-0 opacity-40 overflow-hidden" style={{ borderRadius: 'inherit' }}>
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
        </div>

        {/* Decorative top border với glow effect - contained within rounded corners */}
        <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/50 overflow-hidden" style={{ borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}></div>
        
        {/* Trust badges ở góc trên - responsive */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2 z-20 max-w-[calc(100%-4rem)] sm:max-w-none">
          <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/50 flex items-center gap-1 sm:gap-1.5">
            <i className="fas fa-shield-check text-green-400 text-[10px] sm:text-xs"></i>
            <span className="text-green-300 text-[10px] sm:text-xs font-semibold">Verified</span>
          </div>
          <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/50 flex items-center gap-1 sm:gap-1.5">
            <i className="fas fa-certificate text-blue-400 text-[10px] sm:text-xs"></i>
            <span className="text-blue-300 text-[10px] sm:text-xs font-semibold">Certified</span>
          </div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 md:p-8 pt-12 sm:pt-16 md:pt-8">
          {/* Close button - responsive */}
          <button
            onClick={handleDismiss1Hour}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 text-white z-20 shadow-lg"
            aria-label="Close banner"
          >
            <i className="fas fa-times text-sm sm:text-lg"></i>
          </button>

          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 sm:mb-3 px-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                Welcome to Zenith 5G
              </span>
            </h2>
            <p className="text-gray-200 text-sm sm:text-base md:text-lg font-medium px-2">
              Your trusted partner for premium mobile plans
            </p>
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 mt-3">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <i className="fas fa-star text-yellow-400 text-xs sm:text-sm"></i>
                <span className="text-gray-300 text-xs sm:text-sm font-semibold">4.9/5 Rating</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <i className="fas fa-award text-yellow-400 text-xs sm:text-sm"></i>
                <span className="text-gray-300 text-xs sm:text-sm font-semibold">Award Winner 2025</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            {/* 50K+ Happy Customers */}
            <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-md rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border-2 border-green-400/60 text-center shadow-xl shadow-green-500/30 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-1.5 sm:mb-2">
                  <i className="fas fa-users text-2xl sm:text-3xl md:text-4xl text-green-400 drop-shadow-lg"></i>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-green-300 mb-0.5 sm:mb-1 drop-shadow-lg">50K+</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-white font-bold mb-0.5 sm:mb-1">Happy Customers</p>
                <p className="text-[9px] sm:text-xs text-green-200 mt-0.5 sm:mt-1 font-medium">Trusted by thousands</p>
              </div>
            </div>
            
            {/* Certified Partners */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20 text-center shadow-lg hover:bg-white/15 transition-all relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white text-[8px] sm:text-xs"></i>
              </div>
              <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-certificate text-xl sm:text-2xl md:text-3xl text-blue-400 drop-shadow-lg"></i>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-white font-bold mb-0.5 sm:mb-1">Certified Partners</p>
              <p className="text-[9px] sm:text-xs text-gray-400 leading-tight">Authorized reseller for all major US carriers</p>
            </div>
            
            {/* Secure Transactions */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20 text-center shadow-lg hover:bg-white/15 transition-all relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white text-[8px] sm:text-xs"></i>
              </div>
              <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-lock text-xl sm:text-2xl md:text-3xl text-purple-400 drop-shadow-lg"></i>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-white font-bold mb-0.5 sm:mb-1">Secure Transactions</p>
              <p className="text-[9px] sm:text-xs text-gray-400 leading-tight">PCI DSS compliant payment processing</p>
            </div>
            
            {/* Money-Back Guarantee */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20 text-center shadow-lg hover:bg-white/15 transition-all relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white text-[8px] sm:text-xs"></i>
              </div>
              <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                <i className="fas fa-handshake text-xl sm:text-2xl md:text-3xl text-green-400 drop-shadow-lg"></i>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-white font-bold mb-0.5 sm:mb-1">Money-Back Guarantee</p>
              <p className="text-[9px] sm:text-xs text-gray-400 leading-tight">30-day satisfaction guarantee on all plans</p>
            </div>
          </div>

          {/* Key features */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-white/20 mb-4 sm:mb-6 shadow-xl">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-5 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <i className="fas fa-check-circle text-white text-sm sm:text-lg"></i>
              </div>
              <span>Why Choose Us?</span>
            </h3>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4 bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-mobile-alt text-blue-400 text-base sm:text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1">Best Mobile Plans</p>
                  <p className="text-gray-300 text-xs sm:text-sm">Verizon, AT&T, T-Mobile & more at unbeatable prices</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4 bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-bolt text-yellow-400 text-base sm:text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1">Instant Activation</p>
                  <p className="text-gray-300 text-xs sm:text-sm">Get your plan activated in minutes, not hours</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4 bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-dollar-sign text-green-400 text-base sm:text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1">Save Up to 50%</p>
                  <p className="text-gray-300 text-xs sm:text-sm">Best prices guaranteed with no hidden fees</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={handleDismiss1Hour}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-2 text-white min-h-[44px] sm:min-h-[48px]"
            >
              <span>Explore Plans</span>
              <i className="fas fa-arrow-right text-xs sm:text-sm"></i>
            </button>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleDismiss1Hour}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-1.5 sm:gap-2 text-gray-300 hover:text-white text-[10px] sm:text-xs md:text-sm"
              >
                <i className="fas fa-clock text-xs"></i>
                <span>Dismiss (1 hour)</span>
              </button>
              <button
                onClick={handleNeverShow}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-1.5 sm:gap-2 text-gray-300 hover:text-white text-[10px] sm:text-xs md:text-sm"
              >
                <i className="fas fa-eye-slash text-xs"></i>
                <span>Dismiss Permanently</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

