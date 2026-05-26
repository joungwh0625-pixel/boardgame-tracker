import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ScrollToTop from "@/components/ScrollToTop";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "Board Game Tracker",
  description: "Track your board game matches and win rates",
  manifest: "/manifest.json",
  openGraph: {
    title: "보동 게임트래커",
    description: "보드게임 전적 및 승률을 한눈에 기록하고 확인하세요!",
    url: "https://boardgame-tracker-coral.vercel.app",
    siteName: "보동 게임트래커",
    images: [
      {
        url: "https://boardgame-tracker-coral.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "보동 게임트래커",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "보동 게임트래커",
    description: "보드게임 전적 및 승률을 한눈에 기록하고 확인하세요!",
    images: ["https://boardgame-tracker-coral.vercel.app/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <NextTopLoader color="#fbbf24" showSpinner={false} height={4} shadow="0 0 10px #fbbf24,0 0 5px #fbbf24" />
        <ServiceWorkerRegister />
        <div className="app-container">
          <div className="content-area">
            {children}
          </div>
          <ScrollToTop />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
