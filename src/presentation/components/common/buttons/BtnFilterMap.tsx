
interface BtnFilterMapProps {
  label: string
  value: string
  handleClick: (value: string) => void
  isActive?: boolean
}

export const BtnFilterMap = ({label, value , handleClick, isActive = false }:BtnFilterMapProps) => {
  return (
    <button
      type="button"
      aria-pressed={ isActive }
      // className="flex items-center gap-1 bg-secondary text-primary px-3 py-1 rounded-full hover:bg-rose-300 transition-all duration-300 cursor-pointer"
        className={`flex items-center gap-1  text-white px-3 py-1 rounded-full transition-all duration-300 cursor-pointer border border-white 
          ${isActive ? 'bg-secondary hover:bg-rose-300' : 'bg-primary hover:bg-indigo-900'}
      `}
      onClick={() => handleClick(value)}
    >
      <span className="text-sm">{ label }</span>
    </button>
  )
}
