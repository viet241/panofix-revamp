import React, { useState, useRef, useEffect } from 'react';
import { Download, Globe, Map as MapIcon } from 'lucide-react';
import { ImageState } from '../types';

interface ControllerProps {
  image: ImageState | null;
  hDegrees: number;
  setHDegrees: (val: number) => void;
  viewMode: 'map' | '360';
  setViewMode: (val: 'map' | '360') => void;
  isProcessing: boolean;
  handleDownload: () => void;
  setIsDraggingSlider: (val: boolean) => void;
  onSliderDrag?: (val: number) => void;
  updateVDegrees: (hDeg: number, img: ImageState | null) => void;
  error: string | null;
}

export const Controller: React.FC<ControllerProps> = ({
  image,
  hDegrees,
  setHDegrees,
  viewMode,
  setViewMode,
  isProcessing,
  handleDownload,
  setIsDraggingSlider,
  onSliderDrag,
  updateVDegrees,
  error,
}) => {
  const [displayH, setDisplayH] = useState(hDegrees);
  const draftHRef = useRef(hDegrees);
  const hDragging = useRef(false);

  useEffect(() => {
    if (!hDragging.current) {
      setDisplayH(hDegrees);
      draftHRef.current = hDegrees;
    }
  }, [hDegrees]);

  return (
    <div className="flex-shrink-0 p-3 pb-6 md:p-6 md:pb-7 mb-4 md:mb-0 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 z-40 pb-safe transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-4 md:gap-6 lg:gap-12">
        
        {/* Sliders (Top on Mobile, Center on Desktop) */}
        <div className="w-full lg:flex-1 order-1 lg:order-2">
          {/* Horizontal */}
          <div className="space-y-1 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <label className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-neutral-500">Horizontal FOV</label>
              <span className="text-xs font-mono font-bold text-orange-500">{displayH}°</span>
            </div>
            <input
              type="range"
              min={30}
              max={360}
              value={displayH}
              onPointerDown={() => { hDragging.current = true; setIsDraggingSlider(true); }}
              onPointerUp={() => {
                hDragging.current = false;
                setIsDraggingSlider(false);
                setHDegrees(draftHRef.current);
                updateVDegrees(draftHRef.current, image);
              }}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                draftHRef.current = val;
                setDisplayH(val);
                onSliderDrag?.(val);
              }}
              className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500 touch-none"
            />
            {/* Ruler */}
            <div className="relative w-full h-4 mt-1 pointer-events-none">
              {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360].map((tick) => {
                const percent = ((tick - 30) / (360 - 30)) * 100;
                // Standard range thumb width is ~16px. The center of the thumb is offset by (0.5 - percent/100) * 16px.
                const offset = (0.5 - percent / 100) * 16;
                return (
                  <div 
                    key={tick} 
                    className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                    style={{ left: `calc(${percent}% + ${offset}px)` }}
                  >
                    <div className="w-[1px] h-1 bg-neutral-400 dark:bg-neutral-600" />
                    {tick % 90 === 0 && (
                      <span className="text-[6px] md:text-[7px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">{tick}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons Section (Bottom Row on Mobile, Split on Desktop) */}
        <div className="w-full lg:w-auto flex flex-row items-center gap-3 order-2 lg:contents">
          {/* View Mode Toggle (Left on Mobile Row, Left on Desktop) */}
          <div className="w-auto order-1 lg:order-1">
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-black/5 dark:border-white/5">
              <button 
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white dark:bg-neutral-800 text-orange-500 shadow-sm' : 'text-neutral-400'}`}
              >
                <MapIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Map</span>
              </button>
              <button 
                onClick={() => setViewMode('360')}
                className={`px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === '360' ? 'bg-white dark:bg-neutral-800 text-orange-500 shadow-sm' : 'text-neutral-400'}`}
              >
                <Globe className="w-3 h-3" />
                <span className="hidden sm:inline">360°</span>
              </button>
            </div>
          </div>

          {/* Export Button (Right on Mobile Row, Right on Desktop) */}
          <div className="flex-1 lg:flex-none lg:w-40 order-2 lg:order-3">
            <button
              disabled={!image || isProcessing}
              onClick={handleDownload}
              className={`
                w-full py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all duration-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em]
                ${!image ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'}
                ${isProcessing ? 'animate-pulse' : ''}
              `}
            >
              {isProcessing ? "..." : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-[7px] md:text-[8px] text-red-500 text-center uppercase tracking-widest">{error}</p>
      )}
    </div>
  );
};
