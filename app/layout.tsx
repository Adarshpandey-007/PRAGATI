import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { LanguageProvider } from './context/LanguageContext';

const notoSans = Noto_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  title: 'Pragati - Smart School Attendance System',
  description: 'Transform rural education with intelligent attendance tracking. Empowering students, teachers, and administrators with real-time insights and analytics.',
  icons: {
    icon: '/pragati-logo.png',
    shortcut: '/pragati-logo.png',
    apple: '/pragati-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} font-sans antialiased`}>
        <LanguageProvider>
          {children}
          <div className="fixed bottom-4 right-4 z-[100] rounded-full border border-amber-300 bg-amber-100/95 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-amber-900 shadow-lg backdrop-blur-sm">
            MOCK TEST DATA
          </div>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
