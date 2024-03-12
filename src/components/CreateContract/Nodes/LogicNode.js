// import React, { useCallback } from 'react';
// import { Handle, Position, NodeToolbar } from 'reactflow';
// import './nodes.css';

// function LogicNode({ id, data, isConnectable, setNodes }) {
//     const onChange = useCallback((evt) => {
//         const fieldName = evt.target.name;
//         const value = evt.target.value;
//         setNodes((nds) =>
//             nds.map((node) =>
//                 node.id === id ? { ...node, data: { ...node.data, [fieldName]: value } } : node
//             )
//         );
//     }, [id, setNodes]);

//     const handleDelete = useCallback(() => {
//         setNodes((nds) => nds.filter((node) => node.id !== id));
//     }, [id, setNodes]);

//     return (
//         <div className="logic-node">
//             <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
//                 <button onClick={handleDelete}>delete</button>
//             </NodeToolbar>
//             <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
//             <div>
//                 <label >LogicalNode</label>
//                 <label htmlFor={`condition-${id}`}>Condition:</label>
//                 <input
//                     id={`condition-${id}`}
//                     name="condition"
//                     defaultValue={data.condition || ''}
//                     onChange={onChange}
//                     className="nodrag"
//                 />
//                 {/* You can add more inputs related to logic operation here */}
//             </div>
//             <Handle
//                 type="source"
//                 position={Position.Bottom}
//                 id="d"
//                 isConnectable={isConnectable}
//             />
//         </div>
//     );
// }

// export default LogicNode;
import React, { useCallback } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import './nodes.css';

function LogicNode({ id, data, isConnectable, setNodes }) {
    const onChange = useCallback((evt) => {
        const fieldName = evt.target.name;
        const value = evt.target.value;
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, [fieldName]: value } } : node
            )
        );
    }, [id, setNodes]);

    const handleDelete = useCallback(() => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    }, [id, setNodes]);

    return (
        <div className="logic-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div>
                <label>LogicalNode</label>
                <label htmlFor={`condition-${id}`}>Operator:</label>
                <select
                    id={`condition-${id}`}
                    name="condition"
                    defaultValue={data.condition || ''}
                    onChange={onChange}
                    className="nodrag"
                >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                </select>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="f"
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="t"
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="c"
                isConnectable={isConnectable}
            />
        </div>
    );
}

export default LogicNode;
