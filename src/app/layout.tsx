import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SupportChatWidgetLoader } from "@/components/support/SupportChatWidgetLoader";
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
    default: "Drone Pilot Marketplace",
    template: "%s | Drone Pilot Marketplace",
  },
  description:
    "Connect licensed drone pilots with clients for aerial video, surveys, inspections, and professional drone services.",
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
