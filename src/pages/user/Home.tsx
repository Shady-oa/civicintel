import { useAuth } from '@/contexts/AuthContext';
import { getReports, getNotifications } from '@/lib/storage';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UserHome() {
  const { session } = useAuth();
  const reports = getReports().filter(r => r.userId === session?.id);
  const notifications = getNotifications(session?.id).filter(n => !n.read).slice(0, 5);

  const total = reports.length;
  const pending = reports.filter(r => r.status === 'Pending').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const highRisk = reports.some(r => r.riskLevel === 'High');

  const stats = [
    { label: 'Total Reports', value: total, icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'Pending', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Resolved', value: resolved, icon: CheckCircle, color: 'bg-success-light text-success' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {session?.username}!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your civic reports.</p>
      </div>

      {/* Risk Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${highRisk ? 'risk-high' : 'risk-low'}`}>
        <AlertTriangle className="w-4 h-4" />
        {highRisk ? 'High Risk Detected' : 'All Clear – Low Risk'}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="civic-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Alerts */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Alerts</h3>
        {notifications.length === 0 ? (
          <div className="civic-card-flat text-center text-muted-foreground py-8">
            No recent alerts
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="civic-card-flat flex items-start gap-3 py-4">
                <div className={`w-2 h-2 rounded-full mt-2 ${n.type === 'error' ? 'bg-destructive' : n.type === 'success' ? 'bg-success' : 'bg-primary'}`} />
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
