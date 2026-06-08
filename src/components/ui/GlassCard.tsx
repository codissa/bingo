import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

/** Reusable glassmorphism panel. */
export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return <div className={`glass p-4 sm:p-5 ${className}`}>{children}</div>
}
