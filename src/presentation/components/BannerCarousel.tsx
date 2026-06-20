"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BannerCarousel() {
    const banners = [
        { id: 1, title: "Anuncio Destacado 1" },
        { id: 2, title: "Anuncio Destacado 2" },
        { id: 3, title: "Anuncio Destacado 3" },
        { id: 4, title: "Anuncio Destacado 4" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative group">
            {/* Main Carousel Area */}
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center ${index === currentIndex ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-full scale-95"
                            }`}
                        style={{
                            transform: `translateX(${(index - currentIndex) * 100}%)`,
                            opacity: index === currentIndex ? 1 : 0,
                            visibility: index === currentIndex ? 'visible' : 'hidden'
                        }}
                    >
                        {/* Placeholder Background/Logo */}
                        <span className="text-xl font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest select-none">
                            Slider {banner.id}
                        </span>

                        {/* Title - Bottom Left */}
                        <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-2xl border border-white/20">
                            <span className="text-gray-900 dark:text-white text-[10px] font-bold uppercase tracking-wider">
                                {banner.title}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                    aria-label="Next slide"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Pagination Dots - Below the component */}
            <div className="flex justify-center gap-2 mt-4">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1.5 transition-all duration-300 rounded-full ${index === currentIndex
                            ? "w-8 bg-brand-primary"
                            : "w-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
