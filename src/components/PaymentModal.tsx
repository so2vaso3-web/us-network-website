'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Package } from '@/types';

interface PaymentModalProps {
  pkg: Package;
  onClose: () => void;
}

export default function PaymentModal({ pkg, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<'customer-info' | 'payment-method'>('customer-info');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'crypto' | 'fpayment'>('paypal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Chỉ giữ 4 crypto phổ biến nhất: BTC, ETH, USDT, BNB
  const [selectedCrypto, setSelectedCrypto] = useState<'bitcoin' | 'ethereum' | 'usdt' | 'bnb'>('bitcoin');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false);
  const [cryptoMessage, setCryptoMessage] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [hasCryptoAddress, setHasCryptoAddress] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'info' | 'success' | 'warning' | 'error' });
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  const paypalButtonInstanceRef = useRef<any>(null);

  // Check if crypto address is configured in admin settings (not fallback)
  const checkCryptoAddress = useCallback(() => {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          // Map selected crypto to correct address key (chỉ 4 crypto: BTC, ETH, USDT, BNB)
          const addressMap: Record<string, string> = {
            bitcoin: 'bitcoinAddress',
            ethereum: 'ethereumAddress',
            usdt: 'usdtAddress',
            bnb: 'bnbAddress',
          };
          
          const addressKey = addressMap[selectedCrypto] || `${selectedCrypto}Address`;
          const address = parsed[addressKey];
          const hasAddress = address && typeof address === 'string' && address.trim() !== '';
          return !!hasAddress;
        } catch (e) {
          return false;
        }
      }
    }
    return false;
  }, [selectedCrypto]);

  // Update hasCryptoAddress state when selectedCrypto or paymentMethod changes
  useEffect(() => {
    if (paymentMethod === 'crypto' && step === 'payment-method') {
      const hasAddress = checkCryptoAddress();
      setHasCryptoAddress(hasAddress);
      // Also re-check immediately to ensure state is correct
      setTimeout(() => {
        const recheck = checkCryptoAddress();
        if (recheck !== hasAddress) {
          setHasCryptoAddress(recheck);
        }
      }, 100);
    } else {
      setHasCryptoAddress(false);
    }
  }, [paymentMethod, selectedCrypto, step, checkCryptoAddress]);

  // Also listen for localStorage changes and sync from server (when admin updates settings)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        if (paymentMethod === 'crypto' && step === 'payment-method') {
          const hasAddress = checkCryptoAddress();
          setHasCryptoAddress(hasAddress);
        }
      };
      
      const handleSettingsUpdate = () => {
        if (paymentMethod === 'crypto' && step === 'payment-method') {
          const hasAddress = checkCryptoAddress();
          setHasCryptoAddress(hasAddress);
        }
      };
      
      // Sync from server for cross-device sync
      const syncFromServer = async () => {
        try {
          const response = await fetch('/api/settings');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.settings) {
              const serverSettings = JSON.stringify(data.settings);
              const currentSettings = localStorage.getItem('adminSettings');
              
              // Only update if server has newer settings
              if (!currentSettings || currentSettings !== serverSettings) {
                localStorage.setItem('adminSettings', serverSettings);
                if (paymentMethod === 'crypto' && step === 'payment-method') {
                  const hasAddress = checkCryptoAddress();
                  setHasCryptoAddress(hasAddress);
                }
              }
            }
          }
        } catch (error) {
          // Ignore errors, will retry on next interval
        }
      };
      
      // Listen for force sync event (when admin saves)
      const handleForceSync = async () => {
        await syncFromServer();
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('settingsUpdated', handleSettingsUpdate);
      window.addEventListener('forceSettingsSync', handleForceSync);
      
      // Sync from server immediately and then periodically
      syncFromServer();
      const serverSyncInterval = setInterval(syncFromServer, 1000); // Check every 1 second
      
      // Also check periodically in case settings are updated in the same tab
      const interval = setInterval(() => {
        if (paymentMethod === 'crypto' && step === 'payment-method') {
          const hasAddress = checkCryptoAddress();
          setHasCryptoAddress(hasAddress);
        }
      }, 500);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        window.removeEventListener('forceSettingsSync', handleForceSync);
        clearInterval(interval);
        clearInterval(serverSyncInterval);
      };
    }
  }, [paymentMethod, step, checkCryptoAddress]);

  // Get crypto address from settings only (no fallback)
  const getCryptoAddressFromSettings = () => {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          // Map selected crypto to correct address key (chỉ 4 crypto: BTC, ETH, USDT, BNB)
          const addressMap: Record<string, string> = {
            bitcoin: 'bitcoinAddress',
            ethereum: 'ethereumAddress',
            usdt: 'usdtAddress',
            bnb: 'bnbAddress',
          };
          
          const addressKey = addressMap[selectedCrypto] || `${selectedCrypto}Address`;
          const address = parsed[addressKey];
          if (address && typeof address === 'string' && address.trim() !== '') {
            return address.trim();
          }
        } catch (e) {
          console.error('Error loading crypto addresses:', e);
        }
      }
    }
    return '';
  };

  const getCryptoAddress = () => {
    // Only return address from settings, no fallback
    return getCryptoAddressFromSettings();
  };

  // Auto-select first available crypto and network when switching to crypto payment
  useEffect(() => {
    if (step === 'payment-method' && paymentMethod === 'crypto' && typeof window !== 'undefined') {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          // Chỉ giữ 4 crypto phổ biến nhất: BTC, ETH, USDT, BNB
          const cryptos = [
            { key: 'bitcoin', address: parsed.bitcoinAddress },
            { key: 'ethereum', address: parsed.ethereumAddress, network: parsed.ethereumNetwork || 'ethereum' },
            { key: 'usdt', address: parsed.usdtAddress, network: parsed.usdtNetwork || 'ethereum' },
            { key: 'bnb', address: parsed.bnbAddress, network: parsed.bnbNetwork || 'bsc' },
          ];
          
          const availableCryptos = cryptos.filter(c => c.address && c.address.trim() !== '');
          
          // If current selected crypto doesn't have address, switch to first available
          if (availableCryptos.length > 0) {
            const currentCrypto = cryptos.find(c => c.key === selectedCrypto);
            if (!currentCrypto || !currentCrypto.address || currentCrypto.address.trim() === '') {
              const firstAvailable = availableCryptos[0];
              setSelectedCrypto(firstAvailable.key as any);
              if (firstAvailable.network) {
                setSelectedNetwork(firstAvailable.network);
              }
            } else if (currentCrypto.network) {
              setSelectedNetwork(currentCrypto.network);
            }
          }
        } catch (e) {
          console.error('Error checking crypto addresses:', e);
        }
      }
    }
  }, [step, paymentMethod, selectedCrypto]);
  
  // Update network when crypto changes
  useEffect(() => {
    if (step === 'payment-method' && paymentMethod === 'crypto' && typeof window !== 'undefined') {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          if (selectedCrypto === 'ethereum') {
            setSelectedNetwork(parsed.ethereumNetwork || 'ethereum');
          } else if (selectedCrypto === 'usdt') {
            setSelectedNetwork(parsed.usdtNetwork || 'ethereum');
          } else if (selectedCrypto === 'bnb') {
            setSelectedNetwork(parsed.bnbNetwork || 'bsc');
          } else if (selectedCrypto === 'bitcoin') {
            setSelectedNetwork('bitcoin'); // Bitcoin chỉ có 1 network
          }
        } catch (e) {
          console.error('Error loading network:', e);
        }
      }
    }
  }, [selectedCrypto, step, paymentMethod]);

  // Format crypto address for QR code - Hỗ trợ cả Binance Wallet và Trust Wallet
  // Binance Wallet: Ưu tiên format đơn giản (chỉ address hoặc ethereum:address không có @chainId)
  // Trust Wallet: Hỗ trợ format EIP-681 với chainId
  const formatCryptoAddressForQR = (address: string, crypto: string, network?: string) => {
    if (!address) return address;
    
    // Normalize crypto name to lowercase
    const cryptoLower = crypto.toLowerCase();
    const networkLower = network?.toLowerCase() || '';
    
    // Binance Wallet ưu tiên format đơn giản - KHÔNG dùng @chainId
    // Format đơn giản: chỉ address hoặc scheme:address (không có @chainId)
    if (cryptoLower === 'bitcoin') {
      // Bitcoin: chỉ dùng address đơn giản cho Binance Wallet
      return address;
    } else if (cryptoLower === 'ethereum') {
      // Ethereum: format đơn giản ethereum:address (không có @chainId) cho Binance Wallet
      return `ethereum:${address}`;
    } else if (cryptoLower === 'usdt') {
      // USDT trên các network
      if (networkLower === 'tron') {
        // Tron: tron:address
        return `tron:${address}`;
      } else if (networkLower === 'bsc') {
        // USDT trên BSC: ethereum:address (Binance Wallet nhận diện BSC qua scheme)
        return `ethereum:${address}`;
      } else if (networkLower === 'polygon') {
        // USDT trên Polygon: ethereum:address
        return `ethereum:${address}`;
      } else if (networkLower === 'avalanche') {
        // USDT trên Avalanche: ethereum:address
        return `ethereum:${address}`;
      }
      // Default: Ethereum (ERC-20)
      return `ethereum:${address}`;
    } else if (cryptoLower === 'bnb') {
      if (networkLower === 'beacon') {
        // BNB Beacon Chain: binance:address
        return `binance:${address}`;
      }
      // Default: BSC (BEP-20) - dùng ethereum:address cho Binance Wallet
      return `ethereum:${address}`;
    }
    
    // Default: return address as-is (fallback)
    return address;
  };

  useEffect(() => {
    try {
      if (step === 'payment-method' && paymentMethod === 'crypto') {
        // Only create QR code if address exists in settings
        if (hasCryptoAddress) {
          const address = getCryptoAddress();
          if (address) {
            try {
              // Format address with URI scheme và network cho Binance Wallet compatibility
              // QUAN TRỌNG: Phải truyền selectedNetwork để format đúng chainId
              // Đảm bảo selectedNetwork không undefined
              const network = selectedNetwork || '';
              const formattedAddress = formatCryptoAddressForQR(address, selectedCrypto, network);
              if (formattedAddress) {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formattedAddress)}&bgcolor=ffffff&color=000000&margin=2`;
                setQrCodeUrl(qrUrl);
              } else {
                setQrCodeUrl('');
              }
            } catch (error) {
              console.error('Error formatting QR code address:', error);
              setQrCodeUrl('');
            }
          } else {
            setQrCodeUrl('');
          }
        } else {
          setQrCodeUrl('');
        }
      } else {
        setQrCodeUrl('');
      }
    } catch (error) {
      console.error('Error in QR code generation effect:', error);
      setQrCodeUrl('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentMethod, selectedCrypto, selectedNetwork, hasCryptoAddress]);

  // Load PayPal SDK when PayPal is selected
  useEffect(() => {
    if (step === 'payment-method' && paymentMethod === 'paypal' && typeof window !== 'undefined' && !paypalLoaded) {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          const clientId = parsed.paypalClientId;
          const currency = parsed.paypalCurrency || 'USD';
          
          if (!clientId) {
            console.error('PayPal Client ID not found');
            return;
          }
          
          // Check if PayPal SDK is already loaded
          if ((window as any).paypal) {
            setPaypalLoaded(true);
            return;
          }
          
          // Check if script is already being loaded
          const existingScript = document.querySelector(`script[src*="paypal.com/sdk"]`);
          if (existingScript) {
            existingScript.addEventListener('load', () => {
              setPaypalLoaded(true);
            });
            return;
          }
          
          // Load PayPal SDK with mobile-friendly configuration
          const script = document.createElement('script');
          // For mobile: use components=buttons only, no popups
          // For desktop: use full features
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          const components = isMobile ? 'buttons' : 'buttons,marks,funding-eligibility';
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=${components}&locale=en_US`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            console.log('PayPal SDK loaded successfully, checking availability...');
            // Wait a bit for PayPal to be fully available
            const checkPayPal = setInterval(() => {
              if ((window as any).paypal) {
                console.log('PayPal SDK is now available!');
                clearInterval(checkPayPal);
                setPaypalLoaded(true);
              }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkPayPal);
              if (!(window as any).paypal) {
                console.error('PayPal SDK loaded but paypal object not found');
                alert('PayPal SDK loaded but not initialized. Please refresh the page.');
              }
            }, 5000);
          };
          script.onerror = () => {
            console.error('Failed to load PayPal SDK');
            alert('Failed to load PayPal SDK. Please check your internet connection and try again.');
          };
          document.body.appendChild(script);
          console.log('PayPal SDK script added to page');
        } catch (e) {
          console.error('Error loading PayPal:', e);
          alert('Error loading PayPal settings. Please check your configuration.');
        }
      } else {
        console.error('Admin settings not found');
        alert('PayPal settings not configured. Please configure PayPal in Admin Panel.');
      }
    }
  }, [step, paymentMethod, paypalLoaded]);

  // Render PayPal button directly when SDK is loaded and ready
  useEffect(() => {
    // Only render if conditions are met
    if (step !== 'payment-method' || paymentMethod !== 'paypal' || !paypalLoaded || typeof window === 'undefined' || !(window as any).paypal) {
      return;
    }
    
    // If button is already rendered and container has button, skip
    if (paypalButtonRendered && paypalButtonContainerRef.current?.querySelector('div[data-paypal-button]')) {
      return;
    }

    const container = paypalButtonContainerRef.current;
    if (!container) {
      console.log('PayPal: Container not ready yet');
      return;
    }

    // Ensure container is in DOM
    if (!document.body.contains(container)) {
      console.log('PayPal: Container not in DOM yet');
      return;
    }

    // Clear any existing buttons before rendering new one
    if (paypalButtonInstanceRef.current) {
      try {
        paypalButtonInstanceRef.current.close();
      } catch (e) {
        console.log('PayPal: Error closing previous button instance', e);
      }
      paypalButtonInstanceRef.current = null;
    }
    
    // Clear container
    container.innerHTML = '';
    container.removeAttribute('data-paypal-rendered');

    const settings = localStorage.getItem('adminSettings');
    if (!settings) {
      console.error('PayPal: Settings not found');
      return;
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(settings);
    } catch (e) {
      console.error('PayPal: Error parsing settings', e);
      return;
    }

    const clientId = parsed.paypalClientId;
    if (!clientId) {
      console.error('PayPal: Client ID not found');
      return;
    }

    const currency = parsed.paypalCurrency || 'USD';
    const returnUrl = parsed.paypalReturnUrl || (typeof window !== 'undefined' ? window.location.origin + '/payment/success' : '/payment/success');
    const cancelUrl = parsed.paypalCancelUrl || (typeof window !== 'undefined' ? window.location.origin + '/payment/cancel' : '/payment/cancel');
    const paypal = (window as any).paypal;
    const orderId = `ORD-${Date.now()}`;

    console.log('PayPal: Creating button...');

    try {
      const button = paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          try {
            console.log('PayPal: Creating order...');
            const order = {
              orderId,
              planId: pkg.id,
              planName: pkg.name,
              carrier: pkg.carrier,
              price: pkg.price,
              paymentMethod: 'paypal' as const,
              status: 'pending' as const,
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone,
              customerNotes: customerInfo.notes,
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
              notes: customerInfo.notes,
              createdAt: new Date().toISOString(),
            };
            
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('pendingPayPalOrder', orderId);

            // Send Telegram notification for new PayPal order (non-blocking)
            fetch('/api/telegram', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: order.customerName || 'Unknown',
                email: order.customerEmail || 'Not provided',
                message: `🛒 <b>New PayPal Order</b>

📦 <b>Order ID:</b> ${order.orderId}
📱 <b>Plan:</b> ${order.planName}
🏢 <b>Carrier:</b> ${order.carrier}
💰 <b>Amount:</b> $${order.price}
💳 <b>Payment:</b> PayPal
👤 <b>Customer:</b> ${order.customerName || 'N/A'}
📧 <b>Email:</b> ${order.customerEmail || 'N/A'}
📞 <b>Phone:</b> ${order.customerPhone || 'N/A'}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

⚠️ <b>Status:</b> Pending PayPal payment`,
                visitorId: `order-${order.orderId}`,
                isReply: false,
              }),
            }).catch(err => console.error('Failed to send Telegram notification:', err));
            
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: pkg.price.toString(),
                  currency_code: currency,
                },
                description: `Mobile Plan: ${pkg.name} - ${pkg.carrier}`,
                custom_id: orderId,
              }],
              application_context: {
                brand_name: parsed.websiteName || 'US Mobile Networks',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                return_url: returnUrl,
                cancel_url: cancelUrl,
                // Mobile-friendly: prefer redirect over popup
                landing_page: 'BILLING',
              },
            });
          } catch (error: any) {
            console.error('PayPal: Error creating order:', error);
            throw error;
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            console.log('PayPal: Order approved, capturing...');
            const details = await actions.order.capture();
            
            const updatedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const orderIndex = updatedOrders.findIndex((o: any) => o.orderId === orderId);
            if (orderIndex !== -1) {
              updatedOrders[orderIndex].paymentId = details.id;
              updatedOrders[orderIndex].status = 'completed';
              updatedOrders[orderIndex].paymentVerified = true;
              updatedOrders[orderIndex].verifiedAt = new Date().toISOString();
              localStorage.setItem('orders', JSON.stringify(updatedOrders));

              // Send Telegram notification for completed PayPal order (non-blocking)
              const completedOrder = updatedOrders[orderIndex];
              fetch('/api/telegram', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: completedOrder.customerName || 'Unknown',
                  email: completedOrder.customerEmail || 'Not provided',
                  message: `✅ <b>PayPal Order Completed</b>

📦 <b>Order ID:</b> ${orderId}
💳 <b>Transaction ID:</b> ${details.id}
📱 <b>Plan:</b> ${completedOrder.planName}
🏢 <b>Carrier:</b> ${completedOrder.carrier}
💰 <b>Amount:</b> $${completedOrder.price}
👤 <b>Customer:</b> ${completedOrder.customerName || 'N/A'}
📧 <b>Email:</b> ${completedOrder.customerEmail || 'N/A'}

⏰ <b>Completed:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

✅ <b>Status:</b> Payment verified and completed`,
                  visitorId: `order-${orderId}`,
                  isReply: false,
                }),
              }).catch(err => console.error('Failed to send Telegram notification:', err));
            }
            localStorage.removeItem('pendingPayPalOrder');
            
            alert(`Payment successful!\n\nTransaction ID: ${details.id}\nOrder ID: ${orderId}\n\nWe will contact you at ${customerInfo.email} to activate your plan.`);
            
            if (typeof window !== 'undefined') {
              window.location.href = returnUrl;
            }
          } catch (error: any) {
            console.error('PayPal: Capture error:', error);
            alert('Payment was authorized but capture failed. Please contact support.');
          }
        },
        onError: (err: any) => {
          console.error('PayPal: Button Error:', err);
          setPaypalButtonRendered(false);
          // Show message in modal instead of browser alert
          setCryptoMessage(`PayPal Error: ${err.message || 'An error occurred during payment. Please try again.'}`);
          // Clear message after 5 seconds
          setTimeout(() => {
            setCryptoMessage('');
          }, 5000);
        },
        onCancel: () => {
          console.log('PayPal: Payment cancelled');
          // Don't redirect - just close PayPal popup and keep modal open
          // User can try again or choose another payment method
          setPaypalButtonRendered(false);
          paypalButtonInstanceRef.current = null;
          if (paypalButtonContainerRef.current) {
            paypalButtonContainerRef.current.innerHTML = '';
            paypalButtonContainerRef.current.removeAttribute('data-paypal-rendered');
          }
          // Show message in modal instead of browser alert
          setCryptoMessage('Payment was cancelled. You can try again or choose a different payment method.');
          // Clear message after 5 seconds
          setTimeout(() => {
            setCryptoMessage('');
          }, 5000);
          // Force re-render PayPal button after a short delay
          setTimeout(() => {
            setPaypalButtonRendered(false);
          }, 100);
        },
        // Mobile-friendly: use redirect flow instead of popup
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          tagline: false,
        },
        // Disable popup on mobile - use redirect instead
        commit: true,
      });

      paypalButtonInstanceRef.current = button;
      
      // Wait a bit to ensure DOM is stable
      setTimeout(() => {
        if (!container || !document.body.contains(container)) {
          console.error('PayPal: Container removed before render');
          return;
        }

        button.render(container).then(() => {
          console.log('PayPal: Button rendered successfully!');
          // Mark container as having PayPal button
          if (container) {
            container.setAttribute('data-paypal-rendered', 'true');
          }
          setPaypalButtonRendered(true);
        }).catch((err: any) => {
          console.error('PayPal: Error rendering button:', err);
          setPaypalButtonRendered(false);
          paypalButtonInstanceRef.current = null;
          if (container) {
            container.removeAttribute('data-paypal-rendered');
          }
          if (err.message && err.message.includes('removed from DOM')) {
            // Don't show alert, just log
            console.error('PayPal: Container was removed during render');
          } else {
            alert(`PayPal Error: ${err.message || 'Failed to render PayPal button. Please refresh the page.'}`);
          }
        });
      }, 300);
    } catch (error: any) {
      console.error('PayPal: Error creating button:', error);
      setPaypalButtonRendered(false);
    }

    // No cleanup needed - button stays in DOM
    // React will handle cleanup when modal unmounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentMethod, paypalLoaded, paypalButtonRendered]);

  const isFormValid = () => {
    return (
      customerInfo.name.trim() !== '' &&
      customerInfo.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email) &&
      customerInfo.phone.trim() !== '' &&
      /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(customerInfo.phone)
    );
  };

  const validateCustomerInfo = () => {
    const newErrors: Record<string, string> = {};
    if (!customerInfo.name.trim()) newErrors.name = 'Name is required';
    if (!customerInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!customerInfo.phone.trim() || !/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(customerInfo.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateCustomerInfo()) {
      setStep('payment-method');
    }
  };

  const copyAddress = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Address copied to clipboard!');
    } catch (err) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        // Check if textArea still has a parent before removing
        if (textArea.parentNode) {
          textArea.parentNode.removeChild(textArea);
        }
        alert('Address copied to clipboard!');
      } catch (copyError) {
        console.error('Failed to copy address:', copyError);
        alert('Failed to copy address. Please copy manually.');
      }
    }
  };

  const handlePayment = async () => {
    // For PayPal, button will handle payment automatically
    if (paymentMethod === 'paypal') {
      // PayPal payment is handled by PayPalButton component
      // User should click the PayPal button to complete payment
      return;
    }

    // FPayment - Create invoice and redirect
    if (paymentMethod === 'fpayment') {
      try {
        if (typeof window === 'undefined') return;
        
        const settings = localStorage.getItem('adminSettings');
        if (!settings) {
          alert('Crypto payment settings not configured. Please configure in Admin Settings.');
          return;
        }

        const parsed = JSON.parse(settings);
        if (!parsed.fpaymentEnabled) {
          alert('Crypto payment is not enabled. Please enable it in Admin Settings.');
          return;
        }
        if (!parsed.fpaymentMerchantId || !parsed.fpaymentApiKey) {
          alert('Crypto payment is not configured. Please configure Merchant ID and API Key in Admin Settings.\n\nGo to Admin Settings → Crypto Payment Settings to configure.');
          return;
        }
        
        // Validate that merchant_id and api_key are not empty strings
        if (!parsed.fpaymentMerchantId.trim() || !parsed.fpaymentApiKey.trim()) {
          alert('Merchant ID or API Key cannot be empty. Please check Admin Settings.');
          return;
        }

        const orderId = `ORD-${Date.now()}`;
        const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/fpayment/callback` : '';
        const successUrl = typeof window !== 'undefined' ? `${window.location.origin}/payment/success` : '';
        const cancelUrl = typeof window !== 'undefined' ? `${window.location.origin}/payment/cancel` : '';

        // Create order first
        const order = {
          orderId,
          planId: pkg.id,
          planName: pkg.name,
          carrier: pkg.carrier,
          price: pkg.price,
          paymentMethod: 'fpayment',
          status: 'pending' as const,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          customerNotes: customerInfo.notes,
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          notes: customerInfo.notes,
          createdAt: new Date().toISOString(),
        };

        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Send Telegram notification for new FPayment order (non-blocking)
        fetch('/api/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: order.customerName || 'Unknown',
            email: order.customerEmail || 'Not provided',
            message: `🛒 <b>New Crypto Order</b>

📦 <b>Order ID:</b> ${order.orderId}
📱 <b>Plan:</b> ${order.planName}
🏢 <b>Carrier:</b> ${order.carrier}
💰 <b>Amount:</b> $${order.price}
💳 <b>Payment:</b> Crypto (USDT)
👤 <b>Customer:</b> ${order.customerName || 'N/A'}
📧 <b>Email:</b> ${order.customerEmail || 'N/A'}
📞 <b>Phone:</b> ${order.customerPhone || 'N/A'}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

⚠️ <b>Status:</b> Pending crypto payment`,
            visitorId: `order-${order.orderId}`,
            isReply: false,
          }),
        }).catch(err => console.error('Failed to send Telegram notification:', err));

        // Create FPayment invoice
        const response = await fetch('/api/fpayment/create-invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            merchant_id: parsed.fpaymentMerchantId,
            api_key: parsed.fpaymentApiKey,
            name: `${pkg.name} - ${pkg.carrier}`,
            description: `Mobile plan: ${pkg.name} for ${pkg.carrier}`,
            amount: pkg.price.toString(),
            request_id: orderId,
            callback_url: callbackUrl,
            success_url: successUrl,
            cancel_url: cancelUrl,
          }),
        });

        const result = await response.json();

        if (result.status === 'success' && result.url) {
          // Redirect to FPayment payment page
          window.location.href = result.url;
        } else {
          alert(`Crypto Payment Error: ${result.msg || 'Failed to create payment invoice. Please try again.'}`);
        }
      } catch (error: any) {
        console.error('FPayment error:', error);
        alert(`Error: ${error.message || 'Failed to process crypto payment. Please try again.'}`);
      }
      return;
    }

    // Check if crypto address is configured
    if (paymentMethod === 'crypto') {
      if (!hasCryptoAddress) {
        alert('Please configure cryptocurrency address in Admin Settings first.');
        return;
      }
      const address = getCryptoAddress();
      if (!address || address.trim() === '') {
        alert('Please configure cryptocurrency address in Admin Settings first.');
        return;
      }
    }

    // Crypto Payment - Save order directly
    const order = {
      orderId: `ORD-${Date.now()}`,
      planId: pkg.id,
      planName: pkg.name,
      carrier: pkg.carrier,
      price: pkg.price,
      paymentMethod,
      status: 'pending' as const,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      customerNotes: customerInfo.notes,
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      notes: customerInfo.notes,
      createdAt: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Send Telegram notification for new order (non-blocking)
    fetch('/api/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: order.customerName || 'Unknown',
        email: order.customerEmail || 'Not provided',
        message: `🛒 <b>New Order Received</b>

📦 <b>Order ID:</b> ${order.orderId}
📱 <b>Plan:</b> ${order.planName}
🏢 <b>Carrier:</b> ${order.carrier}
💰 <b>Amount:</b> $${order.price}
💳 <b>Payment:</b> ${order.paymentMethod.toUpperCase()}
👤 <b>Customer:</b> ${order.customerName || 'N/A'}
📧 <b>Email:</b> ${order.customerEmail || 'N/A'}
📞 <b>Phone:</b> ${order.customerPhone || 'N/A'}
📝 <b>Notes:</b> ${order.customerNotes || 'None'}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`,
        visitorId: `order-${order.orderId}`,
        isReply: false,
      }),
    }).catch(err => console.error('Failed to send Telegram notification:', err));

    // Show success message in modal instead of alert
    setSuccessOrder(order);
    setPaymentSuccess(true);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return cleaned;
  };

  const carrierNames: Record<string, string> = {
    verizon: 'Verizon',
    att: 'AT&T',
    tmobile: 'T-Mobile',
    uscellular: 'US Cellular',
    mintmobile: 'Mint Mobile',
    cricket: 'Cricket Wireless',
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1f3a] rounded-xl p-2.5 sm:p-6 md:p-8 max-w-2xl w-full max-h-[92vh] sm:max-h-[95vh] overflow-y-auto border border-gray-700 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicator - Only show if not success */}
        {!paymentSuccess && (
          <div className="flex items-center justify-center mb-2 sm:mb-4 gap-2">
            <div className={`h-1 rounded-full transition-all duration-300 ${step === 'customer-info' ? 'w-10 bg-gray-300' : 'w-6 bg-gray-600'}`}></div>
            <div className={`h-1 rounded-full transition-all duration-300 ${step === 'payment-method' ? 'w-10 bg-gray-300' : 'w-6 bg-gray-600'}`}></div>
          </div>
        )}

        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <div>
            <h2 className="text-sm sm:text-2xl md:text-3xl font-semibold text-white">
              {paymentSuccess ? 'Order Confirmed' : 'Complete Your Order'}
            </h2>
            {!paymentSuccess && (
              <p className="text-gray-400 text-[9px] sm:text-sm mt-0.5">Step {step === 'customer-info' ? '1' : '2'} of 2</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg sm:text-2xl transition-colors min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        {/* Plan Summary Card - Only show if not success */}
        {!paymentSuccess && (
          <div className="mb-1.5 sm:mb-4 p-2 sm:p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-[9px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 uppercase tracking-wide truncate">{carrierNames[pkg.carrier]}</div>
                <h3 className="font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1 text-white truncate">{pkg.name}</h3>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl font-semibold text-white">
                    ${pkg.price}
                  </span>
                  <span className="text-gray-400 text-[10px] sm:text-sm">/ {pkg.period}</span>
                </div>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <div className="text-[9px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Total</div>
                <div className="text-base sm:text-xl font-semibold text-white">${pkg.price}</div>
              </div>
            </div>
          </div>
        )}

            {paymentSuccess && successOrder ? (
              <div className="space-y-4 sm:space-y-6 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <i className="fas fa-check-circle text-green-400 text-2xl sm:text-4xl"></i>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-green-400 mb-1.5 sm:mb-2">Order Placed Successfully!</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">Your order has been received</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3 sm:p-6 border border-gray-700 space-y-2 sm:space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-700 text-xs sm:text-sm">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="font-mono text-white font-semibold text-[10px] sm:text-sm truncate ml-2">{successOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-700 text-xs sm:text-sm">
                    <span className="text-gray-400">Plan:</span>
                    <span className="text-white font-semibold truncate ml-2">{successOrder.planName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-700 text-xs sm:text-sm">
                    <span className="text-gray-400">Carrier:</span>
                    <span className="text-white capitalize truncate ml-2">{carrierNames[successOrder.carrier]}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-gray-700 text-xs sm:text-sm">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-semibold text-base sm:text-xl">${successOrder.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-orange-400 font-semibold uppercase truncate ml-2">{paymentMethod === 'crypto' ? selectedCrypto.toUpperCase() : 'PayPal'}</span>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
                  >
                    <i className="fas fa-check"></i>
                    <span>Done</span>
                  </button>
                </div>
              </div>
            ) : step === 'customer-info' ? (
          <div className="space-y-2 sm:space-y-4">
            {/* Important Notice */}
            <div className="bg-[#1A2036] border border-[#36405B] rounded-lg p-2 sm:p-4 mb-1 sm:mb-2">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-info text-white text-xs sm:text-sm"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-400 mb-0.5 sm:mb-1 text-xs sm:text-base">Important Notice</h4>
                  <p className="text-gray-300 text-[11px] sm:text-sm leading-relaxed">
                    Please enter <strong className="text-white">accurate and correct information</strong>. This information will be used to activate your mobile plan. Incorrect information may result in delays or failure to receive your service package.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-300 text-xs sm:text-base">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors text-base min-h-[44px] ${
                  errors.name ? 'border-red-500' : 'border-gray-600 focus:border-gray-400'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-400 text-[10px] sm:text-sm mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-300 text-xs sm:text-base">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors text-base min-h-[44px] ${
                  errors.email ? 'border-red-500' : 'border-gray-600 focus:border-gray-400'
                }`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-[10px] sm:text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-300 text-xs sm:text-base">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setCustomerInfo({ ...customerInfo, phone: formatted });
                }}
                maxLength={14}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors text-base min-h-[44px] ${
                  errors.phone ? 'border-red-500' : 'border-gray-600 focus:border-gray-400'
                }`}
                placeholder="(123) 456-7890"
              />
              <p className="text-gray-500 text-[9px] sm:text-xs mt-1">
                Please enter a valid US phone number (10 digits). This phone number will be used to activate your mobile plan.
              </p>
              {errors.phone && (
                <p className="text-red-400 text-[10px] sm:text-sm mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-300 text-xs sm:text-base">
                Additional Notes <span className="text-gray-500 text-[10px] sm:text-sm font-normal">(Optional)</span>
              </label>
              <textarea
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors resize-none text-base"
                placeholder="Any additional information or special requests..."
                rows={3}
              />
            </div>

                <button
                  onClick={handleContinue}
                  disabled={!isFormValid()}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 mt-3 sm:mt-6 text-sm sm:text-base min-h-[44px] ${
                    isFormValid()
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-blue-500/50 cursor-pointer'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>Continue to Payment</span>
                  <i className={`fas fa-arrow-right text-xs sm:text-sm ${isFormValid() ? '' : 'opacity-50'}`}></i>
                </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4">
            <div>
              <h3 className="text-sm sm:text-xl font-semibold mb-0.5 sm:mb-1 text-white">
                Choose Payment Method
              </h3>
              <p className="text-gray-400 text-[10px] sm:text-sm hidden sm:block">Select your preferred payment method</p>
            </div>

            {/* PayPal Button - Large and prominent */}
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`w-full p-2.5 sm:p-4 rounded-lg border-2 transition-all relative ${
                paymentMethod === 'paypal'
                  ? 'border-blue-400 bg-blue-600/20 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'paypal' ? 'bg-blue-600' : 'bg-gray-700'
                }`}>
                  <i className="fab fa-paypal text-2xl sm:text-3xl text-white"></i>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-base sm:text-lg">PayPal</span>
                    {paymentMethod === 'paypal' && (
                      <i className="fas fa-check-circle text-green-400 text-sm"></i>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs sm:text-sm">Secure & Fast Payment</span>
                </div>
                {paymentMethod === 'paypal' && (
                  <div className="text-blue-400">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                )}
              </div>
            </button>

            {/* FPayment Button */}
            {(() => {
              if (typeof window === 'undefined') return null;
              const settings = localStorage.getItem('adminSettings');
              if (!settings) return null;
              try {
                const parsed = JSON.parse(settings);
                if (!parsed.fpaymentEnabled) return null;
              } catch {
                return null;
              }
              return (
                <button
                  onClick={() => setPaymentMethod('fpayment')}
                  className={`w-full p-2.5 sm:p-4 rounded-lg border-2 transition-all relative ${
                    paymentMethod === 'fpayment'
                      ? 'border-[#7F70F5] bg-[#201E3B] shadow-lg shadow-purple-500/20'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'fpayment' ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : 'bg-gray-700'
                    }`}>
                      <i className="fas fa-coins text-2xl sm:text-3xl text-white"></i>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-base sm:text-lg">Crypto</span>
                        {paymentMethod === 'fpayment' && (
                          <i className="fas fa-check-circle text-green-400 text-sm"></i>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs sm:text-sm">Pay with cryptocurrency (USDT)</span>
                    </div>
                    {paymentMethod === 'fpayment' && (
                      <div className="text-indigo-400">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    )}
                  </div>
                </button>
              );
            })()}

            {/* PayPal Payment */}
            {paymentMethod === 'paypal' && (
              <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-3">
                    {/* Payment Message (for cancellations, errors, etc.) */}
                    {cryptoMessage && (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-info-circle text-yellow-400 text-xl mt-0.5 flex-shrink-0"></i>
                          <p className="text-gray-300 text-sm flex-1">{cryptoMessage}</p>
                          <button
                            onClick={() => setCryptoMessage('')}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors flex-shrink-0"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="p-5 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <i className="fab fa-paypal text-xl text-white"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-base mb-2 text-white">PayPal Payment</h4>
                          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                            You will be redirected to PayPal to complete your payment securely. Your order will be processed immediately after payment confirmation.
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <i className="fas fa-shield-alt text-green-500"></i>
                            <span>Secure payment processed by PayPal</span>
                          </div>
                          
                          {/* Payment Details */}
                          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Amount:</span>
                                <span className="ml-2 font-semibold text-white">${pkg.price}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Currency:</span>
                                <span className="ml-2 font-semibold text-white">
                                  {(() => {
                                    if (typeof window !== 'undefined') {
                                      const settings = localStorage.getItem('adminSettings');
                                      if (settings) {
                                        try {
                                          const parsed = JSON.parse(settings);
                                          return parsed.paypalCurrency || 'USD';
                                        } catch (e) {
                                          return 'USD';
                                        }
                                      }
                                    }
                                    return 'USD';
                                  })()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Mode:</span>
                                <span className="ml-2 font-semibold text-white">
                                  {(() => {
                                    if (typeof window !== 'undefined') {
                                      const settings = localStorage.getItem('adminSettings');
                                      if (settings) {
                                        try {
                                          const parsed = JSON.parse(settings);
                                          return parsed.paypalMode === 'live' ? 'Live' : 'Sandbox';
                                        } catch (e) {
                                          return 'Sandbox';
                                        }
                                      }
                                    }
                                    return 'Sandbox';
                                  })()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Order ID:</span>
                                <span className="ml-2 font-mono text-xs text-gray-300">
                                  {(() => {
                                    // Generate preview order ID
                                    return `ORD-${Date.now()}`;
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Instructions for PayPal */}
                    <div className="mt-2 sm:mt-3">
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 sm:p-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <i className="fas fa-info-circle text-yellow-400 text-base sm:text-xl mt-0.5 flex-shrink-0"></i>
                          <div className="flex-1">
                            <h4 className="font-semibold text-yellow-400 mb-1 sm:mb-2 text-xs sm:text-base">Payment Instructions</h4>
                            <p className="text-gray-300 text-[11px] sm:text-sm mb-1.5 sm:mb-2">
                              Please complete your payment using the PayPal button below. The amount of <span className="font-bold text-white">${pkg.price} USD</span> will be charged to your PayPal account.
                            </p>
                            <p className="text-gray-400 text-[10px] sm:text-xs">
                              We will contact you at <span className="text-white font-semibold">{customerInfo.email || 'your email'}</span> once payment is confirmed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PayPal Integration Info */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2.5 sm:p-4 mt-3 sm:mt-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <i className="fas fa-info-circle text-gray-400 text-base sm:text-lg mt-0.5"></i>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-300 mb-0.5 sm:mb-1 text-xs sm:text-base">PayPal Integration</h5>
                          <p className="text-gray-400 text-[11px] sm:text-sm leading-relaxed">
                            {(() => {
                              if (typeof window !== 'undefined') {
                                const settings = localStorage.getItem('adminSettings');
                                if (settings) {
                                  try {
                                    const parsed = JSON.parse(settings);
                                    if (parsed.paypalClientId && parsed.paypalClientSecret) {
                                      const mode = parsed.paypalMode === 'live' ? 'Live (Production)' : 'Sandbox (Test)';
                                      return `PayPal is configured in ${mode} mode. Click the PayPal button below to complete your payment.`;
                                    } else {
                                      return 'PayPal Client ID or Client Secret is missing. Please configure PayPal settings in Admin Panel.';
                                    }
                                  } catch (e) {
                                    return 'Unable to load PayPal settings.';
                                  }
                                }
                              }
                              return 'PayPal settings not configured. Please set up PayPal in Admin Panel.';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PayPal Button Container - Render directly in modal */}
                    {paymentMethod === 'paypal' && step === 'payment-method' && (
                      <>
                        {paypalLoaded && typeof window !== 'undefined' && (window as any).paypal ? (
                          <>
                            <div ref={paypalButtonContainerRef} id="paypal-button-container" className="mt-3 sm:mt-4" style={{ minHeight: '50px' }}></div>
                            {!paypalButtonRendered && (
                              <div className="mt-2 text-center text-xs sm:text-sm text-gray-400">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Loading PayPal button...
                              </div>
                            )}
                          </>
                        ) : !paypalLoaded ? (
                          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
                            <i className="fas fa-spinner fa-spin text-gray-400 text-lg sm:text-xl mb-2"></i>
                            <p className="text-gray-300 text-xs sm:text-sm">Loading PayPal SDK...</p>
                            <p className="text-gray-400 text-[10px] sm:text-xs mt-1.5 sm:mt-2">Please wait while we load PayPal checkout</p>
                          </div>
                        ) : (
                          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
                            <i className="fas fa-exclamation-triangle text-red-400 text-lg sm:text-xl mb-2"></i>
                            <p className="text-gray-300 text-xs sm:text-sm">PayPal SDK failed to load</p>
                            <p className="text-gray-400 text-[10px] sm:text-xs mt-1.5 sm:mt-2">Please check your internet connection and try again</p>
                            <button
                              onClick={() => {
                                setPaypalLoaded(false);
                                setPaypalButtonRendered(false);
                                window.location.reload();
                              }}
                              className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-sm min-h-[36px] sm:min-h-[44px]"
                            >
                              Reload Page
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
            )}

            {/* Crypto Payment */}
            {paymentMethod === 'fpayment' && (
              <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-coins text-xl text-white"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-indigo-400 mb-2">Crypto Payment</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        You will be redirected to the payment page to complete your payment with USDT. 
                        After successful payment, you will be redirected back to this page.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions for Crypto */}
                <div className="mt-2 sm:mt-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 sm:p-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <i className="fas fa-info-circle text-yellow-400 text-base sm:text-xl mt-0.5 flex-shrink-0"></i>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-400 mb-1 sm:mb-2 text-xs sm:text-base">Payment Instructions</h4>
                        <p className="text-gray-300 text-[11px] sm:text-sm mb-1.5 sm:mb-2">
                          Please complete your payment using the Crypto button below. The amount of <span className="font-bold text-white">${pkg.price} USD</span> will be charged via USDT cryptocurrency.
                        </p>
                        <p className="text-gray-400 text-[10px] sm:text-xs">
                          We will contact you at <span className="text-white font-semibold">{customerInfo.email || 'your email'}</span> once payment is confirmed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Amount:</span>
                      <span className="ml-2 font-semibold text-white">${pkg.price}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Currency:</span>
                      <span className="ml-2 font-semibold text-white">USD</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cryptocurrency Payment */}
            {paymentMethod === 'crypto' && (
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                {/* Crypto Selection */}
                <div>
                  <label className="block mb-3 font-medium text-gray-300">Select Cryptocurrency</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                    {(() => {
                      // Check which cryptos have addresses
                      const settings = typeof window !== 'undefined' ? localStorage.getItem('adminSettings') : null;
                      let parsed: any = {};
                      if (settings) {
                        try {
                          parsed = JSON.parse(settings);
                        } catch (e) {
                          console.error('Error parsing settings:', e);
                        }
                      }

                      // Chỉ giữ 4 crypto phổ biến nhất: BTC, ETH, USDT, BNB
                      const cryptos = [
                        { key: 'bitcoin', label: 'BTC', icon: 'bitcoin', address: parsed.bitcoinAddress },
                        { key: 'ethereum', label: 'ETH', icon: 'ethereum', address: parsed.ethereumAddress },
                        { key: 'usdt', label: 'USDT', icon: 'bitcoin', address: parsed.usdtAddress },
                        { key: 'bnb', label: 'BNB', icon: 'bitcoin', address: parsed.bnbAddress },
                      ];

                      return cryptos.map((crypto) => {
                        const hasAddress = crypto.address && crypto.address.trim() !== '';
                        const isDisabled = !hasAddress;
                        const isSelected = selectedCrypto === crypto.key && hasAddress;

                        return (
                          <button
                            key={crypto.key}
                            onClick={() => {
                              if (!isDisabled) {
                                setSelectedCrypto(crypto.key as any);
                              }
                            }}
                            disabled={isDisabled}
                            title={isDisabled ? `Address not configured. Please add ${crypto.label} address in Admin Settings.` : `${crypto.label}`}
                            className={`p-2 sm:p-3 rounded-lg border-2 transition-colors min-h-[60px] sm:min-h-[70px] relative ${
                              isDisabled
                                ? 'border-gray-700/50 bg-gray-900/50 opacity-50 cursor-not-allowed'
                                : isSelected
                                ? 'border-gray-400 bg-gray-700'
                                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                            }`}
                          >
                            {isDisabled && (
                              <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" title="Not configured"></div>
                            )}
                            <div className="flex flex-col items-center gap-2">
                              <i className={`fab fa-${crypto.icon} text-xl ${
                                isSelected ? 'text-orange-400' : isDisabled ? 'text-gray-600' : 'text-gray-400'
                              }`}></i>
                              <span className={`text-xs font-medium uppercase ${
                                isSelected ? 'text-white' : isDisabled ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {crypto.label}
                              </span>
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                  {(() => {
                    const settings = typeof window !== 'undefined' ? localStorage.getItem('adminSettings') : null;
                    let parsed: any = {};
                    if (settings) {
                      try {
                        parsed = JSON.parse(settings);
                      } catch (e) {
                        return null;
                      }
                    }
                    // Chỉ đếm 4 crypto: BTC, ETH, USDT, BNB
                    const availableCount = [
                      parsed.bitcoinAddress, parsed.ethereumAddress, parsed.usdtAddress, parsed.bnbAddress
                    ].filter(a => a && a.trim() !== '').length;

                    if (availableCount === 0) {
                      return (
                        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-400 text-sm flex items-center gap-2">
                            <i className="fas fa-exclamation-triangle"></i>
                            No cryptocurrency addresses configured. Please add at least one address in Admin Settings.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p className="text-gray-500 text-xs mt-3 text-center">
                        {availableCount} cryptocurrency{availableCount > 1 ? 's' : ''} available. Configured cryptos are enabled above.
                      </p>
                    );
                    })()}
                  </div>
                  
                  {/* Network Selector - Hiển thị khi crypto cần chọn network */}
                  {selectedCrypto !== 'bitcoin' && hasCryptoAddress && (() => {
                    const settings = typeof window !== 'undefined' ? localStorage.getItem('adminSettings') : null;
                    let parsed: any = {};
                    if (settings) {
                      try {
                        parsed = JSON.parse(settings);
                      } catch (e) {
                        return null;
                      }
                    }
                    
                    let networkOptions: Array<{ value: string; label: string }> = [];
                    let defaultNetwork = '';
                    
                    if (selectedCrypto === 'ethereum') {
                      defaultNetwork = parsed.ethereumNetwork || 'ethereum';
                      // Chỉ hiển thị mạng đã được cấu hình trong admin settings
                      const configuredNetwork = parsed.ethereumNetwork || 'ethereum';
                      if (configuredNetwork === 'ethereum') {
                        networkOptions = [
                          { value: 'ethereum', label: 'ETH - Ethereum (ERC20)' },
                        ];
                      } else if (configuredNetwork === 'bsc') {
                        networkOptions = [
                          { value: 'bsc', label: 'BSC - Binance Smart Chain (BEP20)' },
                        ];
                      } else {
                        // Fallback: hiển thị cả 2 nếu không rõ
                        networkOptions = [
                          { value: 'ethereum', label: 'ETH - Ethereum (ERC20)' },
                          { value: 'bsc', label: 'BSC - Binance Smart Chain (BEP20)' },
                        ];
                      }
                    } else if (selectedCrypto === 'usdt') {
                      defaultNetwork = parsed.usdtNetwork || 'tron';
                      networkOptions = [
                        { value: 'tron', label: 'TRX - Tron (TRC20)' },
                      ];
                    } else if (selectedCrypto === 'bnb') {
                      defaultNetwork = parsed.bnbNetwork || 'bsc';
                      networkOptions = [
                        { value: 'bsc', label: 'BSC - BNB Smart Chain (BEP20)' },
                      ];
                    }
                    
                    if (networkOptions.length === 0) return null;
                    
                    const currentNetwork = selectedNetwork || defaultNetwork;
                    
                    return (
                      <div className="mt-4">
                        <label className="block mb-2 font-medium text-gray-300">Network</label>
                        <div className="relative">
                          <select
                            value={currentNetwork}
                            onChange={(e) => setSelectedNetwork(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-400 transition-colors appearance-none cursor-pointer pr-10 network-select text-base"
                          >
                            {networkOptions.map((option) => (
                              <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <i className="fas fa-chevron-down text-gray-400"></i>
                          </div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-3">
                          <p className="text-xs text-yellow-300 flex items-start gap-2">
                            <i className="fas fa-exclamation-triangle mt-0.5 flex-shrink-0"></i>
                            <span><strong>⚠️ WARNING:</strong> Make sure you select the correct network when sending. Sending to the wrong network may result in permanent loss of funds!</span>
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                {/* Payment Instructions for Crypto - Giống Binance */}
                <div className="mt-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-info-circle text-yellow-400 text-xl mt-0.5 flex-shrink-0"></i>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-400 mb-2">Payment Instructions</h4>
                        <p className="text-gray-300 text-sm mb-2">
                          Please send <span className="font-bold text-white">${pkg.price} USD</span> worth of <span className="font-bold text-white">{selectedCrypto.toUpperCase()}</span>
                          {selectedNetwork && selectedCrypto !== 'bitcoin' && (
                            <span className="font-bold text-white"> ({selectedNetwork.toUpperCase()})</span>
                          )} to the address shown below.
                        </p>
                        <p className="text-gray-400 text-xs mb-3">
                          We will contact you at <span className="text-white font-semibold">{customerInfo.email || 'your email'}</span> once payment is confirmed.
                        </p>
                        <div className="space-y-2 text-xs text-gray-300">
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400">•</span>
                            <span>Minimum deposit: <span className="text-white font-semibold">&gt;0.000001 {selectedCrypto.toUpperCase()}</span></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400">•</span>
                            <span>Credited (Trading enabled): <span className="text-white font-semibold">1 Confirmation</span></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400">•</span>
                            <span>Unlocked (Withdrawal enabled): <span className="text-white font-semibold">1 Confirmation</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code and Address */}
                {(() => {
                  if (!hasCryptoAddress) {
                    return (
                      <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-exclamation-circle text-red-400 text-xl mt-0.5 flex-shrink-0"></i>
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-400 mb-1">No Cryptocurrency Address Configured</h4>
                            <p className="text-gray-300 text-sm leading-relaxed mb-3">
                              Please configure at least one cryptocurrency address in Admin Settings before proceeding with crypto payment.
                            </p>
                            <p className="text-gray-400 text-xs">
                              The &quot;Complete Order&quot; button will be enabled once a cryptocurrency address is configured.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Only show QR code and address if crypto address is configured
                  if (!hasCryptoAddress) {
                    return null; // Will be handled by warning box above
                  }

                  const currentAddress = getCryptoAddress();
                  
                  if (!currentAddress || currentAddress.trim() === '') {
                    return null; // Will be handled by warning box above
                  }
                  
                  return (
                    <div className="p-5 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* QR Code - Giống Binance: lớn hơn, có border rõ ràng */}
                        <div className="flex flex-col items-center">
                          <label className="block mb-3 font-medium text-gray-300 text-sm">Scan QR Code</label>
                          <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-xl p-3 sm:p-4 flex items-center justify-center mx-auto shadow-lg border-2 border-gray-600">
                            {qrCodeUrl ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={qrCodeUrl}
                                  alt="QR Code"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    console.error('Failed to load QR code image');
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </>
                            ) : (
                              <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
                                <i className="fas fa-spinner fa-spin text-2xl"></i>
                                <span>Loading QR Code...</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            Scan with Binance Wallet, Trust Wallet or MetaMask
                          </p>
                        </div>

                        {/* Address - Hiển thị giống Binance: địa chỉ đầy đủ luôn */}
                        <div className="flex flex-col justify-center">
                          <label className="block mb-3 font-medium text-gray-300 text-sm">Deposit Address</label>
                          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-3">
                            <div className="font-mono text-sm text-white break-all mb-3" id="crypto-address-display">
                              {currentAddress}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-400">
                                Network: <span className="text-gray-300 font-semibold">
                                  {selectedCrypto === 'bitcoin' ? 'BTC - Bitcoin' :
                                   selectedCrypto === 'ethereum' ? (selectedNetwork === 'ethereum' ? 'ETH - Ethereum (ERC20)' : 'BSC - Binance Smart Chain (BEP20)') :
                                   selectedCrypto === 'usdt' ? 'TRX - Tron (TRC20)' :
                                   selectedCrypto === 'bnb' ? 'BSC - BNB Smart Chain (BEP20)' : ''}
                                </span>
                              </div>
                              <button
                                onClick={() => copyAddress(currentAddress)}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                              >
                                <i className="fas fa-copy"></i>
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                            <p className="text-xs text-red-300 flex items-start gap-2">
                              <i className="fas fa-exclamation-triangle mt-0.5 flex-shrink-0"></i>
                              <span><strong>⚠️ IMPORTANT:</strong> Make sure you select the correct network when sending. Sending to the wrong network may result in permanent loss of funds!</span>
                            </p>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-xs text-blue-300">
                              <i className="fas fa-info-circle mr-1"></i>
                              <strong>Note:</strong> Do not send NFTs or smart contracts to this address. Only send {selectedCrypto.toUpperCase()}.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Amount to Send:</span>
                          <span className="text-xl font-semibold text-white">${pkg.price} USD</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>Send the exact amount to the address above. Your order will be processed once payment is confirmed.</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-700 sticky bottom-0 bg-[#1a1f3a] -mx-2.5 sm:-mx-6 md:-mx-8 px-2.5 sm:px-6 md:px-8 pb-2 sm:pb-0 z-10">
              <button
                onClick={() => setStep('customer-info')}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back</span>
              </button>
              {paymentMethod === 'fpayment' && (
                <button
                  onClick={handlePayment}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white cursor-pointer shadow-lg hover:shadow-purple-500/50"
                >
                  <i className="fas fa-coins text-white"></i>
                  <span>Complete Order with Crypto</span>
                </button>
              )}
              {paymentMethod !== 'paypal' && paymentMethod !== 'fpayment' && (() => {
                // Check directly if crypto address is configured
                const isCryptoDisabled = paymentMethod === 'crypto' && (() => {
                  if (typeof window !== 'undefined') {
                    const settings = localStorage.getItem('adminSettings');
                    if (settings) {
                      try {
                        const parsed = JSON.parse(settings);
                        const addressMap: Record<string, string> = {
                          bitcoin: 'bitcoinAddress',
                          ethereum: 'ethereumAddress',
                          usdt: 'usdtAddress',
                          bnb: 'bnbAddress',
                        };
                        const addressKey = addressMap[selectedCrypto] || `${selectedCrypto}Address`;
                        const address = parsed[addressKey];
                        return !(address && typeof address === 'string' && address.trim() !== '');
                      } catch (e) {
                        return true;
                      }
                    }
                  }
                  return true;
                })();

                return (
                  <button
                    onClick={(e) => {
                      if (isCryptoDisabled) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      handlePayment();
                    }}
                    disabled={isCryptoDisabled}
                    className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] ${
                      isCryptoDisabled
                        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50'
                        : 'bg-gray-700 hover:bg-gray-600 text-white cursor-pointer'
                    }`}
                  >
                    <i className="fas fa-check-circle"></i>
                    <span>Complete Order</span>
                  </button>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

