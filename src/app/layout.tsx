import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "বাজার অ্যাপ - আপনার এলাকার বাজার",
  description: "কাছাকাছি দোকান খুঁজুন, পণ্যের দাম জানুন এবং সরাসরি যোগাযোগ করুন।",
  manifest: "/manifest.json",
};

// ✅ মোবাইলের স্ট্যাটাস বারের কালার
export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
