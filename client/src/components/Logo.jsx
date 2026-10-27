import { cn } from '../lib/utils'

const tones = {
  orange: {
    tile: 'from-amber-300 via-orange-500 to-orange-600',
    ring: 'ring-orange-500/15',
    glow: 'shadow-[0_10px_28px_rgba(249,115,22,0.24)]',
    text: 'text-orange-600',
    accent: 'bg-orange-500',
  },
}

const Mark = ({ tone }) => {
  const palette = tones[tone] || tones.orange
  return (
    <span className={cn('relative grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br ring-1 transition duration-300 group-hover:-rotate-3 group-hover:scale-105', palette.tile, palette.ring, palette.glow)}>
      <span className="pointer-events-none absolute inset-x-1 top-0.5 h-1/2 rounded-[7px] bg-gradient-to-b from-white/35 to-transparent" />
      <svg viewBox="0 0 24 24" className="relative h-[19px] w-[19px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" fill="none" aria-hidden="true">
        <path d="M20.6 4.2 3.7 10.8c-.9.36-.88 1.62.03 1.95l5.38 1.94 2.06 5.13c.35.88 1.6.87 1.94-.01l6.53-14.2c.36-.78-.39-1.6-1.2-1.3Z" fill="white" />
        <path d="m9.11 14.7 9.59-8.54-7.45 9.53-.13 3.36 1.78-4.35Z" fill="#ffedd5" fillOpacity=".86" />
        <path d="M9.11 14.7 18.7 6.16" stroke="#f97316" strokeWidth=".9" strokeLinecap="round" />
        <circle cx="20.45" cy="3.55" r="1.2" fill="white" fillOpacity=".92" />
      </svg>
    </span>
  )
}

export const Logo = ({ compact = false, tone = 'orange', className }) => {
  const palette = tones[tone] || tones.orange
  return (
    <div className={cn('group flex items-center gap-2.5', className)}>
      <Mark tone={tone} />
      {!compact && (
        <span className="flex items-baseline text-[16px] font-extrabold leading-none tracking-[-0.05em]">
          <span>Lead</span>
          <span className={palette.text}>Pilot</span>
          <span className={cn('ml-0.5 h-1 w-1 rounded-full', palette.accent)} />
        </span>
      )}
    </div>
  )
}
