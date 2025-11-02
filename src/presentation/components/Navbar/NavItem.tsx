import { JSX } from "react";
import { CustomIcon } from "@/presentation/types/icons";


interface NavItemProps{
    href: string;
    label:string;
    Icon: ({ style }: CustomIcon) => JSX.Element
}

export const NavItem = ({ href, label, Icon }:NavItemProps) => (
  <li>
    <a
      href={href}
      className='flex items-center gap-1 px-3 py-1 rounded-sm cursor-pointer text-primary bg-secondary transition-all duration-300 hover:bg-rose-300'
    >
      <Icon style="text-primary" />
      <span className='sr-only sm:not-sr-only'>{label}</span>
    </a>
  </li>
)