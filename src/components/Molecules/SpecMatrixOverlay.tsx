import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Camera, 
  Radio, 
  Share2, 
  Network, 
  RefreshCw, 
  Battery, 
  Layers, 
  Smartphone,
  CheckCircle2,
  X
} from 'lucide-react';
import { Product } from '../../types';

interface SpecMatrixOverlayProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpecMatrixOverlay({ product, isOpen, onClose }: SpecMatrixOverlayProps) {
  // Generate highly specific high-tech details based on product type to keep the Samsung/Apple ecosystem theme immersive
  const getExtendedSpecs = () => {
    const isSamsung = product.brand === 'Samsung';
    const name = product.name.toLowerCase();

    if (product.category === 'Phones') {
      return {
        performance: [
          { label: 'Chipset Architecture', value: isSamsung ? '4nm Exynos/Snapdragon Gen 3 Octa-Core' : '3nm A17 Pro Custom TSMC Node', icon: Cpu },
          { label: 'Neural Coprocessor', value: isSamsung ? 'Galaxy AI Engine (dual NPU + TPU)' : '16-core Apple Neural Engine', icon: Zap },
          { label: 'Battery Capacity', value: product.specs.Battery || '5000 mAh High-Density Li-Po', icon: Battery },
        ],
        optics: [
          { label: 'Primary Optics Sensor', value: product.specs.Camera || '200MP ISOCELL Zoom Lens', icon: Camera },
          { label: 'Biometric Integration', value: isSamsung ? 'Ultrasonic Under-Display Scanner' : 'FaceID TrueDepth Sensor Suite', icon: Activity },
          { label: 'Display Refresh Mode', value: product.specs.Display || 'Adaptive 1Hz-120Hz LTPO AMOLED', icon: Radio },
        ],
        ecosystem: [
          { label: 'Dynamic Sync Link', value: isSamsung ? 'SmartThings Hub / Galaxy Clipboard' : 'Apple AirDrop / iCloud Continuity', icon: Share2 },
          { label: 'Ultra-Wideband Node', value: 'UWB Precision Positioning v2 Chipset', icon: Network },
          { label: 'Multi-Device Handoff', value: isSamsung ? 'Samsung DeX & Multi Control Sync' : 'Sidecar & Handoff Audio Redirect', icon: RefreshCw },
        ]
      };
    } else if (product.category === 'Laptops') {
      return {
        performance: [
          { label: 'Processing Core', value: product.specs.Processor || 'Intel Core Ultra 9 / AI Boost', icon: Cpu },
          { label: 'Thermal Engineering', value: 'Vapor Chamber Dual-Jet Boost Fans', icon: Zap },
          { label: 'Bus Speed', value: '6400MHz Dual-Channel LPDDR5X Matrix', icon: Layers },
        ],
        optics: [
          { label: 'Image Signal Processor', value: 'AI Webcam Auto-Framing with Eye-Tracking', icon: Camera },
          { label: 'Adaptive Sensor Hub', value: 'Ambient Color Temperature Adjuster', icon: Radio },
          { label: 'Audio Acoustics Array', value: 'Studio Quad Speakers tuned by AKG / Dolby', icon: Activity },
        ],
        ecosystem: [
          { label: 'Hardware Bridge', value: isSamsung ? 'Galaxy Tab Active Second Screen' : 'Universal Control Keyboard Bridge', icon: Share2 },
          { label: 'Quick Exchange', value: isSamsung ? 'Galaxy Quick Share Direct 1Gbps' : 'AirDrop High-Speed Exchange', icon: Network },
          { label: 'Peripheral Sync', value: isSamsung ? 'Auto-Switch Galaxy Buds Hub' : 'AirPods Pro Seamless Handover', icon: RefreshCw },
        ]
      };
    } else if (product.category === 'Wearables') {
      return {
        performance: [
          { label: 'Processor Node', value: isSamsung ? '3nm Exynos W1000 Pentacore' : 'Apple S9 SiP with 64-bit Core', icon: Cpu },
          { label: 'Energy Management', value: product.specs.Battery || 'Dual power-state optimization NPF', icon: Battery },
          { label: 'Memory Cache', value: '32GB High-Speed eMMC Flash', icon: Layers },
        ],
        optics: [
          { label: 'Heart Rate Bio-Sensor', value: 'Photoplethysmography LED Pulse Array', icon: Activity },
          { label: 'Positioning Engine', value: product.specs.GPS || 'Dual-Frequency L1+L5 Multiband GPS', icon: Radio },
          { label: 'Clinical Integration', value: 'ECG Electrocardiogram & BIA Body Analysis', icon: Camera },
        ],
        ecosystem: [
          { label: 'Telemetry Mirror', value: isSamsung ? 'SmartThings Find Network Tracker' : 'Apple FindMy Precision Location', icon: Share2 },
          { label: 'Automation Trigger', value: isSamsung ? 'Custom Action Key Automation Routines' : 'Apple Action Button Focus Control', icon: Network },
          { label: 'Smart Home Gateway', value: isSamsung ? 'Matter Protocol Over Thread Node' : 'Apple HomeKit Hub Continuity', icon: RefreshCw },
        ]
      };
    } else {
      // Default / Audio / Accessories category
      return {
        performance: [
          { label: 'Audio Engine DSP', value: isSamsung ? 'Dual Amp Coaxial SSC Codec' : 'Custom Apple H2 High-Excursion SoC', icon: Cpu },
          { label: 'Power Matrix', value: product.specs.Battery || 'Up to 30 Hours with Charging Case', icon: Battery },
          { label: 'Acoustic Tuning', value: 'Adaptive Real-Time EQ Optimization', icon: Zap },
        ],
        optics: [
          { label: 'ANC Microphone Matrix', value: 'Triple-Mic Beamforming Voice Focus', icon: Camera },
          { label: 'Spatial Gyro Sensors', value: 'Dynamic Head Tracking Spatial Sensor', icon: Activity },
          { label: 'Physical Interface', value: 'Capacitive Blade Swipe Gestures', icon: Radio },
        ],
        ecosystem: [
          { label: 'Audio Handover', value: isSamsung ? 'Samsung Seamless Codec Auto-Switch' : 'iCloud Account Bluetooth Seamless Handover', icon: Share2 },
          { label: 'Proximity Pairing', value: isSamsung ? 'One-Tap Pop-Up Easy Pairing Node' : 'iOS Near-Field Pairing UI Sync', icon: Network },
          { label: 'Lossless Streaming', value: isSamsung ? '24bit/96kHz High Fidelity Audio' : 'AAC Spatial Audio Stream Sync', icon: RefreshCw },
        ]
      };
    }
  };

