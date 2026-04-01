import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'NutriTrack — Eat Smart',
  description: 'Minimal nutrition tracking with AI food scanning',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
