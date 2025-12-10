import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Paper2Slides - From Paper to Presentation',
  description:
    'Transform research papers and documents into professional slides and posters in minutes',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
