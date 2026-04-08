import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, CreditCard, Settings, TableProperties, Store, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const allNavItems = [
    { name: 'POS Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['restaurant_owner'] },
    { name: 'SaaS Overview', path: '/store', icon: Store, roles: ['system_admin'] },
    { name: 'Orders', path: '/orders', icon: ShoppingBag, roles: ['restaurant_owner'] },
    { name: 'Menu', path: '/menu', icon: UtensilsCrossed, roles: ['restaurant_owner'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['restaurant_owner'] },
    { name: 'Tables', path: '/tables', icon: TableProperties, roles: ['restaurant_owner'] },
    { name: 'Staff', path: '/staff', icon: Users, roles: ['restaurant_owner'] },
    { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard, roles: ['restaurant_owner'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['system_admin', 'restaurant_owner'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 h-full hidden md:flex flex-col flex-shrink-0">
      <div className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* View My Store — one-click shortcut for restaurant owners */}
      {role === 'restaurant_owner' && user?.restaurantId && (
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <a
            href={`/store/${user.restaurantId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 transition-all w-full"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="font-medium">View My Store</span>
          </a>
          <p className="text-xs text-gray-600 mt-2 px-1 break-all select-all">
            ID: {user.restaurantId}
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
