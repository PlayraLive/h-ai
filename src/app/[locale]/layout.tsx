import type { Metadata } from "next";
import ClientProviders from '@/components/ClientProviders';
// Используем только Appwrite для аутентификации
import "../globals.css";

export const metadata: Metadata = {
  title: "AI Freelance Platform",
  description: "Connect with AI specialists for design, code, video, and games",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  );
}
