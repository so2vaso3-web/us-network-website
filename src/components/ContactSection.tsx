'use client';

import { useEffect, useState } from 'react';

export default function ContactSection() {
  const [content, setContent] = useState({
    title: 'Contact Us',
    content: 'Get in touch with us for any questions or support.',
  });
  const [contactInfo, setContactInfo] = useState({ 
    email: 'support@usmobilenetworks.com', 
    phone: '1-800-456-7890',
    address: '350 5th Avenue, Suite 7710, New York, NY 10118',
    businessHours: 'Monday - Friday: 9:00 AM - 6:00 PM EST'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const websiteContent = localStorage.getItem('websiteContent');
      if (websiteContent) {
        try {
          const parsed = JSON.parse(websiteContent);
          if (parsed.contact) {
            setContent(parsed.contact);
          }
        } catch (e) {
          console.error('Error parsing website content:', e);
        }
      }

      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          setContactInfo({
            email: parsed.contactEmail || 'support@usmobilenetworks.com',
            phone: parsed.contactPhone || '1-800-456-7890',
            address: parsed.address || '350 5th Avenue, Suite 7710, New York, NY 10118',
            businessHours: parsed.businessHours || 'Monday - Friday: 9:00 AM - 6:00 PM EST',
          });
        } catch (e) {
          console.error('Error loading contact info:', e);
        }
      }
    }
  }, []);

  return (
    <section id="contact" className="py-12 px-4 bg-[#0a0e27] relative overflow-hidden -mt-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {content.title}
        </h2>
        <p className="text-lg text-gray-300 text-center mb-12 leading-relaxed max-w-2xl mx-auto">
          {content.content}
        </p>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-10 border border-white/10 hover:border-blue-500/50 transition-all duration-300 shadow-xl">
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="text-center md:text-left p-5 sm:p-6 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto md:mx-0 mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-envelope text-xl sm:text-2xl text-blue-400"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Email</h3>
              <a href={`mailto:${contactInfo.email}`} className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors break-all">
                {contactInfo.email}
              </a>
            </div>
            <div className="text-center md:text-left p-5 sm:p-6 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto md:mx-0 mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-phone text-xl sm:text-2xl text-purple-400"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Phone</h3>
              <a href={`tel:${contactInfo.phone.replace(/\D/g, '')}`} className="text-sm sm:text-base text-gray-300 hover:text-purple-400 transition-colors">
                {contactInfo.phone}
              </a>
            </div>
            <div className="text-center md:text-left p-5 sm:p-6 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border border-green-500/20 hover:border-green-500/50 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto md:mx-0 mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-map-marker-alt text-xl sm:text-2xl text-green-400"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Address</h3>
              <p className="text-sm sm:text-base text-gray-300">
                {contactInfo.address}
              </p>
            </div>
            <div className="text-center md:text-left p-5 sm:p-6 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto md:mx-0 mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-clock text-xl sm:text-2xl text-yellow-400"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Business Hours</h3>
              <p className="text-sm sm:text-base text-gray-300">
                {contactInfo.businessHours}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

