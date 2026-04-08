import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../services/api.js';

const CustomerCRM = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/dashboard/customers');
      setCustomers(data.data);
    } catch (error) {
      console.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer CRM</h1>
          <p className="text-gray-500 mt-1">View users who have registered and ordered from your store.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span>Total Customers: {customers.length}</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading CRM data...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Customers Yet</h3>
            <p className="text-gray-500">When people place orders under registered accounts, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 text-sm">
                {customers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" /> {user.email}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400" /> {user.phone || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap align-middle">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCRM;
