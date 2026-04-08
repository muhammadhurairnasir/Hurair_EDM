import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Landing from '../pages/Landing.jsx';
import ECommerceDashboard from '../pages/ecommerce/ECommerceDashboard.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

import Dashboard from '../pages/dashboard/Dashboard.jsx';
import Orders from '../pages/orders/Orders.jsx';
import Menu from '../pages/menu/Menu.jsx';
import Tables from '../pages/tables/Tables.jsx';
import Staff from '../pages/staff/Staff.jsx';
import Subscriptions from '../pages/subscriptions/Subscriptions.jsx';
import Settings from '../pages/settings/Settings.jsx';
import CustomerCRM from '../pages/customers/CustomerCRM.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import Storefront from '../pages/storefront/Storefront.jsx';
import CustomerAuth from '../pages/storefront/CustomerAuth.jsx';
import CustomerDashboard from '../pages/storefront/CustomerDashboard.jsx';
import ProductDetail from '../pages/storefront/ProductDetail.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/store/:slug" element={<Storefront />} />
      <Route path="/store/:slug/item/:productSlug" element={<ProductDetail />} />
      <Route path="/store/:slug/login" element={<CustomerAuth />} />
      <Route path="/store/:slug/dashboard" element={<CustomerDashboard />} />
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute allowedRoles={['restaurant_owner']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/customers" element={<CustomerCRM />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['system_admin']} />}>
          <Route path="/store" element={<ECommerceDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['system_admin', 'restaurant_owner']} />}>
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
