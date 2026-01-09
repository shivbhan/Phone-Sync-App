import axios, { AxiosInstance } from 'axios';
import logger from './logger';
import { ShopifyCustomer, ShopifyOrder } from '../types';

class ShopifyClient {
  private apiVersion: string;

  constructor() {
    this.apiVersion = '2024-01';
  }

  /**
   * Get axios client instance with current environment variables
   * This ensures we always use the latest env vars
   */
  private getClient(): AxiosInstance {
    const storeUrl = process.env.SHOPIFY_STORE_URL || '';
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || '';

    if (!storeUrl) {
      throw new Error('SHOPIFY_STORE_URL environment variable is not set');
    }

    if (!accessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN environment variable is not set');
    }

    return axios.create({
      baseURL: `https://${storeUrl}/admin/api/${this.apiVersion}`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
  }

  /**
   * Get customer by ID
   */
  public async getCustomer(customerId: number): Promise<ShopifyCustomer> {
    try {
      logger.debug(`Fetching customer ${customerId}`);
      const client = this.getClient();
      const response = await client.get(`/customers/${customerId}.json`);
      return response.data.customer;
    } catch (error) {
      logger.error(`Failed to get customer ${customerId}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update customer phone number
   */
  public async updateCustomerPhone(
    customerId: number,
    phone: string
  ): Promise<ShopifyCustomer> {
    try {
      const data = {
        customer: {
          id: customerId,
          phone: phone
        }
      };

      logger.info(`Updating customer ${customerId} with phone: ${phone}`);
      const client = this.getClient();
      const response = await client.put(`/customers/${customerId}.json`, data);
      logger.success(`Successfully updated customer ${customerId} phone number`);

      return response.data.customer;
    } catch (error) {
      logger.error(`Failed to update customer ${customerId} phone`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        phone
      });
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  public async getOrder(orderId: number): Promise<ShopifyOrder> {
    try {
      logger.debug(`Fetching order ${orderId}`);
      const client = this.getClient();
      const response = await client.get(`/orders/${orderId}.json`);
      return response.data.order;
    } catch (error) {
      logger.error(`Failed to get order ${orderId}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Test API connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.get('/shop.json');
      logger.success('Shopify API connection successful');
      return true;
    } catch (error) {
      logger.error('Shopify API connection failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}

export default new ShopifyClient();
