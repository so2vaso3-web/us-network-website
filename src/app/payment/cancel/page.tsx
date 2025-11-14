'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a pending order
    const pendingOrder = localStorage.getItem('pendingPayPalOrder');
    if (pendingOrder) {
      // Update order status to cancelled
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const orderIndex = orders.findIndex((o: any) => o.orderId === pendingOrder);
      if (orderIndex !== -1) {
        orders[orderIndex].status = 'cancelled';
        orders[orderIndex].cancelledAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
      }
      localStorage.removeItem('pendingPayPalOrder');
    }

    // Try to redirect back to homepage - payment modal should still be in memory
    // If user is redirected here, it means they closed the modal, so just go to homepage
    setTimeout(() => {
      router.push('/');
    }, 2000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-times-circle text-red-400 text-4xl"></i>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-300 mb-6 leading-relaxed">
          Your payment was cancelled. No charges were made to your account. Redirecting you back to the homepage...
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
          >
            <i className="fas fa-home"></i>
            <span>Go to Homepage Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

