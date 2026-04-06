import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Modal from '../../components/ui/Modal.jsx';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'waiter', phone: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/staff');
      setStaff(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', formData);
      setIsModalOpen(false);
      setFormData({ name: '', role: 'waiter', phone: '' });
      fetchStaff();
    } catch (error) {
      console.error('Failed to add staff', error);
      alert('Failed to add staff');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium">
          Add Staff
        </button>
      </div>
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50 border-b border-gray-700">
              <th className="p-4 text-gray-400 font-medium text-sm">Name</th>
              <th className="p-4 text-gray-400 font-medium text-sm">Role</th>
              <th className="p-4 text-gray-400 font-medium text-sm">Phone</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s._id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                <td className="p-4 font-medium text-gray-200">{s.name}</td>
                <td className="p-4 text-blue-400"><span className="bg-blue-500/10 px-2.5 py-1 rounded-lg text-xs font-semibold">{s.role}</span></td>
                <td className="p-4 text-gray-400">{s.phone || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && <div className="p-6 text-center text-gray-500">No staff members found.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Staff">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
             <select 
               className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
               value={formData.role}
               onChange={e => setFormData({...formData, role: e.target.value})}
             >
               <option value="waiter">Waiter</option>
               <option value="cashier">Cashier</option>
               <option value="manager">Manager</option>
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
            <input 
              type="text" 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-600 hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium">Save Staff</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Staff;
