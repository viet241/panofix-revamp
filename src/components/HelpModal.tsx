import React from 'react';
import { X, HelpCircle, ExternalLink, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90dvh] bg-white dark:bg-[#121212] rounded-2xl shadow-2xl overflow-hidden border border-black/5 dark:border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-black/5 dark:border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2.5 md:gap-3">
                <div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg">
                  <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold">How to use</h2>
                  <p className="text-[10px] md:text-xs text-neutral-500">PanoFix v1.0.0</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1 min-h-0">
              <section className="space-y-2 md:space-y-3">
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-orange-500">Basic steps</h3>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex gap-3 md:gap-4">
                    <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-[10px] md:text-xs font-bold">1</span>
                    <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">Upload your panorama image (JPEG or PNG).</p>
                  </li>
                  <li className="flex gap-3 md:gap-4">
                    <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-[10px] md:text-xs font-bold">2</span>
                    <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">
                      Use the slider to adjust the <strong>Horizontal FOV</strong>. The vertical FOV is computed automatically from the image aspect ratio.
                    </p>
                  </li>
                  <li className="flex gap-3 md:gap-4">
                    <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-[10px] md:text-xs font-bold">3</span>
                    <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">
                      Drag directly on the image to align the <strong>North direction</strong> and the <strong>Horizon line</strong>.
                    </p>
                  </li>
                  <li className="flex gap-3 md:gap-4">
                    <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-[10px] md:text-xs font-bold">4</span>
                    <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">
                      Click <strong>Export</strong> to get the image with Google/Adobe-compatible XMP panorama metadata embedded.
                    </p>
                  </li>
                </ul>
              </section>

              <section className="space-y-2 md:space-y-3">
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-orange-500">Notes</h3>
                <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  The embedded metadata allows 360° viewers (Facebook, Google Photos, etc.) to detect and render the image as a proper panorama.
                </p>
              </section>
            </div>

            <div className="p-4 md:p-6 bg-neutral-50 dark:bg-white/5 flex flex-col gap-2.5 md:gap-3 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[11px] md:text-xs font-medium">Is this app useful for you?</p>
                  <p className="text-[9px] md:text-[10px] text-neutral-500">Consider supporting me to keep this project alive.</p>
                </div>
                <a
                  href="https://ko-fi.com/viet241"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#FF5A15] hover:bg-[#e14c00] text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-blue-500/20 group"
                >
                  <Coffee className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:animate-bounce" />
                  <span>Buy me a coffee</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </div>
              <div className="border-t border-black/5 dark:border-white/10 mt-1" />
              <p className="text-[11px] md:text-[12px] text-neutral-400 text-center">
                Made by <span className="font-semibold">@viet241</span> with <span className="text-red-500">♥</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
