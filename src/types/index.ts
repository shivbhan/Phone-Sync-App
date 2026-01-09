export interface ShopifyConfig {
  storeUrl: string;
  accessToken: string;
  apiSecret: string;
  apiVersion: string;
}

export interface ShopifyAddress {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  name?: string;
  company?: string;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  addresses?: ShopifyAddress[];
}

export interface ShopifyOrder {
  id: number;
  order_number: number;
  email?: string;
  customer?: {
    id: number;
    email: string;
    phone?: string;
  };
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;
  phone?: string;
  created_at: string;
}

export interface WebhookMetadata {
  topic: string;
  shop: string;
  webhookId: string;
  apiVersion: string;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'DEBUG';

export interface PhoneSyncResult {
  success: boolean;
  customerId: number;
  orderId: number;
  phoneNumber: string;
  message: string;
  error?: string;
}
