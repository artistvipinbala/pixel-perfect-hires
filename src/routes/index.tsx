import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationForm } from "@/components/ApplicationForm";
import office from "@/assets/office.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "We're Hiring: Office Staff | Artist Vipin Bala" },
      { name: "description", content: "Artist Vipin Bala is hiring Office Staff in Valanchery, Kerala. Submit your details and CV to apply." },
      { property: "og:title", content: "We're Hiring: Office Staff | Artist Vipin Bala" },
      { property: "og:description", content: "Join our creative team in Valanchery, Kerala. Submit your details and CV to apply." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden">
        {/* Mobile: image on top, text stacked below */}
        <div className="relative h-56 sm:h-72 md:hidden">
          <img src={office.url} alt="Artist Vipin Bala office with framed portrait paintings" className="h-full w-full object-cover object-[70%_center]" />
          <div className="absolute inset-0 bg-hero-fade-mobile" />
        </div>
        {/* Desktop: image as background */}
        <img
          src={office.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full object-cover object-right md:block"
        />
        <div className="absolute inset-0 hidden bg-hero-fade md:block" />

        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-2 md:py-28 lg:py-36">
          <div className="max-w-lg">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-walnut">Artist Vipin Bala</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">We’re Hiring</h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-semibold shadow-card">
                <Briefcase className="h-4 w-4 text-primary" /> Office Staff
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-semibold shadow-card">
                <MapPin className="h-4 w-4 text-primary" /> Valanchery, Kerala
              </span>
            </div>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Join our creative team. Submit your details and CV to apply.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Button variant="cta" size="lg" className="h-12 px-8" asChild>
                <a href="#apply">Apply Now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="scroll-mt-4 px-4 py-12 md:py-20">
        <ApplicationForm />
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Artist Vipin Bala · Valanchery, Kerala
      </footer>
    </main>
  );
}
