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
  console.log('Running 100 Filter Variation Tests...');
  
  const categories = ["burgers", "pizza", "salads", "fries", "desserts", "drinks", "food", "snacks"];
  const prices = ["under $10", "below 15", "cheap", "affordable", "less than 20", "under $5"];
  const dietary = ["vegan", "halal", "gluten free", "plant based"];
  const ratings = ["highly rated", "top rated", "5 stars", "4 star"];
  const brands = ["house brand items", "from house brand"];

  const queries = [];

  // Generate 100 permutations
  // 1: Single Categories (8)
  categories.forEach(c => queries.push(`show me ${c}`, `find ${c}`, `i want ${c}`));
  
  // 2: Price + Category (Combinations ~ 48)
  categories.slice(0, 5).forEach(c => {
    prices.forEach(p => {
      queries.push(`find ${p} ${c}`);
      queries.push(`show me ${c} that are ${p}`);
    });
  });

  // 3: Dietary + Category
  categories.slice(0, 3).forEach(c => {
    dietary.forEach(d => {
      queries.push(`do you have ${d} ${c}?`);
    });
  });

  // 4: Ratings + Price
  ratings.forEach(r => {
    prices.forEach(p => {
        queries.push(`show me ${r} food ${p}`);
    });
  });

  // 5: Multi-compound (Dietary + Rating + Price + Category)
  queries.push(
    "vegan burgers under $15 with 5 stars",
    "cheap halal pizza",
    "highly rated gluten free desserts under $10",
    "budget vegan salads",
    "top rated beef burgers from house brand below 20",
    "5 star cheap drinks",
    "affordable halal food",
    "best reviewed vegan sides"
  );

  // Take exactly 100 random queries from the pool
  const shuffled = queries.sort(() => 0.5 - Math.random()).slice(0, 100);

  // Check if response contains products (has $) OR gracefully handles empty filter rules
  const evaluateResponse = (r) => {
     return r.includes('$') || r.includes("couldn't find") || r.includes('here are some') || r.includes('favorites instead');
  };

  for (let i = 0; i < 100; i++) {
    await test(shuffled[i], evaluateResponse);
  }

  console.log(`\n\n=== 100-FILTER NLP REPORT ===`);
  console.log(`✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n--- FAILURES ---');
    fails.forEach((f, i) => console.log(`\n${i+1}. Q: "${f.msg}"\n   A: ${f.reply.slice(0, 100)}\n   Actions: ${JSON.stringify(f.actions)}`));
  }
})();
