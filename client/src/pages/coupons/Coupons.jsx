import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api.js';
import Modal from '../../components/ui/Modal.jsx';
import { Tag, Trash2, Edit2 } from 'lucide-react';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0,
    validFrom: '', validUntil: '', usageLimit: '', isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this coupon?')) {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        isActive: formData.isActive
      };

      if (editId) {
        await api.put(`/coupons/${editId}`, payload);
      } else {
        await api.post('/coupons', payload);
      }
      closeModal();
      fetchCoupons();
    } catch (error) {
      console.error('Failed to save coupon', error);
      alert('Failed to save coupon');
    }
  };

  const openEditModal = (coupon) => {
    setEditId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, validFrom: '', validUntil: '', usageLimit: '', isActive: true });
  };

  return (
    <div>
      <Helmet>
        <title>Coupons | Resova Admin</title>
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium">
          Add Coupon
        </button>
      </div>
      <div className="bg-gray-800 rounded-2xl shadow overflow-hidden border border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-700">
              <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Code</th>
              <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Discount</th>
              <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Valid Until</th>
              <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Status</th>
              <th className="py-3 px-4 text-gray-400 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-3 px-4">
                  <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-1 rounded border border-blue-500/30 font-mono tracking-wide">
                    {coupon.code}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-200">
                  {coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '$' + coupon.discountValue.toFixed(2)} off
                </td>
                <td className="py-3 px-4 text-gray-400 text-sm">
                  {new Date(coupon.validUntil).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => openEditModal(coupon)} className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors mr-2">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(coupon._id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <div className="text-center py-6 text-gray-500">No coupons found.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editId ? "Edit Coupon" : "Add Coupon"}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Coupon Code</label>
            <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none uppercase font-mono" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Value</label>
              <input type="number" required className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Valid From</label>
              <input type="datetime-local" required className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Valid Until</label>
              <input type="datetime-local" required className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Min Order Value</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Usage Limit (Optional)</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-gray-700 bg-gray-900 focus:ring-blue-500" />
            <label htmlFor="isActive" className="text-sm text-gray-300 font-medium">Coupon is active</label>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-700">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border border-gray-600 hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium">
              {editId ? 'Update Coupon' : 'Save Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Coupons;
