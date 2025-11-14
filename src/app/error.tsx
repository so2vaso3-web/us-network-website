'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400"></i>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-red-400">Something went wrong!</h1>
        <p className="text-gray-300 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

