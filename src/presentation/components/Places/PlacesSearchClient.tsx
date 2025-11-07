'use client';

import { Place } from "@/presentation/types/places";
import { useMemo, useState } from "react";
import { PlacesSearchGrid } from "./PlacesSearchGrid";
import { PaginationControls } from "./PaginationControls";


interface Props{
    places: Place[]
}

export const PlacesSearchClient = ({places}:Props) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 6;

    const filteredPlaces = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        // if (term.length < 3) return places; // opcional
        return places.filter((place) =>
        place.name.toLowerCase().includes(term)
        );
    }, [searchTerm, places]);


    const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
    const currentPlaces = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredPlaces.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredPlaces, currentPage])

    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    const handleFilterPlaces = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }

    return (
        <>
            <div className="flex justify-center mb-6">
                <input
                    type="text"
                    placeholder="Buscar lugar..."
                    value={searchTerm}
                    onChange={(e) => handleFilterPlaces(e.target.value)}
                    className="w-full max-w-md mx-6 bg-primary p-2 border-cian border-2 shadow-lg shadow-primary p-2 rounded-lg focus:outline-hidden"
                />
            </div>

            <PlacesSearchGrid places={currentPlaces} />
            <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
            />
            
        </>
        
    )
}
