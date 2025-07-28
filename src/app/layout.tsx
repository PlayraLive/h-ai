import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Freelance Platform",
  description: "Connect with AI specialists for design, code, video, and games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
