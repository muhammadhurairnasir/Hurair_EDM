import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api.js';
import MenuItemCard from '../../components/menu/MenuItemCard.jsx';
import Modal from '../../components/ui/Modal.jsx';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', price: '', category: 'Mains', description: '',
    brand: '', stock: 100, images: '',
    seoTitle: '', seoDescription: '', seoKeywords: ''
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const { data } = await api.get('/products');
      setItems(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      await api.delete(`/products/${id}`);
      fetchMenu();
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        brand: formData.brand,
        stock: Number(formData.stock),
        images: formData.images ? formData.images.split(',').map(i => i.trim()) : [],
        seo: {
          title: formData.seoTitle,
          description: formData.seoDescription,
          keywords: formData.seoKeywords ? formData.seoKeywords.split(',').map(k => k.trim()) : [],
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }
      };

      if (editId) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      closeModal();
      fetchMenu();
    } catch (error) {
      console.error('Failed to save menu item', error);
      alert('Failed to save menu item');
    }
  };

  const openEditModal = (item) => {
    setEditId(item._id);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category || 'Mains',
      description: item.description || '',
      brand: item.brand || '',
      stock: item.stock ?? 100,
      images: item.images ? item.images.join(', ') : '',
      seoTitle: item.seo?.title || '',
      seoDescription: item.seo?.description || '',
      seoKeywords: item.seo?.keywords ? item.seo?.keywords.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: '', price: '', category: 'Mains', description: '', brand: '', stock: 100, images: '', seoTitle: '', seoDescription: '', seoKeywords: '' });
  };

  return (
    <div>
      <Helmet>
        <title>Products & Inventory | Resova E-commerce</title>
        <meta name="description" content="Manage availability, edit prices, and configure on-page SEO fields for all your e-commerce inventory items quickly and efficiently." />
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium">
          Add Product
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <MenuItemCard key={item._id} item={item} onEdit={() => openEditModal(item)} onDelete={handleDelete} />
        ))}
        {items.length === 0 && <div className="text-gray-500">No menu items found.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editId ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Item Name</label>
            <input 
              type="text" 
              required 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
            <input 
              type="number" 
              step="0.01"
              required 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Starters">Starters</option>
              <option value="Mains">Mains</option>
              <option value="Desserts">Desserts</option>
              <option value="Drinks">Drinks</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none resize-none" 
              rows="3"
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Brand</label>
              <input type="text" placeholder="e.g. Nike" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Stock</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Images (Comma Separated URLs)</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-2">
            <h3 className="text-sm font-bold text-gray-300 mb-3 tracking-wide uppercase">Storefront SEO Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SEO Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Delicious Homemade Burger"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm" 
                  value={formData.seoTitle} 
                  onChange={e => setFormData({...formData, seoTitle: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Meta Description</label>
                <textarea 
                  placeholder="A short engaging description for search engines."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-sm" 
                  rows="2"
                  value={formData.seoDescription} 
                  onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Keywords (Comma Separated)</label>
                <input 
                  type="text" 
                  placeholder="burger, fast food, cheese"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm" 
                  value={formData.seoKeywords} 
                  onChange={e => setFormData({...formData, seoKeywords: e.target.value})} 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border border-gray-600 hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium">
              {editId ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Menu;
