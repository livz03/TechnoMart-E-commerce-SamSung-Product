import { Product } from '../types';

export const PRODUCTS: Product[] = [
  // --- FLAGSHIP SMARTPHONES ---
  {
    id: 'sam-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Phones',
    price: 1299,
    originalPrice: 1399,
    tier: 'premium',
    image: 'bg-gradient-to-tr from-stone-500 to-zinc-800',
    specs: {
      Display: '6.8" Dynamic AMOLED 2X QHD+ 120Hz',
      Processor: 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
      Camera: '200MP Main + 50MP Periscope + 12MP Ultra-Wide',
      Battery: '5000 mAh with 45W Super Fast Charging 2.0',
      Armor: 'Titanium Frame with Corning Gorilla Armor'
    },
    features: [
      'Titanium Frame & IP68 Dust/Water Resistance',
      'Embedded S Pen Stylus with Air Gestures',
      'Anti-Reflective Corning Gorilla Armor Display',
      'Advanced Galaxy AI Translation & Photo Assist'
    ],
    description: 'The definitive Android smartphone. Featuring an ultra-rugged aerospace titanium chassis, anti-reflective Gorilla Armor screen, 200MP camera with 100x Space Zoom, and the built-in S Pen stylus.',
    rating: 4.9,
    reviewCount: 1240,
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow'],
    stock: 15,
    isNepalPopular: true,
    nepalPopularReason: 'Top premium choice for enterprise professionals and tech enthusiasts in Kathmandu.'
  },
  {
    id: 'sam-fold-5',
    name: 'Samsung Galaxy Z Fold 5',
    brand: 'Samsung',
    category: 'Phones',
    price: 1799,
    originalPrice: 1899,
    tier: 'premium',
    image: 'bg-gradient-to-tr from-cyan-950 to-slate-900',
    specs: {
      Display: '7.6" Main QXGA+ Dynamic AMOLED 2X + 6.2" Outer',
      Processor: 'Snapdragon 8 Gen 2 for Galaxy',
      Camera: '50MP Main + 10MP Telephoto + 12MP Ultra-Wide',
      Battery: '4400 mAh with 25W Fast Charging',
      Hinge: 'Flex Hinge Dual-Rail Structure'
    },
    features: [
      '7.6" Foldable Tablet-Like Workspace Screen',
      'Zero-Gap Flex Hinge Design',
      'Taskbar & Multi-Window Power Multitasking',
      'S Pen Fold Edition Stylus Support'
    ],
    description: 'A pocketable multi-window powerhouse. Unfold a massive 7.6-inch workspace for desktop-grade productivity with multi-active floating windows, intuitive taskbar controls, and S Pen support.',
    rating: 4.8,
    reviewCount: 512,
    colors: ['Icy Blue', 'Phantom Black', 'Cream'],
    stock: 8
  },

  // --- PREMIUM LAPTOPS ---
  {
    id: 'sam-book4-ultra',
    name: 'Samsung Galaxy Book4 Ultra',
    brand: 'Samsung',
    category: 'Laptops',
    price: 2399,
    originalPrice: 2499,
    tier: 'premium',
    image: 'bg-gradient-to-tr from-slate-800 to-indigo-950',
    specs: {
      Display: '16.0" 3K Dynamic AMOLED 2X Touch (120Hz)',
      Processor: 'Intel Core Ultra 9 185H (AI NPU)',
      Graphics: 'NVIDIA GeForce RTX 4070 GPU',
      Memory: '32GB LPDDR5X + 1TB PCIe NVMe SSD',
      Charging: '140W Super Fast Charging USB-C'
    },
    features: [
      'Studio-Quality 3K Dynamic AMOLED Touchscreen',
      'Second Screen Integration with Galaxy Tablets',
      'Intel Core Ultra 9 NPU AI Boost Engine',
      'Studio-Quality Quad Speaker Audio Tuned by AKG'
    ],
    description: 'The ultimate professional creator laptop. Offers dynamic cross-device clipboard sync, Samsung Multi Control, and hardware-accelerated ray tracing, powered by Intel Core Ultra 9 and RTX 4070 graphics.',
    rating: 4.9,
    reviewCount: 165,
    colors: ['Moonstone Gray'],
    stock: 6
  },
  {
    id: 'sam-book4-pro',
    name: 'Samsung Galaxy Book4 Pro',
    brand: 'Samsung',
    category: 'Laptops',
    price: 1449,
    originalPrice: 1549,
    tier: 'balanced',
    image: 'bg-gradient-to-tr from-zinc-700 to-slate-900',
    specs: {
      Display: '14.0" 3K Dynamic AMOLED 2X (120Hz)',
      Processor: 'Intel Core Ultra 7 155H (with NPU)',
      Graphics: 'Intel Arc Graphics',
      Memory: '16GB LPDDR5X + 512GB NVMe SSD',
      Weight: '1.23 kg Ultra-Thin Chassis'
    },
    features: [
      'Featherlight 1.23kg Aerospace Aluminum Body',
      'Corning Gorilla Glass with Anti-Reflective Coating',
      'Cross-Device Phone Link and Camera Mirroring',
      'Long-Lasting Battery with 65W Pocket Charger'
    ],
    description: 'The gold standard for ultra-portable productivity. Seamlessly mirror your Galaxy phone camera as a high-definition webcam, sync active web tabs, and enjoy immersive 3K AMOLED visuals.',
    rating: 4.7,
    reviewCount: 204,
    colors: ['Platinum Silver', 'Moonstone Gray'],
    stock: 11
  },

  // --- ECOSYSTEM WEARABLES & AUDIO ---
  {
    id: 'sam-watch-ultra',
    name: 'Samsung Galaxy Watch Ultra',
    brand: 'Samsung',
    category: 'Wearables',
    price: 649,
    originalPrice: 699,
    tier: 'premium',
    image: 'bg-gradient-to-tr from-orange-500 to-neutral-900',
    specs: {
      Size: '47mm Titanium Grade 4 Case',
      Durability: '10ATM Water Resistance, MIL-STD-810H',
      Battery: 'Up to 100 Hours (Power Saving Mode)',
      Sensors: 'BioActive Sensor (HR, ECG, BIA)',
      GPS: 'Dual-Frequency GPS (L1+L5) Trail Tracking'
    },
    features: [
      'Aerospace Titanium Case with Sapphire Crystal',
      'Personalized Energy Score via Galaxy AI',
      'Emergency 85dB Siren & Customizable Action Key',
      'Water Lock & Salt-Water Swimming Optimization'
    ],
    description: 'The ultimate survival companion. Built with marine-grade Titanium, a dual-frequency GPS, a customized quick-action button, and advanced metabolic biometric profiling to track extreme athletic progress.',
    rating: 4.8,
    reviewCount: 310,
    colors: ['Titanium Gray', 'Titanium Silver', 'Titanium White'],
    stock: 10
  },
  {
    id: 'sam-watch-7',
    name: 'Samsung Galaxy Watch 7',
    brand: 'Samsung',
    category: 'Wearables',
    price: 299,
    originalPrice: 329,
    tier: 'balanced',
    image: 'bg-gradient-to-tr from-emerald-500 to-blue-600',
    specs: {
      Size: '44mm Armor Aluminum Case',
      Processor: '3nm Exynos W1000 Pentacore Processor',
      Sensors: '13-LED BioActive Sensor',
      Battery: 'Up to 40 Hours Active Battery Life',
      GPS: 'Dual-Frequency L1+L5 GPS Engine'
    },
    features: [
      'Advanced Sleep Apnea & Blood Pressure Tracking',
      'AGEs Index Metabolic Health Monitoring',
      'Gesture Control Double-Pinch Trigger',
      'Quick-Fit One-Click Athlete Band System'
    ],
    description: 'Intelligent health tracking redefined. Featuring the world\'s first 3nm wearable processor, Galaxy Watch 7 tracks physical stress metrics, metabolic AGEs index, and provides continuous sleep coaching.',
    rating: 4.6,
    reviewCount: 450,
    colors: ['Forest Green', 'Silver', 'Cream'],
    stock: 18,
    isNepalPopular: true,
    nepalPopularReason: 'High-utility health-tracker, popular among tech professionals and runners in Kathmandu.'
  },
  {
    id: 'sam-buds3-pro',
    name: 'Samsung Galaxy Buds3 Pro',
    brand: 'Samsung',
    category: 'Audio',
    price: 249,
    originalPrice: 279,
    tier: 'balanced',
    image: 'bg-gradient-to-tr from-slate-400 to-zinc-600',
    specs: {
      Acoustics: 'Dual Amp 2-Way Coaxial Speaker',
      Audio: '24-bit/96kHz SSC Audio Codec Stream',
      ANC: 'Adaptive Noise Cancellation with Blade Lights',
      Battery: 'Up to 30 Hours of Total Listening Time',
      Waterproof: 'IP57 Water & Dust Protection'
    },
    features: [
      'Adaptive AI EQ with Noise & Voice Isolation',
      'Interactive Blade Lights with Swipe Gesture Stem',
      'Seamless Auto Switch Across Galaxy Devices',
      'Real-time Interpreter Translation Mode'
    ],
    description: 'Studio-grade sound wrapped in a striking modern blade design. Audiophiles can stream high-fidelity 24-bit/96kHz lossless audio, control ANC with gestures, and use real-time translating Interpreter mode.',
    rating: 4.7,
    reviewCount: 198,
    colors: ['Silver Metallic', 'Classic White'],
    stock: 22
  },
  {
    id: 'sam-buds-fe',
    name: 'Samsung Galaxy Buds FE',
    brand: 'Samsung',
    category: 'Audio',
    price: 99,
    originalPrice: 119,
    tier: 'budget',
    image: 'bg-gradient-to-tr from-cyan-400 to-blue-500',
    specs: {
      Acoustics: '1-Way Deep Bass Dynamic Driver',
      ANC: 'Active Noise Cancellation with Ambient Sound',
      Battery: 'Up to 30 Hours with Protective Charging',
      Design: 'Secure Ergonomic Wingtip Comfort Fit',
      Waterproof: 'IPX2 Water Splash Resistance'
    },
    features: [
      'Powerful Active Noise Canceling System',
      'Snug Wingtips Perfect for Workouts',
      'Rich Extra-Bass Acoustic Calibration',
      'Smart SmartThings Find Location Tracker'
    ],
    description: 'Immersive audio on a college budget. Galaxy Buds FE offer deep bass, robust Active Noise Cancellation, custom touch controls, and seamless pairing across all devices in your bag.',
    rating: 4.5,
    reviewCount: 312,
    colors: ['Graphite', 'White'],
    stock: 35,
    isNepalPopular: true,
    nepalPopularReason: 'Exceptional value-for-money ANC earbuds, highly popular among college students in Nepal.'
  },

  // --- SMARTTHINGS APPLIANCES ---
  {
    id: 'sam-hub-station',
    name: 'Samsung SmartThings Station',
    brand: 'Samsung',
    category: 'Smart Home',
    price: 79,
    originalPrice: 89,
    tier: 'budget',
    image: 'bg-gradient-to-tr from-violet-600 to-purple-800',
    specs: {
      Function: 'Matter Hub + 15W Wireless Charger',
      Protocols: 'Zigbee 3.0, Thread, Matter Support',
      Button: 'Custom Automation Key Actions',
      Power: 'USB-C Charging Port Input'
    },
    features: [
      'Integrated Matter-certified Smart Home Hub',
      'Super Fast 15W Qi Wireless Device Charger',
      'Programmable Automation Button triggers Scenes',
      'SmartThings Find Tracker rings lost phones'
    ],
    description: 'The physical centerpiece of your smart workspace. This sleek pad acts as a powerful Thread & Matter home hub to execute preset scenes with a button press, while supplying 15W wireless current to your phone.',
    rating: 4.4,
    reviewCount: 92,
    colors: ['Midnight Black', 'Ivory White'],
    stock: 40
  },
  {
    id: 'sam-fridge-hub',
    name: 'Bespoke AI Family Hub™ Refrigerator',
    brand: 'Samsung',
    category: 'Smart Home',
    price: 3499,
    originalPrice: 3799,
    tier: 'premium',
    image: 'bg-gradient-to-tr from-sky-400 to-slate-300',
    specs: {
      Capacity: '29 cu. ft. 4-Door French Door Design',
      Screen: '32" Family Hub Touchscreen Dashboard',
      AI_Camera: 'AI Vision Inside™ camera tracking',
      Eco: 'SmartThings Energy saving algorithms'
    },
    features: [
      '32" Full-HD Touchscreen Hub with Samsung TV Plus',
      'Internal Camera catalogs ingredients automatically',
      'Dual Auto Ice Maker (Ice Bites + Cubed)',
      'SmartThings Smart Kitchen Integration Hub'
    ],
    description: 'The ultimate AI appliance. View inside your fridge via smartphone while grocery shopping, broadcast movies, stream music, and control smart home appliances directly from your kitchen.',
    rating: 4.9,
    reviewCount: 45,
    colors: ['Bespoke Charcoal Glass', 'White Glass'],
    stock: 3
  },
  {
    id: 'sam-jetbot-ai',
    name: 'Samsung Jet Bot AI+ Robot Vacuum',
    brand: 'Samsung',
    category: 'Smart Home',
    price: 1299,
    originalPrice: 1499,
    tier: 'premium',
    image: 'bg-gradient-to-tr from-slate-500 to-indigo-600',
    specs: {
      Suction: '30W Jet Cyclone Smart Suction Power',
      Sensor: 'LiDAR Sensor + 3D Object Recognition Camera',
      Base: 'Clean Station automatic dust empty bin',
      Filtration: '99.99% Multi-layered filtration system'
    },
    features: [
      'LiDAR + AI Object avoidance scanning',
      'Home Monitoring Camera streams live secure feeds',
      'Automatic Clean Station Dust Bin Disposer',
      'Pet care status logs & noise detection triggers'
    ],
    description: 'Clean your apartment intelligently. Jet Bot AI+ identifies obstacles like cords and pet bowls, completes detailed space maps, and mirrors its secure camera to your Galaxy phone for real-time remote surveillance.',
    rating: 4.7,
    reviewCount: 128,
    colors: ['Misty White'],
    stock: 5
  },

  // --- BRAND FRICTION (FOR SYSTEM SCORE CALCULATION & RECOMMENDATION ENGINE) ---
  {
    id: 'apple-iphone-15-pro',
    name: 'Apple iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Phones',
    price: 1199,
    originalPrice: 1299,
    tier: 'premium',
    image: 'bg-gradient-to-tr from-neutral-600 to-amber-950',
    specs: {
      Display: '6.7" Super Retina XDR OLED (120Hz)',
      Processor: 'Apple A17 Pro (3nm CPU)',
      Camera: '48MP Main + 12MP 5x Telephoto',
      Chassis: 'Titanium Framing with Ceramic Shield'
    },
    features: [
      'Titanium Frame & Action Button Control',
      'Proactive iOS Dynamic Island alerts',
      'ProRes Video recording direct to SSD support',
      'Apple AirDrop High-Speed Wireless Exchange'
    ],
    description: 'Apple\'s premium titanium smartphone. Excellent build quality, but creates significant ecosystem friction when combined with Samsung Galaxy Watches or SmartThings appliances due to proprietary software blocks.',
    rating: 4.8,
    reviewCount: 2200,
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium'],
    stock: 14,
    isNepalPopular: true,
    nepalPopularReason: 'Prestigious premium smartphone, highly popular in executive and creative demographics in Nepal.'
  },
  {
    id: 'apple-airpods-pro-2',
    name: 'Apple AirPods Pro (2nd Gen)',
    brand: 'Apple',
    category: 'Audio',
    price: 249,
    originalPrice: 279,
    tier: 'balanced',
    image: 'bg-gradient-to-tr from-slate-200 to-slate-400',
    specs: {
      Acoustics: 'Custom high-excursion Apple driver',
      ANC: '2x Active Noise Cancellation with H2 processor',
      Waterproof: 'IP54 Sweat and Dust Protection',
      Battery: 'Up to 6 hours active (30 hours total)'
    },
    features: [
      'Adaptive Audio Smart Acoustic adjustment',
      'Touch Control Stem adjusts volume natively',
      'MagSafe Case with USB-C and Built-in Speaker',
      'Cinematic Spatial Audio with Dynamic Tracking'
    ],
    description: 'Supreme active noise cancellation. However, pairing with Galaxy devices disables personalized spatial tracking, quick auto-switching, and single-tap setups.',
    rating: 4.8,
    reviewCount: 1540,
    colors: ['Classic White'],
    stock: 20,
    isNepalPopular: true,
    nepalPopularReason: 'Premium standard-of-choice audio companion, highly popular among high-end professionals in Nepal.'
  }
];
