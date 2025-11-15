'use client';

import { useState, useEffect } from 'react';

export default function TrustBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if user has closed the banner before
    if (typeof window !== 'undefined') {
      const hasClosedBanner = localStorage.getItem('trustBannerClosed');
      if (!hasClosedBanner) {
        // Show banner after a short delay
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trustBannerClosed', 'true');
      // Dispatch event to notify header
      window.dispatchEvent(new Event('bannerClosed'));
    }
  };

  if (isClosed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
      <div className="bg-gradient-to-r from-blue-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md border-b border-white/20 shadow-xl">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
            {/* Trust Info */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-300 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
                <i className="fas fa-shield-check text-green-400 text-base sm:text-lg flex-shrink-0"></i>
                <span className="font-semibold">SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
                <i className="fas fa-lock text-blue-400 text-base sm:text-lg flex-shrink-0"></i>
                <span className="font-semibold">PCI Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
                <i className="fas fa-certificate text-yellow-400 text-base sm:text-lg flex-shrink-0"></i>
                <span className="font-semibold">Certified Partners</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
                <i className="fas fa-award text-purple-400 text-base sm:text-lg flex-shrink-0"></i>
                <span className="font-semibold">Best Service 2025</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-white/10 flex-shrink-0 ml-2"
              aria-label="Close banner"
            >
              <i className="fas fa-times text-lg sm:text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

