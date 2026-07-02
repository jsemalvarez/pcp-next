"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
  photoId?: string | null;
  isActive: boolean;
  priority: number;
}

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center">
        <span className="text-sm font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest select-none">
          Bienvenidos a Paseos con Peques
        </span>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Main Carousel Area */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
        {banners.map((banner, index) => {
          const isExternal = banner.linkUrl?.startsWith("http");

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center ${
                index === currentIndex ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-full scale-95"
              }`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`,
                opacity: index === currentIndex ? 1 : 0,
                visibility: index === currentIndex ? 'visible' : 'hidden'
              }}
            >
              {/* Background image or colored fallback */}
              {banner.photoId ? (
                <img
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwhdla1b4'}/image/upload/w_1200,q_auto,f_auto/${banner.photoId}`}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center p-8 text-center bg-brand-primary"
                >
                  <div className="max-w-md">
                    <p className="text-white text-lg md:text-2xl font-black uppercase tracking-wider">
                      {banner.title}
                    </p>
                    {banner.subtitle && (
                      <p className="text-white/80 text-xs md:text-sm font-medium mt-2">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Title Overlay - Bottom Left */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/75 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 shadow-md max-w-[80%]">
                {banner.linkUrl ? (
                  isExternal ? (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group/link"
                    >
                      <span className="text-gray-900 dark:text-white text-xs font-black uppercase tracking-wider group-hover/link:text-brand-primary transition-colors">
                        {banner.title} ↗
                      </span>
                      {banner.subtitle && banner.photoId && (
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5 truncate">
                          {banner.subtitle}
                        </span>
                      )}
                    </a>
                  ) : (
                    <Link href={banner.linkUrl} className="block group/link">
                      <span className="text-gray-900 dark:text-white text-xs font-black uppercase tracking-wider group-hover/link:text-brand-primary transition-colors">
                        {banner.title}
                      </span>
                      {banner.subtitle && banner.photoId && (
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5 truncate">
                          {banner.subtitle}
                        </span>
                      )}
                    </Link>
                  )
                ) : (
                  <div>
                    <span className="text-gray-900 dark:text-white text-xs font-black uppercase tracking-wider">
                      {banner.title}
                    </span>
                    {banner.subtitle && banner.photoId && (
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5 truncate">
                        {banner.subtitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots - Below the component */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 bg-brand-primary"
                  : "w-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
