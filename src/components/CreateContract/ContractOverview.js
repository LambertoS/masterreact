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

    const getScriptFunctions = async (address) => {
        const responseData = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/scriptInfo/${address}`);
        const data = await responseData.json()
        const scriptBase64 = data.script

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: scriptBase64
        };
        const responseUtilsScriptDecompile = await fetch(`https://nodes-testnet.wavesnodes.com/utils/script/decompile`, requestOptions);
        const responseUtilsScriptDecompileData = await responseUtilsScriptDecompile.json()
        const script = responseUtilsScriptDecompileData.script

        // 1. Capture and Map Variable Definitions
        const variableDefinitionRegex = /let\s+(\w+)\s*=\s*addressFromStringValue\("([^"]+)"\)/g;
        let variableMap = {};
        let variableMatch;
        while ((variableMatch = variableDefinitionRegex.exec(script)) !== null) {
            variableMap[variableMatch[1]] = variableMatch[2]; // Map variable name to its address value
        }

        const callableFunctionRegex = /@Callable\(i\)\s*func\s+([^(]+)\(([^)]*)\)\s*=\s*{([\s\S]*?)}(?:\n\s*@|$)/gm;
        const invokeFunctionRegex = /invoke\(([^,]+),\s*"([^"]+)",/g;
        //const callableFunctionRegex = /@Callable\(i\)\s*func\s+([^(]+)\(([^)]*)\)\s*=\s*{([\s\S]*?)}(?:\n\s*@|$)/gm;
        //const invokeFunctionRegex = /invoke\([^,]+,\s*"([^"]+)",/g;

        let callableFunctions = [];
        let match;

        while ((match = callableFunctionRegex.exec(script)) !== null) {
            const functionName = match[1].trim();
            const params = match[2].trim().split(',').map(param => param.trim());
            const functionBody = match[3];

            let invokedFunctions = [];
            let invokeMatch;
            while ((invokeMatch = invokeFunctionRegex.exec(functionBody)) !== null) {
                const addressVariableName = invokeMatch[1].trim();
                const invokedFunctionName = invokeMatch[2].trim();
                // Resolve address variable name to its actual value, if present in the map
                const resolvedAddress = variableMap[addressVariableName] || addressVariableName;

                invokedFunctions.push({
                    function: invokedFunctionName,
                    address: resolvedAddress // Use resolved address if available
                });
            }

            callableFunctions.push({
                name: functionName,
                params: params,
                invokes: invokedFunctions
            });
        }

        console.log(callableFunctions)
        return callableFunctions;
    }

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






    const addCallableAndInvokeNodes = async (address, dAppNodeId) => {
        // Nutze getScriptFunctions, um die Script-Functionen für die gegebene Adresse zu bekommen
        const scriptFunctions = await getScriptFunctions(address); // Stellen Sie sicher, dass getScriptFunctions die Daten jetzt zurückgibt

        scriptFunctions.forEach((func, index) => {
            // Für jede callable Function, erstelle einen CallableNode
            const callableNode = {
                id: `callable-${dAppNodeId}-${index}`,
                type: 'callable',
                data: { label: `Callable: ${func.name}`, functionName: func.name, parameters: func.params },
                position: { x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 + (index * 100) },
            };

            // Füge den neuen CallableNode den Nodes hinzu
            setNodes((nds) => [...nds, callableNode]);

            // Erstelle eine Kante zwischen dem dAppNode und dem CallableNode
            const edgeToCallable = {
                id: `edge-${dAppNodeId}-to-${callableNode.id}`,
                source: dAppNodeId,
                target: callableNode.id,
                type: 'straight',
                animated: true,
            };

            setEdges((eds) => [...eds, edgeToCallable]);

            // Für jede Invoke Aktion in der callable Function, erstelle einen InvokeNode
            func.invokes.forEach(async (invoke, invokeIndex) => {

                let targetDAppNode = findDAppNodeByAddress(invoke.address);
                console.log("targetDAppNode; " + targetDAppNode)
                if (!targetDAppNode) {
                    // If the dApp node does not exist, create a new one
                    targetDAppNode = await handledAppFromInvoke('dApp', invoke.address); // Await the new dApp node creation
                }



                const invokeNode = {
                    id: `invoke-${callableNode.id}-${invokeIndex}`,
                    type: 'invoke',
                    // data: { label: `Invoke: ${invoke.function}`, address: invoke.address, functionName:function , invokeParameters: invoke.invokedParameters },
                    data: {
                        label: `Invoke: ${invoke.function}`, address: invoke.address, functionName: invoke.function
                    },
                    position: { x: window.innerWidth / 2 + 200, y: window.innerHeight / 2 + (index * 100) + (invokeIndex * 50) },
                };

                // Füge den neuen InvokeNode den Nodes hinzu
                setNodes((nds) => [...nds, invokeNode]);

                // Erstelle eine Kante zwischen dem CallableNode und dem InvokeNode
                const edgeToInvoke = {
                    id: `edge-${callableNode.id}-to-${invokeNode.id}`,
                    source: callableNode.id,
                    target: invokeNode.id,
                    type: 'step',
                    animated: true,
                };

                setEdges((eds) => [...eds, edgeToInvoke]);

                //  FEHLER HIER 
                console.log("test:" + targetDAppNode)
                if (targetDAppNode) {
                    addEdgeFromInvokeToDApp(invoke, targetDAppNode.id);
                } else {
                    console.log('Adding edge from invoke to dApp:', { invoke, targetDAppNodeId: targetDAppNode.id });
                }
            });
        });
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
