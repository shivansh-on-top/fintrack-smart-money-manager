// Auth-only layout shell. Routes for login/signup share this branded background.
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  // Redirect already-authenticated users to dashboard
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand panel */}
      <div className="hidden md:flex md:w-1/2 gradient-hero-bg relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-chart-2/20 rounded-full blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2 text-white">
          <div className="h-9 w-9 rounded-xl bg-gradient-emerald flex items-center justify-center shadow-glow">
            <Wallet className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-bold">FinTrack</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Master your money, <span className="gradient-text">shape your future</span>.
          </h2>
          <p className="mt-4 text-white/70">
            Join thousands building better financial habits with FinTrack.
          </p>
        </div>

        <div className="relative z-10 text-white/50 text-sm">© {new Date().getFullYear()} FinTrack</div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
