'use client'

import dynamic from 'next/dynamic'

const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

//TODO: pensar nombres que dejen claro que esto pertenece a place
import { Place } from '@/domain/entities/Place'
import { ICONS_TYPES } from '@/presentation/constants/icons-types'
import { COLORS_BY_CATEGORIES } from '@/presentation/constants/categories'
import { getCustomSvgIcon } from '@/presentation/utils/getCustomSvgIcon'
import { createSvgIcon } from '@/presentation/utils/createSvgIcon'

interface Props{
    places: Place[];
    setSetselectedPlace: (place:Place | null) => void;
}

export default function Markers({ places, setSetselectedPlace }:Props){

  const eventHandler = (place:Place) => {      
    return {
      click() {
        setSetselectedPlace(place)
      },
  }}

  return (
    <>
      {
        places.map( place => {

          if(place.isShowInMap){

            const placeType = place.iconType || ICONS_TYPES.PLAY_ROOM;
            const svgIconType = ICONS_TYPES[ placeType as keyof typeof ICONS_TYPES ];

            const bgColor = place.bgColor || COLORS_BY_CATEGORIES.ENTERTIME; 
            const icon = (place.hasCustomIcon)
              ?getCustomSvgIcon({imageId: place.photoUrl})
              :createSvgIcon({ bgColor, svgIconType })

            return (
              < Marker 
                key={place.id} 
                position={place.position} 
                icon={icon}
                eventHandlers={eventHandler(place)}
              />                
            )
          }
          return null
        })
      }
    </>
  )
}
