'use client'

import { Dispatch, SetStateAction } from "react";

interface TagItem {
    id: string;
    label: string;
}

interface Props {
    labelTag: string;
    elementsTag: TagItem[]; 
    selectedTag: string[];
    setSelectedTag: Dispatch<SetStateAction<string[]>>;
}

export const FilterEventByTag = ({labelTag, elementsTag, selectedTag, setSelectedTag}:Props) => {

        const handlePriceEvent = (priceEventId:string) => {
            setSelectedTag((prev) =>
            prev.includes(priceEventId)
                ? prev.filter((id) => id !== priceEventId)
                : [...prev, priceEventId]
        );
    }

    return (
        <div className='w-full max-w-md'>
            <div>{labelTag}</div>
            <div className="w-full border-cian border-2 shadow-lg shadow-primary flex flex-wrap justify-center items-center gap-2 bg-secondary p-2 rounded-lg">
                {elementsTag.map(({ id, label }) => (
                    <label key={id} className="flex items-center justify-center grow-1 gap-2 text-sm px-2 py-1 bg-primary rounded-md">
                        <input
                            type="checkbox"
                            value={ id }
                            checked={ selectedTag.includes(id) }
                            onChange={() => handlePriceEvent(id)}
                        />
                        { label }
                    </label>
                ))}
            </div>
        </div>
    )
}