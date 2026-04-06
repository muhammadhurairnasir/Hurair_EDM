import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col overflow-hidden text-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
