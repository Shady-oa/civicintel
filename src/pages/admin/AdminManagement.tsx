import { useState } from 'react';
import { getAdmins, addAdmin, updateAdmin, deleteAdmin } from '@/lib/storage';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

export default function AdminManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const admins = getAdmins();

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (editId) {
      updateAdmin(editId, { username, email, password });
      toast.success('Admin updated');
    } else {
      addAdmin({ id: `admin-${Date.now()}`, username, email, password });
      toast.success('Admin added');
    }
    resetForm();
    setRefreshKey(k => k + 1);
  };

  const startEdit = (admin: { id: string; username: string; email: string; password: string }) => {
    setEditId(admin.id);
    setUsername(admin.username);
    setEmail(admin.email);
    setPassword(admin.password);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (admins.length <= 1) {
      toast.error('Cannot delete the last admin');
      return;
    }
    deleteAdmin(id);
    toast.success('Admin deleted');
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="max-w-3xl" key={refreshKey}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Admin
          </button>
        )}
      </div>

      {showForm && (
        <div className="civic-card-flat mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editId ? 'Edit Admin' : 'New Admin'}</h3>
            <button onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              <Save className="w-4 h-4" /> {editId ? 'Update' : 'Add'} Admin
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {admins.map(a => (
          <div key={a.id} className="civic-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">{a.username[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{a.username}</p>
              <p className="text-sm text-muted-foreground">{a.email}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(a)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg hover:bg-danger-light transition-colors">
                <Trash2 className="w-4 h-4 text-danger" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
