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
      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          // Lưu vào localStorage làm cache
          if (typeof window !== 'undefined') {
            localStorage.setItem('adminSettings', JSON.stringify(data.settings));
            localStorage.setItem('settingsLastUpdate', new Date().toISOString());
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

    // Polling: Tự động fetch mỗi 10 giây để cập nhật real-time
    pollInterval = setInterval(async () => {
      if (isMounted) {
        await fetchSettingsFromServer();
      }
    }, 10000); // 10 giây

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
        // Lưu vào localStorage làm cache
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

