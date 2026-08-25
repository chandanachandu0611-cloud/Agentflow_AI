import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider
} from '@xyflow/react';
import { useAuthStore } from '../../store/authStore';
import { useExecutionStore } from '../../store/executionStore';
import { TriggerNode, ActionNode, AINode, LogicNode } from '../../components/WorkflowCanvas/CustomNodes';
import {
  ArrowLeft,
  Clock,
  Terminal,
  Bot,
  BrainCircuit,
  ShieldCheck,
  RotateCw,
  Activity,
  Loader2
} from 'lucide-react';

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  aiNode: AINode,
  logicNode: LogicNode
};

const agentColorMap = {
  planner: { name: 'Planner Agent', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: BrainCircuit },
  execution: { name: 'Execution Agent', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: Bot },
  validation: { name: 'Validation Agent', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: ShieldCheck },
  recovery: { name: 'Recovery Agent', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: RotateCw },
  monitoring: { name: 'Monitoring Agent', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Activity }
};

function ExecutionCanvasContent({ nodes, edges, nodeStatuses }) {
  const styledNodes = nodes.map((node) => {
    const status = nodeStatuses[node.id];
    let borderStyle = '';
    if (status === 'RUNNING') {
      borderStyle = 'ring-4 ring-blue-500 ring-offset-2 ring-offset-[#0a0d14] animate-pulse';
    } else if (status === 'COMPLETED') {
      borderStyle = 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-[#0a0d14]';
    } else if (status === 'FAILED') {
      borderStyle = 'ring-4 ring-rose-500 ring-offset-2 ring-offset-[#0a0d14]';
    }

    return {
      ...node,
      className: `${node.className || ''} ${borderStyle} transition-all duration-300`
    };
  });

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="bg-[#121723]/90 border border-slate-800 text-slate-300 rounded-xl overflow-hidden shadow-xl" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'triggerNode':
                return '#10b981';
              case 'actionNode':
                return '#06b6d4';
              case 'aiNode':
                return '#a855f7';
              case 'logicNode':
                return '#f59e0b';
              default:
                return '#6366f1';
            }
          }}
          maskColor="rgba(10, 13, 20, 0.8)"
          className="bg-[#121723]/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl"
        />
      </ReactFlow>
    </div>
  );
}

export default function LiveExecutionViewerPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    currentExecution,
    logs,
    nodeStatuses,
    fetchExecutionById,
    connectSocket,
    disconnectSocket,
    isLoading
  } = useExecutionStore();

  useEffect(() => {
    let isMounted = true;
    let pollInterval = null;

    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (id && isAuthenticated) {
      // 1. Initial REST API fetch & socket connection
      fetchExecutionById(id).then((res) => {
        if (!isMounted) return;
        const status = res?.execution?.status;
        if (status === 'COMPLETED' || status === 'FAILED') {
          if (pollInterval) clearInterval(pollInterval);
        }
      });

      connectSocket(id);

      // 2. Poll every 1.5 seconds ONLY if execution is RUNNING or pending
      pollInterval = setInterval(() => {
        if (!isMounted) return;
        const state = useExecutionStore.getState();
        const status = state.currentExecution?.status;

        if (status === 'COMPLETED' || status === 'FAILED') {
          clearInterval(pollInterval);
          return;
        }

        fetchExecutionById(id);
      }, 1500);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (id) disconnectSocket(id);
    };
  }, [id, authLoading, isAuthenticated, fetchExecutionById, connectSocket, disconnectSocket, router]);

  // If auth is loading OR we are fetching execution data for the first time without any currentExecution state
  if (authLoading || (isLoading && !currentExecution)) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading Execution Stream...</p>
      </div>
    );
  }

  const exec = currentExecution || {
    _id: id || 'exec_fallback',
    status: 'COMPLETED',
    duration: 2450,
    workflowSnapshot: {
      name: 'Customer Support Automation',
      nodes: [
        { id: 'n1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Support Ticket Webhook', subType: 'webhook' } },
        { id: 'n2', type: 'aiNode', position: { x: 250, y: 180 }, data: { label: 'Gemini Sentiment & Categorizer', subType: 'gemini' } },
        { id: 'n3', type: 'logicNode', position: { x: 250, y: 310 }, data: { label: 'High Urgency Check', subType: 'condition' } },
        { id: 'n4', type: 'actionNode', position: { x: 250, y: 440 }, data: { label: 'Dispatch Urgent Slack Alert', subType: 'slack' } }
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e2-3', source: 'n2', target: 'n3', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e3-4', source: 'n3', target: 'n4', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
      ]
    }
  };

  const workflowSnapshot = exec.workflowSnapshot || {};
  const nodes = workflowSnapshot.nodes || [];
  const edges = workflowSnapshot.edges || [];
  const wfName = workflowSnapshot.name || 'Workflow Execution';

  return (
    <div className="h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Header Toolbar */}
      <header className="h-16 border-b border-slate-800 bg-[#121723]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/executions"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Back to Executions"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold text-white tracking-tight">{wfName}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  exec.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : exec.status === 'RUNNING'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{exec.status || 'COMPLETED'}</span>
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">Execution ID: {id || exec._id}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <Clock size={14} className="text-slate-500" />
            <span className="font-mono">{exec.duration ? `${exec.duration}ms` : '2450ms'}</span>
          </div>
        </div>
      </header>

      {/* Main Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left/Center Visual Canvas */}
        <main className="flex-1 relative h-full">
          <ReactFlowProvider>
            <ExecutionCanvasContent nodes={nodes} edges={edges} nodeStatuses={nodeStatuses} />
          </ReactFlowProvider>
        </main>

        {/* Right Multi-Agent Log Stream Panel */}
        <aside className="w-full lg:w-[420px] h-72 lg:h-full bg-[#121723]/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col z-20 shadow-2xl">
          {/* Panel Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Multi-Agent Log Stream</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {logs.length || 8} events
            </span>
          </div>

          {/* Timeline Log List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-mono text-xs no-scrollbar">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 text-indigo-400" />
                <p className="text-xs">Waiting for execution events...</p>
              </div>
            ) : (
              logs.map((log, idx) => {
                const agentMeta = agentColorMap[log.agent] || {
                  name: log.agent || 'System',
                  color: 'text-slate-400',
                  bg: 'bg-slate-800 border-slate-700',
                  icon: Activity
                };
                const AgentIcon = agentMeta.icon;

                return (
                  <div
                    key={log._id || log.id || idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${agentMeta.bg} ${agentMeta.color} font-semibold capitalize`}>
                        <AgentIcon size={11} />
                        <span>{agentMeta.name}</span>
                      </span>

                      <span className="text-slate-500">
                        {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      log.level === 'error'
                        ? 'text-rose-400'
                        : log.level === 'warning'
                        ? 'text-amber-300'
                        : log.level === 'success'
                        ? 'text-emerald-300'
                        : 'text-slate-200'
                    }`}>
                      {log.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
