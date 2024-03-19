import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    setEdges,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CallableNode from './createNodes/CallableNode';
import InvokeNode from './createNodes/InvokeNode';
import DAppNode from './createNodes/DAppNode';
import NoteNode from './createNodes/NoteNode';


const initialEdges = [];
const initialNodes = [];

function ContractOverview() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);



    // Create a ref for the file input
    const fileInputRef = useRef(null);
    // Function to trigger file input dialog
    const handleImportJson = useCallback(() => {
        fileInputRef.current.click();
    }, []);



    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    // const onConnect = useCallback(
    //     // (connection) => {
    //     //     const edge = { ...connection, type: 'custom-edge' };
    //     //     setEdges((eds) => addEdge(edge, eds));
    //     // },
    //     // [setEdges],
    //     (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    //     [],
    // );
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const nodeTypes = useMemo(() => ({
        dApp: (nodeProps) => <DAppNode {...nodeProps} setNodes={setNodes} />,
        callable: (nodeProps) => <CallableNode {...nodeProps} setNodes={setNodes} />,
        invoke: (nodeProps) => <InvokeNode {...nodeProps} setNodes={setNodes} />,
        note: (nodeProps) => <NoteNode {...nodeProps} setNodes={setNodes} />,
    }), [setNodes]);

    const handleAddNode = useCallback((nodeType) => {
        if (!nodeTypes[nodeType]) {
            console.error(`Node type "${nodeType}" is not defined.`);
            return;
        }

        // const newNode = {
        //     id: `node-${Math.random().toString(36).substr(2, 9)}`,
        //     type: nodeType,
        //     data: { label: `${nodeType} Node ${nodes.length + 1}` },
        //     position: { x: Math.random() * window.innerWidth * 0.8, y: Math.random() * window.innerHeight * 0.8 },
        // };
        const newNode = {
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            type: nodeType,
            data: { label: `${nodeType} Node ${nodes.length + 1}` },
            position: {
                // Set x and y to be in the center of the screen
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            },
        };

        setNodes((nds) => [...nds, newNode]);
    }, [nodeTypes, nodes, setNodes]);

    const exportToJson = () => {
        const data = {
            nodes,
            edges,
        };
        // Convert data object to JSON string
        const jsonString = JSON.stringify(data, null, 2);
        // Create a blob with JSON content
        const blob = new Blob([jsonString], { type: 'application/json' });
        // Create an URL for the blob
        const url = URL.createObjectURL(blob);
        // Create a temporary anchor element and trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flow-data.json'; // Name of the file to be downloaded
        document.body.appendChild(a); // Append the anchor to the document
        a.click(); // Trigger the download
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(url); // Free up memory allocated for the blob
    };

    // Function to handle file input change event
    const handleFileChange = useCallback((event) => {
        const fileReader = new FileReader();
        const files = event.target.files;
        if (files.length === 0) return; // Exit if no file selected

        const file = files[0];
        fileReader.readAsText(file);
        fileReader.onload = () => {
            try {
                const json = JSON.parse(fileReader.result);
                setNodes(json.nodes || []);
                setEdges(json.edges || []);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };
    }, []);
    return (
        <div style={{ height: '950px', width: '100%' }}>
            <button onClick={() => handleAddNode('dApp')}>Add dApp Node</button>
            <button onClick={() => handleAddNode('callable')}>Add Callable Node</button>
            <button onClick={() => handleAddNode('invoke')}>Add invoke Node</button>
            <button onClick={() => handleAddNode('note')}>Add Note Node</button>

            <button onClick={exportToJson}>Export Graph to JSON</button>
            <button onClick={handleImportJson}>Import Graph from JSON</button>
            {/* Hidden file input for importing JSON */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".json"
            />
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                // edgeTypes={edgeTypes}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
        </div>
    );
}

export default ContractOverview;
