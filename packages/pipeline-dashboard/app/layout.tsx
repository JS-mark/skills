import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pipeline Dashboard',
  description: 'Multi-Agent Pipeline Control Console',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen antialiased bg-slate-950">{children}</body>
    </html>
  )
}
