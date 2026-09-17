import type { Metadata } from "next";
import "./globals.css";

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:1313";

export const metadata: Metadata = {
  title: "AddMin",
  description: "An office administration operating system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
            <a href={MARKETING_URL} className="text-xl font-bold text-gray-900">
              AddMin
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
