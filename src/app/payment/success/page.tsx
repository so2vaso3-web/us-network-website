'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    // Get order ID from URL or localStorage
    const urlOrderId = searchParams.get('orderId') || searchParams.get('token');
    const pendingOrder = localStorage.getItem('pendingPayPalOrder');
    
    const finalOrderId = urlOrderId || pendingOrder || '';
    setOrderId(finalOrderId);

    // If we have an order ID, try to update order status
    if (finalOrderId) {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const orderIndex = orders.findIndex((o: any) => o.orderId === finalOrderId || o.paymentId === finalOrderId);
      
      if (orderIndex !== -1 && orders[orderIndex].status === 'pending') {
        // Order might already be completed, but update if needed
        orders[orderIndex].status = 'completed';
        orders[orderIndex].completedAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
      }
      
      localStorage.removeItem('pendingPayPalOrder');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check-circle text-green-400 text-4xl"></i>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Payment Successful!
        </h1>
        
        <p className="text-gray-300 mb-4 leading-relaxed">
          Thank you for your purchase! Your payment has been successfully processed.
        </p>

        {orderId && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Order ID</p>
            <p className="font-mono text-sm text-white">{orderId}</p>
          </div>
        )}

        <p className="text-gray-400 text-sm mb-6">
          We will contact you shortly to activate your mobile plan. Please check your email for order confirmation.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
          >
            <i className="fas fa-home"></i>
            <span>Return to Homepage</span>
          </Link>
          
          <Link
            href="/#plans"
            className="px-6 py-3 bg-white/5 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <i className="fas fa-list"></i>
            <span>View More Plans</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-spinner fa-spin text-green-400 text-4xl"></i>
          </div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

