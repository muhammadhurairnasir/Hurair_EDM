import { useAuth } from '../../hooks/useAuth.js';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 p-4 shrink-0 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
        Restaurant SaaS
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-300">
          <User className="w-5 h-5 text-blue-400"/>
          <span className="font-medium">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-300 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
