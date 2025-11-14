'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOrders();
    // Auto-refresh orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orders');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setOrders(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Error loading orders:', e);
          setOrders([]);
        }
      }
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
    alert('Đã cập nhật trạng thái đơn hàng!');
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      const updated = orders.filter(o => o.orderId !== orderId);
      setOrders(updated);
      localStorage.setItem('orders', JSON.stringify(updated));
      alert('Đã xóa đơn hàng!');
    }
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap: Record<Order['status'], string> = {
      pending: 'Chờ Xử Lý',
      completed: 'Hoàn Thành',
      cancelled: 'Đã Hủy',
    };
    return statusMap[status];
  };

  const handleBulkAction = (action: 'complete' | 'cancel' | 'delete') => {
    if (selectedOrders.size === 0) {
      alert('Vui lòng chọn ít nhất một đơn hàng!');
      return;
    }

    if (action === 'delete' && !confirm(`Bạn có chắc chắn muốn xóa ${selectedOrders.size} đơn hàng?`)) {
      return;
    }

    const updated = orders.filter(order => {
      if (selectedOrders.has(order.orderId)) {
        if (action === 'delete') return false;
        if (action === 'complete') {
          order.status = 'completed';
        } else if (action === 'cancel') {
          order.status = 'cancelled';
        }
      }
      return true;
    });

    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
    setSelectedOrders(new Set());
    alert(`Đã ${action === 'complete' ? 'hoàn thành' : action === 'cancel' ? 'hủy' : 'xóa'} ${selectedOrders.size} đơn hàng!`);
    loadOrders();
  };

  const handleExportOrders = () => {
    const csv = [
      ['Mã Đơn', 'Tên Gói', 'Nhà Mạng', 'Khách Hàng', 'Email', 'Điện Thoại', 'Giá', 'Thanh Toán', 'Trạng Thái', 'Ngày Tạo'].join(','),
      ...filteredAndSortedOrders.map(order => [
        order.orderId,
        order.planName,
        order.carrier,
        order.customerName || order.name || '',
        order.customerEmail || order.email || '',
        order.customerPhone || order.phone || '',
        order.price,
        order.paymentMethod,
        order.status,
        new Date(order.createdAt).toLocaleString('vi-VN')
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Đã xuất file CSV thành công!');
  };

  const handleToggleSelectAll = () => {
    if (selectedOrders.size === filteredAndSortedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredAndSortedOrders.map(o => o.orderId)));
    }
  };

  const handleToggleSelect = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const filteredAndSortedOrders = orders
    .filter(order => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        order.orderId.toLowerCase().includes(search) ||
        order.planName.toLowerCase().includes(search) ||
        order.carrier.toLowerCase().includes(search) ||
        ((order.customerName || order.name) && (order.customerName || order.name || '').toLowerCase().includes(search)) ||
        ((order.customerEmail || order.email) && (order.customerEmail || order.email || '').toLowerCase().includes(search)) ||
        ((order.customerPhone || order.phone) && (order.customerPhone || order.phone || '').toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản Lý Đơn Hàng</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExportOrders}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-download"></i>
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'status')}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          <option value="date">Sắp xếp theo Ngày</option>
          <option value="price">Sắp xếp theo Giá</option>
          <option value="status">Sắp xếp theo Trạng Thái</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
        >
          <i className={`fas fa-sort-amount-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-between">
          <span className="font-semibold">Đã chọn {selectedOrders.size} đơn hàng</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('complete')}
              className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors text-sm"
            >
              <i className="fas fa-check mr-1"></i>Hoàn Thành
            </button>
            <button
              onClick={() => handleBulkAction('cancel')}
              className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 transition-colors text-sm"
            >
              <i className="fas fa-times mr-1"></i>Hủy
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors text-sm"
            >
              <i className="fas fa-trash mr-1"></i>Xóa
            </button>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors text-sm"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Tất Cả ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Chờ Xử Lý ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Hoàn Thành ({orders.filter(o => o.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Đã Hủy ({orders.filter(o => o.status === 'cancelled').length})
        </button>
      </div>

      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <i className="fas fa-shopping-cart text-4xl mb-4 opacity-50"></i>
          <p>Chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="text-left p-4">Mã Đơn</th>
                <th className="text-left p-4">Gói Cước</th>
                <th className="text-left p-4">Khách Hàng</th>
                <th className="text-left p-4">Giá</th>
                <th className="text-left p-4">Thanh Toán</th>
                <th className="text-left p-4">Trạng Thái</th>
                <th className="text-left p-4">Ngày Tạo</th>
                <th className="text-left p-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.map(order => (
                <tr key={order.orderId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.orderId)}
                      onChange={() => handleToggleSelect(order.orderId)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-4 text-gray-400 font-mono text-sm">{order.orderId}</td>
                  <td className="p-4">
                    <div className="font-semibold">{order.planName}</div>
                    <div className="text-sm text-gray-400">{order.carrier}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold">{order.customerName || 'N/A'}</div>
                    <div className="text-sm text-gray-400">{order.customerEmail || 'N/A'}</div>
                    <div className="text-sm text-gray-400">{order.customerPhone || 'N/A'}</div>
                  </td>
                  <td className="p-4 font-semibold">${order.price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.paymentMethod === 'paypal' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {order.paymentMethod === 'paypal' ? 'PayPal' : 'Crypto'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors text-sm"
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye mr-1"></i>Chi Tiết
                      </button>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.orderId, 'completed')}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors text-sm"
                            title="Đánh dấu hoàn thành"
                          >
                            <i className="fas fa-check mr-1"></i>Hoàn Thành
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.orderId, 'cancelled')}
                            className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 transition-colors text-sm"
                            title="Hủy đơn hàng"
                          >
                            <i className="fas fa-times mr-1"></i>Hủy
                          </button>
                        </>
                      )}
                      {order.status === 'completed' && (
                        <button
                          onClick={() => {
                            const invoice = `INVOICE #${order.orderId}\n\nPlan: ${order.planName}\nCarrier: ${order.carrier}\nPrice: $${order.price}\nCustomer: ${order.customerName || order.name || 'N/A'}\nEmail: ${order.customerEmail || order.email || 'N/A'}\nPhone: ${order.customerPhone || order.phone || 'N/A'}\nPayment: ${order.paymentMethod}\nDate: ${new Date(order.createdAt).toLocaleString('vi-VN')}`;
                            const blob = new Blob([invoice], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `invoice_${order.orderId}.txt`;
                            link.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors text-sm"
                          title="Tải hóa đơn"
                        >
                          <i className="fas fa-file-invoice mr-1"></i>Hóa Đơn
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order.orderId)}
                        className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors text-sm"
                        title="Xóa đơn hàng"
                      >
                        <i className="fas fa-trash mr-1"></i>Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f3a] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Chi Tiết Đơn Hàng</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Mã Đơn</label>
                  <div className="font-mono">{selectedOrder.orderId}</div>
                </div>
                  <div>
                    <label className="text-gray-400 text-sm">Trạng Thái</label>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        selectedOrder.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        selectedOrder.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Gói Cước</label>
                <div className="font-semibold">{selectedOrder.planName}</div>
                <div className="text-sm text-gray-400">{selectedOrder.carrier}</div>
                <div className="text-lg font-bold mt-1">${selectedOrder.price}</div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Thông Tin Khách Hàng</label>
                <div className="mt-2 space-y-1">
                  <div><strong>Tên:</strong> {selectedOrder.customerName || selectedOrder.name || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedOrder.customerEmail || selectedOrder.email || 'N/A'}</div>
                  <div><strong>Điện Thoại:</strong> {selectedOrder.customerPhone || selectedOrder.phone || 'N/A'}</div>
                  {(selectedOrder.customerNotes || selectedOrder.notes) && (
                    <div className="mt-2">
                      <strong>Ghi Chú:</strong>
                      <div className="text-gray-400">{selectedOrder.customerNotes || selectedOrder.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Phương Thức Thanh Toán</label>
                <div>
                  <span className={`px-3 py-1 rounded font-semibold ${
                    selectedOrder.paymentMethod === 'paypal' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {selectedOrder.paymentMethod === 'paypal' ? 'PayPal' : 'Cryptocurrency'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Ngày Tạo</label>
                <div>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</div>
              </div>

              {(selectedOrder.customerNotes || selectedOrder.notes) && (
                <div>
                  <label className="text-gray-400 text-sm">Ghi Chú Khách Hàng</label>
                  <div className="mt-2 p-3 bg-white/5 rounded-lg text-gray-300">{selectedOrder.customerNotes || selectedOrder.notes}</div>
                </div>
              )}

              {(selectedOrder.paymentId || selectedOrder.transactionHash) && (
                <div>
                  <label className="text-gray-400 text-sm">Thông Tin Thanh Toán</label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.paymentId && (
                      <div>
                        <strong>Payment ID:</strong> <span className="font-mono text-sm">{selectedOrder.paymentId}</span>
                      </div>
                    )}
                    {selectedOrder.transactionHash && (
                      <div>
                        <strong>Transaction Hash:</strong> <span className="font-mono text-sm break-all">{selectedOrder.transactionHash}</span>
                      </div>
                    )}
                    {selectedOrder.paymentVerified !== undefined && (
                      <div>
                        <strong>Xác Minh:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${selectedOrder.paymentVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {selectedOrder.paymentVerified ? 'Đã Xác Minh' : 'Chưa Xác Minh'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6 flex-wrap">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Đóng
              </button>
              {selectedOrder.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.orderId, 'completed');
                      setSelectedOrder(null);
                      loadOrders();
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <i className="fas fa-check mr-2"></i>Đánh Dấu Hoàn Thành
                  </button>
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.orderId, 'cancelled');
                      setSelectedOrder(null);
                      loadOrders();
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <i className="fas fa-times mr-2"></i>Hủy Đơn Hàng
                  </button>
                </>
              )}
              {(selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled') && (
                <button
                  onClick={() => {
                    const invoice = `INVOICE #${selectedOrder.orderId}\n\nPlan: ${selectedOrder.planName}\nCarrier: ${selectedOrder.carrier}\nPrice: $${selectedOrder.price}\nCustomer: ${selectedOrder.customerName || selectedOrder.name || 'N/A'}\nEmail: ${selectedOrder.customerEmail || selectedOrder.email || 'N/A'}\nPhone: ${selectedOrder.customerPhone || selectedOrder.phone || 'N/A'}\nPayment: ${selectedOrder.paymentMethod}\nStatus: ${getStatusText(selectedOrder.status)}\nDate: ${new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}${selectedOrder.paymentId ? `\nPayment ID: ${selectedOrder.paymentId}` : ''}${selectedOrder.transactionHash ? `\nTransaction Hash: ${selectedOrder.transactionHash}` : ''}`;
                    const blob = new Blob([invoice], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `invoice_${selectedOrder.orderId}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                    alert('Đã tải hóa đơn thành công!');
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <i className="fas fa-file-invoice mr-2"></i>Tải Hóa Đơn
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

