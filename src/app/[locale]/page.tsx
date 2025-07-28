import HeroSection from '@/components/HeroSection';
import MobileHeroSection from '@/components/MobileHeroSection';
import SpecialistCarousel from '@/components/SpecialistCarousel';
import SolutionsCarousel from '@/components/SolutionsCarousel';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section - Desktop */}
        <div className="hidden md:block">
          <HeroSection />
        </div>
        
        {/* Hero Section - Mobile */}
        <div className="block md:hidden">
          <MobileHeroSection />
        </div>

        {/* AI Specialists Carousel */}
        <SpecialistCarousel />

        {/* AI Solutions Carousel */}
        <SolutionsCarousel />
      </main>
      <Footer locale={locale} />
    </>
  );
}
