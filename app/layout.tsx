import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Facebook Wall 2008',
  description: 'A nostalgic Facebook-style wall from 2008',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-facebook-gray min-h-screen">
        {children}
      </body>
    </html>
  )
} 