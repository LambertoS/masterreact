import React, { useCallback } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import './nodes.css'; // Assuming you have a CSS file for styling your nodes

function StringEntryNode({ id, data, isConnectable, setNodes }) {
    const onChange = useCallback((evt) => {
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
        <div className="data-transaction-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
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
                id="a"
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

export default StringEntryNode;
