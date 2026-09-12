import { useCallback, useEffect, useState } from "react";
import { Copy, Plus, Loader2, Trash2, Bot } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/components/ui/use-toast";
import { supabase } from "@/shared/supabase/client";
import { useProfile } from "@/features/household/ProfileContext";

const MCP_URL = "https://piwfcsvnxcmxmvfhgtbk.supabase.co/functions/v1/mcp";

type Token = { id: string; label: string | null; created_at: string; last_used_at: string | null; revoked_at: string | null };
type Activity = { id: string; tool: string; summary: string | null; created_at: string };

/**
 * Connecting an assistant. A token here lets an agent read and write this profile's list
 * from wherever it runs — so the user can say "add that to my list" in a chat and have it
 * land here without opening the app.
 */
const AgentsScreen = () => {
  const { active } = useProfile();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [label, setLabel] = useState("");
  const [issued, setIssued] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!active) return;
    const [{ data: tokenRows }, { data: activityRows }] = await Promise.all([
      supabase.from("agent_tokens").select("id, label, created_at, last_used_at, revoked_at").eq("profile_id", active.id).order("created_at", { ascending: false }),
      supabase.from("agent_activity").select("id, tool, summary, created_at").eq("profile_id", active.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setTokens((tokenRows ?? []) as Token[]);
    setActivity((activityRows ?? []) as Activity[]);
    setLoading(false);
  }, [active]);

  useEffect(() => {
    void load();
  }, [load]);

  const issue = async () => {
    if (!active) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("issue-agent-token", {
      body: { profile_id: active.id, label: label.trim() || "assistant" },
    });
    setBusy(false);
    if (error) {
      toast({ title: "Couldn't create a token", description: error.message, variant: "destructive" });
      return;
    }
    setIssued((data as { token: string }).token);
    setLabel("");
    await load();
  };

  const revoke = async (id: string) => {
    await supabase.from("agent_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    await load();
  };

  const copy = (value: string, what: string) => {
    void navigator.clipboard.writeText(value);
    toast({ title: `${what} copied` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assistants</h1>
        <p className="text-muted-foreground">Let an AI assistant keep your list for you.</p>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2 font-medium"><Bot className="h-4 w-4" /> Connection details</div>
        <p className="text-sm text-muted-foreground">
          Add Qeued as an MCP server in Claude, or any assistant that speaks MCP. Point it at this URL
          and give it a token below.
        </p>
        <div className="flex items-center gap-2">
          <code className="grow truncate rounded bg-muted px-2 py-1 text-xs">{MCP_URL}</code>
          <Button variant="outline" size="sm" onClick={() => copy(MCP_URL, "Server URL")}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="font-medium">Tokens</div>
        {issued && (
          <div className="space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
            <p className="text-sm font-medium">Copy this now — it isn't shown again.</p>
            <div className="flex items-center gap-2">
              <code className="grow truncate rounded bg-background px-2 py-1 text-xs">{issued}</code>
              <Button variant="outline" size="sm" onClick={() => copy(issued, "Token")}><Copy className="h-3 w-3" /></Button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What's it for? e.g. Claude on my laptop" />
          <Button onClick={issue} disabled={busy}><Plus className="mr-2 h-4 w-4" /> New token</Button>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : tokens.length ? (
          <ul className="space-y-2">
            {tokens.map((token) => (
              <li key={token.id} className="flex items-center gap-3 rounded border p-2 text-sm">
                <span className="grow truncate">{token.label ?? "assistant"}</span>
                {token.revoked_at ? (
                  <Badge variant="outline">revoked</Badge>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {token.last_used_at ? `used ${new Date(token.last_used_at).toLocaleDateString()}` : "never used"}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => revoke(token.id)}><Trash2 className="h-3 w-3" /></Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No tokens yet.</p>
        )}
      </Card>

      {activity.length > 0 && (
        <Card className="space-y-2 p-4">
          <div className="font-medium">What your assistants did</div>
          <ul className="space-y-1 text-sm">
            {activity.map((item) => (
              <li key={item.id} className="flex gap-3">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span>{item.summary ?? item.tool}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AgentsScreen;
