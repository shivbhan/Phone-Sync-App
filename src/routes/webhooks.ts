import { Router, Request, Response } from 'express';
import customerService from '../services/customerService';
import webhookValidator from '../utils/webhookValidator';
import logger from '../utils/logger';
import { ShopifyOrder } from '../types';

const router = Router();

/**
 * Webhook endpoint for orders/create
 * This is called by Shopify when a new order is created
 */
router.post('/orders/create', async (req: Request, res: Response) => {
  try {
    // Extract webhook metadata
    const metadata = webhookValidator.extractWebhookMetadata(req);
    logger.info('Received orders/create webhook', {
      shop: metadata.shop,
      webhookId: metadata.webhookId
    });

    // Verify webhook authenticity
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
    const rawBody = (req as any).rawBody; // Raw body is added by middleware
    const isValid = webhookValidator.verifyWebhook(
      rawBody,
      hmacHeader,
      process.env.SHOPIFY_API_SECRET || ''
    );

    if (!isValid) {
      logger.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Extract order data
    const order: ShopifyOrder = req.body;

    logger.info(`Processing order ${order.order_number}`, {
      orderId: order.id,
      customerId: order.customer?.id,
      hasShippingPhone: !!order.shipping_address?.phone
    });

    // Check if phone sync is needed
    if (!customerService.shouldSyncPhone(order)) {
      logger.info(`Order ${order.order_number} does not require phone sync`);
      return res.status(200).json({
        message: 'Order received but phone sync not needed',
        orderId: order.id
      });
    }

    // Sync phone number
    const result = await customerService.syncPhoneFromOrder(order);

    if (result.success) {
      return res.status(200).json({
        message: result.message,
        result
      });
    } else {
      // Even if sync failed, we return 200 to acknowledge receipt
      // This prevents Shopify from retrying the webhook
      return res.status(200).json({
        message: result.message,
        result
      });
    }

  } catch (error) {
    logger.error('Error processing orders/create webhook', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Return 200 to prevent Shopify from retrying
    return res.status(200).json({
      message: 'Webhook received but processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
