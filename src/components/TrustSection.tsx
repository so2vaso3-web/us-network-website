'use client';

export default function TrustSection() {
  const trustItems = [
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure Payments',
      description: '256-bit SSL encryption',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: 'fas fa-users',
      title: '50,000+ Customers',
      description: 'Trusted by thousands',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: 'fas fa-award',
      title: 'Award Winning',
      description: 'Best Service 2025',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: 'fas fa-clock',
      title: '24/7 Support',
      description: 'Always here to help',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-[#1a1f3a] to-[#0a0e27] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Trusted & Secure
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your data security and satisfaction are our top priorities
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 text-center group"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <i className={`${item.icon} text-2xl text-white`}></i>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-12 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fas fa-lock text-blue-400"></i>
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fas fa-check-circle text-green-400"></i>
              <span className="text-sm">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fas fa-shield-alt text-purple-400"></i>
              <span className="text-sm">Data Protected</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fas fa-certificate text-yellow-400"></i>
              <span className="text-sm">Certified Partner</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

