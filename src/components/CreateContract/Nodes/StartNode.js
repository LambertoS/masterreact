import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * StartNode marks the beginning of a process within a React Flow diagram. It acts as a starting point
 * for the flow and does not require specific user input apart from its placement.
 *
 * @param {string} id - The unique identifier of the node.
 * @param {Object} data - Contains any initial data for the start node.
 * @param {boolean} isConnectable - Indicates if the node's handles can be connected.
 * @param {Function} setNodes - Function to update the nodes in the flow diagram.
 * @returns {JSX.Element} The StartNode component, denoting the beginning of a flow.
 */
function StartNode({id, data, isConnectable, setNodes}) {
    const onChange = useCallback((evt) => {
        const fieldName = evt.target.name;
        const value = evt.target.value;
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? {...node, data: {...node.data, [fieldName]: value}} : node
            )
        );
    }, [id, setNodes]);

    const handleDelete = useCallback(() => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    }, [id, setNodes]);

    return (
        <div className="start-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <div>
                <div><strong>Start</strong></div>
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable}/>
        </div>
    );
}

export default StartNode;
