import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import { TradeProvider } from "../context/TradeContext"
import { ProfileProvider } from "@/context/ProfileContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The PipLab",
  description: "Advanced Trading Journal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProfileProvider>
            <SettingsProvider>
              <TradeProvider>
                <div className="flex min-h-screen bg-background text-foreground">
                  <Sidebar />
                  <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-6 py-6 transition-all duration-300">
                    {children}
                  </main>
                </div>
              </TradeProvider>
            </SettingsProvider>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}