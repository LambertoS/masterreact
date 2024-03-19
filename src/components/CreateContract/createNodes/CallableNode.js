import React, { useCallback } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import './nodes.css'; 

function CallableNode({ id, data, isConnectable, setNodes }) {
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
        <div className="callable-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div>
                <div><strong>@callable</strong></div>
                {/* <div>Function Name: {data.functionName}</div>
                <div>Parameters: {data.parameters}</div> */}
                <label htmlFor={`funktionName-${id}`}>FunktionName:</label>
                <input
                    id={`funktionName-${id}`}
                    name="funktionName"
                    defaultValue={data.funktionName || ''}
                    onChange={onChange}
                    className="nodrag"
                />
                                <label htmlFor={`parameters-${id}`}>Parameters:</label>
                <input
                    id={`parameters-${id}`}
                    name="parameters"
                    defaultValue={data.parameters || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
        </div>
    );
}

export default CallableNode;
