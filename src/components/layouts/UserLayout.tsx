import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, FileText, FolderOpen, Map, MessageCircle, Bell, User, LogOut, Menu, X, Building2, Globe, AlertOctagon } from 'lucide-react';
import { getNotifications } from '@/lib/storage';
import { useState } from 'react';

const navItems = [
  { to: '/user', icon: Home, label: 'Home' },
  { to: '/user/report', icon: FileText, label: 'Report Issue' },
  { to: '/user/my-reports', icon: FolderOpen, label: 'My Reports' },
  { to: '/user/public-reports', icon: Globe, label: 'Public Reports' },
  { to: '/user/projects', icon: Building2, label: 'Public Projects' },
  { to: '/user/conflict', icon: AlertOctagon, label: 'Report Conflict' },
  { to: '/user/map', icon: Map, label: 'Map View' },
  { to: '/user/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/user/notifications', icon: Bell, label: 'Notifications' },
  { to: '/user/profile', icon: User, label: 'Profile' },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unreadCount = getNotifications(session?.id).filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 civic-sidebar flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <span className="font-bold text-lg">CivicIntel</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== '/user' && location.pathname.startsWith(item.to));
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </RouterNavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="font-semibold text-lg">
            Welcome, {session?.username || 'User'}
          </h2>
        </header>
        <div className="p-6 fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
