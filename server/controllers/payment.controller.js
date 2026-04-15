import Stripe from 'stripe';
import Coupon from '../models/Coupon.model.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// Creates a PaymentIntent and returns the client_secret to the frontend
export const createPaymentIntent = async (req, res) => {
  try {
    let { amount, promoCode, restaurantId } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 400, 'Invalid amount');
    }

    // Dynamic Coupon lookup from database
    if (promoCode && restaurantId) {
      const coupon = await Coupon.findOne({
        code: promoCode.toUpperCase(),
        restaurantId,
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (coupon) {
        // Check usage limit
        if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
          if (amount >= coupon.minOrderValue) {
            if (coupon.discountType === 'percentage') {
              const discount = amount * (coupon.discountValue / 100);
              amount -= coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
            } else {
              amount = Math.max(0, amount - coupon.discountValue);
            }
            // Increment usage count
            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
          }
        }
      }
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
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
