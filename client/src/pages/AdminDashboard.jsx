import React, { useState, useEffect } from 'react';
import { 
  Users, LayoutDashboard, Shield, ShieldAlert, CheckCircle2, 
  AlertTriangle, Clock, Activity, RefreshCw, UserPlus, Eye, 
  Search, ArrowUpRight, BarChart3, FileCode, Check
} from 'lucide-react';
import { adminAPI, getApiErrorMessage } from '../services/api';
import { StatusDistributionChart, MemberContributionChart } from '../components/ActivityChart';
import CodeModal from '../components/CodeModal';

export default function AdminDashboard({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [allUploads, setAllUploads] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'members' | 'code' | 'logs'

  // Add Member Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  // Code inspection modal
  const [selectedCode, setSelectedCode] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, usersRes, uploadsRes, logsRes] = await Promise.all([
        adminAPI.getMetrics(),
        adminAPI.getUsers(),
        adminAPI.getAllUploads(),
        adminAPI.getActivityLogs()
      ]);

      setMetrics(metricsRes.data.metrics);
      setUsersList(usersRes.data.users || []);
      setAllUploads(uploadsRes.data.uploads || []);
      setActivityLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert('Failed to update role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setCreatingUser(true);

    try {
      const res = await adminAPI.createUser({
        email: newEmail,
        password: newPassword,
        role: newRole
      });
      setModalSuccess(`Team member ${res.data.user.email} created!`);
      setNewEmail('');
      setNewPassword('');
      fetchAdminData();
      setTimeout(() => {
        setShowAddUserModal(false);
        setModalSuccess('');
      }, 1500);
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Failed to create user'));
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Admin Control Center
            </span>
            <span className="text-xs text-slate-400">• Real-Time Team Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Management & AI Insights
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor team velocity, inspect autonomous code verification verdicts, manage members, and track activity audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl glass-panel border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Admin Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Executive Overview & Visuals
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Team Members ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'code'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          All Code Uploads ({allUploads.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Activity Logs ({activityLogs.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mt-2">{metrics?.totalUsers ?? 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Active team collaborators</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Uploads</span>
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <FileCode className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mt-2">{metrics?.totalUploads ?? 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Across all project members</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Pass Rate</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-2">{metrics?.passRate ?? 0}%</div>
              <div className="text-[11px] text-slate-400 mt-1">{metrics?.verifiedCount ?? 0} verified snippets</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Action Required</span>
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-400 mt-2">{metrics?.buggedCount ?? 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Bugged or insecure submissions</div>
            </div>

          </div>

          {/* Visualizations (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Donut Chart: AI Status Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Verification Distribution</h3>
                  <p className="text-xs text-slate-400">Breakdown of verified vs bugged code snippets</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <StatusDistributionChart data={metrics?.statusDistribution} />
              </div>
            </div>

            {/* Bar Chart: Member Activity Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Member Contributions & Pass Rates</h3>
                  <p className="text-xs text-slate-400">Verified vs bugged uploads per collaborator</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <MemberContributionChart data={metrics?.memberStats} />
              </div>
            </div>

          </div>

          {/* Recent Live Activity Stream Teaser */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Recent Collaborative Activity Stream
              </h3>
              <button
                onClick={() => setActiveTab('logs')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View Full Audit Log →
              </button>
            </div>
            
            <div className="space-y-3">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span className="text-slate-200 font-medium">{log.action_description}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM MEMBERS MANAGEMENT */}
      {activeTab === 'members' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Team Directory & Permissions
            </h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">User Email</th>
                  <th className="px-6 py-3.5 font-semibold">System Role</th>
                  <th className="px-6 py-3.5 font-semibold">Total Uploads</th>
                  <th className="px-6 py-3.5 font-semibold">Verified Rate</th>
                  <th className="px-6 py-3.5 font-semibold">Joined Date</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {usersList.map((u) => {
                  const passRate = u.totalUploads > 0 ? Math.round((u.verifiedUploads / u.totalUploads) * 100) : 0;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono">
                        {u.totalUploads || 0}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {passRate}% ({u.verifiedUploads || 0} passed)
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.id === user?.id ? (
                          <span className="text-[11px] text-slate-500 italic">Current Session</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="member">Set as Member</option>
                            <option value="admin">Promote to Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL CODE UPLOADS */}
      {activeTab === 'code' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              Global Team Code Submissions
            </h2>
            <span className="text-xs text-slate-400">
              Total {allUploads.length} files reviewed by AI
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">File Name</th>
                  <th className="px-6 py-3.5 font-semibold">Author</th>
                  <th className="px-6 py-3.5 font-semibold">AI Status</th>
                  <th className="px-6 py-3.5 font-semibold">Uploaded</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {allUploads.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-200">
                      {item.file_name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {item.users?.email || 'Unknown Member'}
                    </td>
                    <td className="px-6 py-4">
                      {item.ai_status === 'verified' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {item.ai_status === 'bugged' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          Bugged
                        </span>
                      )}
                      {item.ai_status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3 animate-spin" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCode(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY LOGS AUDIT TRAIL */}
      {activeTab === 'logs' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Complete System Activity Logs
            </h2>
            <span className="text-xs text-slate-400">
              Immutable audit stream
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 sm:px-6 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">
                      {log.action_description}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Attributed User: <strong className="text-slate-300">{log.users?.email || 'System'}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-mono text-right">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              Add New Team Member
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Create credentials for a collaborator to access the hub.
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@project.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Project Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Modal */}
      {selectedCode && (
        <CodeModal
          code={selectedCode}
          onClose={() => setSelectedCode(null)}
          onReverified={(updated) => {
            setAllUploads((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
          }}
        />
      )}

    </div>
  );
}
