'use client';

import { useState, useEffect } from 'react';
import { Package } from '@/types';
import { defaultPackages } from '@/lib/data';

export default function PackageManagement() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('packages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPackages(parsed);
            return;
          }
        } catch (e) {
          console.error('Error loading packages:', e);
        }
      }
      // Use default packages if nothing saved
      setPackages(defaultPackages);
      localStorage.setItem('packages', JSON.stringify(defaultPackages));
    }
  };

  const savePackages = (updatedPackages: Package[]) => {
    setPackages(updatedPackages);
    localStorage.setItem('packages', JSON.stringify(updatedPackages));
    alert('Đã lưu gói cước thành công!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói cước này?')) {
      const updated = packages.filter(p => p.id !== id);
      savePackages(updated);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage({ ...pkg });
    setShowForm(true);
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
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!editingPackage) return;

    if (!editingPackage.name || !editingPackage.price) {
      alert('Vui lòng điền đầy đủ thông tin!');
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
              alert('Đã xuất file JSON thành công!');
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
                  reader.onload = (event) => {
                    try {
                      if (!event.target?.result) return;
                      const imported = JSON.parse(event.target.result as string);
                      if (Array.isArray(imported)) {
                        if (confirm(`Bạn có chắc chắn muốn import ${imported.length} gói cước? Gói cước hiện tại sẽ bị thay thế.`)) {
                          setPackages(imported);
                          localStorage.setItem('packages', JSON.stringify(imported));
                          alert('Đã import thành công!');
                        }
                      } else {
                        alert('File không hợp lệ!');
                      }
                    } catch (error) {
                      alert('Lỗi đọc file!');
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f3a] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <h3 className="text-xl font-bold mb-4">
              {packages.find(p => p.id === editingPackage.id) ? 'Sửa' : 'Thêm'} Gói Cước
            </h3>

            <div className="space-y-4">
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

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => { setShowForm(false); setEditingPackage(null); }}
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lưu
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

