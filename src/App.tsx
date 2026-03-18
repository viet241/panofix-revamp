/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Theme, ImageState } from './types';
import { Header } from './components/Header';
import { MainCanvas } from './components/MainCanvas';
import { Controller } from './components/Controller';
import { HelpModal } from './components/HelpModal';
import { extractXMP, injectXMP, computeViewFromMetadata } from './xmpHelpers';

export default function App() {
  const [image, setImage] = useState<ImageState | null>(null);
  const [hDegrees, setHDegrees] = useState<number>(90);
  const [vDegrees, setVDegrees] = useState<number>(45);
  const [viewMode, setViewMode] = useState<'map' | '360'>('map');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [northOffset, setNorthOffset] = useState<number>(0);
  const [horizonOffset, setHorizonOffset] = useState<number>(0);
  const [isDraggingNorth, setIsDraggingNorth] = useState(false);
  const [isDraggingHorizon, setIsDraggingHorizon] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.classList.toggle('dark', t === 'dark');
      }
    };
    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleNorthDrag = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const nextNorth = (percent - 50) * 3.6;
    console.log("[Drag] North drag", { x, percent, nextNorth });
    setNorthOffset(nextNorth);
  }, []);

  const handleHorizonDrag = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percent = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const nextHorizon = (percent - 50) * 1.8;
    console.log("[Drag] Horizon drag", { y, percent, nextHorizon });
    setHorizonOffset(nextHorizon);
  }, []);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingNorth) handleNorthDrag(e);
      if (isDraggingHorizon) handleHorizonDrag(e);
    };
    const onPointerUp = () => {
      console.log("[Drag] Pointer up, final offsets", {
        northOffset,
        horizonOffset,
      });
      setIsDraggingNorth(false);
      setIsDraggingHorizon(false);
    };

    if (isDraggingNorth || isDraggingHorizon) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDraggingNorth, isDraggingHorizon, handleNorthDrag, handleHorizonDrag, northOffset, horizonOffset]);

  const updateVDegrees = useCallback((hDeg: number, img: ImageState | null) => {
    if (img) {
      const ratio = img.height / img.width;
      const newVDeg = Math.min(180, Math.round(hDeg * ratio)); 
      setVDegrees(newVDeg);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    const isPNG = file.type === 'image/png';
    const isWebP = file.type === 'image/webp';
    const isHEIC = file.type === 'image/heic' || file.type === 'image/heif';
    const isTIFF = file.type === 'image/tiff' || file.type === 'image/tif' || file.type === 'image/x-tiff';
    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg') && !isPNG && !isWebP && !isHEIC && !isTIFF) {
      setError("Please upload JPEG, PNG, WebP, HEIC or TIFF images.");
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const metadata = extractXMP(buffer);
      console.log("[App] Raw XMP metadata extracted:", metadata);

      const img = new Image();
      img.onerror = () => {
        setError("Could not decode image. HEIC works best in Safari; try another format in this browser.");
        URL.revokeObjectURL(img.src);
      };
      img.onload = () => {
        const ratio = img.height / img.width;
        const needsConvert = isPNG || isWebP || isHEIC || isTIFF;

        if (needsConvert) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            if (isPNG) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const outName = file.name.replace(/\.(png|webp|heic|heif|tiff|tif)$/i, '.jpg');
                const convertedFile = new File([blob], outName, { type: 'image/jpeg' });
                const reader2 = new FileReader();
                reader2.onload = (e2) => {
                  setImage({
                    file: convertedFile,
                    preview: e2.target?.result as string,
                    width: img.width,
                    height: img.height,
                  });
                  if (metadata) {
                    const view = computeViewFromMetadata(metadata, img.width, img.height);
                    setHDegrees(view.hDegrees);
                    setVDegrees(view.vDegrees);
                    setNorthOffset(view.northOffset);
                    setHorizonOffset(view.horizonOffset);
                  } else {
                    setHDegrees(90);
                    setVDegrees(Math.min(180, Math.round(90 * ratio)));
                    setNorthOffset(0);
                    setHorizonOffset(0);
                  }
                };
                reader2.readAsDataURL(convertedFile);
              }
            }, 'image/jpeg', 0.95);
          }
        } else {
          setImage({
            file,
            preview: URL.createObjectURL(file),
            width: img.width,
            height: img.height,
          });
          if (metadata) {
            const view = computeViewFromMetadata(metadata, img.width, img.height);
            console.log("[App] View computed from metadata:", view);
            setHDegrees(view.hDegrees);
            setVDegrees(view.vDegrees);
            setNorthOffset(view.northOffset);
            setHorizonOffset(view.horizonOffset);
          } else {
            setHDegrees(90);
            setVDegrees(Math.min(180, Math.round(90 * ratio)));
            setNorthOffset(0);
            setHorizonOffset(0);
          }
        }
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDownload = async () => {
    if (!image) return;
    console.log("[Export] Starting export with state:", {
      hDegrees,
      vDegrees,
      northOffset,
      horizonOffset,
      imageWidth: image.width,
      imageHeight: image.height,
    });
    setIsProcessing(true);
    try {
      const buffer = await image.file.arrayBuffer();
      const fullPanoWidth = Math.round((image.width * 360) / hDegrees);
      const fullPanoHeight = Math.round((image.height * 180) / vDegrees);
      const leftEdgeRelToNorth = -northOffset - (hDegrees / 2);
      const croppedLeftDegrees = (leftEdgeRelToNorth + 180 + 720) % 360;
      const croppedLeft = Math.round((croppedLeftDegrees / 360) * fullPanoWidth);
      // CroppedAreaTopPixels controls where the image sits on the sphere.
      // Positive horizonOffset = horizon below center = camera looking up = image shifted up on sphere = smaller croppedTop.
      const centerTop = (fullPanoHeight - image.height) / 2;
      const shiftPixels = horizonOffset * (fullPanoHeight / 180);
      const croppedTop = Math.max(0, Math.min(
          fullPanoHeight - image.height,
          Math.round(centerTop - shiftPixels),
      ));

      console.log("[Export] Computed pano geometry:", {
        fullPanoWidth,
        fullPanoHeight,
        leftEdgeRelToNorth,
        croppedLeftDegrees,
        croppedLeft,
        centerTop,
        shiftPixels,
        croppedTop,
      });

      const newBuffer = injectXMP(buffer, {
        fullPanoWidth,
        fullPanoHeight,
        croppedWidth: image.width,
        croppedHeight: image.height,
        croppedLeft,
        croppedTop,
        posePitchDegrees: horizonOffset,
      });
      console.log("[Export] Injecting XMP with:", {
        posePitchDegrees: horizonOffset,
        croppedTop,
      });

      const blob = new Blob([newBuffer], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pano_h${hDegrees}_v${vDegrees}_${image.file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("An error occurred while processing the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-dvh w-full bg-white dark:bg-[#0A0A0A] text-black dark:text-white font-sans overflow-hidden flex flex-col transition-colors duration-300">
      <Header theme={theme} setTheme={setTheme} onOpenHelp={() => setIsHelpOpen(true)} />
      
      <div className="flex-1 relative flex flex-col overflow-hidden">
        <MainCanvas 
          image={image}
          viewMode={viewMode}
          hDegrees={hDegrees}
          vDegrees={vDegrees}
          northOffset={northOffset}
          horizonOffset={horizonOffset}
          theme={theme}
          isDragging={isDragging}
          isDraggingSlider={isDraggingSlider}
          isDraggingNorth={isDraggingNorth}
          isDraggingHorizon={isDraggingHorizon}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClickUpload={() => fileInputRef.current?.click()}
          onPointerDownNorth={(e) => {
            e.preventDefault();
            setIsDraggingNorth(true);
          }}
          onPointerDownHorizon={(e) => {
            e.preventDefault();
            setIsDraggingHorizon(true);
          }}
          setNorthOffset={setNorthOffset}
          setHorizonOffset={setHorizonOffset}
          fileInputRef={fileInputRef}
          handleFile={handleFile}
          canvasRef={canvasRef}
        />
      </div>

      <Controller 
        image={image}
        hDegrees={hDegrees}
        setHDegrees={setHDegrees}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isProcessing={isProcessing}
        handleDownload={handleDownload}
        setIsDraggingSlider={setIsDraggingSlider}
        updateVDegrees={updateVDegrees}
        error={error}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
