import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "@/shared/brand";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect when authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Logged in!");
      navigate("/profile");
    } catch (e: any) {
      toast.error(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };


  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <Logo size="lg" markOnly className="mx-auto mb-3" />
        <h1 className="text-xl font-semibold tracking-tight">Log in to Strawberry</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground text-background text-sm font-medium py-2.5 rounded-full hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{" "}
        <Link to="/signup" className="text-foreground underline">Sign up</Link>
      </p>
    </div>
  );
}
