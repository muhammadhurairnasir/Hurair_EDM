import 'dotenv/config';
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
console.log('Key present:', !!key);
console.log('Key length:', key?.length);
console.log('Key start:', key?.slice(0, 20));

const stripe = new Stripe(key);

stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  automatic_payment_methods: { enabled: true }
})
.then(pi => console.log('SUCCESS - PaymentIntent ID:', pi.id))
.catch(err => console.error('STRIPE ERROR:', err.type, '-', err.message));
