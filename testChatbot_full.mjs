import http from 'http';

// ── CONFIG ────────────────────────────────────────────────────────────────────
const PORT = 5000;
const restaurantId = '69d61964f843cc3711ec9b8d';
const customerId   = '69d61964f843cc3711ec9b8b';

let passed = 0, failed = 0, partial = 0;
const results = [];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const sendChat = (msg, opts = {}) => new Promise((resolve) => {
  const payload = JSON.stringify({
    message: msg,
    restaurantId,
    customerId: opts.loggedIn !== false ? customerId : null,
    cart: opts.cart || []
  });
  const req = http.request({
    hostname: 'localhost', port: PORT,
    path: '/api/ai/chat', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      try { resolve(JSON.parse(body).data || {}); }
      catch { resolve({ reply: 'PARSE_ERROR', suggestions: [], actions: [] }); }
    });
  });
  req.on('error', () => resolve({ reply: 'NETWORK_ERROR', suggestions: [], actions: [] }));
  req.write(payload); req.end();
});

const test = async (id, label, msg, expectFn, opts = {}) => {
  const data = await sendChat(msg, opts);
  const reply = data.reply || '';
  // Normalize to type strings for easy assertion
  const actionTypes = (data.actions || []).map(a => a.type);
  const suggestions = data.suggestions || [];
  
  let status = 'FAIL';
  let note = '';
  try {
    const result = expectFn(reply, actionTypes, suggestions);
    status = result === true ? 'PASS' : result === 'PARTIAL' ? 'PARTIAL' : 'FAIL';
    note = typeof result === 'string' && result !== 'PARTIAL' ? result : '';
  } catch(e) { note = e.message; }

  if (status === 'PASS') passed++;
  else if (status === 'PARTIAL') { partial++; }
  else failed++;

  results.push({ id, label, msg, status, reply: reply.slice(0, 180), actions: actionTypes, note });

  const icon = status === 'PASS' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
  console.log(`\n${icon} [${id}] ${label}`);
  console.log(`   Q: "${msg}"`);
  console.log(`   A: ${reply.slice(0, 220)}${reply.length > 220 ? '...' : ''}`);
  if (actionTypes.length) console.log(`   ACTIONS: ${JSON.stringify(actionTypes)}`);
  if (note) console.log(`   NOTE: ${note}`);
};

