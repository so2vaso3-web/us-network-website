'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package } from '@/types';
import { defaultPackages } from './data';

/**
 * Custom hook để quản lý packages với đồng bộ tự động từ server
 * Tự động fetch từ API và polling để cập nhật real-time
 */
export function usePackages() {
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPackagesFromServer = useCallback(async () => {
    try {
      const response = await fetch('/api/packages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Không cache để luôn lấy data mới nhất
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.packages)) {
          setPackages(data.packages);
          setLastUpdate(new Date());
          // Lưu vào localStorage làm cache
          if (typeof window !== 'undefined') {
            localStorage.setItem('packages', JSON.stringify(data.packages));
            localStorage.setItem('packagesLastUpdate', new Date().toISOString());
          }
          return true;
        }
      }
    } catch (error) {
      console.error('Error fetching packages from server:', error);
      // Nếu lỗi, thử dùng localStorage cache
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('packages');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPackages(parsed);
              return false; // Đang dùng cache
            }
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

    const loadPackages = async () => {
      setIsLoading(true);
      await fetchPackagesFromServer();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    // Load packages lần đầu
    loadPackages();

    // Polling: Tự động fetch mỗi 5 giây để cập nhật real-time
    pollInterval = setInterval(async () => {
      if (isMounted) {
        await fetchPackagesFromServer();
      }
    }, 5000); // 5 giây

    // Lắng nghe event khi admin cập nhật packages (để cập nhật ngay lập tức)
    const handlePackagesUpdated = () => {
      if (isMounted) {
        fetchPackagesFromServer();
      }
    };

    window.addEventListener('packagesUpdated', handlePackagesUpdated);
    
    // Lắng nghe storage event để đồng bộ giữa các tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'packages' && isMounted) {
        fetchPackagesFromServer();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      window.removeEventListener('packagesUpdated', handlePackagesUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchPackagesFromServer]);

  return packages;
}

/**
 * Lưu packages lên server
 */
export async function savePackagesToServer(packages: Package[]): Promise<boolean> {
  try {
    const response = await fetch('/api/packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packages }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Lưu vào localStorage làm cache
        if (typeof window !== 'undefined') {
          localStorage.setItem('packages', JSON.stringify(packages));
          localStorage.setItem('packagesLastUpdate', new Date().toISOString());
        }
        // Dispatch event để tất cả component cập nhật ngay
        notifyPackagesUpdated();
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error saving packages to server:', error);
    return false;
  }
}

/**
 * Dispatch event để thông báo tất cả component cập nhật packages
 */
export function notifyPackagesUpdated() {
  if (typeof window !== 'undefined') {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('packagesUpdated'));
    
    // Trigger storage event để đồng bộ giữa các tab
    // (storage event chỉ trigger khi thay đổi từ tab khác, nên ta dùng custom event)
    const event = new StorageEvent('storage', {
      key: 'packages',
      newValue: localStorage.getItem('packages'),
    });
    window.dispatchEvent(event);
  }
}

