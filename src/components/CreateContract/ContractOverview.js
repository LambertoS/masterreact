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
import {getWavesScriptFunctions, getWavesScriptMeta} from "../../util/wavesUtil";

//https://reactflow.dev/learn/layouting/layoutinghttps://reactflow.dev/learn/layouting/layouting
const initialEdges = [];
const initialNodes = [];

function ContractOverview() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const fileInputRef = useRef(null);

    const handleImportJson = useCallback(() => {
        fileInputRef.current.click();
    }, []);


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

    const nodeTypes = useMemo(() => ({
        dApp: (nodeProps) => <DAppNode {...nodeProps} setNodes={setNodes} />,
        callable: (nodeProps) => <CallableNode {...nodeProps} setNodes={setNodes} />,
        invoke: (nodeProps) => <InvokeNode {...nodeProps} setNodes={setNodes} />,
        note: (nodeProps) => <NoteNode {...nodeProps} setNodes={setNodes} />,
    }), [setNodes]);


    const findDAppNodeByAddress = (address) => nodes.find(node => node.type === 'dApp' && node.data.address === address);

    // Function to add an edge from an Invoke node to a dApp node
    const addEdgeFromInvokeToDApp = (invoke, targetDAppNodeId) => {
        const edge = {
            id: `edge-invoke-${invoke.function}-${Math.random().toString(36).substr(2, 9)}-to-${targetDAppNodeId}`,
            source: invoke.sourceNodeId, // This assumes you have the source Invoke node's ID stored in invoke.sourceNodeId
            target: targetDAppNodeId,
            type: 'smoothstep',
            animated: true,
            label: `Invoke: ${invoke.function}`,
        };
        setEdges((eds) => [...eds, edge]);
    };

    // Erweiterte handleAddNode Function, um eine Adresse für dApp Knoten zu speichern und Functionen abzurufen
    const handleAddNodeWithAddress = async (nodeType) => {
        // Hier Logik zum Speichern der Adresse hinzufügen
        let address = prompt("Please enter the dApp address:");
        if (!address) return; // Abbrechen, falls keine Adresse eingegeben wurde

        const newNode = {
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            type: nodeType,
            data: { label: `${nodeType} Node ${nodes.length + 1}`, address: address },
            position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        };

        setNodes((nds) => [...nds, newNode]);

        if (nodeType === 'dApp') {
            await addCallableAndInvokeNodes(address, newNode.id);
        }
    };

    const handledAppFromInvoke = async (nodeType, address) => {
        // Hier Logik zum Speichern der Adresse hinzufügen

        const newNode = {
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            type: nodeType,
            data: { label: `${nodeType} Node ${nodes.length + 1}`, address: address },
            position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        };

        setNodes((nds) => [...nds, newNode]);

        if (nodeType === 'dApp') {
            await addCallableAndInvokeNodes(address, newNode.id);
        }
    };

    async function fetchAllData(scriptFunctions) {
        // Identify all unique dApp addresses you'll need metadata for
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
        const addressMetadataMap = new Map(addressMetadata.map(item => [item.address, item.metadata]));

        return addressMetadataMap;
    }

    const addCallableAndInvokeNodes = async (address, dAppNodeId) => {
        // Nutze getScriptFunctions, um die Script-Functionen für die gegebene Adresse zu bekommen
        const scriptFunctions = await getWavesScriptFunctions(address); // Stellen Sie sicher, dass getScriptFunctions die Daten jetzt zurückgibt
        const addressMetadataMap = await fetchAllData(scriptFunctions);
        console.log(addressMetadataMap)

        // Use a Map to track dApp nodes by their addresses to avoid duplicates
        let addressToNodeIdMap = new Map();
        addressToNodeIdMap.set(address, dAppNodeId); // Add the initial dApp node

        // Helper function to ensure a dApp node for a given address exists or creates one
        const ensureDAppNodeExists = (address) => {
            if (!addressToNodeIdMap.has(address)) {
                const newNodeId = `node-${Math.random().toString(36).substr(2, 9)}`;
                const newNode = {
                    id: newNodeId,
                    type: 'dApp',
                    data: { label: `dApp Node`, address },
                    position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }, // Randomize for demo
                };
                setNodes((nds) => [...nds, newNode]);
                addressToNodeIdMap.set(address, newNodeId);
                return newNodeId;
            }
            return addressToNodeIdMap.get(address);
        };

        // New function to ensure the callable node for refundWaves exists
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
                position: { x: 100 + Math.random() * (window.innerWidth - 200), y: 100 + index * 120 }, // Randomize for demo
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
                    position: { x: 200 + Math.random() * (window.innerWidth - 300), y: 100 + index * 120 + invokeIndex * 50 }, // Adjust positioning as needed
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
                        label: `Invoke: ${invoke.function} to dApp`,
                    };
                    setEdges((eds) => [...eds, edgeFromInvokeToDApp]);
                }

                // After creating and connecting the invoke node, ensure the callable node exists
                // First, access the map using just the dApp address to get the object containing callable functions
                const callableFunctionsForObject = addressMetadataMap.get(invoke.address);
                // Then, use the function name to access the specific array of parameters for that callable function
                const callableParams = callableFunctionsForObject ? callableFunctionsForObject[invoke.function] || [] : [];
                const paramNames = callableParams.map(param => param.name).join(", ");

                ensureCallableNodeExistsForFunction(targetDAppNodeId, invoke.function, paramNames);
            }
        })
    }

    const addCallableAndInvokeNodesOldImplementation = async (address, dAppNodeId) => {
        // Nutze getScriptFunctions, um die Script-Functionen für die gegebene Adresse zu bekommen
        const scriptFunctions = await getWavesScriptFunctions(address); // Stellen Sie sicher, dass getScriptFunctions die Daten jetzt zurückgibt
        const addressMetadataMap = await fetchAllData(scriptFunctions);

        // Use a Map to track dApp nodes by their addresses to avoid duplicates
        let addressToNodeIdMap = new Map();
        addressToNodeIdMap.set(address, dAppNodeId); // Add the initial dApp node

        let callableParamsMap = new Map();

        // Helper function to ensure a dApp node for a given address exists or creates one
        const ensureDAppNodeExists = (address) => {
            if (!addressToNodeIdMap.has(address)) {
                const newNodeId = `node-${Math.random().toString(36).substr(2, 9)}`;
                const newNode = {
                    id: newNodeId,
                    type: 'dApp',
                    data: { label: `dApp Node`, address },
                    position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }, // Randomize for demo
                };
                setNodes((nds) => [...nds, newNode]);
                addressToNodeIdMap.set(address, newNodeId);
                return newNodeId;
            }
            return addressToNodeIdMap.get(address);
        };

        // New function to ensure the callable node for refundWaves exists
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
                        params: "functionParams", // Include parameters here
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
                position: { x: 100 + Math.random() * (window.innerWidth - 200), y: 100 + index * 120 }, // Randomize for demo
            };
            setNodes((nds) => [...nds, callableNode]);

            // Process invokes within the callable function
            func.invokes.forEach(async (invoke, invokeIndex) => {
                let targetDAppNodeId = ensureDAppNodeExists(invoke.address);

                // Fetch metadata for invoked dApp addresses to get callable function parameters
                /*if (invoke.address !== address) { // Skip if it's the original address
                    try {
                        const dAppMeta = getWavesScriptMeta(invoke.address);
                        for (const [funcName, params] of Object.entries(dAppMeta.meta.callableFuncTypes)) {
                            const key = `${invoke.address}-${funcName}`;
                            callableParamsMap.set(key, params);
                        }
                    } catch (error) {
                        console.error("Error fetching callable function parameters:", error);
                    }
                }*/

                const metadata = addressMetadataMap.get(invoke.address);
                console.log(metadata)

                const invokeNode = {
                    id: `invoke-${callableNode.id}-${invokeIndex}`,
                    type: 'invoke',
                    data: {
                        label: `Invoke: ${invoke.function}`,
                        address: invoke.address,
                        functionName: invoke.function,
                        invokeParameters: invoke.params.join(","),
                    },
                    position: { x: 200 + Math.random() * (window.innerWidth - 300), y: 100 + index * 120 + invokeIndex * 50 }, // Adjust positioning as needed
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
                        label: `Invoke: ${invoke.function} to dApp`,
                    };
                    setEdges((eds) => [...eds, edgeFromInvokeToDApp]);
                }

                // After creating and connecting the invoke node, ensure the callable node exists
                const callableParams = callableParamsMap.get(`${invoke.address}-${invoke.function}`) || [];
                ensureCallableNodeExistsForFunction(targetDAppNodeId, invoke.function, callableParams);
            })
        })
    };

    const handleAddNode = useCallback((nodeType) => {
        if (!nodeTypes[nodeType]) {
            console.error(`Node type "${nodeType}" is not defined.`);
            return;
        }

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

    return (
        <div style={{ height: '950px', width: '100%' }}>
            <button onClick={() => handleAddNodeWithAddress('dApp')}>Add dApp Node</button>
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
