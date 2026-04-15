import http from 'http';

const PORT = 5000;
const restaurantId = '69d61964f843cc3711ec9b8d';
const customerId   = '69d61964f843cc3711ec9b8b';

const sendChat = (msg) => new Promise((resolve) => {
  const payload = JSON.stringify({ message: msg, restaurantId, customerId, cart: [] });
  const req = http.request({
    hostname: 'localhost', port: PORT, path: '/api/ai/chat', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => resolve(JSON.parse(body).data || {}));
  });
  req.on('error', () => resolve({ reply: 'NETWORK_ERROR' }));
  req.write(payload); req.end();
});

(async () => {
    console.log("=== MIN/MAX PRICE VALIDATION ===\n");

    const tests = [
        "what is your cheapest item",
        "show me the most expensive burger",
        "find cheapest pizza",
        "least expensive food",
        "priciest item from house brand"
    ];

    for (let msg of tests) {
        console.log(`\nQ: "${msg}"`);
        const { reply } = await sendChat(msg);
        console.log(`A: ${reply.split('\n').filter(l => l.trim()).join('\n   ')}`);
        
        // Assertions
        if (reply.includes('Here is the cheapest') || reply.includes('Here is the most expensive')) {
            console.log('✅ PASSED');
        } else {
            console.log('❌ FAILED (Wrong format or unrecognized intent)');
        }
    }
})();
