import http from 'http';

const sendChat = (msg, cart) => new Promise((resolve) => {
  const payload = JSON.stringify({ message: msg, restaurantId: '69d61964f843cc3711ec9b8d', customerId: '69d61964f843cc3711ec9b8b', cart });
  const req = http.request({
    hostname: 'localhost', port: 5000, path: '/api/ai/chat', method: 'POST',
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
    console.log("=== REMOVE FROM CART TESTS ===\n");

    const r1 = await sendChat("remove from cart", []);
    console.log(`Q: "remove from cart" (Empty Cart)`);
    console.log(`A: ${r1.reply}\n`);

    const r2 = await sendChat("remove from cart", [{ item: { _id: "123", name: "Fries", price: 5 }, quantity: 1 }]);
    console.log(`Q: "remove from cart" (Populated Cart)`);
    console.log(`A: ${r2.reply}\n`);
})();
