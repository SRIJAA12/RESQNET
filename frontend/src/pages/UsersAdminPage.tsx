import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AdminUser } from '../types';
import { 
  Users, 
  Plus, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  UserX,
  Lock,
  Edit2
} from 'lucide-react';

export const UsersAdminPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit Role Modal
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<AdminUser['role']>('responder');
  const [editStatus, setEditStatus] = useState<AdminUser['status']>('active');
  const [savingEdit, setSavingEdit] = useState(false);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'dispatcher' as AdminUser['role'],
    organization: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSavingEdit(true);
      await api.updateUserRole(selectedUser.id, editRole, editStatus);
      await loadData();
      setSelectedUser(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.name.trim() || !createForm.email.trim()) {
      setCreateError('Name and email are required.');
      return;
    }

    try {
      setCreating(true);
      await api.createUser(createForm);
      await loadData();
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        role: 'dispatcher',
        organization: '',
      });
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organization.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan/15 text-cyan font-mono text-[10px] font-bold uppercase tracking-wider border border-cyan/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              RBAC DIRECTORY & ACCESS CONTROL
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            User Accounts & Security Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-0.5">
            Role-based authorization and organization assignment for commanders, responders, and NGO partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Provision User Credential</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan transition-colors"
            title="Refresh directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or organization..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="dispatcher">Dispatcher (Commander)</option>
            <option value="responder">Tactical Responder</option>
            <option value="partner">Relief Partner</option>
            <option value="admin">System Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Organization Affiliation</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan" />
                    Querying credentials directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isActive = u.status === 'active';
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm font-sans">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : u.role === 'dispatcher'
                              ? 'bg-cyan/20 text-cyan border-cyan/40'
                              : u.role === 'responder'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-300 font-sans">
                        {u.organization}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(u.last_login_at).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setEditRole(u.role);
                            setEditStatus(u.status);
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Permissions
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan/40 p-6 space-y-4 shadow-modal">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Modify Permissions</h3>
                <p className="text-cyan text-xs">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Assigned Security Role *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan cursor-pointer"
                >
                  <option value="dispatcher">Dispatcher (Command Operations)</option>
                  <option value="responder">Tactical Responder (Field Unit)</option>
                  <option value="partner">Relief Partner (Scoped NGO)</option>
                  <option value="admin">System Administrator (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Credential Status *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan cursor-pointer"
                >
                  <option value="active">Active (Granted Access)</option>
                  <option value="suspended">Suspended (Access Revoked)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 space-y-1">
                <strong>Consequential Change:</strong> Modifying roles changes accessible routes and audit trail accountability. Revoking access blocks all authentication tokens immediately.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-bold shadow-md"
                >
                  {savingEdit ? 'Updating...' : 'Commit Permission Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan/40 p-6 space-y-4 shadow-modal">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Provision New User Account</h3>
                <p className="text-cyan text-xs">RBAC Credential Authority</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-red-200">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Commander Sarah Vance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan font-sans"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="e.g. s.vance@resqnet.gov"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Security Role
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan cursor-pointer"
                  >
                    <option value="dispatcher">Dispatcher</option>
                    <option value="responder">Responder</option>
                    <option value="partner">Relief Partner</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={createForm.organization}
                    onChange={(e) => setCreateForm({ ...createForm, organization: e.target.value })}
                    placeholder="e.g. Red Cross Logistics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-bold shadow-md"
                >
                  {creating ? 'Provisioning...' : 'Provision Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
