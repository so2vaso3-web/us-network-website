'use client';

export default function FeaturesSection() {
  const features = [
    {
      icon: 'fas fa-rocket',
      title: 'Lightning Fast Activation',
      description: 'Get your plan activated within minutes, not hours. Instant setup and immediate access to high-speed networks.',
      gradient: 'from-orange-500 via-yellow-500 to-orange-600',
      iconBg: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
    },
    {
      icon: 'fas fa-wifi',
      title: '4G & 5G Ready',
      description: 'Access the latest 4G and 5G networks from all major carriers. Experience blazing-fast internet speeds.',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: 'fas fa-tags',
      title: 'Best Prices Guaranteed',
      description: 'Compare prices from all carriers and save up to 50% on your monthly bill. We offer the best deals available.',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      iconBg: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
    },
    {
      icon: 'fas fa-sync-alt',
      title: 'Easy Plan Changes',
      description: 'Switch plans or carriers anytime with no hidden fees. Upgrade or downgrade to match your needs.',
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      iconBg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    },
    {
      icon: 'fas fa-shield-alt',
      title: '100% Secure',
      description: 'Your payment and personal information are protected with bank-level encryption. We never share your data.',
      gradient: 'from-red-500 via-rose-500 to-red-600',
      iconBg: 'bg-gradient-to-br from-red-500/20 to-rose-500/20',
    },
    {
      icon: 'fas fa-headset',
      title: 'Expert Support',
      description: 'Our team of network experts is available 24/7 to help you choose the perfect plan and resolve any issues.',
      gradient: 'from-indigo-500 via-purple-500 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
    },
  ];

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-[#1a1f3a] to-[#0a0e27] relative overflow-hidden -mt-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
            We&apos;re not just a reseller - we&apos;re your trusted partner in finding the perfect mobile plan that fits your lifestyle and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 group relative overflow-hidden h-full flex flex-col"
            >
              {/* Hover effect background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 rounded-xl sm:rounded-2xl ${feature.iconBg} border-2 border-white/20 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-300 shadow-xl group-hover:shadow-blue-500/30 relative overflow-hidden mx-auto sm:mx-0`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <i className={`${feature.icon} text-2xl sm:text-2xl md:text-3xl text-white relative z-10 group-hover:scale-110 transition-transform duration-300`}></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 text-center sm:text-left">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-xs sm:text-sm text-center sm:text-left">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 md:pt-10 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 text-center">
            <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20 relative overflow-visible group hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-1 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-base sm:text-lg group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.9))',
                    textShadow: '0 0 8px rgba(34, 197, 94, 0.7)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <i className="fas fa-certificate text-3xl sm:text-4xl text-blue-400 mb-3 sm:mb-4"></i>
              <h4 className="font-bold text-base sm:text-lg mb-2">Certified Partners</h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Authorized reseller for all major US carriers
              </p>
            </div>
            <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl border border-cyan-500/20 relative overflow-visible group hover:border-cyan-500/50 transition-all duration-300 hover:scale-105">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-1 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-base sm:text-lg group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.9))',
                    textShadow: '0 0 8px rgba(34, 197, 94, 0.7)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <i className="fas fa-certificate text-3xl sm:text-4xl text-cyan-400 mb-3 sm:mb-4"></i>
              <h4 className="font-bold text-base sm:text-lg mb-2">Authorized Reseller</h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Officially authorized to sell plans from major carriers
              </p>
            </div>
            <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 relative overflow-visible group hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-1 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-base sm:text-lg group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.9))',
                    textShadow: '0 0 8px rgba(34, 197, 94, 0.7)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <i className="fas fa-lock text-3xl sm:text-4xl text-purple-400 mb-3 sm:mb-4"></i>
              <h4 className="font-bold text-base sm:text-lg mb-2">Secure Transactions</h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                PCI DSS compliant payment processing
              </p>
            </div>
            <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border border-green-500/20 relative overflow-visible group hover:border-green-500/50 transition-all duration-300 hover:scale-105">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-1 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-base sm:text-lg group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.9))',
                    textShadow: '0 0 8px rgba(34, 197, 94, 0.7)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <i className="fas fa-handshake text-3xl sm:text-4xl text-green-400 mb-3 sm:mb-4"></i>
              <h4 className="font-bold text-base sm:text-lg mb-2">Money-Back Guarantee</h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                30-day satisfaction guarantee on all plans
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

