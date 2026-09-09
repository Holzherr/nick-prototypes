import { BookOpen, CalendarDays, Home, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Logo } from '@/shared/brand';

const navItems = [
  { path: '/recipes', label: 'Find', icon: Home },
  { path: '/box', label: 'Box', icon: BookOpen },
  { path: '/plan', label: 'Plan', icon: CalendarDays },
  { path: '/list', label: 'List', icon: ShoppingCart },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, profile } = useAuth();

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name || user?.user_metadata?.full_name || '';

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  const avatar = (size: 'sm' | 'md') => {
    const box = size === 'md' ? 'h-8 w-8' : 'h-7 w-7';
    const text = size === 'md' ? 'text-sm' : 'text-xs';
    return avatarUrl ? (
      <img src={avatarUrl} alt={displayName} className={`${box} rounded-full object-cover`} />
    ) : (
      <div
        className={`${box} ${text} flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground`}
      >
        {displayName.charAt(0) || '?'}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Desktop top nav */}
      <header className="hidden items-center justify-between border-b px-8 py-4 md:flex">
        <Link to="/" aria-label="Strawberry home">
          <Logo size="sm" />
        </Link>
        <nav className="flex items-center gap-8">
          {navItems
            .filter(i => i.path !== '/profile')
            .map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition-colors ${
                  isActive(item.path)
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>
        {user ? (
          <Link to="/profile" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            {avatar('md')}
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Log in
          </Link>
        )}
      </header>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
        <Link to="/" aria-label="Strawberry home">
          <Logo size="sm" markOnly />
        </Link>
        {user ? (
          <Link to="/profile">{avatar('sm')}</Link>
        ) : (
          <Link
            to="/login"
            className="rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-secondary"
          >
            Log in
          </Link>
        )}
      </header>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background py-2 md:hidden">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
                active ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
