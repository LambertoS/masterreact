import React, { useCallback } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import './nodes.css'; 

function DAppNode({ id, data, isConnectable, setNodes }) {
    const onChange = useCallback((evt) => {
        const value = evt.target.value;
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, targetAddress: value } } : node
            )
        );
    }, [id, setNodes]);

    const handleDelete = useCallback(() => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    }, [id, setNodes]);

    return (
        <div className="dapp-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div>
                <div><strong>dApp</strong></div>
                {/* <div>Address: {data.address}</div> */}
                <label htmlFor={`address-${id}`}>Address:</label>
                <input
                    id={`address-${id}`}
                    name="address"
                    defaultValue={data.address || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
        </div>
    );
}

export default DAppNode;
