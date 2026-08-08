import React, { useState } from 'react';
import { Users, Trash2, Mail, Calendar } from 'lucide-react';

interface LocalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<LocalUser[]>(() => {
    try {
      const raw = localStorage.getItem('ayush_registered_users_v2');
      return raw ? (JSON.parse(raw) as LocalUser[]) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState<'all' | 'student' | 'doctor' | 'org' | 'user'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = users.filter(u => filter === 'all' || u.role === filter);

  const handleDelete = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem('ayush_registered_users_v2', JSON.stringify(updated));

    // Also remove profile
    localStorage.removeItem(`ayush_profile_${id}`);
    setDeleteId(null);
  };

  const handleRoleChange = (id: string, role: string) => {
    const updated = users.map(u => u.id === id ? { ...u, role } : u);
    setUsers(updated);
    localStorage.setItem('ayush_registered_users_v2', JSON.stringify(updated));
  };

  const ROLE_COLORS: Record<string, string> = {
    doctor: 'bg-emerald-100 text-emerald-800',
    student: 'bg-blue-100 text-blue-800',
    org: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
    user: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ayush-forest flex items-center gap-2">
            <Users className="w-7 h-7 text-ayush-gold" /> Registered Users
          </h1>
          <p className="text-ayush-charcoal/70 font-body text-sm mt-1">
            {users.length} total registered users. Manage accounts, roles and data.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-full border border-ayush-forest/10 shadow-sm self-start">
          {(['all', 'student', 'doctor', 'org', 'user'] as const).map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-4 py-1.5 rounded-full text-xs font-ui font-semibold capitalize transition-all ${
                filter === r ? 'bg-ayush-forest text-white' : 'text-ayush-charcoal/70 hover:text-ayush-forest'
              }`}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-ayush-forest' },
          { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'text-blue-600' },
          { label: 'Doctors', value: users.filter(u => u.role === 'doctor').length, color: 'text-emerald-600' },
          { label: 'Organizations', value: users.filter(u => u.role === 'org').length, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-ayush-charcoal/10 shadow-sm text-center">
            <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-ui text-ayush-charcoal/60 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ayush-forest/10 text-ayush-charcoal/60 font-ui">
          No users found {filter !== 'all' && `with role "${filter}"`}.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ayush-charcoal/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ayush-sage/30 border-b border-ayush-charcoal/10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider">Joined</th>
                  <th className="text-left px-6 py-4 text-xs font-ui font-bold text-ayush-forest uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ayush-charcoal/5">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-ayush-ivory/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ayush-forest to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-ui font-bold text-ayush-forest text-sm">{u.name || 'Unknown'}</p>
                          <p className="text-[10px] text-ayush-charcoal/40 font-ui">{u.id.slice(0, 16)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm font-ui text-ayush-charcoal/70">
                        <Mail className="w-3.5 h-3.5 text-ayush-gold" />{u.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role || 'user'}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-ayush-gold ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {['user', 'student', 'doctor', 'org', 'admin'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-ui text-ayush-charcoal/60">
                        <Calendar className="w-3.5 h-3.5" />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl font-ui text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-display font-bold text-ayush-forest mb-2">Delete User?</h3>
            <p className="text-sm text-ayush-charcoal/60 font-body mb-6">This will permanently remove the user account and profile data. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-ayush-charcoal/20 font-ui text-sm text-ayush-charcoal hover:bg-ayush-cream transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-ui text-sm font-semibold hover:bg-red-700 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
