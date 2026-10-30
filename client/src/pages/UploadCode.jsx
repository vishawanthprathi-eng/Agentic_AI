import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileCode, CheckCircle2, AlertTriangle, Cpu, 
  Sparkles, ArrowRight, Play, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import { codeAPI } from '../services/api';

const CODE_PRESETS = [
  {
    label: '🟢 Safe Auth Token Validator',
    fileName: 'jwtValidator.js',
    code: `const jwt = require('jsonwebtoken');

function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

module.exports = { verifyToken };`
  },
  {
    label: '🔴 Critical SQL Injection Flaw',
    fileName: 'userLookup.js',
    code: `const db = require('./database');

// Insecure lookup vulnerable to injection
async function findUserBySearch(searchKeyword) {
  const query = "SELECT id, email, role FROM users WHERE email LIKE '%" + searchKeyword + "%'";
  const results = await db.raw(query);
  return results;
}

module.exports = { findUserBySearch };`
  },
  {
    label: '🔴 Infinite Loop / Resource Starvation',
    fileName: 'dataProcessor.js',
    code: `function processBatches(queue) {
  let processed = 0;
  // Missing termination check when queue does not shrink
  while (true) {
    if (processed > 100000) {
      console.log("Too large");
    }
    // Infinite loop because queue length never changes
  }
}`
  }
];

export default function UploadCode() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Verification states
  const [verifying, setVerifying] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const agentSteps = [
    'Parsing AST & Syntax Grammar...',
    'Performing Autonomous Security & Vulnerability Audit...',
    'Synthesizing Dynamic Test Cases & Edge Conditions...',
    'Compiling Verification Verdict & Syncing Team Activity...'
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCodeContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const loadPreset = (preset) => {
    setFileName(preset.fileName);
    setCodeContent(preset.code);
    setVerificationResult(null);
    setError('');
  };

  const handleVerifyAndSync = async () => {
    if (!fileName.trim()) {
      setError('Please provide a file name (e.g., authService.js)');
      return;
    }
    if (!codeContent.trim()) {
      setError('Code content cannot be empty.');
      return;
    }

    setError('');
    setVerifying(true);
    setVerificationResult(null);
    setAgentStep(0);

    // Dynamic agent animation
    const stepInterval = setInterval(() => {
      setAgentStep((prev) => (prev < agentSteps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const response = await codeAPI.uploadCode({
        file_name: fileName,
        code_content: codeContent
      });

      clearInterval(stepInterval);
      setVerificationResult(response.data);
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err.response?.data?.message || 'Verification process encountered an error';
      setError(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
          <Cpu className="w-4 h-4" />
          Autonomous Code Pipeline
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Upload & Autonomous AI Verification
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          No Git conflicts, no manual pull request blockers. Drop code and let the AI agent inspect, simulate tests, and verify safety on the fly.
        </p>
      </div>

      {/* Preset Templates */}
      <div className="mb-6 p-4 rounded-xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Quick Test Presets (Click to Load):
        </div>
        <div className="flex flex-wrap gap-2">
          {CODE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(p)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Upload & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Metadata & Drag-Drop */}
        <div className="lg:col-span-1 space-y-5">
          
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              File Name & Extension
            </label>
            <div className="relative">
              <FileCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g., authController.js"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Supports JS, TS, Python, Java, Go, C++, SQL, HTML, etc.
            </p>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-500/10 scale-102' 
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-slate-200">
              Drag & Drop code file here
            </div>
            <div className="text-xs text-slate-400 mt-1">
              or click to browse local files
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleVerifyAndSync}
            disabled={verifying}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Agent Inspecting Code...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Verify & Sync with AI Agent</span>
              </>
            )}
          </button>

        </div>

        {/* Right: Code Editor Box */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[520px]">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 font-medium text-slate-400">
                  {fileName || 'untitled_snippet'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {codeContent ? `${codeContent.split('\n').length} lines` : '0 lines'}
              </span>
            </div>

            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="// Paste your code snippet here or drag a file...&#10;function teamTask() {&#10;  console.log('Autonomous verification enabled');&#10;}"
              className="w-full flex-1 p-4 bg-[#0d1117] text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none placeholder-slate-600"
              spellCheck="false"
            />
          </div>
        </div>

      </div>

      {/* Autonomous Verification Progress Modal / Overlay */}
      {verifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel-glow border border-indigo-500/30 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 animate-glow">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Autonomous AI Agent in Action
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Google Gemini Autonomous Inspection Engine
            </p>

            {/* Stepper */}
            <div className="space-y-3 text-left">
              {agentSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {idx < agentStep ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : idx === agentStep ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                  )}
                  <span className={idx <= agentStep ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspection Result Presentation */}
      {verificationResult && (
        <div className="mt-8 p-6 rounded-2xl glass-panel-glow border border-slate-700 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">
                  Verification Complete for "{verificationResult.code.file_name}"
                </h3>
                {verificationResult.code.ai_status === 'verified' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" /> VERIFIED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    <AlertTriangle className="w-4 h-4" /> BUGGED / ACTION REQUIRED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Synced to team hub and recorded in collaborative activity log.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/member-dashboard')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2"
              >
                <span>View in Member Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Feedback Report Preview */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">
              Autonomous AI Inspection Report:
            </h4>
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
              {verificationResult.code.ai_feedback}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
