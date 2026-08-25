import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useWorkflowStore } from '../../store/workflowStore';
import { useExecutionStore } from '../../store/executionStore';
import NodePalette from '../../components/NodePalette/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import {
  ArrowLeft,
  Save,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    currentWorkflow,
    fetchWorkflowById,
    saveCurrentWorkflow,
    updateCurrentWorkflowMetadata,
    isLoading,
    isSaving,
    saveStatus,
    error
  } = useWorkflowStore();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('draft');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (id && isAuthenticated) {
      fetchWorkflowById(id).then((res) => {
        if (res && res.workflow) {
          setTitle(res.workflow.name || 'New Custom Workflow');
          setStatus(res.workflow.status || 'draft');
        }
      });
    }
  }, [id, authLoading, isAuthenticated, fetchWorkflowById, router]);

  useEffect(() => {
    if (currentWorkflow) {
      setTitle(currentWorkflow.name || 'New Custom Workflow');
      setStatus(currentWorkflow.status || 'draft');
    }
  }, [currentWorkflow]);

  const handleSave = async () => {
    console.log('[WorkflowBuilder] Manual save initiated...');
    await saveCurrentWorkflow();
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    updateCurrentWorkflowMetadata({ name: val });
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatus(val);
    updateCurrentWorkflowMetadata({ status: val });
  };

  const handleRun = async () => {
    if (!id) return;
    setIsRunning(true);
    console.log(`[WorkflowBuilder] 1. Actively saving workflow (${id}) before execution...`);

    // Step 1: Save current workflow canvas state to backend
    await saveCurrentWorkflow();

    console.log(`[WorkflowBuilder] 2. Triggering execution endpoint: POST /api/workflows/${id}/execute`);

    try {
      // Step 2: Trigger execution endpoint
      const response = await api.post(`/workflows/${id}/execute`);
      console.log('[WorkflowBuilder] Execution launched successfully:', response.data);

      const execution = response.data.execution;
      const execId = execution._id || execution.id;

      setIsRunning(false);
      // Redirect immediately to live execution stream
      router.push(`/executions/${execId}`);
    } catch (err) {
      console.warn('[WorkflowBuilder] Direct workflow execute failed, attempting executionStore fallback...', err);

      // Fallback via executionStore
      const { runWorkflow } = useExecutionStore.getState();
      const res = await runWorkflow(id);
      setIsRunning(false);

      if (res.success && res.execution) {
        const execId = res.execution._id || res.execution.id;
        router.push(`/executions/${execId}`);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading Workflow Canvas...</p>
      </div>
    );
  }

  if (error && !currentWorkflow) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-slate-400 p-4">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Workflow Load Error</h3>
          <p className="text-xs text-slate-400 mb-6">{error}</p>
          <Link
            href="/workflows"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Workflows</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Builder Toolbar */}
      <header className="h-16 border-b border-slate-800 bg-[#121723]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/workflows"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Back to Workflows"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Workflow Name..."
              className="bg-transparent text-base font-bold text-white focus:outline-none focus:bg-slate-800/60 px-2 py-1 rounded-lg border border-transparent focus:border-slate-700 transition-colors"
            />

            <select
              value={status}
              onChange={handleStatusChange}
              className="bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Right: Save Status & Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Save Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
            {saveStatus === 'saving' && (
              <span className="text-amber-400 flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-rose-400 flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>Save Error</span>
              </span>
            )}
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            <span>{isRunning ? 'Launching...' : 'Run Workflow'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            <span>Save Workflow</span>
          </button>
        </div>
      </header>

      {/* Main Builder Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Palette */}
        <NodePalette />

        {/* Center Canvas */}
        <main className="flex-1 relative h-full">
          <WorkflowCanvas />
        </main>

        {/* Right Configuration Panel */}
        <NodeConfigPanel />
      </div>
    </div>
  );
}
