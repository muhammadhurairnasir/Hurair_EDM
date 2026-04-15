import http from 'http';

const PORT = 5000;
const restaurantId = '69d61964f843cc3711ec9b8d';
const customerId   = '69d61964f843cc3711ec9b8b';

const queries = [
  "hello", "hi", "hey there", "wats up", "yo", "good morning", "good evening",
  "what is your return policy?", "can I get a refund", "refund plz", "return this",
  "how fast is shipping?", "delivery time", "when will it arrive", "shipping schedule",
  "do you accept cash?", "can I pay with crypto?", "payment methods", "how do I pay",
  "what time do you close?", "open hours", "are you open tomorrow?", "closing time",
  "how can I contact you?", "phone number", "email address", "support",
  "show me burgers", "give me a burger", "what burgers do you have", "burgers",
  "find food under 15", "cheap items under $10", "budget items", "under 20 dollars",
  "highly rated items", "5 star products", "best rated", "top tier food",
  "items from House Brand", "House Brand stuff", "what brands do you carry",
  "cheap desserts", "good pizza", "salad under $15", "5 star burgers",
  "food", "stuff", "yes", "no", "idk", "maybe",
  "what goes well with a burger", "pairings for pizza", "what to eat with salad",
  "what is trending", "popular items right now", "best sellers",
  "recommend something good", "I am hungry", "what should I eat",
  "add a burger to my cart", "add wagyu to cart", "I want a burger", "add 2 fries",
  "clear my cart", "empty cart", "delete everything in cart",
  "where is my order", "track my recent purchase", "what is my order status",
  "show all my previous orders", "order history", "past orders", "what did I order yesterday",
  "do you have any discount codes", "coupons", "promo codes", "any deals?",
  "use code TEST1", "apply coupon SAVE10", "apply FAKECODE", "apply coupon FLAT5",
  "checkout", "open my cart", "pay now", "take me to cart",
  "show me burgers under $30 and what is your refund policy?", "add burger and open checkout",
  "burgr plz", "cheeeseeeecaek", "asdfghjkl", "hmmm", "test",
  "find vegan options", "keto food", "halal options", "gluten free",
  "find 5 star items under $5", "items over $1000",
  "what is the weather in London?", "who is the president?",
  "track my order and apply coupon TEST1", "add pizza and clear cart",
  "give me all your food", "I hate this", "you are an AI"
];

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
      catch { resolve({ reply: 'PARSE_ERROR' }); }
    });
  });
  req.on('error', () => resolve({ reply: 'NETWORK_ERROR' }));
  req.write(payload); req.end();
});

(async () => {
  console.log(`Starting 100 API Requests Stress Test...`);
  
  let passes = 0, fails = 0;

  for (let i = 1; i <= 100; i++) {
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const data = await sendChat(randomQuery);
    
    // A crash/fail is considered if reply is empty, undefined, or a system network/parse error
    if (!data.reply || data.reply === 'NETWORK_ERROR' || data.reply === 'PARSE_ERROR') {
      console.log(`❌ [Run ${i}] FAILED on query: "${randomQuery}" -> Empty/Error Reply`);
      fails++;
    } else {
      passes++;
    }
  }

  console.log(`\n================================`);
  console.log(` STRESS TEST RESULTS (100 RUNS)`);
  console.log(`================================`);
  console.log(`✅ Passed: ${passes}`);
  console.log(`❌ Failed: ${fails}`);
  console.log(`Success Rate: ${((passes/100)*100).toFixed(0)}%`);
})();
