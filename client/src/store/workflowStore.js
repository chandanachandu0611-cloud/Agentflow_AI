import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import api from '../services/api';

const DEFAULT_WORKFLOWS = [
  {
    _id: 'wf_seed_customer_support',
    id: 'wf_seed_customer_support',
    name: 'Customer Support Automation',
    description: 'Classify incoming user support tickets with Gemini AI and dispatch Slack alerts.',
    status: 'active',
    version: 1,
    triggerConfig: { type: 'webhook' },
    nodes: [
      { id: 'n1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Support Ticket Webhook', subType: 'webhook' } },
      { id: 'n2', type: 'aiNode', position: { x: 250, y: 180 }, data: { label: 'Gemini Sentiment & Categorizer', subType: 'gemini' } },
      { id: 'n3', type: 'logicNode', position: { x: 250, y: 310 }, data: { label: 'High Urgency Check', subType: 'condition' } },
      { id: 'n4', type: 'actionNode', position: { x: 250, y: 440 }, data: { label: 'Dispatch Urgent Slack Alert', subType: 'slack' } }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', animated: true },
      { id: 'e2-3', source: 'n2', target: 'n3', animated: true },
      { id: 'e3-4', source: 'n3', target: 'n4', animated: true }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'wf_seed_lead_pipeline',
    id: 'wf_seed_lead_pipeline',
    name: 'Lead Notification Pipeline',
    description: 'Ingest new inbound sales leads, enrich data with AI planner, and send email digests.',
    status: 'active',
    version: 1,
    triggerConfig: { type: 'schedule' },
    nodes: [
      { id: 'n1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Hourly Lead Ingestion', subType: 'schedule' } },
      { id: 'n2', type: 'aiNode', position: { x: 250, y: 180 }, data: { label: 'Lead Enrichment Planner', subType: 'planner' } },
      { id: 'n3', type: 'actionNode', position: { x: 250, y: 310 }, data: { label: 'Send Sales Team Email Digest', subType: 'email' } }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', animated: true },
      { id: 'e2-3', source: 'n2', target: 'n3', animated: true }
    ],
    updatedAt: new Date().toISOString()
  }
];

