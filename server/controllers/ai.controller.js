import { successResponse, errorResponse } from '../utils/responseHandler.js';
import MenuItem from '../models/MenuItem.model.js';
import Order from '../models/Order.model.js';

// Fallback Rule-Based AI Agent (Used if no OpenAI key is present)
export const handleChat = async (req, res) => {
  try {
    const { message, restaurantId, customerId } = req.body;
    const lowerMessage = message.toLowerCase();
    
    let reply = "I'm your AI assistant! I can help you track orders, find menu items, or answer FAQs. Try asking: 'Where is my order?', 'Recommend something', or 'What is your return policy?'";

    // 1. Order Tracking
    if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('where is')) {
      if (!customerId) {
        reply = "Please sign in to track your specific orders. If you just ordered, it is currently being prepared in the kitchen!";
      } else {
        const latestOrder = await Order.findOne({ customerId, restaurantId }).sort({ createdAt: -1 });
        if (latestOrder) {
          reply = `I found your latest order (Total: $${latestOrder.totalAmount}). Its current status is **${latestOrder.status}**.`;
        } else {
          reply = "I couldn't find any recent orders for your account.";
        }
      }
    }
    // 2. Product Discovery / Recommendations
    else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('hungry')) {
      const items = await MenuItem.find({ restaurantId, availability: true }).limit(2);
      if (items.length > 0) {
        reply = `Based on trending orders, I highly recommend our **${items[0].name}** ($${items[0].price})! It's a customer favorite today.`;
      } else {
        reply = "We are currently updating our menu. Check back soon!";
      }
    }
    // 3. Search / Filters
    else if (lowerMessage.includes('cheap') || lowerMessage.includes('under')) {
      const items = await MenuItem.find({ restaurantId, availability: true }).sort({ price: 1 }).limit(3);
      if (items.length > 0) {
        reply = `Here are some affordable options: **${items[0].name}** for $${items[0].price}, and **${items[1]?.name || ''}** for $${items[1]?.price || ''}.`;
      }
    }
    // 4. FAQ Automation
    else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      reply = "We offer standard delivery within 30-45 minutes. Delivery is free for orders over $50!";
    }
    else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      reply = "Since we deal with fresh food, we cannot accept physical returns. However, if your order is incorrect, please let us know immediately and we will issue a full refund to your original payment method.";
    }
    else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      reply = "We accept all major credit cards via Stripe, as well as digital wallets like Apple Pay and Google Pay.";
    }

    // Optional: Sleep for 1 second to simulate AI "typing" delay
    await new Promise(resolve => setTimeout(resolve, 800));

    successResponse(res, 200, 'AI Response', { reply });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Recommendation Engine Endpoint
export const getRecommendations = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    // Simple mock logic: get 4 random available menu items
    const items = await MenuItem.aggregate([
      { $match: { restaurantId: restaurantId, availability: true } },
      { $sample: { size: 4 } }
    ]);
    
    successResponse(res, 200, 'Recommendations fetched', items);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
