import React, { useCallback } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import './nodes.css';

function KeyNode({ id, data, isConnectable, setNodes }) {
    const onChange = useCallback((evt) => {
        const fieldName = evt.target.name;
        // Check if the input is a checkbox and handle accordingly
        const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
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
        <div className="key-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div>
                <label >KeyNode</label>

                <label htmlFor={`key-${id}`}>Key:</label>
                <input
                    id={`key-${id}`}
                    name="key"
                    defaultValue={data.key || ''}
                    onChange={onChange}
                    className="nodrag"
                />

                {/* Checkbox for strict */}
                <div>
                    <label htmlFor={`strict-${id}`}>Strict:</label>
                    <input
                        id={`strict-${id}`}
                        type="checkbox"
                        name="strict"
                        checked={data.strict || false}
                        onChange={onChange}
                        className="nodrag"
                    />
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="c"
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="v"
                isConnectable={isConnectable}
            />
        </div>
    );
}

export default KeyNode;