import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

import Dashboard from '../pages/dashboard/Dashboard.jsx';
import Orders from '../pages/orders/Orders.jsx';
import Menu from '../pages/menu/Menu.jsx';
import Tables from '../pages/tables/Tables.jsx';
import Staff from '../pages/staff/Staff.jsx';
import Settings from '../pages/settings/Settings.jsx';
import CustomerCRM from '../pages/customers/CustomerCRM.jsx';
import Coupons from '../pages/coupons/Coupons.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import Storefront from '../pages/storefront/Storefront.jsx';
import CustomerAuth from '../pages/storefront/CustomerAuth.jsx';
import CustomerDashboard from '../pages/storefront/CustomerDashboard.jsx';
import ProductDetail from '../pages/storefront/ProductDetail.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Primary E-Commerce Storefront Routes */}
      <Route path="/" element={<Storefront />} />
      <Route path="/item/:productSlug" element={<ProductDetail />} />
      <Route path="/customer/login" element={<CustomerAuth />} />
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      
      {/* Resova Admin Back-Office */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute allowedRoles={['restaurant_owner', 'system_admin']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/customers" element={<CustomerCRM />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
