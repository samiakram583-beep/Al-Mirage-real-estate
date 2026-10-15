import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon, Building } from 'lucide-react';
import { PropertyImage } from '../../types';

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  // Filter out any invalid or dead blob images
  const cleanImages = (images || []).filter(
    (img) => img && img.public_url && !img.public_url.startsWith('blob:')
  );

  const validImages = cleanImages.length > 0 ? cleanImages : [
    {
      id: 'default',
      property_id: 'default',
      storage_path: 'default.jpg',
      public_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      sort_order: 1,
      is_primary: true,
      alt_text: title,
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!fullscreenOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setFullscreenOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreenOpen, validImages.length]);

  const isCurrentFailed = Boolean(failedImages[currentIndex]);

  return (
    <div className="space-y-3">
      {/* Main Image Container */}
      <div className="relative h-[360px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden bg-[#F4F5F2] border border-[#E4E6E1] shadow-xs group">
        {!isCurrentFailed ? (
          <img
            src={validImages[currentIndex]?.public_url}
            alt={validImages[currentIndex]?.alt_text || title}
            onError={() => setFailedImages((prev) => ({ ...prev, [currentIndex]: true }))}
            className="w-full h-full object-cover select-none transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#173C32]/5 via-[#F4F5F2] to-[#B89B5E]/10">
            <div className="w-16 h-16 rounded-2xl bg-[#173C32] border border-[#B89B5E]/30 flex items-center justify-center text-white mb-3 shadow-md">
              <Building className="w-8 h-8 text-[#B89B5E]" />
            </div>
            <p className="text-sm font-bold text-[#171A18] max-w-sm">{title}</p>
            <span className="mt-2 text-xs font-semibold text-[#173C32] bg-white/90 px-3 py-1 rounded-full border border-[#E4E6E1] shadow-xs">
              Property Showcase
            </span>
          </div>
        )}

        {/* Counter Badge */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {currentIndex + 1} / {validImages.length}
          </span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setFullscreenOpen(true)}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition border border-white/10"
          title="Fullscreen Gallery"
          aria-label="Fullscreen Gallery"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center transition border border-white/10 shadow-lg"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center transition border border-white/10 shadow-lg"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Bar */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {validImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === idx
                  ? 'border-amber-500 ring-2 ring-amber-400/40 opacity-100 scale-95'
                  : 'border-transparent opacity-65 hover:opacity-100'
              }`}
            >
              {!failedImages[idx] ? (
                <img
                  src={img.public_url}
                  alt=""
                  onError={() => setFailedImages((prev) => ({ ...prev, [idx]: true }))}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#ECEEEA] flex items-center justify-center text-[#173C32]">
                  <Building className="w-5 h-5 text-[#B89B5E]" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
            <div>
              <p className="text-sm font-bold text-amber-400">{title}</p>
              <p className="text-xs text-slate-400">
                Photo {currentIndex + 1} of {validImages.length}
              </p>
            </div>
            <button
              onClick={() => setFullscreenOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center max-h-[80vh] my-auto">
            {!isCurrentFailed ? (
              <img
                src={validImages[currentIndex]?.public_url}
                alt=""
                onError={() => setFailedImages((prev) => ({ ...prev, [currentIndex]: true }))}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
                <Building className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-white font-bold text-sm">{title}</p>
              </div>
            )}

            {validImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Bottom thumbnail strip in fullscreen */}
          <div className="flex justify-center gap-2 overflow-x-auto pt-4 border-t border-white/10">
            {validImages.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-14 h-11 rounded-lg overflow-hidden border transition ${
                  currentIndex === idx
                    ? 'border-amber-400 opacity-100 scale-105'
                    : 'border-white/20 opacity-40 hover:opacity-80'
                }`}
              >
                <img
                  src={img.public_url}
                  alt=""
                  onError={() => setFailedImages((prev) => ({ ...prev, [idx]: true }))}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
