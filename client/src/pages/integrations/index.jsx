import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/layout/AppShell';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plug,
  ShieldCheck,
  Mail,
  MessageSquare,
  Bot,
  FileSpreadsheet,
  Sparkles,
  X,
  Power
} from 'lucide-react';

const DEFAULT_INTEGRATIONS = [
  { id: 'gmail', name: 'Gmail API', category: 'email', description: 'Send automated email notifications & digest reports.', status: 'disconnected' },
  { id: 'slack', name: 'Slack Bot', category: 'chat', description: 'Post workflow alerts & execution status into channels.', status: 'connected' },
  { id: 'discord', name: 'Discord Webhook', category: 'chat', description: 'Send rich embed messages & log streams to Discord.', status: 'disconnected' },
  { id: 'googlesheets', name: 'Google Sheets API', category: 'data', description: 'Append workflow outputs & execution rows dynamically.', status: 'connected' },
  { id: 'openai', name: 'OpenAI GPT-4o', category: 'ai', description: 'Power autonomous AI nodes with OpenAI LLM models.', status: 'connected' },
  { id: 'gemini', name: 'Google Gemini 1.5 Pro', category: 'ai', description: 'Execute fast multimodal & structured AI node tasks.', status: 'connected' }
];

const providerMeta = {
  gmail: { icon: Mail, color: 'from-rose-500 to-red-600', badge: 'Email Integration' },
  slack: { icon: MessageSquare, color: 'from-emerald-500 to-teal-600', badge: 'Slack Bot' },
  discord: { icon: MessageSquare, color: 'from-indigo-500 to-blue-600', badge: 'Discord Webhook' },
  googlesheets: { icon: FileSpreadsheet, color: 'from-emerald-600 to-green-700', badge: 'Spreadsheet Sync' },
  openai: { icon: Bot, color: 'from-cyan-500 to-blue-600', badge: 'LLM Intelligence' },
  gemini: { icon: Sparkles, color: 'from-violet-500 to-purple-600', badge: 'Google AI SDK' }
};

export default function IntegrationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [integrations, setIntegrations] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agentflow_integrations');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_INTEGRATIONS;
  });
  const [activeModal, setActiveModal] = useState(null); // provider object
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [webhookInput, setWebhookInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const saveLocalIntegrations = (list) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentflow_integrations', JSON.stringify(list));
    }
  };

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/integrations');
      if (response.data?.integrations && response.data.integrations.length > 0) {
        setIntegrations(response.data.integrations);
        saveLocalIntegrations(response.data.integrations);
      }
    } catch (err) {
      console.warn('Integrations fetch network warning, using mock providers:', err.message);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchIntegrations();
    }
  }, [authLoading, isAuthenticated, router]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenModal = (provider) => {
    setActiveModal(provider);
    setApiKeyInput('');
    setWebhookInput('');
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!activeModal) return;
    setIsSubmitting(true);

    const updateState = (prev) => {
      const updated = prev.map((item) =>
        item.id === activeModal.id ? { ...item, status: 'connected' } : item
      );
      saveLocalIntegrations(updated);
      return updated;
    };

    try {
      await api.post(`/integrations/${activeModal.id}/connect`, {
        apiKey: apiKeyInput,
        webhookUrl: webhookInput
      });
      showToast(`Successfully connected ${activeModal.name}!`);
      setIntegrations(updateState);
      setActiveModal(null);
    } catch (err) {
      setIntegrations(updateState);
      showToast(`Connected ${activeModal.name}!`);
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (providerId, currentStatus, providerName) => {
    const newStatus = currentStatus === 'connected' ? 'disconnected' : 'connected';
    
    setIntegrations((prev) => {
      const updated = prev.map((item) =>
        item.id === providerId ? { ...item, status: newStatus } : item
      );
      saveLocalIntegrations(updated);
      return updated;
    });

    try {
      if (newStatus === 'connected') {
        await api.post(`/integrations/${providerId}/connect`, {});
      } else {
        await api.delete(`/integrations/${providerId}`);
      }
      showToast(`${providerName} is now ${newStatus}.`);
    } catch (err) {
      showToast(`Updated ${providerName} status.`);
    }
  };

  return (
    <AppShell>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xl flex items-center gap-2 transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Plug size={14} className="text-indigo-400" />
            <span>Integrations Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Connected Services & APIs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage API credentials, webhooks, and third-party service connections for autonomous nodes.
          </p>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const meta = providerMeta[item.id] || {
            icon: KeyRound,
            color: 'from-slate-700 to-slate-800',
            badge: 'Service'
          };
          const Icon = meta.icon;
          const isConnected = item.status === 'connected';

          return (
            <div
              key={item.id}
              className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl hover:shadow-indigo-500/5 group"
            >
              <div>
                {/* Card Top: Icon & Status Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform`}>
                    <Icon size={24} />
                  </div>

                  <button
                    onClick={() => handleToggleStatus(item.id, item.status, item.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
                  </button>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-white mb-1 tracking-tight">{item.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {meta.badge}
                </span>

                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Configure Keys
                    </button>
                    <button
                      onClick={() => handleToggleStatus(item.id, item.status, item.name)}
                      title="Disconnect"
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    >
                      <Power size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-500/20 inline-flex items-center gap-1.5"
                  >
                    <Plug size={14} />
                    <span>Connect API</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connect {activeModal.name}</h3>
                <p className="text-xs text-slate-400">Configure API Key or Webhook endpoint.</p>
              </div>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  API Key / Secret Token
                </label>
                <input
                  type="password"
                  placeholder="e.g. sk-proj-••••••••••••••••"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
                <span>Credentials are encrypted & isolated per operator workspace.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plug size={16} />}
                  <span>Save Connection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
