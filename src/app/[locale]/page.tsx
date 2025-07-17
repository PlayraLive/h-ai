import Navbar from '@/components/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection locale={locale} />
      <CategoriesSection locale={locale} />
      <TestimonialsSection locale={locale} />
    </div>
  );
}
