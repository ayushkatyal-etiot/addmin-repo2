import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
