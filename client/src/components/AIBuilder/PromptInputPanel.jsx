import React from 'react';
import { Sparkles, Wand2, ArrowRight, Layers, Bot, Cpu, Zap } from 'lucide-react';

const exampleTemplates = [
  {
    title: 'Lead Qualification & Email Outreach',
    prompt: 'When a new lead webhook is received, use Planner Agent to classify lead score with Gemini. If high priority, send notification email and post Slack alert.'
  },
  {
    title: 'Support Ticket Categorizer & Router',
    prompt: 'Listen for customer support tickets, classify urgency with Gemini AI summarizer, append ticket record to database, and dispatch Slack message.'
  },
  {
    title: 'Daily Sales & Revenue Report Generator',
    prompt: 'Run daily schedule cron trigger, query sales database for active orders, generate executive AI summary, and email report to management.'
  },
  {
    title: 'API Health Monitor & Recovery Alert',
    prompt: 'Send HTTP GET health check every 15 minutes. If status is not 200, execute Recovery Agent retry logic and post urgent Discord alert.'
  }
];

export default function PromptInputPanel({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  provider
}) {
  return (
    <div className="w-full lg:w-96 glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between shrink-0">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">AI Spec Compiler</h3>
              <p className="text-[10px] text-slate-400">Natural Language to DAG Graph</p>
            </div>
          </div>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize">
            {provider || 'Gemini AI'}
          </span>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2 mb-5">
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Describe your workflow pipeline:
          </label>
          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. When a webhook is received, use Gemini AI to summarize ticket details, then send email notification and post to Slack channel..."
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Example Prompt Templates */}
        <div className="space-y-2 mb-6">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wand2 size={13} className="text-indigo-400" />
            <span>Example Templates</span>
          </div>

          <div className="space-y-2">
            {exampleTemplates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(tpl.prompt)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-indigo-950/30 border border-slate-800/80 hover:border-indigo-500/30 text-xs transition-all group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {tpl.title}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-tight">
                  "{tpl.prompt}"
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Action Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Compiling Graph Topology...</span>
          </>
        ) : (
          <>
            <Wand2 size={16} />
            <span>Generate Workflow Graph</span>
          </>
        )}
      </button>
    </div>
  );
}
