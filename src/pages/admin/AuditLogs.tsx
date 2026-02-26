import { getAuditLogs } from '@/lib/storage';
import { ScrollText } from 'lucide-react';

export default function AuditLogs() {
  const logs = getAuditLogs().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="w-6 h-6 text-primary" /> Audit Logs</h1>

      {logs.length === 0 ? (
        <div className="civic-card-flat text-center text-muted-foreground py-12">No audit logs yet</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-3 font-semibold">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold">Admin</th>
                <th className="text-left px-4 py-3 font-semibold">Action</th>
                <th className="text-left px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{log.adminName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted font-medium">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[300px] truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
