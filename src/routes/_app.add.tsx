// Add new transaction page
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/add")({
  component: AddTransaction,
});

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0").max(99999999),
  category: z.string().min(1, "Pick a category"),
  date: z.string().min(1),
  description: z.string().max(500).optional(),
});

function AddTransaction() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      type, amount: parseFloat(amount), category, date, description: description || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      date: parsed.data.date,
      description: parsed.data.description ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Transaction added 🎉");
    navigate({ to: "/transactions" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-3xl font-bold">Add Transaction</h1>
      <p className="text-muted-foreground mt-1">Track every rupee in or out.</p>

      <div className="mt-8 glass rounded-2xl p-6 md:p-8 shadow-elegant">
        {/* Animated type toggle */}
        <div className="relative grid grid-cols-2 p-1 bg-secondary rounded-xl mb-6">
          <div
            className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 shadow-sm",
              type === "income" ? "left-1 bg-gradient-emerald" : "left-[calc(50%+0px)] bg-gradient-to-br from-red-500 to-orange-500",
            )}
          />
          {(["income", "expense"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategory(""); }}
              className={cn(
                "relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors capitalize",
                type === t ? "text-white" : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">₹</span>
              <Input
                id="amount" type="number" inputMode="decimal" step="0.01" min="0"
                placeholder="0" className="pl-10 h-16 text-3xl font-bold tabular-nums"
                value={amount} onChange={(e) => setAmount(e.target.value)} required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      <span className="flex items-center gap-2">
                        <c.icon className={cn("h-4 w-4", c.color)} /> {c.key}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" className="h-11" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea id="description" placeholder="Lunch with team, monthly subscription..."
              value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Transaction"}
          </Button>
        </form>
      </div>
    </div>
  );
}
