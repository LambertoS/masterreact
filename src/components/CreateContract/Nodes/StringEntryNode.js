import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css'; // Assuming you have a CSS file for styling your nodes

/**
 * Represents a StringEntryNode in a React Flow diagram, designed for creating key-value pair entries.
 * This node type allows users to input both a key and a value, which are part of the node's data in the flow.
 *
 * @param {Object} props - The component props.
 * @param {string} props.id - The unique identifier for the node.
 * @param {Object} props.data - The data object containing the key-value pair and other node data.
 * @param {boolean} props.isConnectable - Indicates if the node can be connected to other nodes.
 * @param {Function} props.setNodes - The function to update the nodes in the flow.
 * @returns {JSX.Element} The StringEntryNode component.
 */
function StringEntryNode({id, data, isConnectable, setNodes}) {
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
        <div className="data-transaction-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <label>StringEntry</label>
                <label htmlFor={`key-${id}`}>Key:</label>
                <input
                    id={`key-${id}`}
                    name="key"
                    defaultValue={data.key || ''}
                    onChange={onChange}
                    className="nodrag"
                />
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
            <Handle
                type="source"
                position={Position.Left}
                id="l"
                isConnectable={isConnectable}
            />
        </div>
    );
}

export default StringEntryNode;
