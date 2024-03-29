import React, {useState, useCallback, useMemo, useRef} from 'react';
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import FunctionNode from './Nodes/FunctionNode';
import SendTokenNode from './Nodes/SendTokenNode';
import ValueNode from './Nodes/ValueNode';
import LogicalNode from './Nodes/LogicNode';
import StringEntryNode from './Nodes/StringEntryNode';
import ErrorNode from './Nodes/ErrorNode';
import KeyNode from './Nodes/KeyNode';
import NoteNode from './Nodes/NoteNode';

import edges from './edges';
import StartNode from './Nodes/StartNode';

import createContract, {downloadContract} from './CreateSC';
import {useWavesTransactions} from "../../context/WavesTransactionContext";
import {convertScriptToBase64} from "../../util/wavesApi";

// Preset edges and nodes
const initialEdges = [];
const initialNodes = [{
    "id": "startnode",
    "type": "start",
    "data": {
        "label": "start Node 1"
    },
    "position": {
        "x": 1024,
        "y": 100
    },
    "width": 87,
    "height": 62
}];

/**
 * Defines custom edge types for React Flow.
 */
const edgeTypes = {
    'custom-edge': edges,
};

/**
 * The CreateContract component provides an interactive environment for creating, editing,
 * and managing a contract workflow using a node-based graphical interface. It utilizes React Flow
 * for rendering the workflow graph, including custom nodes and edges for contract elements such as
 * functions, token transfers, logic operations, and more. Users can add nodes to the graph, connect
 * them to define the flow, and export or import the graph as JSON. It also supports uploading the
 * contract to the blockchain and downloading the contract code.
 *
 * Features include:
 * - Adding various types of nodes like function, token transfer, logic, value, and more to the graph.
 * - Connecting nodes to define the flow of the contract.
 * - Exporting the contract graph to a JSON file for persistence or sharing.
 * - Importing a contract graph from a JSON file.
 * - Uploading the contract script to the blockchain.
 * - Downloading the contract script for review or deployment outside the tool.
 *
 * @returns {JSX.Element} The CreateContract component rendered as a ReactFlow diagram with controls for managing the contract graph.
 */
function CreateContract() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const {setScript} = useWavesTransactions();

    // Reference to hidden file input for JSON import
    const fileInputRef = useRef(null);
    // Function to trigger file input dialog
    const handleImportJson = useCallback(() => {
        fileInputRef.current.click();
    }, []);


    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes],);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges],);
    const onConnect = useCallback((connection) => setEdges((eds) => addEdge({...connection, type: 'custom-edge'}, eds)), []);

    // Define node types for React Flow
    const nodeTypes = useMemo(() => ({
        start: (nodeProps) => <StartNode {...nodeProps} setNodes={setNodes}/>,
        function: (nodeProps) => <FunctionNode {...nodeProps} setNodes={setNodes}/>,
        token: (nodeProps) => <SendTokenNode {...nodeProps} setNodes={setNodes}/>,
        logic: (nodeProps) => <LogicalNode {...nodeProps} setNodes={setNodes}/>,
        value: (nodeProps) => <ValueNode {...nodeProps} setNodes={setNodes} allNodes={nodes}/>,
        string: (nodeProps) => <StringEntryNode {...nodeProps} setNodes={setNodes}/>,
        error: (nodeProps) => <ErrorNode {...nodeProps} setNodes={setNodes}/>,
        key: (nodeProps) => <KeyNode {...nodeProps} setNodes={setNodes}/>,
        note: (nodeProps) => <NoteNode {...nodeProps} setNodes={setNodes}/>,
    }), [setNodes]);

    // Handler for adding new nodes
    const handleAddNode = useCallback((nodeType) => {
        if (!nodeTypes[nodeType]) {
            console.error(`Node type "${nodeType}" is not defined.`);
            return;
        }

        const newNode = {
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            type: nodeType,
            data: {label: `${nodeType} Node ${nodes.length + 1}`},
            position: {x: window.innerWidth / 2, y: window.innerHeight / 2},
        };

        setNodes((nds) => [...nds, newNode]);
    }, [nodeTypes, nodes, setNodes]);

    // Handler for exporting graph to JSON
    const exportToJson = () => {
        const data = {nodes, edges};
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flow-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handler for importing graph from JSON
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

    // Handler for uploading compiled script to blockchain
    const uploadScript = async () => {
        const data = {nodes, edges};
        const scriptData = createContract(data)

        try {
            const scriptBase64 = await convertScriptToBase64(scriptData)

            // Upload the compiled script to the blockchain.
            await setScript({
                script: scriptBase64
            });
        } catch (error) {
            console.error("Error uploading the script file", error);
        }
    }

    // Handler for downloading the script
    const downloadScript = () => {
        const data = {nodes, edges};
        const script = createContract(data)
        downloadContract(script, "my_smart_contract.ride")
    }

    return (
        <div style={{height: '1950px', width: '100%'}}>
            <button onClick={() => handleAddNode('key')}>Add Key Node</button>
            <button onClick={() => handleAddNode('value')}>Add Value Node</button>
            <button onClick={() => handleAddNode('logic')}>Add Logic Node</button>
            <button onClick={() => handleAddNode('token')}>Add sendToken Node</button>
            <button onClick={() => handleAddNode('string')}>Add StringEntry Node</button>
            <button onClick={() => handleAddNode('function')}>Add Function Node</button>
            <button onClick={() => handleAddNode('error')}>Add Error Node</button>
            <button onClick={() => handleAddNode('note')}>Add Note Node</button>
            <button onClick={exportToJson}>Export Graph to JSON</button>
            <button onClick={handleImportJson}>Import Graph from JSON</button>
            <input
                type="file"
                ref={fileInputRef}
                style={{display: 'none'}}
                onChange={handleFileChange}
                accept=".json"
            />
            <button onClick={downloadScript}>Download SC</button>
            <button onClick={uploadScript}>deploy SC</button>

            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background/>
                <Controls/>
                <MiniMap nodeStrokeWidth={3} zoomable pannable/>
            </ReactFlow>
        </div>
    );
}

export default CreateContract;
