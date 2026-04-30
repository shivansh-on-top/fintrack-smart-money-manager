// Reusable stat card with animated counter
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  iconClass?: string;
  trend?: string;
  trendPositive?: boolean;
  delay?: number;
}

function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (startTime.current === null) startTime.current = t;
      const progress = Math.min((t - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return val;
}

export function StatCard({
  label, value, prefix = "", suffix = "", icon: Icon,
  iconClass = "bg-gradient-emerald", trend, trendPositive, delay = 0,
}: StatCardProps) {
  const animated = useCountUp(value);
  const formatted = prefix === "₹"
    ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(animated)
    : animated.toString();

  return (
    <div
      className="glass rounded-2xl p-6 shadow-elegant hover-lift animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shadow-glow", iconClass)}>
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendPositive ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-5 text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">
        {prefix}{formatted}{suffix}
      </div>
    </div>
  );
}
