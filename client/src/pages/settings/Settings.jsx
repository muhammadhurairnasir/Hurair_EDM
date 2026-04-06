import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', password: '' });
  const [restaurant, setRestaurant] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.data) {
          setProfile({ name: data.data.user.name, email: data.data.user.email, password: '' });
          if (data.data.restaurant) {
            setRestaurant({
              name: data.data.restaurant.name || '',
              address: data.data.restaurant.address || '',
              phone: data.data.restaurant.phone || ''
            });
          }
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = { ...profile };
      if (!payload.password) delete payload.password; // Don't submit empty string password
      await api.put('/settings/profile', payload);
      setMessage('Profile settings saved successfully.');
      setProfile(prev => ({ ...prev, password: '' })); // clear password input
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to update profile'}`);
    }
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.put('/settings/restaurant', restaurant);
      setMessage('Business settings saved successfully.');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to update business settings'}`);
    }
  };

  if (loading) return <div className="text-gray-400 p-8">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <Helmet>
        <title>Settings | Resova POS</title>
      </Helmet>

      <h1 className="text-3xl font-extrabold mb-8 text-white">Settings</h1>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl border flex items-center gap-2 ${message.startsWith('Error') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
          {!message.startsWith('Error') && <CheckCircle2 className="w-5 h-5" />}
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-sm">
          <div className="border-b border-gray-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Account Profile</h2>
              <p className="text-gray-400 text-sm mt-1">Update your login credentials and personal details.</p>
            </div>
            <button onClick={handleProfileSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20">
              Save Profile
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password (leave blank to keep current)</label>
                <input type="password" placeholder="••••••••" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
            </form>
          </div>
        </div>

        {/* Business Settings */}
        {user?.role === 'restaurant_owner' && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-sm">
            <div className="border-b border-gray-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Store className="w-5 h-5 text-emerald-400" /> Business Details</h2>
                <p className="text-gray-400 text-sm mt-1">Configure your physical restaurant address and primary contact.</p>
              </div>
              <button onClick={handleBusinessSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20">
                Save Business
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleBusinessSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Restaurant/Store Name</label>
                  <input type="text" value={restaurant.name} onChange={e => setRestaurant({...restaurant, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Physical Address</label>
                   <textarea rows="3" value={restaurant.address} onChange={e => setRestaurant({...restaurant, address: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="123 Main St, Foodville, NY"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Phone</label>
                  <input type="text" value={restaurant.phone} onChange={e => setRestaurant({...restaurant, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="(555) 123-4567" />
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default Settings;
