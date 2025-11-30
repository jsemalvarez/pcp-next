
interface Props {
  children: React.ReactNode
  className?: string
}

export const TitleSection = ({children}:Props) => {
  return (
    <h2 
      className="p-2 text-center text-5xl font-extrabold text-primary text-shadow-sm text-shadow-cyan-600 tracking-widest"
    >
        {children}
    </h2>
  )
}
