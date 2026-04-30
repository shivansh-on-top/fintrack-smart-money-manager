// Budgets — set/edit per category for the current month, show progress vs spent
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXPENSE_CATEGORIES, currentMonth, formatINR } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/budgets")({
  component: BudgetsPage,
});

interface Budget { id: string; category: string; amount: number; month: string; }

function BudgetsPage() {
  const { user } = useAuth();
  const { data: txns } = useTransactions();
  const month = currentMonth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month);
      if (data) {
        setBudgets(data as Budget[]);
        const d: Record<string, string> = {};
        (data as Budget[]).forEach((b) => { d[b.category] = String(b.amount); });
        setDrafts(d);
      }
      setLoading(false);
    })();
  }, [user, month]);

  const spentByCat = useMemo(() => {
    const m = new Map<string, number>();
    txns
      .filter((t) => t.type === "expense" && t.date.startsWith(month))
      .forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + Number(t.amount)));
    return m;
  }, [txns, month]);

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);
    const totalSpent = Array.from(spentByCat.values()).reduce((s, v) => s + v, 0);
    return { totalBudget, totalSpent };
  }, [budgets, spentByCat]);

  const saveBudget = async (category: string) => {
    if (!user) return;
    const amt = parseFloat(drafts[category] || "0");
    if (Number.isNaN(amt) || amt < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSavingKey(category);
    const { data, error } = await supabase
      .from("budgets")
      .upsert(
        { user_id: user.id, category, amount: amt, month },
        { onConflict: "user_id,category,month" },
      )
      .select()
      .single();
    setSavingKey(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBudgets((prev) => {
      const others = prev.filter((b) => b.category !== category);
      return [...others, data as Budget];
    });
    toast.success(`${category} budget updated`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Budgets</h1>
        <p className="text-muted-foreground mt-1">
          Set monthly limits for {new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}.
        </p>
      </div>

      {/* Totals */}
      <div className="glass rounded-2xl p-6 shadow-elegant">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-accent" /> Total this month</h3>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Spent / Budget</div>
            <div className="font-semibold tabular-nums">
              {formatINR(totals.totalSpent)} <span className="text-muted-foreground">/ {formatINR(totals.totalBudget)}</span>
            </div>
          </div>
        </div>
        <ProgressBar spent={totals.totalSpent} budget={totals.totalBudget} />
      </div>

      {/* Per-category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-secondary/60 animate-pulse" />
        )) : EXPENSE_CATEGORIES.map((c) => {
          const spent = spentByCat.get(c.key) ?? 0;
          const draftValue = drafts[c.key] ?? "";
          const budgetAmount = parseFloat(draftValue) || 0;
          return (
            <div key={c.key} className="glass rounded-2xl p-5 shadow-elegant hover-lift">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl bg-secondary flex items-center justify-center", c.color)}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{c.key}</div>
                    <div className="text-xs text-muted-foreground">Spent {formatINR(spent)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <Input
                    type="number" min="0" step="100" placeholder="0"
                    className="h-9 w-28 text-right tabular-nums"
                    value={draftValue}
                    onChange={(e) => setDrafts({ ...drafts, [c.key]: e.target.value })}
                  />
                  <Button size="sm" variant="hero" onClick={() => saveBudget(c.key)} disabled={savingKey === c.key}>
                    {savingKey === c.key ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar spent={spent} budget={budgetAmount} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const color = budget === 0
    ? "bg-muted"
    : pct < 50 ? "bg-gradient-emerald"
    : pct < 80 ? "bg-warning"
    : "bg-destructive";
  return (
    <div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
        <span>{pct}% used</span>
        {budget > 0 && <span>{formatINR(Math.max(0, budget - spent))} left</span>}
      </div>
    </div>
  );
}
