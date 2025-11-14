'use client';

export default function Footer() {
  return (
    <footer className="bg-[#0a0e27] border-t border-white/10 py-8 px-4 mt-8 relative overflow-hidden -mt-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              US Mobile Networks
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium mobile network plans from top US carriers at competitive prices.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#home" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="#plans" className="hover:text-blue-400 transition-colors">Plans</a></li>
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <i className="fab fa-facebook text-blue-400"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <i className="fab fa-instagram text-pink-400"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-400/20 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <i className="fab fa-twitter text-blue-400"></i>
              </a>
            </div>
          </div>
        </div>
        {/* Certifications & Trust Badges */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <h4 className="text-center text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Trusted & Certified
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center">
            {/* PCI DSS */}
            <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 relative">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center mb-2">
                <i className="fas fa-shield-alt text-2xl text-blue-400"></i>
              </div>
              <span className="text-xs font-semibold text-center">PCI DSS</span>
              <span className="text-xs text-gray-400 text-center">Compliant</span>
            </div>

            {/* SSL Certificate */}
            <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-105 relative">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/30 flex items-center justify-center mb-2">
                <i className="fas fa-lock text-2xl text-green-400"></i>
              </div>
              <span className="text-xs font-semibold text-center">SSL</span>
              <span className="text-xs text-gray-400 text-center">Encrypted</span>
            </div>

            {/* Better Business Bureau */}
            <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 relative">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/30 flex items-center justify-center mb-2">
                <i className="fas fa-award text-2xl text-yellow-400"></i>
              </div>
              <span className="text-xs font-semibold text-center">BBB</span>
              <span className="text-xs text-gray-400 text-center">A+ Rated</span>
            </div>

            {/* Norton Secured */}
            <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 relative">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 flex items-center justify-center mb-2">
                <i className="fas fa-check-circle text-2xl text-purple-400"></i>
              </div>
              <span className="text-xs font-semibold text-center">Norton</span>
              <span className="text-xs text-gray-400 text-center">Secured</span>
            </div>

            {/* Money Back Guarantee */}
            <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 relative">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-2 border-pink-500/30 flex items-center justify-center mb-2">
                <i className="fas fa-undo-alt text-2xl text-pink-400"></i>
              </div>
              <span className="text-xs font-semibold text-center">30-Day</span>
              <span className="text-xs text-gray-400 text-center">Guarantee</span>
            </div>

            {/* Authorized Reseller */}
            <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 relative">
              <div className="absolute top-2 right-2 cursor-pointer group/tick">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping -inset-0.5 scale-150"></div>
                  <i className="fas fa-check-circle text-green-400 text-sm group-hover/tick:scale-110 transition-all duration-300 relative" style={{ 
                    filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.8))',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                  }} title="Verified"></i>
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tick:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-xl z-50">
                  Verified
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-2 border-cyan-500/30 flex items-center justify-center mb-2">
                <i className="fas fa-certificate text-2xl text-cyan-400"></i>
              </div>
              <span className="text-xs font-semibold text-center">Authorized</span>
              <span className="text-xs text-gray-400 text-center">Reseller</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} US Mobile Networks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

