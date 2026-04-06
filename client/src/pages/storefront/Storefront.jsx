import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, X, CheckCircle2, Heart, UserCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import StripeCheckoutForm from '../../components/storefront/StripeCheckoutForm.jsx';
import Chatbot from '../../components/storefront/Chatbot.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Storefront = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'payment' | 'success'
  const [clientSecret, setClientSecret] = useState('');
  const [seoConfig, setSeoConfig] = useState({ title: 'Order Online', description: 'Browse our delicious menu and order online.' });

  useEffect(() => {
    fetchPublicMenu();
    fetchRecommendations();
    if (user?.role === 'customer') fetchWishlist();
  }, [restaurantId, user]);

  const fetchPublicMenu = async () => {
    try {
      const { data } = await api.get(`/menu/public/${restaurantId}`);
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
    if (!user || user.role !== 'customer') { navigate(`/store/${restaurantId}/login`); return; }
    try {
      await api.post('/customer/wishlist', { menuItemId: itemId });
      setWishlist(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    } catch (error) { console.error(error); }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem === item._id);
      if (existing) return prev.map(i => i.menuItem === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId, change) => {
    setCart(prev => prev.map(i => {
      if (i.menuItem === itemId) { const q = i.quantity + change; return q > 0 ? { ...i, quantity: q } : i; }
      return i;
    }));
  };

  const handleProceedToPayment = async () => {
    try {
      const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const { data } = await api.post('/payments/create-payment-intent', { amount: totalAmount });
      setClientSecret(data.data.clientSecret);
      setCheckoutStep('payment');
    } catch (error) {
      console.error(error);
      alert('Could not initialize payment. Please try again.');
    }
  };

  const handlePaymentSuccess = async () => {
    // After Stripe payment confirmed, save the order
    try {
      const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const payload = { restaurantId, items: cart, totalAmount, status: 'Pending' };
      if (user?.role === 'customer') payload.customerId = user._id;
      await api.post('/orders/public', payload);
    } catch (e) { console.error(e); }
    setCart([]);
    setCheckoutStep('success');
    setTimeout(() => { setCheckoutStep('cart'); setIsCartOpen(false); }, 4000);
  };

  const totalCartValue = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const stripeOptions = {
    appearance: { theme: 'stripe' },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Helmet>
        <title>{seoConfig.title}</title>
        <meta name="description" content={seoConfig.description} />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 border border-gray-200 px-3 py-1 rounded-lg">Restaurant Store</Link>
          <div className="flex items-center gap-6">
            {user?.role === 'customer' ? (
              <Link to={`/store/${restaurantId}/dashboard`} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                <UserCircle className="w-5 h-5" /> Dashboard
              </Link>
            ) : (
              <Link to={`/store/${restaurantId}/login`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
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

      {/* Recommendations Carousel */}
      {recommendations.length > 0 && (
        <section className="bg-blue-600/5 py-10 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-900 mb-6">
              <Sparkles className="w-5 h-5 text-blue-600" /> AI Recommendations for You
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {recommendations.map(item => (
                <div key={item._id} className="min-w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-blue-100/50 flex flex-col snap-start">
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
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-gray-500">Delicious items expertly crafted and ready to order.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{item.category}</span>
                <button onClick={() => toggleWishlist(item._id)} className="transition-colors">
                  <Heart className={`w-6 h-6 ${wishlist.includes(item._id) ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-red-400'}`} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-grow">{item.description || 'No description available.'}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xl font-extrabold text-emerald-600">${item.price.toFixed(2)}</span>
                <button onClick={() => addToCart(item)} className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-xl transition-colors">Add</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-full py-12 text-center text-gray-500">No menu items available yet.</div>}
        </div>
      </main>

      {/* Cart / Payment Slide-Over */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50" onClick={() => setIsCartOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            
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
                      <div key={item.menuItem} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                          <span className="text-emerald-600 font-medium">${item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-2 py-1">
                          <button onClick={() => updateQuantity(item.menuItem, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg">-</button>
                          <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.menuItem, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg">+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="p-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500 text-lg">Total</span>
                      <span className="text-2xl font-extrabold text-gray-900">${totalCartValue.toFixed(2)}</span>
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
                  <span className="font-bold text-gray-900">${totalCartValue.toFixed(2)}</span>
                </div>
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <StripeCheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
                </Elements>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Waiter/Chatbot */}
      <Chatbot restaurantId={restaurantId} customerId={user?._id} />
    </div>
  );
};

export default Storefront;
