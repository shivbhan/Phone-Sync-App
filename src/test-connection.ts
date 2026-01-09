import dotenv from 'dotenv';
import shopifyClient from './utils/shopifyClient';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

/**
 * Test script to verify Shopify API connection
 * Run with: npm run test
 */
async function testConnection() {
  logger.info('=====================================');
  logger.info('Testing Shopify API Connection');
  logger.info('=====================================\n');

  // Check environment variables
  logger.info('Checking environment variables...');
  const storeUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const apiSecret = process.env.SHOPIFY_API_SECRET;

  if (!storeUrl) {
    logger.error('❌ SHOPIFY_STORE_URL is not set in .env file');
    process.exit(1);
  } else {
    logger.success(`✅ Store URL: ${storeUrl}`);
  }

  if (!accessToken) {
    logger.error('❌ SHOPIFY_ACCESS_TOKEN is not set in .env file');
    process.exit(1);
  } else {
    logger.success('✅ Access Token is set');
  }

  if (!apiSecret) {
    logger.warning('⚠️  SHOPIFY_API_SECRET is not set (required for webhook validation)');
  } else {
    logger.success('✅ API Secret is set');
  }

  // Test API connection
  logger.info('\nTesting API connection...');
  try {
    const isConnected = await shopifyClient.testConnection();
    
    if (isConnected) {
      logger.success('\n✅ SUCCESS! Connection to Shopify API is working');
      logger.info('\nNext steps:');
      logger.info('1. Start the server: npm run dev');
      logger.info('2. Use ngrok to expose your local server');
      logger.info('3. Configure webhook in Shopify Admin');
      process.exit(0);
    } else {
      logger.error('\n❌ FAILED! Could not connect to Shopify API');
      logger.info('\nPlease check:');
      logger.info('1. Your Admin API Access Token is correct');
      logger.info('2. The Custom App has proper permissions');
      logger.info('3. Your store URL is correct');
      process.exit(1);
    }
  } catch (error) {
    logger.error('\n❌ Error during connection test', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  }
}

// Run the test
testConnection();
