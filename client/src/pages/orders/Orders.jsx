import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import OrderCard from '../../components/orders/OrderCard.jsx';
import Modal from '../../components/ui/Modal.jsx';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  const [formData, setFormData] = useState({ tableId: '', items: [] });
  const [selectedItem, setSelectedItem] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const openNewOrderModal = async () => {
    setIsModalOpen(true);
    try {
      const [tablesRes, menuRes] = await Promise.all([
        api.get('/tables'),
        api.get('/products')
      ]);
      setTables(tablesRes.data.data.filter(t => t.status === 'available'));
      setMenuItems(menuRes.data.data);
      if (tablesRes.data.data.length > 0) {
        setFormData({ ...formData, tableId: tablesRes.data.data.find(t => t.status === 'available')?._id || '' });
      }
      if (menuRes.data.data.length > 0) {
        setSelectedItem(menuRes.data.data[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddItem = () => {
    if (!selectedItem) return;
    const item = menuItems.find(m => m._id === selectedItem);
    const existing = formData.items.find(i => i.product === selectedItem);
    
    let updatedItems;
    if (existing) {
      updatedItems = formData.items.map(i => i.product === selectedItem ? { ...i, quantity: i.quantity + Number(itemQuantity) } : i);
    } else {
      updatedItems = [...formData.items, { product: item._id, name: item.name, price: item.price, quantity: Number(itemQuantity) }];
    }
    setFormData({ ...formData, items: updatedItems });
  };

  const handleRemoveItem = (id) => {
    setFormData({ ...formData, items: formData.items.filter(i => i.product !== id) });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Add at least one item');
    
    try {
      const totalAmount = formData.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      await api.post('/orders', { 
        tableId: formData.tableId || null, 
        items: formData.items,
        totalAmount,
        status: 'Preparing'
      });
      setIsModalOpen(false);
      setFormData({ tableId: '', items: [] });
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert('Failed to place order');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button 
          onClick={openNewOrderModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium">
          New Order
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
        ))}
        {orders.length === 0 && <div className="text-gray-500">No orders found.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Order">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Assign Table (Optional)</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
              value={formData.tableId}
              onChange={e => setFormData({...formData, tableId: e.target.value})}
            >
              <option value="">-- No Table (Takeaway) --</option>
              {tables.map(t => <option key={t._id} value={t._id}>Table {t.number} ({t.seats} seats)</option>)}
            </select>
          </div>

          <div className="p-4 bg-gray-900 border border-gray-700 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Add Order Items</h3>
            <div className="flex gap-2 mb-3">
              <select 
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm outline-none"
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value)}
              >
                {menuItems.map(m => <option key={m._id} value={m._id}>{m.name} (${m.price})</option>)}
              </select>
              <input 
                type="number" 
                min="1" 
                value={itemQuantity}
                onChange={e => setItemQuantity(e.target.value)}
                className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm outline-none text-center" 
              />
              <button type="button" onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium">Add</button>
            </div>
            
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {formData.items.map(item => (
                <li key={item.product} className="flex justify-between items-center text-sm bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <span className="truncate">{item.quantity}x {item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => handleRemoveItem(item.product)} className="text-red-400 hover:text-red-300">✕</button>
                  </div>
                </li>
              ))}
              {formData.items.length === 0 && <p className="text-xs text-gray-500 text-center py-2">No items added to order.</p>}
            </ul>
          </div>
          
          <div className="pt-2 flex justify-end gap-3 border-t border-gray-700">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mt-4 rounded-xl border border-gray-600 hover:bg-gray-700">Cancel</button>
            <button type="button" onClick={handleAddSubmit} className="px-4 py-2 mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium disabled:opacity-50">Place Order</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Orders;
