import Stripe from 'stripe';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// Creates a PaymentIntent and returns the client_secret to the frontend
export const createPaymentIntent = async (req, res) => {
  try {
    let { amount, promoCode } = req.body; // amount in dollars (e.g. 29.99)

    if (!amount || amount <= 0) {
      return errorResponse(res, 400, 'Invalid amount');
    }

    // Mathematical Promo Reducer
    if (promoCode) {
      const code = promoCode.toUpperCase();
      if (code === 'SAVE5' && amount > 5) {
        amount -= 5;
      } else if (code === 'FIRST10') {
        amount = amount * 0.9;
      }
    }

    // Initialize Stripe lazily so dotenv has already loaded the key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    successResponse(res, 200, 'Payment intent created', {
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Creates a PaymentIntent for B2B SaaS Upgrades
export const createSaaSPaymentIntent = async (req, res) => {
  try {
    const { plan } = req.body;
    let amount = 0;
    
    if (plan.toLowerCase() === 'standard') amount = 7900; 
    else if (plan.toLowerCase() === 'premium') amount = 14900;
    else return errorResponse(res, 400, 'Invalid subscription plan requested');

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { 
        saasPlan: plan,
        restaurantId: req.user.restaurantId.toString() 
      }
    });

    successResponse(res, 200, 'SaaS payment intent created', {
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
