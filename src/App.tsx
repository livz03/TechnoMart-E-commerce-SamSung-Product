import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Layers, 
  Coins, 
  History, 
  Search, 
  ShoppingCart, 
  Trash2, 
  SlidersHorizontal, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Info,
  X,
  ClipboardList,
  Truck,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu
} from 'lucide-react';

import { PRODUCTS } from './data/products';
import { Product, CartItem, Order, BudgetProfile, IncomeTierType, CategoryType, BrandType } from './types';
import BudgetProfiler from './components/BudgetProfiler';
import ProductCompare from './components/ProductCompare';
import ProductDetailModal from './components/ProductDetailModal';
import CheckoutModal from './components/CheckoutModal';
import ProductCard from './components/ProductCard';
import EcosystemAI from './components/EcosystemAI';

import { auth, googleAuthProvider, signInWithPopup } from './lib/firebase.ts';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function App() {
  const isNepalMarket = true;
  const convertToNPR = (usd: number) => Math.round(usd * 134);
  const formatPrice = (usd: number) => {
    if (isNepalMarket) {
      return `रू ${convertToNPR(usd).toLocaleString('en-NP')}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  // --- Auth & Sync States ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // --- Core States ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tech_tier_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [activeProfile, setActiveProfile] = useState<BudgetProfile | null>(null);

  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'profiler' | 'compare' | 'orders' | 'ai-architect'>('catalog');
  
  // --- Catalog Filters ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<BrandType | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All' | 'Popular in Nepal'>('All');
  const [selectedTier, setSelectedTier] = useState<IncomeTierType | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(99999);

  // --- Trade-In System States ---
  const [tradeInDevice, setTradeInDevice] = useState<string>('');
  const [tradeInDiscount, setTradeInDiscount] = useState<number>(0);

  // --- Modals Toggle ---
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // --- Modern UI & Focus States ---
  const [currentHeroSlide, setCurrentHeroSlide] = useState<number>(0);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- Keyboard Shortcuts & Focus Scroll Listener ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K or '/' key triggers search input focus
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (activeTab === 'catalog') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab]);

  // --- Auto-advance Hero Carousel Slide ---
  useEffect(() => {
    if (activeTab !== 'catalog') return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // --- Auth State Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Verify & register user with Express + Cloud SQL
          const res = await fetch('/api/auth-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.ok) {
            const data = await res.json();
            setUser(firebaseUser);
            
            // Sync user budget profile
            if (data.profile) {
              setActiveProfile({
                monthlyIncome: data.profile.monthlyIncome,
                allocatedPercent: data.profile.allocatedPercent,
                priority: data.profile.priority
              });
            } else {
              // Fallback to local profile if present
              const localProfile = localStorage.getItem('tech_tier_profile');
              if (localProfile) {
                const parsed = JSON.parse(localProfile);
                setActiveProfile(parsed);
                // Sync local profile to the cloud
                await fetch('/api/budget-profile', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(parsed)
                });
              }
            }

            // Fetch user transaction history from PostgreSQL
            const ordersRes = await fetch('/api/orders', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              setOrders(ordersData.orders);
            }
          } else {
            console.error("Auth sync request failed.");
            setUser(null);
          }
        } catch (err) {
          console.error("Error synchronising session with PostgreSQL backend:", err);
          setUser(null);
        }
      } else {
        // Logged out
        setUser(null);
        setOrders(() => {
          try {
            const saved = localStorage.getItem('tech_tier_orders');
            return saved ? JSON.parse(saved) : [];
          } catch {
            return [];
          }
        });
        setActiveProfile(() => {
          try {
            const saved = localStorage.getItem('tech_tier_profile');
            return saved ? JSON.parse(saved) : null;
          } catch {
            return null;
          }
        });
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Sync local cart ---
  useEffect(() => {
    localStorage.setItem('tech_tier_cart', JSON.stringify(cart));
  }, [cart]);

  // --- Sync unauthenticated orders & profile to localStorage ---
  useEffect(() => {
    if (!user) {
      localStorage.setItem('tech_tier_orders', JSON.stringify(orders));
    }
  }, [orders, user]);

  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem('tech_tier_profile', JSON.stringify(activeProfile));
    } else {
      localStorage.removeItem('tech_tier_profile');
    }
  }, [activeProfile]);

  // --- Notification Toast Trigger ---
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Cart Actions ---
  const handleAddToCart = (product: Product, color: string, options?: { storage?: string; warranty?: boolean }) => {
    const storageKey = options?.storage || 'Standard';
    const hasWarranty = options?.warranty || false;
    
    // Calculate custom item price based on configurations
    let itemPrice = product.price;
    if (storageKey === '256GB') itemPrice += 100;
    if (storageKey === '512GB') itemPrice += 250;
    if (hasWarranty) itemPrice += 49;

    // Create a modified temporary product item to reflect correct pricing in cart
    const configuredProduct = {
      ...product,
      price: itemPrice,
      name: `${product.name} ${storageKey !== 'Standard' ? `(${storageKey})` : ''}${hasWarranty ? ' + Care' : ''}`,
    };

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.selectedColor === color &&
          item.product.name === configuredProduct.name
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [...prevCart, { product: configuredProduct, quantity: 1, selectedColor: color }];
      }
    });

    triggerNotification(`Added ${configuredProduct.name} (${color}) to your shopping cart.`);
    setDetailProduct(null); // Close detail modal if open
  };

  const handleSimpleAddToCart = (product: Product, color: string) => {
    handleAddToCart(product, color);
  };

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
    triggerNotification('Item removed from cart.');
  };

  // --- Compare Actions ---
  const handleCompareToggle = (product: Product) => {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        if (prev.length >= 3) {
          triggerNotification('You can compare a maximum of 3 products side-by-side.');
          return prev;
        }
        triggerNotification(`Added ${product.name} to comparison sheet.`);
        return [...prev, product];
      }
    });
  };

  // --- Budget Profiler Callback ---
  const handleApplyProfileFilter = async (tier: IncomeTierType | 'all', maxSpend: number, customProfile?: BudgetProfile) => {
    setSelectedTier(tier);
    setMaxPrice(maxSpend);
    if (customProfile) {
      setActiveProfile(customProfile);
      
      // Persist to Cloud SQL if user is authenticated
      if (user) {
        try {
          const token = await user.getIdToken();
          await fetch('/api/budget-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(customProfile)
          });
        } catch (err) {
          console.error("Failed to sync budget profile with server:", err);
        }
      }
    }
    setActiveTab('catalog'); // Switch to catalog to show results immediately
  };

  // --- Order Complete Callback ---
  const handleOrderSuccess = async (newOrder: Order) => {
    // Deduct stock levels in real-time for each purchased item
    newOrder.items.forEach((item) => {
      const p = PRODUCTS.find((prod) => prod.id === item.product.id);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    });

    setCart([]); // Flush cart
    setIsCheckoutOpen(false);
    triggerNotification(`Order ${newOrder.id} successfully completed!`);

    if (user) {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newOrder)
        });

        if (res.ok) {
          // Re-fetch transactions to maintain real-time source-of-truth status
          const ordersRes = await fetch('/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData.orders);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to persist order to Cloud SQL:", err);
      }
    }

    // Default or fallback local insertion
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleAdvanceOrderStatus = async (orderId: string) => {
    const orderIndex = orders.findIndex((ord) => ord.id === orderId);
    if (orderIndex === -1) return;
    
    const currentStatus = orders[orderIndex].status;
    let nextStatus: 'Processing' | 'Shipped' | 'Delivered' = 'Processing';
    if (currentStatus === 'Processing') {
      nextStatus = 'Shipped';
      triggerNotification(`Dispatch: Order ${orderId} has left our regional warehouse!`);
    } else if (currentStatus === 'Shipped') {
      nextStatus = 'Delivered';
      triggerNotification(`Arrival: Order ${orderId} is now marked as delivered!`);
    } else {
      return; // Already delivered
    }

    if (user) {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/orders/${orderId}/advance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });

        if (res.ok) {
          setOrders((prevOrders) =>
            prevOrders.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
          );
          return;
        }
      } catch (err) {
        console.error("Failed to advance order milestone on server:", err);
      }
    }

    // Local state fallback update
    setOrders((prevOrders) => {
      const updated = prevOrders.map((ord) => {
        if (ord.id === orderId) {
          return { ...ord, status: nextStatus };
        }
        return ord;
      });
      return updated;
    });
  };

  // --- Filter Products Lists ---
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // 1. Search Query Match
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Brand Match
      const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;

      // 3. Category Match
      const matchesCategory = 
        selectedCategory === 'All' ? true :
        selectedCategory === 'Popular in Nepal' ? !!product.isNepalPopular :
        product.category === selectedCategory;

      // 4. Income Tier Match
      const matchesTier = selectedTier === 'all' || product.tier === selectedTier;

      // 5. Price ceiling Match
      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesBrand && matchesCategory && matchesTier && matchesPrice;
    });
  }, [searchQuery, selectedBrand, selectedCategory, selectedTier, maxPrice]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartTotalItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const isSynergyEligible = useMemo(() => {
    const hasPhone = cart.some(item => item.product.category === 'Phones' && item.product.brand === 'Samsung');
    const hasWatch = cart.some(item => item.product.category === 'Wearables' && item.product.brand === 'Samsung');
    const hasBuds = cart.some(item => item.product.category === 'Audio' && item.product.brand === 'Samsung');
    return hasPhone && hasWatch && hasBuds;
  }, [cart]);

  const ecosystemDiscount = useMemo(() => {
    return isSynergyEligible ? Math.round(cartSubtotal * 0.15) : 0;
  }, [isSynergyEligible, cartSubtotal]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Toast Notification Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 max-w-sm w-full"
          >
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span className="flex-1 truncate">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>


      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900/85 px-4 py-3.5 md:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-mono font-bold text-base shadow-lg relative overflow-hidden group">
              <span className="relative z-10 font-black tracking-tighter text-indigo-400">TM</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                TechnoMart
                <span className="text-[9px] font-mono font-extrabold bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-2 py-0.5 rounded-md shadow-2xs uppercase tracking-wider">TECHNO ENGINE</span>
              </h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                ECOSYSTEM COMPATIBILITY ENGINE & SHOWCASE
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop only) */}
          <nav className="hidden md:flex bg-slate-900/50 border border-slate-800/80 p-1 rounded-2xl text-xs font-semibold gap-1">
            <button
              onClick={() => { setActiveTab('catalog'); }}
              className={`px-4 py-2 rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'catalog' 
                  ? 'bg-slate-800 text-white shadow-xs font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Catalog</span>
            </button>
            <button
              onClick={() => { setActiveTab('profiler'); }}
              className={`px-4 py-2 rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'profiler' 
                  ? 'bg-slate-800 text-white shadow-xs font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Advisor</span>
            </button>
            <button
              onClick={() => { setActiveTab('ai-architect'); }}
              className={`px-4 py-2 rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'ai-architect' 
                  ? 'bg-slate-800 text-white shadow-xs font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Ecosystem AI</span>
            </button>
            <button
              onClick={() => { setActiveTab('compare'); }}
              className={`px-4 py-2 rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'compare' 
                  ? 'bg-slate-800 text-white shadow-xs font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>Compare</span>
              {comparedProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-pulse shadow-sm">
                  {comparedProducts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('orders'); }}
              className={`px-4 py-2 rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'orders' 
                  ? 'bg-slate-800 text-white shadow-xs font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>Invoices</span>
              {orders.length > 0 && (
                <span className="bg-slate-800 text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded-md font-bold ml-1">
                  {orders.length}
                </span>
              )}
            </button>
          </nav>

          {/* Cart triggers, Auth, & Hamburger menu */}
          <div className="flex items-center gap-2.5">
            {activeProfile && (
              <div 
                onClick={() => { setActiveTab('profiler'); }}
                className="hidden lg:flex items-center gap-2 cursor-pointer border border-slate-800/60 bg-indigo-950/30 px-3.5 py-1.5 rounded-xl hover:bg-indigo-950/50 hover:border-slate-800 transition-all duration-200"
              >
                <div className="text-left">
                  <span className="text-[8px] font-mono text-indigo-400 block uppercase tracking-widest font-bold">ACTIVE FILTER</span>
                  <span className="text-xs font-bold text-indigo-200 font-sans block mt-0.5">
                    ${((activeProfile.monthlyIncome * activeProfile.allocatedPercent) / 100).toLocaleString()} Limit
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition duration-200 flex items-center gap-2 text-xs font-bold relative cursor-pointer shadow-md hover:shadow-lg shrink-0"
            >
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              <span className="font-sans hidden sm:inline-block">Cart ({cartTotalItemCount})</span>
              <span className="font-sans sm:hidden">{cartTotalItemCount}</span>
              <span className="font-mono text-indigo-300 font-bold hidden sm:inline-block border-l border-slate-800 pl-2 ml-1">${cartSubtotal.toLocaleString()}</span>
            </button>

            {/* Google Authentication Section (Desktop only, collapsed on mobile menu) */}
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
              {isLoadingAuth ? (
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              ) : user ? (
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-800"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:block text-left text-xs">
                    <span className="block font-bold text-slate-100 truncate max-w-[110px]">{user.displayName || 'Client'}</span>
                    <button 
                      onClick={() => signOut(auth)}
                      className="block text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold tracking-tight cursor-pointer text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                  <button 
                    onClick={() => signOut(auth)}
                    className="xl:hidden text-slate-400 hover:text-white p-1.5 hover:bg-slate-900 rounded-lg cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await signInWithPopup(auth, googleAuthProvider);
                      triggerNotification("Signed in successfully with Google!");
                    } catch (err: any) {
                      console.error("Sign in failed:", err);
                      triggerNotification("Sign in failed. Please try again.");
                    }
                  }}
                  className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 px-3.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-inner"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Hamburger Responsive Toggle (Three small lines menu) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all duration-200 cursor-pointer shadow-md relative shrink-0"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-4" />
              {comparedProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-mono text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {comparedProducts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* RESPONSIVE HAMBURGER MENU DROPDOWN PANEL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs"
            />
            {/* Dropdown Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed right-4 top-20 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl shadow-2xl space-y-4 text-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Navigation</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Options */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setActiveTab('catalog'); setIsMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-2xl transition duration-200 flex items-center justify-between cursor-pointer ${
                    activeTab === 'catalog' 
                      ? 'bg-indigo-600/10 border border-indigo-500/25 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Catalog</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => { setActiveTab('profiler'); setIsMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-2xl transition duration-200 flex items-center justify-between cursor-pointer ${
                    activeTab === 'profiler' 
                      ? 'bg-amber-600/10 border border-amber-500/25 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Smart Advisor</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => { setActiveTab('ai-architect'); setIsMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-2xl transition duration-200 flex items-center justify-between cursor-pointer ${
                    activeTab === 'ai-architect' 
                      ? 'bg-violet-600/10 border border-violet-500/25 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span>Ecosystem AI</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => { setActiveTab('compare'); setIsMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-2xl transition duration-200 flex items-center justify-between cursor-pointer ${
                    activeTab === 'compare' 
                      ? 'bg-blue-600/10 border border-blue-500/25 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                    <span>Compare</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {comparedProducts.length > 0 && (
                      <span className="bg-indigo-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
                        {comparedProducts.length}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-2xl transition duration-200 flex items-center justify-between cursor-pointer ${
                    activeTab === 'orders' 
                      ? 'bg-emerald-600/10 border border-emerald-500/25 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4 text-emerald-400" />
                    <span>Invoices</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {orders.length > 0 && (
                      <span className="bg-emerald-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
                        {orders.length}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </button>
              </div>

              {/* Active Profile Info (Quick Display inside Dropdown) */}
              {activeProfile && (
                <div 
                  onClick={() => { setActiveTab('profiler'); setIsMobileMenuOpen(false); }}
                  className="bg-indigo-950/40 border border-indigo-900/40 p-3 rounded-2xl cursor-pointer hover:bg-indigo-950/60 transition duration-150 text-left space-y-1"
                >
                  <span className="text-[8px] font-mono text-indigo-400 block uppercase tracking-widest font-bold">ACTIVE BUDGET PROFILE</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans font-bold text-indigo-200">
                      ${((activeProfile.monthlyIncome * activeProfile.allocatedPercent) / 100).toLocaleString()} Limit
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{activeProfile.priority} Priority</span>
                  </div>
                </div>
              )}

              {/* Auth details in menu for mobile */}
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-950/30 p-2.5 rounded-2xl">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full border border-slate-800"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-left text-xs">
                        <span className="block font-bold text-slate-100 truncate max-w-[150px]">{user.displayName || 'Client'}</span>
                        <span className="block text-[9px] font-mono text-slate-500 truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { signOut(auth); setIsMobileMenuOpen(false); }}
                      className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 hover:text-red-300 font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        await signInWithPopup(auth, googleAuthProvider);
                        triggerNotification("Signed in successfully with Google!");
                        setIsMobileMenuOpen(false);
                      } catch (err: any) {
                        console.error("Sign in failed:", err);
                        triggerNotification("Sign in failed. Please try again.");
                      }
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HERO BANNER SECTION (Shows only on primary catalog) */}
      {activeTab === 'catalog' && (
        <section className="relative w-full overflow-hidden border-b border-slate-900 bg-slate-950">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

          <AnimatePresence mode="wait">
            {currentHeroSlide === 0 && (
              <motion.div
                key="slide0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5 text-left">
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-900/40 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest inline-block">
                    ★ Titanium Engineering Meets AI
                  </span>
                  <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tight leading-none text-white">
                    Galaxy S24 Ultra.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-stone-400 to-zinc-500">Built with Titanium Strength.</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
                    Featuring a rugged titanium chassis, built-in S Pen stylus, revolutionary 200MP camera system, and integrated Galaxy AI productivity tools. Map this flagship to your active workspace now.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        const ultraItem = PRODUCTS.find(p => p.id === 'sam-s24-ultra');
                        if (ultraItem) handleSimpleAddToCart(ultraItem, 'Titanium Gray');
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold px-6 py-3 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      Instant Add to Cart
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>
                    <button
                      onClick={() => setActiveTab('ai-architect')}
                      className="bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-900 text-indigo-300 text-xs font-semibold px-5 py-3 rounded-xl transition duration-150 cursor-pointer"
                    >
                      Run Ecosystem Compatibility
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-64 h-80 rounded-3xl bg-gradient-to-tr from-stone-500 via-slate-800 to-zinc-900 p-1 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-slate-950/30 rounded-3xl" />
                    <div className="absolute inset-x-0 bottom-4 px-4 text-center z-10">
                      <span className="text-[9px] font-mono text-amber-300 tracking-widest block uppercase font-bold">Featured Flagship</span>
                      <span className="text-sm font-bold text-white mt-1 block">Galaxy S24 Ultra</span>
                    </div>
                    {/* Abstract screen simulation */}
                    <div className="w-full h-full border border-stone-600/40 rounded-3xl flex items-center justify-center">
                      <div className="w-40 h-56 border-2 border-stone-700/50 rounded-xl bg-slate-950/60 p-3 text-left space-y-2 flex flex-col justify-between">
                        <span className="text-[8px] font-mono text-slate-500">Galaxy AI active</span>
                        <div className="space-y-1">
                          <div className="w-8 h-1 bg-amber-400 rounded-xs" />
                          <div className="w-16 h-1.5 bg-white rounded-xs" />
                          <div className="w-12 h-1 bg-slate-700 rounded-xs" />
                        </div>
                        <div className="text-[9px] font-mono text-right text-stone-400">$1,299</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentHeroSlide === 1 && (
              <motion.div
                key="slide1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5 text-left">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest inline-block">
                    ✦ Next-Gen Foldable Tech
                  </span>
                  <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tight leading-none text-white">
                    Galaxy Z Fold 5.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Unfold desktop productivity.</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
                    Unfold a cinematic 7.6" AMOLED workspace for high-efficiency multi-tasking. Support for floating windows, intuitive bottom-dock taskbars, and custom S Pen integration.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        const foldItem = PRODUCTS.find(p => p.id === 'sam-fold-5');
                        if (foldItem) handleSimpleAddToCart(foldItem, 'Icy Blue');
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold px-6 py-3 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      Instant Add to Cart
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('profiler'); }}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold px-5 py-3 rounded-xl transition duration-150 cursor-pointer"
                    >
                      Analyze Budget Match
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-64 h-80 rounded-3xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-indigo-950 p-1 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-slate-950/30 rounded-3xl" />
                    <div className="absolute inset-x-0 bottom-4 px-4 text-center z-10">
                      <span className="text-[9px] font-mono text-cyan-300 tracking-widest block uppercase font-bold">Uncompromising View</span>
                      <span className="text-sm font-bold text-white mt-1 block">Galaxy Z Fold 5</span>
                    </div>
                    {/* Foldable screen simulation */}
                    <div className="w-full h-full border border-cyan-800/30 rounded-3xl flex items-center justify-center">
                      <div className="w-44 h-56 border border-cyan-900 rounded-xl bg-slate-950/80 p-3 text-left flex justify-between gap-1">
                        <div className="flex-1 border-r border-slate-800 pr-1 flex flex-col justify-between">
                          <span className="text-[6px] font-mono text-slate-500">Left Pane</span>
                          <div className="w-full h-10 bg-slate-900/60 rounded-xs" />
                        </div>
                        <div className="flex-1 pl-1 flex flex-col justify-between text-right">
                          <span className="text-[6px] font-mono text-cyan-400">Taskbar OS</span>
                          <div className="w-full h-10 bg-cyan-950/40 rounded-xs" />
                          <span className="text-[8px] font-mono text-slate-300">$1,799</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentHeroSlide === 2 && (
              <motion.div
                key="slide2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5 text-left">
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 border border-blue-900/40 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest inline-block">
                    ✦ Absolute Laptop Powerhouse
                  </span>
                  <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tight leading-none text-white">
                    Galaxy Book4 Ultra.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Studio Creators Unleashed.</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
                    Powered by the state-of-the-art Intel Core Ultra 9 processor with hardware-accelerated NVIDIA RTX 4070 graphics. A magnificent 16" 3K AMOLED touchscreen designed for masterwork creator workflow.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        const laptopItem = PRODUCTS.find(p => p.id === 'sam-book4-ultra');
                        if (laptopItem) handleSimpleAddToCart(laptopItem, 'Moonstone Gray');
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold px-6 py-3 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      Instant Add to Cart
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold px-5 py-3 rounded-xl transition duration-150 cursor-pointer"
                    >
                      Explore Full Catalog
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-64 h-80 rounded-3xl bg-gradient-to-tr from-slate-800 via-slate-950 to-blue-950 p-1 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-slate-950/30 rounded-3xl" />
                    <div className="absolute inset-x-0 bottom-4 px-4 text-center z-10">
                      <span className="text-[9px] font-mono text-indigo-300 tracking-widest block uppercase font-bold">Ultimate Creator</span>
                      <span className="text-sm font-bold text-white mt-1 block">Galaxy Book4 Ultra</span>
                    </div>
                    {/* Laptop visual representation */}
                    <div className="w-full h-full border border-slate-700/30 rounded-3xl flex items-center justify-center">
                      <div className="w-44 h-44 border border-indigo-900 rounded-xl bg-slate-950/80 p-3 text-left flex flex-col justify-between">
                        <span className="text-[6px] font-mono text-indigo-400">Core Ultra 9 NPU</span>
                        <div className="space-y-1">
                          <div className="h-10 bg-indigo-950/50 rounded-xs border border-indigo-900/30 flex items-center justify-center">
                            <span className="text-[8px] font-mono text-slate-300">RTX 4070 active</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-right text-slate-400">$2,399</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Carousel dots indicators */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-25">
            {[0, 1, 2].map((slideIdx) => (
              <button
                key={slideIdx}
                onClick={() => setCurrentHeroSlide(slideIdx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentHeroSlide === slideIdx 
                    ? 'bg-blue-500 w-6 shadow-xs shadow-blue-500/50' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                aria-label={`Go to slide ${slideIdx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* CORE CONTENT SWITCHBOARD */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-1">
        
        {/* TAB 1: PRODUCT CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-8" id="catalog-display">
            
            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-6.5 shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search Text field */}
                <div className="relative w-full md:w-85">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4 text-indigo-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search model, specs, ANC, titanium..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-slate-950 focus:outline-hidden transition-all duration-200 font-sans text-slate-100 placeholder-slate-500 font-medium"
                  />
                </div>

                {/* Clear all active filters indicator */}
                {(selectedBrand !== 'All' || selectedCategory !== 'All' || selectedTier !== 'all' || searchQuery || maxPrice < 99999) && (
                  <button
                    onClick={() => {
                      setSelectedBrand('All');
                      setSelectedCategory('All');
                      setSelectedTier('all');
                      setSearchQuery('');
                      setMaxPrice(99999);
                    }}
                    className="text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 py-1.5 px-4 bg-indigo-950/40 hover:bg-indigo-950/80 rounded-xl transition cursor-pointer border border-indigo-900/40"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4.5 border-t border-slate-800">
                {/* Brand Selection */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">Filter Brand</span>
                  <div className="flex gap-1.5">
                    {['All', 'Samsung', 'Apple'].map((br) => (
                      <button
                        key={br}
                        onClick={() => setSelectedBrand(br as any)}
                        className={`flex-1 py-2 px-3 text-2xs rounded-xl border font-bold transition duration-150 cursor-pointer ${
                          selectedBrand === br
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/15'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {br === 'Apple' ? 'Apple (AirPods)' : br}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">Category</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Popular in Nepal', 'Phones', 'Audio', 'Wearables', 'Tablets', 'Laptops', 'Smart Home'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat as any)}
                        className={`py-2 px-3 text-2xs rounded-xl border font-bold transition duration-150 cursor-pointer ${
                          selectedCategory === cat
                            ? cat === 'Popular in Nepal'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/15'
                              : 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/15'
                            : cat === 'Popular in Nepal'
                              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/40 hover:text-emerald-300'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {cat === 'Popular in Nepal' ? '🇳🇵 Popular in Nepal' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier Selection */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">Income & Budget Tier</span>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'all', label: 'All Tiers' },
                      { id: 'budget', label: 'Budget' },
                      { id: 'balanced', label: 'Balanced' },
                      { id: 'premium', label: 'Premium' },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id as any)}
                        className={`flex-1 py-2 px-2 text-2xs rounded-xl border font-extrabold transition duration-150 cursor-pointer ${
                          selectedTier === tier.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/15'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slider for custom price limit */}
              {maxPrice < 99999 && (
                <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-900/50 flex items-center justify-between text-xs">
                  <span className="text-indigo-200 font-medium flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-400" />
                    Showing products under your configured allocation of <strong className="font-mono text-white">${maxPrice}</strong>
                  </span>
                  <button
                    onClick={() => setMaxPrice(99999)}
                    className="text-indigo-400 hover:text-indigo-300 font-bold font-mono cursor-pointer"
                  >
                    Remove Cap
                  </button>
                </div>
              )}
            </div>

            {/* PRODUCT CATALOG GRID */}
            <div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs font-mono text-gray-400">
                  Showing {filteredProducts.length} of {PRODUCTS.length} curated listings
                </span>
                {selectedTier !== 'all' && (
                  <span className="text-xs text-gray-600">
                    Filtered by: <strong className="capitalize text-indigo-600 font-semibold">{selectedTier} Level</strong>
                  </span>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-lg mx-auto">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No products match your filters</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    We couldn't find any products matching those parameters. Try clearing some filters or updating your active Budget Profile in the profiler tab to match other tiers.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedBrand('All');
                      setSelectedCategory('All');
                      setSelectedTier('all');
                      setSearchQuery('');
                      setMaxPrice(99999);
                    }}
                    className="mt-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 16, scale: 0.98 },
                        show: { opacity: 1, y: 0, scale: 1 }
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      layout
                    >
                      <ProductCard
                        product={product}
                        onExplore={setDetailProduct}
                        onCompareToggle={handleCompareToggle}
                        isCompared={comparedProducts.some((p) => p.id === product.id)}
                        onAddToCart={handleSimpleAddToCart}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* INTERACTIVE TRADE-IN ESTIMATOR & BENEFIT CARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 border border-slate-800 text-white rounded-3xl p-6 md:p-8.5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
              
              <div className="lg:col-span-1 space-y-4 relative z-10 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-900/50 px-2.5 py-1 rounded-md font-bold inline-block">
                    Flagship Trade-In Hub
                  </span>
                  <h3 className="text-xl font-bold tracking-tight font-sans">Recycle & Upgrade</h3>
                  <p className="text-2xs text-slate-400 leading-relaxed font-sans">
                    Have an older device? Get real-time appraisal credits applied directly to your current session cart. Upgrade responsibly and save on flagship hardware.
                  </p>
                </div>
                
                {/* Device selection dropdown */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold">Select previous device</label>
                  <select 
                    value={tradeInDevice}
                    onChange={(e) => {
                      const device = e.target.value;
                      setTradeInDevice(device);
                      let credit = 0;
                      if (device === 'S22 Ultra') credit = 350;
                      else if (device === 'S21 / S22') credit = 220;
                      else if (device === 'iPhone 13 Pro') credit = 300;
                      else if (device === 'iPhone 11 / 12') credit = 180;
                      else if (device === 'Old Wireless Buds') credit = 45;
                      setTradeInDiscount(credit);
                      if (credit > 0) {
                        triggerNotification(`Trade-in locked! Saved ${formatPrice(credit)} off your checkout subtotal.`);
                      } else {
                        triggerNotification('Trade-in selection cleared.');
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden cursor-pointer transition-all duration-200"
                  >
                    <option value="">-- Choose Your Previous Device --</option>
                    <option value="S22 Ultra">Samsung Galaxy S22 Ultra (Appraisal: {formatPrice(350)})</option>
                    <option value="S21 / S22">Samsung Galaxy S21 / S22 (Appraisal: {formatPrice(220)})</option>
                    <option value="iPhone 13 Pro">Apple iPhone 13 Pro (Appraisal: {formatPrice(300)})</option>
                    <option value="iPhone 11 / 12">Apple iPhone 11 / 12 (Appraisal: {formatPrice(180)})</option>
                    <option value="Old Wireless Buds">Generic/Old Bluetooth Earbuds (Appraisal: {formatPrice(45)})</option>
                  </select>
                </div>

                {tradeInDiscount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between shadow-inner"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Appraised Value Applied</span>
                      <span className="text-xs font-bold text-white font-sans">{tradeInDevice}</span>
                    </div>
                    <span className="font-mono text-base font-bold text-emerald-400">-{formatPrice(tradeInDiscount)}</span>
                  </motion.div>
                )}
              </div>

              {/* Other benefits styled as a grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-6 lg:pt-0 lg:pl-8 relative z-10">
                <div className="space-y-2 bg-slate-900/40 border border-slate-800/40 p-4.5 rounded-2xl hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-indigo-900/40 flex items-center justify-center text-indigo-400">
                    <ShieldAlert className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Full Regional Warranties</h4>
                  <p className="text-2xs text-slate-400 leading-relaxed">
                    Samsung mobile devices are covered by official 1-year warranties, and Apple hardware is catalog-validated for full compatibility with standard local AppleCare coverages.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-900/40 border border-slate-800/40 p-4.5 rounded-2xl hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-indigo-900/40 flex items-center justify-center text-indigo-400">
                    <Truck className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Zero-Cost Dynamic Shipping</h4>
                  <p className="text-2xs text-slate-400 leading-relaxed">
                    Secure eco-insured regional shipping is complimentary on all configurations and orders exceeding $300, complete with real-time tracking checkpoints updated within 24 hours.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-900/40 border border-slate-800/40 p-4.5 rounded-2xl hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-indigo-900/40 flex items-center justify-center text-indigo-400">
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Ecosystem Sync Assured</h4>
                  <p className="text-2xs text-slate-400 leading-relaxed">
                    Curate your devices with confidence. The budget profiler computes perfect fits ensuring Bluetooth audio codecs, high-fidelity trackers, and wearable sensors match your phone platform perfectly.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-900/40 border border-slate-800/40 p-4.5 rounded-2xl hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-indigo-900/40 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Interactive Invoice Ledgers</h4>
                  <p className="text-2xs text-slate-400 leading-relaxed">
                    Every checkout creates a permanent local ledger item featuring customizable timelines to test standard e-commerce shipping milestones.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BUDGET PROFILER */}
        {activeTab === 'profiler' && (
          <BudgetProfiler
            onApplyProfile={handleApplyProfileFilter}
            activeProfile={activeProfile}
            setActiveProfile={setActiveProfile}
            onAddToCart={handleSimpleAddToCart}
          />
        )}

        {/* TAB 3: PRODUCT COMPARE SHEET */}
        {activeTab === 'compare' && (
          <ProductCompare
            comparedProducts={comparedProducts}
            onRemove={(id) => setComparedProducts((prev) => prev.filter((p) => p.id !== id))}
            onAddToCart={handleSimpleAddToCart}
            onClose={() => setActiveTab('catalog')}
          />
        )}

        {/* TAB: ECOSYSTEM AI ARCHITECT */}
        {activeTab === 'ai-architect' && (
          <EcosystemAI
            activeProfile={activeProfile}
            cartItems={cart}
            onAddToCart={handleSimpleAddToCart}
            triggerNotification={triggerNotification}
          />
        )}

        {/* TAB 4: ORDER HISTORY LEDGER */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto">
            <div className="flex justify-between items-center pb-5 mb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-medium">
                  Transaction Ledger
                </span>
                <h2 className="text-2xl font-sans font-medium tracking-tight text-gray-900 mt-1">
                  Your Purchase Ledger
                </h2>
              </div>
              <span className="text-xs font-mono text-gray-400">
                Stored securely in local sandboxed storage
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 max-w-md mx-auto space-y-4">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-semibold text-gray-900">No transactions recorded yet</h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Once you place a simulated order through our checkout system, the itemized invoice and regional shipping progress tracker will appear here.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer"
                >
                  Return to Browse Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, orderIndex) => {
                  const isExpanded = expandedOrders[order.id] !== undefined ? expandedOrders[order.id] : orderIndex === 0;
                  return (
                    <div key={order.id} className="border border-gray-100 rounded-2xl p-5 bg-slate-50/40 hover:border-gray-200 transition-all duration-200">
                      <div 
                        onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !isExpanded }))}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-90 text-indigo-500' : 'group-hover:translate-x-0.5'}`} />
                          <div>
                            <p className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wider">
                              Order Ref: <span className="text-indigo-600 group-hover:text-indigo-700 transition-colors">{order.id}</span>
                            </p>
                            <p className="text-3xs text-gray-400 mt-0.5">Purchased on {order.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-6 sm:pl-0">
                          <span className={`text-3xs font-mono uppercase tracking-wider px-3 py-1 rounded-md font-bold ${
                            order.status === 'Processing' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : order.status === 'Shipped' 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {order.status === 'Processing' ? 'Processing' : order.status === 'Shipped' ? 'Shipped & Out' : 'Delivered'}
                          </span>
                          <p className="font-mono text-sm font-bold text-gray-950">{formatPrice(order.total)}</p>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-5 mt-4 border-t border-gray-200/50 space-y-5">
                              {/* Shipping Address Summary */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-3xs font-mono text-gray-400 uppercase tracking-widest block mb-1">Shipping Target</span>
                                  <p className="font-semibold text-gray-900">{order.shippingDetails.name}</p>
                                  <p className="text-gray-600">{order.shippingDetails.address}, {order.shippingDetails.city} {order.shippingDetails.zipCode}</p>
                                  <p className="text-gray-400 text-3xs mt-0.5">Email contact: {order.shippingDetails.email}</p>
                                </div>
                                <div>
                                  <span className="text-3xs font-mono text-gray-400 uppercase tracking-widest block mb-1">Itemized Hardware Receipts</span>
                                  <motion.div 
                                    variants={{
                                      hidden: { opacity: 0 },
                                      show: {
                                        opacity: 1,
                                        transition: {
                                          staggerChildren: 0.08
                                        }
                                      }
                                    }}
                                    initial="hidden"
                                    animate="show"
                                    className="space-y-1 mt-1 text-2xs"
                                  >
                                    {order.items.map((item, index) => (
                                      <motion.div 
                                        key={index}
                                        variants={{
                                          hidden: { opacity: 0, y: 6 },
                                          show: { opacity: 1, y: 0 }
                                        }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="flex justify-between"
                                      >
                                        <span className="text-gray-700">{item.product.name} ({item.selectedColor}) <span className="text-gray-400">x{item.quantity}</span></span>
                                        <span className="font-mono font-medium text-gray-950">{formatPrice(item.product.price * item.quantity)}</span>
                                      </motion.div>
                                    ))}
                                    {order.discount && order.discount > 0 ? (
                                      <motion.div 
                                        variants={{
                                          hidden: { opacity: 0, y: 6 },
                                          show: { opacity: 1, y: 0 }
                                        }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="flex justify-between text-emerald-600 font-semibold border-t border-gray-100 pt-1 mt-1"
                                      >
                                        <span>Trade-In Credit ({order.discountDevice || 'Recycled Device'})</span>
                                        <span className="font-mono">-{formatPrice(order.discount)}</span>
                                      </motion.div>
                                    ) : null}
                                  </motion.div>
                                </div>
                              </div>

                              {/* Progress tracking line */}
                              <div className="bg-white border border-gray-100 p-4.5 rounded-2xl space-y-4 shadow-3xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-3xs font-mono text-gray-400 uppercase tracking-wider block">Shipment delivery sequence</span>
                                  {order.status !== 'Delivered' && (
                                    <button
                                      onClick={() => handleAdvanceOrderStatus(order.id)}
                                      className="text-4xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg transition border border-indigo-100 flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Simulate Next Stage ➔</span>
                                    </button>
                                  )}
                                </div>
                                
                                {/* Custom animated progress step tracker */}
                                <div className="relative py-4 px-2">
                                  {/* Background track line */}
                                  <div className="absolute top-3.5 left-[12%] right-[12%] h-1 bg-gray-100 rounded-full z-0" />
                                  
                                  {/* Active Progress Track Line with smooth growth transition on expand */}
                                  <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ 
                                      width: order.status === 'Processing' ? '0%' : order.status === 'Shipped' ? '50%' : '100%' 
                                    }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                                    className="absolute top-3.5 left-[12%] h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full z-0 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                    style={{ maxWidth: '76%' }}
                                  />

                                  {/* Nodes Container */}
                                  <div className="relative z-10 flex justify-between items-start text-3xs">
                                    {/* STEP 1: Confirmed */}
                                    <div className="flex flex-col items-center w-24 text-center">
                                      <div className="relative flex items-center justify-center">
                                        {/* Glowing Active Ring */}
                                        {order.status === 'Processing' && (
                                          <motion.span
                                            className="absolute -inset-1.5 rounded-full border-2 border-emerald-500/45"
                                            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
                                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                          />
                                        )}
                                        <motion.div
                                          initial={{ scale: 0.8, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ delay: 0.1, type: 'spring' }}
                                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-md border ${
                                            order.status === 'Processing'
                                              ? 'bg-emerald-500 text-white border-emerald-400'
                                              : 'bg-emerald-600 text-white border-emerald-500'
                                          }`}
                                        >
                                          ✓
                                        </motion.div>
                                      </div>
                                      <span className={`font-bold mt-2 text-[10px] ${
                                        order.status === 'Processing' ? 'text-emerald-600' : 'text-gray-800'
                                      }`}>
                                        Confirmed
                                      </span>
                                      <span className="text-[8px] font-mono text-gray-400 mt-0.5 leading-none">Order Secured</span>
                                    </div>

                                    {/* STEP 2: Dispatched */}
                                    <div className="flex flex-col items-center w-24 text-center">
                                      <div className="relative flex items-center justify-center">
                                        {/* Glowing Active Ring */}
                                        {order.status === 'Shipped' && (
                                          <motion.span
                                            className="absolute -inset-1.5 rounded-full border-2 border-emerald-500/45"
                                            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
                                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                          />
                                        )}
                                        <motion.div
                                          initial={{ scale: 0.8, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ delay: 0.25, type: 'spring' }}
                                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-md border transition-colors duration-300 ${
                                            order.status === 'Shipped'
                                              ? 'bg-emerald-500 text-white border-emerald-400'
                                              : order.status === 'Delivered'
                                              ? 'bg-emerald-600 text-white border-emerald-500'
                                              : 'bg-gray-100 text-gray-400 border-gray-200'
                                          }`}
                                        >
                                          {order.status !== 'Processing' ? '✓' : '2'}
                                        </motion.div>
                                      </div>
                                      <span className={`font-bold mt-2 text-[10px] transition-colors duration-300 ${
                                        order.status === 'Shipped' 
                                          ? 'text-emerald-600' 
                                          : order.status === 'Delivered'
                                          ? 'text-gray-800'
                                          : 'text-gray-400'
                                      }`}>
                                        Dispatched
                                      </span>
                                      <span className="text-[8px] font-mono text-gray-400 mt-0.5 leading-none">
                                        {order.status === 'Processing' ? 'Pending Transit' : 'In Cargo'}
                                      </span>
                                    </div>

                                    {/* STEP 3: Arrived */}
                                    <div className="flex flex-col items-center w-24 text-center">
                                      <div className="relative flex items-center justify-center">
                                        {/* Glowing Active Ring */}
                                        {order.status === 'Delivered' && (
                                          <motion.span
                                            className="absolute -inset-1.5 rounded-full border-2 border-emerald-500/45"
                                            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
                                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                          />
                                        )}
                                        <motion.div
                                          initial={{ scale: 0.8, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ delay: 0.4, type: 'spring' }}
                                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-md border transition-colors duration-300 ${
                                            order.status === 'Delivered'
                                              ? 'bg-emerald-600 text-white border-emerald-500'
                                              : 'bg-gray-100 text-gray-400 border-gray-200'
                                          }`}
                                        >
                                          {order.status === 'Delivered' ? '✓' : '3'}
                                        </motion.div>
                                      </div>
                                      <span className={`font-bold mt-2 text-[10px] transition-colors duration-300 ${
                                        order.status === 'Delivered' ? 'text-emerald-600 font-extrabold' : 'text-gray-400'
                                      }`}>
                                        Arrived
                                      </span>
                                      <span className="text-[8px] font-mono text-gray-400 mt-0.5 leading-none">
                                        {order.status === 'Delivered' ? 'Handed Over' : 'Awaiting Delivery'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 md:px-8 mt-16 border-t border-slate-900 text-xs relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 blur-3xl rounded-full -ml-40 -mb-40"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 relative z-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md">
                TT
              </div>
              <span className="font-sans font-bold text-white text-sm tracking-tight">TechTier Store</span>
            </div>
            <p className="leading-relaxed text-slate-400 text-[11px] font-sans">
              An interactive e-commerce workspace pairing standard Samsung components and AirPods options. Segmented budget guidelines provide tailored purchasing parameters.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] font-extrabold text-white mb-4 uppercase tracking-widest">Samsung Ecosystem</h4>
            <ul className="space-y-2.5 text-[11px] text-slate-400">
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">Galaxy S24 Ultra (Flagship Titanium)</li>
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">Galaxy S24 FE (Balanced Value)</li>
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">Galaxy Z Fold 5 (Foldable Desktop)</li>
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">Galaxy Tab S9 Ultra & FE</li>
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">Galaxy Watch Ultra & FE</li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] font-extrabold text-white mb-4 uppercase tracking-widest">AirPods Ecosystem</h4>
            <ul className="space-y-2.5 text-[11px] text-slate-400">
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">AirPods Max (Over-Ear Studio)</li>
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">AirPods Pro (2nd Gen H2 ANC)</li>
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">AirPods (3rd Gen Spatial)</li>
              <li className="hover:text-indigo-400 transition-colors duration-200 cursor-pointer">AirPods (2nd Gen Classic Entry)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] font-extrabold text-white mb-4 uppercase tracking-widest">Workspace Security</h4>
            <ul className="space-y-2.5 text-[11px] leading-relaxed text-slate-400">
              <li className="flex items-center gap-1.5"><span className="text-indigo-400">🔒</span> Sandbox TLS 256-Bit Authorized</li>
              <li className="flex items-center gap-1.5"><span className="text-indigo-400">📁</span> Secure Sandbox Local Storage</li>
              <li className="flex items-center gap-1.5"><span className="text-indigo-400">✅</span> Precise Budget-Allocation Engine</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row justify-between gap-4 items-center text-[10px] font-mono text-slate-500 relative z-10">
          <p>© 2026 TechTier E-Commerce Inc. Designed for elite Samsung and AirPods curation.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Curation Service</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Developer Sandbox API</span>
          </div>
        </div>
      </footer>

      {/* --- CART SIDEBAR DRAWER OVERLAY --- */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop click to close */}
            <div 
              onClick={() => setIsCartOpen(false)} 
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs transition-opacity"
            />
            
            <div className="absolute inset-y-0 right-0 max-w-md w-full pl-10 flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full bg-white shadow-2xl flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="px-5 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-950 text-sm">Your Configuration Cart</h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-950 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Cart Items list */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-xs text-gray-500">Your configuration cart is empty</p>
                      <button
                        onClick={() => { setIsCartOpen(false); setActiveTab('catalog'); }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Browse Samsung and AirPods products
                      </button>
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div key={`${item.product.id}-${item.selectedColor}-${index}`} className="flex gap-3 pb-4 border-b border-gray-100 text-xs items-start">
                        {/* Compact Graphic placeholder */}
                        <div className={`w-14 h-14 rounded-lg shrink-0 ${item.product.image} p-1 flex items-center justify-center text-white font-mono text-5xs text-center font-bold`}>
                          {item.product.brand[0]}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{item.product.name}</h4>
                          <p className="text-4xs text-gray-400 font-mono mt-0.5">Color: {item.selectedColor} • {item.product.brand}</p>
                          
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-slate-50">
                              <button
                                onClick={() => handleUpdateCartQuantity(index, -1)}
                                className="px-2 py-0.5 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-l-lg transition"
                              >
                                -
                              </button>
                              <span className="px-2.5 font-mono text-2xs font-bold text-gray-950">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateCartQuantity(index, 1)}
                                className="px-2 py-0.5 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-r-lg transition"
                              >
                                +
                              </button>
                            </div>
                            
                            <span className="font-mono font-bold text-gray-950">{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(index)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Drawer Footer summary */}
                {cart.length > 0 && (
                  <div className="border-t border-gray-100 p-5 bg-slate-50 space-y-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>Items Count:</span>
                        <span className="font-mono">{cartTotalItemCount} devices</span>
                      </div>
                      <div className="flex justify-between text-gray-950 font-bold text-sm">
                        <span>Estimated Subtotal:</span>
                        <span className="font-mono text-indigo-600">{formatPrice(cartSubtotal)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          setIsCheckoutOpen(true);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        Proceed to Secure Checkout
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <p className="text-4xs text-gray-400 font-mono text-center mt-2.5">
                        By checking out, you authorize a secure local sandbox simulation transaction.
                      </p>
                    </div>
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PRODUCT CONFIGURATION DETAILS MODAL --- */}
      <AnimatePresence>
        {detailProduct && (
          <ProductDetailModal
            product={detailProduct}
            onClose={() => setDetailProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* --- SECURE CHECKOUT PROCESS MODAL --- */}
      {isCheckoutOpen && (
        <CheckoutModal
          cartItems={cart}
          subtotal={cartSubtotal}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
          tradeInDiscount={tradeInDiscount}
          tradeInDevice={tradeInDevice}
          ecosystemDiscount={ecosystemDiscount}
        />
      )}

    </div>
  );
}
