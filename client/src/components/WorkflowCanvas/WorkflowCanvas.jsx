import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath
} from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import { TriggerNode, ActionNode, AINode, LogicNode } from './CustomNodes';

function RemovableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd
}) {
  const { deleteEdge } = useWorkflowStore();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const onEdgeDeleteClick = (evt) => {
    evt.stopPropagation();
    deleteEdge(id);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 rounded-full bg-[#121723] border border-slate-700 hover:border-rose-500 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold flex items-center justify-center text-xs shadow-md transition-all cursor-pointer group"
            onClick={onEdgeDeleteClick}
            title="Delete Connection"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  aiNode: AINode,
  logicNode: LogicNode
};

const edgeTypes = {
  removableEdge: RemovableEdge
};

function FlowCanvasContent() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
    deleteEdge,
    setEdges
  } = useWorkflowStore();

  const formattedEdges = edges.map((e) => ({
    ...e,
    type: e.type || 'removableEdge',
    animated: e.animated !== undefined ? e.animated : true
  }));

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      try {
        const item = JSON.parse(rawData);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });

        const nodeId = `${item.nodeType}_${Date.now()}`;
        const newNode = {
          id: nodeId,
          type: item.nodeType,
          position,
          data: {
            label: item.title || 'New Node',
            subType: item.subType || 'default',
            category: item.category || 'action',
            description: item.description || '',
            config: item.defaultConfig || {}
          }
        };

        addNode(newNode);
      } catch (err) {
        console.error('[WorkflowCanvas Drop Error]', err);
      }
    },
    [screenToFlowPosition, addNode]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges) => {
      deletedEdges.forEach((e) => deleteEdge(e.id));
    },
    [deleteEdge]
  );

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={formattedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        onEdgesDelete={onEdgesDelete}
        deleteKeyCode={['Backspace', 'Delete']}
        edgesFocusable
        edgesReconnectable
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'removableEdge',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        }}
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

      {/* Empty State Banner */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">+</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Canvas is Empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag node blocks from the left palette onto this canvas to assemble your multi-agent workflow.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent />
    </ReactFlowProvider>
  );
}
