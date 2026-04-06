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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/system/stats');
        if (data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching system stats:', error);
      }
    };
    fetchStats();
  }, []);

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
    </div>
  );
};
export default ECommerceDashboard;
