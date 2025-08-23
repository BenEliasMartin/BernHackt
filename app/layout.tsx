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
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@1,900,700,500,301,701,300,501,401,901,400&display=swap" rel="stylesheet" />
        <style>{`
html {
  font-family: 'Satoshi', ${GeistSans.style.fontFamily};
  --font-sans: 'Satoshi', ${openSans.style.fontFamily};
  --font-mono: ${GeistMono.variable};
  --font-heading: 'Satoshi', ${montserrat.style.fontFamily};
}
        `}</style>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
