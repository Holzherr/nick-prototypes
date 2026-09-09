import { Logo } from "@/shared/brand/Logo";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PublicHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith("/p/");

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {isProfilePage && (
            <button
              onClick={() => window.history.length > 1 && document.referrer.includes(window.location.hostname) ? navigate(-1) : navigate("/")}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Link to="/"><Logo /></Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Explore
          </Link>
          <Link to="/auth">
            <button className="text-sm font-medium text-primary hover:underline">Sign in</button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
