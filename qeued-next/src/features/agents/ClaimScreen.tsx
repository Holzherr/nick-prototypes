import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useProfile } from "@/features/household/ProfileContext";

/**
 * Claiming a list an agent started. The assistant created a profile and has been saving
 * to it; this is where a person attaches their own sign-in and takes it over.
 */
const ClaimScreen = () => {
  const { code } = useParams<{ code: string }>();
  const { user, loading } = useAuth();
  const { reload, setActive } = useProfile();
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "claiming" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || !code || state !== "idle") return;
    setState("claiming");
    void (async () => {
      const { data, error } = await supabase.rpc("claim_profile", { p_claim_code: code });
      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }
      await reload();
      if (typeof data === "string") setActive(data);
      setState("done");
    })();
  }, [user, code, state, reload, setActive]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-4 p-6 text-center">
        {!user && (
          <>
            <h1 className="text-xl font-semibold">Claim your list</h1>
            <p className="text-sm text-muted-foreground">
              An assistant has been saving films and series for you. Sign in and they become yours.
            </p>
            <Button className="w-full" onClick={() => navigate(`/auth?claim=${code}`)}>Sign in to claim</Button>
          </>
        )}

        {user && state === "claiming" && (
          <>
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">Attaching the list to your account…</p>
          </>
        )}

        {state === "done" && (
          <>
            <Check className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">It's yours</h1>
            <p className="text-sm text-muted-foreground">Everything your assistant saved is on your list now.</p>
            <Button className="w-full" onClick={() => navigate("/")}>Open my list</Button>
          </>
        )}

        {state === "error" && (
          <>
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <h1 className="text-xl font-semibold">That link didn't work</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>Go to Qeued</Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default ClaimScreen;
