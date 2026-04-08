import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store, Tag, MousePointerClick, TrendingUp, Users, DollarSign, Database } from 'lucide-react';
import DashboardCard from '../../components/dashboard/DashboardCard.jsx';
import api from '../../services/api.js';

const ECommerceDashboard = () => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalUsers: 0,
    totalOrders: 0,
    monthlyRecurringRevenue: 0
  });
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/system/stats');
        if (data.data) setStats(data.data);
      } catch (error) { console.error('Error fetching stats:', error); }
    };
    const fetchSubs = async () => {
      try {
        const { data } = await api.get('/system/subscriptions');
        if (data.data) setSubscriptions(data.data);
      } catch (error) { console.error('Error fetching subs:', error); }
    }
    fetchStats();
    fetchSubs();
  }, []);

  const handleUpdatePlan = async (subId, newPlan) => {
    if(!confirm(`Force update this subscription to ${newPlan}?`)) return;
    try {
      await api.put(`/system/subscriptions/${subId}`, { plan: newPlan });
      setSubscriptions(subs => subs.map(s => s._id === subId ? { ...s, plan: newPlan } : s));
      alert('Subscription forcibly updated.');
    } catch {
      alert('Failed to update subscription.');
    }
  };

  return (
    <div>
      <Helmet>
        <title>E-Commerce Storefront Config | Resova POS</title>
        <meta name="description" content="Configure your e-commerce storefront details, global SEO parameters, and search engine appearance." />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-400" /> SaaS Overview & Settings
        </h1>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium">Save Settings</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Restaurants" value={stats.totalRestaurants.toLocaleString()} icon={Store} colorClass="bg-blue-500/10 text-blue-400" />
        <DashboardCard title="Total POS Users" value={stats.totalUsers.toLocaleString()} icon={Users} colorClass="bg-purple-500/10 text-purple-400" />
        <DashboardCard title="Total Platform Orders" value={stats.totalOrders.toLocaleString()} icon={TrendingUp} colorClass="bg-emerald-500/10 text-emerald-400" />
        <DashboardCard title="SaaS MRR" value={`$${stats.monthlyRecurringRevenue.toLocaleString()}`} icon={DollarSign} colorClass="bg-amber-500/10 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Storefront SEO Config</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Store Name (Title Tag)</label>
              <input type="text" defaultValue="The Great Feast - Order Online" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Global Meta Description</label>
              <textarea rows="3" defaultValue="Order online from The Great Feast. We offer the best truffle burgers and hand-crafted salads in Foodville. Fast delivery to your door." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Default Fallback Keywords</label>
              <input type="text" defaultValue="food delivery, foodville restaurant, best burger, salad, dinner" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </form>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
           <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Search Preview</h3>
           <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 font-sans">
             <div className="flex gap-2 text-sm text-gray-400 mb-1">
               <span className="truncate max-w-xs block">https://store.thegreatfeast.com</span>
             </div>
             <h4 className="text-[#8ab4f8] text-xl font-medium mb-1 cursor-pointer hover:underline">The Great Feast - Order Online</h4>
             <p className="text-[#bdc1c6] text-sm leading-snug">Order online from The Great Feast. We offer the best truffle burgers and hand-crafted salads in Foodville. Fast delivery to your door.</p>
           </div>
           
           <div className="mt-6">
             <h4 className="font-semibold text-gray-300 mb-2">Item-Level SEO overrides</h4>
             <p className="text-sm text-gray-400">All Menu items automatically generate optimized slugs based on their names. You can modify their exact {'<title>'} and {'<meta name="description">'} inside the Menu Item editor to target long-tail keywords better.</p>
           </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 flex items-center justify-between">
          <span>Global POS Subscriptions</span>
          <span className="text-xs font-normal text-gray-400 bg-gray-900 px-3 py-1 rounded-full">{subscriptions.length} active tenants</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="py-3 px-4 font-semibold">Restaurant Name</th>
                <th className="py-3 px-4 font-semibold">Storefront SEO Slug</th>
                <th className="py-3 px-4 font-semibold">Current Plan</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semiboldtext-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <tr key={sub._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-200">{sub.restaurantId?.name || 'Unknown'}</td>
                  <td className="py-4 px-4 text-blue-400 text-sm">/store/{sub.restaurantId?.seo?.slug || 'unknown'}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${sub.plan === 'Premium' ? 'bg-purple-500/20 text-purple-400' : sub.plan === 'Standard' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 flex items-center gap-1 py-1 rounded-full text-xs font-bold w-max ${sub.status === 'active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      <div className={`w-2 h-2 rounded-full ${sub.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <select 
                      className="bg-gray-900 border border-gray-600 text-sm rounded-lg px-2 py-1 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      value={sub.plan}
                      onChange={(e) => handleUpdatePlan(sub._id, e.target.value)}
                    >
                      <option value="Basic">Force Basic</option>
                      <option value="Standard">Force Standard</option>
                      <option value="Premium">Force Premium</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscriptions.length === 0 && <p className="text-gray-400 text-center py-6">No active subscriptions found in the platform.</p>}
        </div>
      </div>
    </div>
  );
};
export default ECommerceDashboard;
