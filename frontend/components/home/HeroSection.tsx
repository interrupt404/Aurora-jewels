import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  const sectionBgColor = "bg-[#efece9]"; 
  
  // FIX: This variable should only be the text color, not border classes.
  // Assuming you still want the text to be DARK as in the final image, 
  // but if you want WHITE text (matching the string value) please use 'text-white'.
  // I will assume you want the dark text color to match the desired design (Image 1 style)
  // and fix the border classes.
  const correctedDarkTextColor = "text-gray-200"; 
  
  // FIX: This variable should be for the dark button text and border
  const correctedLightOutlineButton = "border-2 border-gray-300 text-gray-200"; 
  
  // The variables you provided had inconsistent color logic (darkTextColor used 'text-white'). 
  // I will use the corrected variables above for a look that matches the final design (Image 1 text color) 
  // while keeping your overlay (Image 2 overlay color).
  
  return (
    <section className={`relative w-full h-[50vh] min-h-[420px] max-h-[550px] ${sectionBgColor} overflow-hidden md:`}>
      
      {/* Background Image Container */}
      <div className={`absolute inset-0 ${sectionBgColor}`}>
        <Image
          src="https://vfobmlxlvipmdvgcwoqd.supabase.co/storage/v1/object/public/product-images/hero.png" 
          alt="Model wearing Aurora Jewels"
          fill
          priority
          sizes="100vw" 
          className="object-contain object-bottom z-[4] md:scale-[1.25]" 
        />

        {/* REVERTED: Overlay back to your previous dark gradient */}
        {/* NOTE: If you are using dark text with a dark overlay, the text will be hard to read. 
           The target design (Image 1) uses a LIGHT gradient for dark text. 
           I'll keep your dark gradient as requested, but be aware of the contrast issue. */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/25 via-black/20 to-black/25 pointer-events-none" />
      </div>

      {/* Text block: Positioned relative to the section, centered vertically, left-aligned horizontally */}
      <div className="relative z-10 mx-auto flex h-full py-8 max-w-7xl items-start px-6 md:px-10 bottom-15 md:items-center md:py-0">
        {/* FIX 1: Removed max-w-md to allow the text to expand to one line.
          FIX 2: Added md:ml-auto md:mr-[40%] to shift the text block closer to the image on desktop. 
          The margin-right pushes the text left, closer to the model.
        */}
        <div className="text-left z-10 md:mr-[30%]">
          {/* Using the corrected text color */}
          <h1 className={`text-3xl md:text-5xl font-light ${correctedDarkTextColor} uppercase whitespace-nowrap`}> 
            Timeless Elegance.
          </h1>
          {/* Using the corrected text color */}
          <p className={`text-xl mt-4 ${correctedDarkTextColor} md:text-lg uppercase whitespace-nowrap`}>
            Discover our new collection.
          </p>

          <Link
            href="/products"
            // Using the corrected button style
            className={`mt-8 inline-block border border-solid ${correctedLightOutlineButton} px-6 py-3 text-sm font-semibold transition-colors hover:bg-neutral-100/50 uppercase`}
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </section>
  );
}