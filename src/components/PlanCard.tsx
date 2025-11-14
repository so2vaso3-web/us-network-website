'use client';

import { useState, useRef } from 'react';
import { Package } from '@/types';
import PaymentModal from './PaymentModal';

interface PlanCardProps {
  pkg: Package;
  isInCompareList?: boolean;
  onToggleCompare?: (planId: string) => void;
}

export default function PlanCard({ pkg, isInCompareList = false, onToggleCompare }: PlanCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
    // Show all features modal (implement separately)
    alert(`All features:\n${pkg.features.join('\n')}`);
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
        className="plan-card bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden group h-full flex flex-col"
      >
        {/* Glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {pkg.badge && (
          <span className="absolute top-4 right-4 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg z-10">
            {pkg.badge}
          </span>
        )}
        
        {/* Compare Indicator */}
        {isInCompareList && (
          <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg z-10 flex items-center gap-1.5">
            <i className="fas fa-check-circle"></i>
            <span>Comparing</span>
          </span>
        )}

        <div className="relative z-10 mb-4">
          <div className="text-sm text-gray-400 mb-2 font-medium uppercase tracking-wide">{carrierNames[pkg.carrier]}</div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{pkg.name}</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              ${pkg.price}
            </span>
            <span className="text-gray-400 text-lg">/ {pkg.period === 'year' ? 'year' : 'month'}</span>
          </div>
          {pkg.period === 'year' && (
            <div className="text-green-400 text-sm mt-2 font-semibold flex items-center gap-1">
              <i className="fas fa-dollar-sign"></i> 
              <span>{(pkg.price / 12).toFixed(2)}/month equivalent</span>
            </div>
          )}
        </div>

        <ul className="relative z-10 space-y-2.5 mb-6 flex-1">
          <li className="flex items-center gap-2.5 text-gray-300">
            <i className="fas fa-check-circle text-green-400 text-sm"></i>
            <span className="text-sm">{pkg.data} Data</span>
          </li>
          <li className="flex items-center gap-2.5 text-gray-300">
            <i className="fas fa-check-circle text-green-400 text-sm"></i>
            <span className="text-sm">{pkg.speed} Speed</span>
          </li>
          {pkg.hotspot !== 'None' && (
            <li className="flex items-center gap-2.5 text-gray-300">
              <i className="fas fa-check-circle text-green-400 text-sm"></i>
              <span className="text-sm">{pkg.hotspot} Hotspot</span>
            </li>
          )}
          {pkg.features.slice(0, 5).map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-gray-300">
              <i className="fas fa-check-circle text-green-400 text-sm"></i>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
          {pkg.features.length > 5 && (
            <li
              className="more-features-link text-blue-400 cursor-pointer hover:text-blue-300 transition-colors text-sm font-medium flex items-center gap-2 mt-2"
              onClick={handleMoreFeatures}
            >
              <i className="fas fa-ellipsis-h"></i>
              <span>+{pkg.features.length - 5} more features</span>
            </li>
          )}
        </ul>

            <div className="relative z-10 flex gap-2 mt-auto">
              <button
                onClick={handleBuyNow}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
              >
                <i className="fas fa-shopping-cart text-sm sm:text-base"></i>
                <span>Buy Now</span>
              </button>
              <button
                onClick={handleCompare}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  isInCompareList
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-400 shadow-lg shadow-green-500/50'
                    : 'bg-transparent border-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50'
                }`}
                title={isInCompareList ? 'Remove from Compare' : 'Add to Compare'}
              >
                <i className={`fas ${isInCompareList ? 'fa-check-circle' : 'fa-balance-scale'} text-sm sm:text-base`}></i>
              </button>
            </div>
      </div>

      {showPaymentModal && (
        <PaymentModal pkg={pkg} onClose={() => setShowPaymentModal(false)} />
      )}
    </>
  );
}

