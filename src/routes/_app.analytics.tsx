// Analytics — multiple charts with date range filter
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { formatINR } from "@/lib/categories";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
});

type Range = "month" | "3m" | "year" | "all";

function AnalyticsPage() {
  const { data } = useTransactions();
  const [range, setRange] = useState<Range>("3m");

  const filtered = useMemo(() => {
    const now = new Date();
    let from: Date | null = null;
    if (range === "month") from = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (range === "3m") from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    else if (range === "year") from = new Date(now.getFullYear(), 0, 1);
    return data.filter((t) => !from || new Date(t.date) >= from);
  }, [data, range]);

  const expenseByCat = useMemo(() => {
    const m = new Map<string, number>();
    filtered.filter((t) => t.type === "expense")
      .forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + Number(t.amount)));
    return Array.from(m, ([name, value]) => ({ name, value }));
  }, [filtered]);

  const incomeByCat = useMemo(() => {
    const m = new Map<string, number>();
    filtered.filter((t) => t.type === "income")
      .forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + Number(t.amount)));
    return Array.from(m, ([name, value]) => ({ name, value }));
  }, [filtered]);

  const monthly12 = useMemo(() => {
    const months: { key: string; label: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: d.toLocaleDateString("en", { month: "short" }), income: 0, expense: 0 });
    }
    data.forEach((t) => {
      const m = months.find((x) => t.date.startsWith(x.key));
      if (!m) return;
      if (t.type === "income") m.income += Number(t.amount);
      else m.expense += Number(t.amount);
    });
    return months;
  }, [data]);

  const trend = useMemo(() => {
    const m = new Map<string, number>();
    filtered.filter((t) => t.type === "expense").forEach((t) => {
      const k = t.date.slice(0, 10);
      m.set(k, (m.get(k) ?? 0) + Number(t.amount));
    });
    return Array.from(m, ([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const PIE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"];
  const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Visualize your money flow.</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="h-10 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="year">This year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Income" value={totalIncome} accent="text-success" />
        <SummaryCard label="Total Expense" value={totalExpense} accent="text-destructive" />
        <SummaryCard label="Net" value={totalIncome - totalExpense} accent="gradient-text" />
      </div>

      {/* Pie + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Expense by Category" subtitle="Where your money goes">
          {expenseByCat.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenseByCat} dataKey="value" nameKey="name" outerRadius={110}>
                  {expenseByCat.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Income Sources" subtitle="Where your money comes from">
          {incomeByCat.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={incomeByCat} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={3}>
                  {incomeByCat.map((_, i) => <Cell key={i} fill={PIE[(i + 1) % PIE.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Bar */}
      <ChartCard title="Monthly Comparison" subtitle="Last 12 months">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthly12}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
            <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="var(--chart-6)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Trend line */}
      <ChartCard title="Daily Spending Trend" subtitle="Within selected range">
        {trend.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11}
                tickFormatter={(d) => new Date(d).toLocaleDateString("en", { day: "numeric", month: "short" })} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
              <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="glass rounded-2xl p-6 shadow-elegant">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-2 text-3xl font-bold tabular-nums ${accent}`}>{formatINR(value)}</div>
    </div>
  );
}
function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 shadow-elegant animate-fade-in">
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
function Empty() {
  return <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Not enough data yet</div>;
}
