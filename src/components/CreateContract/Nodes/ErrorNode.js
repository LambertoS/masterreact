import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * Represents an error node within a React Flow diagram. It allows users to input and display an error message.
 * The node provides an interface for error handling within the flow, supporting dynamic updates and deletion.
 *
 * @param {string} id - The unique identifier for the node.
 * @param {Object} data - The data object containing the node's data, including the error message.
 * @param {boolean} isConnectable - Indicates if the node's handles can be connected to other nodes.
 * @param {Function} setNodes - The function to update the nodes in the flow diagram.
 * @returns {JSX.Element} The rendered ErrorNode component.
 */
function ErrorNode({id, data, isConnectable, setNodes}) {
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
        <div className="error-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <label>ErrorNode</label>
                <label htmlFor={`message-${id}`}>Message:</label>
                <input
                    id={`message-${id}`}
                    name="message"
                    defaultValue={data.message || ''}
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

export default ErrorNode;
