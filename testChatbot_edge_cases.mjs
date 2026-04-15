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

const test = async (label, msg, expectFn) => {
  const data = await sendChat(msg);
  const reply = (data.reply || '').toLowerCase();
  const actions = (data.actions || []).map(a => a.type);
  
  try {
    if (expectFn(reply, actions)) {
      passed++;
      console.log(`✅ [PASS] ${label}`);
    } else {
      failed++;
      fails.push({ label, msg, reply, actions });
      console.log(`❌ [FAIL] ${label}`);
    }
  } catch(e) {
    failed++;
    fails.push({ label, msg, reply: e.message, actions });
    console.log(`❌ [FAIL ERROR] ${label}`);
  }
};

(async () => {
  console.log('=== EDGE CASE & STRESS EVALUATION ===\n');
  
  await test(
    "Multi-Intent #1: Search + Coupon + Checkout",
    "find me a burger, use code TEST1 and take me to checkout",
    (r, a) => r.includes('$') && a.includes('APPLY_COUPON') && a.includes('OPEN_CHECKOUT')
  );

  await test(
    "Multi-Intent #2: Cart + Coupon + Checkout",
    "add fries to my cart, apply SAVE10 and pay now",
    (r, a) => a.includes('ADD_TO_CART') && a.includes('APPLY_COUPON') && a.includes('OPEN_CHECKOUT')
  );

  await test(
    "Irrelevant / Out-of-bounds #1",
    "what is the capital of France?",
    (r) => r.includes("upgraded to handle complex flows") || r.includes("popular favorites instead") 
  );

  await test(
    "Irrelevant / Confusing #2",
    "find me Nike shoes and apply discount",
    (r) => r.includes("upgraded to handle complex flows") || r.includes("couldn't find any") || r.includes("sorry, that coupon")
  );

  await test(
    "Mixed-Language / Slang #1",
    "gimme a burgr rn fr fr no cap",
    (r) => r.includes("burger") || r.includes("couldn't find any") || r.includes("upgraded")
  );

  await test(
    "Mixed-Language #2",
    "quiero una piza",
    (r) => r.includes("pizza") || r.includes("couldn't find") || r.includes("upgraded")
  );

  await test(
    "Misspelling #1",
    "cheesesebaarger",
    (r) => r.includes("upgraded to handle complex flows") || r.includes("favorites instead")
  );

  await test(
    "Extreme Gibberish",
    "asdfghjklqwerty zxcvb!!!",
    (r) => r.includes("upgraded to handle complex flows")
  );

  await test(
    "Empty Cart Removal Edge Case",
    "remove from cart",
    (r) => r.includes("empty")
  );

  console.log(`\n=== STRESS TEST REPORT ===`);
  console.log(`✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n--- FAILURES ---');
    fails.forEach((f, i) => console.log(`\n${i+1}. [${f.label}] Q: "${f.msg}"\n   A: ${f.reply.slice(0, 100)}\n   Actions: ${JSON.stringify(f.actions)}`));
  }
})();
