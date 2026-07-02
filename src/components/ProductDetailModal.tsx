import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingCart, ShieldCheck, Truck, RotateCcw, Star, Package, Check, Sparkles, ClipboardList, ThumbsUp, MessageSquare } from 'lucide-react';
import { Product } from '../types';
import StorageConfigurator from './Molecules/StorageConfigurator';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, addOns: { storage?: string; warranty?: boolean }) => void;
}

type ModalTab = 'configure' | 'specs' | 'reviews';

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('configure');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]);
  const [selectedStorage, setSelectedStorage] = useState<string>(
    product.category === 'Laptops' ? '512GB' : (product.category === 'Phones' || product.category === 'Tablets' ? '128GB' : '')
  );
  const [includeWarranty, setIncludeWarranty] = useState<boolean>(false);
  const [likedReviews, setLikedReviews] = useState<Record<number, boolean>>({});

  const isNepalMarket = true;
  const convertToNPR = (usd: number) => Math.round(usd * 134);
  const formatPrice = (usd: number) => {
    if (isNepalMarket) {
      return `रू ${convertToNPR(usd).toLocaleString('en-NP')}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  // Compute final price depending on selections
  const finalPrice = useMemo(() => {
    let price = product.price;
    if (product.category === 'Laptops') {
      if (selectedStorage === '1TB') price += 150;
      if (selectedStorage === '2TB') price += 300;
    } else {
      if (selectedStorage === '256GB') price += 100;
      if (selectedStorage === '512GB') price += 250;
    }
    if (includeWarranty) price += 49;
    return price;
  }, [product.price, product.category, selectedStorage, includeWarranty]);

  // Map color names to modern CSS hex values for visual accuracy
  const getColorHex = (colName: string) => {
    const col = colName.toLowerCase();
    if (col.includes('white')) return '#F9FAFB';
    if (col.includes('black') || col.includes('graphite') || col.includes('dark')) return '#1E293B';
    if (col.includes('silver')) return '#CBD5E1';
    if (col.includes('gray') || col.includes('titanium')) return '#64748B';
    if (col.includes('gold')) return '#F59E0B';
    if (col.includes('yellow')) return '#FBBF24';
    if (col.includes('blue') || col.includes('sky')) return '#3B82F6';
    if (col.includes('mint') || col.includes('green')) return '#10B981';
    if (col.includes('rose') || col.includes('pink')) return '#EC4899';
    if (col.includes('orange')) return '#F97316';
    return '#6366F1'; // Default Indigo
  };

  const reviews = useMemo(() => {
    if (product.tier === 'budget') {
      return [
        { author: 'Marcus K.', rating: 5, comment: 'Phenomenal value. The battery easily lasts me 2 full days of constant use. Screen is sharp and colorful.', date: '3 weeks ago', verified: true, helpful: 24 },
        { author: 'Sarah T.', rating: 4, comment: 'Very practical purchase. Good speakers, runs all my apps smoothly. Only thing missing is wireless charging, but for this price, it is an absolute steal.', date: '1 month ago', verified: true, helpful: 12 },
      ];
    } else if (product.tier === 'balanced') {
      return [
        { author: 'David L.', rating: 5, comment: 'The absolute sweet spot of tech! Excellent Active Noise Canceling and soundstage. I would highly recommend this over more expensive options.', date: '1 week ago', verified: true, helpful: 42 },
        { author: 'Elena R.', rating: 5, comment: 'Outstanding performance. Fast, beautiful build, and is exactly what I needed for work and gym. Fits perfectly.', date: '2 weeks ago', verified: true, helpful: 19 },
      ];
    } else {
      return [
        { author: 'Arthur V.', rating: 5, comment: 'Mind-blowing craftsmanship. The titanium construction feels so solid yet lightweight. Incredible zoom lens. Worth every single penny.', date: '3 days ago', verified: true, helpful: 56 },
        { author: 'Sophia M.', rating: 5, comment: 'An absolute masterpiece of audio and design. The acoustic depth is unmatched. A proper premium flagship product.', date: '5 days ago', verified: true, helpful: 31 },
      ];
    }
  }, [product.tier]);

  const toggleLikeReview = (idx: number) => {
    setLikedReviews(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-950/80 p-4 md:p-6 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-slate-900 text-slate-100 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-800 flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1">
          {/* Left Column: Visual Representation Mockup (Stay sticky on desktop) */}
          <div className="lg:col-span-5 bg-slate-950 p-6 md:p-8 flex flex-col justify-between border-r border-slate-800 min-h-[350px] lg:min-h-[500px]">
            <div>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg inline-block shadow-2xs ${
                product.tier === 'budget' 
                  ? 'text-blue-300 bg-blue-950/60 border border-blue-900/40' 
                  : product.tier === 'balanced' 
                  ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-900/40' 
                  : 'text-purple-300 bg-purple-950/60 border border-purple-900/40'
              }`}>
                {product.tier === 'budget' ? 'Smart Saver' : product.tier === 'balanced' ? 'Balanced Choice' : 'Premium Luxury'}
              </span>
              <motion.h3 
                layoutId={`product-name-${product.id}`}
                className="text-2xl font-sans font-semibold text-white mt-3.5 tracking-tight"
              >
                {product.name}
              </motion.h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded-md">
                  {product.brand} • {product.category}
                </span>
                
                {product.stock !== undefined && (
                  product.stock === 0 ? (
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                      SOLD OUT
                    </span>
                  ) : product.stock <= 5 ? (
                    <span className="text-[10px] font-mono font-bold tracking-wider text-rose-400 bg-rose-950/40 border border-rose-900/40 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      ONLY {product.stock} LEFT IN STOCK - CRITICAL
                    </span>
                  ) : product.stock <= 10 ? (
                    <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 bg-amber-950/40 border border-amber-900/40 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      LIMITED STOCK ({product.stock} AVAILABLE)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      IN STOCK • READY TO SHIP
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Dynamic Real-time CSS Visual Mockup inside modal */}
            <div className="my-8 flex justify-center items-center">
              <motion.div 
                layoutId={`product-mockup-${product.id}`}
                className="relative"
              >
                {/* Visual Backdrop gradient shine */}
                <motion.div 
                  layoutId={`product-glow-${product.id}`}
                  className={`w-52 h-52 rounded-full ${product.image} opacity-20 blur-2xl absolute -inset-6`}
                />
                
                {/* Render Phone Mockup */}
                {product.category === 'Phones' && (
                  <div className="w-36 h-68 bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl relative border-4 border-slate-850 flex flex-col justify-between overflow-hidden">
                    {/* Speaker notch */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                    </div>
                    {/* Screen wallpaper mapped from category gradient */}
                    <div className={`w-full h-full rounded-[1.8rem] ${product.image} p-4 flex flex-col justify-between text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>
                      <div className="pt-4 text-center relative z-10">
                        <span className="text-[8px] font-mono opacity-80 tracking-widest">5G HYPERACTIVE</span>
                        <div className="text-xl font-extrabold font-mono tracking-tighter mt-1">GALAXY</div>
                      </div>
                      <div className="bg-black/30 backdrop-blur-md p-2.5 rounded-xl text-center relative z-10 border border-white/10">
                        <span className="text-[7px] font-mono block tracking-wider uppercase opacity-80">Chosen Color</span>
                        <span className="text-[10px] font-extrabold font-sans truncate block mt-0.5">{selectedColor}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Render Audio Mockup */}
                {product.category === 'Audio' && (
                  <div className="w-44 h-44 flex items-center justify-center relative">
                    <div className="w-32 h-36 bg-slate-900 rounded-[2.2rem] border border-slate-800 shadow-2xl p-4 flex flex-col justify-between items-center relative z-10">
                      <div className="w-12 h-2 bg-slate-850 rounded-md -mt-1 shadow-inner"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse my-2 shadow-xs"></div>
                      
                      <div className={`w-16 h-10 rounded-2xl ${product.image} opacity-80 flex items-center justify-center border border-white/20`}>
                        <span className="text-[8px] font-mono text-white text-center font-bold tracking-widest">H2</span>
                      </div>
                    </div>
                    {/* Active buds floating */}
                    <div className="absolute -top-6 -right-4 w-14 h-20 bg-slate-900 border border-slate-800 rounded-full shadow-lg z-20 flex flex-col items-center justify-between p-2.5 rotate-12">
                      <div className="w-4 h-4 rounded-full bg-slate-950"></div>
                      <div className="w-2 h-10 bg-slate-800 rounded-full mt-2 shadow-inner"></div>
                    </div>
                  </div>
                )}

                {/* Render Smartwatch Mockup */}
                {product.category === 'Wearables' && (
                  <div className="w-40 h-40 flex items-center justify-center relative">
                    <div className="absolute w-14 h-52 bg-slate-800 rounded-3xl shadow-inner flex flex-col justify-between py-2 items-center border border-slate-850">
                      <div className="w-8 h-1 bg-slate-700 rounded-sm"></div>
                      <div className="w-8 h-1 bg-slate-700 rounded-sm"></div>
                    </div>
                    <div className="w-34 h-34 rounded-[2rem] bg-slate-900 border-4 border-slate-800 shadow-2xl relative z-10 p-3 flex items-center justify-center">
                      <div className={`w-full h-full rounded-[1.4rem] ${product.image} p-3 flex flex-col justify-between text-white text-center`}>
                        <span className="text-[8px] font-mono tracking-widest uppercase opacity-75">S-HEALTH</span>
                        <div className="text-base font-bold font-mono">09:41</div>
                        <span className="text-[8px] font-mono opacity-80 uppercase tracking-wider">98 BPM • active</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tablets Mockup */}
                {product.category === 'Tablets' && (
                  <div className="w-52 h-36 bg-slate-950 rounded-2xl p-2 shadow-2xl border-4 border-slate-850 flex items-center justify-center relative">
                    <div className={`w-full h-full rounded-lg ${product.image} p-3 flex flex-col justify-end text-left`}>
                      <span className="text-[9px] font-mono text-white bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-sm inline-block tracking-wider w-max">
                        {selectedColor}
                      </span>
                    </div>
                  </div>
                )}

                {/* Fallback Accessories */}
                {product.category === 'Accessories' && (
                  <div className="w-44 h-32 bg-slate-950 rounded-2xl p-2.5 shadow-2xl border-2 border-slate-850 flex items-center justify-center relative">
                    <div className={`w-full h-full rounded-xl ${product.image} p-3 flex flex-col justify-end`}>
                      <span className="text-[9px] font-mono text-white/90 block font-bold">{product.name}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Micro Details checklist bar */}
            <div className="flex gap-4 items-center justify-around text-center text-slate-400 text-3xs border-t border-slate-800 pt-4">
              <div>
                <Truck className="w-4.5 h-4.5 mx-auto mb-1 text-slate-500" />
                <span className="font-semibold block">Eco-Insured Shipping</span>
              </div>
              <div>
                <ShieldCheck className="w-4.5 h-4.5 mx-auto mb-1 text-slate-500" />
                <span className="font-semibold block">1-Year Warranty</span>
              </div>
              <div>
                <RotateCcw className="w-4.5 h-4.5 mx-auto mb-1 text-slate-500" />
                <span className="font-semibold block">30-Day Evaluation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Tabbed Layout */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Premium Tab Bar selection */}
              <div className="flex border-b border-slate-800 gap-4 mb-6">
                {[
                  { id: 'configure', label: 'Configure Device', icon: Sparkles },
                  { id: 'specs', label: 'Specs Sheet', icon: ClipboardList },
                  { id: 'reviews', label: 'Reviews', icon: Star }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer relative ${
                        activeTab === tab.id 
                          ? 'text-indigo-400' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="modal-active-tab-indicator"
                          className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENT: CONFIGURE */}
              {activeTab === 'configure' && (
                <div className="space-y-6">
                  {/* Basic description & Key Highlights */}
                  <div className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{product.description}</p>
                    
                    {product.features && product.features.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                          Product Features & Highlights
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 bg-slate-950/40 border border-slate-850/60 rounded-xl p-3">
                          {product.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-200 font-sans">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Colors Custom Selector */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider font-mono text-[10px]">
                      Available Colors: <span className="text-indigo-400 font-bold font-sans normal-case text-xs ml-1">{selectedColor}</span>
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((color) => {
                        const isActive = selectedColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                              isActive
                                ? 'border-indigo-600 bg-indigo-950/60 text-indigo-300 shadow-3xs font-bold'
                                : 'border-slate-800 text-slate-400 bg-slate-950 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                          >
                            <span 
                              className="w-3 h-3 rounded-full border border-slate-750"
                              style={{ backgroundColor: getColorHex(color) }}
                            />
                            {color}
                            {isActive && <Check className="w-3 h-3 text-indigo-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Storage selection (if applicable) */}
                  {(product.category === 'Phones' || product.category === 'Tablets' || product.category === 'Laptops') && (
                    <StorageConfigurator
                      selectedOptionId={selectedStorage}
                      onChange={(opt) => setSelectedStorage(opt.id)}
                      options={
                        product.category === 'Laptops' ? [
                          { id: '512GB', size: '512 GB', speed: 'PCIe 4.0 (5000 MB/s)', priceDelta: 0 },
                          { id: '1TB', size: '1 TB', speed: 'PCIe 4.0 (7500 MB/s)', priceDelta: 150, badge: 'HIGH SPEED' },
                          { id: '2TB', size: '2 TB', speed: 'PCIe 5.0 (10000 MB/s)', priceDelta: 300, badge: 'CREATOR PRO' }
                        ] : [
                          { id: '128GB', size: '128 GB', speed: 'UFS 3.1 (2200 MB/s)', priceDelta: 0 },
                          { id: '256GB', size: '256 GB', speed: 'UFS 4.0 (4200 MB/s)', priceDelta: 100, badge: 'BALANCED' },
                          { id: '512GB', size: '512 GB', speed: 'UFS 4.0 (4200 MB/s)', priceDelta: 250, badge: 'MOST POPULAR' }
                        ]
                      }
                    />
                  )}

                  {/* Protection plan toggle checkbox */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-extrabold text-slate-300 block uppercase tracking-wider font-mono">
                      Protection & Care Coverage
                    </span>
                    <label className="flex items-start gap-3.5 p-3.5 border border-slate-850 rounded-2xl bg-slate-950 cursor-pointer hover:bg-slate-900 select-none transition">
                      <input
                        type="checkbox"
                        checked={includeWarranty}
                        onChange={(e) => setIncludeWarranty(e.target.checked)}
                        className="w-4.5 h-4.5 text-indigo-600 border-slate-750 rounded-md mt-0.5 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          Add 2-Year Advanced Protection Plan
                          <span className="text-4xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-900/40 px-1.5 py-0.5 rounded-sm font-bold">{formatPrice(49)}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block leading-normal mt-0.5">
                          Protects from unexpected physical damage, spills, battery health replacements, and provides 24/7 dedicated live chat.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SPECS */}
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4.5 space-y-3.5">
                    <span className="text-[10px] font-extrabold text-slate-300 block uppercase tracking-wider font-mono">
                      Hardware Spec Sheet
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-850">
                          <span className="text-slate-500 font-mono text-3xs uppercase tracking-wider font-bold shrink-0">{key}</span>
                          <span className="text-slate-200 font-semibold text-right truncate max-w-[170px]" title={value}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-xl flex items-start gap-2 text-[10px] text-indigo-300 leading-relaxed">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>This hardware setup is validated by TechTier Curation metrics. Bluetooth compatibility with Android/iOS ecosystems is catalog-synchronized.</span>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4.5">
                  <div className="flex justify-between items-center bg-slate-950 border border-slate-850 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Rating Index</span>
                      <p className="text-xl font-extrabold text-white flex items-center gap-1 mt-0.5">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        {product.rating}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Samples Count</span>
                      <p className="text-xs font-semibold text-slate-300 mt-1">{product.reviewCount} verified customers feedback</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {reviews.map((rev, idx) => {
                      const isLiked = likedReviews[idx] || false;
                      return (
                        <div key={idx} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-xs space-y-2 shadow-2xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-white flex items-center gap-1.5">
                                {rev.author}
                                {rev.verified && (
                                  <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-900/40 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider font-mono">
                                    VERIFIED
                                  </span>
                                )}
                              </p>
                              <div className="flex text-amber-400 text-[10px] mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={i < rev.rating ? 'text-amber-400' : 'text-slate-800'}>★</span>
                                ))}
                              </div>
                            </div>
                            <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">{rev.date}</span>
                          </div>
                          
                          <p className="text-slate-300 leading-normal italic font-sans">
                            "{rev.comment}"
                          </p>

                          {/* Helpfulness toggles */}
                          <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                            <button
                              onClick={() => toggleLikeReview(idx)}
                              className={`flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider font-bold transition cursor-pointer ${
                                isLiked ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-indigo-950' : ''}`} />
                              Helpful ({rev.helpful + (isLiked ? 1 : 0)})
                            </button>
                            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> Report
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel sticky bottom summary */}
            <div className="flex items-center justify-between border-t border-slate-850 pt-5 mt-6">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Configured Total</span>
                <div className="flex items-baseline gap-1.5">
                  <motion.span 
                    layoutId={`product-price-${product.id}`}
                    className="text-lg font-extrabold font-mono text-white"
                  >
                    {formatPrice(finalPrice)}
                  </motion.span>
                  {product.originalPrice && !selectedStorage && !includeWarranty && (
                    <span className="text-3xs text-slate-500 line-through font-mono">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                {/* Stock tracker */}
                <div className={`flex items-center gap-1 mt-1 font-bold font-mono text-[9px] ${
                  product.stock === 0 ? 'text-rose-500' : product.stock <= 5 ? 'text-rose-400 animate-pulse' : product.stock <= 10 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  <Package className="w-3.5 h-3.5" />
                  <span>
                    {product.stock === 0 ? 'Currently Out of Stock' : `Only ${product.stock} units in local dispatch`}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={product.stock === 0}
                  onClick={() => onAddToCart(product, selectedColor, { storage: selectedStorage, warranty: includeWarranty })}
                  className={`font-bold text-xs py-3.5 px-5 rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shadow-md ${
                    product.stock === 0
                      ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-600/15'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 0 ? 'Sold Out' : 'Add configuration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
