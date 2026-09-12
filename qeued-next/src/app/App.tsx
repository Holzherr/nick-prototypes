import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { ProfileProvider } from "@/features/household/ProfileContext";
import Layout from "@/shared/layout/Layout";
import Index from "@/features/library/HomeScreen";
import Auth from "@/features/auth/AuthScreen";
import SearchPage from "@/features/discover/SearchScreen";
import TonightPage from "@/features/tonight/TonightScreen";
import HouseholdPage from "@/features/household/HouseholdScreen";
import AgentsPage from "@/features/agents/AgentsScreen";
import ClaimPage from "@/features/agents/ClaimScreen";
import ProfilePage from "@/features/social/ProfileScreen";
import PublicProfilePage from "@/features/social/PublicProfileScreen";
import InvitePage from "@/features/social/InviteScreen";
import LandingPage from "@/features/landing/LandingScreen";
import ExplorePage from "@/features/discover/ExploreScreen";
import TitleDetailPage from "@/features/title/TitleDetailScreen";
import PublicTitlePage from "@/features/title/PublicTitleScreen";
import GenrePage from "@/features/discover/GenreScreen";
import ActorPage from "@/features/discover/ActorScreen";
import NotFound from "@/features/landing/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <Layout>{children}</Layout>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/** Restores a deep link stashed by the host's 404.html (GitHub Pages only serves a root 404). */
const RestoreDeepLink = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const path = sessionStorage.getItem("spa-redirect");
    if (path) {
      sessionStorage.removeItem("spa-redirect");
      navigate(path, { replace: true });
    }
  }, [navigate]);
  return null;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <LandingPage />;
  return <Layout><Index /></Layout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <RestoreDeepLink />
        <AuthProvider>
      <ProfileProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/" element={<HomeRoute />} />
            <Route path="/titles/:slug" element={<PublicTitlePage />} />
          <Route path="/claim/:code" element={<ClaimPage />} />
          <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
          <Route path="/household" element={<ProtectedRoute><HouseholdPage /></ProtectedRoute>} />
          <Route path="/tonight" element={<ProtectedRoute><TonightPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/p/:username" element={<PublicProfilePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/title/:id" element={<TitleDetailPage />} />
            <Route path="/genre/:genre" element={<GenrePage />} />
            <Route path="/actor/:id" element={<ActorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProfileProvider>
    </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
