"use client";

import { useFavorites } from "@/presentation/contexts/FavoritesContext";
import { Heart } from "lucide-react";

interface Props {
  id: string;
  type: "place" | "event";
  size?: number;
  className?: string;
}

export const FavoriteHeartButton = ({ id, type, size = 20, className = "" }: Props) => {
  const { isFavoritePlace, toggleFavoritePlace, isFavoriteEvent, toggleFavoriteEvent } = useFavorites();

  const isFav = type === "place" ? isFavoritePlace(id) : isFavoriteEvent(id);
  const toggle = type === "place" ? toggleFavoritePlace : toggleFavoriteEvent;

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Prevent navigating if wrapped in a Link
        e.stopPropagation(); // Prevent opening modals/detail views
        toggle(id);
      }}
      className={`p-2 rounded-full active:scale-90 transition-all md:hidden ${className}`}
      aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
    >
      <Heart 
        size={size} 
        className={isFav ? "fill-rose-500 text-rose-500" : "text-gray-400 dark:text-gray-500 hover:text-rose-500"} 
      />
    </button>
  );
};
