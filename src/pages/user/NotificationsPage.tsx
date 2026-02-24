import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/storage';
import { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const notifications = getNotifications(session?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const markRead = (id: string) => {
    markNotificationRead(id);
    setRefreshKey(k => k + 1);
  };

  const markAll = () => {
    markAllNotificationsRead(session!.id);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="max-w-3xl" key={refreshKey}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button onClick={markAll} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="civic-card-flat text-center text-muted-foreground py-12">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`civic-card-flat flex items-start gap-3 py-4 ${!n.read ? 'border-l-4 border-l-primary' : ''}`}>
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                n.type === 'error' ? 'bg-destructive' : n.type === 'success' ? 'bg-success' : n.type === 'warning' ? 'bg-amber-500' : 'bg-primary'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && (
                <button onClick={() => markRead(n.id)} className="text-muted-foreground hover:text-primary shrink-0">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
