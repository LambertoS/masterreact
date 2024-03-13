import React, { useState, useCallback, useMemo, } from 'react';
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CallableNode from './overviewNodes/CallableNode';
import DAppNode from './overviewNodes/DAppNode';

const initialEdges = [];
const initialNodes = [];

function ContractOverview() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [rootAddress, setRootAddress] = useState('');

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    const onConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges],
    );

    const nodeTypes = useMemo(() => ({
        callable: CallableNode,
        dapp: DAppNode,
    }), []);

    const exportToJson = useCallback(() => {
        const data = { nodes, edges };
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flow-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [nodes, edges]);

    return (
        <div style={{ height: '800px', width: '100%' }}>
            <input
                type="text"
                value={rootAddress}
                onChange={(e) => setRootAddress(e.target.value)}
                placeholder="RootAddress"
            />
            <button onClick={exportToJson}>Export Graph to JSON</button>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap nodeStrokeWidth={3} />
            </ReactFlow>
        </div>
    );
}

export default ContractOverview;
