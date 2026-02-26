import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addConflictReport, addNotification } from '@/lib/storage';
import { toast } from 'sonner';
import { AlertOctagon, Send, Upload } from 'lucide-react';
import { ConflictReport } from '@/lib/types';

export default function ConflictReportPage() {
  const { session } = useAuth();
  const [conflictType, setConflictType] = useState<ConflictReport['conflictType']>('Crime');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [anonymous, setAnonymous] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !description) { toast.error('Please fill in all required fields'); return; }

    const severity = Math.random() > 0.6 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low';

    addConflictReport({
      id: `conflict-${Date.now()}`, userId: session!.id,
      username: anonymous ? 'Anonymous' : session!.username,
      conflictType, location, description, image, anonymous,
      status: 'Pending', severity: severity as ConflictReport['severity'],
      createdAt: new Date().toISOString(),
    });

    addNotification({ id: `notif-${Date.now()}`, userId: session!.id, title: 'Conflict Report Submitted', message: `Your ${conflictType.toLowerCase()} report for ${location} is pending admin approval.`, type: 'info', read: false, createdAt: new Date().toISOString() });
    addNotification({ id: `notif-${Date.now()}-admin`, userId: 'admin-1', title: 'New Conflict Report', message: `New ${conflictType} report at ${location} requires approval.`, type: 'warning', read: false, createdAt: new Date().toISOString() });

    toast.success('Conflict report submitted for review');
    setConflictType('Crime'); setLocation(''); setDescription(''); setImage(undefined); setAnonymous(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2"><AlertOctagon className="w-6 h-6 text-danger" /> Report Conflict</h1>
      <p className="text-muted-foreground mb-6">Submit a conflict report. It will be reviewed by admin before appearing on the heat map.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Conflict Type *</label>
          <select value={conflictType} onChange={e => setConflictType(e.target.value as ConflictReport['conflictType'])} className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option>Ethnic Tension</option><option>Protest</option><option>Crime</option><option>Political Violence</option><option>Land Dispute</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Location *</label>
          <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g., Nairobi CBD, Kisumu Kondele" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Describe the conflict situation" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Upload Evidence (optional)</label>
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{image ? 'Image selected' : 'Click to upload'}</span>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
          {image && <img src={image} alt="Preview" className="mt-3 rounded-xl max-h-40 object-cover" />}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setAnonymous(!anonymous)} className={`w-11 h-6 rounded-full transition-colors relative ${anonymous ? 'bg-primary' : 'bg-border'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm font-medium">Submit anonymously</span>
        </div>

        <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          <Send className="w-4 h-4" /> Submit Conflict Report
        </button>
      </form>
    </div>
  );
}
