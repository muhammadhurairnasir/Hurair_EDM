import { Clock } from 'lucide-react';

const OrderCard = ({ order, onStatusChange }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs text-gray-400 flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" />
            {new Date(order.createdAt).toLocaleTimeString()}
          </span>
          <h4 className="font-semibold text-gray-200">Order #{order._id.substring(order._id.length - 6)}</h4>
        </div>
        <select
          value={order.status}
          onChange={(e) => onStatusChange(order._id, e.target.value)}
          className={`text-sm px-3 py-1 rounded-full border outline-none font-medium ${
            order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
            'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          <option value="pending" className="bg-gray-800">Pending</option>
          <option value="shipped" className="bg-gray-800">Shipped</option>
          <option value="delivered" className="bg-gray-800">Delivered</option>
          <option value="cancelled" className="bg-gray-800">Cancelled</option>
        </select>
      </div>
      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm text-gray-300">
            <span>{item.quantity}x {item.name || 'Item'}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-gray-700 flex justify-between items-center font-bold">
        <span className="text-gray-400">Total</span>
        <span className="text-blue-400">${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderCard;
