import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Cpu, 
  Smartphone, 
  Watch, 
  Headphones, 
  Compass, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Briefcase, 
  Activity, 
  Zap, 
  Palette, 
  ShoppingCart,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { BudgetProfile, CartItem, Product } from '../types';
import { PRODUCTS } from '../data/products';
import Markdown from 'react-markdown';
import EcosystemConnectorLine from './Molecules/EcosystemConnectorLine';

interface EcosystemAIProps {
  activeProfile: BudgetProfile | null;
  cartItems: CartItem[];
  onAddToCart: (product: Product, color: string) => void;
  triggerNotification: (msg: string) => void;
}

interface SynergyResponse {
  score: number;
  analysis: string;
  pros: string[];
  cons: string[];
  blueprint: string;
  recommendations: Array<{
    title: string;
    reason: string;
    productId: string | null;
  }>;
}

export default function EcosystemAI({ activeProfile, cartItems, onAddToCart, triggerNotification }: EcosystemAIProps) {
  // --- Form Local State ---
  const [phone, setPhone] = useState<string>('sam-s24-ultra');
  const [watch, setWatch] = useState<string>('sam-watch-6');
  const [audio, setAudio] = useState<string>('apple-airpods-pro-2');
  const [workflow, setWorkflow] = useState<string>('power-user');
  
  // --- Loading & Response State ---
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [result, setResult] = useState<SynergyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Workflows Definition ---
  const workflows = [
    { id: 'power-user', label: 'Developer & Power User', desc: 'Prioritizes clipboards, computational power, and quick file sharing.', icon: Cpu, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20' },
    { id: 'creative', label: 'Creative & Media Studio', desc: 'Focuses on lossless audio codecs, high-fidelity color spaces, and video captures.', icon: Palette, color: 'text-purple-400 border-purple-500/30 bg-purple-950/20' },
    { id: 'wellness', label: 'Active Health & Wellness', desc: 'Emphasizes continuous heart tracking, GPS precision, and rugged build materials.', icon: Activity, color: 'text-rose-400 border-rose-500/30 bg-rose-950/20' },
    { id: 'minimalist', label: 'Minimalist Essentialist', desc: 'Values physical weight, multi-functional accessories, and extreme battery life.', icon: Compass, color: 'text-amber-400 border-amber-500/30 bg-amber-950/20' },
  ];

  // --- Handle Blueprint Generation ---
  const generateBlueprint = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      'Orchestrating cross-platform architecture...',
      'Analyzing wireless audio codec latency...',
      'Checking handoff clipboard compatibilities...',
      'Mapping accessory smart sensor profiles...',
      'Synthesizing ultimate hardware sync blueprint...'
    ];

    let currentStep = 0;
    setLoadingStep(steps[currentStep]);
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingStep(steps[currentStep]);
      }
    }, 900);

    try {
      // Find full labels for current device selection
      const phoneLabel = phone === 'sam-s24-ultra' ? 'Samsung Galaxy S24 Ultra' : phone === 'apple-iphone-15-pro' ? 'Apple iPhone 15 Pro' : 'Other Device';
      const watchLabel = watch === 'sam-watch-6' ? 'Samsung Galaxy Watch 6' : watch === 'apple-watch-s9' ? 'Apple Watch Series 9' : 'Other / None';
      const audioLabel = audio === 'apple-airpods-pro-2' ? 'Apple AirPods Pro 2' : audio === 'sam-buds-fe' ? 'Samsung Galaxy Buds FE' : 'Other / None';

      const budgetLimit = activeProfile ? Math.round((activeProfile.monthlyIncome * activeProfile.allocatedPercent) / 100) : null;

      const response = await fetch('/api/ecosystem-synergy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDevices: {
            phone: phoneLabel,
            watch: watchLabel,
            audio: audioLabel
          },
          targetWorkflow: workflows.find(w => w.id === workflow)?.label || 'General Productivity',
          cartItems: cartItems.map(item => ({ name: item.product.name, price: item.product.price })),
          budgetLimit: budgetLimit
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze ecosystem compatibility.');
      }

      const data = await response.json();
      setResult(data);
      triggerNotification('AI Synergy Blueprint synthesized successfully!');
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Locate Recommendable Store Products ---
  const recommendedProducts = useMemo(() => {
    if (!result?.recommendations) return [];
    
    return result.recommendations
      .map(rec => {
        if (!rec.productId) return null;
        const matchingProduct = PRODUCTS.find(p => p.id === rec.productId);
        if (!matchingProduct) return null;
        return {
          ...rec,
          product: matchingProduct
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [result]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-4 md:py-8 font-sans" id="ecosystem-ai-section">
      
      {/* Visual Header */}
      <div className="relative overflow-hidden bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl space-y-3">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-900/60 px-2.5 py-1 rounded-md uppercase">
              Pro Engine Suite
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6.5 h-6.5 text-indigo-400 animate-pulse" />
              Ecosystem AI Architect
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Orchestrate perfect hardware unity. Our advanced model evaluates how cleanly your Samsung and Apple devices sync, identifies features lost to brand friction, and maps custom bridging solutions.
            </p>
          </div>
          
          {activeProfile && (
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 font-mono text-sm font-bold">
                $
              </div>
              <div className="text-left">
                <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-widest font-extrabold">Active Budget Limit</span>
                <span className="text-xs font-bold text-slate-200">
                  ${Math.round((activeProfile.monthlyIncome * activeProfile.allocatedPercent) / 100).toLocaleString()} Applied
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Configuration (Grid Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 border border-slate-900/90 rounded-3xl p-6 shadow-xl space-y-6 text-left">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2 pb-3 border-b border-slate-900">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              Your Device Configuration
            </h3>

            {/* Phone Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold">Primary Smartphone</label>
              <select 
                id="device-selector-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="sam-s24-ultra">Samsung Galaxy S24 Ultra (Flagship Android)</option>
                <option value="apple-iphone-15-pro">Apple iPhone 15 Pro Max (Flagship iOS)</option>
                <option value="generic">Other / Independent Phone</option>
              </select>
            </div>

            {/* Smart Watch Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold">Smart Wearable</label>
              <select 
                id="device-selector-watch"
                value={watch}
                onChange={(e) => setWatch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="sam-watch-6">Samsung Galaxy Watch 6 Classic</option>
                <option value="apple-watch-s9">Apple Watch Series 9 GPS</option>
                <option value="none">None / Standard Analog Watch</option>
              </select>
            </div>

            {/* Audio Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold">Wireless Audio</label>
              <select 
                id="device-selector-audio"
                value={audio}
                onChange={(e) => setAudio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="apple-airpods-pro-2">Apple AirPods Pro 2 (with USB-C Case)</option>
                <option value="sam-buds-fe">Samsung Galaxy Buds FE (Elite Audio)</option>
                <option value="none">None / Over-Ear Wired Headphones</option>
              </select>
            </div>

            {/* Workflows Select */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold">Target Lifestyle Workflow</label>
              <div className="grid grid-cols-1 gap-2.5">
                {workflows.map((wf) => {
                  const Icon = wf.icon;
                  const isSelected = workflow === wf.id;
                  return (
                    <button
                      key={wf.id}
                      onClick={() => setWorkflow(wf.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md' 
                          : 'bg-slate-900/30 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-850 text-slate-400'}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-sans">{wf.label}</h4>
                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{wf.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={generateBlueprint}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-sans text-xs font-extrabold uppercase tracking-widest rounded-2xl cursor-pointer shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 select-none"
            >
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
              <span>{isLoading ? 'Architecting Blueprint...' : 'Synthesize Synergy Blueprint'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Display & Recommendations (Grid Span 7) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            
            {/* 1. INITIAL PLACEHOLDER STATE */}
            {!isLoading && !result && !error && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-950 border border-slate-900/90 rounded-3xl p-8 md:p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[500px]"
              >
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-xl relative">
                  <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                </div>
                
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-lg font-bold text-white tracking-tight">Ecosystem Simulator Idle</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Select your current hand-held configurations and click <span className="text-indigo-400 font-semibold">"Synthesize Synergy"</span> to query our professional model for platform-bridging setup advice.
                  </p>
                </div>

                <div className="text-[10px] font-mono text-slate-500 tracking-wider bg-slate-900/60 px-4 py-2 border border-slate-850 rounded-xl">
                  SHORTCUT: CMD + K TO FOCUS SEARCH
                </div>
              </motion.div>
            )}

            {/* 2. LOADING STATE */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-slate-950 border border-slate-900/90 rounded-3xl p-8 md:p-12 text-center space-y-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
              >
                {/* Glowing ring animation */}
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-indigo-500 flex items-center justify-center animate-spin relative">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-b-purple-400 animate-spin-reverse absolute" />
                </div>

                <div className="space-y-3 max-w-sm">
                  <h3 className="text-lg font-bold text-white tracking-tight animate-pulse">Consulting Pro Engine</h3>
                  <p className="text-xs text-slate-400 leading-normal h-4 text-indigo-300 font-semibold">
                    {loadingStep}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest pt-2">
                    ESTIMATED CALCULATION LATENCY: 2.4 SEC
                  </p>
                </div>
              </motion.div>
            )}

            {/* 3. ERROR STATE */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-950 border border-red-500/20 rounded-3xl p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h3 className="text-base font-bold text-white">Architect Analysis Blocked</h3>
                  <p className="text-xs text-red-400 leading-normal bg-red-950/20 p-4 border border-red-900/30 rounded-2xl">
                    {error}
                  </p>
                </div>

                <button
                  onClick={generateBlueprint}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer"
                >
                  Attempt Re-Synergy
                </button>
              </motion.div>
            )}

            {/* 4. RESULTS DISPLAY */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                
                {/* Score & Analysis Ring Banner */}
                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Ring score */}
                    <div className="w-28 h-28 rounded-full bg-slate-900 border border-slate-850 flex flex-col items-center justify-center relative shrink-0 shadow-lg">
                      <span className="text-3xl font-mono font-black text-indigo-400 leading-none">{result.score}%</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase font-bold tracking-widest mt-1">Synergy</span>
                      
                      {/* Radial outline border glow */}
                      <svg className="absolute inset-0 w-full h-full -rotate-95">
                        <circle 
                          cx="56" 
                          cy="56" 
                          r="52" 
                          className="stroke-slate-800 fill-transparent" 
                          strokeWidth="3"
                        />
                        <circle 
                          cx="56" 
                          cy="56" 
                          r="52" 
                          className="stroke-indigo-500 fill-transparent" 
                          strokeWidth="3.5"
                          strokeDasharray="326.7"
                          strokeDashoffset={326.7 - (326.7 * result.score) / 100}
                        />
                      </svg>
                    </div>

                    {/* Quick Analysis text */}
                    <div className="text-left space-y-2">
                      <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-950/60 border border-indigo-900/40 px-2.5 py-0.5 rounded-md font-bold inline-block">
                        Compatibility Diagnostic
                      </span>
                      <h4 className="text-lg font-bold text-white tracking-tight leading-snug">
                        {result.score >= 85 ? 'Highly Harmonized System' : result.score >= 60 ? 'Partially Disjointed Ecosystem' : 'Significant Integration Bottlenecks'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {result.analysis}
                      </p>
                    </div>
                  </div>

                  {/* Pros & Cons Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-6">
                    {/* Pros */}
                    <div className="space-y-3 text-left">
                      <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hardware Assets
                      </span>
                      <ul className="space-y-2">
                        {result.pros.map((pro, idx) => (
                          <li key={idx} className="text-2xs text-slate-300 flex items-start gap-1.5 leading-normal">
                            <span className="text-emerald-500 font-extrabold select-none">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="space-y-3 text-left">
                      <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Brand Friction
                      </span>
                      <ul className="space-y-2">
                        {result.cons.map((con, idx) => (
                          <li key={idx} className="text-2xs text-slate-300 flex items-start gap-1.5 leading-normal">
                            <span className="text-rose-400 font-extrabold select-none">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Markdown Blueprint Panel */}
                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-xl text-left space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-extrabold">Bespoke Synergy Blueprint</h3>
                  </div>

                  {/* Render using markdown */}
                  <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed space-y-4 font-sans text-xs">
                    <Markdown>{result.blueprint}</Markdown>
                  </div>
                </div>

                {/* Recommendations Carousel */}
                {recommendedProducts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-left text-sm font-mono uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5 pl-1">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      Suggested Hardware Bridges
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {recommendedProducts.map((rec, index) => {
                        const product = rec.product;
                        return (
                          <motion.div
                            key={product.id}
                            id={`recommended-card-${product.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-950 border border-slate-900 hover:border-indigo-900/50 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all group"
                          >
                            <div className="flex items-center gap-4 text-left">
                              {/* Product Hardware Mockup Circle representation */}
                              <div className={`w-14 h-14 rounded-2xl ${product.image} flex items-center justify-center text-white text-[10px] font-mono font-bold shrink-0 shadow-lg relative overflow-hidden`}>
                                <span className="relative z-10">{product.brand.charAt(0)}{product.category.charAt(0)}</span>
                                <div className="absolute inset-0 bg-black/15 pointer-events-none" />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{product.brand}</span>
                                  <span className="text-[8px] font-mono font-bold text-indigo-400 bg-indigo-950 border border-indigo-900/40 px-1.5 rounded-sm">RECOMMENDED</span>
                                </div>
                                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">{product.name}</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed max-w-md">{rec.reason}</p>
                              </div>
                            </div>

                            <div className="flex items-center sm:flex-col items-end gap-4 sm:gap-2 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-900 pt-4 sm:pt-0">
                              <div className="text-left sm:text-right flex-1 sm:flex-none">
                                <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Catalog Price</span>
                                <span className="text-sm font-mono font-extrabold text-white">${product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-[10px] font-mono text-slate-500 line-through ml-1.5">${product.originalPrice}</span>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  onAddToCart(product, product.colors[0]);
                                  triggerNotification(`Added ${product.name} to your session cart!`);
                                }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-2xs font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Dynamic Ecosystem Connector Constellations */}
      {result && (
        <>
          {/* Active device select connections in simulator panel */}
          <EcosystemConnectorLine
            fromSelector="#device-selector-phone"
            toSelector="#device-selector-watch"
            label="SmartThings Sync"
            color="indigo"
          />
          <EcosystemConnectorLine
            fromSelector="#device-selector-phone"
            toSelector="#device-selector-audio"
            label="Quick Share Stream"
            color="cyan"
          />

          {/* Dynamic Laser Links to Recommended bridges */}
          {recommendedProducts.map((rec) => {
            const product = rec.product;
            let targetSelector = '#device-selector-phone';
            let label = 'Handoff Channel';
            let color: 'cyan' | 'indigo' | 'emerald' | 'amber' = 'emerald';

            if (product.category === 'Wearables') {
              targetSelector = '#device-selector-watch';
              label = 'Health Link';
              color = 'amber';
            } else if (product.category === 'Audio') {
              targetSelector = '#device-selector-audio';
              label = 'Acoustic Bridge';
              color = 'cyan';
            }

            return (
              <EcosystemConnectorLine
                key={product.id}
                fromSelector={`#recommended-card-${product.id}`}
                toSelector={targetSelector}
                label={label}
                color={color}
              />
            );
          })}
        </>
      )}

    </div>
  );
}
