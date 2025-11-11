interface Props {
  children: React.ReactNode
  className?: string
}

export const SubtitleSection = ({children}:Props) => {
  return (
    <p className="max-w-2xl mx-auto font-light italic tracking-wide text-lg md:text-xl mb-8">
        {children}
    </p>
  )
}
