'use client'

import dynamic from 'next/dynamic'

import "leaflet/dist/leaflet.css";

import { useMemo, useState } from "react";
import { Place } from "@/domain/entities/Place"
import { CATEGORIES, CATEGORIES_TRANSLATE } from '@/presentation/constants/categories';
import { AGE_RANGES } from '@/presentation/constants/event-filters';
import { BtnFilterMap } from '../common/buttons/BtnFilterMap';
const MapView = dynamic(() => import('./components/MapView'), {
  ssr: false,
})


interface Props{
    places: Place[]
}

export const PlacesMapClient = ({places}:Props) => {

    const [category, setCategory] = useState('all')
    const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);

    const handleAgeRangeChange = (rangeId:string) => {
        setSelectedAgeRanges((prev) =>
        prev.includes(rangeId)
            ? prev.filter((id) => id !== rangeId)
            : [...prev, rangeId]
        )
    };

    const filteredPlaces = useMemo(() =>{
        return places.filter( place => {
            const hasPlaceCategory = category === 'all'||  place.categories.length == 0 || place.categories.includes(category);
            const hasPlaceAgeRange = selectedAgeRanges.length === 0 || place.ageRanges.some((range) => selectedAgeRanges.includes(range))
            return hasPlaceCategory && hasPlaceAgeRange;
        })
    },[category, selectedAgeRanges, places])


    return (
        <div className='flex flex-col justify-center items-center'>

            <p className='text-cian'>*Click en los iconos para mas info</p>
            <div className='w-9/10 max-w-[1200px] border-cian border-2 shadow-lg shadow-primary rounded-xl bg-primary overflow-hidden'>
                <div className='aspect-[4/5] md:aspect-[10/5]'>
                    <MapView places={filteredPlaces} />
                </div>

                <div className="text-white px-4 py-2 flex flex-wrap gap-2 items-center justify-center">
                    <BtnFilterMap
                        key='all'
                        value='all'
                        label={ 'Todos' }
                        handleClick={ setCategory }
                        isActive={ category == 'all'}
                    />
                    {
                        Object.values(CATEGORIES).map( categoryName => (
                            <BtnFilterMap
                                key={ categoryName }
                                value={ categoryName }
                                label={CATEGORIES_TRANSLATE[categoryName]}
                                handleClick={ setCategory }
                                isActive={ category == categoryName}
                            />
                        ))
                    }
                </div>

                <div className="flex justify-center items-center bg-secondary">
                    <div className="w-full max-w-md flex flex-wrap justify-center items-center flex-row gap-2 p-2">
                        {AGE_RANGES.map(({ id, label }) => (
                            <label key={id} className="flex items-center justify-center grow-1 gap-2 text-sm px-2 py-1 bg-primary rounded-md">
                                <input
                                    type="checkbox"
                                    value={ id }
                                    checked={selectedAgeRanges.includes(id)}
                                    onChange={() => handleAgeRangeChange(id)}
                                />
                                { label }
                            </label>
                        ))}
                    </div>
                </div>
                
            </div>
        </div>
    )
}
