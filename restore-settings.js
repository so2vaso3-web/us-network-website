/**
 * Script để restore settings từ localStorage lên server
 * Chạy trong browser console trên trang Admin
 */

async function restoreSettingsFromLocalStorage() {
  try {
    // Lấy settings từ localStorage
    const localSettings = localStorage.getItem('adminSettings');
    
    if (!localSettings) {
      console.error('❌ Không tìm thấy settings trong localStorage');
      return;
    }
    
    const settings = JSON.parse(localSettings);
    console.log('✅ Đã lấy settings từ localStorage:', settings);
    
    // Upload lên server
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ Đã restore settings lên server thành công!');
        console.log('Settings:', settings);
        alert('✅ Đã restore settings lên server thành công! Refresh lại trang để xem.');
      } else {
        console.error('❌ Lỗi khi restore:', data);
        alert('❌ Lỗi khi restore settings: ' + JSON.stringify(data));
      }
    } else {
      const error = await response.json();
      console.error('❌ Lỗi HTTP:', error);
      alert('❌ Lỗi HTTP: ' + JSON.stringify(error));
    }
  } catch (error) {
    console.error('❌ Lỗi:', error);
    alert('❌ Lỗi: ' + error.message);
  }
}

// Tự động chạy
restoreSettingsFromLocalStorage();

