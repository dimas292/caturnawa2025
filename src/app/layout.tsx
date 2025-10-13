// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/provider/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";
import { SystemStatusBanner } from "@/components/system-status-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tes.caturnawa.tams.my.id"),
  title: "Caturnawa 2025",
  description: "Caturnawa Website Registration and Tabulation for UNAS FEST 2025",
  keywords: ["Caturnawa 2025", "Registration", "Competitions", "UNAS", "UNAS FEST 2025"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Caturnawa 2025",
    description: "Caturnawa Website Registration and Tabulation for UNAS FEST 2025",
    url: "https://tes.caturnawa.tams.my.id",
    siteName: "Caturnawa 2025",
    images: [
      { url: "/favicon.ico" },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <div className="flex flex-col min-h-screen">
              <SystemStatusBanner />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}