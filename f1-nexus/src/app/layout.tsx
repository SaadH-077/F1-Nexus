import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "F1 Nexus | Formula 1 Analytics Platform",
  description: "The ultimate Formula 1 data analytics platform. Live standings, race strategy simulation, telemetry visualization, predictive analytics, and AI-powered race insights.",
  keywords: ["Formula 1", "F1", "F1 analytics", "race strategy", "telemetry", "F1 standings", "2026 F1 season"],
  authors: [{ name: "Saad Haroon" }],
  openGraph: {
    title: "F1 Nexus | Formula 1 Analytics Platform",
    description: "Live F1 standings, race strategy simulation, telemetry, and predictive analytics for the 2026 season.",
    type: "website",
    locale: "en_GB",
    siteName: "F1 Nexus",
  },
  twitter: {
    card: "summary_large_image",
    title: "F1 Nexus | Formula 1 Analytics Platform",
    description: "Live F1 standings, race strategy simulation, telemetry, and predictive analytics for the 2026 season.",
  },
  manifest: "/manifest.json",
  themeColor: "#e00700",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "F1 Nexus",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} font-display antialiased`}>
        <SplashScreen />
        <Navbar />
        <main className="pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
