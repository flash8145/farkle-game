import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/contexts/GameContext";
import { ToastProvider } from "@/components/ui/toast";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { validateEnv, logEnvConfig } from "@/lib/env";

// Validate environment variables on startup
if (typeof window === 'undefined') {
  validateEnv();
  logEnvConfig();
}

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Farkle - The Ultimate Dice Game",
  description: "Play Farkle online with friends or against AI. Roll dice, score points, and be the first to reach 10,000!",
  keywords: ["farkle", "dice game", "multiplayer", "online game", "board game"],
  authors: [{ name: "Farkle Game Team" }],
  openGraph: {
    title: "Farkle - The Ultimate Dice Game",
    description: "Roll dice, score points, and compete with friends!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Background Gradient */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-amber-500/10 animate-pulse" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          
          {/* Radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        {/* Main Content with Providers */}
        <ToastProvider>
          <GameProvider>
            <div className="relative z-0">
              {/* Page Transition Wrapper */}
              <div className="min-h-screen">
                {children}
              </div>
            </div>
          </GameProvider>
        </ToastProvider>

        {/* Global Loading Indicator (Optional) */}
        <div id="global-loading" className="hidden fixed top-4 right-4 z-50">
          <div className="bg-purple-600/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      </body>
    </html>
  );
}