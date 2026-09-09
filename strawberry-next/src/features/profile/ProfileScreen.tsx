import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Users, Settings } from "lucide-react";
import { fetchRecipesByAuthor, type DbRecipe } from "@/shared/api";
import { users } from "@/shared/data/recipes";
import { useAuth } from "@/features/auth/AuthContext";
import { Logo } from "@/shared/brand";
import { supabase } from "@/shared/supabase/client";
import RecipeCard from "@/features/recipe/RecipeCard";
import { toast } from "sonner";
import { useUnitPreference, type UnitSystem } from "@/features/profile/useUnitPreference";

export default function Profile() {
  const { handle } = useParams<{ handle: string }>();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = !handle;
  const { units, setUnits } = useUnitPreference();
  const [showSettings, setShowSettings] = useState(false);

  const [recipes, setRecipes] = useState<DbRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editHandle, setEditHandle] = useState("");

  // For other users' profiles
  const otherUser = handle ? users.find((u) => u.handle === handle) : null;

  useEffect(() => {
    if (isOwnProfile && !user) {
      setLoading(false);
      return;
    }
    const h = handle || profile?.handle || "you";
    fetchRecipesByAuthor(h)
      .then(setRecipes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [handle, user, profile?.handle, isOwnProfile]);

  const startEdit = () => {
    setEditName(profile?.display_name || "");
    setEditBio(profile?.bio || "");
    setEditHandle(profile?.handle || "");
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: editName.trim() || null,
          bio: editBio.trim() || null,
          handle: editHandle.trim().toLowerCase() || null,
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      setEditing(false);
      toast.success("Profile updated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  };

  // Own profile but not logged in
  if (isOwnProfile && !user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <Logo size="lg" markOnly className="mx-auto mb-3" />
        <h1 className="text-xl font-semibold tracking-tight mb-2">Your Profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in to see your profile and published recipes.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-foreground text-background text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          Log in
        </button>
      </div>
    );
  }

  // Other user not found
  if (!isOwnProfile && !otherUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">User not found.</p>
      </div>
    );
  }

  const displayName = isOwnProfile
    ? profile?.display_name || user?.user_metadata?.full_name || "You"
    : otherUser!.name;
  const displayHandle = isOwnProfile
    ? profile?.handle || user?.email?.split("@")[0] || "you"
    : otherUser!.handle;
  const displayBio = isOwnProfile
    ? profile?.bio || ""
    : otherUser!.bio;
  const displayAvatar = isOwnProfile
    ? profile?.avatar_url || user?.user_metadata?.avatar_url
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        {displayAvatar ? (
          <img src={displayAvatar} alt={displayName} className="h-16 w-16 rounded-full object-cover shrink-0" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground shrink-0">
            {displayName.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Display name"
                className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                <span className="pl-3 text-sm text-muted-foreground">@</span>
                <input
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  placeholder="handle"
                  className="flex-1 px-1.5 py-1.5 text-sm focus:outline-none"
                />
              </div>
              <input
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Short bio"
                className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex gap-2">
                <button onClick={saveProfile} className="text-xs font-medium bg-foreground text-background px-4 py-1.5 rounded-full">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold tracking-tight">{displayName}</h1>
              <p className="text-sm text-muted-foreground">@{displayHandle}</p>
              {displayBio && <p className="text-sm mt-0.5">{displayBio}</p>}
              {isOwnProfile && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={startEdit}
                    className="text-xs font-medium border px-3 py-1 rounded-full hover:bg-secondary transition-colors"
                  >
                    Edit profile
                  </button>
                  <button
                    onClick={signOut}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign out
                  </button>
                   <Link
                    to="/household"
                    className="text-xs font-medium border px-3 py-1 rounded-full hover:bg-secondary transition-colors inline-flex items-center gap-1"
                  >
                    <Users className="h-3 w-3" />
                    Household
                  </Link>
                  <button
                    onClick={() => setShowSettings((v) => !v)}
                    className="text-xs font-medium border px-3 py-1 rounded-full hover:bg-secondary transition-colors inline-flex items-center gap-1"
                  >
                    <Settings className="h-3 w-3" />
                    Settings
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Settings panel */}
      {isOwnProfile && showSettings && (
        <div className="mb-8 p-4 border rounded-xl bg-muted/30">
          <h2 className="text-sm font-medium mb-3">Settings</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Measurement units</p>
              <p className="text-xs text-muted-foreground">Used for recipes and shopping list</p>
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              {(["metric", "imperial"] as UnitSystem[]).map((system) => (
                <button
                  key={system}
                  onClick={() => { setUnits(system); toast.success(`Switched to ${system}`); }}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    units === system
                      ? "bg-foreground text-background"
                      : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {system}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-base font-medium mb-4">Recipes</h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
              <div className="mt-3 h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
          {recipes.map((r) => (<RecipeCard key={r.id} recipe={r} />))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12 text-sm">No recipes published yet.</p>
      )}
    </div>
  );
}
