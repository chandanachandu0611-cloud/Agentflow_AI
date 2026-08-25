import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  X,
  Trash2,
  Sliders,
  Sparkles,
  Send,
  Zap,
  GitFork,
  Code,
  Globe,
  Clock,
  Mail,
  MessageSquare,
  Database
} from 'lucide-react';

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeData, deleteNode, selectNode } = useWorkflowStore();

  if (!selectedNode) {
    return (
      <aside className="w-80 h-full bg-[#121723]/90 backdrop-blur-xl border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-3">
          <Sliders size={24} />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">No Node Selected</h4>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
          Click on any node on the canvas to inspect and edit its execution parameters.
        </p>
      </aside>
    );
  }

  const { data } = selectedNode;
  const config = data.config || {};

  const handleFieldChange = (key, value) => {
    updateNodeData(selectedNode.id, {
      ...data,
      config: {
        ...config,
        [key]: value
      }
    });
  };

  const handleMetaChange = (key, value) => {
    updateNodeData(selectedNode.id, {
      [key]: value
    });
  };

  return (
    <aside className="w-80 h-full bg-[#121723]/90 backdrop-blur-xl border-l border-slate-800 flex flex-col z-20 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            {selectedNode.type === 'triggerNode' && <Zap size={16} />}
            {selectedNode.type === 'actionNode' && <Send size={16} />}
            {selectedNode.type === 'aiNode' && <Sparkles size={16} />}
            {selectedNode.type === 'logicNode' && <GitFork size={16} />}
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Node Configuration</div>
            <div className="text-[10px] text-slate-400 font-mono">ID: {selectedNode.id}</div>
          </div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body / Editable Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* General Meta */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Node Title</span>
            <input
              type="text"
              value={data.label || ''}
              onChange={(e) => handleMetaChange('label', e.target.value)}
              className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Description</span>
            <textarea
              rows={2}
              value={data.description || ''}
              onChange={(e) => handleMetaChange('description', e.target.value)}
              className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </label>
        </div>

        <div className="h-px bg-slate-800" />

        {/* AI Node Configuration */}
        {selectedNode.type === 'aiNode' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>AI Agent Settings</span>
            </div>

            <label className="block">
              <span className="text-[11px] font-medium text-slate-300">Model Provider</span>
              <select
                value={config.model || 'Gemini 1.5 Flash'}
                onChange={(e) => handleFieldChange('model', e.target.value)}
                className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Fast)</option>
                <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Reasoning)</option>
                <option value="GPT-4o">GPT-4o (OpenAI)</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Anthropic)</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-medium text-slate-300">Prompt Instructions</span>
              <textarea
                rows={4}
                value={config.prompt || ''}
                onChange={(e) => handleFieldChange('prompt', e.target.value)}
                placeholder="Enter prompt instructions for LLM..."
                className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors font-mono"
              />
            </label>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                <span>Temperature</span>
                <span className="text-purple-400">{config.temperature ?? 0.7}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature ?? 0.7}
                onChange={(e) => handleFieldChange('temperature', parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>
        )}

        {/* Action Node Configuration */}
        {selectedNode.type === 'actionNode' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Send size={14} />
              <span>Action Payload Config</span>
            </div>

            {data.subType === 'http' && (
              <>
                <label className="block">
                  <span className="text-[11px] font-medium text-slate-300">HTTP Method</span>
                  <select
                    value={config.method || 'POST'}
                    onChange={(e) => handleFieldChange('method', e.target.value)}
                    className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-[11px] font-medium text-slate-300">Endpoint URL</span>
                  <input
                    type="text"
                    value={config.url || ''}
                    onChange={(e) => handleFieldChange('url', e.target.value)}
                    placeholder="https://api.domain.com/endpoint"
                    className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </label>
              </>
            )}

            {data.subType === 'email' && (
              <>
                <label className="block">
                  <span className="text-[11px] font-medium text-slate-300">Recipient Email</span>
                  <input
                    type="email"
                    name="to"
                    value={config.to || ''}
                    onChange={(e) => handleFieldChange('to', e.target.value)}
                    placeholder="recipient@company.com"
                    className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-medium text-slate-300">Subject</span>
                  <input
                    type="text"
                    name="subject"
                    value={config.subject || ''}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                    placeholder="Workflow Execution Notification"
                    className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-medium text-slate-300">Email Body / Template</span>
                  <textarea
                    rows={4}
                    name="template"
                    value={config.template || ''}
                    onChange={(e) => handleFieldChange('template', e.target.value)}
                    placeholder="Hello {{name}}, your pipeline ran with status {{status}}."
                    className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono resize-none"
                  />
                </label>
              </>
            )}

            {data.subType === 'slack' && (
              <label className="block">
                <span className="text-[11px] font-medium text-slate-300">Slack Channel</span>
                <input
                  type="text"
                  value={config.channel || ''}
                  onChange={(e) => handleFieldChange('channel', e.target.value)}
                  placeholder="#general"
                  className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </label>
            )}
          </div>
        )}

        {/* Trigger Node Configuration */}
        {selectedNode.type === 'triggerNode' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} />
              <span>Trigger Config</span>
            </div>

            {data.subType === 'schedule' && (
              <label className="block">
                <span className="text-[11px] font-medium text-slate-300">Cron Schedule</span>
                <input
                  type="text"
                  value={config.cron || ''}
                  onChange={(e) => handleFieldChange('cron', e.target.value)}
                  placeholder="0 * * * *"
                  className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </label>
            )}

            {data.subType === 'webhook' && (
              <label className="block">
                <span className="text-[11px] font-medium text-slate-300">Webhook Path</span>
                <input
                  type="text"
                  value={config.path || ''}
                  onChange={(e) => handleFieldChange('path', e.target.value)}
                  placeholder="/webhook/v1/trigger"
                  className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </label>
            )}
          </div>
        )}

        {/* Logic Node Configuration */}
        {selectedNode.type === 'logicNode' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitFork size={14} />
              <span>Logic Rules</span>
            </div>

            <label className="block">
              <span className="text-[11px] font-medium text-slate-300">Condition Expression</span>
              <input
                type="text"
                value={config.condition || ''}
                onChange={(e) => handleFieldChange('condition', e.target.value)}
                placeholder="payload.status === 'success'"
                className="mt-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </label>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-2 transition-all w-full justify-center"
        >
          <Trash2 size={15} />
          <span>Delete Node</span>
        </button>
      </div>
    </aside>
  );
}
