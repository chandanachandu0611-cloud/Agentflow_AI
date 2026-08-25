import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/layout/AppShell';
import { useAuthStore } from '../../store/authStore';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  Workflow,
  Plus,
  Search,
  SlidersHorizontal,
  PlaySquare,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  Sparkles,
  ArrowRight,
  Layers
} from 'lucide-react';

export default function WorkflowsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { workflows, fetchWorkflows, createWorkflow, deleteWorkflow, isLoading, error } = useWorkflowStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchWorkflows().catch((err) => {
        console.warn('Workflows fetch error handled gracefully:', err);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, fetchWorkflows, router]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWfName.trim()) return;
    setIsCreating(true);
    const result = await createWorkflow({
      name: newWfName,
      description: newWfDesc,
      status: 'draft'
    });
    setIsCreating(false);
    if (result.success && result.workflow) {
      setShowCreateModal(false);
      setNewWfName('');
      setNewWfDesc('');
      router.push(`/workflows/${result.workflow._id || result.workflow.id}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflow(id);
    }
  };

  const filteredWorkflows = workflows.filter((wf) => {
    const matchesSearch =
      wf.name.toLowerCase().includes(search.toLowerCase()) ||
      (wf.description && wf.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || wf.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Authenticating...</span>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Workflow size={14} className="text-indigo-400" />
            <span>Workflow Orchestration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Workflows Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Build, edit, and manage multi-agent automation pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/workflows/builder')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 font-semibold text-slate-200 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles size={16} className="text-indigo-400" />
            <span>AI Prompt Builder</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 font-semibold text-white text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search workflows by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'active', 'draft', 'paused'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows List Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading workflows...</p>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Workflow size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Workflows Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {search || statusFilter !== 'all'
              ? 'No workflows match your search filters.'
              : 'You have not created any automated workflows yet. Click below to create your first visual workflow.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            <span>Create Workflow</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((wf) => {
            const id = wf._id || wf.id;
            const nodeCount = wf.nodes?.length || 0;
            const edgeCount = wf.edges?.length || 0;

            return (
              <div
                key={id}
                onClick={() => router.push(`/workflows/${id}`)}
                className="glass-card group p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden"
              >
                <div>
                  {/* Status & Version Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        wf.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : wf.status === 'draft'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span className="capitalize">{wf.status || 'draft'}</span>
                    </span>

                    <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                      v{wf.version || 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight mb-1.5 line-clamp-1">
                    {wf.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {wf.description || 'No description provided for this workflow.'}
                  </p>
                </div>

                <div>
                  {/* Stats Footer */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Layers size={13} className="text-indigo-400" />
                        <span>{nodeCount} Nodes</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-500" />
                        <span>{new Date(wf.updatedAt || Date.now()).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDelete(id, e)}
                      title="Delete Workflow"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Create New Workflow</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Initialize a canvas for assembling multi-agent automation steps.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Qualification & Email Dispatch"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the target purpose of this pipeline..."
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Launch Canvas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
