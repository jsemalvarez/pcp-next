import { ImageSlider } from "../ImageSlider/ImageSlider"
import { HeroActions } from "./HeroActions"

export const HeroSection = () => {

  return (
    <section 
        id="hero" 
        aria-labelledby="presentation-title"
        className='min-h-screen pt-[100px] pb-16 flex flex-col justify-center items-center'
    >

        <ImageSlider />

        <header className="text-center mt-6">
            <h1 className="text-4xl uppercase md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-100 drop-shadow-lg drop-shadow-primary">
                Paseos con Peques
            </h1>
            <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-100 drop-shadow-lg drop-shadow-primary">
                Aventuras en familia
            </h2>
        </header>

        <HeroActions />

        <div className="py-4 text-4xl font-bold text-center tracking-widest max-w-3xl w-full text-indigo-100">
            Acá te podemos ayudar!!!
        </div>


    </section>
  )
}
