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
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'crypto'>('paypal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCrypto, setSelectedCrypto] = useState<'bitcoin' | 'ethereum' | 'usdt' | 'usdc' | 'litecoin' | 'dogecoin' | 'solana' | 'bitcoinCash' | 'xrp' | 'bnb' | 'trx' | 'matic' | 'avax' | 'dot' | 'ada' | 'shib'>('bitcoin');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false);
  const [cryptoMessage, setCryptoMessage] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [hasCryptoAddress, setHasCryptoAddress] = useState(false);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  const paypalButtonInstanceRef = useRef<any>(null);

  // Check if crypto address is configured in admin settings (not fallback)
  const checkCryptoAddress = useCallback(() => {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          // Map selected crypto to correct address key
          const addressMap: Record<string, string> = {
            bitcoin: 'bitcoinAddress',
            ethereum: 'ethereumAddress',
            usdt: 'usdtAddress',
            usdc: 'usdcAddress',
            litecoin: 'litecoinAddress',
            dogecoin: 'dogecoinAddress',
            solana: 'solanaAddress',
            bitcoinCash: 'bitcoinCashAddress',
            xrp: 'xrpAddress',
            bnb: 'bnbAddress',
            trx: 'trxAddress',
            matic: 'maticAddress',
            avax: 'avaxAddress',
            dot: 'dotAddress',
            ada: 'adaAddress',
            shib: 'shibAddress',
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

  // Also listen for localStorage changes (when admin updates settings)
  useEffect(() => {
    if (paymentMethod === 'crypto' && step === 'payment-method' && typeof window !== 'undefined') {
      const handleStorageChange = () => {
        const hasAddress = checkCryptoAddress();
        setHasCryptoAddress(hasAddress);
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Also check periodically in case settings are updated in the same tab
      const interval = setInterval(() => {
        const hasAddress = checkCryptoAddress();
        setHasCryptoAddress(hasAddress);
      }, 500);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
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
          // Map selected crypto to correct address key
          const addressMap: Record<string, string> = {
            bitcoin: 'bitcoinAddress',
            ethereum: 'ethereumAddress',
            usdt: 'usdtAddress',
            usdc: 'usdcAddress',
            litecoin: 'litecoinAddress',
            dogecoin: 'dogecoinAddress',
            solana: 'solanaAddress',
            bitcoinCash: 'bitcoinCashAddress',
            xrp: 'xrpAddress',
            bnb: 'bnbAddress',
            trx: 'trxAddress',
            matic: 'maticAddress',
            avax: 'avaxAddress',
            dot: 'dotAddress',
            ada: 'adaAddress',
            shib: 'shibAddress',
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

  // Auto-select first available crypto when switching to crypto payment
  useEffect(() => {
    if (step === 'payment-method' && paymentMethod === 'crypto' && typeof window !== 'undefined') {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          const cryptos = [
            { key: 'bitcoin', address: parsed.bitcoinAddress },
            { key: 'ethereum', address: parsed.ethereumAddress },
            { key: 'usdt', address: parsed.usdtAddress },
            { key: 'usdc', address: parsed.usdcAddress },
            { key: 'litecoin', address: parsed.litecoinAddress },
            { key: 'dogecoin', address: parsed.dogecoinAddress },
            { key: 'solana', address: parsed.solanaAddress },
            { key: 'bitcoinCash', address: parsed.bitcoinCashAddress },
            { key: 'xrp', address: parsed.xrpAddress },
            { key: 'bnb', address: parsed.bnbAddress },
            { key: 'trx', address: parsed.trxAddress },
            { key: 'matic', address: parsed.maticAddress },
            { key: 'avax', address: parsed.avaxAddress },
            { key: 'dot', address: parsed.dotAddress },
            { key: 'ada', address: parsed.adaAddress },
            { key: 'shib', address: parsed.shibAddress },
          ];
          
          const availableCryptos = cryptos.filter(c => c.address && c.address.trim() !== '');
          
          // If current selected crypto doesn't have address, switch to first available
          if (availableCryptos.length > 0) {
            const currentCrypto = cryptos.find(c => c.key === selectedCrypto);
            if (!currentCrypto || !currentCrypto.address || currentCrypto.address.trim() === '') {
              setSelectedCrypto(availableCryptos[0].key as any);
            }
          }
        } catch (e) {
          console.error('Error checking crypto addresses:', e);
        }
      }
    }
  }, [step, paymentMethod, selectedCrypto]);

  // Format crypto address with URI scheme for QR code compatibility
  const formatCryptoAddressForQR = (address: string, crypto: string) => {
    if (!address) return address;
    
    // Normalize crypto name to lowercase (e.g., bitcoinCash -> bitcoincash)
    const cryptoLower = crypto.toLowerCase();
    
    // Format with URI scheme based on crypto type for better app compatibility (Binance, Trust Wallet, MetaMask, etc.)
    // These URI schemes are standard and recognized by most crypto wallets
    if (cryptoLower === 'bitcoin') {
      return `bitcoin:${address}`;
    } else if (cryptoLower === 'ethereum' || cryptoLower === 'usdt' || cryptoLower === 'usdc' || 
               cryptoLower === 'shib' || cryptoLower === 'matic' || cryptoLower === 'avax') {
      // Ethereum and ERC-20 tokens use ethereum: scheme
      return `ethereum:${address}`;
    } else if (cryptoLower === 'litecoin') {
      return `litecoin:${address}`;
    } else if (cryptoLower === 'dogecoin') {
      return `dogecoin:${address}`;
    } else if (cryptoLower === 'bitcoincash' || crypto === 'bitcoinCash') {
      return `bitcoincash:${address}`;
    } else if (cryptoLower === 'xrp') {
      return `xrp:${address}`;
    } else if (cryptoLower === 'bnb') {
      return `binance:${address}`;
    } else if (cryptoLower === 'trx') {
      return `tron:${address}`;
    } else if (cryptoLower === 'solana') {
      return `solana:${address}`;
    } else if (cryptoLower === 'dot') {
      return `polkadot:${address}`;
    } else if (cryptoLower === 'ada') {
      return `cardano:${address}`;
    }
    
    // Default: return address as-is (fallback for unsupported cryptos)
    return address;
  };

  useEffect(() => {
    if (step === 'payment-method' && paymentMethod === 'crypto') {
      // Only create QR code if address exists in settings
      if (hasCryptoAddress) {
        const address = getCryptoAddress();
        if (address) {
          // Format address with URI scheme for better QR code compatibility
          const formattedAddress = formatCryptoAddressForQR(address, selectedCrypto);
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formattedAddress)}&bgcolor=ffffff&color=000000&margin=2`;
          setQrCodeUrl(qrUrl);
        } else {
          setQrCodeUrl('');
        }
      } else {
        setQrCodeUrl('');
      }
    } else {
      setQrCodeUrl('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentMethod, selectedCrypto, hasCryptoAddress]);

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
          
          // Load PayPal SDK
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
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
    // This function is only for crypto payment
    if (paymentMethod === 'paypal') {
      // PayPal payment is handled by PayPalButton component
      // User should click the PayPal button to complete payment
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
        className="bg-[#1a1f3a] rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-gray-700 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicator - Only show if not success */}
        {!paymentSuccess && (
          <div className="flex items-center justify-center mb-6 gap-2">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'customer-info' ? 'w-12 bg-gray-300' : 'w-8 bg-gray-600'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'payment-method' ? 'w-12 bg-gray-300' : 'w-8 bg-gray-600'}`}></div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
              {paymentSuccess ? 'Order Confirmed' : 'Complete Your Order'}
            </h2>
            {!paymentSuccess && (
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Step {step === 'customer-info' ? '1' : '2'} of 2</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        {/* Plan Summary Card - Only show if not success */}
        {!paymentSuccess && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{carrierNames[pkg.carrier]}</div>
                <h3 className="font-semibold text-lg mb-1 text-white">{pkg.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-white">
                    ${pkg.price}
                  </span>
                  <span className="text-gray-400 text-sm">/ {pkg.period}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Total Amount</div>
                <div className="text-xl font-semibold text-white">${pkg.price}</div>
              </div>
            </div>
          </div>
        )}

            {paymentSuccess && successOrder ? (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-green-400 text-4xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Order Placed Successfully!</h3>
                  <p className="text-gray-400 text-sm mb-6">Your order has been received</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 space-y-4 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="font-mono text-white font-semibold">{successOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Plan:</span>
                    <span className="text-white font-semibold">{successOrder.planName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Carrier:</span>
                    <span className="text-white capitalize">{carrierNames[successOrder.carrier]}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-semibold text-xl">${successOrder.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-orange-400 font-semibold uppercase">{paymentMethod === 'crypto' ? selectedCrypto.toUpperCase() : 'PayPal'}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
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
          <div className="space-y-5">
            {/* Important Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-2">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-blue-400 text-xl mt-0.5 flex-shrink-0"></i>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-400 mb-1">Important Notice</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Please enter <strong className="text-white">accurate and correct information</strong>. This information will be used to activate your mobile plan. Incorrect information may result in delays or failure to receive your service package.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-300">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-600 focus:border-gray-400'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1.5">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-300">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-600 focus:border-gray-400'
                }`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1.5">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-300">
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
                className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-gray-600 focus:border-gray-400'
                }`}
                placeholder="(123) 456-7890"
              />
              <p className="text-gray-500 text-xs mt-1.5">
                Please enter a valid US phone number (10 digits). This phone number will be used to activate your mobile plan.
              </p>
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1.5">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-300">
                Additional Notes <span className="text-gray-500 text-sm font-normal">(Optional)</span>
              </label>
              <textarea
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                placeholder="Any additional information or special requests..."
                rows={3}
              />
            </div>

                <button
                  onClick={handleContinue}
                  disabled={!isFormValid()}
                  className={`w-full px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 mt-4 sm:mt-6 text-base sm:text-lg min-h-[44px] ${
                    isFormValid()
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-blue-500/50 cursor-pointer'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>Continue to Payment</span>
                  <i className={`fas fa-arrow-right text-sm ${isFormValid() ? '' : 'opacity-50'}`}></i>
                </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1 text-white">
                Choose Payment Method
              </h3>
              <p className="text-gray-400 text-sm">Select your preferred payment method</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'paypal'
                    ? 'border-gray-400 bg-gray-700'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === 'paypal' ? 'bg-blue-600' : 'bg-gray-700'
                  }`}>
                    <i className="fab fa-paypal text-2xl text-white"></i>
                  </div>
                  <span className="font-medium text-white">PayPal</span>
                  <span className="text-xs text-gray-400">Secure & Fast</span>
                  {paymentMethod === 'paypal' && (
                    <div className="absolute top-2 right-2">
                      <i className="fas fa-check-circle text-green-400"></i>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-lg border-2 transition-colors relative ${
                  paymentMethod === 'crypto'
                    ? 'border-gray-400 bg-gray-700'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === 'crypto' ? 'bg-orange-600' : 'bg-gray-700'
                  }`}>
                    <i className="fab fa-bitcoin text-2xl text-white"></i>
                  </div>
                  <span className="font-medium text-white">Cryptocurrency</span>
                  <span className="text-xs text-gray-400">BTC, ETH, USDT, USDC, LTC, DOGE, SOL, BCH</span>
                  {paymentMethod === 'crypto' && (
                    <div className="absolute top-2 right-2">
                      <i className="fas fa-check-circle text-green-400"></i>
                    </div>
                  )}
                </div>
              </button>
            </div>

                {/* PayPal Payment */}
                {paymentMethod === 'paypal' && (
                  <div className="mt-6 space-y-4">
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
                    <div className="mt-4">
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-info-circle text-yellow-400 text-xl mt-0.5 flex-shrink-0"></i>
                          <div className="flex-1">
                            <h4 className="font-semibold text-yellow-400 mb-2">Payment Instructions</h4>
                            <p className="text-gray-300 text-sm mb-2">
                              Please complete your payment using the PayPal button below. The amount of <span className="font-bold text-white">${pkg.price} USD</span> will be charged to your PayPal account.
                            </p>
                            <p className="text-gray-400 text-xs">
                              We will contact you at <span className="text-white font-semibold">{customerInfo.email || 'your email'}</span> once payment is confirmed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PayPal Integration Info */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-info-circle text-gray-400 mt-0.5"></i>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-300 mb-1">PayPal Integration</h5>
                          <p className="text-gray-400 text-sm leading-relaxed">
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
                            <div ref={paypalButtonContainerRef} id="paypal-button-container" className="mt-4" style={{ minHeight: '50px' }}></div>
                            {!paypalButtonRendered && (
                              <div className="mt-2 text-center text-sm text-gray-400">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Loading PayPal button...
                              </div>
                            )}
                          </>
                        ) : !paypalLoaded ? (
                          <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
                            <i className="fas fa-spinner fa-spin text-gray-400 text-xl mb-2"></i>
                            <p className="text-gray-300 text-sm">Loading PayPal SDK...</p>
                            <p className="text-gray-400 text-xs mt-2">Please wait while we load PayPal checkout</p>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
                            <i className="fas fa-exclamation-triangle text-red-400 text-xl mb-2"></i>
                            <p className="text-gray-300 text-sm">PayPal SDK failed to load</p>
                            <p className="text-gray-400 text-xs mt-2">Please check your internet connection and try again</p>
                            <button
                              onClick={() => {
                                setPaypalLoaded(false);
                                setPaypalButtonRendered(false);
                                window.location.reload();
                              }}
                              className="mt-3 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                              Reload Page
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

            {/* Cryptocurrency Payment */}
            {paymentMethod === 'crypto' && (
              <div className="mt-6 space-y-6">
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

                      const cryptos = [
                        { key: 'bitcoin', label: 'BTC', icon: 'bitcoin', address: parsed.bitcoinAddress },
                        { key: 'ethereum', label: 'ETH', icon: 'ethereum', address: parsed.ethereumAddress },
                        { key: 'usdt', label: 'USDT', icon: 'bitcoin', address: parsed.usdtAddress },
                        { key: 'usdc', label: 'USDC', icon: 'ethereum', address: parsed.usdcAddress },
                        { key: 'litecoin', label: 'LTC', icon: 'bitcoin', address: parsed.litecoinAddress },
                        { key: 'dogecoin', label: 'DOGE', icon: 'bitcoin', address: parsed.dogecoinAddress },
                        { key: 'solana', label: 'SOL', icon: 'bitcoin', address: parsed.solanaAddress },
                        { key: 'bitcoinCash', label: 'BCH', icon: 'bitcoin', address: parsed.bitcoinCashAddress },
                        { key: 'xrp', label: 'XRP', icon: 'bitcoin', address: parsed.xrpAddress },
                        { key: 'bnb', label: 'BNB', icon: 'bitcoin', address: parsed.bnbAddress },
                        { key: 'trx', label: 'TRX', icon: 'bitcoin', address: parsed.trxAddress },
                        { key: 'matic', label: 'MATIC', icon: 'bitcoin', address: parsed.maticAddress },
                        { key: 'avax', label: 'AVAX', icon: 'bitcoin', address: parsed.avaxAddress },
                        { key: 'dot', label: 'DOT', icon: 'bitcoin', address: parsed.dotAddress },
                        { key: 'ada', label: 'ADA', icon: 'bitcoin', address: parsed.adaAddress },
                        { key: 'shib', label: 'SHIB', icon: 'bitcoin', address: parsed.shibAddress },
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
                    const availableCount = [
                      parsed.bitcoinAddress, parsed.ethereumAddress, parsed.usdtAddress, parsed.usdcAddress,
                      parsed.litecoinAddress, parsed.dogecoinAddress, parsed.solanaAddress, parsed.bitcoinCashAddress,
                      parsed.xrpAddress, parsed.bnbAddress, parsed.trxAddress, parsed.maticAddress,
                      parsed.avaxAddress, parsed.dotAddress, parsed.adaAddress, parsed.shibAddress
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

                {/* Payment Instructions for Crypto */}
                <div className="mt-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-info-circle text-yellow-400 text-xl mt-0.5 flex-shrink-0"></i>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-400 mb-2">Payment Instructions</h4>
                        <p className="text-gray-300 text-sm mb-2">
                          Please send <span className="font-bold text-white">${pkg.price} USD</span> worth of <span className="font-bold text-white">{selectedCrypto.toUpperCase()}</span> to the address shown below.
                        </p>
                        <p className="text-gray-400 text-xs">
                          We will contact you at <span className="text-white font-semibold">{customerInfo.email || 'your email'}</span> once payment is confirmed.
                        </p>
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
                        {/* QR Code */}
                        <div className="flex flex-col items-center">
                          <label className="block mb-3 font-medium text-gray-300 text-sm">Scan QR Code</label>
                          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white rounded-lg p-2 sm:p-3 flex items-center justify-center mx-auto">
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
                        </div>

                        {/* Address */}
                        <div className="flex flex-col justify-center">
                          <label className="block mb-3 font-medium text-gray-300 text-sm">Send Payment To</label>
                          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-3">
                            <div className="font-mono text-sm text-gray-300 break-all mb-2" id="crypto-address-display">
                              {currentAddress.length > 30 ? `${currentAddress.slice(0, 15)}...${currentAddress.slice(-15)}` : currentAddress}
                            </div>
                            <button
                              onClick={() => {
                                const display = document.getElementById('crypto-address-display');
                                if (display && currentAddress) {
                                  display.textContent = currentAddress;
                                  setTimeout(() => {
                                    if (display) {
                                      display.textContent = currentAddress.length > 30 ? `${currentAddress.slice(0, 15)}...${currentAddress.slice(-15)}` : currentAddress;
                                    }
                                  }, 3000);
                                }
                              }}
                              className="text-xs text-gray-400 hover:text-gray-300 underline"
                            >
                              Show Full Address
                            </button>
                          </div>
                          <button
                            onClick={() => copyAddress(currentAddress)}
                            className="w-full px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <i className="fas fa-copy"></i>
                            <span>Copy Address</span>
                          </button>
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700">
              <button
                onClick={() => setStep('customer-info')}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back</span>
              </button>
              {paymentMethod !== 'paypal' && (() => {
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
                          usdc: 'usdcAddress',
                          litecoin: 'litecoinAddress',
                          dogecoin: 'dogecoinAddress',
                          solana: 'solanaAddress',
                          bitcoinCash: 'bitcoinCashAddress',
                          xrp: 'xrpAddress',
                          bnb: 'bnbAddress',
                          trx: 'trxAddress',
                          matic: 'maticAddress',
                          avax: 'avaxAddress',
                          dot: 'dotAddress',
                          ada: 'adaAddress',
                          shib: 'shibAddress',
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

