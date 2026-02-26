import { useState } from 'react';
import { getReports, updateReport, addNotification, addAuditLog } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, ChevronDown } from 'lucide-react';

export default function AllReports() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const reports = getReports().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const changeStatus = (id: string, userId: string, status: string, title: string) => {
    updateReport(id, { status: status as 'Pending' | 'In Progress' | 'Solved' });
    addNotification({
      id: `notif-${Date.now()}`,
      userId,
      title: 'Status Updated',
      message: `Your report "${title}" status changed to ${status}.`,
      type: status === 'Solved' ? 'success' : 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });
    addAuditLog({
      id: `audit-${Date.now()}`,
      adminId: session!.id,
      adminName: session!.username,
      action: 'Report Status Changed',
      details: `Changed "${title}" to ${status}`,
      timestamp: new Date().toISOString(),
    });
    toast.success('Status updated');
    setRefreshKey(k => k + 1);
  };

  const escalate = (id: string, userId: string, title: string) => {
    updateReport(id, { riskLevel: 'High', riskScore: 95 });
    addNotification({
      id: `notif-${Date.now()}`,
      userId,
      title: 'Report Escalated',
      message: `Your report "${title}" has been escalated to high priority.`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    });
    addAuditLog({
      id: `audit-${Date.now()}`,
      adminId: session!.id,
      adminName: session!.username,
      action: 'Report Escalated',
      details: `Escalated "${title}" to high priority`,
      timestamp: new Date().toISOString(),
    });
    toast.success('Report escalated');
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="max-w-6xl" key={refreshKey}>
      <h1 className="text-2xl font-bold mb-6">All Reports</h1>

      {reports.length === 0 ? (
        <div className="civic-card-flat text-center text-muted-foreground py-12">No reports yet</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-left px-4 py-3 font-semibold">Risk</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">{r.username}</td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{r.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${r.riskLevel === 'High' ? 'risk-high' : 'risk-low'}`}>
                      {r.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        value={r.status}
                        onChange={e => changeStatus(r.id, r.userId, e.target.value, r.title)}
                        className="appearance-none bg-muted rounded-lg px-3 py-1.5 pr-8 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Solved</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-muted-foreground" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => escalate(r.id, r.userId, r.title)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-danger-light text-danger hover:bg-destructive/20 transition-colors font-medium"
                    >
                      <AlertTriangle className="w-3 h-3" /> Escalate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
