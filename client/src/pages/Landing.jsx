import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  UtensilsCrossed, CheckCircle2, ArrowRight, BarChart3, CreditCard, 
  Users, Settings, Star, Store, Smartphone, ShieldCheck, 
  Twitter, Facebook, Instagram, Linkedin, XCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const Landing = () => {
  const { user } = useAuth();
  
  const basicLink = user ? "/dashboard" : "/register?tier=basic";
  const standardLink = user ? "/subscriptions?upgrade=standard" : "/register?tier=standard";
  const premiumLink = user ? "/subscriptions?upgrade=premium" : "/register?tier=premium";

  return (
    <div className="min-h-screen bg-gray-900 text-white selection:bg-blue-500/30 font-sans">
      <Helmet>
        <title>Resova POS | The All-in-One Restaurant & Store Management System</title>
        <meta name="description" content="Manage your modern restaurant or e-commerce store with live analytics, powerful SEO configuration, and staff management seamlessly." />
        <meta name="keywords" content="Restaurant POS, E-commerce Dashboard, SaaS POS, Store Management, Online Ordering" />
      </Helmet>

      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-lg fixed w-full top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Resova
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</a>
            </div>
            <div className="flex gap-4 items-center">
              <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-600/20 to-transparent rounded-full blur-[100px] opacity-70"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mb-0.5 animate-pulse"></span>
            v2.0 is now live for all restaurants
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Manage your restaurant <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">without the chaos.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10 leading-relaxed">
            The all-in-one POS system designed for modern restaurants. Handle orders, configure menus, manage tables, and monitor staff reporting from one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 w-full sm:w-auto hover:scale-105">
              Start your free trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-xl text-lg font-bold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-all border border-gray-700 flex items-center justify-center w-full sm:w-auto">
              View live demo
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">No credit card required. 14-day free trial.</p>
        </div>
      </div>

      {/* Trusted By / Social Proof */}
      <div className="py-10 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-gray-500 tracking-widest uppercase mb-8">Trusted by 500+ innovative restaurants</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
            <h3 className="text-2xl font-bold font-serif">The Great Feast</h3>
            <h3 className="text-2xl font-bold font-mono tracking-tighter">PIZZA.CO</h3>
            <h3 className="text-2xl font-bold tracking-wide">BurgerJoint</h3>
            <h3 className="text-2xl font-bold italic">Bistro Elegance</h3>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div id="features" className="py-24 bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Everything you need to succeed</h2>
            <p className="text-xl text-gray-400">We've built a suite of professional tools designed specifically for speed, reliability, and ease of use during rush hour.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Live Analytics</h3>
              <p className="text-gray-400 leading-relaxed">Track revenue, monitor daily operations, and make data-driven decisions instantly with our zero-delay reporting engine.</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Staff Management</h3>
              <p className="text-gray-400 leading-relaxed">Assign roles to waiters, cashiers, and managers. Control access permissions seamlessly using robust Role-Based Access Control.</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Menu Engineering</h3>
              <p className="text-gray-400 leading-relaxed">Add, edit, categories, and toggle item availability on the fly. Keep your menu strictly up-to-date across all terminals.</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl hover:border-amber-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Store className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">E-Commerce Ready</h3>
              <p className="text-gray-400 leading-relaxed">Included Storefront SEO tools let you configure how your restaurant appears on search engines without learning to code.</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl hover:border-pink-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Any Device</h3>
              <p className="text-gray-400 leading-relaxed">Resova runs securely in the browser. Use it on iPads, Windows tablets, MacBooks, or specialized POS hardware.</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl hover:border-cyan-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Secure Data</h3>
              <p className="text-gray-400 leading-relaxed">All transaction history and customer analytics are protected by end-to-end encryption and enterprise cloud architecture.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="py-24 bg-gray-800/30 border-t border-gray-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Up and running in minutes</h2>
            <p className="text-xl text-gray-400">Leave the complex installations behind. Resova is cloud-native.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[20%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 -z-10 blur-[1px]"></div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">Register your Restaurant</h3>
              <p className="text-gray-400">Claim your account and enter your basic restaurant details. No credit card upfront.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold mb-3">Map & Menu</h3>
              <p className="text-gray-400">Digitize your physical floorplan into active tables and quickly input your core dishes.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold mb-3">Serve Customers</h3>
              <p className="text-gray-400">Start ringing up orders instantly. Resova automatically tallies revenue and metrics.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center">Loved by Owners Worldwide</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="flex text-amber-400 mb-4 gap-1">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-gray-300 mb-6 italic">"Resova cut down our ordering friction immensely. The interface is intuitive enough that new waitstaff pick it up in an hour."</p>
                <div>
                  <h4 className="font-bold text-white">— Sarah Jenkins</h4>
                  <p className="text-sm text-gray-500">Owner, The Great Feast</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="flex text-amber-400 mb-4 gap-1">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-gray-300 mb-6 italic">"The real-time analytics let me see which days are underperforming without crunching spreadsheets. Life saver for a SaaS POS."</p>
                <div>
                  <h4 className="font-bold text-white">— Mark D.</h4>
                  <p className="text-sm text-gray-500">Manager, BurgerJoint</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="flex text-amber-400 mb-4 gap-1">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-gray-300 mb-6 italic">"The UI is gorgeous, and everything simply works. Role-based access means cashiers can't break settings."</p>
                <div>
                  <h4 className="font-bold text-white">— Emily R.</h4>
                  <p className="text-sm text-gray-500">Director, Bistro Elegance</p>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-400">Start for free, then choose a plan that correctly fits your size.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Basic Tier */}
            <div className="bg-gray-800/80 border border-gray-700 rounded-3xl p-8 flex flex-col hover:border-gray-500 transition-colors">
              <h3 className="text-xl font-bold text-gray-300 mb-2">Basic</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">$29</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-gray-300 items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Menu Management</li>
                <li className="flex gap-3 text-gray-300 items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Point of Sale UI</li>
                <li className="flex gap-3 text-gray-500 items-center opacity-50"><XCircle className="w-5 h-5 text-red-500 hidden"/> Single Staff Account</li>
              </ul>
              <Link to={basicLink} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-colors text-center">Get Started</Link>
            </div>
            
            {/* Standard Tier */}
            <div className="bg-gradient-to-b from-blue-900 to-gray-800 border-2 border-blue-500 rounded-3xl p-10 flex flex-col relative shadow-[0_0_40px_rgba(37,99,235,0.2)] z-10 scale-100 md:scale-105">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Most Popular</span>
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-2">Standard</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-6xl font-extrabold text-white">$79</span>
                <span className="text-blue-200/50">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-white items-center"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> Everything in Basic</li>
                <li className="flex gap-3 text-white items-center"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> Live Dashboards</li>
                <li className="flex gap-3 text-white items-center"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> Table Operations</li>
                <li className="flex gap-3 text-white items-center"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> Multiple Staff Roles</li>
              </ul>
              <Link to={standardLink} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors text-center shadow-lg">Start Free Trial</Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-gray-800/80 border border-gray-700 rounded-3xl p-8 flex flex-col hover:border-gray-500 transition-colors">
              <h3 className="text-xl font-bold text-purple-400 mb-2">Premium</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">$149</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-gray-300 items-center"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" /> Everything in Standard</li>
                <li className="flex gap-3 text-gray-300 items-center"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" /> Storefront SEO Settings</li>
                <li className="flex gap-3 text-gray-300 items-center"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" /> Financial Reporting</li>
              </ul>
              <Link to={premiumLink} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-colors text-center">Subscribe Now</Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-600"></div>
         <div className="absolute -inset-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
         <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your restaurant?</h2>
           <p className="text-blue-100 text-xl mb-10">Join the thousands of businesses running smoothly with Resova.</p>
           <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl shadow-black/20">
             Create your Free Account
           </Link>
         </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold text-white">Resova</span>
              </div>
              <p className="text-gray-400 text-sm max-w-sm mb-6">
                The all-in-one platform for restaurant and e-commerce growth. Stop fighting your systems and start serving your customers.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Point of Sale</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Kitchen Display</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Staff Scheduling</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2026 Resova SaaS. All rights reserved.</p>
            <div className="flex gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
               <span className="text-xs text-gray-400">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
