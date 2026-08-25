import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider
} from '@xyflow/react';
import { TriggerNode, ActionNode, AINode, LogicNode } from '../WorkflowCanvas/CustomNodes';
import { Sparkles, ArrowRight, Layers, Bot, Zap, CheckCircle2, Play } from 'lucide-react';

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  aiNode: AINode,
  logicNode: LogicNode
};

function PreviewCanvasContent({ workflow }) {
  const nodes = workflow?.nodes || [];
  const edges = workflow?.edges || [];

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800">
      <ReactFlow
        nodes={nodes}
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

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
            <Sparkles size={24} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">Graph Preview Standby</h4>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Enter an automation prompt or select a template on the left panel and click "Generate Workflow Graph".
          </p>
        </div>
      )}
    </div>
  );
}

export default function GraphPreviewPanel({ workflow, onLaunchCanvas, isLaunching }) {
  const nodesCount = workflow?.nodes?.length || 0;
  const edgesCount = workflow?.edges?.length || 0;

  return (
    <div className="flex-1 glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {workflow?.name || 'Generated Graph Topology'}
            </h2>
            {workflow?.provider && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                Compiled via {workflow.provider}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">
            {workflow?.description || 'Compiled visual DAG node topology ready for execution.'}
          </p>
        </div>

        {workflow && (
          <button
            onClick={onLaunchCanvas}
            disabled={isLaunching}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            <span>Launch in Visual Builder</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Live React Flow Canvas Preview */}
      <div className="flex-1 my-4 relative min-h-[350px]">
        <ReactFlowProvider>
          <PreviewCanvasContent workflow={workflow} />
        </ReactFlowProvider>
      </div>

      {/* Summary Metrics Bar */}
      {workflow && (
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Layers size={14} className="text-indigo-400" />
              <span>{nodesCount} Nodes</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Zap size={14} className="text-emerald-400" />
              <span>{edgesCount} Edges</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 size={14} className="text-cyan-400" />
              <span>Topology Validated</span>
            </span>
          </div>

          <span className="text-[11px] text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            Click "Launch in Visual Builder" to edit on canvas
          </span>
        </div>
      )}
    </div>
  );
}
