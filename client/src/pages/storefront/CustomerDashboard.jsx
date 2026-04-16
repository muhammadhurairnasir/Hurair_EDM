import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Heart, ArrowLeft, LogOut, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

const CustomerDashboard = () => {
  const urlSlug = useParams().slug;
  const slug = urlSlug || 'resova';
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'wishlist' | 'settings'
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate(`/customer/login`);
      return;
    }
    fetchCustomerData();
  }, [user, slug]);

  const fetchCustomerData = async () => {
    try {
      const [ordersRes, wishlistRes] = await Promise.all([
        api.get('/customer/orders'),
        api.get('/customer/wishlist')
      ]);
      setOrders(ordersRes.data.data);
      setWishlist(wishlistRes.data.data);
    } catch (error) {
      console.error('Failed to load customer data', error);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate(`/`);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/customer/profile', formData);
      setToast({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setToast(null), 3500);
      setFormData({ ...formData, password: '' });
    } catch (error) {
      setToast({ type: 'error', text: 'Failed to update profile.' });
      setTimeout(() => setToast(null), 3500);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'delivered') return 'bg-emerald-100 text-emerald-700';
    if (status === 'shipped') return 'bg-blue-100 text-blue-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700'; // pending
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Helmet>
        <title>My Dashboard | Storefront</title>
      </Helmet>

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={`/`} className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-orange-500/30 shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Welcome back, {user?.name}</h1>
            <p className="text-gray-500 font-medium">Manage your recent orders, favorite dishes, and account preferences.</p>
          </div>
        </div>

        <div className="flex bg-gray-100/50 p-1.5 rounded-xl w-max mb-8 border border-gray-200/50">
          <button 
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'}`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
          <button 
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'wishlist' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'}`}
            onClick={() => setActiveTab('wishlist')}
          >
            Saved Items
          </button>
          <button 
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                <p className="text-gray-500 mt-1">When you place an order, it will appear here.</p>
                <Link to={`/`} className="inline-block mt-6 text-blue-600 font-bold hover:underline">Start an order</Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${getStatusColor(order.status)} flex items-center gap-1`}>
                        {order.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                        {order.status}
                      </span>
                    </div>
                    <ul className="text-gray-700 text-sm font-medium space-y-1.5 border-l-2 border-orange-100 pl-3">
                      {order.items.map((item, idx) => <li key={idx}><span className="text-orange-500 font-bold">{item.quantity}x</span> {item.name || item.product?.name || 'Item'}</li>)}
                    </ul>
                  </div>
                  <div className="text-left md:text-right bg-gray-50 p-4 rounded-xl w-full md:w-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Paid</p>
                    <p className="text-2xl font-extrabold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'wishlist' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Your wishlist is empty</h3>
                <p className="text-gray-500 mt-1">Tap the heart icon on any menu item to save it.</p>
              </div>
            ) : (
              wishlist.map(item => (
                <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 hover:shadow-lg hover:border-orange-200 transition-all group">
                  <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-gray-50 shrink-0 relative">
                    <img src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/400/300`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{item.category}</span>
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-emerald-600">${item.price.toFixed(2)}</span>
                    <Link to={`/item/${item.seo?.slug || item._id}`} className="text-sm font-bold text-orange-600 hover:text-orange-700">View</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'settings' ? (
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password (Optional)</label>
                <input type="password" placeholder="Leave blank to keep current" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-4">
                Update Profile
              </button>
            </form>
          </div>
        ) : null}
      </main>
      
      {/* Premium Sliding Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-800 text-white px-6 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <CheckCircle2 className={`w-5 h-5 ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="font-bold tracking-wide">{toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
