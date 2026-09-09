import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function JoinHousehold() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [, setInvite] = useState<unknown>(null);
  const [householdName, setHouseholdName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data, error: err } = await supabase
        .from("household_invites")
        .select("*, households(name)")
        .eq("invite_code", code)
        .is("accepted_at", null)
        .single();

      if (err || !data) {
        setError("This invite link is invalid or has expired.");
      } else if (new Date(data.expires_at) < new Date()) {
        setError("This invite link has expired.");
      } else {
        setInvite(data);
        setHouseholdName((data as any).households?.name || "Household");
      }
      setLoading(false);
    })();
  }, [code]);

  const handleJoin = async () => {
    if (!user) {
      // Store invite code and redirect to login
      sessionStorage.setItem("pending_invite", code || "");
      navigate("/login");
      return;
    }

    setJoining(true);
    try {
      const { error: err } = await supabase.rpc("accept_household_invite", {
        _invite_code: code!,
      });
      if (err) throw err;
      toast.success(`You've joined ${householdName}!`);
      navigate("/list");
    } catch (e: any) {
      if (e.message?.includes("Already a member")) {
        toast.info("You're already a member of this household.");
        navigate("/list");
      } else {
        toast.error(e.message || "Failed to join household");
      }
    } finally {
      setJoining(false);
    }
  };

  // Auto-join after login redirect
  useEffect(() => {
    if (!authLoading && user && code) {
      const pending = sessionStorage.getItem("pending_invite");
      if (pending === code) {
        sessionStorage.removeItem("pending_invite");
        handleJoin();
      }
    }
  }, [authLoading, user, code]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Users className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold mb-2">Invalid Invite</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-6" onClick={() => navigate("/")}>
          Go home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Users className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-lg font-semibold mb-2">
        Join "{householdName}"
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        You've been invited to collaborate on shared shopping lists, recipes, and meal plans.
      </p>
      <Button onClick={handleJoin} disabled={joining} className="min-w-[160px]">
        {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {user ? "Join Household" : "Log in to join"}
      </Button>
    </div>
  );
}
