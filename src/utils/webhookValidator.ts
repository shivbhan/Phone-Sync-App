import crypto from 'crypto';
import { Request } from 'express';
import logger from './logger';
import { WebhookMetadata } from '../types';

class WebhookValidator {
  /**
   * Verify Shopify webhook HMAC signature
   */
  public verifyWebhook(body: string, hmacHeader: string, secret: string): boolean {
    if (!hmacHeader || !secret) {
      logger.error('Missing HMAC header or secret for webhook validation');
      return false;
    }

    try {
      // Create HMAC hash using the secret
      const hash = crypto
        .createHmac('sha256', secret)
        .update(body, 'utf8')
        .digest('base64');

      // Compare the computed hash with the received HMAC
      const isValid = crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(hmacHeader)
      );

      if (isValid) {
        logger.debug('Webhook HMAC validation successful');
      } else {
        logger.warning('Webhook HMAC validation failed');
      }

      return isValid;
    } catch (error) {
      logger.error('Error validating webhook HMAC', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  /**
   * Extract webhook metadata from headers
   */
  public extractWebhookMetadata(req: Request): WebhookMetadata {
    return {
      topic: req.headers['x-shopify-topic'] as string,
      shop: req.headers['x-shopify-shop-domain'] as string,
      webhookId: req.headers['x-shopify-webhook-id'] as string,
      apiVersion: req.headers['x-shopify-api-version'] as string
    };
  }
}

export default new WebhookValidator();
