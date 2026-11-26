import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n/I18nProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "WELFARE AI | Animal Welfare Intelligence",
    template: "%s | WELFARE AI"
  },
  description: "Integrated Animal Welfare Intelligence Platform",
  applicationName: "WELFARE AI",
  keywords: ["animal welfare", "drone", "AI", "monitoring", "farm"],
  openGraph: {
    title: "WELFARE AI",
    description: "Integrated Animal Welfare Intelligence Platform",
    type: "website",
    locale: "en_NZ"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
