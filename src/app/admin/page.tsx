'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import PackageManagement from '@/components/admin/PackageManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';
import ChatManagement from '@/components/admin/ChatManagement';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'packages' | 'orders' | 'content' | 'settings' | 'chat'>('dashboard');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication on mount với timeout để đảm bảo không bị stuck
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    const checkAuth = () => {
      if (typeof window !== 'undefined' && isMounted) {
        try {
          const authData = localStorage.getItem('adminAuth');
          if (authData) {
            try {
              const parsed = JSON.parse(authData);
              if (parsed.isAuthenticated && parsed.expiresAt && parsed.expiresAt > Date.now()) {
                if (isMounted) setIsAuthenticated(true);
              } else {
                // Auth expired or invalid
                localStorage.removeItem('adminAuth');
                if (isMounted) setIsAuthenticated(false);
              }
            } catch (e) {
              console.error('Error parsing auth data:', e);
              localStorage.removeItem('adminAuth');
              if (isMounted) setIsAuthenticated(false);
            }
          } else {
            if (isMounted) setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          if (isMounted) setIsAuthenticated(false);
        } finally {
          // Luôn set checkingAuth = false để không bị stuck
          if (isMounted) setCheckingAuth(false);
        }
      } else {
        // Server-side: skip auth check
        if (isMounted) {
          setCheckingAuth(false);
          setIsAuthenticated(false);
        }
      }
    };
    
    // Chạy ngay lập tức
    checkAuth();
    
    // Timeout backup - đảm bảo luôn set checkingAuth = false sau 2 giây
    timeoutId = setTimeout(() => {
      if (isMounted) {
        setCheckingAuth(false);
      }
    }, 2000);
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Chỉ chạy 1 lần khi mount

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    // Dispatch event to notify header
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('adminLoggedOut'));
    }
    setIsAuthenticated(false);
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p className="text-gray-300 text-lg">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-1 sm:mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">Quản lý website và đơn hàng</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base min-h-[44px]"
            >
              <i className="fas fa-home"></i>
              <span>Về Trang Web</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 rounded-lg sm:rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base min-h-[44px]"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-xl">
          <button
            data-tab="dashboard"
            onClick={() => setCurrentPage('dashboard')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] ${
              currentPage === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white hover:scale-102'
            }`}
          >
            <i className="fas fa-chart-line text-sm sm:text-base"></i>
            <span className="whitespace-nowrap">Bảng Điều Khiển</span>
          </button>
          <button
            data-tab="packages"
            onClick={() => setCurrentPage('packages')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] ${
              currentPage === 'packages'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white hover:scale-102'
            }`}
          >
            <i className="fas fa-box text-sm sm:text-base"></i>
            <span className="whitespace-nowrap">Quản Lý Gói Cước</span>
          </button>
          <button
            data-tab="orders"
            onClick={() => setCurrentPage('orders')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] ${
              currentPage === 'orders'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white hover:scale-102'
            }`}
          >
            <i className="fas fa-shopping-cart text-sm sm:text-base"></i>
            <span className="whitespace-nowrap">Quản Lý Đơn Hàng</span>
          </button>
          <button
            data-tab="content"
            onClick={() => setCurrentPage('content')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] ${
              currentPage === 'content'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white hover:scale-102'
            }`}
          >
            <i className="fas fa-edit text-sm sm:text-base"></i>
            <span className="whitespace-nowrap">Quản Lý Nội Dung</span>
          </button>
          <button
            data-tab="settings"
            onClick={() => setCurrentPage('settings')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] ${
              currentPage === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white hover:scale-102'
            }`}
          >
            <i className="fas fa-cog text-sm sm:text-base"></i>
            <span className="whitespace-nowrap">Cài Đặt</span>
          </button>
          <button
            data-tab="chat"
            onClick={() => setCurrentPage('chat')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base min-h-[44px] relative ${
              currentPage === 'chat'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white hover:scale-102'
            }`}
          >
            <i className="fas fa-comments text-sm sm:text-base"></i>
            <span className="whitespace-nowrap">Tin Nhắn Chat</span>
            {(() => {
              if (typeof window !== 'undefined') {
                const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
                const unreadCount = chatMessages.filter((m: any) => !m.read && !m.isAdmin).length;
                if (unreadCount > 0) {
                  return (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {unreadCount}
                    </span>
                  );
                }
              }
              return null;
            })()}
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 shadow-2xl">
          {currentPage === 'dashboard' && <AdminDashboard />}
          {currentPage === 'packages' && <PackageManagement />}
          {currentPage === 'orders' && <OrderManagement />}
          {currentPage === 'content' && <ContentManagement />}
          {currentPage === 'settings' && <SettingsManagement />}
          {currentPage === 'chat' && <ChatManagement />}
        </div>
      </div>
    </div>
  );
}

