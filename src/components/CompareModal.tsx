'use client';

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

  // Normalize and format data value
  const formatData = (data: string): string => {
    if (!data) return '—';
    const lower = data.toLowerCase();
    if (lower.includes('unlimited')) {
      return 'Unlimited';
    }
    // Ensure consistent formatting for GB values
    return data.trim();
  };

  // Normalize and format speed value
  const formatSpeed = (speed: string): string => {
    if (!speed) return '—';
    // Standardize speed display
    const normalized = speed.trim();
    if (normalized.includes('5G')) {
      return normalized;
    }
    return normalized;
  };

  // Normalize and format hotspot value
  const formatHotspot = (hotspot: string): string => {
    if (!hotspot || hotspot.toLowerCase() === 'none') {
      return '—';
    }
    // Ensure consistent formatting
    return hotspot.trim();
  };

  // Format period consistently
  const formatPeriod = (period: string): string => {
    if (period === 'year') return 'year';
    if (period === 'month') return 'month';
    return period;
  };

  if (packages.length === 0) {
    return null;
  }

  // Normalize feature names for consistent comparison
  const normalizeFeature = (feature: string): string => {
    return feature.trim();
  };

  // Map similar features to a canonical name for comparison
  const getCanonicalFeature = (feature: string): string => {
    const normalized = normalizeFeature(feature).toLowerCase();
    
    // Map similar features to canonical names
    const featureMap: Record<string, string> = {
      // HD/Video streaming variations
      'hd video streaming': 'HD video streaming',
      'hd streaming': 'HD video streaming',
      'hd/4k streaming': 'HD/4K video',
      'hd/4k video': 'HD/4K video',
      '4k video': '4K video',
      'premium streaming': 'Premium streaming',
      
      // Data variations
      'unlimited 5g data': 'Unlimited 5G data',
      'unlimited 5g+ data': 'Unlimited 5G+ data',
      'unlimited 5g ultra data': 'Unlimited 5G Ultra data',
      'unlimited high-speed data': 'Unlimited high-speed data',
      
      // Talk & text variations
      'unlimited talk & text': 'Unlimited talk & text',
      'unlimited talk and text': 'Unlimited talk & text',
      
      // Contract variations
      'no contract': 'No contract',
      
      // Hotspot variations (extract number)
      '50gb hotspot': '50GB hotspot',
      '25gb hotspot': '25GB hotspot',
      '15gb hotspot': '15GB hotspot',
      '5gb hotspot': '5GB hotspot',
      '3gb hotspot': '3GB hotspot',
      '10gb hotspot': '10GB hotspot',
      '20gb hotspot': '20GB hotspot',
      '30gb hotspot': '30GB hotspot',
      '40gb hotspot': '40GB hotspot',
      '60gb hotspot': '60GB hotspot',
      '75gb hotspot': '75GB hotspot',
      '100gb hotspot': '100GB hotspot',
      '150gb hotspot': '150GB hotspot',
    };
    
    // Check exact match first
    if (featureMap[normalized]) {
      return featureMap[normalized];
    }
    
    // Check partial matches for streaming
    if (normalized.includes('hd') && normalized.includes('streaming')) {
      return 'HD video streaming';
    }
    if (normalized.includes('hd') && normalized.includes('video')) {
      return normalized.includes('4k') ? 'HD/4K video' : 'HD video streaming';
    }
    if (normalized.includes('4k') && normalized.includes('video')) {
      return '4K video';
    }
    
    // Check for hotspot patterns
    const hotspotMatch = normalized.match(/(\d+)\s*gb\s*hotspot/);
    if (hotspotMatch) {
      return `${hotspotMatch[1]}GB hotspot`;
    }
    
    // Return original if no mapping found
    return normalizeFeature(feature);
  };

  // Check if package has feature (with smart matching)
  const hasFeature = (pkg: Package, feature: string): boolean => {
    const canonicalFeature = getCanonicalFeature(feature);
    
    // Check exact match first
    if (pkg.features.some(f => normalizeFeature(f) === canonicalFeature)) {
      return true;
    }
    
    // Check if any feature maps to the same canonical feature
    const hasCanonicalMatch = pkg.features.some(f => {
      const canonical = getCanonicalFeature(f);
      return canonical === canonicalFeature;
    });
    
    if (hasCanonicalMatch) {
      return true;
    }
    
    // Special case: If looking for "HD video streaming" but package has "HD/4K video" or "4K video", return true
    // (because HD/4K includes HD)
    if (canonicalFeature === 'HD video streaming') {
      return pkg.features.some(f => {
        const canonical = getCanonicalFeature(f);
        return canonical === 'HD/4K video' || canonical === '4K video';
      });
    }
    
    // Special case: If looking for "HD/4K video" but package has "4K video", return true
    if (canonicalFeature === 'HD/4K video') {
      return pkg.features.some(f => {
        const canonical = getCanonicalFeature(f);
        return canonical === '4K video';
      });
    }
    
    return false;
  };

  // Get all unique features and sort them logically
  // Use canonical names to avoid duplicates
  const allFeatures = Array.from(
    new Set(packages.flatMap(pkg => 
      pkg.features.map(f => getCanonicalFeature(f))
    ))
  ).sort((a, b) => {
    // Define priority order for features (using canonical names)
    const priority: Record<string, number> = {
      'Unlimited 5G data': 1,
      'Unlimited high-speed data': 1,
      'Unlimited 5G+ data': 1,
      'Unlimited 5G Ultra data': 1,
      'Unlimited talk & text': 2,
      'No contract': 3,
      'HD video streaming': 4,
      'HD/4K video': 5,
      '4K video': 6,
      'Premium streaming': 7,
      'Premium network access': 8,
      'Priority data': 9,
      'Maximum network priority': 10,
      'Premium network priority': 10,
      'Priority network access': 10,
      'All streaming services': 11,
      'International roaming': 12,
      'International features': 12,
    };

    // Check if both features have priority
    const aPriority = priority[a] || 100;
    const bPriority = priority[b] || 100;

    // If same priority, sort alphabetically
    if (aPriority === bPriority) {
      return a.localeCompare(b);
    }

    return aPriority - bPriority;
  });

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#1a1f3a] via-[#0f1629] to-[#1a1f3a] rounded-3xl p-8 max-w-7xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl shadow-blue-500/20 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Compare Plans
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Compare {packages.length} plan{packages.length > 1 ? 's' : ''} side by side
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl transition-all duration-300 hover:rotate-90 hover:scale-110 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {/* Compare Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10">Feature</th>
                {packages.map(pkg => (
                  <th key={pkg.id} className="text-center p-4 min-w-[250px] relative">
                    <button
                      onClick={() => onRemove(pkg.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20"
                      title="Remove from comparison"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                    <div className="mb-2">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                        {carrierNames[pkg.carrier]}
                      </div>
                      <div className="text-xl font-bold mb-2">{pkg.name}</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-1">
                        ${pkg.price}
                      </div>
                      <div className="text-sm text-gray-400">/ {formatPeriod(pkg.period)}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price Row */}
              <tr className="border-b border-white/5">
                <td className="p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10">
                  <i className="fas fa-dollar-sign mr-2 text-blue-400"></i>
                  Price
                </td>
                {packages.map(pkg => (
                  <td key={pkg.id} className="p-4 text-center">
                    <div className="text-xl font-bold">${pkg.price}</div>
                    <div className="text-sm text-gray-400">/ {formatPeriod(pkg.period)}</div>
                    {pkg.period === 'year' && (
                      <div className="text-xs text-green-400 mt-1">
                        ${(pkg.price / 12).toFixed(2)}/month
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Data Row */}
              <tr className="border-b border-white/5">
                <td className="p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10">
                  <i className="fas fa-database mr-2 text-purple-400"></i>
                  Data
                </td>
                {packages.map(pkg => (
                  <td key={pkg.id} className="p-4 text-center">
                    <div className="font-semibold text-lg">
                      {formatData(pkg.data)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Speed Row */}
              <tr className="border-b border-white/5">
                <td className="p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10">
                  <i className="fas fa-tachometer-alt mr-2 text-green-400"></i>
                  Speed
                </td>
                {packages.map(pkg => (
                  <td key={pkg.id} className="p-4 text-center">
                    <div className="font-semibold">
                      {formatSpeed(pkg.speed)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Hotspot Row */}
              <tr className="border-b border-white/5">
                <td className="p-4 font-semibold text-gray-300 sticky left-0 bg-[#1a1f3a] z-10">
                  <i className="fas fa-wifi mr-2 text-yellow-400"></i>
                  Hotspot
                </td>
                {packages.map(pkg => (
                  <td key={pkg.id} className="p-4 text-center">
                    <div className="font-semibold">
                      {formatHotspot(pkg.hotspot)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Features Rows */}
              {allFeatures.map((feature, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="p-4 text-gray-300 sticky left-0 bg-[#1a1f3a] z-10">
                    <i className="fas fa-check-circle mr-2 text-green-400"></i>
                    {feature}
                  </td>
                  {packages.map(pkg => (
                    <td key={pkg.id} className="p-4 text-center">
                      {hasFeature(pkg, feature) ? (
                        <i className="fas fa-check-circle text-green-400 text-xl" title="Included"></i>
                      ) : (
                        <i className="fas fa-times-circle text-red-400/50 text-xl" title="Not included"></i>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            <i className="fas fa-info-circle mr-2"></i>
            Select up to 4 plans to compare
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center gap-2"
          >
            <i className="fas fa-check"></i>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

