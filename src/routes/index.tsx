import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Briefcase, IndianRupee, Check, Lightbulb, BarChart3, Users, Star, GraduationCap, Laptop, PlayCircle, Heart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationForm } from "@/components/ApplicationForm";
import office from "@/assets/office.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "We're Hiring: Social Media Manager | Artist Vipin Bala" },
      { name: "description", content: "Artist Vipin Bala is hiring a Social Media Manager in Valanchery, Kerala. Freshers can apply, ₹8,000–₹10,000/month." },
      { property: "og:title", content: "We're Hiring: Social Media Manager | Artist Vipin Bala" },
      { property: "og:description", content: "Join our creative team in Valanchery, Kerala. Freshers can apply." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Lightbulb, t: "Creative Work Environment", d: "Work with art, learning and meaningful content" },
  { icon: BarChart3, t: "Learn & Grow", d: "Gain real-world experience in social media and digital marketing" },
  { icon: Users, t: "Supportive Team", d: "Friendly and positive work culture" },
  { icon: Star, t: "Be Part of a Bigger Mission", d: "Help thousands of people learn and grow with art" },
];
const roles = [
  "Manage Instagram, Facebook & YouTube content (posts, reels, stories)",
  "Basic video editing (mobile or computer)",
  "Design simple creatives using Canva (or similar tools)",
  "Plan and schedule content",
  "Engage with audience (reply to comments and messages)",
  "Basic system work and reporting",
];
const who = [
  { icon: GraduationCap, t: "Freshers are welcome" },
  { icon: Laptop, t: "Basic computer knowledge" },
  { icon: PlayCircle, t: "Basic video editing knowledge" },
  { icon: Users, t: "Interest in social media and creative work" },
  { icon: Heart, t: "Responsible, positive and willing to learn" },
];

function Brand() {
  return (
    <div>
      <p className="font-display text-lg font-bold uppercase tracking-[0.15em]">Artist Vipin Bala</p>
      <p className="text-xs tracking-[0.3em] opacity-70">Learn · Create · Grow</p>
    </div>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="relative h-56 sm:h-72 md:hidden">
          <img src={office.url} alt="Artist Vipin Bala office" className="h-full w-full object-cover object-[70%_center]" />
          <div className="absolute inset-0 bg-hero-fade-mobile" />
        </div>
        <img src={office.url} alt="" aria-hidden="true" className="absolute inset-0 hidden h-full w-full object-cover object-right md:block" />
        <div className="absolute inset-0 hidden bg-hero-fade md:block" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-2 md:pb-32 md:pt-10">
          <div className="hidden md:block"><Brand /></div>
          <div className="mt-6 max-w-xl md:mt-12">
            <span className="inline-block -rotate-3 rounded-full bg-accent px-4 py-1 text-xl font-semibold italic text-walnut">Join Our Team</span>
            <h1 className="mt-3 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">We’re Hiring</h1>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary md:text-5xl">Social Media Manager</p>
            <p className="mt-4 text-lg leading-relaxed">Be part of a creative team that shares art, learning and inspiration with thousands of people.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { i: Briefcase, t: "Freshers Can Apply" },
                { i: IndianRupee, t: "₹8,000 – ₹10,000 / month" },
                { i: MapPin, t: "Valanchery, Kerala" },
              ].map(({ i: I, t }) => (
                <span key={t} className="inline-flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm font-bold shadow-card">
                  <I className="h-5 w-5 text-primary" /> {t}
                </span>
              ))}
            </div>
            <Button variant="cta" size="lg" className="mt-7 h-12 px-8" asChild>
              <a href="#apply">Apply Now <ChevronRight /></a>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-6xl px-4">
        <div className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: I, t, d }) => (
            <div key={t} className="flex gap-3">
              <I className="h-8 w-8 shrink-0 text-primary" />
              <div>
                <p className="font-bold">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="apply" className="mx-auto grid max-w-6xl scroll-mt-4 gap-6 px-4 py-10 md:py-14 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="inline-block -rotate-2 rounded-lg bg-accent px-3 py-1 text-2xl font-bold italic">Job Role</h2>
            <ul className="mt-5 space-y-3">
              {roles.map((r) => (
                <li key={r} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> {r}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="inline-block -rotate-2 rounded-lg bg-accent px-3 py-1 text-2xl font-bold italic">Who Can Apply?</h2>
            <ul className="mt-5 space-y-3">
              {who.map(({ icon: I, t }) => (
                <li key={t} className="flex gap-3"><I className="h-5 w-5 shrink-0 text-primary" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
        <ApplicationForm />
      </section>

      <footer className="bg-walnut text-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8">
          <Brand />
          <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> Valanchery, Kerala</p>
        </div>
      </footer>
    </main>
  );
}
