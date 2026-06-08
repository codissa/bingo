import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'success'

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-neon hover:brightness-110',
  ghost: 'bg-white/5 text-white border border-white/15 hover:bg-white/10',
  danger: 'bg-gradient-to-r from-rose-600 to-red-500 text-white hover:brightness-110',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-ink hover:brightness-110',
}

/** Festive neon button used across the admin controls. */
export default function NeonButton({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: NeonButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-2.5 font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
