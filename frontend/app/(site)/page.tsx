import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BestSellers } from "@/components/home/BestSellers";

// Future sections ↓ (we'll uncomment as they are implemented)
import { NewArrivals } from "@/components/home/NewArrivals";
import { AboutSection } from "@/components/home/AboutSection";
import { QualityPromise } from "@/components/home/QualityPromise";
import { Testimonials } from "@/components/home/Testimonials";
// import { StyleInspiration } from "@/components/home/StyleInspiration";
// import { GiftGuide } from "@/components/home/GiftGuide";
//  import { BlogPreview } from "@/components/home/BlogPreview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <BestSellers />
      <AboutSection />
      <NewArrivals />
      <QualityPromise />
      <Testimonials />

      {/* 🌿 Lifestyle inspiration / Lookbook */}
      {/*
      <StyleInspiration />
      */}

      {/* 🎁 Gift guide or collections */}
      {/*
      <GiftGuide />
      */}

      {/* 📰 Blog or Journal preview */}
      {/*
      <BlogPreview />
      */}
    </>
  );
}
