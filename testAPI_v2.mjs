import http from 'http';

const restaurantId = '69d61964f843cc3711ec9b8d';
const customerId   = '69d61964f843cc3711ec9b8b';

const sendTest = (msg, label, config = {}) => new Promise((resolve) => {
  const payload = JSON.stringify({ 
    message: msg, 
    restaurantId, 
    customerId: config.login ? customerId : null,
    cart: config.cart || []
  });
  const options = {
    hostname: 'localhost',
    port: 5003,
    path: '/api/ai/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  };
  const req = http.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const reply = parsed.data?.reply || 'NO REPLY';
        const actions = parsed.data?.actions || [];
        console.log(`\n── ${label}`);
        console.log(`Q: "${msg}"`);
        console.log(`A: ${reply.slice(0, 200)}${reply.length > 200 ? '...' : ''}`);
        if(actions.length > 0) console.log(`ACT: ${JSON.stringify(actions)}`);
      } catch (e) { console.log('Parse error:', body.slice(0,100)); }
      resolve();
    });
  });
  req.on('error', e => { console.log('❌ Error:', e.message); resolve(); });
  req.write(payload);
  req.end();
});

(async () => {
  console.log('🚀 AI Agent Comprehensive Battery 2.0...');

  // 1. FAQ TESTS
  await sendTest("What is your return policy?", "FAQ: Returns");
  await sendTest("How fast is delivery?", "FAQ: Shipping");
  await sendTest("Do you accept cash?", "FAQ: Payment");
  await sendTest("What are your hours?", "FAQ: Hours");

  // 2. ADVANCED FILTERS
  await sendTest("show me highly rated burgers", "Filter: Rating (category)");
  await sendTest("find 5 star items under 20 dollars", "Filter: Rating + Price");
  await sendTest("show me house brand items", "Filter: Brand (partial match)");

  // 3. ABANDONED CART PROACTIVE
  await sendTest("hello", "Reminder: Empty cart (Normal Fallback)");
  await sendTest("hi", "Reminder: Abandoned cart", { cart: [{ name: 'Burger', price: 15, quantity: 1 }] });

  // 4. COUPON APPLICATION
  await sendTest("apply coupon TEST1", "Action: Apply Coupon (Success)");
  await sendTest("use code TEST1", "Action: Apply Coupon (Synonym)");

  // 5. COMPOUND INTENTS (STRESS)
  await sendTest("What is your refund policy and show me 4 star burgers under $25", "Compound: FAQ + Filter");
  await sendTest("add a burger and what is your contact number?", "Compound: Cart + FAQ");
  await sendTest("apply TEST1 and open checkout", "Compound: Coupon + Checkout");

  // 6. RECOMMENDATIONS
  await sendTest("what do people usually buy with Double Wagyu Burger?", "Reco: Pairings");
  await sendTest("what is trending?", "Reco: Trending");

  console.log('\n✅ Core Battery Complete.');
})();