  const specs = getExtendedSpecs();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex overflow-hidden rounded-3xl bg-slate-950/45 backdrop-blur-xl border border-slate-800"
          id={`spec-overlay-${product.id}`}
        >
          {/* LEFT DOOR */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 120 }}
            className="w-1/2 h-full bg-slate-950/95 border-r border-slate-800/60 flex flex-col justify-between p-4 text-left overflow-y-auto scrollbar-thin select-none"
          >
            <div className="space-y-3.5">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <div className="p-1 rounded-md bg-blue-950/60 border border-blue-900/30 text-blue-400">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <h5 className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
                  Processor & Performance
                </h5>
              </div>

              <div className="space-y-2.5">
                {specs.performance.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="space-y-1 group">
                      <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500 uppercase tracking-wider">
                        <IconComponent className="w-2.5 h-2.5 text-blue-400/80 group-hover:text-blue-400 transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-200 font-sans font-semibold leading-normal pl-3.5">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3.5 mt-4 pt-3 border-t border-slate-900">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <div className="p-1 rounded-md bg-amber-950/60 border border-amber-900/30 text-amber-400">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <h5 className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
                  Optics & Sensors
                </h5>
              </div>

              <div className="space-y-2.5">
                {specs.optics.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="space-y-1 group">
                      <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500 uppercase tracking-wider">
                        <IconComponent className="w-2.5 h-2.5 text-amber-400/80 group-hover:text-amber-400 transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-200 font-sans font-semibold leading-normal pl-3.5">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* RIGHT DOOR */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 120 }}
            className="w-1/2 h-full bg-slate-950/95 flex flex-col justify-between p-4 text-left overflow-y-auto scrollbar-thin select-none"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-indigo-950/60 border border-indigo-900/30 text-indigo-400">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
                    Ecosystem Links
                  </h5>
                </div>
                
                {/* Close Button absolute-styled on the right panel */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  aria-label="Close details"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {specs.ecosystem.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="space-y-1 group">
                      <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500 uppercase tracking-wider">
                        <IconComponent className="w-2.5 h-2.5 text-indigo-400/80 group-hover:text-indigo-400 transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-200 font-sans font-semibold leading-normal pl-3.5">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Status Badges at the bottom right */}
            <div className="mt-4 pt-3 border-t border-slate-900 space-y-2">
              <div className="flex items-center gap-1.5 text-[8px] font-mono bg-emerald-950/30 border border-emerald-900/30 rounded-lg p-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <div className="text-left">
                  <span className="font-extrabold block uppercase tracking-wider leading-none">ACTIVE ALLIANCE</span>
                  <span className="text-[7px] text-slate-500 mt-0.5 block leading-none">SmartThings Protocol Ready</span>
                </div>
              </div>

              <div className="text-[8.5px] font-mono text-slate-500 flex justify-between">
                <span>VER: SYNERGY.01</span>
                <span>HW: {product.brand.toUpperCase()}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
