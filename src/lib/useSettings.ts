'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminSettings } from '@/types';

/**
 * Custom hook để quản lý settings với đồng bộ tự động từ server
 * Tự động fetch từ API và polling để cập nhật real-time
 */
export function useSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettingsFromServer = useCallback(async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          // CHỈ update state nếu chưa có settings (initial load)
          // Để tránh polling overwrite user input
          setSettings(prev => {
            // Chỉ update nếu chưa có settings
            if (!prev) {
              return data.settings;
            }
            // Giữ nguyên settings hiện tại để không overwrite user input
            return prev;
          });
          
          // Luôn lưu vào localStorage để cache (nhưng không update state)
          if (typeof window !== 'undefined') {
            const serverTimestamp = data.timestamp || new Date().toISOString();
            localStorage.setItem('adminSettings', JSON.stringify(data.settings));
            localStorage.setItem('settingsLastUpdate', serverTimestamp);
          }
          
          return true;
        }
      }
    } catch (error) {
      console.error('Error fetching settings from server:', error);
      // Nếu lỗi, thử dùng localStorage cache
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('adminSettings');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setSettings(parsed);
            return false; // Đang dùng cache
          } catch (e) {
            console.error('Error loading from cache:', e);
          }
        }
      }
    }
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const loadSettings = async () => {
      setIsLoading(true);
      await fetchSettingsFromServer();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    // Load settings lần đầu
    loadSettings();

    // Polling: Tự động fetch mỗi 30 giây để cập nhật real-time (tăng lên để tránh conflict với user input)
    // CHỈ fetch, không tự động merge - để tránh overwrite user input
    pollInterval = setInterval(async () => {
      if (isMounted) {
        // Chỉ fetch, không tự động update state
        // State sẽ chỉ update khi có event 'settingsUpdated' từ tab khác
        await fetchSettingsFromServer();
      }
    }, 30000); // 30 giây - giảm tần suất để tránh conflict

    // Lắng nghe event khi admin cập nhật settings (để cập nhật ngay lập tức)
    const handleSettingsUpdated = () => {
      if (isMounted) {
        fetchSettingsFromServer();
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdated);
    
    // Lắng nghe storage event để đồng bộ giữa các tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminSettings' && isMounted) {
        fetchSettingsFromServer();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      window.removeEventListener('settingsUpdated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchSettingsFromServer]);

  return { settings, isLoading, refetch: fetchSettingsFromServer };
}

/**
 * Lưu settings lên server
 */
export async function saveSettingsToServer(settings: AdminSettings): Promise<boolean> {
  try {
    // Thêm timestamp để tránh browser cache
    const response = await fetch(`/api/settings?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: JSON.stringify({ settings }),
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Lưu vào localStorage làm cache (sau khi save thành công)
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminSettings', JSON.stringify(settings));
          localStorage.setItem('settingsLastUpdate', new Date().toISOString());
        }
        // Dispatch event để tất cả component cập nhật ngay
        notifySettingsUpdated();
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error saving settings to server:', error);
    // Nếu lỗi, vẫn giữ localStorage để không mất data
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      localStorage.setItem('settingsLastUpdate', new Date().toISOString());
    }
    return false;
  }
}

/**
 * Dispatch event để thông báo tất cả component cập nhật settings
 */
export function notifySettingsUpdated() {
  if (typeof window !== 'undefined') {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('settingsUpdated'));
    
    // Trigger storage event để đồng bộ giữa các tab
    const event = new StorageEvent('storage', {
      key: 'adminSettings',
      newValue: localStorage.getItem('adminSettings'),
    });
    window.dispatchEvent(event);
  }
}

