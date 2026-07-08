import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Join the Waitlist | Remote Air Service",
  description:
    "Priority access for enterprise clients and pilots — Remote Air Service marketplace pre-launch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
