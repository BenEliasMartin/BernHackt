import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "FinanceAI - Your Personal Finance Agent",
  description: "AI-powered personal finance management with dynamic insights and challenges",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Sans:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
html {
  font-family: 'Geist Sans', ${GeistSans.style.fontFamily}, sans-serif;
  --font-sans: 'Geist Sans', ${GeistSans.style.fontFamily}, sans-serif;
  --font-mono: ${GeistMono.variable};
  --font-heading: 'Geist Sans', ${GeistSans.style.fontFamily}, sans-serif;
}
        `}</style>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
