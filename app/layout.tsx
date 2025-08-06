import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import DemoBanner from "../components/demo-banner";

export const metadata: Metadata = {
  title: "MediLedger Nexus - Decentralized Healthcare Records",
  description: "Your Records. Your Control. The future of healthcare data management with blockchain technology.",
  generator: "MediLedger Nexus",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <DemoBanner />
        {children}
      </body>
    </html>
  )
}
