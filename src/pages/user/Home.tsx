import { useAuth } from '@/contexts/AuthContext';
import { getReports, getNotifications, getAnnouncements } from '@/lib/storage';
import { FileText, Clock, CheckCircle, AlertTriangle, ArrowRight, Megaphone } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Link } from 'react-router-dom';

export default function UserHome() {
  const { session } = useAuth();
  const reports = getReports().filter(r => r.userId === session?.id);
  const notifications = getNotifications(session?.id).filter(n => !n.read).slice(0, 5);
  const announcements = getAnnouncements().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  const total = reports.length;
  const pending = reports.filter(r => r.status === 'Pending').length;
  const solved = reports.filter(r => r.status === 'Solved').length;
  const highRisk = reports.some(r => r.riskLevel === 'High');

  const stats = [
    { label: 'Total Reports', value: total, icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'Pending', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Solved', value: solved, icon: CheckCircle, color: 'bg-success-light text-success' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session?.username}!</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your civic reports.</p>
        </div>
        <Link
          to="/user/report"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          Report Issue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${highRisk ? 'risk-high' : 'risk-low'}`}>
        <AlertTriangle className="w-4 h-4" />
        {highRisk ? 'High Risk Detected' : 'All Clear – Low Risk'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" /> Public Announcements
          </h3>
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a.id} className={`civic-card-flat py-4 ${a.urgent ? 'border-l-4 border-l-destructive' : ''}`}>
                <div className="flex items-start gap-3">
                  {a.urgent && <span className="text-xs px-2 py-0.5 rounded-full risk-high shrink-0">URGENT</span>}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{a.targetCounty} · {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Recent Alerts</h3>
          <Link to="/user/notifications" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {notifications.length === 0 ? (
          <div className="civic-card-flat text-center text-muted-foreground py-8">
            No recent alerts
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="civic-card-flat flex items-start gap-3 py-4 hover:shadow-sm transition-shadow">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.type === 'error' ? 'bg-destructive' : n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-success' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
