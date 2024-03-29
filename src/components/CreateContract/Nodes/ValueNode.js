import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * ValueNode allows users to input and display a specific value within a React Flow diagram.
 * It supports dynamic data updates and can be connected to other nodes for value propagation.
 *
 * @param {string} id - The unique identifier of the node.
 * @param {Object} data - Contains the value set by the user.
 * @param {boolean} isConnectable - Indicates if the node's handles can be connected.
 * @param {Function} setNodes - Function to update the nodes in the flow diagram.
 * @returns {JSX.Element} The ValueNode component for setting and displaying values.
 */
function ValueNode({id, data, isConnectable, setNodes}) {
    const onChange = useCallback((evt) => {
        const fieldName = evt.target.name;
        // Check if the input is a checkbox and handle accordingly
        const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
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
        <div className="value-set-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <label>ValueNode</label>
                <label htmlFor={`value-${id}`}>Value:</label>
                <input
                    id={`value-${id}`}
                    name="value"
                    defaultValue={data.value || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="b"
                isConnectable={isConnectable}
            />
        </div>
    );
}

export default ValueNode;