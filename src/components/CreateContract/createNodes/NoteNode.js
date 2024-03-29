import React, { useCallback } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import './nodes.css';

function NoteNodes({ id, data, isConnectable, setNodes }) {
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
        <div className="note-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div>
                <div><strong>Note:</strong></div>
                <textarea
                    id={`Note-${id}`}
                    name="note"
                    defaultValue={data.note || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
        </div>
    );
}

export default NoteNodes;
