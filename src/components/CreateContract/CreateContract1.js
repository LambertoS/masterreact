import { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TextUpdaterNode from './Nodes/nodes';
import SpecialNode from './Nodes/SpecialNode';
import edges from './edges';
import { CustomNodeProvider, useCustomNodes } from './CustomNodeProvider';
// import '../CreateContract.css';


const initialEdges = [];
const initialNodes = [
  { id: 'node-1', data: { label: '42' }, type: 'textUpdater', position: { x: 0, y: 0 }, data: { value: 123 } },
  {
    id: '1',
    data: { label: 'Hello' },
    position: { x: 0, y: 0 },
    type: 'input',
  },
  {
    id: '2',
    data: { label: 'World' },
    position: { x: 100, y: 100 },
  },
];

const edgeTypes = {
  'custom-edge': edges,
};

const nodeTypes = { textUpdater: TextUpdaterNode, specialNode: SpecialNode };


function Flow() {
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
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, type: 'custom-edge' }, eds)),
    [setEdges],
  );
  const CreateContract = () => {
    const { addCustomNode } = useCustomNodes(); // Destructure to get addCustomNode

    const handleAddCustomNode = () => {
      // Add logic to define the new custom node, you may want to make this more dynamic
      const newNode = {
        id: `custom-node-${nodes.length + 1}`,
        type: 'customNode', // Make sure this type matches one of the types in nodeTypes
        data: { label: `Custom Node ${nodes.length + 1}` },
        position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
      };
      addCustomNode(newNode); // This will add the node to the context (not directly to ReactFlow)
      setNodes((nds) => [...nds, newNode]);
    };

    const handleAddNode = (nodeType) => {
      const newNode = {
        id: `${nodeType}-${nodes.length + 1}`,
        type: nodeType,
        data: { label: `${nodeType} Node ${nodes.length + 1}` },
        position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
      };
      setNodes((nds) => [...nds, newNode]);
    };


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

    // const onConnect = useCallback(
    //   (connection) => {
    //     const edge = { ...connection, type: 'custom-edge' };
    //     setEdges((eds) => addEdge(edge, eds));
    //   },
    //   [setEdges],
    // );

    return (
      <CustomNodeProvider>
        <div style={{ height: '800px', width: '100%' }}>
          <button onClick={() => handleAddNode('customNode')}>Add Custom Node</button>
          <button onClick={() => handleAddNode('specialNode')}>Add Special Node</button>
          <button onClick={exportToJson}>Export to JSON</button>
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
            <Background />
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
          </ReactFlow>
        </div>
      </CustomNodeProvider>
    );
  }
}



export default Flow;
// export default CreateContract;