import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, AlertTriangle, BarChart3, MessageCircle, Bell, Users, LogOut, Menu, X, Building2, Shield, ScrollText, Megaphone } from 'lucide-react';
import { getNotifications } from '@/lib/storage';
import { useState } from 'react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/reports', icon: FileText, label: 'All Reports' },
  { to: '/admin/projects', icon: Building2, label: 'Projects & Budget' },
  { to: '/admin/risk', icon: AlertTriangle, label: 'Risk Monitoring' },
  { to: '/admin/conflicts', icon: Shield, label: 'Conflict Approvals' },
  { to: '/admin/performance', icon: BarChart3, label: 'Performance' },
  { to: '/admin/chat', icon: MessageCircle, label: 'Chat Center' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/audit', icon: ScrollText, label: 'Audit Logs' },
  { to: '/admin/management', icon: Users, label: 'Admin Management' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300 bg-foreground text-background
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <span className="font-bold text-lg">CivicIntel Admin</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-background/60 hover:bg-background/10 hover:text-background'
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

        <div className="p-3 border-t border-background/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-background/60 hover:bg-destructive/20 hover:text-destructive w-full transition-all"
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
          <h2 className="font-semibold text-lg">Admin Panel</h2>
          <span className="ml-auto text-sm text-muted-foreground">{session?.username}</span>
        </header>
        <div className="p-6 fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
