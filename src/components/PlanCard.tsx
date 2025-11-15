'use client';

import { useState, useRef } from 'react';
import { Package } from '@/types';
import PaymentModal from './PaymentModal';

interface PlanCardProps {
  pkg: Package;
  isInCompareList?: boolean;
  onToggleCompare?: (planId: string) => void;
  index?: number;
}

export default function PlanCard({ pkg, isInCompareList = false, onToggleCompare, index = 0 }: PlanCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const carrierNames: Record<string, string> = {
    verizon: 'Verizon',
    att: 'AT&T',
    tmobile: 'T-Mobile',
    uscellular: 'US Cellular',
    mintmobile: 'Mint Mobile',
    cricket: 'Cricket Wireless',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('ul') ||
      target.closest('li') ||
      target.closest('.more-features-link')
    ) {
      return;
    }
    setShowPaymentModal(true);
  };

  const handleMoreFeatures = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowFeaturesModal(true);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleCompare) {
      onToggleCompare(pkg.id);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleCardClick}
        className="plan-card bg-white/5 backdrop-blur-md rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer active:scale-[0.98] sm:hover:scale-[1.02] sm:hover:shadow-2xl sm:hover:shadow-blue-500/20 relative overflow-hidden group h-full flex flex-col"
      >
        {/* Glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {pkg.badge && (
          <span className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs font-bold rounded-md bg-blue-500/20 border border-blue-500/30 text-red-400 sm:text-red-300 shadow-lg z-20">
            {pkg.badge}
          </span>
        )}
        
        {/* Compare Indicator */}
        {isInCompareList && (
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg z-10 flex items-center gap-1 sm:gap-1.5">
            <i className="fas fa-check-circle text-xs"></i>
            <span className="hidden sm:inline">Comparing</span>
          </span>
        )}

        {/* Header Section */}
        <div className={`relative z-10 mb-2.5 sm:mb-4 ${pkg.badge ? 'pr-16 sm:pr-20' : ''}`}>
          <div className="text-[11px] sm:text-sm text-gray-400 mb-0.5 sm:mb-2 font-medium uppercase tracking-wide line-clamp-1">{carrierNames[pkg.carrier]}</div>
          <h3 className="text-sm sm:text-2xl font-bold mb-1.5 sm:mb-3 text-white leading-tight line-clamp-1">{pkg.name}</h3>
          <div className="flex items-baseline gap-1 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-xl sm:text-4xl font-bold text-blue-400">
              ${pkg.price}
            </span>
            <span className="text-gray-400 text-[10px] sm:text-lg">/ {pkg.period === 'year' ? 'year' : 'month'}</span>
          </div>
          {pkg.period === 'year' && (
            <div className="text-green-400 text-xs sm:text-sm mt-1 sm:mt-2 font-semibold flex items-center gap-1">
              <i className="fas fa-dollar-sign text-xs"></i> 
              <span>{(pkg.price / 12).toFixed(2)}/month</span>
            </div>
          )}
        </div>

        {/* Features List */}
        <ul className="relative z-10 space-y-1 sm:space-y-2 mb-2.5 sm:mb-6 flex-1">
          <li className="flex items-center gap-1.5 sm:gap-2.5 text-gray-300">
            <i className="fas fa-check-circle text-green-400 text-[10px] sm:text-sm flex-shrink-0"></i>
            <span className="text-[10px] sm:text-sm leading-tight line-clamp-1">{pkg.data} Data</span>
          </li>
          <li className="flex items-center gap-1.5 sm:gap-2.5 text-gray-300">
            <i className="fas fa-check-circle text-green-400 text-[10px] sm:text-sm flex-shrink-0"></i>
            <span className="text-[10px] sm:text-sm leading-tight line-clamp-1">{pkg.speed} Speed</span>
          </li>
          {pkg.hotspot !== 'None' && (
            <li className="flex items-center gap-1.5 sm:gap-2.5 text-gray-300">
              <i className="fas fa-check-circle text-green-400 text-[10px] sm:text-sm flex-shrink-0"></i>
              <span className="text-[10px] sm:text-sm leading-tight line-clamp-1">{pkg.hotspot} Hotspot</span>
            </li>
          )}
          {pkg.features.slice(0, 2).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-1.5 sm:gap-2.5 text-gray-300">
              <i className="fas fa-check-circle text-green-400 text-[10px] sm:text-sm flex-shrink-0 mt-0.5"></i>
              <span className="text-[10px] sm:text-sm leading-tight line-clamp-1">{feature}</span>
            </li>
          ))}
          {pkg.features.length > 2 && (
            <li
              className="more-features-link text-gray-400 cursor-pointer active:text-gray-300 sm:hover:text-gray-300 transition-colors text-[10px] sm:text-sm font-medium flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-2"
              onClick={handleMoreFeatures}
            >
              <i className="fas fa-ellipsis-h text-[9px] sm:text-xs"></i>
              <span>+{pkg.features.length - 2} more</span>
            </li>
          )}
        </ul>

        {/* Action Buttons */}
        <div className="relative z-10 flex gap-1.5 sm:gap-2.5 mt-auto">
          <button
            onClick={handleBuyNow}
            className="flex-1 px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl font-semibold active:scale-95 sm:hover:from-blue-700 sm:hover:via-purple-700 sm:hover:to-pink-700 transition-all duration-200 shadow-lg sm:hover:shadow-blue-500/50 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm min-h-[36px] sm:min-h-[44px]"
          >
            <i className="fas fa-shopping-cart text-[9px] sm:text-sm"></i>
            <span className="font-bold text-[10px] sm:text-sm">Buy</span>
          </button>
          <button
            onClick={handleCompare}
            className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] flex items-center justify-center active:scale-95 ${
              isInCompareList
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-400 shadow-lg shadow-green-500/50'
                : 'bg-transparent border-2 border-blue-500/30 text-blue-400 active:bg-blue-500/20 sm:hover:bg-blue-500/20 active:border-blue-500/50 sm:hover:border-blue-500/50'
            }`}
            title={isInCompareList ? 'Remove from Compare' : 'Add to Compare'}
          >
            <i className={`fas ${isInCompareList ? 'fa-check-circle' : 'fa-balance-scale'} text-[11px] sm:text-base`}></i>
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal pkg={pkg} onClose={() => setShowPaymentModal(false)} />
      )}

      {/* Features Modal */}
      {showFeaturesModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFeaturesModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-[#1a1f3a] via-[#0f1629] to-[#1a1f3a] rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">All features</h3>
              <button
                onClick={() => setShowFeaturesModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <ul className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              <li className="flex items-center gap-2.5 text-gray-300">
                <i className="fas fa-check-circle text-green-400 flex-shrink-0"></i>
                <span>{pkg.data} Data</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-300">
                <i className="fas fa-check-circle text-green-400 flex-shrink-0"></i>
                <span>{pkg.speed} Speed</span>
              </li>
              {pkg.hotspot !== 'None' && (
                <li className="flex items-center gap-2.5 text-gray-300">
                  <i className="fas fa-check-circle text-green-400 flex-shrink-0"></i>
                  <span>{pkg.hotspot} Hotspot</span>
                </li>
              )}
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-gray-300">
                  <i className="fas fa-check-circle text-green-400 flex-shrink-0 mt-0.5"></i>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowFeaturesModal(false)}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

