import React, { useState, useCallback } from 'react';
import ReactFlow, { addEdge, MiniMap, Controls } from 'react-flow-renderer';

const initialNodes = []; // Start mit einer leeren Node-Liste
const initialEdges = []; // Start mit einer leeren Edge-Liste

function NodeArea() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const addNode = () => {
    // Logik zum Hinzufügen eines neuen Nodes
    const newNode = {
      id: (nodes.length + 1).toString(),
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: Math.random() * window.innerWidth / 2, y: Math.random() * window.innerHeight / 2 },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Die Funktion zum Hinzufügen eines Nodes muss vom Elternteil (Sidebar) aufgerufen werden können
  // Überlege dir eine Methode, wie du diese Funktion nach oben weitergeben kannst (z.B. durch Props)

  return (
    <div style={{ height: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        fitView
        style={{ background: '#A2CCB6' }}
      >
        <MiniMap />
        <Controls />
      </ReactFlow>
      <button onClick={addNode} style={{ position: 'absolute', zIndex: 100 }}>Node hinzufügen</button>
    </div>
  );
}

export default NodeArea;
