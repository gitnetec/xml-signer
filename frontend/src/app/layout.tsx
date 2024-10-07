import "./globals.css";
import { Providers } from "./providers";
import { Sora } from 'next/font/google'
import { Toaster } from 'react-hot-toast';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sora.variable}>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
