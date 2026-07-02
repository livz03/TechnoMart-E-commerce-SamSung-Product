export type SamsungCategoryType = 'SMARTPHONE' | 'LAPTOP' | 'WEARABLE' | 'SMART_HOME';

export interface SamsungProduct {
  id: string;
  name: string;
  category: SamsungCategoryType;
  modelCode: string;
  basePrice: number;
  specs: Record<string, string>;
  connectivity: string;
  images: string[];
  inventory: number;
  features: string[];
  description: string;
  tier: 'budget' | 'balanced' | 'premium';
  rating: number;
  reviewCount: number;
  colors: string[];
}

export interface EcosystemCartItem {
  product: SamsungProduct;
  quantity: number;
  selectedColor: string;
  isLinked: boolean; // True if part of an active multi-device synergy link
}

export interface EcosystemCart {
  items: EcosystemCartItem[];
  totalEcosystemScore: number; // 0 to 100 based on device integrations
  activeSynergyDiscount: number; // Percentage discount (e.g. 15 for 15% off)
}
