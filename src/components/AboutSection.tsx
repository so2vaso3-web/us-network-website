'use client';

import { useEffect, useState } from 'react';

export default function AboutSection() {
  const [content, setContent] = useState({
    title: 'About Us',
    content: 'We provide the best mobile network plans from major US carriers at competitive prices.',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const websiteContent = localStorage.getItem('websiteContent');
      if (websiteContent) {
        try {
          const parsed = JSON.parse(websiteContent);
          if (parsed.about) {
            setContent(parsed.about);
          }
        } catch (e) {
          console.error('Error parsing website content:', e);
        }
      }
    }
  }, []);

  return (
    <section id="about" className="py-12 px-4 bg-gradient-to-b from-[#1a1f3a] to-[#0a0e27] relative overflow-hidden -mt-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {content.title}
        </h2>
        <p className="text-lg text-gray-300 text-center leading-relaxed max-w-3xl mx-auto mb-8">
          {content.content}
        </p>
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 md:p-10 border border-blue-500/20 mb-12 backdrop-blur-sm">
          <p className="text-base md:text-lg text-gray-300 text-center leading-relaxed max-w-4xl mx-auto">
            With over <span className="font-bold text-blue-400">5 years of experience</span> in the mobile network industry, we&apos;ve helped thousands of customers find the perfect plan at the best prices. As an authorized reseller for all major US carriers, we combine the power of direct partnerships with unbeatable customer service to deliver a seamless experience from selection to activation.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">2019</div>
              <div className="text-gray-400 text-sm">Founded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">$2M+</div>
              <div className="text-gray-400 text-sm">Saved by customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">4.9★</div>
              <div className="text-gray-400 text-sm">Average rating</div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-shield-alt text-3xl text-blue-400"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">Secure</h3>
            <p className="text-gray-400 leading-relaxed">Safe and secure transactions with encrypted payment processing</p>
          </div>
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-bolt text-3xl text-purple-400"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">Fast</h3>
            <p className="text-gray-400 leading-relaxed">Quick activation and setup - get connected in minutes</p>
          </div>
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20 group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-headset text-3xl text-pink-400"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Support</h3>
            <p className="text-gray-400 leading-relaxed">24/7 customer support to help you with any questions</p>
          </div>
        </div>
      </div>
    </section>
  );
}

