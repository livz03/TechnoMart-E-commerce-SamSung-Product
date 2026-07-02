import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Percent, TrendingUp, Sparkles, AlertCircle, ShoppingBag, CheckCircle2, RotateCcw, Flame, Sparkle, ShieldCheck, Heart } from 'lucide-react';
import { BudgetProfile, IncomeTierType, Product } from '../types';
import { PRODUCTS } from '../data/products';

interface BudgetProfilerProps {
  onApplyProfile: (tier: IncomeTierType | 'all', maxPrice: number) => void;
  activeProfile: BudgetProfile | null;
  setActiveProfile: (profile: BudgetProfile | null) => void;
  onAddToCart?: (product: Product, color: string) => void;
}

export default function BudgetProfiler({ onApplyProfile, activeProfile, setActiveProfile, onAddToCart }: BudgetProfilerProps) {
  const [income, setIncome] = useState<number>(activeProfile?.monthlyIncome || 4000);
  const [percent, setPercent] = useState<number>(activeProfile?.allocatedPercent || 10);
  const [priority, setPriority] = useState<'savings' | 'balance' | 'performance'>(activeProfile?.priority || 'balance');
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const isNepalMarket = true;
  const convertToNPR = (usd: number) => Math.round(usd * 134);
  const formatPrice = (usd: number) => {
    if (isNepalMarket) {
      return `रू ${convertToNPR(usd).toLocaleString('en-NP')}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  const calculatedBudget = useMemo(() => {
    return Math.round((income * percent) / 100);
  }, [income, percent]);

  const profileAnalysis = useMemo(() => {
    let tier: IncomeTierType = 'balanced';
    let profileName = 'Balanced Value Seeker';
    let explanation = 'You seek high-quality tech that offers the best return-on-investment without unnecessary premium markups.';
    let ratingColor = 'text-emerald-300 bg-emerald-950/60 border border-emerald-900/40';
    let gradientBg = 'from-emerald-950/60 to-slate-950/40';

    if (priority === 'savings' || calculatedBudget < 300) {
      tier = 'budget';
      profileName = 'Smart Saver & Efficiency Champion';
      explanation = 'You appreciate smart, durable, entry-level technology that fulfills every daily essential task while keeping your savings intact.';
      ratingColor = 'text-blue-300 bg-blue-950/60 border border-blue-900/40';
      gradientBg = 'from-blue-950/60 to-slate-950/40';
    } else if (priority === 'performance' && calculatedBudget >= 800) {
      tier = 'premium';
      profileName = 'Elite Pioneer & Power User';
      explanation = 'You invest in cutting-edge, uncompromisingly built, titanium-framed and spatial-audio equipped flagship hardware for extreme durability and top performance.';
      ratingColor = 'text-purple-300 bg-purple-950/60 border border-purple-900/40';
      gradientBg = 'from-purple-950/60 to-slate-950/40';
    } else if (calculatedBudget >= 900) {
      tier = 'premium';
      profileName = 'Premium Tech Enthusiast';
      explanation = 'Your generous budget unlocks top-shelf, folding screens, professional ANC audio, and heavy-duty titanium construction.';
      ratingColor = 'text-purple-300 bg-purple-950/60 border border-purple-900/40';
      gradientBg = 'from-purple-950/60 to-slate-950/40';
    }

    // Filter dynamic bundles
    const matchingProducts = PRODUCTS.filter(p => p.tier === tier);
    const recommendedPhone = matchingProducts.find(p => p.category === 'Phones');
    const recommendedAudio = matchingProducts.find(p => p.category === 'Audio');
    const totalBundleCost = (recommendedPhone?.price || 0) + (recommendedAudio?.price || 0);

    return {
      tier,
      profileName,
      explanation,
      ratingColor,
      gradientBg,
      recommendedPhone,
      recommendedAudio,
      totalBundleCost,
    };
  }, [calculatedBudget, priority]);

  const handleApply = () => {
    const profile: BudgetProfile = {
      monthlyIncome: income,
      allocatedPercent: percent,
      priority,
    };
    setActiveProfile(profile);
    onApplyProfile(profileAnalysis.tier, calculatedBudget);
    
    setAppliedMessage(`Successfully applied "${profileAnalysis.profileName}" curation! The catalog is now filtered for your budget of $${calculatedBudget}.`);
    setTimeout(() => setAppliedMessage(null), 4000);
  };

  const handleAddBundleToCart = () => {
    if (!onAddToCart) return;
    
    let addedCount = 0;
    if (profileAnalysis.recommendedPhone) {
      onAddToCart(profileAnalysis.recommendedPhone, profileAnalysis.recommendedPhone.colors[0]);
      addedCount++;
    }
    if (profileAnalysis.recommendedAudio) {
      // Small timeout to ensure state doesn't swallow sequential events
      setTimeout(() => {
        onAddToCart(profileAnalysis.recommendedAudio!, profileAnalysis.recommendedAudio!.colors[0]);
      }, 150);
      addedCount++;
    }

    if (addedCount > 0) {
      setAppliedMessage(`Added the complete standard "${profileAnalysis.profileName}" starter ecosystem to your shopping cart!`);
      setTimeout(() => setAppliedMessage(null), 4500);
    }
  };

  const handleReset = () => {
    setIncome(4000);
    setPercent(10);
    setPriority('balance');
    setActiveProfile(null);
    onApplyProfile('all', 99999);
    setAppliedMessage('Budget filter reset. Showing all products.');
    setTimeout(() => setAppliedMessage(null), 3000);
  };

  return (
    <div id="budget-profiler" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
      
      {/* Decorative Top Accent Border */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
        <div>
          <span className="text-3xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-3.5 py-1.5 rounded-lg font-bold">
            💡 AI-Driven Smart Shopping Advisor
          </span>
          <h2 className="text-2xl font-sans font-semibold tracking-tight text-white mt-2.5">
            Discover Your Personalized Ecosystem
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Enter your comfortable monthly tech target. Our smart profiler computes optimal combinations across Samsung handsets, smart wearables, and Apple AirPods to safeguard your savings metrics.
          </p>
        </div>
        
        {activeProfile && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-900/40 px-3.5 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Profile Applied
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Interactive Sliders with styled gauges */}
        <div className="lg:col-span-5 space-y-7">
          
          {/* Slider 1: Income level */}
          <div className="space-y-3.5 bg-slate-950 border border-slate-850 p-4.5 rounded-2xl">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
                Monthly Net Income
              </label>
              <span className="text-lg font-bold font-mono text-slate-100 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl shadow-2xs">
                {formatPrice(income)}
              </span>
            </div>
            
            <div className="relative pt-2">
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden"
              />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none w-full flex justify-between px-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              </div>
            </div>
            <div className="flex justify-between text-[7px] text-slate-500 font-mono tracking-wider font-bold">
              <span>रू १,३४,००० MIN</span>
              <span>रू ६,७०,००० MID</span>
              <span>रू १३,४०,००० HIGH</span>
              <span>रू २,०१,००,००+ MAX</span>
            </div>
          </div>

          {/* Slider 2: Technology percentage */}
          <div className="space-y-3.5 bg-slate-950 border border-slate-850 p-4.5 rounded-2xl">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400">
                  <Percent className="w-3.5 h-3.5" />
                </span>
                Allocation Limit
              </label>
              <span className="text-lg font-bold font-mono text-slate-100 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl shadow-2xs">
                {percent}%
              </span>
            </div>

            <div className="relative pt-2">
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden"
              />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none w-full flex justify-between px-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              </div>
            </div>
            <div className="flex justify-between text-5xs text-slate-500 font-mono tracking-wider font-bold">
              <span>2% CAUTIOUS</span>
              <span>15% BALANCED</span>
              <span>30% ENTHUSIAST</span>
            </div>
          </div>

          {/* Financial priority profile toggle button blocks */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Ecosystem Purchase Intent
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'savings', label: 'Conservative', desc: 'Prioritize Savings' },
                { id: 'balance', label: 'Value Metric', desc: 'Balanced ROI' },
                { id: 'performance', label: 'Peak Spec', desc: 'Flagship Only' }
              ].map((opt) => {
                const isActive = priority === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col justify-center items-center ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-950/60 text-indigo-300 shadow-sm ring-1 ring-indigo-500/20'
                        : 'border-slate-850 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[8px] font-mono opacity-80 mt-0.5 uppercase tracking-tighter">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Budget Output Card */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-indigo-950 to-slate-950 border border-indigo-900/40 flex items-center justify-between shadow-3xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Computed Purchase Capacity</span>
              <p className="text-2xl font-extrabold text-indigo-200 mt-0.5 tracking-tight">{formatPrice(calculatedBudget)}</p>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-indigo-600 flex flex-col items-center justify-center text-white font-mono shadow-sm">
              <span className="text-[8px] opacity-80 uppercase font-bold tracking-widest">LIMIT</span>
              <span className="text-xs font-bold">{percent}%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Smart Recommendation Box */}
        <div className={`lg:col-span-7 bg-gradient-to-br ${profileAnalysis.gradientBg} border border-slate-800 rounded-2xl p-6 md:p-7 flex flex-col justify-between transition-all duration-500`}>
          <div className="space-y-4">
            
            {/* Analyzer Heading & Align index */}
            <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-800/60">
              <div>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-lg shadow-3xs ${profileAnalysis.ratingColor}`}>
                  {profileAnalysis.tier === 'budget' ? 'Smart Saver Choice' : profileAnalysis.tier === 'balanced' ? 'Ideal Value Tier' : 'Premium Luxury Tier'}
                </span>
                <h3 className="text-xl font-bold text-white mt-3 flex items-center gap-1.5 tracking-tight">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  {profileAnalysis.profileName}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Fit Compatibility</span>
                <p className="text-sm font-extrabold text-indigo-400 mt-0.5">
                  {profileAnalysis.tier === 'budget' ? '98% Saver Match' : profileAnalysis.tier === 'balanced' ? '95% Value Match' : '99% Elite Match'}
                </p>
              </div>
            </div>

            {/* Smart dynamic description text */}
            <p className="text-xs text-slate-400 leading-relaxed">
              {profileAnalysis.explanation} TechTier algorithms determined this allocation matches standard regional disposable index benchmarks with full component warranty validation.
            </p>

            {/* Recommended Starter Ecosystem */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4.5 space-y-3 shadow-xs">
              <span className="text-4xs font-mono text-slate-500 uppercase tracking-widest font-bold block pb-1 border-b border-slate-900">
                Recommended Ecosystem Package
              </span>
              
              <div className="space-y-3">
                {profileAnalysis.recommendedPhone && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shrink-0"></span>
                      <div>
                        <p className="font-bold text-slate-200">{profileAnalysis.recommendedPhone.name}</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{profileAnalysis.recommendedPhone.brand} • {profileAnalysis.recommendedPhone.category}</p>
                      </div>
                    </span>
                    <span className="font-mono text-white font-bold text-xs">{formatPrice(profileAnalysis.recommendedPhone.price)}</span>
                  </div>
                )}
                
                {profileAnalysis.recommendedAudio && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0"></span>
                      <div>
                        <p className="font-bold text-slate-200">{profileAnalysis.recommendedAudio.name}</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{profileAnalysis.recommendedAudio.brand} • {profileAnalysis.recommendedAudio.category}</p>
                      </div>
                    </span>
                    <span className="font-mono text-white font-bold text-xs">{formatPrice(profileAnalysis.recommendedAudio.price)}</span>
                  </div>
                )}

                {/* Total Cost Display Row */}
                <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-sm font-bold text-slate-100">
                  <span className="text-xs font-semibold text-slate-400">Bundle Package Pricing:</span>
                  <div className="text-right">
                    <span className="font-mono text-base font-extrabold text-indigo-400">{formatPrice(profileAnalysis.totalBundleCost)}</span>
                    <span className="text-4xs text-slate-500 font-mono block">Standard tax/shipping excluded</span>
                  </div>
                </div>
              </div>

              {profileAnalysis.totalBundleCost > calculatedBudget && (
                <div className="flex items-start gap-1.5 text-2xs text-amber-400 mt-2 bg-amber-950/40 border border-amber-900/50 p-2.5 rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <span>The complete dual-item ecosystem slightly exceeds your allocated technology spending threshold. Consider custom trade-ins or separate item checkouts.</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs: Apply Curation Filter AND Add Complete Bundle */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
            
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-slate-700/50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Apply Filter Curation
            </button>

            {onAddToCart && (
              <button
                type="button"
                onClick={handleAddBundleToCart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-indigo-500/10"
              >
                <ShoppingBag className="w-4 h-4" />
                Add Bundle to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Applied Confirmation Banner */}
      <AnimatePresence>
        {appliedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mt-6 p-4 bg-emerald-950/50 border border-emerald-900/40 rounded-2xl flex items-start gap-3 text-xs text-emerald-300 shadow-3xs"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Ecosystem Action Success</p>
              <p className="text-emerald-400">{appliedMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
