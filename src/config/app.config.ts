import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  name: process.env.APP_NAME,
  workingDirectory: process.env.PWD || process.cwd(),
  frontendDomain: process.env.FRONTEND_DOMAIN,
  backendDomain: process.env.BACKEND_DOMAIN,
  port: parseInt(process.env.APP_PORT || process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'AUD',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  paypalClientIdKey: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecretKey: process.env.PAYPAL_CLIENT_SECRET,
  adminUserRoleIds: process.env.ADMIN_USERS_ROLE_IDS,
}));
