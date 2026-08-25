import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/layout/AppShell';
import { useAuthStore } from '../../store/authStore';
import { useExecutionStore } from '../../store/executionStore';
import {
  PlaySquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Workflow,
  Search,
  ArrowRight,
  Activity,
  User,
  Layers,
  Bot
} from 'lucide-react';

export default function ExecutionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { executions, fetchExecutions, isLoading } = useExecutionStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchExecutions();
    }
  }, [authLoading, isAuthenticated, fetchExecutions, router]);

  const totalRuns = executions.length;
  const completedRuns = executions.filter((e) => e.status === 'COMPLETED').length;
  const failedRuns = executions.filter((e) => e.status === 'FAILED').length;
  const runningRuns = executions.filter((e) => e.status === 'RUNNING').length;
  const successRate = totalRuns > 0 ? ((completedRuns / totalRuns) * 100).toFixed(1) : '100.0';
  const avgDuration =
    totalRuns > 0 ? Math.round(executions.reduce((acc, e) => acc + (e.duration || 0), 0) / totalRuns) : 0;

  const filteredExecutions = executions.filter((exec) => {
    const wfName = exec.workflowId?.name || exec.workflowSnapshot?.name || 'Workflow';
    const matchesSearch = wfName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <Activity size={14} className="text-emerald-400 animate-pulse" />
            <span>Live Multi-Agent Pipeline Logger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Workflow Executions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor real-time agent execution chains, timeline logs, and status transitions.
          </p>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Executions</span>
            <PlaySquare size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{totalRuns}</div>
          <div className="text-[10px] text-slate-500 mt-1">{runningRuns} active running</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Success Rate</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">{successRate}%</div>
          <div className="text-[10px] text-slate-500 mt-1">{completedRuns} completed successfully</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Avg Execution Time</span>
            <Clock size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{avgDuration}ms</div>
          <div className="text-[10px] text-slate-500 mt-1">Topological DAG speed</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Failure Breakdown</span>
            <AlertCircle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{failedRuns}</div>
          <div className="text-[10px] text-slate-500 mt-1">Auto-recovery self-healed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by workflow name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'RUNNING', 'COMPLETED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Executions Table / Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading execution logs...</p>
        </div>
      ) : filteredExecutions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <PlaySquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Executions Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {search || statusFilter !== 'all'
              ? 'No execution records match your search filters.'
              : 'You have not run any workflow executions yet. Open a workflow in the builder and click "Run Workflow" to trigger multi-agent pipeline execution.'}
          </p>
          <button
            onClick={() => router.push('/workflows')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Workflow size={16} />
            <span>Go to Workflows</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExecutions.map((exec) => {
            const id = exec._id || exec.id;
            const wfName = exec.workflowId?.name || exec.workflowSnapshot?.name || 'Autonomous Workflow';
            const nodeCount = exec.workflowSnapshot?.nodes?.length || 0;

            return (
              <div
                key={id}
                onClick={() => router.push(`/executions/${id}`)}
                className="glass-card group p-4 md:p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      exec.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : exec.status === 'RUNNING'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {exec.status === 'COMPLETED' && <CheckCircle2 size={20} />}
                    {exec.status === 'RUNNING' && <Loader2 size={20} className="animate-spin" />}
                    {exec.status === 'FAILED' && <AlertCircle size={20} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight">
                        {wfName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          exec.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : exec.status === 'RUNNING'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{exec.status}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        ID: {id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers size={13} className="text-indigo-400" />
                        <span>{nodeCount} Nodes</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-500" />
                        <span>{new Date(exec.createdAt || Date.now()).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/60">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Duration</div>
                    <div className="text-xs font-mono font-semibold text-slate-200">
                      {exec.duration ? `${exec.duration}ms` : exec.status === 'RUNNING' ? 'Running...' : '-'}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
