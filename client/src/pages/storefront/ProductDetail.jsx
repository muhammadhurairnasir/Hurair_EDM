import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Star, ShoppingBag, Truck, ShieldCheck, Heart } from 'lucide-react';
import api from '../../services/api.js';

const ProductDetail = () => {
  const { slug, productSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [slug, productSlug]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/menu/public/store/${slug}/item/${productSlug}`);
      setProduct(data.data.product);
      setReviews(data.data.reviews);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const addToCart = () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem(`cart_${slug}`)) || [];
      const existing = savedCart.find(i => i._id === product._id);
      if (existing) {
        existing.quantity += 1;
      } else {
        savedCart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem(`cart_${slug}`, JSON.stringify(savedCart));
      alert('Added to Cart!');
      navigate(`/store/${slug}`); // Navigate back to storefront to open cart
    } catch (error) {
      alert('Could not add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-100 py-4 px-6 fixed top-0 w-full bg-white z-40">
          <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
        </header>
        <main className="max-w-6xl mx-auto px-6 pt-24 pb-12">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/2">
              <div className="w-full h-[500px] bg-gray-100 rounded-3xl animate-pulse mb-4"></div>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="w-24 h-24 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6 pt-4">
              <div className="w-3/4 h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              <div className="w-1/4 h-4 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="w-full h-32 bg-gray-50 rounded-xl animate-pulse mt-8"></div>
              <div className="w-1/3 h-12 bg-gray-100 rounded-xl animate-pulse mt-8"></div>
              <div className="w-full h-16 bg-gray-100 rounded-2xl animate-pulse mt-8"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  const images = (product.images && product.images.length > 0) ? product.images : [
    `https://picsum.photos/seed/${product._id}/800/800`
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Helmet>
        <title>{product.seo?.title || product.name} | Store</title>
        <meta name="description" content={product.seo?.description || product.description} />
      </Helmet>

      {/* Header */}
      <header className="border-b border-gray-100 py-4 px-6 sticky top-0 bg-white z-40">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link to={`/store/${slug}`} className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div className="relative bg-gray-50 rounded-3xl overflow-hidden mb-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] group">
              <div className="absolute inset-0 bg-gray-900/5 group-hover:bg-gray-900/0 transition-colors z-10"></div>
              <img src={images[activeImage]} alt={product.name} className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-600' : 'border-transparent'}`}>
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">{product.brand || 'House Brand'}</p>
              <div className="flex items-center gap-4 mb-6 text-sm">
                <div className="flex items-center text-amber-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold ml-1 text-gray-900">4.8</span>
                  <span className="text-gray-500 ml-1">({reviews.length} reviews)</span>
                </div>
                <div className="text-gray-300">|</div>
                <span className={product.stock > 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="py-6 border-y border-gray-100 flex items-center justify-between mb-8">
              <span className="text-4xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
            </div>

            <div className="flex gap-4 mb-8">
              <button 
                onClick={addToCart} 
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold text-lg py-4 rounded-2xl transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 hover:-translate-y-1"
              >
                <ShoppingBag className="w-6 h-6" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 transition-colors flex flex-shrink-0 items-center justify-center border border-gray-200">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-900 bg-gradient-to-r from-orange-50 to-orange-100/50 p-5 rounded-2xl border border-orange-100">
                <Truck className="w-6 h-6 text-orange-500 flex-shrink-0" />
                <p className="text-sm"><strong className="font-bold">Fast Delivery.</strong> Usually ships within 24 hours.</p>
              </div>
              <div className="flex items-center gap-3 text-emerald-900 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <p className="text-sm"><strong className="font-bold">Secure Checkout.</strong> Your payment is entirely encrypted.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 pt-16 border-t border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500">
              No reviews yet. Be the first to review this!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {reviews.map(review => (
                <div key={review._id} className="bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-1 mb-2 text-amber-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                  </div>
                  <p className="text-gray-900 font-bold mb-1">{review.customerId?.name || 'Anonymous User'}</p>
                  <p className="text-gray-500 text-sm mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
