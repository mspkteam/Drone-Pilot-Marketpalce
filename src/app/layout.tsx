import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SupportChatWidgetLoader } from "@/components/support/SupportChatWidgetLoader";
import { homeAssets } from "@/lib/marketing/home-assets";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Remote Air Service",
    template: "%s | Remote Air Service",
  },
  description:
    "Connect licensed drone pilots with clients for aerial video, surveys, inspections, and professional drone services.",
  icons: {
    icon: homeAssets.favicon,
    apple: homeAssets.favicon,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full`}>
      <body
        className="min-h-full flex flex-col antialiased"
        suppressHydrationWarning
      >
        <SessionProvider>
          {children}
          <SupportChatWidgetLoader />
        </SessionProvider>
      </body>
    </html>
  );
}
