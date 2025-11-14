'use client';

import { useState } from 'react';

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, NY',
      rating: 5,
      text: 'Amazing service! I got my Verizon plan activated within minutes. The customer support was incredibly helpful and the prices are unbeatable.',
      avatar: 'fas fa-user-circle',
      carrier: 'Verizon',
    },
    {
      name: 'Michael Chen',
      location: 'Los Angeles, CA',
      rating: 5,
      text: 'Switched from my old carrier and saved over $40/month. The AT&T Unlimited plan is perfect for my family. Highly recommended!',
      avatar: 'fas fa-user-circle',
      carrier: 'AT&T',
    },
    {
      name: 'Emily Rodriguez',
      location: 'Chicago, IL',
      rating: 5,
      text: 'T-Mobile 5G coverage is outstanding in my area. Setup was super easy and the payment process was secure. Great experience overall!',
      avatar: 'fas fa-user-circle',
      carrier: 'T-Mobile',
    },
    {
      name: 'David Thompson',
      location: 'Houston, TX',
      rating: 5,
      text: 'Best decision I made this year! The Mint Mobile annual plan saved me hundreds of dollars. Coverage is excellent everywhere I go.',
      avatar: 'fas fa-user-circle',
      carrier: 'Mint Mobile',
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] relative overflow-hidden -mt-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don&apos;t just take our word for it - hear from thousands of satisfied customers
          </p>
        </div>

        <div className="relative">
          {/* Testimonial Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              {/* Rating Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 text-xl"></i>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl text-gray-200 text-center mb-8 leading-relaxed italic">
                &ldquo;{testimonials[currentIndex].text}&rdquo;
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl text-white shadow-lg">
                    <i className={testimonials[currentIndex].avatar}></i>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{testimonials[currentIndex].name}</div>
                    <div className="text-gray-400 text-sm flex items-center gap-2">
                      <i className="fas fa-map-marker-alt"></i>
                      {testimonials[currentIndex].location}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <span className="text-sm text-blue-400 font-semibold">
                    <i className="fas fa-check-circle mr-1"></i>
                    {testimonials[currentIndex].carrier} Customer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all duration-300 flex items-center justify-center z-20 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all duration-300 flex items-center justify-center z-20 hover:scale-110"
            aria-label="Next testimonial"
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-blue-500 w-8 scale-110'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              50K+
            </div>
            <div className="text-gray-400 text-sm">Happy Customers</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              4.9★
            </div>
            <div className="text-gray-400 text-sm">Average Rating</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-gray-400 text-sm">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}

