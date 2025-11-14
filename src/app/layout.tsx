import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Best Mobile Plans USA | Cell Phone Plans 2025',
  description: 'Compare and buy the best cell phone plans from Verizon, T-Mobile, AT&T, and more. Affordable unlimited data plans, prepaid options, and 5G coverage.',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwYTRlMjciLz4KPHBhdGggZD0iTTggMjAgTDggMTYgTDEyIDE2IEwxMiAyMCBaIiBmaWxsPSIjM2I4MmY2IiBvcGFjaXR5PSIwLjgiLz4KPHBhdGggZD0iTTE0IDE4IEwxNCAxNiBMMTggMTYgTDE4IDE4IFoiIGZpbGw9IiM2MzY2ZjEiIG9wYWNpdHk9IjAuOSIvPgo8cGF0aCBkPSJNMjAgMTcgTDIwIDE2IEwyNCAxNiBMMjQgMTcgWiIgZmlsbD0iIzhiNWNmNiIgb3BhY2l0eT0iMSIvPgo8cmVjdCB4PSI5IiB5PSIyMiIgd2lkdGg9IjIiIGhlaWdodD0iMyIgZmlsbD0iIzYwYTVmYSIgcng9IjAuNSIvPgo8cmVjdCB4PSIxMyIgeT0iMjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjUiIGZpbGw9IiM4MThjZjgiIHJ4PSIwLjUiLz4KPHJlY3QgeD0iMTciIHk9IjE4IiB3aWR0aD0iMiIgaGVpZ2h0PSI3IiBmaWxsPSIjYTc4YmZhIiByeD0iMC41Ii8+CjxyZWN0IHg9IjIxIiB5PSIxNiIgd2lkdGg9IjIiIGhlaWdodD0iOSIgZmlsbD0iI2M0YjVmZCIgcng9IjAuNSIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjEzIiByPSIxLjUiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzBhNGUyNyIvPgo8cGF0aCBkPSJNOCAyMCBMOCAxNiBMMTIgMTYgTDEyIDIwIFoiIGZpbGw9IiMzYjgyZjYiIG9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTQgMTggTDE0IDE2IEwxOCAxNiBMMTggMTggWiIgZmlsbD0iIzYzNjZmMSIgb3BhY2l0eT0iMC45Ii8+CjxwYXRoIGQ9Ik0yMCAxNyBMMjAgMTYgTDI0IDE2IEwyNCAxNyBaIiBmaWxsPSIjOGI1Y2Y2IiBvcGFjaXR5PSIxIi8+CjxyZWN0IHg9IjkiIHk9IjIyIiB3aWR0aD0iMiIgaGVpZ2h0PSIzIiBmaWxsPSIjNjBhNWZhIiByeD0iMC41Ii8+CjxyZWN0IHg9IjEzIiB5PSIyMCIgd2lkdGg9IjIiIGhlaWdodD0iNSIgZmlsbD0iIzgxOGNmOCIgcng9IjAuNSIvPgo8cmVjdCB4PSIxNyIgeT0iMTgiIHdpZHRoPSIyIiBoZWlnaHQ9IjciIGZpbGw9IiNhNzhiZmEiIHJ4PSIwLjUiLz4KPHJlY3QgeD0iMjEiIHk9IjE2IiB3aWR0aD0iMiIgaGVpZ2h0PSI5IiBmaWxsPSIjYzRiNWZkIiByeD0iMC41Ii8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTMiIHI9IjEuNSIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4=',
        type: 'image/svg+xml',
        sizes: '180x180',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0a0e27',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js" async></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
