import { Trash2, ShoppingCart, Percent, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCompareProps {
  comparedProducts: Product[];
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product, color: string) => void;
  onClose: () => void;
}

export default function ProductCompare({ comparedProducts, onRemove, onAddToCart, onClose }: ProductCompareProps) {
  const isNepalMarket = true;
  const convertToNPR = (usd: number) => Math.round(usd * 134);
  const formatPrice = (usd: number) => {
    if (isNepalMarket) {
      return `रू ${convertToNPR(usd).toLocaleString('en-NP')}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  if (comparedProducts.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">No products selected for comparison</h3>
        <p className="text-sm text-slate-400 mt-2">
          Browse our Samsung and AirPods catalog and click "Compare" on any item to view side-by-side spec sheets and income tier differences.
        </p>
        <button
          onClick={onClose}
          className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  // Get all unique spec keys across selected products to draw compare rows
  const allSpecKeys = Array.from(
    new Set(comparedProducts.flatMap((p) => Object.keys(p.specs)))
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-md">
      <div className="flex justify-between items-center pb-5 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-3 py-1 rounded-full font-medium">
            Side-by-Side Advisor
          </span>
          <h2 className="text-2xl font-sans font-medium tracking-tight text-white mt-1">
            Compare Specs & Value Tiers
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-4 py-2 hover:bg-indigo-950/50 rounded-xl transition duration-150 cursor-pointer"
        >
          Close Comparison ({comparedProducts.length})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="py-4 pr-4 text-xs font-semibold text-slate-500 uppercase font-mono w-1/4">Specification</th>
              {comparedProducts.map((p) => (
                <th key={p.id} className="py-4 px-4 w-1/4 min-w-[200px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-3xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        p.tier === 'budget' 
                          ? 'text-blue-300 bg-blue-950/60 border border-blue-900/40' 
                          : p.tier === 'balanced' 
                          ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-900/40' 
                          : 'text-purple-300 bg-purple-950/60 border border-purple-900/40'
                      }`}>
                        {p.tier === 'budget' ? 'Budget Choice' : p.tier === 'balanced' ? 'Balanced Value' : 'Premium Elite'}
                      </span>
                      <h4 className="font-bold text-white mt-2 text-sm leading-tight">{p.name}</h4>
                      <p className="font-mono text-xs text-slate-400 mt-1 font-semibold">{p.brand} • {p.category}</p>
                    </div>
                    <button
                      onClick={() => onRemove(p.id)}
                      className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-slate-850 rounded-lg transition duration-150 cursor-pointer"
                      title="Remove comparison"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {/* Price Row */}
            <tr>
              <td className="py-4 pr-4 font-medium text-slate-400 text-xs font-mono">Price</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="py-4 px-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white font-mono">{formatPrice(p.price)}</span>
                    {p.originalPrice && (
                      <span className="text-xs text-slate-500 line-through font-mono">{formatPrice(p.originalPrice)}</span>
                    )}
                  </div>
                  {p.originalPrice && (
                    <span className="text-3xs text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-1.5 py-0.5 rounded-sm font-mono mt-1 inline-block">
                      Save {formatPrice(p.originalPrice - p.price)}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Income Level Fit Row */}
            <tr>
              <td className="py-4 pr-4 font-medium text-slate-400 text-xs font-mono">Income Level Fit</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="py-4 px-4 text-xs">
                  <p className="font-semibold text-slate-200">
                    {p.tier === 'budget' ? 'Budget-Friendly / Entry' : p.tier === 'balanced' ? 'Mid-to-High Income Value' : 'Premium Flagship Elite'}
                  </p>
                  <p className="text-slate-400 text-3xs mt-1 leading-normal">
                    {p.tier === 'budget' 
                      ? 'Optimal for users seeking fundamental utilities with high reliability.' 
                      : p.tier === 'balanced' 
                      ? 'Best performance per dollar. Standard-grade features without peak premiums.' 
                      : 'Ideal for tech power users looking for absolute top durability, materials, and features.'}
                  </p>
                </td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr>
              <td className="py-4 pr-4 font-medium text-slate-400 text-xs font-mono">Customer Rating</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="py-4 px-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 text-sm">★</span>
                    <span className="font-bold text-white">{p.rating}</span>
                    <span className="text-slate-400">({p.reviewCount} reviews)</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Specs Rows */}
            {allSpecKeys.map((key) => (
              <tr key={key}>
                <td className="py-4 pr-4 font-medium text-slate-400 text-xs font-mono">{key}</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-xs text-slate-300 font-sans leading-relaxed">
                    {p.specs[key] || <span className="text-slate-600 font-mono italic">Not Applicable</span>}
                  </td>
                ))}
              </tr>
            ))}

            {/* Core Highlight Features */}
            <tr>
              <td className="py-4 pr-4 font-medium text-slate-400 text-xs font-mono">Key Highlights</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="py-4 px-4 text-xs">
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="leading-snug">{feat}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Available Colors */}
            <tr>
              <td className="py-4 pr-4 font-medium text-slate-400 text-xs font-mono">Colors</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="py-4 px-4 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {p.colors.map((color) => (
                      <span key={color} className="border border-slate-800 px-2 py-1 rounded-md bg-slate-950 font-medium text-slate-300">
                        {color}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Action Buttons */}
            <tr>
              <td></td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="py-5 px-4">
                  <button
                    onClick={() => onAddToCart(p, p.colors[0])}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm animate-none"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add First Color
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
