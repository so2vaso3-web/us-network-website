export interface Package {
  id: string;
  carrier: 'verizon' | 'att' | 'tmobile' | 'uscellular' | 'mintmobile' | 'cricket';
  name: string;
  price: number;
  period: 'month' | 'year';
  data: string;
  speed: string;
  hotspot: string;
  features: string[];
  badge?: string;
}

export interface Order {
  orderId: string;
  planId: string;
  planName: string;
  carrier: string;
  price: number;
  paymentMethod: 'paypal' | 'crypto';
  status: 'pending' | 'completed' | 'cancelled';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerNotes?: string;
  // Backward compatibility
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  // Payment verification
  paymentId?: string;
  transactionHash?: string;
  paymentVerified?: boolean;
  verifiedAt?: string;
}

export interface AdminSettings {
  adminUsername?: string;
  adminPassword?: string;
  websiteName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  businessHours?: string;
  description?: string;
  paypalEnabled?: boolean;
  paypalClientId?: string;
  paypalClientSecret?: string;
  paypalMode?: 'sandbox' | 'live';
  paypalCurrency?: string;
  paypalReturnUrl?: string;
  paypalCancelUrl?: string;
  cryptoEnabled?: boolean;
  cryptoGateway?: string;
  bitcoinAddress?: string;
  ethereumAddress?: string;
  ethereumNetwork?: 'ethereum' | 'bsc';
  usdtAddress?: string;
  usdtNetwork?: 'tron';
  bnbAddress?: string;
  bnbNetwork?: 'bsc';
  apiKey?: string;
  defaultLanguage?: string;
  autoApproveOrders?: boolean;
  emailNotifications?: boolean;
  ordersPerPage?: number;
  carrierLogos?: {
    verizon?: string;
    att?: string;
    tmobile?: string;
    uscellular?: string;
    mintmobile?: string;
    cricket?: string;
  };
}

export interface WebsiteContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  about: {
    title: string;
    content: string;
  };
  contact: {
    title: string;
    content: string;
  };
}

