import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Heart, ArrowLeft, LogOut, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

const CustomerDashboard = () => {
  const { slug } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'wishlist' | 'settings'
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', password: '' });

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate(`/store/${slug}/login`);
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
    navigate(`/store/${slug}`);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/customer/profile', formData);
      alert('Profile updated successfully! Login again to see changes immediately.');
      setFormData({ ...formData, password: '' });
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const getStatusColor = (status) => {
    if(status === 'Completed') return 'bg-emerald-100 text-emerald-700';
    if(status === 'Preparing') return 'bg-blue-100 text-blue-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Helmet>
        <title>My Dashboard | Storefront</title>
      </Helmet>

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={`/store/${slug}`} className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Hello, {user?.name}</h1>
          <p className="text-gray-500">Track your orders and view your favorite items.</p>
        </div>

        <div className="flex border-b border-gray-200 mb-8 space-x-8">
          <button 
            className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'orders' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('orders')}
          >
            ORDER HISTORY
            {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
          </button>
          <button 
            className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'wishlist' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('wishlist')}
          >
            SAVED ITEMS
            {activeTab === 'wishlist' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
          </button>
          <button 
            className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('settings')}
          >
            SETTINGS
            {activeTab === 'settings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                <p className="text-gray-500 mt-1">When you place an order, it will appear here.</p>
                <Link to={`/store/${slug}`} className="inline-block mt-6 text-blue-600 font-bold hover:underline">Start an order</Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-gray-500">Order #{order._id.slice(-6).toUpperCase()}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(order.status)} flex items-center gap-1`}>
                        {order.status === 'Completed' ? <CheckCircle2 className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                        {order.status}
                      </span>
                    </div>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {order.items.map((item, idx) => <li key={idx}>{item.quantity}x {item.name}</li>)}
                    </ul>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-xl font-extrabold text-gray-900">${order.totalAmount.toFixed(2)}</p>
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
                <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{item.category}</span>
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-grow">{item.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-emerald-600">${item.price.toFixed(2)}</span>
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
    </div>
  );
};

export default CustomerDashboard;
