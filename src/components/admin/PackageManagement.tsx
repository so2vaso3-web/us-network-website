'use client';

import { useState, useEffect } from 'react';
import { Package } from '@/types';
import { defaultPackages } from '@/lib/data';
import { savePackagesToServer, notifyPackagesUpdated } from '@/lib/usePackages';
import Toast from '@/components/Toast';

export default function PackageManagement() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const loadPackages = async () => {
    if (typeof window !== 'undefined') {
      try {
        // Ưu tiên load từ server
        const response = await fetch('/api/packages', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
            setPackages(data.packages);
            localStorage.setItem('packages', JSON.stringify(data.packages));
            return;
          }
        }
      } catch (error) {
        console.error('Error loading packages from server:', error);
      }

      // Fallback: thử load từ localStorage
      const saved = localStorage.getItem('packages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPackages(parsed);
            return;
          }
        } catch (e) {
          console.error('Error loading packages from localStorage:', e);
        }
      }

      // Cuối cùng: dùng default packages
      setPackages(defaultPackages);
      localStorage.setItem('packages', JSON.stringify(defaultPackages));
    }
  };

  useEffect(() => {
    loadPackages();
    
    // Lắng nghe event khi packages được cập nhật từ nơi khác
    const handlePackagesUpdated = () => {
      loadPackages();
    };
    window.addEventListener('packagesUpdated', handlePackagesUpdated);
    
    return () => {
      window.removeEventListener('packagesUpdated', handlePackagesUpdated);
    };
  }, []);

  const savePackages = async (updatedPackages: Package[]) => {
    setPackages(updatedPackages);
    
    // Lưu vào localStorage làm cache tạm thời
    localStorage.setItem('packages', JSON.stringify(updatedPackages));
    
    // Lưu lên server để đồng bộ với tất cả thiết bị
    const success = await savePackagesToServer(updatedPackages);
    
    if (success) {
      setToast({ message: 'Đã lưu gói cước thành công! Tất cả thiết bị và người dùng sẽ thấy cập nhật trong vòng 5 giây.', type: 'success' });
    } else {
      setToast({ message: 'Đã lưu vào cache local, nhưng không thể lưu lên server. Vui lòng thử lại hoặc kiểm tra kết nối.', type: 'warning' });
      // Vẫn dispatch event để cập nhật trong tab hiện tại
      notifyPackagesUpdated();
    }
  };

  const handleDelete = (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (window.confirm(`Bạn có chắc chắn muốn xóa gói cước "${pkg?.name}"?`)) {
      const updated = packages.filter(p => p.id !== id);
      savePackages(updated);
      setToast({ message: `Đã xóa gói cước "${pkg?.name}"!`, type: 'success' });
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage({ ...pkg });
    setShowForm(true);
    // Scroll to top để thấy form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = () => {
    setEditingPackage({
      id: `pkg-${Date.now()}`,
      carrier: 'verizon',
      name: '',
      price: 0,
      period: 'month',
      data: '',
      speed: '',
      hotspot: '',
      features: [],
      badge: undefined,
    });
    setShowForm(true);
    // Scroll to top để thấy form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!editingPackage) return;

    if (!editingPackage.name || !editingPackage.price) {
      setToast({ message: 'Vui lòng điền đầy đủ thông tin!', type: 'error' });
      return;
    }

    const updated = editingPackage.id && packages.find(p => p.id === editingPackage!.id)
      ? packages.map(p => p.id === editingPackage.id ? editingPackage : p)
      : [...packages, editingPackage];

    savePackages(updated);
    setShowForm(false);
    setEditingPackage(null);
  };

  const carriers = ['verizon', 'att', 'tmobile', 'uscellular', 'mintmobile', 'cricket'];
  const carrierNames: Record<string, string> = {
    verizon: 'Verizon',
    att: 'AT&T',
    tmobile: 'T-Mobile',
    uscellular: 'US Cellular',
    mintmobile: 'Mint Mobile',
    cricket: 'Cricket Wireless',
  };

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Quản Lý Gói Cước</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const json = JSON.stringify(packages, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `packages_${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
              setToast({ message: 'Đã xuất file JSON thành công!', type: 'success' });
            }}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-download"></i>
            <span>Xuất JSON</span>
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
                  reader.onload = async (event) => {
                    try {
                      if (!event.target?.result) return;
                      const imported = JSON.parse(event.target.result as string);
                      if (Array.isArray(imported)) {
                        if (confirm(`Bạn có chắc chắn muốn import ${imported.length} gói cước? Gói cước hiện tại sẽ bị thay thế.`)) {
                          setPackages(imported);
                          // Lưu vào localStorage làm cache tạm thời
                          localStorage.setItem('packages', JSON.stringify(imported));
                          // Lưu lên server để đồng bộ với tất cả thiết bị
                          const success = await savePackagesToServer(imported);
                          if (success) {
                            setToast({ message: 'Đã import thành công! Tất cả thiết bị và người dùng sẽ thấy cập nhật trong vòng 5 giây.', type: 'success' });
                          } else {
                            setToast({ message: 'Đã import vào cache local, nhưng không thể lưu lên server. Vui lòng thử lại.', type: 'warning' });
                            notifyPackagesUpdated();
                          }
                        }
                      } else {
                        setToast({ message: 'File không hợp lệ! Vui lòng chọn file JSON đúng định dạng.', type: 'error' });
                      }
                    } catch (error) {
                      setToast({ message: 'Lỗi đọc file! Vui lòng kiểm tra file và thử lại.', type: 'error' });
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-upload"></i>
            <span>Import JSON</span>
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Thêm Gói Mới</span>
          </button>
        </div>
      </div>

      {showForm && editingPackage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setEditingPackage(null);
            }
          }}
        >
          <div 
            className="bg-[#1a1f3a] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {packages.find(p => p.id === editingPackage.id) ? 'Sửa' : 'Thêm'} Gói Cước
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingPackage(null);
                }}
                className="text-gray-400 hover:text-white text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">ID *</label>
                <input
                  type="text"
                  value={editingPackage.id}
                  onChange={(e) => setEditingPackage({ ...editingPackage, id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                  placeholder="vz-5g-start-month"
                  disabled={!!packages.find(p => p.id === editingPackage.id)}
                />
                <small className="text-gray-400 text-xs block mt-1">
                  ID là duy nhất, không thể thay đổi khi đang sửa gói cước có sẵn.
                </small>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Nhà Mạng *</label>
                <select
                  value={editingPackage.carrier}
                  onChange={(e) => setEditingPackage({ ...editingPackage, carrier: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {carriers.map(c => (
                    <option key={c} value={c}>{carrierNames[c]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold">Tên Gói *</label>
                <input
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="5G Start"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Giá *</label>
                  <input
                    type="number"
                    value={editingPackage.price}
                    onChange={(e) => setEditingPackage({ ...editingPackage, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Kỳ Hạn</label>
                  <select
                    value={editingPackage.period}
                    onChange={(e) => setEditingPackage({ ...editingPackage, period: e.target.value as 'month' | 'year' })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="month">Tháng</option>
                    <option value="year">Năm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Data</label>
                  <input
                    type="text"
                    value={editingPackage.data}
                    onChange={(e) => setEditingPackage({ ...editingPackage, data: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Tốc Độ</label>
                  <input
                    type="text"
                    value={editingPackage.speed}
                    onChange={(e) => setEditingPackage({ ...editingPackage, speed: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="5G"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Hotspot</label>
                  <input
                    type="text"
                    value={editingPackage.hotspot}
                    onChange={(e) => setEditingPackage({ ...editingPackage, hotspot: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="None"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold">Tính Năng (mỗi dòng một tính năng)</label>
                <textarea
                  value={editingPackage.features.join('\n')}
                  onChange={(e) => setEditingPackage({ ...editingPackage, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  rows={5}
                  placeholder="Unlimited 5G data&#10;HD video streaming&#10;Unlimited talk & text"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Badge (tùy chọn)</label>
                <input
                  type="text"
                  value={editingPackage.badge || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, badge: e.target.value || undefined })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="POPULAR, NEW, BEST VALUE"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => { 
                  if (window.confirm('Bạn có chắc chắn muốn hủy? Thay đổi chưa được lưu sẽ bị mất.')) {
                    setShowForm(false);
                    setEditingPackage(null);
                  }
                }}
                className="flex-1 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 font-semibold"
              >
                <i className="fas fa-save mr-2"></i>Lưu Gói Cước
              </button>
            </div>
          </div>
        </div>
      )}

      {packages.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <i className="fas fa-box text-4xl mb-4 opacity-50"></i>
          <p>Chưa có gói cước nào. Hãy thêm gói cước mới!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Nhà Mạng</th>
                <th className="text-left p-4">Tên Gói</th>
                <th className="text-left p-4">Giá</th>
                <th className="text-left p-4">Kỳ Hạn</th>
                <th className="text-left p-4">Data</th>
                <th className="text-left p-4">Tốc Độ</th>
                <th className="text-left p-4">Badge</th>
                <th className="text-left p-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-gray-400 font-mono text-sm">{pkg.id}</td>
                  <td className="p-4">
                    <div className="font-semibold">{carrierNames[pkg.carrier]}</div>
                    <div className="text-xs text-gray-400 capitalize">{pkg.carrier}</div>
                  </td>
                  <td className="p-4 font-semibold">{pkg.name}</td>
                  <td className="p-4">
                    <div className="font-bold">${pkg.price}</div>
                    {pkg.period === 'year' && (
                      <div className="text-xs text-green-400">${(pkg.price / 12).toFixed(2)}/tháng</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      pkg.period === 'year' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {pkg.period === 'year' ? 'Năm' : 'Tháng'}
                    </span>
                  </td>
                  <td className="p-4">{pkg.data}</td>
                  <td className="p-4">{pkg.speed}</td>
                  <td className="p-4">
                    {pkg.badge && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                        {pkg.badge}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors text-sm"
                        title="Sửa gói cước"
                      >
                        <i className="fas fa-edit mr-1"></i>Sửa
                      </button>
                      <button
                        onClick={() => {
                          const duplicate = { ...pkg, id: `pkg-${Date.now()}` };
                          savePackages([...packages, duplicate]);
                        }}
                        className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors text-sm"
                        title="Nhân đôi gói cước"
                      >
                        <i className="fas fa-copy mr-1"></i>Nhân Đôi
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors text-sm"
                        title="Xóa gói cước"
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
    </div>
  );
}

