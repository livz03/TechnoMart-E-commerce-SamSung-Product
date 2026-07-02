import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Check, Cpu, HardDrive, Zap } from 'lucide-react';

export interface StorageOption {
  id: string;
  size: string;
  speed: string; // e.g., "UFS 4.0 (4200 MB/s)" or "PCIe 4.0 (7500 MB/s)"
  priceDelta: number; // e.g., +120
  badge?: string; // e.g., "POPULAR" or "RECOMMENDED"
}

interface StorageConfiguratorProps {
  selectedOptionId: string;
  onChange: (option: StorageOption) => void;
  options?: StorageOption[];
}

export default function StorageConfigurator({
  selectedOptionId,
  onChange,
  options: propOptions
}: StorageConfiguratorProps) {
  // Balanced default storage levels standard for college ecosystem setup
  const defaultOptions: StorageOption[] = useMemo(() => [
    { id: '128gb', size: '128 GB', speed: 'UFS 3.1 (2200 MB/s R/W)', priceDelta: 0 },
    { id: '256gb', size: '256 GB', speed: 'UFS 4.0 (4200 MB/s R/W)', priceDelta: 100, badge: 'BALANCED' },
    { id: '512gb', size: '512 GB', speed: 'UFS 4.0 (4200 MB/s R/W)', priceDelta: 220, badge: 'MOST POPULAR' },
    { id: '1tb', size: '1 TB', speed: 'PCIe NVMe (7500 MB/s R/W)', priceDelta: 420, badge: 'PRO STUDIO' }
  ], []);

  const options = propOptions || defaultOptions;
  const selectedIdx = options.findIndex(opt => opt.id === selectedOptionId);

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-indigo-400 animate-pulse" />
          Tactile Storage Level Configuration
        </label>
        {selectedIdx !== -1 && (
          <span className="text-[10px] font-mono text-emerald-400 font-extrabold bg-emerald-950/40 border border-emerald-900/35 px-2.5 py-0.5 rounded-md">
            SPEED LIMIT: {options[selectedIdx].speed.split(' ')[0]} PRO ACTIVE
          </span>
        )}
      </div>

      {/* Horizontal flex system of luxury layout boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((option, idx) => {
          const isSelected = option.id === selectedOptionId;
          const isAdjacent = selectedIdx !== -1 && Math.abs(idx - selectedIdx) === 1;

          // Determine tactile transformation parameters to simulate physical displacement
          let scaleVal = 1.0;
          let yVal = 0;
          let shadowClass = 'shadow-md';
          let borderClass = 'border-slate-800 bg-slate-900/30';

          if (isSelected) {
            scaleVal = 1.04;
            yVal = -3;
            shadowClass = 'shadow-2xl shadow-indigo-500/10';
            borderClass = 'border-indigo-500/80 bg-indigo-950/20';
          } else if (isAdjacent) {
            // Squish adjacent options slightly as if physically displaced by the selection
            scaleVal = 0.97;
            yVal = 1;
            borderClass = 'border-slate-850 bg-slate-900/15 opacity-75';
          } else if (selectedIdx !== -1) {
            // Non-adjacent options scale down further
            scaleVal = 0.95;
            yVal = 0;
            borderClass = 'border-slate-900 bg-slate-900/10 opacity-50';
          }

          return (
            <motion.button
              key={option.id}
              onClick={(e) => {
                e.preventDefault();
                onChange(option);
              }}
              animate={{ 
                scale: scaleVal, 
                y: yVal,
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 380, 
                damping: 24 
              }}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-28 relative cursor-pointer group transition-all duration-150 ${borderClass} ${shadowClass}`}
            >
              {/* Floating micro-badge */}
              {option.badge && (
                <span className={`absolute top-2 right-2 text-[6.5px] font-mono font-black px-1.5 py-0.5 rounded-xs tracking-wider leading-none uppercase ${
                  isSelected 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                }`}>
                  {option.badge}
                </span>
              )}

              {/* Selection indicator circle */}
              <div className="flex justify-between items-center w-full">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-500 text-white' 
                    : 'border-slate-800 bg-slate-950 group-hover:border-slate-700'
                }`}>
                  {isSelected ? (
                    <Check className="w-3 h-3 text-white stroke-[3px]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-slate-700" />
                  )}
                </div>
              </div>

              {/* Main Storage Label details */}
              <div className="space-y-1 mt-2 text-left">
                <span className={`text-sm font-black font-mono leading-none block ${
                  isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {option.size}
                </span>
                
                <span className="text-[7.5px] font-mono text-slate-500 group-hover:text-slate-400 uppercase tracking-tight block truncate max-w-full">
                  {option.speed}
                </span>
              </div>

              {/* Price Delta element */}
              <div className="border-t border-slate-850/60 pt-1.5 mt-1.5 flex items-center justify-between w-full">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">MODIFIER</span>
                <span className={`text-[10px] font-mono font-bold leading-none ${
                  isSelected ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {option.priceDelta === 0 ? 'Included' : `+$${option.priceDelta}`}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
