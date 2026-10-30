import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCode, CheckCircle2, AlertTriangle, Clock, UploadCloud, 
  Search, Filter, RefreshCw, Eye, Sparkles, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { codeAPI } from '../services/api';
import CodeModal from '../components/CodeModal';

export default function MemberDashboard({ user }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCode, setSelectedCode] = useState(null);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const res = await codeAPI.getMyUploads();
      setUploads(res.data.uploads || []);
    } catch (err) {
      console.error('Error fetching member uploads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const total = uploads.length;
  const verified = uploads.filter((u) => u.ai_status === 'verified').length;
  const bugged = uploads.filter((u) => u.ai_status === 'bugged').length;
  const pending = uploads.filter((u) => u.ai_status === 'pending').length;
  const passRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  // Filtered uploads
  const filteredUploads = uploads.filter((item) => {
    const matchesSearch = item.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.ai_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReverified = (updatedCode) => {
    setUploads((prev) => prev.map((u) => (u.id === updatedCode.id ? updatedCode : u)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Developer Workspace
            </span>
            <span className="text-xs text-slate-400">• {user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Member Code Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your autonomous code verification verdicts, inspect AI debug reports, and maintain code quality without Git branch overhead.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUploads}
            className="p-2.5 rounded-xl glass-panel border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            title="Refresh Uploads"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New Code
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Uploads</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Submitted snippets & files</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Verified</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{verified}</div>
          <div className="text-[11px] text-slate-400 mt-1">Passed all agent audits</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bugs Flagged</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">{bugged}</div>
          <div className="text-[11px] text-slate-400 mt-1">Issues requiring revision</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Health Pass Rate</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{passRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Automated code readiness</div>
        </div>

      </div>

      {/* Uploads List Header & Filters */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            My Uploaded Code Artifacts
          </h2>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified Only</option>
                <option value="bugged">Bugged Only</option>
                <option value="pending">Pending Only</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-sm">Loading your code uploads...</p>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileCode className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No code artifacts match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              {uploads.length === 0
                ? "You haven't uploaded any code snippets yet. Try uploading one now!"
                : "No files match the search or filter selection."}
            </p>
            {uploads.length === 0 && (
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Your First Code
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">File Name</th>
                  <th className="px-6 py-3.5 font-semibold">AI Verification Verdict</th>
                  <th className="px-6 py-3.5 font-semibold">Lines / Size</th>
                  <th className="px-6 py-3.5 font-semibold">Uploaded</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredUploads.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5 font-medium text-slate-200">
                        <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-mono text-xs">{item.file_name}</span>
                      </div>
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

                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {item.code_content ? `${item.code_content.split('\n').length} lines` : 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCode(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect AI Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Code Modal Inspection */}
      {selectedCode && (
        <CodeModal
          code={selectedCode}
          onClose={() => setSelectedCode(null)}
          onReverified={handleReverified}
        />
      )}

    </div>
  );
}
