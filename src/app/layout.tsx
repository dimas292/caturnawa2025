// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/provider/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caturnawa 2025",
  description: "Caturnawa Website Registration and Tabulation for UNAS FEST 2025",
  keywords: ["Caturnawa 2025", "Registration", "Competitions", "UNAS", "UNAS FEST 2025"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Caturnawa 2025",
    description: "Caturnawa Website Registration and Tabulation for UNAS FEST 2025",
    url: "https://caturnawa.unas.ac.id",
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
            {children}
            <Toaster />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}