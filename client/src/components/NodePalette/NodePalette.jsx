import React, { useState } from 'react';
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
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
  GripVertical
} from 'lucide-react';

const paletteCategories = [
  {
    id: 'triggers',
    name: 'Triggers',
    color: 'emerald',
    icon: Zap,
    items: [
      {
        nodeType: 'triggerNode',
        subType: 'manual',
        category: 'triggers',
        title: 'Manual Trigger',
        description: 'Triggers pipeline execution manually on user request.',
        defaultConfig: { type: 'manual' },
        icon: Zap
      },
      {
        nodeType: 'triggerNode',
        subType: 'webhook',
        category: 'triggers',
        title: 'Webhook Trigger',
        description: 'Starts workflow on receiving incoming HTTP POST request.',
        defaultConfig: { type: 'webhook', path: '/webhook/v1/trigger' },
        icon: Globe
      },
      {
        nodeType: 'triggerNode',
        subType: 'schedule',
        category: 'triggers',
        title: 'Schedule (Cron)',
        description: 'Recurring time-based trigger using cron expression.',
        defaultConfig: { type: 'schedule', cron: '0 * * * *' },
        icon: Clock
      },
      {
        nodeType: 'triggerNode',
        subType: 'event',
        category: 'triggers',
        title: 'Event Listener',
        description: 'Triggers on system event or message queue topic.',
        defaultConfig: { type: 'event', topic: 'user.created' },
        icon: Radio
      }
    ]
  },
  {
    id: 'actions',
    name: 'Actions',
    color: 'cyan',
    icon: Send,
    items: [
      {
        nodeType: 'actionNode',
        subType: 'http',
        category: 'actions',
        title: 'HTTP Request',
        description: 'Sends REST API HTTP GET, POST, PUT or DELETE request.',
        defaultConfig: { method: 'POST', url: 'https://api.example.com/data', headers: '{}' },
        icon: Send
      },
      {
        nodeType: 'actionNode',
        subType: 'email',
        category: 'actions',
        title: 'Send Email',
        description: 'Dispatches notification email via SMTP or Gmail.',
        defaultConfig: { to: 'operator@company.com', subject: 'Workflow Notification' },
        icon: Mail
      },
      {
        nodeType: 'actionNode',
        subType: 'slack',
        category: 'actions',
        title: 'Slack Message',
        description: 'Posts message payload into configured Slack channel.',
        defaultConfig: { channel: '#general', message: 'Workflow completed.' },
        icon: MessageSquare
      },
      {
        nodeType: 'actionNode',
        subType: 'db',
        category: 'actions',
        title: 'Database Query',
        description: 'Queries or updates relational / NoSQL database table.',
        defaultConfig: { query: 'SELECT * FROM users WHERE status = "active"' },
        icon: Database
      }
    ]
  },
  {
    id: 'ai',
    name: 'AI & Agents',
    color: 'purple',
    icon: Sparkles,
    items: [
      {
        nodeType: 'aiNode',
        subType: 'planner',
        category: 'ai',
        title: 'Planner Agent',
        description: 'Decomposes tasks into ordered DAG steps & confidence scores.',
        defaultConfig: { model: 'Gemini 1.5 Pro', systemPrompt: 'You are the DAG Planner Agent.' },
        icon: BrainCircuit
      },
      {
        nodeType: 'aiNode',
        subType: 'execution',
        category: 'ai',
        title: 'Execution Agent',
        description: 'Autonomously dispatches action steps & tool calls.',
        defaultConfig: { model: 'Gemini 1.5 Flash', retryCount: 3 },
        icon: Bot
      },
      {
        nodeType: 'aiNode',
        subType: 'gemini',
        category: 'ai',
        title: 'Gemini Prompt AI',
        description: 'Runs natural language prompts against Gemini LLM.',
        defaultConfig: { model: 'Gemini 1.5 Flash', prompt: 'Analyze payload data and output JSON summary.', temperature: 0.7 },
        icon: Sparkles
      },
      {
        nodeType: 'aiNode',
        subType: 'summarizer',
        category: 'ai',
        title: 'AI Summarizer',
        description: 'Synthesizes long data logs into executive summaries.',
        defaultConfig: { model: 'Gemini 1.5 Flash', maxLength: 250 },
        icon: FileText
      }
    ]
  },
  {
    id: 'logic',
    name: 'Logic & Control',
    color: 'amber',
    icon: GitFork,
    items: [
      {
        nodeType: 'logicNode',
        subType: 'condition',
        category: 'logic',
        title: 'If / Else Condition',
        description: 'Branches workflow path based on expression evaluation.',
        defaultConfig: { condition: 'data.statusCode === 200' },
        icon: GitFork
      },
      {
        nodeType: 'logicNode',
        subType: 'branch',
        category: 'logic',
        title: 'Parallel Branch Split',
        description: 'Executes multiple output branches concurrently.',
        defaultConfig: { branches: 2 },
        icon: Split
      },
      {
        nodeType: 'logicNode',
        subType: 'delay',
        category: 'logic',
        title: 'Delay / Sleep',
        description: 'Pauses pipeline execution for specified duration (ms).',
        defaultConfig: { durationMs: 5000 },
        icon: Timer
      },
      {
        nodeType: 'logicNode',
        subType: 'loop',
        category: 'logic',
        title: 'Loop Iteration',
        description: 'Iterates pipeline execution over array item collection.',
        defaultConfig: { collection: 'items' },
        icon: RotateCw
      }
    ]
  }
];

export default function NodePalette() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const onDragStart = (e, item) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = paletteCategories
    .map((cat) => {
      if (selectedCategory !== 'all' && cat.id !== selectedCategory) return null;
      const items = cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      );
      if (items.length === 0) return null;
      return { ...cat, items };
    })
    .filter(Boolean);

  return (
    <aside
      className={`h-full bg-[#121723]/90 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-14' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Node Palette</div>
            <div className="text-[11px] text-slate-400">Drag items to canvas</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors mx-auto"
          title={collapsed ? 'Expand Palette' : 'Collapse Palette'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Category Pill Filters */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              {paletteCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {filteredCategories.map((cat) => (
              <div key={cat.id}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 px-1">
                  <cat.icon size={13} className="text-indigo-400" />
                  <span>{cat.name}</span>
                </div>

                <div className="space-y-2">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.subType + item.nodeType}
                        draggable
                        onDragStart={(e) => onDragStart(e, item)}
                        className="group p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 cursor-grab active:cursor-grabbing transition-all shadow-sm flex items-start gap-2.5"
                      >
                        <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-300 border border-slate-700/50 transition-colors">
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                              {item.title}
                            </span>
                            <GripVertical size={14} className="text-slate-600 group-hover:text-slate-400" />
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Collapsed Icon Bar */}
      {collapsed && (
        <div className="flex-1 overflow-y-auto py-4 space-y-3 flex flex-col items-center">
          {paletteCategories.flatMap((c) => c.items).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.subType + item.nodeType}
                draggable
                onDragStart={(e) => onDragStart(e, item)}
                title={`${item.title}: ${item.description}`}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-800 hover:border-indigo-400 cursor-grab active:cursor-grabbing transition-all"
              >
                <Icon size={18} />
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
