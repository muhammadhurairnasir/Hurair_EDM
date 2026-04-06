import { Edit2, Trash2 } from 'lucide-react';

const MenuItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-lg text-gray-100">{item.name}</h4>
        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg text-sm border border-emerald-500/20">${item.price.toFixed(2)}</span>
      </div>
      <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 inline-block mb-3">{item.category}</span>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">{item.description}</p>
      
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-700 opacity-60 group-hover:opacity-100 transition-opacity">
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${item.availability ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {item.availability ? 'Available' : 'Unavailable'}
        </span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(item._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
