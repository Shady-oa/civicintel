import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser, getUsers } from '@/lib/storage';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function Profile() {
  const { session, logout } = useAuth();
  const user = getUsers().find(u => u.id === session?.id);

  const [username, setUsername] = useState(session?.username || '');
  const [email, setEmail] = useState(session?.email || '');
  const [password, setPassword] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      toast.error('Username and email are required');
      return;
    }

    const updates: Record<string, string> = { username, email };
    if (password) updates.password = password;

    updateUser(session!.id, updates);
    toast.success('Profile updated. Please log in again.');
    logout();
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">New Password (leave blank to keep current)</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </form>

      {user && (
        <p className="text-xs text-muted-foreground mt-6">Account created: {new Date(user.createdAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}
