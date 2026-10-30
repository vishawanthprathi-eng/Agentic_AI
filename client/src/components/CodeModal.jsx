import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, Copy, Check, RefreshCw, FileCode } from 'lucide-react';
import { codeAPI } from '../services/api';

export default function CodeModal({ code, onClose, onReverified }) {
  const [copied, setCopied] = useState(false);
  const [isReverifying, setIsReverifying] = useState(false);
  const [currentCode, setCurrentCode] = useState(code);

  if (!currentCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode.code_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReverify = async () => {
    setIsReverifying(true);
    try {
      const res = await codeAPI.reverifyCode(currentCode.id);
      if (res.data.success) {
        setCurrentCode(res.data.code);
        if (onReverified) onReverified(res.data.code);
      }
    } catch (err) {
      console.error('Failed to reverify code:', err);
    } finally {
      setIsReverifying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VERIFIED
          </span>
        );
      case 'bugged':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            BUGGED / ISSUES FOUND
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            PENDING VERIFICATION
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {currentCode.file_name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>Uploaded: {new Date(currentCode.created_at).toLocaleString()}</span>
                {currentCode.users && (
                  <span>• Author: <strong className="text-slate-300">{currentCode.users.email}</strong></span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(currentCode.ai_status)}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* AI Feedback Report Card */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 relative">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                Autonomous AI Agent Inspection Report
              </h4>
              <button
                onClick={handleReverify}
                disabled={isReverifying}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReverifying ? 'animate-spin' : ''}`} />
                {isReverifying ? 'Verifying...' : 'Re-run AI Agent'}
              </button>
            </div>

            <div className="prose prose-invert max-w-none text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-black/40 p-4 rounded-lg border border-slate-800/80">
              {currentCode.ai_feedback || 'No feedback recorded yet.'}
            </div>
          </div>

          {/* Code Viewer Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Uploaded Source Code
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Code'}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117]">
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-72">
                <code>{currentCode.code_content}</code>
              </pre>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
}
