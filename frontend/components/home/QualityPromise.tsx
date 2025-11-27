import {
  ShieldCheck,
  Truck,
  RefreshCcw,
  Gem,
  Clock,
  Lock,
} from "lucide-react";

const promises = [
  { icon: Gem, title: "Certified Gold & Diamonds", text: "All pieces are hall‑marked and ethically sourced." },
  { icon: Truck, title: "Free & Secure Delivery", text: "Complimentary insured shipping on every order." },
  { icon: RefreshCcw, title: "Easy Returns & Repairs", text: "Hassle‑free 15‑day return and lifetime service." },
  { icon: ShieldCheck, title: "Trusted Craftsmanship", text: "Expert artisans guarantee supreme quality finish." },
  { icon: Clock, title: "Timeless Warranty", text: "Lifetime maintenance support for every piece." },
  { icon: Lock, title: "Secure Payments", text: "Encrypted transactions for your peace of mind." },
];

export function QualityPromise() {
  return (
    <section className="w-full bg-neutral-50 border-t border-b border-neutral-200 py-14">
      <div className="mx-auto w-[97%] px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {promises.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="
                group flex cursor-pointer flex-col items-center justify-between rounded-lg 
                border border-transparent bg-transparent px-5 py-6 text-center 
                transition-all duration-300 hover:-translate-y-1 
                hover:border-neutral-300 hover:bg-white hover:shadow-lg
              "
            >
              <div className="rounded-full bg-white p-3 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-neutral-800 group-hover:text-amber-700">
                {title}
              </h3>
              <p className="mt-1 text-xs text-neutral-600 leading-snug">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}