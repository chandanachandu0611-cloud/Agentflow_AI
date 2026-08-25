import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AppShell from '../../components/layout/AppShell';
import { useAuthStore } from '../../store/authStore';
import { useWorkflowStore } from '../../store/workflowStore';
import PromptInputPanel from '../../components/AIBuilder/PromptInputPanel';
import GraphPreviewPanel from '../../components/AIBuilder/GraphPreviewPanel';
import { Sparkles, ArrowLeft, Bot, Wand2, Layers } from 'lucide-react';

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { generateWorkflowGraph, createWorkflow, updateWorkflow } = useWorkflowStore();

  const [prompt, setPrompt] = useState(
    'When a lead webhook is received, analyze with Gemini AI to score priority. If score is high, send email notification and post Slack alert.'
  );
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);

    const res = await generateWorkflowGraph(prompt);
    setIsGenerating(false);

    if (res.success && res.workflow) {
      setGeneratedWorkflow(res.workflow);
    } else {
      setErrorMsg(res.error || 'Failed to compile workflow graph from prompt.');
    }
  };

  const handleLaunchCanvas = async () => {
    if (!generatedWorkflow) return;
    setIsLaunching(true);

    const res = await createWorkflow({
      name: generatedWorkflow.name || 'AI Generated Automation Pipeline',
      description: generatedWorkflow.description || `Compiled for prompt: "${prompt}"`,
      tags: generatedWorkflow.tags || ['ai-generated', 'automation'],
      triggerConfig: generatedWorkflow.triggerConfig || { type: 'manual' },
      status: 'draft'
    });

    if (res.success && res.workflow) {
      const id = res.workflow._id || res.workflow.id;
      // Update nodes & edges into the created workflow
      await updateWorkflow(id, {
        nodes: generatedWorkflow.nodes || [],
        edges: generatedWorkflow.edges || []
      });
      router.push(`/workflows/${id}`);
    } else {
      setIsLaunching(false);
      setErrorMsg('Failed to initialize workflow canvas.');
    }
  };

  if (authLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/workflows"
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span>AI Spec-Driven Builder</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 ml-9">
            Transform plain-English natural language prompts into executable multi-agent React Flow graphs.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[550px]">
        {/* Left Input Panel */}
        <PromptInputPanel
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          provider={generatedWorkflow?.provider}
        />

        {/* Right Graph Preview Panel */}
        <GraphPreviewPanel
          workflow={generatedWorkflow}
          onLaunchCanvas={handleLaunchCanvas}
          isLaunching={isLaunching}
        />
      </div>
    </AppShell>
  );
}
