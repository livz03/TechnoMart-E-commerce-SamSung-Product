import { create } from 'zustand';
import { SamsungProduct, EcosystemCartItem, EcosystemCart } from '../types/samsung';

interface SamsungStoreState {
  cart: EcosystemCart;
  tradeInDevice: string;
  tradeInDiscount: number;
  activeProfile: {
    monthlyIncome: number;
    allocatedPercent: number;
    priority: 'savings' | 'balance' | 'performance';
  } | null;
  
  // Actions
  setProfile: (profile: SamsungStoreState['activeProfile']) => void;
  setTradeIn: (device: string, discount: number) => void;
  addToCart: (product: SamsungProduct, color: string) => void;
  removeFromCart: (productId: string, color: string) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  clearCart: () => void;
  recalculateEcosystem: () => void;
}

export const useSamsungStore = create<SamsungStoreState>((set, get) => ({
  cart: {
    items: [],
    totalEcosystemScore: 100,
    activeSynergyDiscount: 0,
  },
  tradeInDevice: '',
  tradeInDiscount: 0,
  activeProfile: null,

  setProfile: (profile) => {
    set({ activeProfile: profile });
  },

  setTradeIn: (device, discount) => {
    set({ tradeInDevice: device, tradeInDiscount: discount });
  },

  addToCart: (product, color) => {
    const { items } = get().cart;
    const existingIndex = items.findIndex(
      (item) => item.product.id === product.id && item.selectedColor === color
    );

    let updatedItems = [...items];
    if (existingIndex > -1) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1,
      };
    } else {
      updatedItems.push({
        product,
        quantity: 1,
        selectedColor: color,
        isLinked: false,
      });
    }

    set((state) => ({
      cart: {
        ...state.cart,
        items: updatedItems,
      },
    }));

    get().recalculateEcosystem();
  },

  removeFromCart: (productId, color) => {
    const { items } = get().cart;
    const updatedItems = items.filter(
      (item) => !(item.product.id === productId && item.selectedColor === color)
    );

    set((state) => ({
      cart: {
        ...state.cart,
        items: updatedItems,
      },
    }));

    get().recalculateEcosystem();
  },

  updateQuantity: (productId, color, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, color);
      return;
    }

    const { items } = get().cart;
    const updatedItems = items.map((item) => {
      if (item.product.id === productId && item.selectedColor === color) {
        return { ...item, quantity };
      }
      return item;
    });

    set((state) => ({
      cart: {
        ...state.cart,
        items: updatedItems,
      },
    }));

    get().recalculateEcosystem();
  },

  clearCart: () => {
    set({
      cart: {
        items: [],
        totalEcosystemScore: 100,
        activeSynergyDiscount: 0,
      },
      tradeInDevice: '',
      tradeInDiscount: 0,
    });
  },

  recalculateEcosystem: () => {
    const { items } = get().cart;
    if (items.length === 0) {
      set((state) => ({
        cart: {
          items: [],
          totalEcosystemScore: 100,
          activeSynergyDiscount: 0,
        },
      }));
      return;
    }

    // Identify categories in cart
    const hasSamsungPhone = items.some((i) => i.product.category === 'SMARTPHONE' && i.product.id.startsWith('sam-'));
    const hasSamsungWatch = items.some((i) => i.product.category === 'WEARABLE' && i.product.id.includes('watch'));
    const hasSamsungBuds = items.some((i) => i.product.category === 'WEARABLE' && i.product.id.includes('buds'));
    const hasSamsungLaptop = items.some((i) => i.product.category === 'LAPTOP' && i.product.id.startsWith('sam-'));
    const hasSmartThings = items.some((i) => i.product.category === 'SMART_HOME');
    
    const hasApplePhone = items.some((i) => i.product.id.includes('iphone'));
    const hasAppleAudio = items.some((i) => i.product.id.includes('airpods'));

    // Compute Base Ecosystem Score
    let score = 50; // Neutral starting ground

    if (items.length === 1) {
      // Single product represents default neutral standard
      score = items[0].product.id.startsWith('sam-') ? 75 : 60;
    } else {
      // Calculate brand consistency
      const totalSamsungItems = items.filter((i) => i.product.id.startsWith('sam-')).length;
      const totalAppleItems = items.filter((i) => i.product.id.startsWith('apple-')).length;
      const totalCount = items.length;

      const samsungRatio = totalSamsungItems / totalCount;
      score = Math.round(50 + samsungRatio * 30); // 50 to 80 based on Samsung ratio

      // Add category synergy bonuses
      if (hasSamsungPhone && hasSamsungWatch) score += 10;
      if (hasSamsungPhone && hasSamsungBuds) score += 10;
      if (hasSamsungPhone && hasSamsungLaptop) score += 12;
      if (hasSamsungPhone && hasSmartThings) score += 8;

      // Brand Friction penalties
      if (hasSamsungPhone && hasAppleAudio) score -= 15; // Spatial loss, pairing delays
      if (hasApplePhone && hasSamsungWatch) score -= 25; // Watch Ultra won't setup on iOS
      if (hasApplePhone && hasSamsungBuds) score -= 10;
    }

    // Clamp score between 5 and 100
    score = Math.max(5, Math.min(100, score));

    // Dynamic Ecosystem Synergy Discount: Galaxy Phone + Galaxy Watch + Galaxy Buds FE/Pro
    const isSynergyEligible = hasSamsungPhone && hasSamsungWatch && hasSamsungBuds;
    const activeDiscount = isSynergyEligible ? 15 : 0; // 15% Ecosystem Sync discount!

    // Map through and flag items as linked if they participate in the sync combo
    const updatedItems = items.map((item) => {
      const isSynergyDevice = isSynergyEligible && (
        item.product.category === 'SMARTPHONE' || 
        (item.product.category === 'WEARABLE' && (item.product.id.includes('watch') || item.product.id.includes('buds')))
      );
      return {
        ...item,
        isLinked: isSynergyDevice && item.product.id.startsWith('sam-'),
      };
    });

    set((state) => ({
      cart: {
        items: updatedItems,
        totalEcosystemScore: score,
        activeSynergyDiscount: activeDiscount,
      },
    }));
  },
}));
