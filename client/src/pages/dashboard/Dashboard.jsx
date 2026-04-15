import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Helmet } from 'react-helmet-async';
import DashboardCard from '../../components/dashboard/DashboardCard.jsx';
import { ShoppingBag, DollarSign, UtensilsCrossed, TableProperties } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <Helmet>
        <title>Dashboard Overview | Resova E-Commerce</title>
        <meta name="description" content="View live analytics, active orders, total revenue, and connected e-commerce store metrics." />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Today's Orders" value={stats.ordersToday} icon={ShoppingBag} colorClass="bg-blue-500/10 text-blue-400" />
        <DashboardCard title="Today's Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} colorClass="bg-emerald-500/10 text-emerald-400" />
        <DashboardCard title="Menu Items" value={stats.totalMenuItems} icon={UtensilsCrossed} colorClass="bg-purple-500/10 text-purple-400" />
        <DashboardCard title="Active Tables" value={stats.activeTables} icon={TableProperties} colorClass="bg-amber-500/10 text-amber-400" />
      </div>
    </div>
  );
};
export default Dashboard;
