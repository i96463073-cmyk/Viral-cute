export interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  environment: 'sandbox' | 'live';
  ipnId?: string;
  callbackUrl?: string;
  currency: 'KES' | 'USD' | 'UGX' | 'TZS' | 'RWF';
  status: 'configured' | 'unconfigured' | 'connected' | 'error';
  lastTested?: string;
  lastToken?: string;
  tokenExpires?: string;
}

export type Platform =
  | 'TikTok'
  | 'Instagram'
  | 'YouTube'
  | 'Twitter'
  | 'Spotify'
  | 'Telegram'
  | 'Facebook'
  | 'Threads'
  | 'Twitch';

export interface Service {
  id: number;
  name: string;
  category: string;
  platform: Platform;
  rate: number; // Price per 1,000 in USD
  originalRate?: number; // Base rate before markup
  min: number;
  max: number;
  dripfeed: boolean;
  refill: boolean;
  refillDays?: number;
  avgTime: string;
  description: string;
  speed: string; // e.g. "50K/Day", "Instant"
  quality: 'Standard' | 'High Quality' | 'Real Active' | 'VIP Cute';
  providerServiceId?: number | string;
}

export type OrderStatus =
  | 'Pending'
  | 'In Progress'
  | 'Processing'
  | 'Completed'
  | 'Partial'
  | 'Canceled';

export interface Order {
  id: number;
  serviceId: number;
  serviceName: string;
  platform: Platform;
  link: string;
  quantity: number;
  charge: number;
  startCount: number;
  remains: number;
  status: OrderStatus;
  createdAt: string;
  dripfeed?: {
    runs: number;
    interval: number;
    totalQuantity: number;
  };
  apiForwarded?: boolean;
  apiOrderId?: string | number;
  providerNote?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  markupPercent: number; // e.g., 25% profit
  autoForward: boolean; // forward new orders to provider API automatically
  currency: string;
  balance: number;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastSync?: string;
  totalSyncedServices?: number;
  lastResponse?: string;
  lastHttpCode?: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  orderId?: number | string;
  status: 'Open' | 'Answered' | 'Closed';
  createdAt: string;
  messages: {
    id: string;
    sender: 'user' | 'support' | 'bot';
    name: string;
    avatar?: string;
    text: string;
    timestamp: string;
  }[];
}

export interface Transaction {
  id: string;
  date: string;
  method: string;
  amount: number;
  bonus: number;
  status: 'Completed' | 'Pending' | 'Failed';
  reference?: string;
  pesapalTrackingId?: string;
  currency?: string;
}
