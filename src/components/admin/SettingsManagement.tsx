'use client';

import { useState, useEffect } from 'react';
import { AdminSettings } from '@/types';
import { useSettings, saveSettingsToServer, notifySettingsUpdated } from '@/lib/useSettings';

export default function SettingsManagement() {
  const { settings: serverSettings, isLoading } = useSettings();
  const [settings, setSettings] = useState<AdminSettings>({
    websiteName: 'US Mobile Networks',
    paypalEnabled: true,
    paypalMode: 'sandbox',
    cryptoEnabled: true,
    cryptoGateway: 'manual',
    defaultLanguage: 'en',
    autoApproveOrders: false,
    emailNotifications: false,
    ordersPerPage: 10,
    carrierLogos: {},
  });

  useEffect(() => {
    if (serverSettings) {
      setSettings(serverSettings);
    }
  }, [serverSettings]);

  const handleSave = async () => {
    // Lưu vào localStorage làm cache tạm thời
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    // Lưu lên server để đồng bộ với tất cả thiết bị
    const success = await saveSettingsToServer(settings);
    
    if (success) {
      alert('Đã lưu cài đặt thành công! Tất cả thiết bị và người dùng sẽ thấy cập nhật trong vòng 10 giây.');
    } else {
      alert('Đã lưu vào cache local, nhưng không thể lưu lên server. Vui lòng thử lại hoặc kiểm tra kết nối.');
      // Vẫn dispatch event để cập nhật trong tab hiện tại
      notifySettingsUpdated();
    }
  };

  const handleLogoUpload = (carrier: string, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const base64 = e.target.result as string;
        setSettings({
          ...settings,
          carrierLogos: {
            ...settings.carrierLogos,
            [carrier]: base64,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = (carrier: string) => {
    const updatedLogos = { ...settings.carrierLogos };
    delete updatedLogos[carrier as keyof typeof updatedLogos];
    setSettings({
      ...settings,
      carrierLogos: updatedLogos,
    });
    alert(`Đã xóa logo ${carrier}!`);
  };

  const carriers = [
    { key: 'verizon', label: 'Verizon' },
    { key: 'att', label: 'AT&T' },
    { key: 'tmobile', label: 'T-Mobile' },
    { key: 'uscellular', label: 'US Cellular' },
    { key: 'mintmobile', label: 'Mint Mobile' },
    { key: 'cricket', label: 'Cricket Wireless' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Cài Đặt</h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-save mr-2"></i>Lưu Cài Đặt
        </button>
      </div>

          <div className="space-y-6">
            {/* Admin Security */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">
                <i className="fas fa-shield-alt mr-2 text-red-400"></i>
                Bảo Mật Admin
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-exclamation-triangle text-yellow-400 text-xl mt-0.5"></i>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-400 mb-1">Important Security Notice</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Thay đổi username và password mặc định ngay sau lần đăng nhập đầu tiên để bảo vệ trang Admin của bạn.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Tên Đăng Nhập (Username)</label>
                  <input
                    type="text"
                    value={settings.adminUsername || 'admin'}
                    onChange={(e) => setSettings({ ...settings, adminUsername: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Mật Khẩu (Password)</label>
                  <input
                    type="password"
                    value={settings.adminPassword || ''}
                    onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Enter new password"
                  />
                  <small className="text-gray-400 text-sm block mt-1">
                    Để trống nếu không muốn thay đổi. Mật khẩu mặc định: admin123
                  </small>
                </div>
              </div>
            </div>

            {/* Website Info */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">
                <i className="fas fa-globe mr-2 text-blue-400"></i>
                Thông Tin Website
              </h3>
              <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold">Tên Website</label>
              <input
                type="text"
                value={settings.websiteName || ''}
                onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="US Mobile Networks"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Email Liên Hệ</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="support@usmobilenetworks.com"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Số Điện Thoại</label>
                <input
                  type="tel"
                  value={settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="1-800-456-7890"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold">Địa Chỉ Công Ty</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="350 5th Avenue, Suite 7710, New York, NY 10118"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Giờ Làm Việc</label>
              <input
                type="text"
                value={settings.businessHours || ''}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="Monday - Friday: 9:00 AM - 6:00 PM EST"
              />
            </div>
          </div>
        </div>

        {/* PayPal Settings */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">
            <i className="fab fa-paypal mr-2 text-blue-400"></i>
            Cài Đặt PayPal
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="paypalEnabled"
                checked={settings.paypalEnabled || false}
                onChange={(e) => setSettings({ ...settings, paypalEnabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="paypalEnabled" className="font-semibold">Kích Hoạt PayPal</label>
            </div>
            {settings.paypalEnabled && (
              <>
                <div>
                  <label className="block mb-2 font-semibold">PayPal Client ID *</label>
                  <input
                    type="text"
                    value={settings.paypalClientId || ''}
                    onChange={(e) => setSettings({ ...settings, paypalClientId: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                    placeholder="AXv40f7lx9qs6ofAsRzBo_Vdds8pSVsUPfFgLku-sa0iLjnymcthSHXWdDNk5Ns5EH4ic-hYTST_i_Bd"
                  />
                  <small className="text-gray-400 text-sm block mt-1">
                    Lấy từ <a href="https://developer.paypal.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://developer.paypal.com/</a>
                  </small>
                </div>
                <div>
                  <label className="block mb-2 font-semibold">PayPal Client Secret *</label>
                  <input
                    type="password"
                    value={settings.paypalClientSecret || ''}
                    onChange={(e) => setSettings({ ...settings, paypalClientSecret: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                    placeholder="Nhập Client Secret từ PayPal Developer Dashboard"
                  />
                  <small className="text-gray-400 text-sm block mt-1">
                    Bảo mật: Không chia sẻ Client Secret với ai. Cần cho server-side payments.
                  </small>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Chế Độ PayPal</label>
                    <select
                      value={settings.paypalMode || 'sandbox'}
                      onChange={(e) => setSettings({ ...settings, paypalMode: e.target.value as 'sandbox' | 'live' })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white dark-select"
                    >
                      <option value="sandbox">Sandbox (Test)</option>
                      <option value="live">Live (Production)</option>
                    </select>
                    <small className="text-gray-400 text-sm block mt-1">
                      Sandbox: Dùng để test. Live: Dùng cho production.
                    </small>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Tiền Tệ</label>
                    <select
                      value={settings.paypalCurrency || 'USD'}
                      onChange={(e) => setSettings({ ...settings, paypalCurrency: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white dark-select"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Return URL (sau khi thanh toán thành công)</label>
                  <input
                    type="url"
                    value={settings.paypalReturnUrl || (typeof window !== 'undefined' ? window.location.origin + '/payment/success' : '/payment/success')}
                    onChange={(e) => setSettings({ ...settings, paypalReturnUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    placeholder="https://yoursite.com/payment/success"
                  />
                  <small className="text-gray-400 text-sm block mt-1">
                    URL mà PayPal sẽ redirect sau khi thanh toán thành công.
                  </small>
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Cancel URL (khi hủy thanh toán)</label>
                  <input
                    type="url"
                    value={settings.paypalCancelUrl || (typeof window !== 'undefined' ? window.location.origin + '/payment/cancel' : '/payment/cancel')}
                    onChange={(e) => setSettings({ ...settings, paypalCancelUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    placeholder="https://yoursite.com/payment/cancel"
                  />
                  <small className="text-gray-400 text-sm block mt-1">
                    URL mà PayPal sẽ redirect khi người dùng hủy thanh toán.
                  </small>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <i className="fas fa-info-circle text-blue-400"></i>
                    Hướng Dẫn Cấu Hình PayPal
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                    <li>Đăng ký tài khoản tại <a href="https://developer.paypal.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">PayPal Developer</a></li>
                    <li>Tạo một App trong Dashboard</li>
                    <li>Sao chép Client ID và Client Secret vào các ô trên</li>
                    <li>Chọn chế độ Sandbox (test) hoặc Live (production)</li>
                    <li>Đặt Return URL và Cancel URL</li>
                    <li>Lưu cài đặt và test thanh toán</li>
                  </ol>
                </div>
                <button
                  onClick={() => {
                    if (!settings.paypalClientId || !settings.paypalClientSecret) {
                      alert('Vui lòng nhập đầy đủ Client ID và Client Secret!');
                      return;
                    }
                    const mode = settings.paypalMode === 'live' ? 'production' : 'sandbox';
                    alert(`Đang test kết nối PayPal...\n\nMode: ${mode}\nClient ID: ${settings.paypalClientId.substring(0, 20)}...\n\nLưu ý: Test thực sự chỉ hoạt động khi thanh toán.`);
                  }}
                  className="w-full px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plug"></i>
                  <span>Test Kết Nối PayPal</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Crypto Settings */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">
            <i className="fab fa-bitcoin mr-2 text-orange-400"></i>
            Cài Đặt Tiền Điện Tử
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="cryptoEnabled"
                checked={settings.cryptoEnabled || false}
                onChange={(e) => setSettings({ ...settings, cryptoEnabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="cryptoEnabled" className="font-semibold">Kích Hoạt Tiền Điện Tử</label>
            </div>
            {settings.cryptoEnabled && (
              <>
                <div>
                  <label className="block mb-2 font-semibold">Cổng Thanh Toán</label>
                  <select
                    value={settings.cryptoGateway || 'manual'}
                    onChange={(e) => setSettings({ ...settings, cryptoGateway: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white dark-select"
                  >
                    <option value="manual">Thủ Công (Manual)</option>
                    <option value="nowpayments">NOWPayments</option>
                    <option value="bitpay">BitPay (Bị chặn tại VN)</option>
                  </select>
                  <small className="text-gray-400 text-sm block mt-1">
                    Khuyến nghị: NOWPayments hoặc Thủ Công. BitPay bị chặn tại Việt Nam.
                  </small>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bitcoin (BTC) */}
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <i className="fab fa-bitcoin text-orange-400"></i>
                      Bitcoin (BTC)
                    </h4>
                    <div>
                      <label className="block mb-2 font-semibold text-sm">Địa Chỉ Bitcoin</label>
                      <input
                        type="text"
                        value={settings.bitcoinAddress || ''}
                        onChange={(e) => setSettings({ ...settings, bitcoinAddress: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                        placeholder="bc1q..."
                      />
                      <small className="text-gray-400 text-xs block mt-1">Bitcoin Mainnet</small>
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h5 className="font-semibold text-sm text-blue-300 mb-2 flex items-center gap-2">
                          <i className="fas fa-info-circle"></i>
                          Hướng dẫn lấy địa chỉ BTC từ Binance:
                        </h5>
                        <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside ml-2">
                          <li>Mở app Binance → Chọn <span className="text-blue-400 font-semibold">Wallet</span></li>
                          <li>Chọn <span className="text-blue-400 font-semibold">Fiat and Spot</span> hoặc <span className="text-blue-400 font-semibold">Funding</span></li>
                          <li>Tìm và chọn <span className="text-blue-400 font-semibold">BTC (Bitcoin)</span></li>
                          <li>Nhấn <span className="text-blue-400 font-semibold">Deposit</span> (Nạp tiền)</li>
                          <li>Chọn network: <span className="text-blue-400 font-semibold">BTC - Bitcoin</span></li>
                          <li>Sao chép địa chỉ ví (bắt đầu bằng <span className="text-orange-400 font-mono">bc1</span> hoặc <span className="text-orange-400 font-mono">1</span> hoặc <span className="text-orange-400 font-mono">3</span>)</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Ethereum (ETH) */}
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <i className="fab fa-ethereum text-blue-400"></i>
                      Ethereum (ETH)
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-2 font-semibold text-sm">Địa Chỉ Ethereum</label>
                        <input
                          type="text"
                          value={settings.ethereumAddress || ''}
                          onChange={(e) => setSettings({ ...settings, ethereumAddress: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                          placeholder="0x..."
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-sm">Mạng Lưới (Network)</label>
                        <select
                          value={settings.ethereumNetwork || 'ethereum'}
                          onChange={(e) => setSettings({ ...settings, ethereumNetwork: e.target.value as any })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white dark-select"
                        >
                          <option value="ethereum">ETH - Ethereum (ERC20)</option>
                          <option value="bsc">BSC - Binance Smart Chain (BEP20)</option>
                        </select>
                      </div>
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h5 className="font-semibold text-sm text-blue-300 mb-2 flex items-center gap-2">
                          <i className="fas fa-info-circle"></i>
                          Hướng dẫn lấy địa chỉ ETH từ Binance:
                        </h5>
                        <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside ml-2">
                          <li>Mở app Binance → Chọn <span className="text-blue-400 font-semibold">Wallet</span></li>
                          <li>Chọn <span className="text-blue-400 font-semibold">Fiat and Spot</span> hoặc <span className="text-blue-400 font-semibold">Funding</span></li>
                          <li>Tìm và chọn <span className="text-blue-400 font-semibold">ETH (Ethereum)</span></li>
                          <li>Nhấn <span className="text-blue-400 font-semibold">Deposit</span> (Nạp tiền)</li>
                          <li>Chọn network tương ứng (Ethereum hoặc BSC)</li>
                          <li>Sao chép địa chỉ ví (bắt đầu bằng <span className="text-blue-400 font-mono">0x</span>)</li>
                          <li className="text-yellow-400 font-semibold">⚠️ QUAN TRỌNG: Chọn đúng network! Gửi sai network sẽ mất tiền!</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* USDT */}
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <i className="fas fa-coins text-green-400"></i>
                      USDT (Tether)
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-2 font-semibold text-sm">Địa Chỉ USDT</label>
                        <input
                          type="text"
                          value={settings.usdtAddress || ''}
                          onChange={(e) => setSettings({ ...settings, usdtAddress: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                          placeholder="0x... hoặc T..."
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-sm">Mạng Lưới (Network)</label>
                        <select
                          value={settings.usdtNetwork || 'tron'}
                          onChange={(e) => setSettings({ ...settings, usdtNetwork: e.target.value as any })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white dark-select"
                        >
                          <option value="tron">TRX - Tron (TRC20)</option>
                        </select>
                      </div>
                      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <h5 className="font-semibold text-sm text-green-300 mb-2 flex items-center gap-2">
                          <i className="fas fa-info-circle"></i>
                          Hướng dẫn lấy địa chỉ USDT từ Binance:
                        </h5>
                        <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside ml-2">
                          <li>Mở app Binance → Chọn <span className="text-green-400 font-semibold">Wallet</span></li>
                          <li>Chọn <span className="text-green-400 font-semibold">Fiat and Spot</span> hoặc <span className="text-green-400 font-semibold">Funding</span></li>
                          <li>Tìm và chọn <span className="text-green-400 font-semibold">USDT (Tether)</span></li>
                          <li>Nhấn <span className="text-green-400 font-semibold">Deposit</span> (Nạp tiền)</li>
                          <li>Chọn network: <span className="text-green-400 font-semibold">TRC20</span> (Tron) - rẻ nhất và phổ biến nhất</li>
                          <li>Sao chép địa chỉ ví (bắt đầu bằng <span className="text-green-400 font-mono">T</span>)</li>
                          <li className="text-yellow-400 font-semibold">⚠️ QUAN TRỌNG: Chỉ hỗ trợ USDT trên Tron (TRC20)!</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* BNB */}
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <i className="fas fa-coins text-yellow-400"></i>
                      BNB (Binance Coin)
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-2 font-semibold text-sm">Địa Chỉ BNB</label>
                        <input
                          type="text"
                          value={settings.bnbAddress || ''}
                          onChange={(e) => setSettings({ ...settings, bnbAddress: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                          placeholder="0x... hoặc bnb..."
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-sm">Mạng Lưới (Network)</label>
                        <select
                          value={settings.bnbNetwork || 'bsc'}
                          onChange={(e) => setSettings({ ...settings, bnbNetwork: e.target.value as any })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white dark-select"
                        >
                          <option value="bsc">BSC - BNB Smart Chain (BEP20)</option>
                        </select>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <h5 className="font-semibold text-sm text-yellow-300 mb-2 flex items-center gap-2">
                          <i className="fas fa-info-circle"></i>
                          Hướng dẫn lấy địa chỉ BNB từ Binance:
                        </h5>
                        <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside ml-2">
                          <li>Mở app Binance → Chọn <span className="text-yellow-400 font-semibold">Wallet</span></li>
                          <li>Chọn <span className="text-yellow-400 font-semibold">Fiat and Spot</span> hoặc <span className="text-yellow-400 font-semibold">Funding</span></li>
                          <li>Tìm và chọn <span className="text-yellow-400 font-semibold">BNB (Binance Coin)</span></li>
                          <li>Nhấn <span className="text-yellow-400 font-semibold">Deposit</span> (Nạp tiền)</li>
                          <li>Chọn network: <span className="text-yellow-400 font-semibold">BEP20 (BSC)</span> - Binance Smart Chain</li>
                          <li>Sao chép địa chỉ ví (bắt đầu bằng <span className="text-yellow-400 font-mono">0x</span>)</li>
                          <li className="text-yellow-400 font-semibold">⚠️ QUAN TRỌNG: Chỉ hỗ trợ BNB trên BSC (BEP20)!</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                  <p className="text-gray-300 text-sm">
                    <i className="fas fa-info-circle text-blue-400 mr-2"></i>
                    Chỉ hỗ trợ 4 loại crypto phổ biến nhất: BTC, ETH, USDT, BNB. Mỗi loại có thể chọn mạng lưới khác nhau.
                  </p>
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Khóa API (nếu có)</label>
                  <input
                    type="text"
                    value={settings.apiKey || ''}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                  <small className="text-gray-400 text-sm block mt-1">
                    Chỉ cần nếu sử dụng cổng thanh toán tự động (NOWPayments, BitPay).
                  </small>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Telegram Integration */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">
            <i className="fab fa-telegram mr-2 text-blue-400"></i>
            Tích Hợp Telegram
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Kết nối chat widget với Telegram để nhận thông báo tin nhắn từ khách hàng.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-sm">
                Telegram Bot Token <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={settings.telegramBotToken || ''}
                onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              />
              <small className="text-gray-400 text-xs block mt-1">
                Lấy Bot Token từ <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@BotFather</a> trên Telegram
              </small>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-sm">
                Telegram Chat ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={settings.telegramChatId || ''}
                onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                placeholder="-1001234567890"
              />
              <small className="text-gray-400 text-xs block mt-1">
                Lấy Chat ID bằng cách nhắn tin cho <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@userinfobot</a> hoặc chat group ID
              </small>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h5 className="font-semibold text-sm text-blue-300 mb-2 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                Hướng dẫn cài đặt:
              </h5>
              <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside ml-2">
                <li>Tạo bot mới: Nhắn <span className="text-blue-400 font-semibold">/newbot</span> cho <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@BotFather</a></li>
                <li>Copy <span className="text-blue-400 font-semibold">Bot Token</span> và dán vào ô trên</li>
                <li>Lấy Chat ID: Nhắn tin cho <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@userinfobot</a> hoặc thêm bot vào group và lấy group ID</li>
                <li>Dán Chat ID vào ô trên và nhấn <span className="text-blue-400 font-semibold">Lưu Cài Đặt</span></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Logo Management */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">
            <i className="fas fa-images mr-2 text-purple-400"></i>
            Logo Các Nhà Mạng
          </h3>
          <small className="text-gray-400 text-sm block mb-4">
            Upload logo các nhà mạng. Hỗ trợ định dạng: PNG, JPG, SVG. Kích thước khuyên dùng: 200x200px trở lên.
          </small>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {carriers.map(carrier => (
              <div key={carrier.key} className="space-y-2">
                <label className="block font-semibold">{carrier.label}</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(carrier.key, file);
                  }}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
                {settings.carrierLogos?.[carrier.key as keyof typeof settings.carrierLogos] && (
                  <div className="flex items-center gap-2 mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.carrierLogos[carrier.key as keyof typeof settings.carrierLogos]}
                      alt={carrier.label}
                      className="w-12 h-12 object-contain"
                    />
                    <button
                      onClick={() => handleLogoRemove(carrier.key)}
                      className="px-2 py-1 bg-red-600 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

