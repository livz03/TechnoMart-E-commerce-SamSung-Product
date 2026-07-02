export type BrandType = 'Samsung' | 'Apple';
export type CategoryType = 'Phones' | 'Audio' | 'Wearables' | 'Tablets' | 'Accessories' | 'Laptops' | 'Smart Home';
export type IncomeTierType = 'budget' | 'balanced' | 'premium';

export interface Product {
  id: string;
  name: string;
  brand: BrandType;
  category: CategoryType;
  price: number;
  originalPrice?: number;
  tier: IncomeTierType;
  image: string; // Tailored SVG/CSS mockup style description
  specs: Record<string, string>;
  features: string[];
  rating: number;
  reviewCount: number;
  colors: string[];
  description: string;
  stock: number;
  isNepalPopular?: boolean;
  nepalPopularReason?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface ShippingDetails {
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingDetails: ShippingDetails;
  status: 'Processing' | 'Shipped' | 'Delivered';
  discount?: number;
  discountDevice?: string;
}

export interface BudgetProfile {
  monthlyIncome: number;
  allocatedPercent: number; // percent of monthly income they want to allocate
  priority: 'savings' | 'balance' | 'performance';
}
