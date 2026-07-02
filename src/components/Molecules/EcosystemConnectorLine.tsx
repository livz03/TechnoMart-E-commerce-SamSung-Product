import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Activity, Radio } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface EcosystemConnectorLineProps {
  fromSelector: string; // CSS Selector of source node, e.g., '#product-sam-s24-ultra'
  toSelector: string;   // CSS Selector of target node, e.g., '#product-sam-buds3-pro'
  isActive?: boolean;
  label?: string;       // Custom connection label, e.g. 'SmartThings Hub Link'
  color?: 'cyan' | 'indigo' | 'emerald' | 'amber';
}

export default function EcosystemConnectorLine({
  fromSelector,
  toSelector,
  isActive = true,
  label = 'SmartThings Sync Gate',
  color = 'cyan'
}: EcosystemConnectorLineProps) {
  const [coords, setCoords] = useState<{ from: Point; to: Point } | null>(null);

  useEffect(() => {
    if (!isActive) {
      setCoords(null);
      return;
    }

    const updateCoordinates = () => {
      const fromEl = document.querySelector(fromSelector);
      const toEl = document.querySelector(toSelector);

      if (!fromEl || !toEl) {
        setCoords(null);
        return;
      }

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Find absolute positions relative to the document body
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      const fromCenter = {
        x: fromRect.left + fromRect.width / 2 + scrollX,
        y: fromRect.top + fromRect.height / 2 + scrollY,
      };

      const toCenter = {
        x: toRect.left + toRect.width / 2 + scrollX,
        y: toRect.top + toRect.height / 2 + scrollY,
      };

      setCoords({ from: fromCenter, to: toCenter });
    };

    // Run initially and set up listeners for resize / scroll
    updateCoordinates();
    
    // Slight delay to ensure layout has stabilized
    const timeoutId = setTimeout(updateCoordinates, 150);

    window.addEventListener('resize', updateCoordinates);
    window.addEventListener('scroll', updateCoordinates);

    // Watch for DOM changes to recalibrate positioning if containers shift
    const observer = new MutationObserver(updateCoordinates);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateCoordinates);
      window.removeEventListener('scroll', updateCoordinates);
      observer.disconnect();
    };
  }, [fromSelector, toSelector, isActive]);

  // Color theme generator
  const theme = useMemo(() => {
    switch (color) {
      case 'indigo':
        return {
          stroke: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.45)',
          bg: 'bg-indigo-950/90 border-indigo-500/50 text-indigo-400',
          indicator: 'bg-indigo-500'
        };
      case 'emerald':
        return {
          stroke: '#10b981',
          glow: 'rgba(16, 185, 129, 0.45)',
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400',
          indicator: 'bg-emerald-500'
        };
      case 'amber':
        return {
          stroke: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.45)',
          bg: 'bg-amber-950/90 border-amber-500/50 text-amber-400',
          indicator: 'bg-amber-500'
        };
      case 'cyan':
      default:
        return {
          stroke: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.45)',
          bg: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-400',
          indicator: 'bg-cyan-500'
        };
    }
  }, [color]);

  if (!coords) return null;

  // Compute bounding box for the absolute positioning of the canvas overlay
  const minX = Math.min(coords.from.x, coords.to.x) - 100;
  const minY = Math.min(coords.from.y, coords.to.y) - 100;
  const maxX = Math.max(coords.from.x, coords.to.x) + 100;
  const maxY = Math.max(coords.from.y, coords.to.y) + 100;
  
  const width = maxX - minX;
  const height = maxY - minY;

  // Convert absolute coordinates to canvas-local coordinates
  const localFrom = { x: coords.from.x - minX, y: coords.from.y - minY };
  const localTo = { x: coords.to.x - minX, y: coords.to.y - minY };

  // Calculate high-fidelity S-curve Bezier control points
  const dx = localTo.x - localFrom.x;
  const dy = localTo.y - localFrom.y;
  
  // High-performance control points drawing an S-curve or adaptive diagonal wave
  const controlPoint1 = {
    x: localFrom.x + dx * 0.4,
    y: localFrom.y + dy * 0.1
  };
  const controlPoint2 = {
    x: localFrom.x + dx * 0.6,
    y: localTo.y - dy * 0.1
  };

  const pathData = `M ${localFrom.x} ${localFrom.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${localTo.x} ${localTo.y}`;

  // Center coordinate of the curve for the high-tech overlay pill badge
  const midPoint = {
    x: localFrom.x + dx * 0.5,
    y: localFrom.y + dy * 0.5
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
        zIndex: 15
      }}
      className="overflow-visible select-none"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          {/* Cyberpunk Glow Filter */}
          <filter id={`neon-filter-${fromSelector}-${toSelector}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Thick translucent background glow shadow path */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={theme.stroke}
          strokeWidth={5}
          style={{ 
            opacity: 0.18, 
            filter: `url(#neon-filter-${fromSelector}-${toSelector})` 
          }}
        />

        {/* Flowing animated dash path */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={theme.stroke}
          strokeWidth={1.8}
          strokeDasharray="8 12"
          animate={{ strokeDashoffset: [0, -32] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ opacity: 0.95 }}
        />

        {/* High-speed spark photon traveling along the Bezier line */}
        <path d={pathData} fill="none" id={`motion-path-${fromSelector}-${toSelector}`} style={{ display: 'none' }} />
        
        <circle r="4.5" fill="#FFFFFF" style={{ filter: `drop-shadow(0 0 4px ${theme.stroke})` }}>
          <animateMotion 
            dur="2.5s" 
            repeatCount="indefinite" 
            path={pathData}
          />
        </circle>

        <circle r="2.5" fill={theme.stroke}>
          <animateMotion 
            dur="2.5s" 
            begin="1.25s" 
            repeatCount="indefinite" 
            path={pathData}
          />
        </circle>
      </svg>

      {/* Floating high-tech telemetry label absolute-positioned at the midpoint of the curve */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'absolute',
          left: `${midPoint.x}px`,
          top: `${midPoint.y}px`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto'
        }}
        className={`px-3 py-1.5 rounded-full border text-[9px] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-2xl backdrop-blur-md ${theme.bg}`}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${theme.indicator}`} />
        </span>
        <span className="whitespace-nowrap flex items-center gap-1">
          <Radio className="w-3 h-3 text-current animate-pulse" />
          {label}
        </span>
      </motion.div>
    </div>
  );
}
