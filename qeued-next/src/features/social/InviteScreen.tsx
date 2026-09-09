import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { supabase } from "@/shared/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/components/ui/use-toast";
import { Check, Users } from "lucide-react";
import { Navigate, Link } from "react-router-dom";

const InvitePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to={`/auth?redirect=/invite`} replace />;

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    if (trimmed === user.id) {
      toast({ title: "Error", description: "You can't connect with yourself!", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("connections").insert({ user_1: trimmed, user_2: user.id, status: "accepted" });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "Connected!", description: "You're now connected for shared recommendations." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-10 space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">You're connected!</h2>
            <p className="text-muted-foreground text-sm">You'll now get shared recommendations.</p>
            <Link to="/profile">
              <Button className="mt-2">Go to Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Join a Friend</CardTitle>
          <CardDescription>Paste the invite code you received to connect and share recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Paste invite code here..." value={code} onChange={(e) => setCode(e.target.value)} className="font-mono text-sm" />
          <Button className="w-full" onClick={handleJoin} disabled={loading || !code.trim()}>
            {loading ? "Connecting..." : "Connect"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
