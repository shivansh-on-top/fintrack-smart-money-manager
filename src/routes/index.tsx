// Landing page — hero, features, testimonials, CTA, footer
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp, PieChart, Target, Layers,
  ShieldCheck, ArrowRight, Star, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

const FEATURES = [
  { icon: TrendingUp, title: "Track Expenses", desc: "Log income & expenses in seconds with smart categorization." },
  { icon: PieChart, title: "Beautiful Charts", desc: "Visualize your spending patterns with stunning, interactive charts." },
  { icon: Target, title: "Budget Goals", desc: "Set monthly budgets and stay on track with visual progress bars." },
  { icon: Layers, title: "Multi-Category", desc: "Organize across 9+ categories from groceries to investments." },
  { icon: ShieldCheck, title: "Secure Cloud Sync", desc: "Bank-grade encryption keeps your data safe across all devices." },
];

const TESTIMONIALS = [
  { name: "Aarav Mehta", role: "Freelance Designer", quote: "FinTrack changed how I manage money. It spotted spending leaks I never noticed.", rating: 5 },
  { name: "Priya Sharma", role: "Software Engineer", quote: "The cleanest finance app I've used. I finally understand where every rupee goes.", rating: 5 },
  { name: "Rohan Kapoor", role: "Small Business Owner", quote: "Budget tracking that doesn't feel like a chore. The charts are gorgeous.", rating: 5 },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="absolute top-0 inset-x-0 z-20">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="h-9 w-9 rounded-xl bg-gradient-emerald flex items-center justify-center shadow-glow">
              <Wallet className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinTrack</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-white/200 hover:bg-green/10 hover:text-black">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero-bg pt-32 pb-32">
        <div className="absolute inset-0 gradient-mesh-bg opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-2/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white max-w-4xl mx-auto leading-[1.05] animate-slide-up">
            Master Your Money,{" "}
            <span className="gradient-text">Shape Your Future</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-white/70 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            FinTrack helps you track every rupee, set smart budgets, and turn your spending data into wealth-building decisions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/signup">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
  size="xl"
  className="w-full sm:w-auto bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
>
                Login
              </Button>
            </Link>
          </div>

          {/* Floating stats card */}
          <div className="mt-20 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="glass-dark rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-white/10">
              {[
                { v: "₹5L", l: "Tracked monthly" },
                { v: "5+", l: "Categories" },
                { v: "Real-time", l: " Analytics" },
                { v: "100%", l: "Secure" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text whitespace-nowrap">
  {s.v}
</div>
                  <div className="mt-1 text-sm text-white/60">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything you need, <span className="gradient-text">nothing you don't</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Six powerful features designed to make personal finance feel effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group glass rounded-2xl p-8 hover-lift shadow-elegant animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-emerald flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-secondary/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Loved by people like you</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="bg-card rounded-2xl p-8 shadow-elegant hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden gradient-hero-bg rounded-3xl p-12 md:p-20 text-center shadow-elevated">
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready to take <span className="gradient-text">control</span>?
              </h2>
              <p className="mt-4 text-white/70 text-lg max-w-xl mx-auto">
                Join thousands of users building better financial habits with FinTrack.
              </p>
              <Link to="/signup" className="inline-block mt-8">
                <Button variant="hero" size="xl">
                  Start Free Today <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-emerald flex items-center justify-center">
              <Wallet className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-bold">FinTrack</span>
            <span className="text-sm text-muted-foreground ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
