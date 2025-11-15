'use client';

import { useEffect, useState } from 'react';
import { Package } from '@/types';

interface CompareModalProps {
  packages: Package[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

export default function CompareModal({ packages, onClose, onRemove }: CompareModalProps) {
  const carrierNames: Record<string, string> = {
    verizon: 'Verizon',
    att: 'AT&T',
    tmobile: 'T-Mobile',
    uscellular: 'US Cellular',
    mintmobile: 'Mint Mobile',
    cricket: 'Cricket Wireless',
  };

  if (packages.length === 0) {
    return null;
  }

  const allFeatures = Array.from(
    new Set(packages.flatMap(pkg => pkg.features))
  );

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#1a1f3a] via-[#0f1629] to-[#1a1f3a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-7xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl shadow-blue-500/20 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Compare Plans
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Compare {packages.length} plan{packages.length > 1 ? 's' : ''} side by side
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl sm:text-3xl transition-all duration-300 hover:rotate-90 hover:scale-110 w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-white/10 min-w-[44px] min-h-[44px]"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Compare Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 sm:p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10 text-xs sm:text-sm">Feature</th>
                  {packages.map(pkg => (
                    <th key={pkg.id} className="text-center p-3 sm:p-4 min-w-[200px] sm:min-w-[250px] relative">
                      <button
                        onClick={() => onRemove(pkg.id)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 text-gray-400 hover:text-red-400 transition-colors w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-red-500/20 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                        title="Remove from comparison"
                        aria-label="Remove plan"
                      >
                        <i className="fas fa-times text-sm sm:text-xs"></i>
                      </button>
                      <div className="mb-2">
                        <div className="text-[10px] sm:text-xs text-gray-400 mb-1 uppercase tracking-wide">
                          {carrierNames[pkg.carrier]}
                        </div>
                        <div className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{pkg.name}</div>
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-1">
                          ${pkg.price}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">/ {pkg.period}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-white/5">
                  <td className="p-3 sm:p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10 text-xs sm:text-sm">
                    <i className="fas fa-dollar-sign mr-2 text-blue-400"></i>
                    Price
                  </td>
                  {packages.map(pkg => (
                    <td key={pkg.id} className="p-3 sm:p-4 text-center">
                      <div className="text-lg sm:text-xl font-bold">${pkg.price}</div>
                      <div className="text-xs sm:text-sm text-gray-400">/ {pkg.period}</div>
                      {pkg.period === 'year' && (
                        <div className="text-[10px] sm:text-xs text-green-400 mt-1">
                          ${(pkg.price / 12).toFixed(2)}/month
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Data Row */}
                <tr className="border-b border-white/5">
                  <td className="p-3 sm:p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10 text-xs sm:text-sm">
                    <i className="fas fa-database mr-2 text-purple-400"></i>
                    Data
                  </td>
                  {packages.map(pkg => (
                    <td key={pkg.id} className="p-3 sm:p-4 text-center text-xs sm:text-sm">
                      {pkg.data}
                    </td>
                  ))}
                </tr>

                {/* Speed Row */}
                <tr className="border-b border-white/5">
                  <td className="p-3 sm:p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10 text-xs sm:text-sm">
                    <i className="fas fa-tachometer-alt mr-2 text-green-400"></i>
                    Speed
                  </td>
                  {packages.map(pkg => (
                    <td key={pkg.id} className="p-3 sm:p-4 text-center text-xs sm:text-sm">
                      {pkg.speed}
                    </td>
                  ))}
                </tr>

                {/* Hotspot Row */}
                <tr className="border-b border-white/5">
                  <td className="p-3 sm:p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10 text-xs sm:text-sm">
                    <i className="fas fa-wifi mr-2 text-yellow-400"></i>
                    Hotspot
                  </td>
                  {packages.map(pkg => (
                    <td key={pkg.id} className="p-3 sm:p-4 text-center text-xs sm:text-sm">
                      {pkg.hotspot !== 'None' ? pkg.hotspot : '—'}
                    </td>
                  ))}
                </tr>

                {/* Features Rows */}
                {allFeatures.map((feature, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="p-3 sm:p-4 text-gray-300 sticky left-0 bg-[#1a1f3a] z-10 text-xs sm:text-sm">
                      <i className="fas fa-check-circle mr-2 text-green-400"></i>
                      <span className="break-words">{feature}</span>
                    </td>
                    {packages.map(pkg => (
                      <td key={pkg.id} className="p-3 sm:p-4 text-center">
                        {pkg.features.includes(feature) ? (
                          <i className="fas fa-check-circle text-green-400 text-lg sm:text-xl"></i>
                        ) : (
                          <i className="fas fa-times-circle text-red-400/50 text-lg sm:text-xl"></i>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs sm:text-sm text-gray-400">
            <i className="fas fa-info-circle mr-2"></i>
            Select up to 4 plans to compare
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <i className="fas fa-check"></i>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

