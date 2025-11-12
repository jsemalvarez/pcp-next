
interface Props {
  children: React.ReactNode
  className?: string
}

export const TitleSection = ({children}:Props) => {
  return (
    <h2 className="p-2 text-center text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-300 tracking-widest">
        {children}
    </h2>
  )
}
