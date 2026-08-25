import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Globe,
  Clock,
  Radio,
  Send,
  Mail,
  MessageSquare,
  Database,
  Bot,
  Sparkles,
  BrainCircuit,
  FileText,
  GitFork,
  Split,
  Timer,
  RotateCw
} from 'lucide-react';

const iconMap = {
  // Triggers
  manual: Zap,
  webhook: Globe,
  schedule: Clock,
  event: Radio,

  // Actions
  http: Send,
  email: Mail,
  slack: MessageSquare,
  db: Database,

  // AI
  planner: BrainCircuit,
  execution: Bot,
  gemini: Sparkles,
  summarizer: FileText,

  // Logic
  condition: GitFork,
  branch: Split,
  delay: Timer,
  loop: RotateCw
};

export const TriggerNode = memo(({ data, selected }) => {
  const Icon = iconMap[data.subType] || Zap;

  return (
    <div
      className={`w-64 rounded-2xl bg-[#131b2e]/90 backdrop-blur-xl border transition-all shadow-xl overflow-hidden ${
        selected ? 'border-emerald-400 ring-2 ring-emerald-500/20 shadow-emerald-500/10' : 'border-emerald-500/30 hover:border-emerald-500/60'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900/60 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Icon size={14} />
          </div>
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Trigger</span>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {data.subType || 'manual'}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-1.5">
        <div className="text-sm font-bold text-white tracking-tight">{data.label || 'Workflow Trigger'}</div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {data.description || 'Entrypoint that starts this workflow pipeline execution.'}
        </p>
        {data.config?.cron && (
          <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">
            Cron: {data.config.cron}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="w-3 h-3 bg-emerald-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
      />
    </div>
  );
});

export const ActionNode = memo(({ data, selected }) => {
  const Icon = iconMap[data.subType] || Send;

  return (
    <div
      className={`w-64 rounded-2xl bg-[#131b2e]/90 backdrop-blur-xl border transition-all shadow-xl overflow-hidden ${
        selected ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-cyan-500/10' : 'border-cyan-500/30 hover:border-cyan-500/60'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="w-3 h-3 bg-cyan-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
      />

      {/* Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-900/60 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Icon size={14} />
          </div>
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Action</span>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
          {data.config?.method || data.subType || 'HTTP'}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-1.5">
        <div className="text-sm font-bold text-white tracking-tight">{data.label || 'Action Step'}</div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {data.config?.url || data.description || 'Executes automated operation or payload request.'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="w-3 h-3 bg-cyan-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
      />
    </div>
  );
});

export const AINode = memo(({ data, selected }) => {
  const Icon = iconMap[data.subType] || Sparkles;

  return (
    <div
      className={`w-64 rounded-2xl bg-[#131b2e]/90 backdrop-blur-xl border transition-all shadow-xl overflow-hidden ${
        selected ? 'border-purple-400 ring-2 ring-purple-500/20 shadow-purple-500/10' : 'border-purple-500/30 hover:border-purple-500/60'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="w-3 h-3 bg-purple-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
      />

      {/* Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900/60 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Icon size={14} />
          </div>
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">AI Agent</span>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
          {data.config?.model || 'Gemini 1.5'}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-1.5">
        <div className="text-sm font-bold text-white tracking-tight">{data.label || 'AI Agent Node'}</div>
        <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed bg-purple-950/20 p-2 rounded border border-purple-500/10">
          "{data.config?.prompt || data.description || 'AI synthesis prompt...'}"
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="w-3 h-3 bg-purple-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
      />
    </div>
  );
});

export const LogicNode = memo(({ data, selected }) => {
  const Icon = iconMap[data.subType] || GitFork;
  const isCondition = data.subType === 'condition' || data.subType === 'branch';

  return (
    <div
      className={`w-64 rounded-2xl bg-[#131b2e]/90 backdrop-blur-xl border transition-all shadow-xl overflow-hidden ${
        selected ? 'border-amber-400 ring-2 ring-amber-500/20 shadow-amber-500/10' : 'border-amber-500/30 hover:border-amber-500/60'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="w-3 h-3 bg-amber-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
      />

      {/* Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900/60 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Icon size={14} />
          </div>
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Logic</span>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          {data.subType || 'branch'}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-1.5">
        <div className="text-sm font-bold text-white tracking-tight">{data.label || 'Logic Condition'}</div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {data.config?.condition ? `If ${data.config.condition}` : data.description || 'Evaluates condition to direct pipeline branch.'}
        </p>
      </div>

      {isCondition ? (
        <div className="relative h-6 bg-slate-900/60 border-t border-amber-500/10 flex justify-between px-6 text-[10px] font-semibold text-slate-400">
          <span className="text-emerald-400">TRUE</span>
          <span className="text-rose-400">FALSE</span>

          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: '25%' }}
            className="w-3 h-3 bg-emerald-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: '75%' }}
            className="w-3 h-3 bg-rose-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
          />
        </div>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          className="w-3 h-3 bg-amber-400 border-2 border-[#131b2e] hover:scale-125 transition-transform"
        />
      )}
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
ActionNode.displayName = 'ActionNode';
AINode.displayName = 'AINode';
LogicNode.displayName = 'LogicNode';
