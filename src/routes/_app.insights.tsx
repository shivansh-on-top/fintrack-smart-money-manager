// AI Insights page — calls /api/insights with transaction summary
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { formatINR } from "@/lib/categories";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/insights")({
  component: InsightsPage,
});

interface Insight {
  title: string;
  detail: string;
  tone: "positive" | "warning" | "tip";
}

function buildSummary(transactions: ReturnType<typeof useTransactions>["data"]) {
  const income = transactions.filter((t) => t.type === "income");
  const expense = transactions.filter((t) => t.type === "expense");
  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expense.reduce((s, t) => s + Number(t.amount), 0);

  const byCategory = new Map<string, number>();
  expense.forEach((t) => byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Number(t.amount)));

  const topCategories = Array.from(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ${formatINR(amt)}`)
    .join(", ");

  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const recent = transactions.filter((t) => new Date(t.date) >= last30);
  const recentExpense = recent.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const recentIncome = recent.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);

  return [
    `Total income (all time): ${formatINR(totalIncome)}`,
    `Total expenses (all time): ${formatINR(totalExpense)}`,
    `Net savings: ${formatINR(totalIncome - totalExpense)}`,
    `Last 30 days — income: ${formatINR(recentIncome)}, expenses: ${formatINR(recentExpense)}`,
    `Top spending categories: ${topCategories || "none yet"}`,
    `Total transactions: ${transactions.length}`,
  ].join("\n");
}

function InsightsPage() {
  const { data, loading: txLoading } = useTransactions();
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (data.length === 0) {
      setError("Add some transactions first so AI can analyze your spending.");
      return;
    }
    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const summary = buildSummary(data);
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });

      if (res.status === 404) {
        setError("AI insights require a LOVABLE_API_KEY environment variable set in Vercel. See the README for setup instructions.");
        return;
      }

      const json = await res.json() as { insights?: Insight[]; error?: string };
      if (json.error) {
        setError(json.error);
      } else if (json.insights) {
        setInsights(json.insights);
      }
    } catch {
      setError("Failed to reach the AI service. Check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const toneIcon = (tone: Insight["tone"]) => {
    if (tone === "positive") return <TrendingUp className="h-5 w-5 text-success" />;
    if (tone === "warning") return <AlertTriangle className="h-5 w-5 text-warning" />;
    return <Lightbulb className="h-5 w-5 text-accent" />;
  };

  const toneBorder = (tone: Insight["tone"]) => {
    if (tone === "positive") return "border-l-4 border-success";
    if (tone === "warning") return "border-l-4 border-warning";
    return "border-l-4 border-accent";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            Personalized financial advice powered by Gemini AI.
          </p>
        </div>
        <Button
          variant="hero"
          onClick={generate}
          disabled={loading || txLoading}
          className="gap-2"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Analyzing…" : insights ? "Refresh" : "Generate Insights"}
        </Button>
      </div>

      {!insights && !error && !loading && (
        <div className="glass rounded-2xl p-12 text-center shadow-elegant animate-fade-in">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-emerald flex items-center justify-center shadow-glow mb-4">
            <Sparkles className="h-8 w-8 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Ready to analyze your finances</h2>
          <p className="mt-2 text-muted-foreground text-sm max-w-sm mx-auto">
            Click "Generate Insights" and our AI will review your spending patterns and provide actionable advice.
          </p>
          {data.length === 0 && !txLoading && (
            <p className="mt-4 text-xs text-warning">
              Add a few transactions first so AI has data to work with.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="glass rounded-2xl p-6 shadow-elegant border border-destructive/30 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="glass rounded-2xl p-12 text-center shadow-elegant animate-fade-in">
          <RefreshCw className="h-10 w-10 text-accent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your financial patterns…</p>
        </div>
      )}

      {insights && (
        <div className="space-y-4 animate-fade-in">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`glass rounded-2xl p-6 shadow-elegant ${toneBorder(insight.tone)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{toneIcon(insight.tone)}</div>
                <div>
                  <h3 className="font-semibold">{insight.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.detail}</p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-center text-xs text-muted-foreground pt-2">
            AI insights are based on your transaction history and are for informational purposes only.
          </p>
        </div>
      )}
    </div>
  );
}
