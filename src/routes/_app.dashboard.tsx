// Dashboard — animated stat cards, expense pie, income vs expense line, recent transactions
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Sparkles,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/StatCard";
import { TransactionRow } from "@/components/TransactionRow";
import { Button } from "@/components/ui/button";
import { formatINR, getCategoryMeta } from "@/lib/categories";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useTransactions();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const monthRows = data.filter((t) => t.date.startsWith(thisMonth));
    const totalIncome = monthRows.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = monthRows.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const balance = data.reduce((s, t) => s + (t.type === "income" ? Number(t.amount) : -Number(t.amount)), 0);
    const savingsPct = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    return { totalIncome, totalExpense, balance, savingsPct };
  }, [data]);

  // Pie: expense by category (this month)
  const pieData = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const map = new Map<string, number>();
    data
      .filter((t) => t.type === "expense" && t.date.startsWith(thisMonth))
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount)));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [data]);

  // Line: last 6 months income vs expense
  const lineData = useMemo(() => {
    const months: { key: string; label: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
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

  const recent = data.slice(0, 5);
  const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"];
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const name = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {greeting}, <span className="gradient-text">{name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's your financial snapshot.</p>
        </div>
        <Link to="/add">
          <Button variant="hero" size="lg">
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Balance" value={Math.abs(stats.balance)} prefix={stats.balance < 0 ? "−₹" : "₹"} icon={Wallet} delay={0} />
        <StatCard label="Income (this month)" value={stats.totalIncome} prefix="₹" icon={TrendingUp} iconClass="bg-gradient-emerald" delay={0.05} />
        <StatCard label="Expenses (this month)" value={stats.totalExpense} prefix="₹" icon={TrendingDown} iconClass="bg-gradient-to-br from-red-500 to-orange-500" delay={0.1} />
        <StatCard label="Savings Rate" value={stats.savingsPct} suffix="%" icon={PiggyBank} iconClass="bg-gradient-primary" delay={0.15} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elegant animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Expense Breakdown</h3>
              <p className="text-xs text-muted-foreground">This month, by category</p>
            </div>
          </div>
          {pieData.length === 0 ? (
            <EmptyChart message="No expenses yet this month" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-3 glass rounded-2xl p-6 shadow-elegant animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Income vs Expense</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
              <Tooltip
                formatter={(v: number) => formatINR(v)}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="income" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expense" stroke="var(--chart-6)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass rounded-2xl p-6 shadow-elegant">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold">Recent Transactions</h3>
            <p className="text-xs text-muted-foreground">Your latest 5 entries</p>
          </div>
          <Link to="/transactions" className="text-sm text-accent hover:underline font-medium">
            View all →
          </Link>
        </div>
        {loading ? (
          <SkeletonRows />
        ) : recent.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-10 w-10 mx-auto text-accent mb-3" />
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first transaction to see your dashboard come alive.</p>
            <Link to="/add" className="inline-block mt-4">
              <Button variant="hero">Add your first transaction</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1 mt-2">
            {recent.map((t) => (
              <TransactionRow
                key={t.id}
                type={t.type}
                category={t.category}
                description={t.description}
                date={t.date}
                amount={Number(t.amount)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
function SkeletonRows() {
  return (
    <div className="space-y-2 mt-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-secondary/60 animate-pulse" />
      ))}
    </div>
  );
}
// Small helper to silence unused getCategoryMeta if tree-shaken
void getCategoryMeta;
