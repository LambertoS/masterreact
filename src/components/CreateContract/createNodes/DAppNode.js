import React from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import './nodes.css';

function DAppNode({ id, data, isConnectable, setNodes }) {
    const handleDelete = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    };

    return (
        <div className="dapp-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div>
                <div><strong>dApp</strong></div>
                <div>Address: {data.address}</div>
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
        </div>
    );
}

export default DAppNode;
