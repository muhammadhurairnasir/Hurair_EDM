import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Modal from '../../components/ui/Modal.jsx';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ number: '', seats: '' });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const { data } = await api.get('/tables');
      setTables(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tables', formData);
      setIsModalOpen(false);
      setFormData({ number: '', seats: '' });
      fetchTables();
    } catch (error) {
      console.error('Failed to add table', error);
      alert('Failed to add table');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tables</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium">
          Add Table
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => (
          <div key={table._id} className={`p-6 rounded-2xl flex flex-col justify-center items-center font-bold text-xl border ${table.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            T{table.number}
            <span className="text-xs font-normal opacity-70 mt-1">{table.seats} seats</span>
          </div>
        ))}
        {tables.length === 0 && <div className="text-gray-500 col-span-full">No tables found.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Table">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Table Number</label>
            <input 
              type="number" 
              required 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" 
              value={formData.number} 
              onChange={e => setFormData({...formData, number: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Number of Seats</label>
            <input 
              type="number" 
              required 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" 
              value={formData.seats} 
              onChange={e => setFormData({...formData, seats: e.target.value})} 
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-600 hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium">Save Table</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Tables;
