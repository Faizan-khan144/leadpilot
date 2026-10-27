import { initials } from '../lib/utils'

const sizes = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-lg',
}

export const Avatar = ({ user, name, color, size = 'md', className = '' }) => {
  const label = name || user?.name || user?.email || '?'
  const background = color || user?.avatarColor || '#ea580c'
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white ring-2 ring-[var(--surface)] ${sizes[size]} ${className}`}
      style={{ background }}
      title={label}
    >
      {initials(label)}
    </span>
  )
}
