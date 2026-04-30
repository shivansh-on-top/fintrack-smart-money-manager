// Transactions list with filters, search, pagination, edit/delete
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2 } from "lucide-react";
import { useTransactions, type Transaction } from "@/hooks/use-transactions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TransactionRow } from "@/components/TransactionRow";
import { CATEGORIES } from "@/lib/categories";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/transactions")({
  component: TransactionsPage,
});

const PAGE_SIZE = 20;

function TransactionsPage() {
  const { data, loading, refresh } = useTransactions();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [page, setPage] = useState(0);
  const [confirmDel, setConfirmDel] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let list = [...data];
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (categoryFilter !== "all") list = list.filter((t) => t.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.description?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
      );
    }
    if (sortBy === "amount") list.sort((a, b) => Number(b.amount) - Number(a.amount));
    else list.sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }, [data, typeFilter, categoryFilter, search, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleDelete = async () => {
    if (!confirmDel) return;
    const { error } = await supabase.from("transactions").delete().eq("id", confirmDel.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Transaction deleted");
      refresh();
    }
    setConfirmDel(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} entries</p>
        </div>
        <Link to="/add">
          <Button variant="hero"><Plus className="h-4 w-4" /> Add Transaction</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 shadow-elegant grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search description or category..." className="pl-9 h-10"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as "all" | "income" | "expense"); setPage(0); }}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0); }}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.key}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="md:col-span-4 flex justify-end">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "amount")}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by date</SelectItem>
              <SelectItem value="amount">Sort by amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="glass rounded-2xl p-2 shadow-elegant">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-secondary/60 animate-pulse" />)}
          </div>
        ) : pageRows.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-medium">No transactions match your filters</p>
            <p className="text-sm text-muted-foreground mt-1">Try clearing the filters or add a new transaction.</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {pageRows.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <TransactionRow
                    type={t.type}
                    category={t.category}
                    description={t.description}
                    date={t.date}
                    amount={Number(t.amount)}
                  />
                </div>
                <button
                  onClick={() => setConfirmDel(t)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">Page {page + 1} of {pageCount}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}>
            Next
          </Button>
        </div>
      )}

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
