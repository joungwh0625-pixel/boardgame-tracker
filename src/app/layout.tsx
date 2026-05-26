import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Board Game Tracker",
  description: "Track your board game matches and win rates",
  manifest: "/manifest.json",
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
