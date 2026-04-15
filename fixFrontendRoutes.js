const fs = require('fs');

const files = [
  'd:/Restaurant_POS/restaurant-pos-saas/client/src/pages/storefront/Storefront.jsx',
  'd:/Restaurant_POS/restaurant-pos-saas/client/src/pages/storefront/ProductDetail.jsx',
  'd:/Restaurant_POS/restaurant-pos-saas/client/src/pages/storefront/CustomerDashboard.jsx',
  'd:/Restaurant_POS/restaurant-pos-saas/client/src/pages/storefront/CustomerAuth.jsx',
  'd:/Restaurant_POS/restaurant-pos-saas/client/src/components/layout/Sidebar.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Strictly target REACT ROUTER navigation mechanisms to avoid breaking Node API paths
  
  // Fix React Navigate calls
  content = content.replace(/navigate\(`\/store\/\$\{slug\}\/item\//g, 'navigate(`/item/');
  content = content.replace(/navigate\(`\/store\/\$\{slug\}\/login`/g, 'navigate(`/customer/login`');
  content = content.replace(/navigate\(`\/store\/\$\{slug\}\/dashboard`/g, 'navigate(`/customer/dashboard`');
  content = content.replace(/navigate\(`\/store\/\$\{slug\}`/g, 'navigate(`/`');
  
  // Fix React Link Attributes
  content = content.replace(/to={`\/store\/\$\{slug\}\/item\//g, 'to={`/item/');
  content = content.replace(/to={`\/store\/\$\{slug\}\/login`/g, 'to={`/customer/login`');
  content = content.replace(/to={`\/store\/\$\{slug\}\/dashboard`/g, 'to={`/customer/dashboard`');
  content = content.replace(/to={`\/store\/\$\{slug\}`/g, 'to={`/`');
  
  // Edge Case: Top level direct window location or sidebar overrides
  content = content.replace(/window\.location\.href = `\/store\/\$\{slug\}`/g, 'window.location.href = `/`');
  content = content.replace(/href={`\/store\/\$\{user\.restaurantId\}`}/g, 'href={`/`}');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Successfully Patched ${file}`);
});
