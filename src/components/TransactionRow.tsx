// Single transaction row used by Dashboard and Transactions list
import { formatINR, getCategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Props {
  type: "income" | "expense";
  category: string;
  description: string | null;
  date: string;
  amount: number;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function TransactionRow({
  type, category, description, date, amount, onEdit, onDelete, showActions,
}: Props) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors group">
      <div className={cn("h-11 w-11 rounded-xl bg-secondary flex items-center justify-center shrink-0", meta.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{description || category}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
          <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground/70">{category}</span>
          <span>{new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>
      <div className={cn(
        "font-semibold tabular-nums shrink-0",
        type === "income" ? "text-success" : "text-destructive",
      )}>
        {type === "income" ? "+" : "−"}{formatINR(amount)}
      </div>
      {showActions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={onEdit} className="text-xs px-2 py-1 rounded-md hover:bg-background">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-xs px-2 py-1 rounded-md text-destructive hover:bg-destructive/10">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
