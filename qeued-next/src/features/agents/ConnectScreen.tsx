import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bot, Check, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useProfile } from "@/features/household/ProfileContext";
import { displayName } from "@/features/household/model";

/**
 * The approval screen an assistant sends the user to.
 *
 * This is the only place an authorisation code can be created, and it says plainly which
 * client is asking and whose list it will reach — a household can have several profiles,
 * and connecting the wrong one is a quiet mistake to make.
 */
const ConnectScreen = () => {
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const { profiles, active, setActive } = useProfile();
  const navigate = useNavigate();
  const [clientName, setClientName] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = params.get("client_id") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const state = params.get("state");
  const challenge = params.get("code_challenge") ?? "";

  useEffect(() => {
    void (async () => {
      if (!clientId) {
        setError("This link is missing the client it is for.");
        setChecking(false);
        return;
      }
      const { data } = await supabase.from("oauth_clients").select("client_name").eq("client_id", clientId).maybeSingle();
      if (!data) setError("We don't recognise the assistant asking for access.");
      else setClientName(data.client_name ?? "An assistant");
      setChecking(false);
    })();
  }, [clientId, user]);

  const approve = async () => {
    if (!active) return;
    setApproving(true);
    const { data, error: rpcError } = await supabase.rpc("create_oauth_code", {
      p_client_id: clientId,
      p_profile_id: active.id,
      p_redirect_uri: redirectUri,
      p_code_challenge: challenge,
    });
    if (rpcError || typeof data !== "string") {
      setApproving(false);
      setError(rpcError?.message ?? "Could not approve that connection.");
      return;
    }
    // Hand control back to the client with the code it needs.
    const back = new URL(redirectUri);
    back.searchParams.set("code", data);
    if (state) back.searchParams.set("state", state);
    window.location.replace(back.toString());
  };

  if (loading || checking) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full space-y-4 p-6">
        {error ? (
          <>
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <h1 className="text-xl font-semibold">Can't connect that</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>Go to Qeued</Button>
          </>
        ) : !user ? (
          <>
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">Sign in to connect</h1>
            <p className="text-sm text-muted-foreground">
              <strong>{clientName}</strong> wants to read and update a Qeued list. Sign in and you can choose which one.
            </p>
            <Button
              className="w-full"
              onClick={() => navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
            >
              Sign in
            </Button>
          </>
        ) : (
          <>
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Connect {clientName}?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                It will be able to read your list, add to it, and record what you've watched. You can revoke
                it any time on the Assistants page.
              </p>
            </div>

            {profiles.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Which list?</p>
                <div className="flex flex-wrap gap-2">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => setActive(profile.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        profile.id === active?.id ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted"
                      }`}
                    >
                      {displayName(profile)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {profiles.length === 1 && active && (
              <p className="text-sm">
                Connecting to <Badge variant="outline">{displayName(active)}</Badge>
              </p>
            )}

            <Button className="w-full" onClick={approve} disabled={approving || !active}>
              {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Allow access
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>Cancel</Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default ConnectScreen;
