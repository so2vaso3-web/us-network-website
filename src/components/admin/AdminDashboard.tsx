'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    paypalOrders: 0,
    cryptoOrders: 0,
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    unreadMessages: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const loadStats = async () => {
    if (typeof window !== 'undefined') {
      // Load packages từ server
      let packages: any[] = [];
      try {
        const packagesResponse = await fetch('/api/packages', { cache: 'no-store' });
        if (packagesResponse.ok) {
          const packagesData = await packagesResponse.json();
          if (packagesData.success) {
            packages = packagesData.packages || [];
          }
        }
      } catch (e) {
        console.error('Error loading packages:', e);
        packages = JSON.parse(localStorage.getItem('packages') || '[]');
      }

      // Load orders từ server
      let orders: any[] = [];
      try {
        const ordersResponse = await fetch('/api/orders', { cache: 'no-store' });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.success) {
            orders = ordersData.orders || [];
          }
        }
      } catch (e) {
        console.error('Error loading orders:', e);
        orders = JSON.parse(localStorage.getItem('orders') || '[]');
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthlyOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear && o.status === 'completed';
      });

      const completedOrders = orders.filter((o: any) => o.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.price || 0), 0);
      const monthlyRevenue = monthlyOrders.reduce((sum: number, o: any) => sum + (o.price || 0), 0);

      // Load visitor stats
      const visits = JSON.parse(localStorage.getItem('visitorStats') || '[]');
      const uniqueVisitors = JSON.parse(localStorage.getItem('uniqueVisitors') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const todayVisits = visits.filter((v: any) => v.date === today).length;

      // Load chat messages
      const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      const unreadMessages = chatMessages.filter((m: any) => !m.read && !m.isAdmin).length;

      setStats({
        totalPackages: packages.length || 0,
        totalOrders: orders.length || 0,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length || 0,
        completedOrders: completedOrders.length || 0,
        cancelledOrders: orders.filter((o: any) => o.status === 'cancelled').length || 0,
        totalRevenue,
        monthlyRevenue,
        paypalOrders: orders.filter((o: any) => o.paymentMethod === 'paypal').length || 0,
        cryptoOrders: orders.filter((o: any) => o.paymentMethod === 'crypto').length || 0,
        totalVisits: visits.length || 0,
        uniqueVisitors: uniqueVisitors.length || 0,
        todayVisits: todayVisits || 0,
        unreadMessages: unreadMessages || 0,
      });

      // Cập nhật recent orders
      const recent = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentOrders(recent);
    }
  };

  useEffect(() => {
    loadStats();
    // Auto-refresh stats every 5 seconds để đồng bộ real-time
    const interval = setInterval(loadStats, 5000);
    
    // Lắng nghe event khi packages hoặc orders được cập nhật
    const handlePackagesUpdated = () => {
      loadStats();
    };
    const handleOrdersUpdated = () => {
      loadStats();
    };
    
    window.addEventListener('packagesUpdated', handlePackagesUpdated);
    window.addEventListener('ordersUpdated', handleOrdersUpdated);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('packagesUpdated', handlePackagesUpdated);
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateGrowth = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '100.0' : '0.0';
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Calculate previous month revenue for comparison
  const getPreviousMonthRevenue = () => {
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const now = new Date();
      const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      
      const previousMonthOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === previousMonth && 
               orderDate.getFullYear() === previousYear && 
               o.status === 'completed';
      });
      
      return previousMonthOrders.reduce((sum: number, o: any) => sum + (o.price || 0), 0);
    }
    return 0;
  };

  const previousMonthRevenue = getPreviousMonthRevenue();
  const revenueGrowth = calculateGrowth(stats.monthlyRevenue, previousMonthRevenue);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Bảng Điều Khiển
          </h2>
          <p className="text-gray-400 text-sm">Tổng quan về website và đơn hàng</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const data = {
                packages: JSON.parse(localStorage.getItem('packages') || '[]'),
                orders: JSON.parse(localStorage.getItem('orders') || '[]'),
                settings: JSON.parse(localStorage.getItem('adminSettings') || '{}'),
                content: JSON.parse(localStorage.getItem('websiteContent') || '{}'),
                exportedAt: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              alert('Đã xuất backup thành công!');
            }}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-download"></i>
            <span>Xuất Backup</span>
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      if (!event.target?.result) return;
                      const data = JSON.parse(event.target.result as string);
                      if (data.packages) localStorage.setItem('packages', JSON.stringify(data.packages));
                      if (data.orders) localStorage.setItem('orders', JSON.stringify(data.orders));
                      if (data.settings) localStorage.setItem('adminSettings', JSON.stringify(data.settings));
                      if (data.content) localStorage.setItem('websiteContent', JSON.stringify(data.content));
                      alert('Đã khôi phục backup thành công! Vui lòng refresh trang.');
                      window.location.reload();
                    } catch (err) {
                      alert('Lỗi: File backup không hợp lệ!');
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-upload"></i>
            <span>Khôi Phục Backup</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/50 transition-colors">
              <i className="fas fa-box text-blue-400 text-xl"></i>
            </div>
            <span className="text-3xl font-bold text-white">{stats.totalPackages}</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Tổng Gói Cước</p>
          <p className="text-gray-500 text-xs">Hiện có trong hệ thống</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/50 transition-colors">
              <i className="fas fa-shopping-cart text-purple-400 text-xl"></i>
            </div>
            <span className="text-3xl font-bold text-white">{stats.totalOrders}</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Tổng Đơn Hàng</p>
          <p className="text-gray-500 text-xs">Tất cả các đơn hàng</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/30 flex items-center justify-center group-hover:bg-yellow-500/50 transition-colors">
              <i className="fas fa-clock text-yellow-400 text-xl"></i>
            </div>
            <span className="text-3xl font-bold text-white">{stats.pendingOrders}</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Đơn Chờ Xử Lý</p>
          <p className="text-gray-500 text-xs">Cần xử lý ngay</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/30 flex items-center justify-center group-hover:bg-green-500/50 transition-colors">
              <i className="fas fa-check-circle text-green-400 text-xl"></i>
            </div>
            <span className="text-3xl font-bold text-white">{stats.completedOrders}</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Đơn Hoàn Thành</p>
          <p className="text-gray-500 text-xs">{stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}% tổng đơn</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-xl p-6 hover:border-indigo-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/50 transition-colors">
              <i className="fas fa-users text-indigo-400 text-xl"></i>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white block">{stats.uniqueVisitors}</span>
              <span className="text-xs text-gray-400">unique</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Lượt Truy Cập</p>
          <p className="text-gray-500 text-xs">{stats.todayVisits} hôm nay | {stats.totalVisits} tổng</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/50 transition-colors">
              <i className="fas fa-envelope-open text-cyan-400 text-xl"></i>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white block">{stats.unreadMessages}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Tin Nhắn Chưa Đọc</p>
          <p className="text-gray-500 text-xs">Cần phản hồi</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6 hover:border-red-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-red-500/30 flex items-center justify-center group-hover:bg-red-500/50 transition-colors">
              <i className="fas fa-times-circle text-red-400 text-xl"></i>
            </div>
            <span className="text-3xl font-bold text-white">{stats.cancelledOrders}</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Đơn Đã Hủy</p>
          <p className="text-gray-500 text-xs">Không thành công</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/50 transition-colors">
              <i className="fas fa-dollar-sign text-emerald-400 text-xl"></i>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white block">{formatCurrency(stats.totalRevenue)}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Tổng Doanh Thu</p>
          <p className="text-gray-500 text-xs">Tất cả thời gian</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/50 transition-colors">
              <i className="fas fa-calendar-alt text-cyan-400 text-xl"></i>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white block">{formatCurrency(stats.monthlyRevenue)}</span>
              {revenueGrowth !== '0.0' && (
                <span className={`text-xs font-semibold ${parseFloat(revenueGrowth) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(revenueGrowth) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(revenueGrowth))}%
                </span>
              )}
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Doanh Thu Tháng Này</p>
          <p className="text-gray-500 text-xs">So với tháng trước</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-6 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-pink-500/30 flex items-center justify-center group-hover:bg-pink-500/50 transition-colors">
              <i className="fas fa-credit-card text-pink-400 text-xl"></i>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="bg-blue-500/30 px-2 py-1 rounded text-xs">{stats.paypalOrders}</span>
                  <span className="text-gray-400">PayPal</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="bg-orange-500/30 px-2 py-1 rounded text-xs">{stats.cryptoOrders}</span>
                  <span className="text-gray-400">Crypto</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Phương Thức Thanh Toán</p>
          <p className="text-gray-500 text-xs">PayPal & Crypto</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-history text-blue-400"></i>
            <span>Đơn Hàng Gần Đây</span>
          </h3>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Scroll to orders page
              const ordersTab = document.querySelector('[data-tab="orders"]');
              if (ordersTab) (ordersTab as HTMLElement).click();
            }}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-sm font-semibold text-gray-300">Mã Đơn</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-300">Khách Hàng</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-300">Gói Cước</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-300">Giá</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-300">Thanh Toán</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-300">Trạng Thái</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-300">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                    <p>Chưa có đơn hàng nào</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                    <tr key={order.orderId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 text-gray-300 font-mono text-xs">{order.orderId}</td>
                      <td className="p-3 text-sm">
                        <div className="font-medium">{order.customerName || order.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{order.customerEmail || order.email || ''}</div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium">{order.planName}</div>
                        <div className="text-xs text-gray-500 capitalize">{order.carrier}</div>
                      </td>
                      <td className="p-3 font-semibold text-white">{formatCurrency(order.price || 0)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.paymentMethod === 'paypal' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {order.paymentMethod === 'paypal' ? 'PayPal' : 'Crypto'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {order.status === 'pending' ? 'Chờ Xử Lý' : order.status === 'completed' ? 'Hoàn Thành' : 'Đã Hủy'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-bolt text-yellow-400"></i>
            <span>Thao Tác Nhanh</span>
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                const ordersTab = document.querySelector('[data-tab="packages"]');
                if (ordersTab) (ordersTab as HTMLElement).click();
              }}
              className="w-full px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-box text-blue-400 group-hover:scale-110 transition-transform"></i>
                <span className="font-semibold">Thêm Gói Cước Mới</span>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all"></i>
            </button>
            <button
              onClick={() => {
                const ordersTab = document.querySelector('[data-tab="orders"]');
                if (ordersTab) (ordersTab as HTMLElement).click();
              }}
              className="w-full px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-shopping-cart text-purple-400 group-hover:scale-110 transition-transform"></i>
                <span className="font-semibold">Xem Đơn Hàng</span>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"></i>
            </button>
            <button
              onClick={() => {
                const ordersTab = document.querySelector('[data-tab="settings"]');
                if (ordersTab) (ordersTab as HTMLElement).click();
              }}
              className="w-full px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-cog text-green-400 group-hover:scale-110 transition-transform"></i>
                <span className="font-semibold">Cài Đặt Hệ Thống</span>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all"></i>
            </button>
          </div>
        </div>

        {/* Welcome Info */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-400"></i>
            <span>Hướng Dẫn Sử Dụng</span>
          </h3>
          <p className="text-gray-400 mb-4 text-sm leading-relaxed">
            Sử dụng menu bên trên để quản lý toàn bộ website và đơn hàng của bạn.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <i className="fas fa-check-circle text-green-400 mt-1"></i>
              <div>
                <span className="font-semibold text-gray-300">Quản lý gói cước:</span> Thêm, sửa, xóa các gói cước
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <i className="fas fa-check-circle text-green-400 mt-1"></i>
              <div>
                <span className="font-semibold text-gray-300">Quản lý đơn hàng:</span> Xem và cập nhật trạng thái đơn hàng
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <i className="fas fa-check-circle text-green-400 mt-1"></i>
              <div>
                <span className="font-semibold text-gray-300">Quản lý nội dung:</span> Chỉnh sửa nội dung website
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <i className="fas fa-check-circle text-green-400 mt-1"></i>
              <div>
                <span className="font-semibold text-gray-300">Cài đặt:</span> Cấu hình PayPal, Crypto, và các thiết lập khác
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

