import { NavItem } from "./NavItem"
import { CalendarIcon, FacebookIcon, InstagramIcon, LocationIcon, SearchIcon } from "@/presentation/icons"


const navItems = [
  {
    href: "#mapSection",
    icon: LocationIcon,
    label: "Mapa"
  },
  {
    href: "#calendarSection",
    icon: CalendarIcon,
    label: "Calendario"
  },
  {
    href: "#searchSection",
    icon: SearchIcon,
    label: "Buscador"
  },
]

export const PublicNavbar = () => {
  return (
    <nav 
      role="navigation"
      aria-label="Barra de navegación pública"
      className='fixed top-0 w-full flex justify-between items-center px-4 py-3 bg-primary text-indigo-100 border-b border-solid border-secondary z-1500'
    >
      <a
        href='#hero'
        className='w-[35px] h-[35px] bg-secondary rounded-full flex justify-center items-center text-primary font-semibold transition-all duration-300 hover:bg-rose-300'
      >PcP</a>

      <ul className='flex gap-3'>
        {                  
          navItems.map( item => (            
            <NavItem 
              key={ item.label } 
              href={ item.href } 
              Icon={ item.icon } 
              label={ item.label } 
            />
          ))
        }
      </ul>
      <span className="flex gap-1">
          <a href='https://www.instagram.com/paseosconpequesmdp' target='_blank'>
              <InstagramIcon />
          </a>
          <a href='https://www.facebook.com/people/Paseos-con-Peques-MdP/61564576603332/' target='_blank'>
              <FacebookIcon />
          </a>
      </span>
    </nav>
  )
}
