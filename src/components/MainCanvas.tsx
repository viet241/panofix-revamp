import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import * as THREE from 'three';
import { ImageState, Theme } from '../types';
import { FOVFan } from './FOVFan';

interface MainCanvasProps {
  image: ImageState | null;
  viewMode: 'map' | '360';
  hDegrees: number;
  vDegrees: number;
  northOffset: number;
  horizonOffset: number;
  theme: Theme;
  isDragging: boolean;
  isDraggingSlider: boolean;
  isDraggingNorth: boolean;
  isDraggingHorizon: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClickUpload: () => void;
  onPointerDownNorth: (e: React.PointerEvent) => void;
  onPointerDownHorizon: (e: React.PointerEvent) => void;
  setNorthOffset: (val: number) => void;
  setHorizonOffset: (val: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFile: (file: File) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const MainCanvas: React.FC<MainCanvasProps> = ({
  image,
  viewMode,
  hDegrees,
  vDegrees,
  northOffset,
  horizonOffset,
  theme,
  isDragging,
  isDraggingSlider,
  isDraggingNorth,
  isDraggingHorizon,
  onDrop,
  onDragOver,
  onDragLeave,
  onClickUpload,
  onPointerDownNorth,
  onPointerDownHorizon,
  setNorthOffset,
  setHorizonOffset,
  fileInputRef,
  handleFile,
  canvasRef,
}) => {
  return (
    <main 
      className="flex-1 relative flex items-center justify-center transition-colors duration-300 overflow-hidden select-none"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden" 
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/tiff,image/tif"
      />

      {/* Change Image Button (Overlay) */}
      {image && (
        <button
          onClick={onClickUpload}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border border-black/5 dark:border-white/10 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center gap-2 group"
        >
          <RefreshCw className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          Change Image
        </button>
      )}

      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClickUpload}
            className={`
              w-full h-full flex flex-col items-center justify-center p-8 transition-all duration-700 cursor-pointer
              ${isDragging ? 'bg-orange-500/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}
            `}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Upload className="w-6 h-6 md:w-8 md:h-8 text-neutral-400 dark:text-neutral-600" />
            </div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-neutral-400 dark:text-neutral-600 text-center">Drop your panorama</p>
            <p className="text-[8px] md:text-[9px] text-neutral-500 mt-4 uppercase tracking-widest">JPEG, PNG, WebP, HEIC or TIFF</p>
          </motion.div>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative flex items-center justify-center"
          >
            {viewMode === 'map' ? (
              <div className="w-full h-full relative flex items-center justify-center">
                {/* FOV Fan Overlay */}
                <AnimatePresence>
                  {isDraggingSlider && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 p-3 md:p-4 z-50 pointer-events-none"
                    >
                      <FOVFan degrees={hDegrees} />
                      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                        {hDegrees}°
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Equirectangular Canvas Container */}
                <div className="w-full h-full relative flex items-center justify-center p-4 md:p-6 lg:p-8">
                  <div className="relative shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex items-center justify-center aspect-[2/1] max-w-full max-h-full">
                    {/* 
                      This invisible SVG spacer is the most reliable way to maintain aspect ratio 
                      while fitting within both width AND height constraints of a flex container.
                      We set a very large width to force it to expand, then max-w/h-full to contain it.
                    */}
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 1'%3E%3C/svg%3E" 
                      className="block w-[5000px] max-w-full max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-320px)] h-auto invisible pointer-events-none" 
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <div 
                      ref={canvasRef}
                      className="absolute inset-0 bg-white dark:bg-neutral-900/50 border border-black/5 dark:border-white/5 transition-colors duration-300 touch-none"
                    >
                      <motion.div
                        layout
                        initial={false}
                        animate={{
                          width: `${(hDegrees / 360) * 100}%`,
                          height: `${(vDegrees / 180) * 100}%`,
                        }}
                        transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-100 dark:bg-neutral-800 border-2 border-orange-500/50 shadow-2xl overflow-hidden z-0"
                      >
                        <img 
                          src={image.preview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>

                      {/* Grid Lines */}
                      <div className="absolute inset-0 opacity-20 dark:opacity-20 pointer-events-none z-10">
                        {[...Array(13)].map((_, i) => {
                          const deg = (i / 12) * 360 - 180;
                          return (
                            <div 
                              key={`v-line-${i}`} 
                              className="absolute h-full border-l border-black/40 dark:border-white/40 flex flex-col justify-between" 
                              style={{ left: `${(i / 12) * 100}%` }}
                            >
                              <span className="text-[6px] md:text-[8px] font-mono text-neutral-500 dark:text-neutral-400 -translate-x-1/2 mt-1 bg-white/50 dark:bg-black/50 px-0.5 rounded">
                                {deg === 0 ? '0' : deg > 0 ? `+${deg}` : deg}°
                              </span>
                              <span className="text-[6px] md:text-[8px] font-mono text-neutral-500 dark:text-neutral-400 -translate-x-1/2 mb-1 bg-white/50 dark:bg-black/50 px-0.5 rounded">
                                {deg === 0 ? '0' : deg > 0 ? `+${deg}` : deg}°
                              </span>
                            </div>
                          );
                        })}
                        {[...Array(7)].map((_, i) => (
                          <div 
                            key={`h-line-${i}`} 
                            className="absolute w-full border-t border-black/40 dark:border-white/40" 
                            style={{ top: `${(i / 6) * 100}%` }}
                          />
                        ))}
                      </div>

                      {/* North Indicator */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-orange-500 z-20 cursor-ew-resize group"
                        style={{ left: `${((northOffset / 3.6) + 50)}%` }}
                        onPointerDown={onPointerDownNorth}
                        onDoubleClick={() => setNorthOffset(0)}
                        title="Double click to reset North"
                      >
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-500 uppercase tracking-[0.4em] whitespace-nowrap bg-white dark:bg-[#0A0A0A]/80 px-2 py-1 rounded border border-orange-500/30 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          {isDraggingNorth ? `${northOffset.toFixed(1)}°` : 'North'}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-orange-500/20 border border-orange-500/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Horizon Indicator */}
                      <div 
                        className="absolute left-0 right-0 h-1 bg-blue-500 z-20 cursor-ns-resize group"
                        style={{ top: `${((horizonOffset / 1.8) + 50)}%` }}
                        onPointerDown={onPointerDownHorizon}
                        onDoubleClick={() => setHorizonOffset(0)}
                        title="Double click to reset Horizon"
                      >
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[9px] font-bold text-blue-500 uppercase tracking-[0.4em] whitespace-nowrap bg-white dark:bg-[#0A0A0A]/80 px-2 py-1 rounded border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          {isDraggingHorizon ? `${horizonOffset.toFixed(1)}°` : 'Horizon'}
                        </div>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-8 bg-blue-500/20 border border-blue-500/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Viewer360 imageUrl={image.preview} hDeg={hDegrees} vDeg={vDegrees} northOff={northOffset} horizonOff={horizonOffset} theme={theme} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

const MIN_FOV = 10;
const MAX_FOV = 100;
const ZOOM_STEP = 10;

const Viewer360 = ({ imageUrl, hDeg, vDeg, northOff, horizonOff, theme }: { imageUrl: string, hDeg: number, vDeg: number, northOff: number, horizonOff: number, theme: Theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const adjustFov = useCallback((delta: number) => {
    const cam = cameraRef.current;
    if (!cam) return;
    cam.fov = THREE.MathUtils.clamp(cam.fov + delta, MIN_FOV, MAX_FOV);
    cam.updateProjectionMatrix();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(MAX_FOV, width / height, 0.1, 2000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const isDark = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark';

    renderer.setClearColor(isDark ? 0x0A0A0A : 0xF5F5F5);
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const bgGeometry = new THREE.SphereGeometry(600, 60, 40);
    bgGeometry.scale(-1, 1, 1);

    const bgMaterial = new THREE.MeshBasicMaterial({
      color: isDark ? 0xffffff : 0x000000,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });
    const bgSphere = new THREE.Mesh(bgGeometry, bgMaterial);
    scene.add(bgSphere);

    const phiLength = (hDeg / 360) * Math.PI * 2;
    const phiStart = Math.PI - (northOff * Math.PI / 180) - (phiLength / 2);
    const thetaLength = (vDeg / 180) * Math.PI;
    const thetaStart = (Math.PI / 2) - (thetaLength / 2);

    const geometry = new THREE.SphereGeometry(500, 60, 40, phiStart, phiLength, thetaStart, thetaLength);
    geometry.scale(-1, 1, 1);

    const texture = new THREE.TextureLoader().load(imageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.set(0, 0, 0.1);

    let isPanning = false;
    let onPointerDownPointerX = 0;
    let onPointerDownPointerY = 0;
    let onPointerDownLon = 0;
    let onPointerDownLat = 0;
    let lon = 180;
    let lat = 0;

    const pointers = new Map<number, { x: number; y: number }>();
    let lastPinchDist = 0;

    const getPinchDist = () => {
      const pts = Array.from(pointers.values());
      if (pts.length < 2) return 0;
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onPointerDown = (event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1) {
        isPanning = true;
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
      } else if (pointers.size >= 2) {
        isPanning = false;
        lastPinchDist = getPinchDist();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointers.has(event.pointerId)) {
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }

      if (pointers.size >= 2) {
        const dist = getPinchDist();
        if (lastPinchDist > 0) {
          const delta = (lastPinchDist - dist) * 0.15;
          camera.fov = THREE.MathUtils.clamp(camera.fov + delta, MIN_FOV, MAX_FOV);
          camera.updateProjectionMatrix();
        }
        lastPinchDist = dist;
      } else if (isPanning) {
        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) lastPinchDist = 0;
      if (pointers.size === 0) isPanning = false;

      if (pointers.size === 1) {
        const remaining = Array.from(pointers.entries())[0];
        isPanning = true;
        onPointerDownPointerX = remaining[1].x;
        onPointerDownPointerY = remaining[1].y;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
      }
    };

    const onWheel = (event: WheelEvent) => {
      camera.fov = THREE.MathUtils.clamp(camera.fov + event.deltaY * 0.05, MIN_FOV, MAX_FOV);
      camera.updateProjectionMatrix();
    };

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    containerRef.current.addEventListener('pointerdown', onPointerDown);
    containerRef.current.addEventListener('pointermove', onPointerMove);
    containerRef.current.addEventListener('pointerup', onPointerUp);
    containerRef.current.addEventListener('pointercancel', onPointerUp);
    containerRef.current.addEventListener('wheel', onWheel);
    window.addEventListener('resize', handleResize);

    const cameraTarget = new THREE.Vector3(0, 0, 0);
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      lat = Math.max(-85, Math.min(85, lat));
      const phi = THREE.MathUtils.degToRad(90 - (lat - horizonOff));
      const theta = THREE.MathUtils.degToRad(lon);
      cameraTarget.set(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
      camera.lookAt(cameraTarget);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      cameraRef.current = null;
      if (containerRef.current) {
        containerRef.current.removeEventListener('pointerdown', onPointerDown);
        containerRef.current.removeEventListener('pointermove', onPointerMove);
        containerRef.current.removeEventListener('pointerup', onPointerUp);
        containerRef.current.removeEventListener('pointercancel', onPointerUp);
        containerRef.current.removeEventListener('wheel', onWheel);
      }
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      bgGeometry.dispose();
      bgMaterial.dispose();
    };
  }, [imageUrl, theme, hDeg, vDeg, northOff, horizonOff]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full cursor-move touch-none" />
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
        <button
          onClick={() => adjustFov(-ZOOM_STEP)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white active:scale-95 transition-all text-neutral-600 dark:text-neutral-300"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => adjustFov(ZOOM_STEP)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white active:scale-95 transition-all text-neutral-600 dark:text-neutral-300"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
