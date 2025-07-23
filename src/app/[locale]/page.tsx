import Navbar from "@/components/Navbar";

import ReelsGrid from "@/components/ReelsGrid";

import HeroBottomBar from "@/components/HeroBottomBar";

import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedFreelancersSection } from "@/components/home/FeaturedFreelancersSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block min-h-screen bg-[#0A0A0F]">
        <Navbar />

        {/* Hero Section with Reels */}
        <div className="relative min-h-screen flex flex-col">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-10 space-y-16">
            <div
              className="w-full max-w-7xl mt-30"
              style={{ marginTop: "30px" }}
            >
              <ReelsGrid limit={4} showTitle={true} />
            </div>
          </div>

          {/* Bottom Bar */}
          <HeroBottomBar />

          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl animate-pulse delay-500" />
          </div>
        </div>

        {/* Other Sections */}
        <CategoriesSection locale={locale} />
        <FeaturedFreelancersSection locale={locale} />
        <TestimonialsSection locale={locale} />
      </div>

      {/* Mobile Version */}
      <div className="md:hidden min-h-screen bg-[#0A0A0F]">
        <Navbar />

        {/* Mobile Reels Grid */}
        <div className="px-4 pt-24 pb-6">
          <ReelsGrid limit={8} showTitle={true} />
        </div>

        {/* Other Mobile Sections */}
        <CategoriesSection locale={locale} />
        <FeaturedFreelancersSection locale={locale} />
        <TestimonialsSection locale={locale} />
      </div>
    </>
  );
}
