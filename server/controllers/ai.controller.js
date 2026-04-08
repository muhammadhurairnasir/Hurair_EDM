import { successResponse, errorResponse } from '../utils/responseHandler.js';
import MenuItem from '../models/MenuItem.model.js';
import Order from '../models/Order.model.js';
import mongoose from 'mongoose';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract a dollar amount from natural language e.g. "under $20" → 20 */
const extractPrice = (text) => {
  const match = text.match(/\$?(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

/** Extract a category keyword from the message */
const extractCategory = (text) => {
  const categories = ['burger', 'pizza', 'pasta', 'chicken', 'beef', 'fish', 'seafood',
    'salad', 'dessert', 'drink', 'beverage', 'soup', 'sandwich', 'wrap',
    'appetizer', 'steak', 'vegan', 'vegetarian', 'rice', 'noodle'];
  return categories.find(cat => text.includes(cat)) || null;
};

/** Format an order status into a visual timeline string */
const buildOrderTimeline = (order) => {
  const steps = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Completed'];
  const currentIdx = steps.findIndex(s => s.toLowerCase() === order.status.toLowerCase());
  return steps.map((step, i) => {
    if (i < currentIdx) return `✅ ${step}`;
    if (i === currentIdx) return `🔄 **${step}** ← You are here`;
    return `⬜ ${step}`;
  }).join('\n');
};

/** Format a menu item list for chat */
const formatItems = (items) =>
  items.map(i => `• **${i.name}** — $${i.price.toFixed(2)} (${i.category})`).join('\n');

// ─── Main Chat Handler ───────────────────────────────────────────────────────

export const handleChat = async (req, res) => {
  try {
    const { message, restaurantId, customerId, cart = [] } = req.body;
    const lowerMsg = message.toLowerCase().trim();
    let reply = '';
    let suggestions = []; // Quick-reply chips to send back
    let action = null; // action for frontend to take

    // ── 1. ORDER TRACKING ──────────────────────────────────────────────────
    if (/order|track|where.*(my|is)|status|delivery status/.test(lowerMsg)) {
      if (!customerId) {
        reply = '🔐 Please **sign in** to track your orders. Guest orders can be tracked by telling me your order total.';
        suggestions = ['Sign In', 'Browse Menu'];
      } else {
        const orders = await Order.find({ customerId, restaurantId })
          .sort({ createdAt: -1 })
          .limit(3);

        if (orders.length === 0) {
          reply = "I couldn't find any orders linked to your account at this restaurant yet. Ready to place your first one?";
          suggestions = ['Show Menu', 'Recommend something'];
        } else {
          const latest = orders[0];
          const timeline = buildOrderTimeline(latest);
          const itemsList = latest.items.map(i => `• ${i.name} x${i.quantity}`).join('\n');
          reply = `📦 **Latest Order** — Total: $${latest.totalAmount.toFixed(2)}\n\n${timeline}\n\n**Items:**\n${itemsList}`;
          if (orders.length > 1) {
            reply += `\n\n_You have ${orders.length - 1} more past order(s). Want to see them?_`;
            suggestions = ['Show all my orders', 'Reorder last order'];
          }
        }
      }
    }

    // ── 2. PRODUCT SEARCH: Under a price threshold ─────────────────────────
    else if (/under|below|less than|cheap|budget|affordable/.test(lowerMsg)) {
      const priceLimit = extractPrice(lowerMsg) || 15;
      const category = extractCategory(lowerMsg);
      const query = { restaurantId, availability: true, price: { $lte: priceLimit } };
      if (category) query.category = { $regex: category, $options: 'i' };

      const items = await MenuItem.find(query).sort({ price: 1 }).limit(5);
      if (items.length > 0) {
        reply = `🏷️ **Items under $${priceLimit}${category ? ` in "${category}"` : ''}:**\n\n${formatItems(items)}\n\nWant me to add any to your cart?`;
        suggestions = items.slice(0, 3).map(i => `Add ${i.name}`);
      } else {
        reply = `Sorry, I couldn't find items under $${priceLimit}${category ? ` in "${category}"` : ''}. Want me to show all available items?`;
        suggestions = ['Show all menu items'];
      }
    }

    // ── 3. PRODUCT SEARCH: By category ────────────────────────────────────
    else if (/show me|find|search|looking for|want|i need/.test(lowerMsg)) {
      const category = extractCategory(lowerMsg);
      const priceLimit = extractPrice(lowerMsg);
      const query = { restaurantId, availability: true };
      if (category) query.category = { $regex: category, $options: 'i' };
      if (priceLimit) query.price = { $lte: priceLimit };

      const items = await MenuItem.find(query).sort({ price: 1 }).limit(6);
      if (items.length > 0) {
        const label = category || 'available items';
        const priceNote = priceLimit ? ` under $${priceLimit}` : '';
        reply = `🍽️ **Here are ${label}${priceNote}:**\n\n${formatItems(items)}\n\nShall I add something to your cart?`;
        suggestions = items.slice(0, 3).map(i => `Add ${i.name}`);
      } else {
        reply = `I couldn't find what you're looking for. Let me show you our full menu — just say **"show menu"**!`;
        suggestions = ['Show full menu', "What's popular?"];
      }
    }

    // ── 4. CART ASSISTANCE: Add an item by name ───────────────────────────
    else if (/add|put|include|throw in/.test(lowerMsg)) {
      const items = await MenuItem.find({ restaurantId, availability: true });
      const matched = items.find(item => lowerMsg.includes(item.name.toLowerCase()));
      if (matched) {
        reply = `🛒 Great choice! I've added **${matched.name}** to your cart.`;
        action = { type: 'ADD_TO_CART', item: matched };
        suggestions = [`Show ${matched.category} items`, 'View Cart', 'Checkout'];
      } else {
        reply = `I couldn't find that item. Want me to show the full menu so you can pick?`;
        suggestions = ['Show full menu'];
      }
    }

    // ── 5. CART ASSISTANCE: Remove / clear ───────────────────────────────
    else if (/remove|delete|clear cart|empty cart/.test(lowerMsg)) {
      reply = `🗑️ To remove items from your cart, tap the **–** button next to each item in the cart drawer. To empty everything, close and reopen your cart.\n\nNeed help finding a replacement item?`;
      suggestions = ['Show menu', 'Recommend something'];
    }

    // ── 6. COUPON / DISCOUNT ──────────────────────────────────────────────
    else if (/coupon|discount|promo|code|voucher|offer/.test(lowerMsg)) {
      reply = `🎟️ **Current Offers:**\n\n• **FIRST10** — 10% off your first order\n• **SAVE5** — $5 off any order over $30\n• **FREEDELIVERY** — Free delivery on orders over $50\n\nApply the code at checkout! Want me to recommend items to hit a discount threshold?`;
      suggestions = ['Items over $30', 'Items over $50', 'Recommend something'];
    }

    // ── 7. RECOMMENDATIONS ───────────────────────────────────────────────
    else if (/recommend|suggest|what.*good|popular|trending|best|favorite|special/.test(lowerMsg)) {
      // Order-based trending: find most-ordered items
      const trending = await Order.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
        { $unwind: '$items' },
        { $group: { _id: '$items.menuItem', count: { $sum: '$items.quantity' }, name: { $first: '$items.name' } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]);

      if (trending.length > 0) {
        const itemLines = trending.map((t, i) => `${i + 1}. **${t.name}** — ordered ${t.count} times`).join('\n');
        reply = `🔥 **Trending right now at this restaurant:**\n\n${itemLines}\n\nWant me to find any of these or something similar?`;
        suggestions = trending.map(t => `Show ${t.name}`);
      } else {
        // Fallback: just return some available items
        const items = await MenuItem.find({ restaurantId, availability: true }).limit(3);
        if (items.length > 0) {
          reply = `✨ **Chef's picks today:**\n\n${formatItems(items)}\n\nInterested in any of these?`;
          suggestions = items.map(i => `Add ${i.name}`);
        } else {
          reply = "Our menu is being updated! Check back soon for fresh recommendations.";
        }
      }
    }

    // ── 8. SHOW FULL MENU ─────────────────────────────────────────────────
    else if (/menu|all items|what do you have|what.*serve|food list/.test(lowerMsg)) {
      const items = await MenuItem.find({ restaurantId, availability: true }).sort({ category: 1 }).limit(10);
      if (items.length > 0) {
        reply = `📋 **Our Menu (${items.length} items):**\n\n${formatItems(items)}\n\n_Showing top 10. Filter by category or price for more!_`;
        suggestions = ['Show cheap items', 'Recommend something', 'View cart'];
      } else {
        reply = "The menu is being updated. Please check back soon!";
      }
    }

    // ── 9. ABANDONED CART REMINDER ────────────────────────────────────────
    else if (/cart|checkout|forgot|reminder/.test(lowerMsg)) {
      if (cart.length > 0) {
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        reply = `🛒 You have **${cart.length} item(s)** in your cart totalling **$${total.toFixed(2)}**. Ready to checkout? Your food is waiting!`;
        suggestions = ['Proceed to checkout', 'Keep shopping'];
      } else {
        reply = "Your cart is empty! Let me help you find something great to eat.";
        suggestions = ['Show menu', 'Recommend something'];
      }
    }

    // ── 10. FAQ: SHIPPING / DELIVERY ──────────────────────────────────────
    else if (/shipping|delivery|how long|eta|arrive|wait/.test(lowerMsg)) {
      reply = `🚚 **Delivery Info:**\n\n• Standard delivery: **30–45 minutes**\n• Express delivery: **15–20 minutes** (+$2 fee)\n• Free delivery on orders over **$50**\n• We deliver within **5km radius** of the restaurant\n\nNeed anything else?`;
      suggestions = ['Track my order', 'What are the payment options?'];
    }

    // ── 11. FAQ: RETURNS / REFUNDS ───────────────────────────────────────
    else if (/return|refund|wrong order|incorrect|complaint/.test(lowerMsg)) {
      reply = `↩️ **Return & Refund Policy:**\n\nSince we deal in fresh food:\n• We cannot accept physical returns\n• If your order is **incorrect or missing items**, contact us within **30 minutes** of delivery\n• We issue a **full refund** to your original payment method within 3–5 business days\n• For quality concerns, send a photo to help us improve!\n\nSomething wrong with your order?`;
      suggestions = ['Track my order', 'Talk to support'];
    }

    // ── 12. FAQ: PAYMENT OPTIONS ─────────────────────────────────────────
    else if (/payment|pay|card|cash|wallet|stripe/.test(lowerMsg)) {
      reply = `💳 **We accept:**\n\n• Credit & Debit Cards (Visa, Mastercard, Amex)\n• Apple Pay & Google Pay\n• Stripe-secured online checkout\n\nAll payments are **encrypted and 100% secure**. We do NOT store card details.`;
      suggestions = ['Proceed to checkout', 'Apply a coupon'];
    }

    // ── 13. FAQ: OPENING HOURS ───────────────────────────────────────────
    else if (/hours|open|close|time|schedule|when/.test(lowerMsg)) {
      reply = `⏰ **Opening Hours:**\n\n• Mon–Fri: **10:00 AM – 10:00 PM**\n• Sat–Sun: **11:00 AM – 11:00 PM**\n• Public Holidays: **12:00 PM – 9:00 PM**\n\nYou can always place an order — it will processed during business hours!`;
      suggestions = ['Order now', 'Show menu'];
    }

    // ── 14. SHOW ORDER HISTORY ───────────────────────────────────────────
    else if (/history|past order|previous|all my order/.test(lowerMsg)) {
      if (!customerId) {
        reply = '🔐 Please **sign in** to view your order history.';
        suggestions = ['Sign In'];
      } else {
        const orders = await Order.find({ customerId, restaurantId }).sort({ createdAt: -1 }).limit(5);
        if (orders.length === 0) {
          reply = "No past orders found. Let's fix that — browse our menu!";
          suggestions = ['Show menu'];
        } else {
          const orderLines = orders.map((o, i) =>
            `${i + 1}. $${o.totalAmount.toFixed(2)} — **${o.status}** (${new Date(o.createdAt).toLocaleDateString()})`
          ).join('\n');
          reply = `📜 **Your Last ${orders.length} Orders:**\n\n${orderLines}\n\nWant details on any of these?`;
          suggestions = ['Track latest order', 'Reorder last order'];
        }
      }
    }

    // ── 15. GREETINGS & HELP ─────────────────────────────────────────────
    else if (/hello|hi|hey|help|what can you|start|begin/.test(lowerMsg)) {
      reply = `👋 Hi there! I'm your **AI Store Assistant**. Here's what I can do:\n\n🔍 **Search** — "Show me pizza under $15"\n🛒 **Cart** — "Add Margherita to cart"\n📦 **Orders** — "Where is my order?"\n🎟️ **Coupons** — "Do you have any discounts?"\n❓ **FAQ** — "What's your return policy?"\n\nWhat would you like to do?`;
      suggestions = ['Show menu', 'Track my order', 'Recommend something', 'Any coupons?'];
    }

    // ── DEFAULT FALLBACK ─────────────────────────────────────────────────
    else {
      // Try to match any menu item mentioned
      const items = await MenuItem.find({ restaurantId, availability: true });
      const matchedItem = items.find(item => lowerMsg.includes(item.name.toLowerCase()));
      if (matchedItem) {
        reply = `🍽️ **${matchedItem.name}** — $${matchedItem.price.toFixed(2)}\n\n${matchedItem.description || 'A great choice!'}\n\nWant to add it to your cart?`;
        suggestions = [`Add ${matchedItem.name}`, 'Show similar items'];
      } else {
        reply = `🤔 I'm not sure how to help with that. Here's what I can assist you with:\n\n💬 Try: "Show me burgers", "Track my order", "Any deals today?", or "What's popular?"`;
        suggestions = ['Show menu', 'Track my order', 'Any coupons?', 'Recommend something'];
      }
    }

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 600));

    successResponse(res, 200, 'AI Response', { reply, suggestions, action });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// ─── Trending Recommendation Engine ─────────────────────────────────────────

export const getRecommendations = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Primary: trending by order frequency
    let restaurantObjectId;
    try {
      restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
    } catch {
      return errorResponse(res, 400, 'Invalid restaurantId');
    }

    const trending = await Order.aggregate([
      { $match: { restaurantId: restaurantObjectId } },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItem', totalOrdered: { $sum: '$items.quantity' } } },
      { $sort: { totalOrdered: -1 } },
      { $limit: 6 }
    ]);

    if (trending.length >= 2) {
      // Fetch full MenuItem documents from the trending IDs
      const ids = trending.map(t => t._id);
      const trendingItems = await MenuItem.find({ _id: { $in: ids }, availability: true });
      return successResponse(res, 200, 'Trending recommendations', trendingItems);
    }

    // Fallback: random available items
    const items = await MenuItem.aggregate([
      { $match: { restaurantId: restaurantId, availability: true } },
      { $sample: { size: 4 } }
    ]);
    successResponse(res, 200, 'Recommendations fetched', items);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
