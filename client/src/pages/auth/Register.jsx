import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { UtensilsCrossed } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    restaurantName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tierUrlParam = searchParams.get('tier');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.restaurantName);
      if (tierUrlParam === 'standard' || tierUrlParam === 'premium') {
        navigate(`/subscriptions?upgrade=${tierUrlParam}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
            <UtensilsCrossed className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Register Restaurant</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
            <input
              type="text" required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Restaurant Name</label>
            <input
              type="text" required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={formData.restaurantName} onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email" required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password" required minLength="6"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account? <Link to={`/login${tierUrlParam ? `?tier=${tierUrlParam}` : ''}`} className="text-blue-400 hover:text-blue-300 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
