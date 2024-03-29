import React, {useCallback, useMemo, useRef, useState} from 'react';
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import CallableNode from './Nodes/CallableNode';
import InvokeNode from './Nodes/InvokeNode';
import DAppNode from './Nodes/DAppNode';
import NoteNode from './Nodes/NoteNode';
import {getWavesScriptFunctions, getWavesScriptMeta} from "../../util/wavesUtil";
import {getLayoutedElements} from "../../util/reactFlowUtil";

//https://reactflow.dev/learn/layouting/layoutinghttps://reactflow.dev/learn/layouting/layouting
const initialEdges = [];
const initialNodes = [];

/**
 * ContractOverview provides an interface for visually creating, editing, and viewing the structure
 * of a smart contract with nodes representing contract functionalities like callable functions, invocations,
 * DApp actions, and notes. It supports layouting, importing, and exporting the contract structure as JSON.
 *
 * Features:
 * - Dynamic addition of various node types (Callable, Invoke, DApp, and Note) to the contract structure.
 * - Importing a predefined contract structure from a JSON file.
 * - Exporting the current contract structure to a JSON file for storage or further manipulation.
 * - Automatic layout adjustments for better visualization of the contract structure.
 * - Utilization of Waves blockchain utilities for fetching script functions and metadata for better contract insights.
 *
 * Usage:
 * - Users can add nodes corresponding to different aspects of a smart contract.
 * - Nodes can be connected to define the contract's logic flow.
 * - The layout feature organizes the contract visually for clarity.
 * - The import/export functionality facilitates easy sharing and modification of contract structures.
 */
