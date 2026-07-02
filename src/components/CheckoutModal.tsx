import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ShoppingBag, ShieldCheck, CheckCircle2, Truck, ClipboardList } from 'lucide-react';
import { CartItem, ShippingDetails, Order } from '../types';

interface CheckoutModalProps {
  cartItems: CartItem[];
  subtotal: number;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  tradeInDiscount?: number;
  tradeInDevice?: string;
  ecosystemDiscount?: number;
}

export default function CheckoutModal({ 
  cartItems, 
  subtotal, 
  onClose, 
  onOrderSuccess,
  tradeInDiscount = 0,
  tradeInDevice = '',
  ecosystemDiscount = 0
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<ShippingDetails>({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'fonepay' | 'card'>('esewa');
  const [walletPhone, setWalletPhone] = useState<string>('');
  const [walletPin, setWalletPin] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  const nepalCities = [
    'Kathmandu',
    'Pokhara',
    'Lalitpur',
    'Bhaktapur',
    'Biratnagar',
    'Bharatpur (Chitwan)',
    'Butwal',
    'Dharan',
    'Itahari',
    'Hetauda',
    'Janakpur',
    'Dhangadhi',
    'Birendranagar (Surkhet)',
    'Nepalgunj'
  ];

  const isNepalMarket = true;
  const convertToNPR = (usd: number) => Math.round(usd * 134);
  const formatPrice = (usd: number) => {
    if (isNepalMarket) {
      return `रू ${convertToNPR(usd).toLocaleString('en-NP')}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  const tax = useMemo(() => {
    const discountedSubtotal = Math.max(0, subtotal - tradeInDiscount - ecosystemDiscount);
    return Math.round(discountedSubtotal * 0.13); // Nepal Value Added Tax (VAT) is 13%
  }, [subtotal, tradeInDiscount, ecosystemDiscount]);

  const shipping = useMemo(() => {
    // Nepal local express cargo delivery: standard Rs 150 (roughly $1)
    return 1.12; 
  }, []);

  const total = useMemo(() => {
    const discountedSubtotal = Math.max(0, subtotal - tradeInDiscount - ecosystemDiscount);
    return discountedSubtotal + tax + shipping;
  }, [subtotal, tradeInDiscount, ecosystemDiscount, tax, shipping]);

  const handleInputChange = (field: keyof ShippingDetails, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'A valid email is required';
    if (!form.address.trim()) errs.address = 'Street address is required';
    if (!form.city.trim()) errs.city = 'Nepalese city selection is required';
    if (!form.zipCode.trim()) errs.zipCode = 'Valid ZIP / Postal code is required';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (paymentMethod === 'card') {
      if (!form.cardNumber.trim() || form.cardNumber.replace(/\s/g, '').length < 16) {
        errs.cardNumber = 'Complete 16-digit card number required';
      }
      if (!form.cardExpiry.trim() || !form.cardExpiry.includes('/')) {
        errs.cardExpiry = 'MM/YY required';
      }
      if (!form.cardCvc.trim() || form.cardCvc.length < 3) {
        errs.cardCvc = '3-digit CVC required';
      }
    } else {
      if (!walletPhone.trim()) {
        errs.walletPhone = 'Mobile number is required';
      } else if (!/^9[678]\d{8}$/.test(walletPhone.trim())) {
        errs.walletPhone = 'Must be a valid 10-digit Nepalese mobile number (starts with 97/98)';
      }
      if (!walletPin.trim()) {
        errs.walletPin = 'Security PIN or OTP is required';
      } else if (walletPin.length < 4) {
        errs.walletPin = 'Security PIN must be at least 4 digits';
      }
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handlePlaceOrder = () => {
    setIsAuthorizing(true);
    
    // Simulate premium e-commerce card gateway secure authorization delay
    setTimeout(() => {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const orderDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const newOrder: Order = {
        id: orderId,
        date: orderDate,
        items: [...cartItems],
        subtotal,
        tax,
        shipping,
        total,
        shippingDetails: { ...form },
        status: 'Processing',
        discount: tradeInDiscount + ecosystemDiscount,
        discountDevice: tradeInDevice ? `${tradeInDevice} + Ecosystem Synergy` : 'Ecosystem Synergy Sync',
      };

      setPlacedOrder(newOrder);
      onOrderSuccess(newOrder);
      setIsAuthorizing(false);
      setStep(4);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-950/80 p-4 md:p-6 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-800 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        {step !== 4 && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Steps Progress Header */}
        {step !== 4 && (
          <div className="mb-8">
            <span className="text-2xs font-mono uppercase tracking-wider text-indigo-300 bg-indigo-950/60 border border-indigo-900/40 px-3 py-1 rounded-full font-medium">
              Secure Checkout
            </span>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
                <span className={`text-xs font-medium ${step === 1 ? 'text-white font-bold' : 'text-slate-500'}`}>Shipping</span>
              </div>
              <div className="h-px bg-slate-800 flex-1 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
                <span className={`text-xs font-medium ${step === 2 ? 'text-white font-bold' : 'text-slate-500'}`}>Payment</span>
              </div>
              <div className="h-px bg-slate-800 flex-1 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>3</div>
                <span className={`text-xs font-medium ${step === 3 ? 'text-white font-bold' : 'text-slate-500'}`}>Confirm</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Shipping Form */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white">Where should we deliver your tech?</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 focus:outline-hidden"
                  />
                  {errors.name && <p className="text-3xs text-red-450 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="johndoe@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 focus:outline-hidden"
                  />
                  {errors.email && <p className="text-3xs text-red-450 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="E.g., New Baneshwor, Ward No. 10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 focus:outline-hidden"
                  />
                  {errors.address && <p className="text-3xs text-red-450 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">City / District (Nepal)</label>
                    <select
                      value={form.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 focus:outline-hidden"
                    >
                      <option value="">Select city...</option>
                      {nepalCities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-3xs text-red-450 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={form.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="E.g., 44600"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 focus:outline-hidden"
                    />
                    {errors.zipCode && <p className="text-3xs text-red-450 mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  Continue to Payment
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Payment Form */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4.5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">Select Payment Gateway</h3>
                <span className="text-3xs font-mono text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Nepal Secure Gateway Sync
                </span>
              </div>

              {/* PAYMENT BRAND SELECTION TABS */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('esewa'); setErrors({}); }}
                  className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    paymentMethod === 'esewa'
                      ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400 font-black font-mono scale-[1.02]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 font-semibold'
                  }`}
                >
                  <span className="text-[10px]">eSewa</span>
                  <span className="text-[6px] opacity-75 font-mono">Instant Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('khalti'); setErrors({}); }}
                  className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    paymentMethod === 'khalti'
                      ? 'border-purple-600 bg-purple-950/40 text-purple-400 font-black font-mono scale-[1.02]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 font-semibold'
                  }`}
                >
                  <span className="text-[10px]">Khalti</span>
                  <span className="text-[6px] opacity-75 font-mono">Secure Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('fonepay'); setErrors({}); }}
                  className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    paymentMethod === 'fonepay'
                      ? 'border-rose-600 bg-rose-950/40 text-rose-400 font-black font-mono scale-[1.02]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 font-semibold'
                  }`}
                >
                  <span className="text-[10px]">Fonepay</span>
                  <span className="text-[6px] opacity-75 font-mono">Scan QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('card'); setErrors({}); }}
                  className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-950/40 text-indigo-400 font-black font-mono scale-[1.02]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 font-semibold'
                  }`}
                >
                  <span className="text-[10px]">Card</span>
                  <span className="text-[6px] opacity-75 font-mono">Visa/Master</span>
                </button>
              </div>

              {/* BRANDED BANNER INFO */}
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 bg-slate-950 ${
                paymentMethod === 'esewa' ? 'border-emerald-900/50' :
                paymentMethod === 'khalti' ? 'border-purple-900/50' :
                paymentMethod === 'fonepay' ? 'border-rose-900/50' : 'border-indigo-900/50'
              }`}>
                <div className={`w-2.5 h-10 rounded-md shrink-0 ${
                  paymentMethod === 'esewa' ? 'bg-emerald-500' :
                  paymentMethod === 'khalti' ? 'bg-purple-500' :
                  paymentMethod === 'fonepay' ? 'bg-rose-500' : 'bg-indigo-500'
                }`} />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    {paymentMethod === 'esewa' && '🇳🇵 Connect eSewa Digital Wallet'}
                    {paymentMethod === 'khalti' && '🇳🇵 Checkout via Khalti Mobile'}
                    {paymentMethod === 'fonepay' && '🇳🇵 Fonepay Dynamic QR Network'}
                    {paymentMethod === 'card' && 'Standard Visa / SCT Card Sandbox'}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {paymentMethod === 'esewa' && 'Pay instantly via Nepal’s leading wallet. No auxiliary commission charged.'}
                    {paymentMethod === 'khalti' && 'Safe authentication via your 10-digit mobile number & secret transaction PIN.'}
                    {paymentMethod === 'fonepay' && 'Scan using any Nepalese Banking app. Enter mobile ID below to generate a dynamic code.'}
                    {paymentMethod === 'card' && 'Credit card processing channel for corporate bank accounts.'}
                  </p>
                </div>
              </div>

              {/* CONDITIONAL INPUT FORM FIELDS */}
              <div className="space-y-3.5">
                {paymentMethod !== 'card' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                          {paymentMethod === 'fonepay' ? 'Fonepay Registered Mobile ID' : 'Wallet ID (10-Digit Mobile)'}
                        </label>
                        <input
                          type="text"
                          value={walletPhone}
                          onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="E.g., 9841XXXXXX"
                          maxLength={10}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-650 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        {errors.walletPhone && <p className="text-3xs text-red-450 mt-1">{errors.walletPhone}</p>}
                      </div>
                      <div>
                        <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                          {paymentMethod === 'fonepay' ? 'One-Time Transaction PIN' : 'Security PIN / Password'}
                        </label>
                        <input
                          type="password"
                          value={walletPin}
                          onChange={(e) => setWalletPin(e.target.value)}
                          placeholder="XXXX"
                          maxLength={6}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-650 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        {errors.walletPin && <p className="text-3xs text-red-450 mt-1">{errors.walletPin}</p>}
                      </div>
                    </div>
                    
                    {paymentMethod === 'fonepay' && (
                      <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex flex-col items-center justify-center space-y-2">
                        <div className="w-24 h-24 border border-slate-800 rounded-lg p-2.5 bg-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                          {/* Animated scanner laser beam line */}
                          <div className="absolute top-0 inset-x-0 h-0.5 bg-rose-500 animate-[bounce_2s_infinite] shadow-[0_0_10px_#f43f5e]" />
                          <div className="grid grid-cols-3 gap-1.5 w-full h-full opacity-60">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className={`rounded-xs ${i % 2 === 0 ? 'bg-slate-100' : 'bg-transparent border border-slate-700'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-rose-400 tracking-wide">DYNAMIC NEPAL QR TERMINAL READY</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Credit Card Number</label>
                      <input
                        type="text"
                        value={form.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        placeholder="4111 2222 3333 4444"
                        maxLength={19}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-650 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      {errors.cardNumber && <p className="text-3xs text-red-450 mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Expiration Date</label>
                        <input
                          type="text"
                          value={form.cardExpiry}
                          onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-650 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        {errors.cardExpiry && <p className="text-3xs text-red-450 mt-1">{errors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="text-3xs font-mono uppercase tracking-wider text-slate-400 block mb-1">Security Code (CVC)</label>
                        <input
                          type="password"
                          value={form.cardCvc}
                          onChange={(e) => handleInputChange('cardCvc', e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength={3}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-650 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        {errors.cardCvc && <p className="text-3xs text-red-450 mt-1">{errors.cardCvc}</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 hover:bg-slate-850 rounded-xl transition cursor-pointer"
                >
                  Back to Shipping
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  Confirm Order Details
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Confirm Summary */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              <h3 className="text-lg font-semibold text-white">Review & Place Your Order</h3>

              {/* Order Items Recap */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-850">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.selectedColor}`} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium max-w-[250px] truncate">
                      {item.product.name} ({item.selectedColor}) <span className="text-slate-500">x{item.quantity}</span>
                    </span>
                    <span className="font-mono text-white font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Address Recap */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-850">
                  <span className="text-3xs font-mono text-slate-500 uppercase tracking-wider block mb-1">Shipping Target</span>
                  <p className="font-bold text-white">{form.name}</p>
                  <p className="text-slate-300 mt-0.5">{form.address}</p>
                  <p className="text-slate-300">{form.city}, {form.zipCode}</p>
                </div>
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-850">
                  <span className="text-3xs font-mono text-slate-500 uppercase tracking-wider block mb-1">Billing Account</span>
                  <p className="font-bold text-white uppercase font-mono text-[10px]">
                    {paymentMethod === 'esewa' && '🟢 eSewa Digital Wallet'}
                    {paymentMethod === 'khalti' && '🟣 Khalti Wallet'}
                    {paymentMethod === 'fonepay' && '🔴 Fonepay Direct'}
                    {paymentMethod === 'card' && 'SCT Sandbox Card'}
                  </p>
                  <p className="text-slate-300 mt-0.5">
                    {paymentMethod !== 'card' 
                      ? `Mobile ID: ${walletPhone.slice(0,4)}***${walletPhone.slice(-3)}` 
                      : `Card ending in **** ${form.cardNumber.slice(-4)}`
                    }
                  </p>
                  <p className="text-slate-550 font-mono mt-1 text-3xs">Owner: {form.name}</p>
                </div>
              </div>

              {/* Cost Ledger */}
              <div className="space-y-2 border-t border-slate-850 pt-4 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-mono text-slate-300">{formatPrice(subtotal)}</span>
                </div>
                {tradeInDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Trade-In Value Applied ({tradeInDevice})</span>
                    <span className="font-mono">-{formatPrice(tradeInDiscount)}</span>
                  </div>
                )}
                {ecosystemDiscount > 0 && (
                  <div className="flex justify-between text-indigo-400 font-semibold bg-indigo-950/20 px-2 py-1 rounded-md border border-indigo-900/30">
                    <span className="flex items-center gap-1">🌟 Ecosystem Sync Discount (15% Off)</span>
                    <span className="font-mono">-{formatPrice(ecosystemDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Nepal VAT (13%)</span>
                  <span className="font-mono text-slate-300">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Cargo Express Delivery</span>
                  <span className="font-mono text-slate-300">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between pt-2.5 border-t border-slate-850 text-sm font-bold text-white">
                  <span>Total Due Today</span>
                  <span className="font-mono text-indigo-400">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                <button
                  type="button"
                  disabled={isAuthorizing}
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 hover:bg-slate-850 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Back to Payment
                </button>
                <button
                  type="button"
                  disabled={isAuthorizing}
                  onClick={handlePlaceOrder}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm disabled:bg-emerald-800 disabled:cursor-not-allowed"
                >
                  {isAuthorizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Authorize & Place Order
                    </>
                  )}
                </button>
              </div>

              {/* Secure authorization full overlay */}
              {isAuthorizing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-slate-900/98 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-8 text-center space-y-4 animate-pulse-once"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-950 border-t-indigo-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Processing Secure Transaction</h4>
                    <p className="text-3xs font-mono text-indigo-400 mt-1 uppercase tracking-widest font-bold">Encrypted 256-bit secure tunnel active</p>
                    <p className="text-2xs text-slate-400 mt-2 max-w-xs mx-auto">
                      Please hold on. We are authenticating your sandbox credentials with regional payment ledgers...
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4: Success Receipt & Tracking */}
          {step === 4 && placedOrder && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-900/40 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <span className="text-3xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-900/40 px-3 py-1 rounded-full font-bold animate-pulse">
                  Payment Authorized
                </span>
                <h3 className="text-xl font-sans font-medium text-white mt-3">Thank you for your order, {placedOrder.shippingDetails.name}!</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono font-semibold">Invoice reference: {placedOrder.id}</p>
              </div>

              {/* Order Status Timeline Tracker */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 text-left space-y-4">
                <span className="text-3xs font-mono text-slate-500 uppercase tracking-widest block">Simulated Shipment Tracker</span>
                
                <div className="flex items-center justify-between gap-1 text-2xs">
                  <div className="flex flex-col items-center flex-1 text-center">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center font-mono">✓</span>
                    <span className="font-semibold text-white mt-1.5">Authorized</span>
                    <span className="text-3xs text-slate-400 font-mono mt-0.5">{placedOrder.date}</span>
                  </div>
                  <div className="h-0.5 bg-indigo-600 flex-1 -mt-5"></div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <span className="w-5 h-5 rounded-full bg-slate-850 text-slate-500 font-bold flex items-center justify-center font-mono">2</span>
                    <span className="font-medium text-slate-500 mt-1.5">In Transit</span>
                    <span className="text-3xs text-slate-550 font-mono mt-0.5">Within 24 Hrs</span>
                  </div>
                  <div className="h-0.5 bg-slate-850 flex-1 -mt-5"></div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <span className="w-5 h-5 rounded-full bg-slate-850 text-slate-500 font-bold flex items-center justify-center font-mono">3</span>
                    <span className="font-medium text-slate-500 mt-1.5">Delivery</span>
                    <span className="text-3xs text-slate-550 font-mono mt-0.5">Est. Jul 2, 2026</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-850 flex items-start gap-2.5 text-3xs text-slate-400 leading-relaxed">
                  <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>A shipping confirmation email has been dispatched to <strong className="text-slate-200">{placedOrder.shippingDetails.email}</strong>. We have saved this transaction to your local ledger tab.</span>
                </div>
              </div>

              {/* Order summary card */}
              <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 text-left text-xs">
                <span className="text-3xs font-mono text-slate-500 uppercase tracking-wider block mb-2">Receipt Overview</span>
                {placedOrder.items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedColor}`} className="flex justify-between py-1 border-b border-slate-850/50">
                    <span className="text-slate-300">{item.product.name} <span className="text-slate-500">x{item.quantity}</span></span>
                    <span className="font-mono font-bold text-white">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-1 font-bold text-white text-sm">
                  <span>Grand Total Placed:</span>
                  <span className="font-mono text-indigo-400">{formatPrice(placedOrder.total)}</span>
                </div>
              </div>

              <div>
                <button
                  onClick={onClose}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                >
                  Return to Store Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
