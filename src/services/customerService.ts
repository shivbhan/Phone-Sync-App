import shopifyClient from '../utils/shopifyClient';
import logger from '../utils/logger';
import { ShopifyOrder, PhoneSyncResult } from '../types';

class CustomerService {
  /**
   * Sync phone number from order shipping address to customer profile
   */
  public async syncPhoneFromOrder(order: ShopifyOrder): Promise<PhoneSyncResult> {
    const orderId = order.id;
    const orderNumber = order.order_number;

    try {
      // Validate order has customer
      if (!order.customer || !order.customer.id) {
        const message = `Order ${orderNumber} has no associated customer`;
        logger.warning(message);
        return {
          success: false,
          customerId: 0,
          orderId,
          phoneNumber: '',
          message,
          error: 'No customer associated with order'
        };
      }

      const customerId = order.customer.id;

      // Extract phone number from shipping address
      const shippingPhone = order.shipping_address?.phone;
      
      if (!shippingPhone) {
        const message = `Order ${orderNumber} has no phone in shipping address`;
        logger.warning(message);
        return {
          success: false,
          customerId,
          orderId,
          phoneNumber: '',
          message,
          error: 'No phone number in shipping address'
        };
      }

      // Check if customer already has this phone number
      const customer = await shopifyClient.getCustomer(customerId);
      
      if (customer.phone === shippingPhone) {
        const message = `Customer ${customerId} already has phone ${shippingPhone}`;
        logger.info(message);
        return {
          success: true,
          customerId,
          orderId,
          phoneNumber: shippingPhone,
          message: message + ' - No update needed'
        };
      }

      // Update customer phone
      logger.info(`Syncing phone ${shippingPhone} to customer ${customerId} from order ${orderNumber}`);
      
      await shopifyClient.updateCustomerPhone(customerId, shippingPhone);

      const successMessage = `Successfully synced phone ${shippingPhone} to customer ${customerId}`;
      logger.success(successMessage, {
        orderId,
        orderNumber,
        customerId,
        phoneNumber: shippingPhone
      });

      return {
        success: true,
        customerId,
        orderId,
        phoneNumber: shippingPhone,
        message: successMessage
      };

    } catch (error) {
      const errorMessage = `Failed to sync phone for order ${orderNumber}`;
      logger.error(errorMessage, {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId,
        orderNumber
      });

      return {
        success: false,
        customerId: order.customer?.id || 0,
        orderId,
        phoneNumber: order.shipping_address?.phone || '',
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate if phone sync is needed
   */
  public shouldSyncPhone(order: ShopifyOrder): boolean {
    return !!(
      order.customer?.id &&
      order.shipping_address?.phone &&
      order.shipping_address.phone.trim() !== ''
    );
  }
}

export default new CustomerService();
