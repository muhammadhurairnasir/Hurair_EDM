import http from 'http';

const sendChat = (msg, cart) => new Promise((resolve) => {
  const payload = JSON.stringify({ 
      message: msg, 
      restaurantId: '69d61964f843cc3711ec9b8d', 
      customerId: '69d61964f843cc3711ec9b8b', 
      cart 
  });
  const req = http.request({
    hostname: 'localhost', port: 5000, path: '/api/ai/chat', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => { try { resolve(JSON.parse(body).data || {}); } catch(e) { resolve({reply: 'PARSE_ERROR', actions: []}); } });
  });
  req.on('error', () => resolve({ reply: 'NETWORK_ERROR', actions: [] }));
  req.write(payload); req.end();
});

(async () => {
    // Step 1: Discover what drinks actually exist in the database
    console.log("=== STEP 1: DISCOVERING ACTUAL DRINK PRODUCTS ===");
    const discovery = await sendChat("show me all drinks", []);
    console.log("Drinks in DB:", discovery.reply);
    console.log("Actions:", JSON.stringify(discovery.actions));
    
    console.log("\n\n=== STEP 2: TARGETED ITEM REMOVAL VALIDATION ===\n");

    const activeCart = [
        { item: { _id: "69d61964f843cc3711ec9b90", name: "Double Wagyu Burger", price: 24.99, category: "Mains" }, quantity: 1 },
        { item: { _id: "69d61964f843cc3711ec9b92", name: "Truffle Parmesan Fries", price: 8.99, category: "Sides" }, quantity: 2 },
        { item: { _id: "69d61964f843cc3711ec9b93", name: "Spicy Pepperoni Pizza", price: 19.50, category: "Mains" }, quantity: 1 },
    ];

    const testHarness = async (title, msg, expectedKeyword, isRemoval) => {
        console.log(`\nTEST: [${title}]`);
        console.log(`Q: "${msg}"`);
        const data = await sendChat(msg, activeCart);
        const actions = data.actions || [];
        console.log(`A: ${data.reply}`);
        
        const removeAction = actions.find(a => a.type === 'REMOVE_FROM_CART');
        
        if (isRemoval) {
            if (removeAction && (data.reply || '').toLowerCase().includes(expectedKeyword.toLowerCase())) {
                console.log(`✅ PASSED -> Correctly removed item matching [${expectedKeyword}]`);
            } else {
                console.log(`❌ FAILED -> Expected removal but got: ${JSON.stringify(actions)}`);
            }
        } else {
            console.log(removeAction ? `❌ FAILED -> Incorrectly removed item!` : `✅ PASSED -> Maintained constraint`);
        }
    };

    await testHarness("1. Natural phrase removal", "remove the fries from my cart", "removed", true);
    await testHarness("2. Slang/verb removal", "delete the burger", "removed", true);
    await testHarness("3. Negative - no removal", "which is better, fries or burger?", "", false);
    await testHarness("4. Multi-action: add pizza, remove fries", "add a pizza and remove the fries", "removed", true);

})();
