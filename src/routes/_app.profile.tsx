// Profile page — display & edit user info, account stats, sign out.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut, Mail, Calendar, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: txns } = useTransactions();
  const [fullName, setFullName] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, created_at")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setFullName(data.full_name ?? "");
        setCreatedAt(data.created_at);
      }
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const initials = (fullName || user?.email || "U").trim().slice(0, 1).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account.</p>
      </div>

      {/* Identity */}
      <div className="glass rounded-2xl p-6 md:p-8 shadow-elegant">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-emerald flex items-center justify-center text-3xl font-bold text-accent-foreground shadow-glow">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-xl">{fullName || "Add your name"}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5" /> {user?.email}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)}
              maxLength={100} placeholder="Your name" className="h-11" />
          </div>
          <Button variant="hero" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 shadow-elegant flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-emerald flex items-center justify-center shadow-glow">
            <Receipt className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total transactions</div>
            <div className="text-2xl font-bold">{txns.length}</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 shadow-elegant flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Member since</div>
            <div className="text-lg font-semibold">
              {createdAt ? new Date(createdAt).toLocaleDateString("en", { month: "long", year: "numeric" }) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="glass rounded-2xl p-6 shadow-elegant flex items-center justify-between">
        <div>
          <div className="font-semibold">Sign out</div>
          <div className="text-sm text-muted-foreground">End your current session.</div>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}
