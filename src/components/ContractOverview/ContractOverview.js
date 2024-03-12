// import React, { useState, useCallback, useMemo, useRef } from 'react';
// import ReactFlow, {
//   Controls,
//   Background,
//   applyNodeChanges,
//   applyEdgeChanges,
//   addEdge,
//   MiniMap,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import CallableNode from './Nodes/CallableNode';
// import SendTokenNode from './Nodes/TokenNode';
// import SetValueNode from './Nodes/ValueNode';
// import LogicalNode from './Nodes/LogicNode';
// import DataTransactionNode from './Nodes/DataNode';


// // import SpecialNode from './Nodes/SpecialNode'; // Uncomment if SpecialNode is defined and used
// import edges from './edges';

// const initialEdges = [];
// const initialNodes = [];

// const edgeTypes = {
//   'custom-edge': edges,
// };


// function Flow() {
//   const [nodes, setNodes] = useState(initialNodes);
//   const [edges, setEdges] = useState(initialEdges);



//   // Create a ref for the file input
//   const fileInputRef = useRef(null);
//   // Function to trigger file input dialog
//   const handleImportJson = useCallback(() => {
//     fileInputRef.current.click();
//   }, []);



//   const onNodesChange = useCallback(
//     (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
//     [setNodes],
//   );

//   const onEdgesChange = useCallback(
//     (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
//     [setEdges],
//   );

//   const onConnect = useCallback(
//     (connection) => {
//       const edge = { ...connection, type: 'custom-edge' };
//       setEdges((eds) => addEdge(edge, eds));
//     },
//     [setEdges],
//   );


//   const nodeTypes = useMemo(() => ({
//     callable: (nodeProps) => <CallableNode {...nodeProps} setNodes={setNodes} />,
//     token: (nodeProps) => <SendTokenNode {...nodeProps} setNodes={setNodes} />,
//     logic: (nodeProps) => <LogicalNode {...nodeProps} setNodes={setNodes} />,
//     value: (nodeProps) => <SetValueNode {...nodeProps} setNodes={setNodes} />,
//     data: (nodeProps) => <DataTransactionNode {...nodeProps} setNodes={setNodes} />,
//   }), [setNodes]);

//   const handleAddNode = useCallback((nodeType) => {
//     if (!nodeTypes[nodeType]) {
//       console.error(`Node type "${nodeType}" is not defined.`);
//       return;
//     }

//     const newNode = {
//       id: `node-${Math.random().toString(36).substr(2, 9)}`,
//       type: nodeType,
//       data: { label: `${nodeType} Node ${nodes.length + 1}` },
//       position: { x: Math.random() * window.innerWidth * 0.8, y: Math.random() * window.innerHeight * 0.8 },
//     };

//     setNodes((nds) => [...nds, newNode]);
//   }, [nodeTypes, nodes, setNodes]);

//   const exportToJson = () => {
//     const data = {
//       nodes,
//       edges,
//     };
//     // Convert data object to JSON string
//     const jsonString = JSON.stringify(data, null, 2);
//     // Create a blob with JSON content
//     const blob = new Blob([jsonString], { type: 'application/json' });
//     // Create an URL for the blob
//     const url = URL.createObjectURL(blob);
//     // Create a temporary anchor element and trigger the download
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'flow-data.json'; // Name of the file to be downloaded
//     document.body.appendChild(a); // Append the anchor to the document
//     a.click(); // Trigger the download
//     document.body.removeChild(a); // Clean up
//     URL.revokeObjectURL(url); // Free up memory allocated for the blob
//   };

//   // Function to handle file input change event
//   const handleFileChange = useCallback((event) => {
//     const fileReader = new FileReader();
//     const files = event.target.files;
//     if (files.length === 0) return; // Exit if no file selected

//     const file = files[0];
//     fileReader.readAsText(file);
//     fileReader.onload = () => {
//       try {
//         const json = JSON.parse(fileReader.result);
//         setNodes(json.nodes || []);
//         setEdges(json.edges || []);
//       } catch (error) {
//         console.error("Error parsing JSON:", error);
//       }
//     };
//   }, []);


//   const setScript = null;


//   return (
//     <div style={{ height: '800px', width: '100%' }}>
//       <button onClick={() => handleAddNode('value')}>Add Value Node</button>
//       <button onClick={() => handleAddNode('logic')}>Add Logic Node</button>
//       <button onClick={() => handleAddNode('token')}>Add sendToken Node</button>
//       <button onClick={() => handleAddNode('data')}>Add Data Transaction Node</button>
//       <button onClick={() => handleAddNode('callable')}>Add Callable Node</button>
//       <button onClick={exportToJson}>Export Graph to JSON</button>
//       <button onClick={handleImportJson}>Import Graph from JSON</button>
//       {/* Hidden file input for importing JSON */}
//       <input
//         type="file"
//         ref={fileInputRef}
//         style={{ display: 'none' }}
//         onChange={handleFileChange}
//         accept=".json"
//       />
//       <button onClick={setScript}>deploy SC</button>
//       <ReactFlow
//         nodes={nodes}
//         onNodesChange={onNodesChange}
//         nodeTypes={nodeTypes}
//         edges={edges}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         edgeTypes={edgeTypes}
//         fitView
//       >
//         <Background />
//         <Controls />
//         <MiniMap nodeStrokeWidth={3} zoomable pannable />
//       </ReactFlow>
//     </div>
//   );
// }

// export default Flow;
