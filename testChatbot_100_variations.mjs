import http from 'http';

const PORT = 5000;
const restaurantId = '69d61964f843cc3711ec9b8d';
const customerId   = '69d61964f843cc3711ec9b8b';

let passed = 0, failed = 0;
const fails = [];

const sendChat = (msg) => new Promise((resolve) => {
  const payload = JSON.stringify({ message: msg, restaurantId, customerId, cart: [] });
  const req = http.request({
    hostname: 'localhost', port: PORT, path: '/api/ai/chat', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      try { resolve(JSON.parse(body).data || {}); }
      catch { resolve({ reply: 'PARSE_ERROR', actions: [] }); }
    });
  });
  req.on('error', () => resolve({ reply: 'NETWORK_ERROR', actions: [] }));
  req.write(payload); req.end();
});

const test = async (msg, expectFn) => {
  const data = await sendChat(msg);
  const reply = (data.reply || '').toLowerCase();
  const actions = (data.actions || []).map(a => a.type);
  
  try {
    if (expectFn(reply, actions)) {
      passed++;
      process.stdout.write('✅');
    } else {
      failed++;
      fails.push({ msg, reply, actions });
      process.stdout.write('❌');
    }
  } catch(e) {
    failed++;
    fails.push({ msg, reply: e.message, actions });
    process.stdout.write('❌');
  }
};

(async () => {
  console.log('Running 100 NLP Variation Tests...');
  
  // 1-20: Order Tracking (Latest & History)
  const trackQueries = [
    "where is my order", "track my food", "status of order", "has it shipped?",
    "latest purchase status", "where is it", "find my package", "order location", 
    "delivery status", "is my food ready"
  ];
  for (let q of trackQueries) await test(q, r => r.includes('pending') || r.includes('shipped') || r.includes('sign in'));

  const historyQueries = [
    "show previous orders", "order history", "past orders", "what did i buy",
    "all orders", "my previous purchases", "what did I buy last week", "my past food",
    "list my orders", "history of purchases"
  ];
  for (let q of historyQueries) await test(q, r => r.includes('history') || r.includes('order #'));

  // 21-40: Search & Filters
  const searchQueries = [
    "show me burgers", "find pizza", "need some salad", "looking for dessert", 
    "do you have fries", "give me a cake", "what food is available", "i want food",
    "search cheeseburgers", "show everything"
  ];
  for (let q of searchQueries) await test(q, r => r.includes('$') || r.includes('here are some'));

  const filterQueries = [
    "cheap food under $10", "food below 15 dollars", "items under 20", "affordable items",
    "budget friendly food", "highly rated items", "5 star products", "best reviewed",
    "house brand items", "items from house brand"
  ];
  for (let q of filterQueries) await test(q, r => r.includes('$') || r.includes('popular favorites') || r.includes('top-rated') || r.includes('house brand'));

  // 41-60: Cart & Checkout
  const cartQueries = [
    "add wagyu burger to cart", "put fries in my bag", "add 1 pizza", "toss a salad in my cart",
    "i want to buy a cheesecake", "add burger", "add it to bag", "insert pizza to cart",
    "add items to cart", "give me fries"
  ];
  for (let q of cartQueries) await test(q, (r, a) => a.includes('ADD_TO_CART') || r.includes('added') || r.includes('what would you like to add'));

  const checkoutQueries = [
    "open checkout", "pay now", "view cart", "take me to payment", "checkout please",
    "finish order", "go to cart", "pay for food", "ready to checkout", "complete purchase"
  ];
  for (let q of checkoutQueries) await test(q, (r, a) => a.includes('OPEN_CHECKOUT') || r.includes('checkout') || r.includes('popped open'));

  // 61-80: FAQ Variations
  const returns = [
    "return policy", "refund my order", "how to cancel", "mistake in order",
    "food was bad refund me", "send it back", "cancellation rules"
  ];
  for (let q of returns) await test(q, r => r.includes('refund') || r.includes('return policy') || r.includes('cancelled'));

  const shipping = [
    "shipping time", "how fast is delivery", "when will it arrive", "delivery radius",
    "do you deliver here", "eta for food"
  ];
  for (let q of shipping) await test(q, r => r.includes('deliver') || r.includes('shipping'));

  const payment = [
    "do you take cash", "can i pay with card", "stripe accepted?", "apple pay?", "payment methods", "how to pay", "crypto accepted?"
  ];
  for (let q of payment) await test(q, r => r.includes('payment') || r.includes('cash') || r.includes('credit card'));

  // 81-100: Coupons & Edge Cases
  const couponQueries = [
    "coupons", "any promo codes?", "discount list", "how to save money", "deals today",
    "apply coupon TEST1", "use code SAVE10", "redeem FLAT5", "put FAKECODE",
    "apply SAVE10 to my cart"
  ];
  for (let q of couponQueries) await test(q, (r, a) => r.includes('coupon') || r.includes('code') || a.includes('APPLY_COUPON'));

  const stressQueries = [
    "burgr plz", "wats up", "cheeeeeese", "asdfasdf", "hello",
    "find vegan", "who is the president", "add pizza and checkout", "clear cart",
    "what goes well with burger"
  ];
  for (let q of stressQueries) await test(q, r => r.length > 20); // Just needs to handle gracefully without crash

  console.log(`\n\n=== 100-VARIATION NLP REPORT ===`);
  console.log(`✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n--- FAILURES ---');
    fails.forEach((f, i) => console.log(`\n${i+1}. Q: "${f.msg}"\n   A: ${f.reply.slice(0, 100)}\n   Actions: ${JSON.stringify(f.actions)}`));
  }
})();
