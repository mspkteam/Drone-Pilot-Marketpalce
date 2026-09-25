import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ras-auth-shell">
      <header className="ras-auth-header">
        <Logo />
      </header>
      <main className="ras-auth-main">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="ras-auth-footer">
        <Link href="/">← Back to home</Link>
      </footer>
    </div>
  );
}
