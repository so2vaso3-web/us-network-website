'use client';

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    // Track page visit
    if (typeof window !== 'undefined') {
      // Get or create visitor ID
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitorId', visitorId);
      }

      const visitData = {
        id: `visit-${Date.now()}`,
        visitorId,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent.substring(0, 100), // Limit length
      };

      const visits = JSON.parse(localStorage.getItem('visitorStats') || '[]');
      visits.push(visitData);
      
      // Keep only last 1000 visits to prevent storage overflow
      if (visits.length > 1000) {
        visits.splice(0, visits.length - 1000);
      }
      
      localStorage.setItem('visitorStats', JSON.stringify(visits));
      
      // Update unique visitors count
      const uniqueVisitors = JSON.parse(localStorage.getItem('uniqueVisitors') || '[]');
      if (!uniqueVisitors.includes(visitorId)) {
        uniqueVisitors.push(visitorId);
        localStorage.setItem('uniqueVisitors', JSON.stringify(uniqueVisitors));
      }
    }
  }, []);

  return null; // This component doesn't render anything
}

