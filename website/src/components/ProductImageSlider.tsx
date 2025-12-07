// components/ProductImageSlider.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Package, ImageIcon } from 'lucide-react';

interface ProductImageSliderProps {
  images: string[];
  productName: string;
}

export default function ProductImageSlider({ images, productName }: ProductImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300">
        <Package className="h-10 w-10" />
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click (like "Edit")
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-100 group">
      {/* Current Image */}
      <Image
        src={images[currentIndex]}
        alt={`${productName} - View ${currentIndex + 1}`}
        fill
        unoptimized // Fixes the SVG/JPG error
        className="object-cover transition-transform duration-500 hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Navigation Arrows (Only show if > 1 image) */}
      {images.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-black shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-black shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Badge Counter */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm pointer-events-none">
            <ImageIcon className="h-3 w-3" />
            <span>
              {currentIndex + 1}/{images.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}