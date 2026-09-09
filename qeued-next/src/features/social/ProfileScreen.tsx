import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { supabase } from "@/shared/supabase/client";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Star, Trash2, SkipForward, MessageSquare, Camera, Pencil, Check, Loader2, Share2, Globe, Lock, Copy, Users } from "lucide-react";
import FollowListDialog from "@/features/social/FollowListDialog";
import { useToast } from "@/shared/components/ui/use-toast";

type WatchStatus = "watched" | "watching" | "want_to_watch" | "dropped";

interface SkippedEntry {
  id: string;
  title_name: string;
  skipped_at: string;
  expires_at: string;
}

interface WatchEntry {
  id: string;
  status: WatchStatus;
  watched_rating: number | null;
  desire_ranking: number | null;
  notes: string | null;
  watched_date: string | null;
  review: string | null;
  title: {
    id: string;
    name: string;
    type: string;
    genres: string[];
    imdb_rating: number | null;
    year: number | null;
    image_url: string | null;
  };
}

interface Connection {
  id: string;
  user_1: string;
  user_2: string;
  status: "pending" | "accepted";
  invite_code: string | null;
  partner_name?: string;
}

const statusLabels: Record<WatchStatus, string> = {
  watched: "Watched",
  watching: "Watching",
  want_to_watch: "Want to Watch",
  dropped: "Dropped",
};

