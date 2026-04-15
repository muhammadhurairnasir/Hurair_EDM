import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, X, CheckCircle2, Heart, UserCircle, ArrowLeft, Sparkles, Search, Trash2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import StripeCheckoutForm from '../../components/storefront/StripeCheckoutForm.jsx';
import Chatbot from '../../components/storefront/Chatbot.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Storefront = () => {
  const urlSlug = useParams().slug;
  const slug = urlSlug || 'resova';
  const [restaurantId, setRestaurantId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(`cart_${slug}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'payment' | 'success'
  const [clientSecret, setClientSecret] = useState('');
  const [seoConfig, setSeoConfig] = useState({ title: 'Order Online', description: 'Browse our delicious menu and order online.' });
  const [searchQuery, setSearchQuery] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return items.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (i.brand && i.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);
  }, [searchQuery, items]);

  const filteredAndSortedItems = useMemo(() => {
    let result = activeCategory === 'All' ? [...items] : items.filter(i => i.category === activeCategory);
    if (sortOption === 'price_asc') result.sort((a,b) => a.price - b.price);
    else if (sortOption === 'price_desc') result.sort((a,b) => b.price - a.price);
    return result;
  }, [items, activeCategory, sortOption]);

  useEffect(() => {
    resolveSlug();
  }, [slug]);

  useEffect(() => {
    if (location.state?.openCart) {
      setCheckoutStep('cart');
      setIsCartOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (slug) localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

  useEffect(() => {
    if (!restaurantId) return;
    fetchPublicMenu();
    fetchRecommendations();
    if (user?.role === 'customer') fetchWishlist();
  }, [restaurantId, user]);

  const resolveSlug = async () => {
    try {
      const { data } = await api.get(`/products/public/store/resolve/${slug}`);
      if (data.data) {
        setRestaurantId(data.data._id);
        if(data.data.seo?.title) {
          setSeoConfig({ title: data.data.seo.title, description: data.data.seo.description });
        }
      }
    } catch (error) {
      console.error('Failed to resolve store', error);
      setSeoConfig({ title: 'Store Not Found', description: '' });
    }
  };

  const fetchPublicMenu = async () => {
    try {
      const { data } = await api.get(`/products/public/${restaurantId}`);
      if (data.data) {
        setItems(data.data.filter(item => item.availability));
        if (data.data[0]?.seo?.title) {
          setSeoConfig({ title: `Order Online | ${data.data[0].seo.title}`, description: data.data[0].seo.description });
        }
      }
    } catch (error) {
      console.error('Failed to load menu', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await api.get(`/ai/recommendations/${restaurantId}`);
      if (data.data) setRecommendations(data.data);
    } catch (error) {
      console.error('Failed to load recommendations', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/customer/wishlist');
      setWishlist(data.data.map(w => w._id));
    } catch (error) { console.error(error); }
  };

  const toggleWishlist = async (itemId) => {
    if (!user || user.role !== 'customer') { navigate(`/customer/login`); return; }
    try {
      await api.post('/customer/wishlist', { productId: itemId });
      setWishlist(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    } catch (error) { console.error(error); }
  };

  const addToCart = (item, quantityToAdd = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product === item._id);
      if (existing) return prev.map(i => i.product === item._id ? { ...i, quantity: i.quantity + quantityToAdd } : i);
      return [...prev, { product: item._id, name: item.name, price: item.price, quantity: quantityToAdd }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId, change) => {
    setCart(prev => prev.map(i => {
      if (i.product === itemId) { const q = i.quantity + change; return q > 0 ? { ...i, quantity: q } : i; }
      return i;
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.product !== itemId && i._id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Centralized math
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let finalCartTotal = subtotal;
  if (discountInfo) {
    if (discountInfo.type === 'percentage') {
      finalCartTotal = subtotal - (subtotal * discountInfo.value / 100);
    } else {
      finalCartTotal = Math.max(0, subtotal - discountInfo.value);
    }
  }

  const handleProceedToPayment = async () => {
    if (!user) { navigate(`/customer/login`); return; }
    if (finalCartTotal < 0.50) { alert('Minimum order is $0.50'); return; }

    try {
      const { data } = await api.post('/payments/create-payment-intent', {
        amount: subtotal,
        promoCode: appliedPromo,
        restaurantId
      });
      setClientSecret(data.data.clientSecret);
      setCheckoutStep('payment');
    } catch (error) {
      console.error(error);
      alert('Failed to initialize payment');
    }
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const { data } = await api.post(`/coupons/public/verify/${restaurantId}`, {
        code,
        cartTotal: subtotal
      });
      if (data.success) {
        setAppliedPromo(code);
        setDiscountInfo({ type: data.data.discountType, value: data.data.discountValue });
        alert(`✅ Coupon "${code}" applied! ${data.data.discountType === 'percentage' ? data.data.discountValue + '% off' : '$' + data.data.discountValue + ' off'}`);
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Invalid or expired coupon code');
    }
  };

  const handlePaymentSuccess = async () => {
    // After Stripe payment confirmed, save the order
    try {
      const payload = { restaurantId, items: cart, totalAmount: finalCartTotal, status: 'pending' };
      if (user?.role === 'customer') payload.customerId = user._id;
      await api.post('/orders/public', payload);
    } catch (e) { console.error(e); }
    setCart([]);
    setAppliedPromo('');
    setDiscountInfo(null);
    setCheckoutStep('success');
    setTimeout(() => { setCheckoutStep('cart'); setIsCartOpen(false); }, 4000);
  };

  const totalCartValue = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const stripeOptions = {
    appearance: { theme: 'stripe' },
  };

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
          <p className="text-gray-500 mt-2">Make sure you have the correct URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Helmet>
        <title>{seoConfig.title}</title>
        <meta name="description" content={seoConfig.description} />
        <meta property="og:title" content={seoConfig.title} />
        <meta property="og:description" content={seoConfig.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1200" />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 border border-gray-200 px-3 py-1 rounded-lg">Restaurant Store</Link>
          <div className="flex items-center gap-6">
            {user?.role === 'customer' ? (
              <Link to={`/customer/dashboard`} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                <UserCircle className="w-5 h-5" /> Dashboard
              </Link>
            ) : (
              <Link to={`/customer/login`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
            )}
            <button onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors bg-gray-100 hover:bg-blue-50 rounded-full">
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{cart.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Stunning Hero Section */}
      <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden shadow-sm">
        <img src={`https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80`} alt="Magnificent Restaurant View" className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 max-w-7xl mx-auto flex flex-col justify-end h-full">
          <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3 drop-shadow">Welcome to the table</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg leading-tight">
            {seoConfig.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-medium drop-shadow-md leading-relaxed border-l-4 border-blue-500 pl-4">
            {seoConfig.description}
          </p>
        </div>
      </div>

      {/* Recommendations Carousel */}
      {recommendations.length > 0 && (
        <section className="bg-blue-600/5 py-10 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-900 mb-6">
              <Sparkles className="w-5 h-5 text-blue-600" /> AI Recommendations for You
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x py-4">
              {recommendations.map(item => (
                <div key={item._id} className="min-w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col snap-start overflow-hidden text-gray-900 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-blue-200 transition-all duration-300 cursor-pointer group">
                  <div className="w-full h-32 mb-3 rounded-xl overflow-hidden shrink-0 bg-gray-50 relative">
                    <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors z-10"></div>
                    <img src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/400/300`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Trending</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-blue-600">${item.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(item)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors shadow-sm shadow-blue-600/20">Add</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Our Menu</h2>
            
            {/* Autocomplete Search Bar */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, brands..."
                className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Autocomplete Dropdown */}
              {searchQuery && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">No products found.</div>
                  ) : (
                    searchResults.map(result => (
                      <Link 
                        key={result._id} 
                        to={`/item/${result.seo?.slug || result._id}`}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{result.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{result.brand || 'House Brand'}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">${result.price.toFixed(2)}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2 flex-grow">
              {['All', ...Array.from(new Set(items.map(i => i.category)))].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-500 hover:text-blue-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="w-full md:w-auto">
              <select 
                value={sortOption} 
                onChange={e => setSortOption(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-2 font-bold cursor-pointer outline-none"
              >
                <option value="default">Sort by: Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedItems.map(item => (
            <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-orange-200 transition-all duration-300 group cursor-pointer">
              <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-50 shrink-0 relative">
                <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors z-10"></div>
                <img src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/400/300`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{item.category}</span>
                <button onClick={() => toggleWishlist(item._id)} className="transition-colors">
                  <Heart className={`w-6 h-6 ${wishlist.includes(item._id) ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-red-400'}`} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">{item.brand || 'House Brand'}</p>
              <p className="text-sm text-gray-500 line-clamp-2 flex-grow mb-3">{item.description || 'No description available.'}</p>
              
              {/* Product Page Link */}
              <Link to={`/item/${item.seo?.slug || item._id}`} className="text-xs text-blue-600 font-bold hover:underline mb-3 inline-block">
                View Full Details & Reviews &rarr;
              </Link>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xl font-extrabold text-emerald-600">${item.price.toFixed(2)}</span>
                  {item.stock < 10 && <p className="text-[10px] text-red-500 font-bold">Only {item.stock} left!</p>}
                </div>
                <button onClick={() => addToCart(item)} disabled={item.stock === 0} className="bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition-colors">
                  {item.stock === 0 ? 'Out of Stock' : 'Add'}
                </button>
              </div>
            </div>
          ))}
          {filteredAndSortedItems.length === 0 && <div className="col-span-full py-12 text-center text-gray-500">No menu items match your filters.</div>}
        </div>
      </main>

      {/* Cart / Payment Slide-Over */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50" onClick={() => setIsCartOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col text-gray-900">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {checkoutStep === 'payment' && (
                  <button onClick={() => setCheckoutStep('cart')} className="mr-1 p-1 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                )}
                {checkoutStep === 'cart' && <ShoppingBag className="w-5 h-5" />}
                {checkoutStep === 'cart' ? 'Your Order' : checkoutStep === 'payment' ? 'Secure Payment' : 'Confirmed!'}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Screen */}
            {checkoutStep === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmed!</h3>
                <p className="text-gray-500">Your order is being prepared. Check your dashboard for tracking.</p>
              </div>
            )}

            {/* Cart Items */}
            {checkoutStep === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                      <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" />
                      <p>Your cart is empty.</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex flex-col flex-1 pl-3">
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                          <span className="text-emerald-600 font-medium">${item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-2 py-1 text-gray-900 shadow-sm">
                            <button onClick={() => item.quantity === 1 ? removeFromCart(item.product) : updateQuantity(item.product, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-900 font-bold">-</button>
                            <span className="w-4 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-900 font-bold">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.product)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        placeholder="Promo Code" 
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={!!appliedPromo}
                      />
                      <button 
                        onClick={appliedPromo ? () => { setAppliedPromo(''); setPromoCode(''); setDiscountInfo(null); } : handleApplyPromo}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${appliedPromo ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                      >
                        {appliedPromo ? 'Remove' : 'Apply'}
                      </button>
                    </div>
                    {appliedPromo && <p className="text-sm font-bold text-emerald-600 mb-4 px-1">{appliedPromo} applied!</p>}

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                      <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                        <span className="text-sm font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                      </div>
                      {appliedPromo && discountInfo && (
                        <div className="flex justify-between items-center mb-2 px-1 text-emerald-600">
                          <span className="text-sm font-medium">Discount ({appliedPromo})</span>
                          <span className="text-sm font-bold">- ${(subtotal - finalCartTotal).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-3 px-1">
                        <span className="text-sm text-gray-500 font-medium">Taxes & Fees</span>
                        <span className="text-sm font-bold text-gray-900">Calculated at checkout</span>
                      </div>
                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center px-1">
                        <span className="text-gray-900 font-bold text-lg">Total</span>
                        <span className="text-3xl font-extrabold text-orange-600">
                          ${finalCartTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button onClick={handleProceedToPayment}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30">
                      Proceed to Payment →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Stripe Payment Step */}
            {checkoutStep === 'payment' && clientSecret && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4 flex justify-between text-sm text-gray-500">
                  <span>Order Total</span>
                  <span className="font-bold text-gray-900">${finalCartTotal.toFixed(2)}</span>
                </div>
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <StripeCheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
                </Elements>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Waiter/Chatbot — cart passed for abandoned-cart detection */}
      <Chatbot 
        restaurantId={restaurantId} 
        customerId={user?._id} 
        cart={cart} 
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        onApplyCoupon={(coupon) => {
          setAppliedPromo(coupon.code);
          setDiscountInfo({ type: coupon.discountType, value: coupon.discountValue });
        }}
        onOpenCheckout={() => { setCheckoutStep('cart'); setIsCartOpen(true); }}
      />
    </div>
  );
};

export default Storefront;
