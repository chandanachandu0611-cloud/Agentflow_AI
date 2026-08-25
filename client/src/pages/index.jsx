import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../components/layout/AppShell';
import { useAuthStore } from '../store/authStore';
import {
  Workflow,
  Cpu,
  Bot,
  Zap,
  Play,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading Agentflow_AI...</span>
        </div>
      </div>
    );
  }

  const agents = [
    { name: 'Planner Agent', role: 'DAG Ordering & Confidence', status: 'Ready', color: 'text-indigo-400' },
    { name: 'Execution Agent', role: 'Action Dispatcher', status: 'Ready', color: 'text-cyan-400' },
    { name: 'Validation Agent', role: 'Schema Asserts', status: 'Ready', color: 'text-emerald-400' },
    { name: 'Recovery Agent', role: 'Auto-retry & Self-heal', status: 'Ready', color: 'text-violet-400' },
    { name: 'Monitoring Agent', role: 'Socket.IO Timeline Logger', status: 'Active', color: 'text-amber-400' },
  ];

  return (
    <AppShell>
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 mb-8 overflow-hidden bg-gradient-to-r from-indigo-900/40 via-violet-900/20 to-slate-900/80 border border-indigo-500/20">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Zap size={14} className="text-indigo-400" />
            <span>Phase 2 Visual Builder Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'Operator'}!
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Agentflow_AI is ready to orchestrate multi-agent workflow pipelines. Create new workflows, assemble drag-and-drop React Flow nodes, or configure agent parameters.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/workflows')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 font-semibold text-white text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Workflows Builder</span>
            </button>
            <button
              onClick={() => router.push('/workflows')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 font-medium text-slate-200 text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Workflow size={16} className="text-indigo-400" />
              <span>View All Workflows</span>
            </button>
          </div>
        </div>

        <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none hidden lg:block">
          <Cpu size={240} className="text-indigo-400" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Workflows', value: '3', icon: Workflow, change: '+1 today', color: 'indigo' },
          { label: 'Total Executions', value: '128', icon: Play, change: '100% success rate', color: 'emerald' },
          { label: 'Registered Agents', value: '5', icon: Bot, change: 'All online', color: 'violet' },
          { label: 'Connected Integrations', value: '4', icon: Layers, change: 'OAuth active', color: 'cyan' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
                <div className="p-2 rounded-xl bg-slate-800/80 text-indigo-400 border border-slate-700/50">
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agents Pipeline & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registered Agents */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span>Multi-Agent System Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400">Autonomous agents registered for workflow compilation & recovery</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              5/5 Operational
            </span>
          </div>

          <div className="space-y-3">
            {agents.map((agent, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-xs font-bold text-indigo-400">
                    0{idx + 1}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${agent.color}`}>{agent.name}</div>
                    <div className="text-xs text-slate-400">{agent.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-slate-300">{agent.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick System Info */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet-400" />
              <span>Environment Status</span>
            </h2>
            <p className="text-xs text-slate-400 mb-5">System status & active authentication state</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 font-medium">Authentication</div>
                <div className="text-slate-200 font-semibold mt-0.5">JWT Bearer Auth</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 font-medium">User Email</div>
                <div className="text-indigo-300 font-mono font-medium mt-0.5 truncate">{user?.email}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 font-medium">User Role</div>
                <div className="text-slate-200 font-semibold mt-0.5 capitalize">{user?.role}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-500" />
              <span>Server Port: 5000</span>
            </span>
            <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
              v1.0.0 Phase 1 <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
