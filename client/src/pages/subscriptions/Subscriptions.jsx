import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../services/api.js';
import StripeCheckoutForm from '../../components/storefront/StripeCheckoutForm.jsx'; // Reuse the card form component

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Subscriptions = () => {
  const [sub, setSub] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const upgradeTarget = searchParams.get('upgrade');
  
  const [clientSecret, setClientSecret] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSub();
  }, []);

  useEffect(() => {
    if (upgradeTarget && sub) {
      handleUpgradeInitiate(upgradeTarget);
    }
  }, [upgradeTarget, sub]);

  const fetchSub = async () => {
    try {
      const { data } = await api.get('/subscriptions');
      setSub(data.data);
    } catch (error) {}
  };

  const handleUpgradeInitiate = async (plan) => {
    if (sub?.plan?.toLowerCase() === plan.toLowerCase()) return; // Already on this plan
    setSelectedPlan(plan);
    setIsUpgrading(true);
    try {
      const { data } = await api.post('/payments/saas-payment-intent', { plan });
      setClientSecret(data.data.clientSecret);
    } catch (error) {
      console.error('Failed to init SaaS upgrade', error);
      setIsUpgrading(false);
    }
  };

  const handleUpgradeSuccess = async () => {
    try {
      await api.put('/subscriptions', { plan: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) });
      setIsUpgrading(false);
      setSuccess(true);
      fetchSub();
      // Remove query param
      setSearchParams({});
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to finalize subscription', error);
    }
  };

  const stripeOptions = { appearance: { theme: 'stripe' } };

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet>
        <title>SaaS Subscription | Resova POS</title>
      </Helmet>

      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-blue-600" /> Billing & Subscriptions
      </h1>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl font-medium flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-6 h-6" /> Platform Upgrade Successful! Welcome to the {sub?.plan} tier.
        </div>
      )}

      {!isUpgrading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Plan Overview */}
          <div className="bg-gray-800 border border-gray-700 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wide">Your Active Plan</h2>
              <div className="text-5xl font-extrabold mb-6 capitalize">{sub ? sub.plan : '...'}</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Active Platform Access</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400" /> POS System Authorized</li>
                {sub?.plan !== 'Basic' && <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Advanced Limits Unlocked</li>}
              </ul>
            </div>
            <div className="pt-6 border-t border-gray-700 flex justify-between items-center bg-gray-900/50 p-4 rounded-xl">
              <span className="text-gray-400">Account Standing</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Secure
              </span>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-gray-800 mb-4 px-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> Available Upgrades
            </h3>
            
            {['Standard', 'Premium'].map(tier => {
               if (sub?.plan === tier) return null; // hide if active
               const cost = tier === 'Standard' ? 79 : 149;
               return (
                 <div key={tier} className="bg-white border-2 border-transparent hover:border-blue-500 transition-colors p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   <div>
                     <h4 className="font-bold text-lg text-gray-900">{tier} License</h4>
                     <p className="text-gray-500 text-sm mt-1">Unlock advanced restaurant capabilities.</p>
                   </div>
                   <div className="flex items-center gap-4 w-full sm:w-auto">
                     <span className="text-2xl font-extrabold text-blue-600">${cost}</span>
                     <button 
                       onClick={() => handleUpgradeInitiate(tier)}
                       className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/30 w-full sm:w-auto"
                     >
                       Upgrade
                     </button>
                   </div>
                 </div>
               )
            })}
          </div>
        </div>
      ) : (
        /* Stripe Checkout Interface */
        <div className="max-w-xl mx-auto mt-4 animate-in fade-in zoom-in-95">
           <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
               <div>
                  <h3 className="text-2xl font-bold text-gray-900 capitalize">Upgrade to {selectedPlan}</h3>
                  <p className="text-gray-500 text-sm mt-1">Complete your one-time SaaS upgrade payment.</p>
               </div>
               <div className="text-3xl font-extrabold text-blue-600">
                 ${selectedPlan.toLowerCase() === 'standard' ? '79' : '149'}
               </div>
             </div>

             {clientSecret ? (
               <Elements stripe={stripePromise} options={stripeOptions}>
                 {/* Re-using the same StripeCheckoutForm built for E-Commerce, but feeding it B2B success logic! */}
                 <StripeCheckoutForm clientSecret={clientSecret} onSuccess={handleUpgradeSuccess} />
                 
                 <button 
                  onClick={() => {
                    setIsUpgrading(false);
                    setClientSecret(null);
                    setSearchParams({});
                  }}
                  className="mt-6 w-full py-3 text-gray-500 hover:text-gray-700 font-medium tracking-wide"
                 >
                   Cancel Upgrade
                 </button>
               </Elements>
             ) : (
               <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                 Initializing secure payment gateway...
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};
export default Subscriptions;
