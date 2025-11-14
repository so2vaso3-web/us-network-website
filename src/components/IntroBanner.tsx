'use client';

import { useState, useEffect } from 'react';

export default function IntroBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ngay lập tức check pathname - không chờ
      const currentPath = window.location.pathname;
      
      // KHÔNG hiển thị trên admin page - luôn luôn dismiss
      if (currentPath.startsWith('/admin')) {
        setIsDismissed(true);
        setIsVisible(false);
        return;
      }
      
      // Check if user chose to never show again
      const neverShow = localStorage.getItem('introBannerNeverShow');
      if (neverShow === 'true') {
        setIsDismissed(true);
        setIsVisible(false);
        return;
      }
      
      // TẠM THỜI TẮT INTROBANNER ĐỂ TEST - COMMENT LẠI SAU
      // Uncomment đoạn code dưới để bật lại IntroBanner
      /*
      // Listen for route changes
      const handleRouteChange = () => {
        const newPath = window.location.pathname;
        if (newPath.startsWith('/admin')) {
          setIsDismissed(true);
          setIsVisible(false);
        }
      };
      
      window.addEventListener('popstate', handleRouteChange);
      
      // Show banner on main pages only (after delay)
      if (!currentPath.startsWith('/admin')) {
        const timer = setTimeout(() => {
          // Double-check pathname before showing
          if (!window.location.pathname.startsWith('/admin')) {
            setIsVisible(true);
          }
        }, 500);
        
        return () => {
          clearTimeout(timer);
          window.removeEventListener('popstate', handleRouteChange);
        };
      }
      */
      
      // TẠM THỜI: Luôn dismiss để test
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    // Just close for this session, don't save to localStorage
    setIsVisible(false);
  };

  const handleNeverShow = () => {
    // Save preference to never show again
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('introBannerNeverShow', 'true');
      window.dispatchEvent(new Event('introBannerDismissed'));
    }
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-gradient-to-br from-blue-600/98 via-purple-600/98 to-pink-600/98 backdrop-blur-xl rounded-3xl border-2 border-white/30 shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-lg">
                <i className="fas fa-star text-3xl md:text-4xl text-yellow-300 animate-spin-slow"></i>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                    Welcome to US Mobile Networks!
                  </span>
                  <span className="px-3 py-1 bg-green-500 rounded-full text-xs font-semibold text-white animate-pulse">
                    NEW
                  </span>
                </h3>
                <p className="text-white/80 text-sm md:text-base mt-1">
                  Your trusted partner for premium mobile plans
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 text-white"
              aria-label="Close banner"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Key Features */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-check-circle text-green-300"></i>
                Why Choose Us?
              </h4>
              <div className="grid md:grid-cols-2 gap-3 text-white/90">
                <div className="flex items-start gap-3">
                  <i className="fas fa-mobile-alt text-blue-300 mt-1"></i>
                  <div>
                    <span className="font-semibold">Best Deals</span>
                    <p className="text-sm text-white/70">Verizon, AT&T, T-Mobile & more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-bolt text-yellow-300 mt-1"></i>
                  <div>
                    <span className="font-semibold">Instant Activation</span>
                    <p className="text-sm text-white/70">Activate in minutes, not hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-shield-alt text-green-300 mt-1"></i>
                  <div>
                    <span className="font-semibold">100% Secure</span>
                    <p className="text-sm text-white/70">SSL encrypted payments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-headset text-purple-300 mt-1"></i>
                  <div>
                    <span className="font-semibold">24/7 Support</span>
                    <p className="text-sm text-white/70">Expert help always available</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-400/20 rounded-xl border border-yellow-400/30">
                <p className="text-yellow-200 font-semibold text-center">
                  💰 Save up to 50% on your monthly bill!
                </p>
              </div>
            </div>

            {/* Refund Policy & Terms */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-file-contract text-blue-300"></i>
                Policies & Terms
              </h4>
              <div className="space-y-3 text-white/90">
                <div className="flex items-start gap-3">
                  <i className="fas fa-undo text-green-300 mt-1"></i>
                  <div>
                    <span className="font-semibold block mb-1">Refund Policy</span>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Full refund within 30 days if not satisfied. No questions asked. Contact our support team for assistance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-gavel text-orange-300 mt-1"></i>
                  <div>
                    <span className="font-semibold block mb-1">Terms of Service</span>
                    <p className="text-sm text-white/80 leading-relaxed">
                      By using our service, you agree to our terms. Please review our complete terms of service before purchasing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-life-ring text-cyan-300"></i>
                Customer Support
              </h4>
              <div className="space-y-3 text-white/90">
                <div className="flex items-start gap-3">
                  <i className="fas fa-sim-card text-purple-300 mt-1"></i>
                  <div>
                    <span className="font-semibold block mb-1">SIM/eSIM Issues?</span>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Having trouble with your SIM card or eSIM? Our expert support team is available 24/7 to help you resolve any activation or connectivity issues. Contact us via email or live chat.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-question-circle text-yellow-300 mt-1"></i>
                  <div>
                    <span className="font-semibold block mb-1">Need Help?</span>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Our dedicated support team responds within minutes. Available via email, live chat, or phone support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activation Guide */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-5 border border-green-400/30">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-magic text-green-300"></i>
                How to Activate Your Data Plan
              </h4>
              <div className="space-y-3 text-white/90">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center font-bold text-green-300">
                    1
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Purchase Your Plan</span>
                    <p className="text-sm text-white/80">Select and purchase your preferred mobile plan from our website.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center font-bold text-green-300">
                    2
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Receive Confirmation</span>
                    <p className="text-sm text-white/80">You&apos;ll receive an email confirmation with your order details and activation instructions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center font-bold text-green-300">
                    3
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Activate SIM/eSIM</span>
                    <p className="text-sm text-white/80">Follow the simple activation steps sent to your email. For physical SIM, insert into your device. For eSIM, scan the QR code provided.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center font-bold text-green-300">
                    4
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Enjoy Your Service</span>
                    <p className="text-sm text-white/80">Once activated, your data plan will be active immediately. Start using high-speed 4G/5G networks!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleDismiss}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-3 text-white"
              >
                <span>Get Started Now</span>
                <i className="fas fa-arrow-right"></i>
              </button>
              <button
                onClick={handleNeverShow}
                className="w-full px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center gap-2 text-white/80 hover:text-white text-sm"
              >
                <i className="fas fa-eye-slash"></i>
                <span>Don&apos;t show again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

