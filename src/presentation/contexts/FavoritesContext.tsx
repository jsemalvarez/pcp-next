"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favoritePlaceIds: string[];
  favoriteEventIds: string[];
  toggleFavoritePlace: (id: string) => void;
  toggleFavoriteEvent: (id: string) => void;
  isFavoritePlace: (id: string) => boolean;
  isFavoriteEvent: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>([]);
  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedPlaces = localStorage.getItem('pcp_favorite_places');
      const storedEvents = localStorage.getItem('pcp_favorite_events');
      
      if (storedPlaces) setFavoritePlaceIds(JSON.parse(storedPlaces));
      if (storedEvents) setFavoriteEventIds(JSON.parse(storedEvents));
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error);
    }
    setInitialized(true);
  }, []);

  // Save to localStorage when favoritePlaceIds changes
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem('pcp_favorite_places', JSON.stringify(favoritePlaceIds));
    } catch (error) {
      console.error('Error saving favorite places to localStorage:', error);
    }
  }, [favoritePlaceIds, initialized]);

  // Save to localStorage when favoriteEventIds changes
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem('pcp_favorite_events', JSON.stringify(favoriteEventIds));
    } catch (error) {
      console.error('Error saving favorite events to localStorage:', error);
    }
  }, [favoriteEventIds, initialized]);

  const toggleFavoritePlace = (id: string) => {
    setFavoritePlaceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFavoriteEvent = (id: string) => {
    setFavoriteEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isFavoritePlace = (id: string) => favoritePlaceIds.includes(id);
  const isFavoriteEvent = (id: string) => favoriteEventIds.includes(id);

  return (
    <FavoritesContext.Provider
      value={{
        favoritePlaceIds,
        favoriteEventIds,
        toggleFavoritePlace,
        toggleFavoriteEvent,
        isFavoritePlace,
        isFavoriteEvent,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
