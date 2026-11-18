import React, { useEffect, useState } from 'react';
import {
  Users,
  Trash2,
  Mail,
  Calendar,
  RefreshCw,
  Shield,
  Stethoscope,
  GraduationCap,
  Building2,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  type Profile,
  type UserRole,
  getAllProfilesAdmin,
  updateProfileRoleAdmin,
  inviteProfileRoleAdmin,
  deleteProfileAdmin,
  ROLE_LABELS,
} from '../../lib/api/profiles';
import { useAdmin } from '../../hooks/useAdmin';

interface RoleModalState {
  user: Profile;
  newRole: UserRole;
}

const AdminUsers: React.FC = () => {
  const { userEmail: adminEmail } = useAdmin();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'student' | 'doctor' | 'org' | 'admin'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState<RoleModalState | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllProfilesAdmin();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const filtered = users.filter((u) => {
    if (filter === 'all') return true;
    if (filter === 'student') return u.role === 'student' || u.role === 'user' || !u.role;
    return u.role === filter;
  });

  const handleDelete = async (id: string) => {
    await deleteProfileAdmin(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteId(null);
    showToast('User account removed successfully.');
  };

  const onSelectRole = (targetUser: Profile, newRole: UserRole) => {
    if (targetUser.role === newRole) return;
    setRoleModal({ user: targetUser, newRole });
  };

  // Option 1: Send invitation for user approval (Requested workflow)
  const handleSendInvite = async () => {
    if (!roleModal) return;
    const { user, newRole } = roleModal;

    const res = await inviteProfileRoleAdmin(user.id, newRole, adminEmail || 'Administrator');
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              pending_role: newRole,
              pending_role_invited_by: adminEmail || 'Administrator',
              pending_role_invited_at: new Date().toISOString(),
            }
          : u
      )
    );
    setRoleModal(null);
    showToast(res.message, 'success');
  };

  // Option 2: Admin Direct Override (Immediately activate)
  const handleApplyImmediate = async () => {
    if (!roleModal) return;
    const { user, newRole } = roleModal;

    await updateProfileRoleAdmin(user.id, newRole);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              role: newRole,
              pending_role: null,
            }
          : u
      )
    );
    setRoleModal(null);
    showToast(`Role updated immediately to "${ROLE_LABELS[newRole]}".`, 'success');
  };

  const ROLE_BADGES: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    doctor: { label: 'Practitioner', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: Stethoscope },
    student: { label: 'Student', bg: 'bg-blue-100', text: 'text-blue-800', icon: GraduationCap },
    user: { label: 'Student', bg: 'bg-blue-100', text: 'text-blue-800', icon: GraduationCap },
    org: { label: 'Organization', bg: 'bg-purple-100', text: 'text-purple-800', icon: Building2 },
    admin: { label: 'Admin', bg: 'bg-red-100', text: 'text-red-800', icon: Shield },
  };

  const studentCount = users.filter((u) => u.role === 'student' || u.role === 'user' || !u.role).length;
  const doctorCount = users.filter((u) => u.role === 'doctor').length;
  const orgCount = users.filter((u) => u.role === 'org').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6 animate-fade-in font-ui">
      {/* Toast Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm shadow-md transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ayush-forest flex items-center gap-2">
            <Users className="w-7 h-7 text-ayush-gold" /> Registered Users & Roles
          </h1>
          <p className="text-ayush-charcoal/70 font-body text-sm mt-1">
            {users.length} registered profiles. Assign roles with user confirmation or instant admin elevation.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={loadUsers}
            className="p-2.5 bg-white border border-ayush-forest/10 hover:bg-ayush-cream rounded-full text-ayush-forest transition-colors shadow-sm"
            title="Refresh Users List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-full border border-ayush-forest/10 shadow-sm overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'student', label: 'Students' },
              { id: 'doctor', label: 'Practitioners' },
              { id: 'org', label: 'Organizations' },
              { id: 'admin', label: 'Admins' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setFilter(r.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === r.id ? 'bg-ayush-forest text-white shadow-sm' : 'text-ayush-charcoal/70 hover:text-ayush-forest'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Students / Seekers', value: studentCount, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Doctors / Practitioners', value: doctorCount, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'Organizations', value: orgCount, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Administrators', value: adminCount, color: 'text-red-600', bg: 'bg-red-50/50' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white ${stat.bg} rounded-2xl p-4 sm:p-5 border border-ayush-charcoal/10 shadow-sm text-center`}>
            <p className={`text-2xl sm:text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-ayush-charcoal/70 mt-1 font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ayush-forest/10">
          <div className="w-8 h-8 border-4 border-ayush-forest border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-ayush-charcoal/60">Fetching live user profiles...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ayush-forest/10 text-ayush-charcoal/60">
          No users found {filter !== 'all' && `for category "${filter}"`}.
        </div>
      ) : (
        <div>
          {/* Mobile Card View (small screens) */}
          <div className="md:hidden space-y-4">
            {filtered.map((u) => {
              const badge = ROLE_BADGES[u.role] || ROLE_BADGES.student;
              const Icon = badge.icon;

              return (
                <div key={u.id} className="bg-white rounded-2xl p-5 border border-ayush-charcoal/10 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-ayush-forest to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.name || ''} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          u.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-ayush-forest text-sm truncate">{u.name || 'Anonymous User'}</p>
                        <p className="text-[10px] text-ayush-charcoal/40 font-mono truncate">{u.id.slice(0, 18)}...</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteId(u.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors flex-shrink-0"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-ayush-charcoal/5 text-xs text-ayush-charcoal/80">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-ayush-gold flex-shrink-0" />
                      <span className="truncate">{u.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-emerald-700 truncate">{u.whatsapp || u.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-ayush-gold flex-shrink-0" />
                      <span className="text-ayush-charcoal/60">
                        Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-ayush-charcoal/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-ayush-forest">Role:</span>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-ayush-forest/70" />
                        <select
                          value={u.role === 'user' ? 'student' : u.role || 'student'}
                          onChange={(e) => onSelectRole(u, e.target.value as UserRole)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-ayush-gold ${badge.bg} ${badge.text}`}
                        >
                          <option value="student">Student / Seeker</option>
                          <option value="doctor">Practitioner / Doctor</option>
                          <option value="org">Organization</option>
                          <option value="admin">System Admin</option>
                        </select>
                      </div>
                    </div>

                    {u.pending_role && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Pending User Approval: {ROLE_LABELS[u.pending_role]} ⏳</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block bg-white rounded-2xl border border-ayush-charcoal/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-ayush-sage/30 border-b border-ayush-charcoal/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-ayush-forest uppercase tracking-wider">User Profile</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-ayush-forest uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-ayush-forest uppercase tracking-wider">Mobile / Phone</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-ayush-forest uppercase tracking-wider">Assigned Role</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-ayush-forest uppercase tracking-wider">Joined On</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-ayush-forest uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ayush-charcoal/5">
                  {filtered.map((u) => {
                    const badge = ROLE_BADGES[u.role] || ROLE_BADGES.student;
                    const Icon = badge.icon;

                    return (
                      <tr key={u.id} className="hover:bg-ayush-ivory/40 transition-colors whitespace-nowrap">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ayush-forest to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt={u.name || ''} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                u.name?.charAt(0)?.toUpperCase() || 'U'
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-ayush-forest text-sm flex items-center gap-1.5">
                                {u.name || 'Anonymous User'}
                              </p>
                              <p className="text-[10px] text-ayush-charcoal/40 font-mono">{u.id.slice(0, 18)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-ayush-charcoal/80">
                            <Mail className="w-3.5 h-3.5 text-ayush-gold flex-shrink-0" />
                            {u.email || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            {u.whatsapp || u.phone || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-ayush-forest/70" />
                              <select
                                value={u.role === 'user' ? 'student' : u.role || 'student'}
                                onChange={(e) => onSelectRole(u, e.target.value as UserRole)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-ayush-gold ${badge.bg} ${badge.text}`}
                              >
                                <option value="student">Student / Seeker</option>
                                <option value="doctor">Practitioner / Doctor</option>
                                <option value="org">Organization</option>
                                <option value="admin">System Admin</option>
                              </select>
                            </div>
                            {u.pending_role && (
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending: {ROLE_LABELS[u.pending_role]} ⏳</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-ayush-charcoal/60">
                            <Calendar className="w-3.5 h-3.5 text-ayush-gold" />
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Modal (Supports user approval workflow) */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-ayush-charcoal/10 space-y-4">
            <div className="flex items-center justify-between border-b border-ayush-charcoal/10 pb-3">
              <h3 className="text-xl font-display font-bold text-ayush-forest flex items-center gap-2">
                <Shield className="w-5 h-5 text-ayush-gold" /> Assign User Role
              </h3>
              <button onClick={() => setRoleModal(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-ayush-sage/30 p-4 rounded-2xl text-xs space-y-1.5">
              <p className="text-ayush-charcoal/70">
                Target User: <strong className="text-ayush-forest">{roleModal.user.name || 'User'}</strong> ({roleModal.user.email || roleModal.user.id})
              </p>
              <p className="text-ayush-charcoal/70">
                Current Role: <span className="font-bold uppercase text-gray-700">{roleModal.user.role || 'user'}</span>
              </p>
              <p className="text-ayush-charcoal/70">
                New Role:{' '}
                <span className="font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {ROLE_LABELS[roleModal.newRole]}
                </span>
              </p>
            </div>

            <p className="text-xs text-ayush-charcoal/80 leading-relaxed">
              How would you like to apply this role change?
            </p>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleSendInvite}
                className="w-full p-4 rounded-2xl border-2 border-ayush-gold bg-amber-50/50 hover:bg-amber-100/60 transition-all text-left flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-ayush-gold/20 flex items-center justify-center text-ayush-forest shrink-0 mt-0.5">
                  <Send className="w-4 h-4 text-ayush-forest" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ayush-forest group-hover:text-amber-900">
                    Send Role Invitation (Recommended)
                  </h4>
                  <p className="text-xs text-ayush-charcoal/70 mt-0.5">
                    User will see a notification asking <em>"Do you accept the role of {ROLE_LABELS[roleModal.newRole]}?"</em>. The role activates when they click Accept.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleApplyImmediate}
                className="w-full p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all text-left flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Direct Admin Elevation</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Immediately assigns the role without waiting for user confirmation.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setRoleModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-display font-bold text-ayush-forest mb-2">Delete User Account?</h3>
            <p className="text-sm text-ayush-charcoal/60 font-body mb-6">
              This will permanently delete the user profile and data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-ayush-charcoal/20 text-sm text-ayush-charcoal hover:bg-ayush-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
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