const EntryCard = ({
  entry, status, onUpdateRating, onUpdateDesireRanking, onUpdateNotes, onUpdateWatchedDate, onUpdateReview, onRemove,
}: {
  entry: WatchEntry;
  status: WatchStatus;
  onUpdateRating: (id: string, r: number) => void;
  onUpdateDesireRanking: (id: string, r: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateWatchedDate: (id: string, date: string | null) => void;
  onUpdateReview: (id: string, review: string) => void;
  onRemove: (id: string) => void;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [noteText, setNoteText] = useState(entry.notes || "");
  const [reviewText, setReviewText] = useState(entry.review || "");
  const [saving, setSaving] = useState(false);

  const saveNotes = async () => {
    setSaving(true);
    onUpdateNotes(entry.id, noteText);
    setSaving(false);
  };

  const saveReview = async () => {
    setSaving(true);
    onUpdateReview(entry.id, reviewText);
    setSaving(false);
  };

  const hasDetails = entry.notes || entry.review || entry.watched_date;

  return (
    <Card>
      <CardContent className="py-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {entry.title.image_url ? (
              <img src={entry.title.image_url} alt={entry.title.name} className="h-14 w-10 rounded object-cover shrink-0" />
            ) : (
              <div className="h-14 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <Link to={`/title/${entry.title.id}`} className="font-medium text-sm truncate hover:underline">{entry.title.name}</Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {entry.title.type === "series" ? "Series" : "Movie"} · {entry.title.year}
                </span>
                {entry.title.imdb_rating && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {entry.title.imdb_rating}
                  </span>
                )}
                {entry.watched_date && (
                  <span className="text-xs text-muted-foreground">· Watched {entry.watched_date}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status === "watched" && (
              <Select value={entry.watched_rating?.toString() || ""} onValueChange={(v) => onUpdateRating(entry.id, parseInt(v))}>
                <SelectTrigger className="w-20 h-8 text-xs"><SelectValue placeholder="Rate" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <SelectItem key={r} value={r.toString()}>{"⭐".repeat(r)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {status === "want_to_watch" && (
              <Select value={entry.desire_ranking?.toString() || ""} onValueChange={(v) => onUpdateDesireRanking(entry.id, parseInt(v))}>
                <SelectTrigger className="w-20 h-8 text-xs"><SelectValue placeholder="Rank" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                    <SelectItem key={r} value={r.toString()}>#{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDetails(!showDetails)}>
              <MessageSquare className={`h-3.5 w-3.5 ${hasDetails ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(entry.id)}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
        {showDetails && (
          <div className="mt-3 space-y-3 border-t pt-3">
            {/* Watch date (watched entries only) */}
            {status === "watched" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Watch date</label>
                <Input
                  type="date"
                  value={entry.watched_date || ""}
                  onChange={(e) => onUpdateWatchedDate(entry.id, e.target.value || null)}
                  className="h-8 text-xs w-40"
                />
              </div>
            )}

            {/* Review (watched entries only) */}
            {status === "watched" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Review</label>
                <Textarea
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="text-sm min-h-[80px] resize-none"
                  maxLength={2000}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{reviewText.length}/2000</span>
                  <Button size="sm" className="h-7 text-xs" onClick={saveReview} disabled={saving || reviewText === (entry.review || "")}>Save review</Button>
                </div>
              </div>
            )}

            {/* Notes (all statuses) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <Textarea placeholder="Add your notes..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="text-sm min-h-[60px] resize-none" maxLength={500} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{noteText.length}/500</span>
                <Button size="sm" className="h-7 text-xs" onClick={saveNotes} disabled={saving || noteText === (entry.notes || "")}>Save notes</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<WatchEntry[]>([]);
  const [, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string | null; bio: string | null; avatar_url: string | null; username: string | null; is_public: boolean }>({ name: null, bio: null, avatar_url: null, username: null, is_public: true });
  const [skipped, setSkipped] = useState<SkippedEntry[]>([]);

  // Edit states
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [joiningFriend, setJoiningFriend] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadEntries();
      loadSkipped();
      loadConnections();
      loadFollowCounts();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("name, avatar_url, bio, username, is_public")
      .eq("user_id", user!.id)
      .single();
    if (data) setProfile(data as any);
  };

  const loadFollowCounts = async () => {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user!.id),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user!.id),
    ]);
    setFollowerCount(followers || 0);
    setFollowingCount(following || 0);
  };

  const loadEntries = async () => {
    const { data } = await supabase
      .from("watch_entries")
      .select("id, status, watched_rating, desire_ranking, notes, watched_date, review, title:titles(id, name, type, genres, imdb_rating, year, image_url)")
      .eq("user_id", user!.id)
      .order("updated_at", { ascending: false });
    setEntries((data as any) || []);
    setLoading(false);
  };

  const loadSkipped = async () => {
    const { data } = await supabase
      .from("skipped_recommendations")
      .select("id, title_name, skipped_at, expires_at")
      .eq("user_id", user!.id)
      .gte("expires_at", new Date().toISOString())
      .order("skipped_at", { ascending: false });
    setSkipped((data as any) || []);
  };

  const loadConnections = async () => {
    const { data } = await supabase
      .from("connections")
      .select("*")
      .or(`user_1.eq.${user!.id},user_2.eq.${user!.id}`);
    if (data) {
      const enriched = await Promise.all(
        data.map(async (conn) => {
          const partnerId = conn.user_1 === user!.id ? conn.user_2 : conn.user_1;
          const { data: prof } = await supabase.from("profiles").select("name").eq("user_id", partnerId).single();
          return { ...conn, partner_name: prof?.name || "Unknown" };
        })
      );
      setConnections(enriched);
    }
  };

  const togglePublic = async (checked: boolean) => {
    setProfile((p) => ({ ...p, is_public: checked }));
    await supabase.from("profiles").update({ is_public: checked } as any).eq("user_id", user!.id);
    toast({ title: checked ? "Profile is now public" : "Profile is now private" });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user!.id);
    setProfile((p) => ({ ...p, avatar_url: avatarUrl }));
    setUploadingAvatar(false);
    toast({ title: "Profile photo updated!" });
  };

  const updateRating = async (entryId: string, rating: number) => {
    await supabase.from("watch_entries").update({ watched_rating: rating }).eq("id", entryId);
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, watched_rating: rating } : e)));
  };

  const updateDesireRanking = async (entryId: string, ranking: number) => {
    await supabase.from("watch_entries").update({ desire_ranking: ranking }).eq("id", entryId);
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, desire_ranking: ranking } : e)));
  };

  const updateNotes = async (entryId: string, notes: string) => {
    await supabase.from("watch_entries").update({ notes: notes || null }).eq("id", entryId);
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, notes: notes || null } : e)));
  };

  const updateWatchedDate = async (entryId: string, date: string | null) => {
    await supabase.from("watch_entries").update({ watched_date: date }).eq("id", entryId);
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, watched_date: date } : e)));
  };

  const updateReview = async (entryId: string, review: string) => {
    await supabase.from("watch_entries").update({ review: review || null }).eq("id", entryId);
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, review: review || null } : e)));
  };

  const removeEntry = async (entryId: string) => {
    await supabase.from("watch_entries").delete().eq("id", entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    toast({ title: "Removed from watchlist" });
  };

  const removeSkip = async (skipId: string) => {
    await supabase.from("skipped_recommendations").delete().eq("id", skipId);
    setSkipped((prev) => prev.filter((s) => s.id !== skipId));
    toast({ title: "Removed from skipped" });
  };

  const acceptInvite = async () => {
    if (!inviteCode.trim()) return;
    setJoiningFriend(true);
    try {
      const partnerId = inviteCode.trim();
      if (partnerId === user!.id) {
        toast({ title: "Error", description: "You can't connect with yourself!", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("connections").insert({ user_1: partnerId, user_2: user!.id, status: "accepted" });
      if (error) throw error;
      toast({ title: "Connected!", description: "You're now connected for shared recommendations." });
      setInviteCode("");
      loadConnections();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setJoiningFriend(false);
    }
  };

  const profileUrl = profile.username ? `https://qeued.com/p/${profile.username}` : null;
  const inviteUrl = `${window.location.origin}/invite`;
  const shareMessage = `Hey! Join me on Qeued — we can share movie & TV recommendations. Here's my invite code:\n\n${user?.id}\n\nGo to ${inviteUrl} to connect, or sign up and paste the code on your profile.`;

  const copyShareMessage = () => {
    navigator.clipboard.writeText(shareMessage);
    toast({ title: "Invite message copied!" });
  };

  const copyProfileUrl = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      toast({ title: "Profile URL copied!" });
    }
  };

  const filtered = (status: WatchStatus) => entries.filter((e) => e.status === status);
  const genres = [...new Set(entries.flatMap((e) => e.title.genres || []))].slice(0, 5);

  return (
    <div className="space-y-6 pb-20">
      {/* Profile header */}
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-border">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                {(profile.name || "?")[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center"
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
            ) : (
              <Camera className="h-5 w-5 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>

        {/* Name, bio, stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-bold tracking-tight truncate">{profile.name || "Your Name"}</h1>
            <span className="text-sm text-muted-foreground font-mono">@{profile.username || "username"}</span>

            {/* Edit Profile Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => {
                  setNameInput(profile.name || "");
                  setUsernameInput(profile.username || "");
                  setBioInput(profile.bio || "");
                }}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Display name</label>
                    <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} maxLength={50} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Username</label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">@</span>
                      <Input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} maxLength={30} className="font-mono text-sm" placeholder="username" />
                    </div>
                    {usernameInput.trim() && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-muted-foreground font-mono truncate">qeued.com/p/{usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")}</span>
                        <Button type="button" size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => {
                          const slug = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
                          navigator.clipboard.writeText(`https://qeued.com/p/${slug}`);
                          toast({ title: "URL copied!" });
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea value={bioInput} onChange={(e) => setBioInput(e.target.value)} placeholder="Tell others about your taste..." className="text-sm min-h-[60px] resize-none" maxLength={300} />
                    <span className="text-xs text-muted-foreground">{bioInput.length}/300</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {profile.is_public ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm">{profile.is_public ? "Public" : "Private"}</span>
                    </div>
                    <Switch checked={profile.is_public} onCheckedChange={togglePublic} />
                  </div>
                  <Button className="w-full" disabled={savingUsername} onClick={async () => {
                    const trimmedName = nameInput.trim();
                    if (trimmedName && trimmedName !== profile.name) {
                      await supabase.from("profiles").update({ name: trimmedName }).eq("user_id", user!.id);
                      setProfile((p) => ({ ...p, name: trimmedName }));
                    }
                    const slug = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
                    if (slug && slug.length >= 3 && slug !== profile.username) {
                      setSavingUsername(true);
                      const { error } = await supabase.from("profiles").update({ username: slug } as any).eq("user_id", user!.id);
                      if (error) {
                        toast({ title: "Username taken", variant: "destructive" });
                        setSavingUsername(false);
                        return;
                      }
                      setProfile((p) => ({ ...p, username: slug }));
                      setSavingUsername(false);
                    }
                    const trimmedBio = bioInput.trim();
                    if (trimmedBio !== (profile.bio || "")) {
                      await supabase.from("profiles").update({ bio: trimmedBio || null } as any).eq("user_id", user!.id);
                      setProfile((p) => ({ ...p, bio: trimmedBio || null }));
                    }
                    toast({ title: "Profile updated!" });
                  }}>
                    {savingUsername ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Save changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Share Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">
                  <Share2 className="h-3 w-3 mr-1" /> Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  {profileUrl && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Your public profile</label>
                      <div className="flex gap-2">
                        <Input value={profileUrl} readOnly className="font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={copyProfileUrl}><Copy className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Invite a friend</label>
                    <Textarea value={shareMessage} readOnly className="text-xs font-mono min-h-[100px] resize-none" />
                    <Button variant="outline" size="sm" className="mt-2 w-full" onClick={copyShareMessage}>
                      <Copy className="h-4 w-4 mr-1.5" /> Copy invite message
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Join a friend (paste their invite code)</label>
                    <div className="flex gap-2">
                      <Input placeholder="Paste invite code..." value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="font-mono text-xs" />
                      <Button onClick={acceptInvite} disabled={joiningFriend}><Check className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {connections.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Your connections</label>
                      <div className="space-y-1.5">
                        {connections.map((conn) => (
                          <div key={conn.id} className="flex items-center gap-2 text-sm">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>{conn.partner_name}</span>
                            <Badge variant={conn.status === "accepted" ? "default" : "secondary"} className="text-[10px] ml-auto">{conn.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{profile.bio}</p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <FollowListDialog userId={user!.id} type="followers" count={followerCount}>
              <button className="hover:underline"><strong className="text-foreground">{followerCount}</strong> followers</button>
            </FollowListDialog>
            <FollowListDialog userId={user!.id} type="following" count={followingCount}>
              <button className="hover:underline"><strong className="text-foreground">{followingCount}</strong> following</button>
            </FollowListDialog>
          </div>
          {genres.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {genres.map((g) => (
                <Badge key={g} variant="secondary" className="text-xs font-normal">{g}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="watched">
        <TabsList className="w-full justify-start">
          {(["watched", "watching", "want_to_watch", "dropped"] as WatchStatus[]).map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs sm:text-sm">
              {statusLabels[s]} ({filtered(s).length})
            </TabsTrigger>
          ))}
          <TabsTrigger value="skipped" className="text-xs sm:text-sm">
            <SkipForward className="h-3 w-3 mr-1" />
            Skipped ({skipped.length})
          </TabsTrigger>
        </TabsList>

        {(["watched", "watching", "want_to_watch", "dropped"] as WatchStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="space-y-3 mt-4">
            {filtered(status).length === 0 && (
              <p className="text-muted-foreground text-sm py-8 text-center">No titles here yet</p>
            )}
            {filtered(status)
              .sort((a, b) => {
                if (status === "want_to_watch") return (a.desire_ranking || 99) - (b.desire_ranking || 99);
                return 0;
              })
              .map((entry) => (
                <EntryCard key={entry.id} entry={entry} status={status} onUpdateRating={updateRating} onUpdateDesireRanking={updateDesireRanking} onUpdateNotes={updateNotes} onUpdateWatchedDate={updateWatchedDate} onUpdateReview={updateReview} onRemove={removeEntry} />
              ))}
          </TabsContent>
        ))}

        <TabsContent value="skipped" className="space-y-3 mt-4">
          {skipped.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">No skipped recommendations</p>
          )}
          {skipped.map((skip) => (
            <Card key={skip.id}>
              <CardContent className="flex items-center justify-between py-4 px-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate capitalize">{skip.title_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Hidden until {new Date(skip.expires_at).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSkip(skip.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
