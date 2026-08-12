import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OpenVPM — Šablóny veterinárnych kliník',
  description:
    'Päť profesionálnych šablón pre veterinárne kliniky. Minimalistická, hrejivá, klinická, hravá a pohotovostná varianta — všetky v slovenčine.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" className={`${inter.variable} ${dmSans.variable} light bg-background`}>
      <body className="antialiased bg-background text-foreground font-sans">{children}</body>
    </html>
  )
}
