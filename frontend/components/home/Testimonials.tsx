"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Aarushi Mehta — Mumbai",
    text: "Absolutely in love with my engagement ring! The craftsmanship and shine are unmatched.",
  },
  {
    name: "Rohit Kapoor — Bangalore",
    text: "Their team helped me pick the perfect bracelet. Elegant packaging and timely delivery!",
  },
  {
    name: "Neha Sharma — Delhi",
    text: "Finally a jewellery brand I can trust. Quality is top‑notch and service feels personal.",
  },
  {
    name: "Kabir Rao — Hyderabad",
    text: "The ring I ordered was exactly as shown. Excellent detailing and finish.",
  },
  {
    name: "Sanya Verma — Jaipur",
    text: "Aurora's necklace added such grace to my wedding outfit — couldn't be happier!",
  },
  {
    name: "Arjun Nair — Chennai",
    text: "Great selection and reliable service. I appreciate their transparency.",
  },
  {
    name: "Pooja Desai — Pune",
    text: "From packaging to polish, everything screams perfection. My go‑to brand now!",
  },
  {
    name: "Vikram Joshi — Ahmedabad",
    text: "Loved the custom‑engraving option. It made the gift truly special!",
  },
];

export function Testimonials() {
  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);

  // Dynamically choose how many cards to show per screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisible(1); // mobile
      else if (window.innerWidth < 1024) setVisible(2); // tablet
      else setVisible(3); // desktop
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const total = testimonials.length;
  const maxIndex = total - visible;

  const next = () => setIndex((i) => (i >= maxIndex ? maxIndex : i + 1));
  const prev = () => setIndex((i) => (i <= 0 ? 0 : i - 1));

  return (
    <section className="w-full bg-[#faf9f7] py-24 overflow-hidden mt-8">
      <div className="mx-auto max-w-[95%] px-4 md:px-8 text-center">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-light text-neutral-800 uppercase tracking-wide">
        What Our Customers Say
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
        Honest voices from people who wear Aurora Jewels with pride.
        </p>

        <div className="relative mt-16">
          {/* ← Prev (desktop/tablet only) */}
          {index > 0 && (
            <button
              onClick={prev}
              className="
                hidden sm:flex group absolute 
                left-3 md:-left-12
                top-1/2 -translate-y-1/2 
                items-center justify-center 
                rounded-full bg-white/70 backdrop-blur-md
                p-2 md:p-3 shadow-lg ring-1 ring-[#bfa75a]/30
                transition-all duration-300 hover:bg-[#bfa75a]
                z-30
              "
            >
              <ChevronLeft className="h-5 md:h-6 w-5 md:w-6 text-[#bfa75a] transition-colors duration-300 group-hover:text-white" />
            </button>
          )}

          {/* → Next (desktop/tablet only) */}
          {index < maxIndex && (
            <button
              onClick={next}
              className="
                hidden sm:flex group absolute 
                right-3 md:-right-12
                top-1/2 -translate-y-1/2 
                items-center justify-center 
                rounded-full bg-white/70 backdrop-blur-md
                p-2 md:p-3 shadow-lg ring-1 ring-[#bfa75a]/30
                transition-all duration-300 hover:bg-[#bfa75a]
                z-30
              "
            >
              <ChevronRight className="h-5 md:h-6 w-5 md:w-6 text-[#bfa75a] transition-colors duration-300 group-hover:text-white" />
            </button>
          )}

          {/* Slider */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${index * (100 / visible)}%)`,
              }}
            >
              {testimonials.map(({ name, text }, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 px-2 sm:px-3"
                  style={{
                    width: `${100 / visible}%`,
                  }}
                >
                  <div
                    className="
                      relative h-full rounded-2xl border border-[#e4e2dd] 
                      bg-[#fffdf9] p-6 sm:p-8 md:p-10 
                      text-left shadow-[0_4px_12px_rgba(0,0,0,0.04)]
                      transition-all duration-300 
                      hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]
                      font-[Poppins,ui-sans-serif]
                    "
                  >
                    {/* Quote mark */}
                    <span className="absolute top-6 left-6 text-6xl text-[#bfa75a]/60 font-serif select-none">
                      “
                    </span>
                    {/* Testimonial text */}
                    <p className="relative z-10 mt-8 text-neutral-800 leading-relaxed text-base md:text-lg font-light">
                      {text}
                    </p>
                    <h3 className="mt-6 text-sm font-medium text-neutral-900 tracking-wide">
                      {name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom-centered arrows (mobile only) */}
          <div className="flex sm:hidden justify-center gap-6 mt-8">
            <button
              onClick={prev}
              disabled={index === 0}
              className="
                group flex items-center justify-center 
                rounded-full bg-white/80 
                p-2 ring-1 ring-[#bfa75a]/30 hover:bg-[#bfa75a]
                transition duration-300 shadow
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              <ChevronLeft className="h-5 w-5 text-[#bfa75a] transition-colors group-hover:text-white" />
            </button>
            <button
              onClick={next}
              disabled={index >= maxIndex}
              className="
                group flex items-center justify-center 
                rounded-full bg-white/80 
                p-2 ring-1 ring-[#bfa75a]/30 hover:bg-[#bfa75a]
                transition duration-300 shadow
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              <ChevronRight className="h-5 w-5 text-[#bfa75a] transition-colors group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}