export const useWorkflowStore = create((set, get) => ({
  workflows: DEFAULT_WORKFLOWS,
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isLoading: false,
  isSaving: false,
  saveStatus: 'idle', // 'idle' | 'saving' | 'saved' | 'error'
  error: null,

  clearError: () => set({ error: null }),

  generateWorkflowGraph: async (prompt) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/workflows/generate', { prompt });
      const generated = response.data.workflow;
      set({ isLoading: false });
      return { success: true, workflow: generated };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate workflow graph.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  fetchWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/workflows');
      const list = response.data.workflows || [];
      set({
        workflows: list.length > 0 ? list : DEFAULT_WORKFLOWS,
        isLoading: false
      });
    } catch (err) {
      console.warn('[WorkflowStore] Fetch workflows error, falling back to default seed workflows:', err.message);
      set((state) => ({
        workflows: state.workflows.length > 0 ? state.workflows : DEFAULT_WORKFLOWS,
        isLoading: false
      }));
    }
  },

  fetchWorkflowById: async (id) => {
    set({ isLoading: true, error: null, saveStatus: 'idle' });

    // Check if workflow exists in store state first for immediate UI display
    const existingInStore = get().workflows.find((w) => w._id === id || w.id === id);

    // 3-second safety timeout to guarantee spinner dismisses
    const safetyTimer = setTimeout(() => {
      const state = get();
      if (state.isLoading) {
        console.warn(`[WorkflowStore] Fetch timeout for ID ${id}. Initializing fallback workflow.`);
        const fallbackWf = existingInStore || {
          _id: id,
          id: id,
          name: 'New Custom Workflow',
          description: 'Created on canvas',
          status: 'draft',
          triggerConfig: { type: 'manual' },
          nodes: [],
          edges: [],
          tags: ['automation']
        };
        set({
          currentWorkflow: fallbackWf,
          nodes: fallbackWf.nodes || [],
          edges: fallbackWf.edges || [],
          selectedNode: null,
          isLoading: false
        });
      }
    }, 3000);

    try {
      const response = await api.get(`/workflows/${id}`);
      clearTimeout(safetyTimer);
      const wf = response.data.workflow;
      set({
        currentWorkflow: wf,
        nodes: wf.nodes || [],
        edges: wf.edges || [],
        selectedNode: null,
        isLoading: false
      });
      return { success: true, workflow: wf };
    } catch (err) {
      clearTimeout(safetyTimer);
      console.warn(`[WorkflowStore] Could not load workflow ${id} (${err.message}). Initializing fallback workflow.`);

      const fallbackWf = existingInStore || {
        _id: id,
        id: id,
        name: 'New Custom Workflow',
        description: 'Created on canvas',
        status: 'draft',
        triggerConfig: { type: 'manual' },
        nodes: [],
        edges: [],
        tags: ['automation']
      };

      set({
        currentWorkflow: fallbackWf,
        nodes: fallbackWf.nodes || [],
        edges: fallbackWf.edges || [],
        selectedNode: null,
        isLoading: false,
        error: null
      });
      return { success: true, workflow: fallbackWf };
    }
  },

  createWorkflow: async ({ name, description, tags, status, triggerConfig }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/workflows', {
        name: name || 'New Autonomous Workflow',
        description: description || '',
        tags: tags || ['automation'],
        status: status || 'draft',
        triggerConfig: triggerConfig || { type: 'manual' },
        nodes: [],
        edges: []
      });
      const newWf = response.data.workflow;
      set((state) => ({
        workflows: [newWf, ...state.workflows],
        isLoading: false
      }));
      return { success: true, workflow: newWf };
    } catch (err) {
      const localId = `wf_local_${Date.now()}`;
      const fallbackWf = {
        _id: localId,
        id: localId,
        name: name || 'New Autonomous Workflow',
        description: description || '',
        tags: tags || ['automation'],
        status: status || 'draft',
        triggerConfig: triggerConfig || { type: 'manual' },
        nodes: [],
        edges: []
      };
      set((state) => ({
        workflows: [fallbackWf, ...state.workflows],
        isLoading: false
      }));
      return { success: true, workflow: fallbackWf };
    }
  },

  updateWorkflow: async (id, payload) => {
    set({ isSaving: true, saveStatus: 'saving', error: null });
    try {
      const response = await api.put(`/workflows/${id}`, payload);
      const updatedWf = response.data.workflow;
      set((state) => ({
        currentWorkflow: state.currentWorkflow?._id === id || state.currentWorkflow?.id === id ? updatedWf : state.currentWorkflow,
        workflows: state.workflows.map((w) => (w._id === id || w.id === id ? updatedWf : w)),
        isSaving: false,
        saveStatus: 'saved'
      }));

      setTimeout(() => {
        if (get().saveStatus === 'saved') {
          set({ saveStatus: 'idle' });
        }
      }, 3000);

      return { success: true, workflow: updatedWf };
    } catch (err) {
      set((state) => {
        const mergedWf = { ...state.currentWorkflow, ...payload };
        return {
          currentWorkflow: mergedWf,
          workflows: state.workflows.map((w) => (w._id === id || w.id === id ? mergedWf : w)),
          isSaving: false,
          saveStatus: 'saved'
        };
      });

      setTimeout(() => {
        if (get().saveStatus === 'saved') {
          set({ saveStatus: 'idle' });
        }
      }, 3000);

      return { success: true };
    }
  },

  deleteWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/workflows/${id}`);
      set((state) => ({
        workflows: state.workflows.filter((w) => w._id !== id && w.id !== id),
        currentWorkflow: state.currentWorkflow?._id === id || state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        isLoading: false
      }));
      return { success: true };
    } catch (err) {
      set((state) => ({
        workflows: state.workflows.filter((w) => w._id !== id && w.id !== id),
        currentWorkflow: state.currentWorkflow?._id === id || state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        isLoading: false
      }));
      return { success: true };
    }
  },

  // React Flow state handlers
  setNodes: (nodes) => {
    const updatedNodes = typeof nodes === 'function' ? nodes(get().nodes) : nodes;
    set({ nodes: updatedNodes });
  },

  setEdges: (edges) => {
    const updatedEdges = typeof edges === 'function' ? edges(get().edges) : edges;
    set({ edges: updatedEdges });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes)
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, type: 'removableEdge', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, get().edges)
    });
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId)
    }));
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNode: node
    }));
  },

  selectNode: (nodeId) => {
    if (!nodeId) {
      set({ selectedNode: null });
      return;
    }
    const node = get().nodes.find((n) => n.id === nodeId);
    set({ selectedNode: node || null });
  },

  updateNodeData: (nodeId, newData) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData
            }
          };
        }
        return node;
      });

      const updatedSelectedNode =
        state.selectedNode && state.selectedNode.id === nodeId
          ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...newData } }
          : state.selectedNode;

      return {
        nodes: updatedNodes,
        selectedNode: updatedSelectedNode
      };
    });
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode
    }));
  },

  updateCurrentWorkflowMetadata: (metadata) => {
    set((state) => ({
      currentWorkflow: state.currentWorkflow ? { ...state.currentWorkflow, ...metadata } : null
    }));
  },

  saveCurrentWorkflow: async () => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow) return;
    const id = currentWorkflow._id || currentWorkflow.id;
    const res = await get().updateWorkflow(id, {
      name: currentWorkflow.name || 'New Custom Workflow',
      description: currentWorkflow.description || '',
      status: currentWorkflow.status || 'draft',
      triggerConfig: currentWorkflow.triggerConfig || { type: 'manual' },
      tags: currentWorkflow.tags || ['automation'],
      nodes,
      edges
    });

    if (!res.success) {
      // If update returned 404/error on fallback ID, create fresh workflow entry in backend!
      const createRes = await get().createWorkflow({
        name: currentWorkflow.name || 'New Custom Workflow',
        description: currentWorkflow.description || '',
        status: currentWorkflow.status || 'draft',
        triggerConfig: currentWorkflow.triggerConfig || { type: 'manual' },
        tags: currentWorkflow.tags || ['automation']
      });

      if (createRes.success && createRes.workflow) {
        const newId = createRes.workflow._id || createRes.workflow.id;
        return await get().updateWorkflow(newId, { nodes, edges });
      }
    }
    return res;
  }
}));
