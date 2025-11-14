'use client';

import { useState, useEffect } from 'react';
import PlanCard from './PlanCard';
import CompareModal from './CompareModal';
import { Package } from '@/types';
import { defaultPackages } from '@/lib/data';

export default function PlansSection() {
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'name'>('price');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Always use defaultPackages and update localStorage
      // This ensures the latest prices from data.ts are always used
      setPackages(defaultPackages);
      localStorage.setItem('packages', JSON.stringify(defaultPackages));
      
      // If admin has manually saved packages, we can check for a flag
      // For now, always use defaults to ensure latest prices are shown
      
      // Listen for carrier filter events from CarrierSection
      const handleFilterByCarrier = (event: Event) => {
        const customEvent = event as CustomEvent;
        const carrier = customEvent.detail?.carrier;
        const validCarriers = ['verizon', 'att', 'tmobile', 'uscellular', 'mintmobile', 'cricket'];
        if (carrier && validCarriers.includes(carrier)) {
          setFilter(carrier);
        }
      };
      
      window.addEventListener('filterByCarrier', handleFilterByCarrier);
      
      return () => {
        window.removeEventListener('filterByCarrier', handleFilterByCarrier);
      };
    }
  }, []);

  const filteredAndSortedPackages = packages
    .filter(pkg => {
      if (filter === 'all') return true;
      if (filter === 'annual') return pkg.period === 'year';
      return pkg.carrier === filter;
    })
    .filter(pkg => 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.carrier.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      return a.name.localeCompare(b.name);
    });

  const carriers = ['verizon', 'att', 'tmobile', 'uscellular', 'mintmobile', 'cricket'];

  const handleToggleCompare = (planId: string) => {
    setCompareList(prev => {
      if (prev.includes(planId)) {
        const newList = prev.filter(id => id !== planId);
        if (newList.length === 0) {
          setShowCompareModal(false);
        }
        return newList;
      } else {
        if (prev.length >= 4) {
          alert('You can only compare up to 4 plans at once!');
          return prev;
        }
        return [...prev, planId];
      }
    });
  };

  const handleRemoveFromCompare = (planId: string) => {
    setCompareList(prev => {
      const newList = prev.filter(id => id !== planId);
      if (newList.length === 0) {
        setShowCompareModal(false);
      }
      return newList;
    });
  };

  const comparePackages = packages.filter(pkg => compareList.includes(pkg.id));

  return (
    <section id="plans" className="py-12 px-4 bg-[#0a0e27] relative -mt-4">
      {/* Compare Button - Fixed */}
          {compareList.length > 0 && (
            <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40">
              <button
                onClick={() => setShowCompareModal(true)}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 flex items-center gap-2 sm:gap-3 text-sm sm:text-lg animate-bounce min-h-[44px]"
              >
            <i className="fas fa-balance-scale text-xl"></i>
            <span>Compare ({compareList.length})</span>
            {compareList.length >= 2 && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-lg text-sm">
                View
              </span>
            )}
          </button>
        </div>
      )}

      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Choose Your Plan
        </h2>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 justify-center px-4 sm:px-0">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-300 font-medium whitespace-nowrap text-sm sm:text-base min-h-[44px] ${
                    filter === 'all' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10 hover:border-white/30'
                  }`}
                >
              All Plans
            </button>
            {carriers.map(carrier => (
                  <button
                    key={carrier}
                    onClick={() => setFilter(carrier)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-300 font-medium capitalize whitespace-nowrap text-sm sm:text-base min-h-[44px] ${
                      filter === carrier 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10 hover:border-white/30'
                    }`}
                  >
                {carrier === 'mintmobile' ? 'Mint Mobile' : carrier === 'att' ? 'AT&T' : carrier === 'tmobile' ? 'T-Mobile' : carrier === 'uscellular' ? 'US Cellular' : carrier.charAt(0).toUpperCase() + carrier.slice(1)}
              </button>
            ))}
                <button
                  onClick={() => setFilter('annual')}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-300 font-medium whitespace-nowrap text-sm sm:text-base min-h-[44px] ${
                    filter === 'annual' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10 hover:border-white/30'
                  }`}
                >
              <i className="fas fa-calendar-alt mr-2"></i>
              Annual Plans
            </button>
          </div>

              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-auto sm:min-w-[250px] px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-base min-h-[44px]"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'price' | 'name')}
                  className="w-full sm:w-auto sm:min-w-[180px] px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 cursor-pointer text-base min-h-[44px]"
                >
              <option value="price">Sort by Price</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 px-4 sm:px-0">
          {filteredAndSortedPackages.length > 0 ? (
            filteredAndSortedPackages.map(pkg => (
              <PlanCard
                key={pkg.id}
                pkg={pkg}
                isInCompareList={compareList.includes(pkg.id)}
                onToggleCompare={handleToggleCompare}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
              <p>No plans found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compare Modal */}
      {showCompareModal && comparePackages.length > 0 && (
        <CompareModal
          packages={comparePackages}
          onClose={() => setShowCompareModal(false)}
          onRemove={handleRemoveFromCompare}
        />
      )}
    </section>
  );
}

