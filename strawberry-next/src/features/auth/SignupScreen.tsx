import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "@/shared/brand";
import { supabase } from "@/shared/supabase/client";

export default function Signup() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) {
      toast.error("Please choose a username");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { handle: handle.trim().toLowerCase() },
        },
      });
      if (error) throw error;
      toast.success("Check your email to confirm your account!");
      navigate("/login");
    } catch (e: any) {
      toast.error(e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <Logo size="lg" markOnly className="mx-auto mb-3" />
        <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Username</label>
          <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-ring">
            <span className="pl-3 text-sm text-muted-foreground">@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="flex-1 px-1.5 py-2 text-sm focus:outline-none"
              placeholder="yourhandle"
              required
            />
          </div>
        </div>
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
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground text-background text-sm font-medium py-2.5 rounded-full hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>


      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-foreground underline">Log in</Link>
      </p>
    </div>
  );
}
