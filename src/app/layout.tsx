import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LocalStorageInitializer from "@/components/LocalStorageInitializer"; // Import the new component
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMB Relay Centre - Waaz Centre Preference Survey",
  description: "Mumineen with Raza for Colombo Relay Centre can choose their preferred Waaz Centre from two available options.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocalStorageInitializer /> {/* Add the new component here */}
        {children}
        <Analytics/>
        <Toaster />
      </body>
    </html>
  );
}
