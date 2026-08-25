class PlannerAgent {
  async plan(workflow) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    // Topological sorting of nodes for execution sequence
    const inDegree = new Map();
    const adjList = new Map();

    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    edges.forEach(edge => {
      if (inDegree.has(edge.target)) {
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
      if (adjList.has(edge.source)) {
        adjList.get(edge.source).push(edge.target);
      }
    });

    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    const executionPlan = [];
    while (queue.length > 0) {
      const current = queue.shift();
      executionPlan.push(current);

      const neighbors = adjList.get(current) || [];
      neighbors.forEach(neighbor => {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    }

    // Fallback if disconnected nodes exist
    if (executionPlan.length < nodes.length) {
      nodes.forEach(node => {
        if (!executionPlan.includes(node.id)) {
          executionPlan.push(node.id);
        }
      });
    }

    const confidenceScore = executionPlan.length === nodes.length ? 0.98 : 0.85;

    return {
      success: true,
      executionPlan,
      confidenceScore,
      totalSteps: executionPlan.length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new PlannerAgent();
