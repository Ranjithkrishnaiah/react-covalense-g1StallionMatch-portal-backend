const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: {
    // For sample support and debugging, not required for production:
    name: 'stripe-samples/accept-a-payment/custom-payment-flow',
    version: '0.0.2',
    url: 'https://github.com/stripe-samples',
  },
});
