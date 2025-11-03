
import { heroCards } from "@/data/heroCards";
import { HeroCard } from "@/presentation/types/heroCard";
import { HeroCardItem } from "./HeroCardItem";

export const HeroActions = () => {
  return (
    <div 
        id="hero"
        className="px-4 py-8 flex flex-wrap justify-center gap-6 w-full max-w-5xl"
    >
        {heroCards.map(({ id, Icon, text, href }:HeroCard) => (
          <HeroCardItem 
            key={id}
            Icon={<Icon style="w-10 h-10 text-pink-900" />}
            text={text}
            href={href}
          />
        ))}
      </div>
  )
}
