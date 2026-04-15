import http from 'http';

const restaurantId = '69d61964f843cc3711ec9b8d';
const customerId   = '69d61964f843cc3711ec9b8b';

const sendTest = (msg, label, includeCustomer = false) => new Promise((resolve) => {
  const payload = JSON.stringify({ message: msg, restaurantId, customerId: includeCustomer ? customerId : null });
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
        const sugg = parsed.data?.suggestions || [];
        console.log(`\n══════════════════════════════════`);
        console.log(`TEST: ${label}`);
        console.log(`MSG:  "${msg}"`);
        console.log(`——`);
        console.log(`REPLY:\n${reply.slice(0, 500)}`);
        console.log(`ACTIONS: ${JSON.stringify(actions)}`);
        console.log(`CHIPS:   ${JSON.stringify(sugg)}`);
        console.log(`SUCCESS: ${parsed.success}`);
      } catch (e) { console.log('Parse error:', body.slice(0,200)); }
      resolve();
    });
  });
  req.on('error', e => { console.log('❌ Request error:', e.message); resolve(); });
  req.write(payload);
  req.end();
});

(async () => {
  console.log('🚀 Starting AI Chatbot Battery Tests...');
  console.log(`restaurantId: ${restaurantId}`);
  console.log(`customerId:   ${customerId}`);

  await sendTest("hello",                                           "1. Greeting/Fallback");
  await sendTest("Where is my order?",                             "2. Order Track (NOT logged in)");
  await sendTest("Where is my order?",                             "3. Order Track (LOGGED IN)",       true);
  await sendTest("checkout",                                       "4. Checkout intent");
  await sendTest("open my cart",                                   "5. View Cart intent");
  await sendTest("Do you have any coupons?",                      "6. Coupon Query");
  await sendTest("any deals or promo codes?",                     "7. Coupon synonyms");
  await sendTest("what's popular?",                               "8. Trending items");
  await sendTest("recommend something",                           "9. Recommendations");
  await sendTest("show me items under 15 dollars",                "10. Budget Filter");
  await sendTest("find me vegan food",                            "11. Dietary Search (vegan)");
  await sendTest("show me burgers",                               "12. Category Search");
  await sendTest("add a burger",                                  "13. Add to Cart (category)");
  await sendTest("remove the burger",                             "14. Remove from Cart");
  await sendTest("clear my cart",                                 "15. Clear Cart");
  await sendTest("Where is my order? open checkout please.",       "16. COMPOUND: Track+Checkout",     true);
  await sendTest("Do you have coupons and what is popular?",       "17. COMPOUND: Coupons+Trending");
  await sendTest("Where is my order? Any coupons? And checkout.", "18. COMPOUND: Track+Coupon+Checkout", true);

  console.log('\n✅ Battery complete!');
})();
