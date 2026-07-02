import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, BarChart3, Plus, Star, Tag, Check, Sparkles, Cpu } from 'lucide-react';
import { Product } from '../types';
import SpecMatrixOverlay from './Molecules/SpecMatrixOverlay';

interface ProductCardProps {
  key?: string;
  product: Product;
  onExplore: (product: Product) => void;
  onCompareToggle: (product: Product) => void;
  isCompared: boolean;
  onAddToCart: (product: Product, color: string) => void;
}

export default function ProductCard({ product, onExplore, onCompareToggle, isCompared, onAddToCart }: ProductCardProps) {
  // Local state to preview specific color swatches
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]);
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);

  const isNepalMarket = true;
  const convertToNPR = (usd: number) => Math.round(usd * 134);
  const formatPrice = (usd: number) => {
    if (isNepalMarket) {
      return `रू ${convertToNPR(usd).toLocaleString('en-NP')}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  // Compute percentage discount if originalPrice is present
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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

  return (
    <motion.div
      layout
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => onExplore(product)}
      id={`product-card-${product.id}`}
      className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group h-full relative cursor-pointer"
    >
      {/* Product Image Area / Styled Mockup Background */}
      <div className="relative h-56 flex items-center justify-center p-6 overflow-hidden bg-radial from-slate-950 to-slate-900/60 border-b border-slate-800/60">
        
        {/* Soft glowing ambient drop-shadow matching the product gradient */}
        <motion.div 
          layoutId={`product-glow-${product.id}`}
          className={`w-36 h-36 rounded-full ${product.image} opacity-15 blur-2xl absolute -inset-1 group-hover:scale-135 transition duration-500`}
        />

        {/* Floating Category Accent Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          {product.isNepalPopular && (
            <span className="bg-emerald-600/90 backdrop-blur-xs text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md uppercase tracking-wider border border-emerald-500/20">
              🇳🇵 POPULAR IN NEPAL
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-600/90 backdrop-blur-xs text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md uppercase tracking-wider">
              <Tag className="w-2.5 h-2.5" />
              SAVE {discountPercent}%
            </span>
          )}
          {product.price > 1000 && (
            <span className="bg-amber-500/90 backdrop-blur-xs text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 animate-pulse text-amber-300" />
              FLAGSHIP
            </span>
          )}
        </div>

        {/* Dynamic Vector Representation */}
        <motion.div 
          layoutId={`product-mockup-${product.id}`}
          className="relative z-10 text-center transform group-hover:scale-110 transition-transform duration-500"
        >
          {product.category === 'Phones' && (
            <div className="w-16 h-28 bg-slate-950 rounded-[1.8rem] p-1 border-2 border-slate-800 shadow-xl mx-auto flex flex-col justify-between overflow-hidden relative">
              {/* Notch detail */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-1 h-1 bg-slate-850 rounded-full"></div>
              </div>
              {/* Wallpaper Screen gradient mapped dynamically */}
              <div className={`w-full h-full rounded-[1.4rem] ${product.image} opacity-90 p-2 flex flex-col justify-end text-left relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="relative z-10">
                  <div className="w-4 h-0.5 bg-white/60 rounded-full mb-1"></div>
                  <span className="text-[7px] font-mono text-white/90 uppercase tracking-widest font-semibold block scale-90 origin-left">
                    {selectedColor}
                  </span>
                </div>
              </div>
            </div>
          )}

          {product.category === 'Audio' && (
            <div className="w-20 h-20 bg-slate-950 rounded-[1.5rem] border border-slate-800 shadow-lg mx-auto flex flex-col justify-between items-center p-2 relative">
              {/* Metal charging hinge */}
              <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
              
              {/* Smart indicator LED */}
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse my-1"></div>
              
              {/* Dynamic body reflecting chosen color */}
              <div className={`w-12 h-8 rounded-lg ${product.image} opacity-80 flex items-center justify-center p-1`}>
                <div className="w-4 h-4 rounded-full bg-white/10"></div>
              </div>
              
              {/* Miniature floating earbud inside card */}
              <div className="absolute -top-1 -right-2 w-6 h-10 bg-slate-900 border border-slate-800 rounded-full shadow-md flex flex-col items-center justify-between p-1 group-hover:rotate-12 transition-transform duration-300">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                <div className="w-1 h-4 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          )}

          {product.category === 'Wearables' && (
            <div className="w-20 h-20 flex items-center justify-center relative">
              {/* Wrist watch straps */}
              <div className="absolute w-6 h-24 bg-slate-850 rounded-lg shadow-inner flex flex-col justify-between py-1 items-center">
                <div className="w-4 h-0.5 bg-slate-800"></div>
                <div className="w-4 h-0.5 bg-slate-800"></div>
              </div>
              
              {/* Metallic main body dial */}
              <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-slate-800 shadow-lg relative z-10 p-1 flex items-center justify-center">
                <div className={`w-full h-full rounded-full ${product.image} p-1 flex flex-col justify-center text-white text-center`}>
                  <span className="text-[10px] font-bold font-mono tracking-tighter">09:41</span>
                  <span className="text-[6px] font-mono opacity-80 uppercase tracking-widest scale-90">120bpm</span>
                </div>
              </div>
            </div>
          )}

          {product.category === 'Tablets' && (
            <div className="w-28 h-20 bg-slate-950 rounded-xl p-1 border-2 border-slate-800 shadow-xl mx-auto flex flex-col justify-between overflow-hidden relative">
              {/* Camera sensor */}
              <div className="absolute top-1/2 left-0.5 -translate-y-1/2 w-1 h-1 bg-slate-800 rounded-full z-20"></div>
              {/* Vibrant screen */}
              <div className={`w-full h-full rounded-md ${product.image} opacity-80 p-1.5 flex flex-col justify-end text-left relative`}>
                <span className="text-[7px] font-mono text-white/80 uppercase tracking-wider block font-bold truncate">
                  {selectedColor}
                </span>
              </div>
            </div>
          )}

          {product.category === 'Accessories' && (
            <div className="w-22 h-14 bg-slate-950 rounded-xl p-1.5 border border-slate-800 shadow-lg mx-auto flex items-center justify-center relative">
              <div className="absolute inset-0.5 bg-radial from-slate-900 to-transparent rounded-lg"></div>
              <div className={`w-full h-full rounded-md ${product.image} opacity-80 relative z-10 p-1 flex items-center justify-center`}>
                <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Curation Tier Category Ribbon */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border ${
            product.tier === 'budget' 
              ? 'text-blue-400 bg-blue-950/40 border-blue-900/50' 
              : product.tier === 'balanced' 
              ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50' 
              : 'text-purple-400 bg-purple-950/40 border-purple-900/50'
          }`}>
            {product.tier === 'budget' ? 'Budget' : product.tier === 'balanced' ? 'Balanced' : 'Premium'}
          </span>
        </div>

        {/* PRODUCT DESCRIPTION & DETAILS SLIDE-UP PANEL (ON HOVER / TOUCH) */}
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-5 transition-transform duration-350 ease-out translate-y-full group-hover:translate-y-0 z-20 flex flex-col justify-between">
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse animate-duration-1000"></span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 font-extrabold">Device Description</span>
              </div>
              <span className="text-[8px] font-mono text-slate-500 font-bold">NP-SYS: {product.id.toUpperCase()}</span>
            </div>
            
            <div className="space-y-1.5">
              <h5 className="text-xs font-bold text-slate-100 font-sans tracking-tight leading-snug">{product.name}</h5>
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans font-normal line-clamp-6">
                {product.description}
              </p>
            </div>
          </div>
          
          <div className="mt-2 space-y-2 w-full">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExplore(product);
                }}
                className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-md border border-indigo-500/30 transition-all active:scale-95"
              >
                Configure
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMatrixOpen(true);
                }}
                className="py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Cpu className="w-3 h-3 text-indigo-400" />
                Spec Matrix
              </button>
            </div>
            <div className="text-[8px] font-mono text-indigo-400 border-t border-slate-900/60 pt-2 flex items-center justify-between">
              <span>🇳🇵 LOCAL NEPAL WARRANTY INCLUDED</span>
              <span>100% ORIGINAL</span>
            </div>
          </div>
        </div>

        {/* ABSOLUTE SPEC MATRIX OVERLAY (Splits open cleanly) */}
        <SpecMatrixOverlay 
          product={product} 
          isOpen={isMatrixOpen} 
          onClose={() => setIsMatrixOpen(false)} 
        />
      </div>

      {/* Info Details Body */}
      <div className="p-5.5 flex-1 flex flex-col justify-between space-y-4 bg-gradient-to-b from-slate-900/80 to-slate-950/80">
        <div>
          {/* Product Name & Brand */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded-md inline-block">
                {product.brand} • {product.category}
              </span>
              
              {product.stock !== undefined && (
                product.stock === 0 ? (
                  <span className="text-[8px] font-mono font-bold tracking-wider text-slate-500 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    SOLD OUT
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="text-[8px] font-mono font-bold tracking-wider text-rose-400 bg-rose-950/40 border border-rose-900/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0"></span>
                    ONLY {product.stock} LEFT
                  </span>
                ) : product.stock <= 10 ? (
                  <span className="text-[8px] font-mono font-bold tracking-wider text-amber-400 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0"></span>
                    LOW STOCK
                  </span>
                ) : (
                  <span className="text-[8px] font-mono font-bold tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                    IN STOCK
                  </span>
                )
              )}
            </div>
            <motion.h4 
              layoutId={`product-name-${product.id}`}
              className="font-sans font-bold text-slate-100 text-sm leading-snug tracking-tight group-hover:text-indigo-400 transition-colors duration-200"
            >
              {product.name}
            </motion.h4>
            {product.isNepalPopular && product.nepalPopularReason && (
              <p className="text-[10px] text-emerald-400 font-mono mt-2.5 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1.5 rounded-xl leading-normal">
                🇳🇵 {product.nepalPopularReason}
              </p>
            )}
          </div>
 
          {/* Key Specs Snippet (Production Grade Table-style representation) */}
          <div className="mt-4 space-y-1.5 text-[10px] text-slate-400 font-mono border-t border-slate-850 pt-3.5">
            {Object.entries(product.specs).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center gap-2 py-0.5">
                <span className="uppercase text-slate-500 font-extrabold tracking-wider truncate max-w-[70px]">
                  {key}
                </span>
                <span className="font-semibold text-slate-200 truncate max-w-[145px] text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Rating & Color Selector segment */}
        <div className="space-y-3.5 pt-1">
          
          {/* Price & Star Rating row */}
          <div className="flex justify-between items-center">
            <div className="flex items-baseline gap-1.5">
              <motion.span 
                layoutId={`product-price-${product.id}`}
                className="text-sm font-black font-mono text-white"
              >
                {formatPrice(product.price)}
              </motion.span>
              {product.originalPrice && (
                <span className="text-[9px] text-slate-500 line-through font-mono">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-900/35 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>{product.rating}</span>
              <span className="text-slate-500 font-mono font-medium">({product.reviewCount})</span>
            </div>
          </div>

          {/* Interactive Color swatch dot previews */}
          <div className="flex flex-col gap-1.5 pt-2.5 border-t border-slate-850">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">
              AVAILABLE COLOR: <span className="text-indigo-400 font-semibold font-sans normal-case text-2xs ml-1">{selectedColor}</span>
            </span>
            <div className="flex gap-2 mt-0.5">
              {product.colors.map((col) => {
                const isActive = selectedColor === col;
                return (
                  <button
                    key={col}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(col);
                    }}
                    className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'border-indigo-500 scale-120 ring-2 ring-indigo-950 shadow-xs' 
                        : 'border-slate-800 hover:scale-110 hover:border-slate-700'
                    }`}
                    title={`Preview ${col}`}
                    style={{ backgroundColor: getColorHex(col) }}
                  >
                    {isActive && (
                      <Check className={`w-3 h-3 ${
                        col.toLowerCase().includes('white') || col.toLowerCase().includes('silver') 
                          ? 'text-slate-950' 
                          : 'text-white'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Buttons Row */}
        <div className="grid grid-cols-2 gap-2.5 pt-3.5 border-t border-slate-850">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompareToggle(product);
            }}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              isCompared
                ? 'bg-indigo-950/50 border border-indigo-500/40 text-indigo-300 shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-750'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>{isCompared ? 'Compared' : 'Compare'}</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExplore(product);
            }}
            className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/15 cursor-pointer border border-transparent"
          >
            <Plus className="w-3.5 h-3.5 shrink-0 text-white" />
            <span>Configure</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

