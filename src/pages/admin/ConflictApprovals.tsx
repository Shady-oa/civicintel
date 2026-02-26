import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getConflictReports, updateConflictReport, addNotification, addAuditLog } from '@/lib/storage';
import { predictConflictEscalation } from '@/lib/ai-simulation';
import { toast } from 'sonner';
import { Shield, Check, X, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ConflictApprovals() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const conflicts = getConflictReports().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pending = conflicts.filter(c => c.status === 'Pending');
  const approved = conflicts.filter(c => c.status === 'Approved' || c.status === 'Escalated');

  const handleAction = (id: string, action: 'Approved' | 'Rejected' | 'Escalated') => {
    const conflict = conflicts.find(c => c.id === id);
    if (!conflict) return;

    updateConflictReport(id, { status: action });
    addAuditLog({
      id: `audit-${Date.now()}`, adminId: session!.id, adminName: session!.username,
      action: `Conflict ${action}`, details: `${action} conflict report: "${conflict.conflictType}" at ${conflict.location}`,
      timestamp: new Date().toISOString(),
    });

    if (action === 'Approved') {
      addNotification({ id: `notif-${Date.now()}`, userId: conflict.userId, title: 'Conflict Report Approved', message: `Your conflict report for ${conflict.location} has been approved and added to the heat map.`, type: 'info', read: false, createdAt: new Date().toISOString() });
      addNotification({ id: `notif-${Date.now()}-pub`, userId: 'all', title: '⚠ Conflict Alert', message: `A ${conflict.severity.toLowerCase()}-severity ${conflict.conflictType.toLowerCase()} conflict has been confirmed in ${conflict.location}.`, type: 'warning', read: false, createdAt: new Date().toISOString() });
    }

    if (action === 'Escalated') {
      updateConflictReport(id, { status: 'Escalated', severity: 'High' });
      addNotification({ id: `notif-${Date.now()}-esc`, userId: 'all', title: '🚨 Conflict Escalated', message: `Critical conflict in ${conflict.location} has been escalated. Exercise caution.`, type: 'error', read: false, createdAt: new Date().toISOString() });
    }

    toast.success(`Conflict ${action.toLowerCase()}`);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="max-w-5xl space-y-6" key={refreshKey}>
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Conflict Approvals</h1>

      {/* Pending Queue */}
      <div>
        <h3 className="font-semibold mb-3">Pending Approval ({pending.length})</h3>
        {pending.length === 0 ? (
          <div className="civic-card-flat text-center text-muted-foreground py-8">No pending conflict reports</div>
        ) : (
          <div className="space-y-3">
            {pending.map(c => {
              const prediction = predictConflictEscalation(c.severity, conflicts.filter(x => x.location === c.location).length);
              return (
                <div key={c.id} className="civic-card-flat">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.severity === 'High' ? 'risk-high' : c.severity === 'Medium' ? 'bg-amber-50 text-amber-600' : 'risk-low'}`}>{c.severity}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">{c.conflictType}</span>
                      </div>
                      <p className="font-semibold">{c.location}</p>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">By: {c.username} · {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    {c.image && <img src={c.image} alt="Evidence" className="w-20 h-20 rounded-xl object-cover shrink-0 ml-4" />}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs px-2 py-1 rounded-lg bg-muted">
                      🤖 Escalation Risk: <strong className={prediction.escalationProbability > 50 ? 'text-danger' : 'text-success'}>{prediction.escalationProbability}%</strong> ({prediction.confidence}% conf.)
                    </span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => handleAction(c.id, 'Approved')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-success-light text-success font-medium">
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => handleAction(c.id, 'Rejected')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium">
                        <X className="w-3 h-3" /> Reject
                      </button>
                      <button onClick={() => handleAction(c.id, 'Escalated')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-danger-light text-danger font-medium">
                        <AlertTriangle className="w-3 h-3" /> Escalate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Hotspots */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Active Hotspots ({approved.length})</h3>
        {approved.length === 0 ? (
          <div className="civic-card-flat text-center text-muted-foreground py-8">No active hotspots</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {approved.map(c => (
              <div key={c.id} className={`civic-card ${c.status === 'Escalated' ? 'border-l-4 border-l-destructive' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.severity === 'High' ? 'risk-high' : c.severity === 'Medium' ? 'bg-amber-50 text-amber-600' : 'risk-low'}`}>{c.severity}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">{c.conflictType}</span>
                  {c.status === 'Escalated' && <span className="text-xs px-2 py-0.5 rounded-full risk-high">ESCALATED</span>}
                </div>
                <p className="font-semibold text-sm">{c.location}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