function ContractOverview() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const addressToNodeIdMap = useRef(new Map()).current;

    const onLayout = useCallback(
        (direction) => {
            const layouted = getLayoutedElements(nodes, edges, {direction});

            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);

            window.requestAnimationFrame(() => {
                //fitView();
            });
        },
        [nodes, edges]
    );

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    // Hidden file input reference for importing contract structures
    const fileInputRef = useRef(null);

    // Function to trigger the hidden file input dialog for importing JSON
    const handleImportJson = useCallback(() => {
        fileInputRef.current.click();
    }, []);

    // Function to export the current contract structure to a JSON file
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

    // Function to handle file selection and import contract structure from JSON
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

    // Define custom node types for use within the React Flow instance
    const nodeTypes = useMemo(() => ({
        dApp: (nodeProps) => <DAppNode {...nodeProps} setNodes={setNodes}/>,
        callable: (nodeProps) => <CallableNode {...nodeProps} setNodes={setNodes}/>,
        invoke: (nodeProps) => <InvokeNode {...nodeProps} setNodes={setNodes}/>,
        note: (nodeProps) => <NoteNode {...nodeProps} setNodes={setNodes}/>,
    }), [setNodes]);

    /**
     * Asynchronously adds a new node to the graph based on the given node type and associated address.
     * If the node type is 'dApp', it further fetches and adds callable and invoke nodes related to the dApp's address.
     *
     * @param {string} nodeType - The type of node to add (e.g., 'dApp', 'callable', 'invoke', 'note').
     */
    const handleAddNodeWithAddress = async (nodeType) => {
        let address = prompt("Please enter the dApp address:");
        if (!address) return;

        const newNode = {
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            type: nodeType,
            data: {label: `${nodeType} Node ${nodes.length + 1}`, address: address},
            position: {x: window.innerWidth / 2, y: window.innerHeight / 2},
        };

        setNodes((nds) => [...nds, newNode]);

        if (nodeType === 'dApp') {
            await addCallableAndInvokeNodes(address, newNode.id);
        }
    };

    /**
     * Fetches all unique metadata for the dApp addresses from script functions.
     * Useful for ensuring that all necessary data for callable and invoke nodes is pre-fetched.
     *
     * @param {Array} scriptFunctions - The script functions obtained from a smart contract.
     * @returns {Map} A map of dApp addresses to their respective metadata.
     */
    async function fetchAllData(scriptFunctions) {
        // Identify all unique dApp addresses
        const uniqueAddresses = new Set(scriptFunctions.flatMap(func =>
            func.invokes.map(invoke => invoke.address)
        ));

        // Fetch metadata for each unique address
        const addressMetadataPromises = Array.from(uniqueAddresses).map(async address => {
            return {
                address,
                metadata: await getWavesScriptMeta(address)
            };
        });

        // Wait for all metadata fetches to complete
        const addressMetadata = await Promise.all(addressMetadataPromises);

        // Convert the array of metadata into a Map for easy lookup
        return new Map(addressMetadata.map(item => [item.address, item.metadata]));
    }

    /**
     * Adds callable and invoke nodes for a given dApp address, utilizing the fetched script functions.
     * This function orchestrates the creation of a detailed view of the dApp's functionalities within the graph.
     *
     * @param {string} address - The address of the dApp for which nodes are being added.
     * @param {string} dAppNodeId - The node ID of the dApp node to which callable and invoke nodes are connected.
     */
    const addCallableAndInvokeNodes = async (address, dAppNodeId) => {
        const scriptFunctions = await getWavesScriptFunctions(address);
        const addressMetadataMap = await fetchAllData(scriptFunctions);

        // Use a Map to track dApp nodes by their addresses to avoid duplicates
        addressToNodeIdMap.set(address, dAppNodeId); // Add the initial dApp node

        // Helper function to ensure a dApp node for a given address exists or creates one
        const ensureDAppNodeExists = (address) => {
            if (!addressToNodeIdMap.has(address)) {
                const newNodeId = `node-${Math.random().toString(36).substr(2, 9)}`;
                const newNode = {
                    id: newNodeId,
                    type: 'dApp',
                    data: {label: `dApp Node`, address},
                    position: {x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight}, // Randomize for demo
                };
                setNodes((nds) => [...nds, newNode]);
                addressToNodeIdMap.set(address, newNodeId);
                return newNodeId;
            }
            return addressToNodeIdMap.get(address);
        };

        // Helper function to ensure a callable node exists
        const ensureCallableNodeExistsForFunction = (targetDAppNodeId, functionName, functionParams) => {
            // Check if a callable node for this function already exists for the target dApp node
            let existingCallableNode = nodes.find(node =>
                node.data.functionName === functionName &&
                node.type === 'callable' &&
                node.data.address === addressToNodeIdMap.get(targetDAppNodeId)
            );

            if (!existingCallableNode) {
                // If not, create it
                const callableNodeId = `callable-${targetDAppNodeId}-${functionName}`;
                const callableNode = {
                    id: callableNodeId,
                    type: 'callable',
                    data: {
                        label: `Callable: ${functionName}`,
                        functionName: functionName,
                        address: addressToNodeIdMap.get(targetDAppNodeId),
                        parameters: functionParams, // Include parameters here
                    },
                    position: {
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                    },
                };
                setNodes((nds) => [...nds, callableNode]);

                // Also, create an edge from the dApp node to this callable node
                const edge = {
                    id: `edge-${targetDAppNodeId}-to-${callableNodeId}`,
                    source: targetDAppNodeId,
                    target: callableNodeId,
                    type: 'smoothstep',
                    animated: true,
                };
                setEdges((eds) => [...eds, edge]);

                return callableNodeId;
            }

            return existingCallableNode.id;
        };

        scriptFunctions.forEach((func, index) => {
            // Create callable node for each function
            const callableNode = {
                id: `callable-${dAppNodeId}-${index}`,
                type: 'callable',
                data: {
                    label: `Callable: ${func.name}`,
                    functionName: func.name,
                    parameters: func.params
                },
                position: {x: 100 + Math.random() * (window.innerWidth - 200), y: 100 + index * 120}, // Randomize for demo
            };
            setNodes((nds) => [...nds, callableNode]);

            // Create an edge from dApp node to callable node
            const edgeToCallable = {
                id: `edge-${dAppNodeId}-to-${callableNode.id}`,
                source: dAppNodeId,
                target: callableNode.id,
                type: 'smoothstep',
                animated: true,
            };
            setEdges((eds) => [...eds, edgeToCallable]);

            // Process each invoke within the callable function
            for (const [invokeIndex, invoke] of func.invokes.entries()) {
                // Ignore invokes that are unknown
                if (invoke.function === undefined || invoke.function === "unknown") {
                    continue
                }

                let targetDAppNodeId = ensureDAppNodeExists(invoke.address);

                // Now, create the invoke node with the fetched callable function parameters included
                const invokeNode = {
                    id: `invoke-${callableNode.id}-${invokeIndex}`,
                    type: 'invoke',
                    data: {
                        label: `Invoke: ${invoke.function}`,
                        address: invoke.address,
                        functionName: invoke.function,
                        invokeParameters: invoke.params !== undefined ? invoke.params.join(",") : "",
                    },
                    position: {
                        x: 200 + Math.random() * (window.innerWidth - 300),
                        y: 100 + index * 120 + invokeIndex * 50
                    },
                };
                setNodes((nds) => [...nds, invokeNode]);

                // Create an edge from callable node to invoke node
                const edgeToInvoke = {
                    id: `edge-${callableNode.id}-to-${invokeNode.id}`,
                    source: callableNode.id,
                    target: invokeNode.id,
                    type: 'step',
                    animated: true,
                };
                setEdges((eds) => [...eds, edgeToInvoke]);

                // Create an edge from invoke node to target dApp node if applicable
                if (targetDAppNodeId) {
                    const edgeFromInvokeToDApp = {
                        id: `edge-invoke-${invoke.function}-${invokeNode.id}-to-${targetDAppNodeId}`,
                        source: invokeNode.id,
                        target: targetDAppNodeId,
                        type: 'smoothstep',
                        animated: true,
                        //label: `Invoke: ${invoke.function} to dApp`,
                    };
                    setEdges((eds) => [...eds, edgeFromInvokeToDApp]);
                }

                // After creating and connecting the invoke node, ensure the callable node exists
                // First, accessing the map using just the dApp address to get the object containing callable functions
                const callableFunctionsForObject = addressMetadataMap.get(invoke.address);
                // Then, use the function name to access the specific array of parameters for that callable function
                const callableParams = callableFunctionsForObject ? callableFunctionsForObject[invoke.function] || [] : [];
                const paramNames = callableParams.map(param => param.name).join(", ");

                ensureCallableNodeExistsForFunction(targetDAppNodeId, invoke.function, paramNames);
            }
        })
    }

    // Handles adding a new node of a specified type to the graph. Ensures that the node type is defined before adding.
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

    return (
        <div style={{height: '950px', width: '100%'}}>
            <button onClick={() => handleAddNodeWithAddress('dApp')}>Add dApp Node</button>
            <button onClick={() => handleAddNode('callable')}>Add Callable Node</button>
            <button onClick={() => handleAddNode('invoke')}>Add invoke Node</button>
            <button onClick={() => handleAddNode('note')}>Add Note Node</button>

            <button onClick={exportToJson}>Export Graph to JSON</button>
            <button onClick={handleImportJson}>Import Graph from JSON</button>

            <br/>

            <button onClick={() => onLayout('TB')}>vertical layout</button>
            <button onClick={() => onLayout('LR')}>horizontal layout</button>
            {/* Hidden file input for importing JSON */}
            <input
                type="file"
                ref={fileInputRef}
                style={{display: 'none'}}
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
                fitView
            >
                <Background/>
                <Controls/>
                <MiniMap nodeStrokeWidth={3} zoomable pannable/>
            </ReactFlow>
        </div>
    );
}

export default ContractOverview;
