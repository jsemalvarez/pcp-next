'use client'

import { useEffect, useState } from "react";
import { sliderImagesHero } from "@/data/slider/sliderImagesHero";
import { CloudinaryImage } from "../common/CloudinaryImage";


interface ImageSliderProps {
  images?: {
    imageName: string;
    title: string;
    subTitle: string;
  }[];
  intervalTime?: number;
}

export const ImageSlider = ({ images = sliderImagesHero, intervalTime = 4000 }: ImageSliderProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [images.length, intervalTime]);

  return (
    <div className="w-9/10 max-w-[1200px] aspect-[7/4] sm:aspect-[8/4] md:aspect-[9/3] overflow-hidden relative rounded-lg shadow-md">
      {images.map((img, index) => (
        <div
          key={index}
          className={`w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <CloudinaryImage
            imageName={img.imageName}
            alt={img.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 bg-primary/80 backdrop-blur-sm px-6 py-1 rounded-md shadow-lg">
            <h3 className="text-lg text-secondary font-semibold">{img.title}</h3>
            <p className="hidden sm:block -mt-2 font-light">{img.subTitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
