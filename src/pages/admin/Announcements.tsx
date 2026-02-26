import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addAnnouncement, getAnnouncements, addNotification, addAuditLog } from '@/lib/storage';
import { toast } from 'sonner';
import { Megaphone, Plus, X } from 'lucide-react';

export default function Announcements() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [county, setCounty] = useState('All Counties');
  const [image, setImage] = useState<string | undefined>();

  const announcements = getAnnouncements().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) { toast.error('Fill required fields'); return; }

    addAnnouncement({
      id: `ann-${Date.now()}`, adminId: session!.id, adminName: session!.username,
      title, message, urgent, targetCounty: county, image, createdAt: new Date().toISOString(),
    });

    addNotification({ id: `notif-${Date.now()}-ann`, userId: 'all', title: urgent ? '🚨 ' + title : '📢 ' + title, message, type: urgent ? 'warning' : 'info', read: false, createdAt: new Date().toISOString() });
    addAuditLog({ id: `audit-${Date.now()}`, adminId: session!.id, adminName: session!.username, action: 'Announcement Posted', details: `Posted "${title}" (${urgent ? 'URGENT' : 'normal'})`, timestamp: new Date().toISOString() });

    toast.success('Announcement posted');
    setShowForm(false); setTitle(''); setMessage(''); setUrgent(false); setCounty('All Counties'); setImage(undefined);
    setRefreshKey(k => k + 1);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl space-y-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6 text-primary" /> Public Announcements</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {showForm && (
        <div className="civic-card-flat">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">New Announcement</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title *" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message *" rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            <div className="flex flex-wrap gap-4">
              <select value={county} onChange={e => setCounty(e.target.value)} className="px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>All Counties</option>
                <option>Nairobi County</option><option>Mombasa County</option><option>Kisumu County</option><option>Nakuru County</option><option>Uasin Gishu County</option>
              </select>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setUrgent(!urgent)} className={`w-11 h-6 rounded-full transition-colors relative ${urgent ? 'bg-destructive' : 'bg-border'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform ${urgent ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm font-medium">Mark as Urgent</span>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <span className="px-3 py-1.5 rounded-lg border border-dashed border-border hover:bg-muted/50">{image ? 'Image attached' : 'Attach image'}</span>
              </label>
            </div>
            <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Post Announcement</button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className={`civic-card-flat ${a.urgent ? 'border-l-4 border-l-destructive' : ''}`}>
            <div className="flex items-start gap-3">
              {a.urgent && <span className="text-xs px-2 py-0.5 rounded-full risk-high shrink-0">URGENT</span>}
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                <p className="text-xs text-muted-foreground mt-2">By: {a.adminName} · {a.targetCounty} · {new Date(a.createdAt).toLocaleString()}</p>
              </div>
              {a.image && <img src={a.image} alt="Attachment" className="w-16 h-16 rounded-xl object-cover shrink-0" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