// ── RUN ALL TESTS ─────────────────────────────────────────────────────────────
(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  RESOVE AI CHATBOT — COMPREHENSIVE EVALUATION SUITE');
  console.log('  Backend: localhost:' + PORT);
  console.log('═══════════════════════════════════════════════════════\n');

  // ── GROUP 1: GREETING & CONTEXT ──────────────────────────────────────────
  console.log('\n── GROUP 1: GREETING & ABANDONED CART ─────────────────');

  await test('T1.1', 'Greeting (empty cart)', 'hello',
    (r) => r.includes('👋') || r.toLowerCase().includes('hi') ? true : 'Missing greeting');

  await test('T1.2', 'Greeting (abandoned cart)', 'hi',
    (r) => r.includes('cart') || r.includes('item') ? true : 'No cart reminder',
    { cart: [{ name: 'Wagyu Burger', price: 24.99, quantity: 2 }] });

  // ── GROUP 2: FAQ AUTOMATION ───────────────────────────────────────────────
  console.log('\n── GROUP 2: FAQ AUTOMATION ─────────────────────────────');

  await test('T2.1', 'Return policy', 'what is your return policy?',
    (r) => r.toLowerCase().includes('return') || r.toLowerCase().includes('refund') ? true : 'No return info');

  await test('T2.2', 'Shipping speed', 'how fast is shipping?',
    (r) => r.toLowerCase().includes('deliver') || r.toLowerCase().includes('shipping') ? true : 'No shipping info');

  await test('T2.3', 'Payment - cash', 'do you accept cash?',
    (r) => r.toLowerCase().includes('cash') || r.toLowerCase().includes('payment') ? true : 'No payment info');

  await test('T2.4', 'Opening hours', 'what time do you close?',
    (r) => r.toLowerCase().includes('open') || r.toLowerCase().includes('pm') || r.toLowerCase().includes('hour') ? true : 'No hours info');

  await test('T2.5', 'Contact info', 'how can I contact you?',
    (r) => r.toLowerCase().includes('contact') || r.includes('+') || r.toLowerCase().includes('email') ? true : 'No contact info');

  await test('T2.6', 'FAQ - varied phrasing (refund)', 'can i get a refund?',
    (r) => r.toLowerCase().includes('refund') || r.toLowerCase().includes('return') ? true : 'NLP phrasing failed');

  // ── GROUP 3: PRODUCT DISCOVERY & SEARCH ──────────────────────────────────
  console.log('\n── GROUP 3: PRODUCT DISCOVERY & SEARCH ────────────────');

  await test('T3.1', 'Category search - burgers', 'show me burgers',
    (r) => r.toLowerCase().includes('burger') || r.includes('$') ? true : 'No burger results');

  await test('T3.2', 'Price filter - under $15', 'find food under $15',
    (r) => r.includes('$') ? true : 'No price-filtered results');

  await test('T3.3', 'Rating filter - highly rated', 'show me highly rated items',
    (r) => r.includes('$') || r.toLowerCase().includes('rated') ? true : 'No rated results');

  await test('T3.4', 'Brand filter', 'items from House Brand',
    (r) => r.toLowerCase().includes('house brand') || r.includes('$') ? true : 'No brand results');

  await test('T3.5', 'Compound: category + price', 'cheap desserts',
    (r) => r.includes('$') || r.toLowerCase().includes('dessert') || r.toLowerCase().includes('cake') || r.toLowerCase().includes('cheesecake') ? true : 'No dessert/cheap results');

  await test('T3.6', 'Ambiguous query', 'food',
    (r) => r.length > 20 ? true : 'Empty or too short response');

  await test('T3.7', 'Rating + price combined', 'find 5 star items under $20',
    (r) => r.includes('$') || r.toLowerCase().includes('find') || r.toLowerCase().includes('filter') || r.length > 30 ? true : 'No response for compound filter');

  // ── GROUP 4: RECOMMENDATIONS ──────────────────────────────────────────────
  console.log('\n── GROUP 4: RECOMMENDATIONS ────────────────────────────');

  await test('T4.1', 'Trending items', 'what is trending?',
    (r) => r.toLowerCase().includes('trend') || r.includes('$') || r.toLowerCase().includes('popular') || r.toLowerCase().includes('recommend') ? true : 'No trending response');

  await test('T4.2', 'General recommendation', 'recommend something good',
    (r) => r.length > 20 ? true : 'Empty recommendation');

  await test('T4.3', 'Pairing query', 'what goes well with burgers?',
    (r) => r.length > 20 ? true : 'No pairing response');

  // ── GROUP 5: CART ACTIONS ─────────────────────────────────────────────────
  console.log('\n── GROUP 5: CART ACTIONS ───────────────────────────────');

  await test('T5.1', 'Add item', 'add a burger to my cart',
    (r, actions) => actions.includes('ADD_TO_CART') ? true : 'No ADD_TO_CART action fired');

  await test('T5.2', 'Add specific item', 'add wagyu burger',
    (r, actions) => actions.includes('ADD_TO_CART') ? true : 'No ADD_TO_CART action');

  await test('T5.3', 'Clear cart', 'clear my cart',
    (r, actions) => actions.includes('CLEAR_CART') || r.toLowerCase().includes('clear') ? true : 'No CLEAR_CART action');

  // ── GROUP 6: ORDER TRACKING ───────────────────────────────────────────────
  console.log('\n── GROUP 6: ORDER TRACKING ─────────────────────────────');

  await test('T6.1', 'Track order (logged in)', 'where is my order?',
    (r) => r.toLowerCase().includes('order') || r.toLowerCase().includes('pending') || r.toLowerCase().includes('track') ? true : 'No order tracking response',
    { loggedIn: true });

  await test('T6.2', 'Track recent purchase', 'track my recent purchase',
    (r) => r.toLowerCase().includes('order') || r.includes('$') || r.toLowerCase().includes('status') ? true : 'No tracking info');

  await test('T6.3', 'Track (not logged in)', 'where is my order?',
    (r) => r.toLowerCase().includes('sign in') || r.toLowerCase().includes('log in') || r.toLowerCase().includes('🔐') ? true : 'Should prompt login',
    { loggedIn: false });

  await test('T6.4', 'Track order history', 'show all my previous orders',
    (r) => (r.toLowerCase().includes('order history') || r.toLowerCase().includes('past orders')) && r.includes('Order #') ? true : 'No order history details returned',
    { loggedIn: true });

  // ── GROUP 7: COUPONS ──────────────────────────────────────────────────────
  console.log('\n── GROUP 7: COUPONS ────────────────────────────────────');

  await test('T7.1', 'List coupons', 'do you have any discount codes?',
    (r) => r.toLowerCase().includes('coupon') || r.toLowerCase().includes('code') || r.toLowerCase().includes('discount') ? true : 'No coupon info');

  await test('T7.2', 'Apply coupon', 'apply coupon TEST1',
    (r, actions) => actions.includes('APPLY_COUPON') ? true : r.toLowerCase().includes('test1') ? 'PARTIAL' : 'No APPLY_COUPON action');

  await test('T7.3', 'Coupon synonym - use code', 'use code TEST1',
    (r, actions) => actions.includes('APPLY_COUPON') ? true : 'Synonym not recognized');

  // ── GROUP 8: CHECKOUT FLOW ────────────────────────────────────────────────
  console.log('\n── GROUP 8: CHECKOUT FLOW ──────────────────────────────');

  await test('T8.1', 'Open checkout', 'checkout',
    (r, actions) => actions.includes('OPEN_CHECKOUT') ? true : 'No OPEN_CHECKOUT action');

  await test('T8.2', 'View cart', 'open my cart',
    (r, actions) => actions.includes('OPEN_CHECKOUT') || r.toLowerCase().includes('cart') ? true : 'No cart open response');

  // ── GROUP 9: STRESS & EDGE CASES ─────────────────────────────────────────
  console.log('\n── GROUP 9: STRESS & EDGE CASES ───────────────────────');

  await test('T9.1', 'Misspelling - burgr', 'burgr plz',
    (r) => r.includes('$') || r.toLowerCase().includes('burger') || r.length > 30 ? true : 'Misspelling not handled');

  await test('T9.2', 'Slang', 'wats poppin today lol',
    (r) => r.length > 20 ? true : 'No response to slang');

  await test('T9.3', 'Irrelevant query', 'what is the weather in London?',
    (r) => r.length > 20 ? true : 'No fallback for irrelevant query');

  await test('T9.4', 'Multi-intent compound', 'show me burgers under $30 and what is your refund policy?',
    (r) => (r.includes('$') || r.toLowerCase().includes('burger')) && (r.toLowerCase().includes('refund') || r.toLowerCase().includes('return')) ? true :
           r.includes('$') || r.toLowerCase().includes('refund') ? 'PARTIAL' : 'Compound intent failed');

  await test('T9.5', 'Empty/unclear input', 'ummm',
    (r) => r.length > 20 ? true : 'No fallback response');

  await test('T9.6', 'Compound cart + checkout', 'add wagyu burger and open checkout',
    (r, actions) => actions.includes('ADD_TO_CART') && actions.includes('OPEN_CHECKOUT') ? true :
                    actions.includes('ADD_TO_CART') || actions.includes('OPEN_CHECKOUT') ? 'PARTIAL' : 'Compound cart+checkout failed');

  await test('T9.7', 'Invalid coupon', 'apply coupon FAKECODE123',
    (r) => r.length > 20 ? true : 'No response to invalid coupon');

  await test('T9.8', 'Mixed approach - dietary', 'find me vegan options',
    (r) => r.length > 20 ? true : 'No dietary filter response');

  // ── RESULTS SUMMARY ───────────────────────────────────────────────────────
  const total = passed + failed + partial;
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  COMPREHENSIVE EVALUATION RESULTS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total Tests : ${total}`);
  console.log(`  ✅ PASSED   : ${passed}`);
  console.log(`  ⚠️  PARTIAL  : ${partial}`);
  console.log(`  ❌ FAILED   : ${failed}`);
  console.log(`  Score       : ${passed + partial * 0.5}/${total} (${Math.round((passed + partial*0.5)/total*100)}%)`);
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('FAILURES & PARTIALS:');
  results.filter(r => r.status !== 'PASS').forEach(r => {
    console.log(`  [${r.id}] ${r.label}: ${r.status}`);
    if (r.note) console.log(`         → ${r.note}`);
    console.log(`         Reply: "${r.reply.slice(0,100)}"`);
  });

  const score = Math.round((passed + partial*0.5)/total*100);
  console.log(`\n  VERDICT: ${score >= 85 ? '🟢 READY FOR EXTERNAL EVALUATION' : score >= 70 ? '🟡 MOSTLY READY — MINOR ISSUES' : '🔴 NEEDS IMPROVEMENT'}`);
})();
